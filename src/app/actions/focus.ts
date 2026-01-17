'use server'

import { auth } from "@/auth";
import { FocusSessionService } from "@/services/focus/focus-session";
import { SyncManager } from "@/services/calendar/sync-manager";
import { db } from "@/db";
import { connectedAccounts } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getFocusSuggestionsAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        const slots = await FocusSessionService.findOptimalFocusSlots(
            session.user.id,
            7, // Next 7 days
            60  // Minimum 1 hour
        );

        return { success: true, slots };
    } catch (error: any) {
        console.error('[Focus Suggestions] Error:', error);
        return { success: false, error: "Failed to find focus slots" };
    }
}

export async function bookFocusSessionAction(startDate: string, endDate: string) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        const start = new Date(startDate);
        const end = new Date(endDate);

        // Get connected account
        const accounts = await db.query.connectedAccounts.findMany({
            where: eq(connectedAccounts.userId, session.user.id)
        });

        if (accounts.length === 0) {
            return { success: false, error: "No calendar connected" };
        }

        // Create focus session
        const focusSession = await SyncManager.pushCreate(
            accounts[0].id, // accountId
            {
                title: "🛡️ Focus Session",
                description: "Protected time for deep work - AI recommended",
                startTime: start,
                endTime: end,
            }
        );

        revalidatePath('/calendar');
        return { success: true, session: focusSession };
    } catch (error: any) {
        console.error('[Book Focus Session] Error:', error);
        return { success: false, error: "Failed to book focus session" };
    }
}
