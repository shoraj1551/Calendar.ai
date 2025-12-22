import { db } from "@/db";
import { events, users } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { UnifiedEvent } from "@/services/calendar/types";

export const EventRepository = {
    // Ensure User Exists by Email
    async ensureUser(email: string) {
        const user = await db.query.users.findFirst({ where: eq(users.email, email) });
        if (user) return user.id;

        const [newUser] = await db.insert(users).values({
            email,
            name: email.split("@")[0]
        }).returning();
        return newUser.id;
    },

    // Create
    async create(userEmail: string, data: Partial<UnifiedEvent>) {
        const userId = await this.ensureUser(userEmail);

        const [newEvent] = await db.insert(events).values({
            userId,
            title: data.title || "Untitled",
            description: data.description,
            startTime: data.start || new Date(),
            endTime: data.end || new Date(),
            allDay: data.allDay || false,
            location: data.location,
            type: (data.type as "work" | "personal") || "work",
            provider: "local",
        }).returning();

        return newEvent;
    },

    // Read
    async getByRange(userId: string, start: Date, end: Date) {
        const localEvents = await db.select().from(events).where(
            and(
                eq(events.userId, userId),
                gte(events.startTime, start),
                lte(events.endTime, end)
            )
        );

        // Map to UnifiedEvent
        return localEvents.map(e => ({
            id: e.id,
            title: e.title,
            start: e.startTime,
            end: e.endTime,
            allDay: e.allDay || false,
            provider: "local" as const,
            type: (e.type as "work" | "personal") || "work",
            status: "confirmed" as const,
            description: e.description || undefined,
            location: e.location || undefined,
        }));
    },
    // Update
    async update(id: string, data: Partial<UnifiedEvent>) {
        const [updatedEvent] = await db.update(events).set({
            title: data.title,
            description: data.description,
            startTime: data.start,
            endTime: data.end,
            allDay: data.allDay,
            location: data.location,
            type: data.type,
        }).where(eq(events.id, id)).returning();
        return updatedEvent;
    },

    // Delete
    async delete(id: string) {
        await db.delete(events).where(eq(events.id, id));
    }
};
