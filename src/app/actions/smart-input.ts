'use server'

import { auth } from "@/auth";
import { EventParser } from "@/services/nlp/event-parser";
import { SyncManager } from "@/services/calendar/sync-manager";
import { db } from "@/db";
import { connectedAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function parseEventAction(input: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        console.log('[Smart Input] Parsing:', input);

        // Try LLM parser first, fallback to simple parser
        let event;
        try {
            event = await EventParser.parse(input);
            console.log('[Smart Input] LLM parse successful:', event);
        } catch (error) {
            console.warn('[Smart Input] LLM parse failed, using simple parser');
            event = EventParser.parseSimple(input);
            console.log('[Smart Input] Simple parse result:', event);
        }

        if (!event) {
            return { success: false, error: "Could not parse event. Try being more specific." };
        }

        return { success: true, event };
    } catch (error: any) {
        console.error('[Smart Input] Parse error:', error);
        return { success: false, error: "Failed to parse event" };
    }
}

export async function createEventFromNLAction(parsedEvent: any) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        console.log('[Smart Input] Creating event:', parsedEvent);

        // Get connected account
        const accounts = await db.query.connectedAccounts.findMany({
            where: eq(connectedAccounts.userId, session.user.id)
        });

        if (accounts.length === 0) {
            return { success: false, error: "No calendar connected. Please connect Google Calendar first." };
        }

        // Create event
        const event = await SyncManager.pushCreate(
            accounts[0].id,
            {
                title: parsedEvent.title,
                description: parsedEvent.description,
                startTime: new Date(parsedEvent.startTime),
                endTime: new Date(parsedEvent.endTime),
                location: parsedEvent.location,
            }
        );

        console.log('[Smart Input] Event created:', event);

        revalidatePath('/calendar');
        return { success: true, event };
    } catch (error: any) {
        console.error('[Smart Input] Create error:', error);
        return { success: false, error: "Failed to create event. Please try again." };
    }
}
