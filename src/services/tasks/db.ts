import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, desc } from "drizzle-orm";

export interface CreateTaskParams {
    userId: string;
    title: string;
    description?: string;
    priority?: "low" | "medium" | "high";
    dueDate?: Date;
    source?: "manual" | "ai" | "meeting";
    sourceId?: string;
}

export const TaskRepository = {
    // Create
    async create(data: CreateTaskParams) {
        const [newTask] = await db.insert(tasks).values({
            userId: data.userId,
            title: data.title,
            description: data.description,
            priority: data.priority || "medium",
            dueDate: data.dueDate,
            source: data.source || "manual",
            sourceId: data.sourceId,
            status: "todo"
        }).returning();
        return newTask;
    },

    // List
    async list(userId: string) {
        return await db.select().from(tasks)
            .where(eq(tasks.userId, userId))
            .orderBy(desc(tasks.createdAt)); // Newest first
    },

    // Update Status
    async updateStatus(id: string, status: "todo" | "in_progress" | "done") {
        return await db.update(tasks)
            .set({
                status,
                completedAt: status === "done" ? new Date() : null
            })
            .where(eq(tasks.id, id))
            .returning();
    },

    // Delete
    async delete(id: string) {
        return await db.delete(tasks).where(eq(tasks.id, id)).returning();
    }
};
