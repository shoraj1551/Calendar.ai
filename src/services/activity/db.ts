import { db } from "@/db";
import { activityLogs, focusSessions } from "@/db/schema";
import { eq, and, desc, gte, lte } from "drizzle-orm";

export const ActivityRepository = {
    async logHeartbeat(userId: string, metadata?: any) {
        await db.insert(activityLogs).values({
            userId,
            type: "heartbeat",
            metadata: JSON.stringify(metadata)
        });
    },

    async startFocusSession(userId: string, label: string) {
        const [session] = await db.insert(focusSessions).values({
            userId,
            startTime: new Date(),
            label,
            status: "running"
        }).returning();
        return session;
    },

    async stopFocusSession(sessionId: string) {
        const [session] = await db.select().from(focusSessions).where(eq(focusSessions.id, sessionId));
        if (!session) return null;

        const endTime = new Date();
        const duration = Math.round((endTime.getTime() - session.startTime.getTime()) / 60000);

        return await db.update(focusSessions).set({
            endTime,
            duration,
            status: "completed"
        }).where(eq(focusSessions.id, sessionId)).returning();
    },

    async getLogs(userId: string, start: Date, end: Date) {
        return await db.select().from(activityLogs).where(
            and(
                eq(activityLogs.userId, userId),
                gte(activityLogs.timestamp, start),
                lte(activityLogs.timestamp, end)
            )
        ).orderBy(desc(activityLogs.timestamp));
    }
};
