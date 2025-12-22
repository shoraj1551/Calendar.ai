
import { db } from "@/db";
import { meetings, tasks, userSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

export class MeetingService {

    // Helper: Get Settings
    private static async getSettings(userId: string) {
        const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        return settings[0]?.preferences || {};
    }

    /**
     * Simulates the "Bot Join" logic.
     * In a real app, this would be called by the bot prior to joining a Zoom/Meet call.
     */
    static async shouldBotJoin(userId: string, meetingTitle: string): Promise<{ join: boolean; reason?: string }> {
        const settings: any = await this.getSettings(userId);

        // 1. Check Master Toggle
        if (settings.autoJoin === false) {
            return { join: false, reason: "Auto-join disabled by user" };
        }

        // 2. Check Privacy Keywords (Simple Regex)
        // If title contains "Private", "1:1", "Confidential", and mode is "Private", skip.
        if (meetingTitle.match(/(private|confidential|1:1|internal)/i)) {
            if (settings.privacyMode === "private") {
                return { join: false, reason: "Meeting flagged as private" };
            }
        }

        return { join: true };
    }

    /**
     * Processes a transcript and saves it, respecting privacy settings.
     */
    static async processMeeting(userId: string, title: string, transcript: string) {
        const settings: any = await this.getSettings(userId);

        // 1. Check Recording/Processing Permissions
        if (settings.recordAll === false) {
            console.log(`[MeetingService] Processing skipped for ${userId} (Record All disabled)`);
            // NOTE: In a real app, we might allow manual overrides. 
            // For this backend enforcement test, false means REJECT.
            throw new Error("Meeting processing disabled by user settings.");
        }

        // 2. Mock AI Summary
        const summary = `AI Summary for: ${title}`;

        // 3. Save to DB
        const [meeting] = await db.insert(meetings).values({
            userId,
            title,
            transcript,
            summary,
            startTime: new Date(),
        }).returning();

        // 4. Extract Tasks (Mock)
        if (settings.extractTasks !== false) {
            await db.insert(tasks).values({
                userId,
                title: `Follow up on ${title}`,
                source: "meeting",
                sourceId: meeting.id,
                priority: "medium"
            });
        }

        return meeting;
    }
}
