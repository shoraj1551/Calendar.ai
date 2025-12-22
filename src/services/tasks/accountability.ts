
import { db } from "@/db";
import { tasks, userSettings } from "@/db/schema";
import { eq, and, lte, isNull } from "drizzle-orm";
import { CommunicationService } from "../communications/service";

export class AccountabilityService {

    // Check for deadlines and send notifications based on 'Tone'
    static async runCheck(userId: string) {
        // 1. Get Settings
        const settingsRec = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        const prefs = settingsRec[0]?.preferences as any || {};

        // Settings: { accountabilityMode: 'gentle' | 'strict', enableCheckins: boolean }
        const mode = prefs.accountabilityMode || 'gentle'; // Default to gentle
        if (prefs.enableCheckins === false) {
            console.log(`[Accountability] Check-ins disabled for ${userId}`);
            return { sent: false, reason: "disabled" };
        }

        // 2. Find Overdue Tasks
        const now = new Date();
        const overdueTasks = await db.select().from(tasks).where(
            and(
                eq(tasks.userId, userId),
                lte(tasks.dueDate, now),
                // status != done (simplified)
            )
        );
        // Clean filter for non-done in JS if needed or strict query
        const activeOverdue = overdueTasks.filter(t => t.status !== 'done');

        if (activeOverdue.length === 0) {
            return { sent: false, reason: "no_overdue" };
        }

        // 3. Generate Message based on TONE
        const title = "Accountability Check";
        let message = "";

        if (mode === 'strict') {
            message = `You have ${activeOverdue.length} overdue tasks. This is unacceptable. Clear them immediately.`;
        } else {
            // Gentle
            message = `Hey, noticed you have ${activeOverdue.length} tasks slightly overdue. Do you need to reschedule them? No pressure.`;
        }

        // 4. Dispatch
        await CommunicationService.dispatchNotification(userId, 'nudge', title, message);
        return { sent: true, mode, message };
    }
}
