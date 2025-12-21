import { db } from "@/db";
import { notifications } from "@/db/schema";
import { eq, and, lte, desc } from "drizzle-orm";

export const NotificationManager = {
    // Queue a new notification
    async create(userId: string, type: "alarm" | "nudge" | "info", title: string, message?: string, scheduledFor: Date = new Date()) {
        const [notification] = await db.insert(notifications).values({
            userId,
            type,
            title,
            message,
            scheduledFor,
            isRead: false
        }).returning();
        return notification;
    },

    // Get Pending (Unread & Due)
    async getPending(userId: string) {
        const now = new Date();
        return await db.select().from(notifications).where(
            and(
                eq(notifications.userId, userId),
                eq(notifications.isRead, false),
                lte(notifications.scheduledFor, now)
            )
        ).orderBy(desc(notifications.scheduledFor));
    },

    // Mark as Read
    async markAsRead(id: string) {
        return await db.update(notifications)
            .set({ isRead: true })
            .where(eq(notifications.id, id))
            .returning();
    }
};
