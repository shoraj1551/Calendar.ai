
'use server'

import { db } from "@/db";
import { tasks, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { SyncManager } from "@/services/calendar/sync-manager";
import { revalidatePath } from "next/cache";
import { format } from "date-fns";

export async function getTasksAction(userId: string) {
    try {
        const userTasks = await db.query.tasks.findMany({
            where: and(
                eq(tasks.userId, userId),
                eq(tasks.status, 'todo')
            )
        });
        return { success: true, tasks: userTasks };
    } catch (error: any) {
        console.error("[Action] Failed to get tasks:", error);

        if (error.code === 'ENOTFOUND') {
            return { success: false, error: "Connection failed. Please check your internet.", code: 'NETWORK_ERROR' };
        }

        return { success: false, error: "Failed to fetch tasks. Please try again.", code: 'UNKNOWN_ERROR' };
    }
}

export async function createTaskAction(userId: string, title: string) {
    try {
        // Validation
        if (!title || title.trim().length === 0) {
            return { success: false, error: "Task title cannot be empty.", code: 'VALIDATION_ERROR' };
        }
        if (title.length > 200) {
            return { success: false, error: "Task title is too long (max 200 characters).", code: 'VALIDATION_ERROR' };
        }

        const [task] = await db.insert(tasks).values({
            userId,
            title: title.trim(),
            status: 'todo'
        }).returning();

        revalidatePath('/calendar');
        return { success: true, task };
    } catch (error: any) {
        console.error("[Action] Failed to create task:", error);

        if (error.code === 'ENOTFOUND') {
            return { success: false, error: "Connection failed. Please check your internet.", code: 'NETWORK_ERROR' };
        }

        return { success: false, error: "Failed to create task. Please try again.", code: 'UNKNOWN_ERROR' };
    }
}

export async function scheduleTaskAction(
    taskId: string,
    accountId: string,
    startTime: Date,
    endTime: Date
) {
    try {
        // 1. Get task
        const task = await db.query.tasks.findFirst({
            where: eq(tasks.id, taskId)
        });

        if (!task) {
            return { success: false, error: "Task not found.", code: 'NOT_FOUND' };
        }

        // 2. Create calendar event
        const createdEvent = await SyncManager.pushCreate(accountId, {
            title: `📋 ${task.title}`,
            description: task.description || "Timeblocked from task list",
            startTime,
            endTime
        });

        // 3. Update task status
        await db.update(tasks).set({
            status: 'scheduled',
            allocatedEventId: createdEvent.providerEventId
        }).where(eq(tasks.id, taskId));

        revalidatePath('/calendar');
        return { success: true, message: `Task scheduled for ${format(startTime, "h:mm a")}!` };
    } catch (error: any) {
        console.error("[Action] Failed to schedule task:", error);

        if (error.message?.includes('unauthorized') || error.message?.includes('401')) {
            return { success: false, error: "Session expired. Please reconnect your calendar.", code: 'AUTH_ERROR' };
        }
        if (error.message?.includes('network') || error.code === 'ENOTFOUND') {
            return { success: false, error: "Connection failed. Please check your internet.", code: 'NETWORK_ERROR' };
        }

        return { success: false, error: "Failed to schedule task. Please try again.", code: 'UNKNOWN_ERROR' };
    }
}
