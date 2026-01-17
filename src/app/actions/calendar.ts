
'use server'

import { SyncManager } from "@/services/calendar/sync-manager";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { connectedAccounts, events } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";
import { SmartSlotService } from "@/services/calendar/smart-slots";
import { NegotiationService } from "@/services/calendar/negotiation";
import { UnifiedEvent } from "@/services/calendar/types";
import { startOfDay, endOfDay, format } from "date-fns";

export async function updateEventAction(
    accountId: string,
    providerEventId: string,
    updates: { startTime?: Date; endTime?: Date; title?: string }
) {
    try {
        console.log(`[Action] Updating event ${providerEventId}...`);
        await SyncManager.pushUpdate(accountId, providerEventId, updates);
        revalidatePath('/calendar');
        return { success: true };
    } catch (error: any) {
        console.error("[Action] Failed to update event:", error);

        // Specific error handling
        if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
            return { success: false, error: "Session expired. Please reconnect your calendar.", code: 'AUTH_ERROR' };
        }
        if (error.message?.includes('forbidden') || error.message?.includes('403')) {
            return { success: false, error: "You don't have permission to modify this event.", code: 'PERMISSION_ERROR' };
        }
        if (error.message?.includes('rate limit') || error.message?.includes('429')) {
            return { success: false, error: "Too many requests. Please try again in a moment.", code: 'RATE_LIMIT' };
        }
        if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
            return { success: false, error: "Connection failed. Please check your internet.", code: 'NETWORK_ERROR' };
        }

        return { success: false, error: "Failed to update event. Please try again.", code: 'UNKNOWN_ERROR' };
    }
}

export async function shieldUpAction(date: Date) {
    try {
        console.log(`[Action] Shield Up for ${date.toISOString()}`);

        // 1. Get User/Account
        const account = await db.query.connectedAccounts.findFirst({
            where: eq(connectedAccounts.status, 'active')
        });

        if (!account) {
            return { success: false, error: "No calendar connected. Please connect your Google Calendar first.", code: 'NO_ACCOUNT' };
        }

        // 2. Fetch Events for Context
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        const dayEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, account.userId),
                eq(events.connectedAccountId, account.id)
            )
        });

        const todaysEvents = dayEvents.filter(e => e.startTime >= dayStart && e.endTime <= dayEnd).map(e => ({
            ...e,
            start: e.startTime,
            end: e.endTime
        } as UnifiedEvent));

        // 3. Find Slot
        const slots = SmartSlotService.findFocusSlots(date, todaysEvents, 'bear');

        if (slots.length === 0) {
            return {
                success: false,
                message: "No suitable focus time found. Your calendar is fully booked during high-energy hours.",
                code: 'NO_SLOTS'
            };
        }

        const bestSlot = slots[0];

        // 4. Create Event
        await SyncManager.pushCreate(account.id, {
            title: "🛡️ Deep Work (Shield Up)",
            startTime: bestSlot.start,
            endTime: bestSlot.end,
            description: "Automatically scheduled focus block during your high energy peak."
        });

        revalidatePath('/calendar');
        return {
            success: true,
            message: `Focus block scheduled for ${format(bestSlot.start, "h:mm a")}!`
        };

    } catch (error: any) {
        console.error("[Action] Shield Up Failed:", error);

        if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
            return { success: false, error: "Session expired. Please reconnect your calendar.", code: 'AUTH_ERROR' };
        }
        if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
            return { success: false, error: "Connection failed. Please check your internet.", code: 'NETWORK_ERROR' };
        }

        return { success: false, error: "Failed to create focus block. Please try again.", code: 'UNKNOWN_ERROR' };
    }
}

export async function generateRescheduleRequestAction(
    eventId: string,
    userName: string,
    reason?: string
) {
    try {
        console.log(`[Action] Generating reschedule request for event ${eventId}`);

        // 1. Get the event
        const event = await db.query.events.findFirst({
            where: eq(events.id, eventId)
        });

        if (!event) return { success: false, error: "Event not found" };

        // 2. Get all events for context
        const allEvents = await db.query.events.findMany({
            where: eq(events.userId, event.userId)
        });

        const unifiedEvents = allEvents.map(e => ({
            ...e,
            start: e.startTime,
            end: e.endTime
        } as UnifiedEvent));

        const targetEvent = {
            ...event,
            start: event.startTime,
            end: event.endTime
        } as UnifiedEvent;

        // 3. Find alternative slots
        const alternatives = NegotiationService.findAlternativeSlots(
            targetEvent,
            unifiedEvents,
            'bear'
        );

        if (alternatives.length === 0) {
            return { success: false, error: "No alternative slots found" };
        }

        // 4. Generate email draft
        const emailDraft = NegotiationService.generateRescheduleEmail(
            targetEvent,
            alternatives,
            userName,
            reason
        );

        return {
            success: true,
            draft: emailDraft,
            alternatives
        };

    } catch (error) {
        console.error("[Action] Failed to generate reschedule request:", error);
        return { success: false, error: "Failed to generate reschedule request" };
    }
}

