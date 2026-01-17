'use server'

import { auth } from "@/auth";
import { ActionItemExtractor } from "@/services/meeting/action-extractor";
import { db } from "@/db";
import { meetingNotes, actionItems, tasks } from "@/db/schema";
import { revalidatePath } from "next/cache";

export async function extractActionItemsAction(
    notes: string,
    context?: { title: string; date: Date }
) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        console.log('[Meeting Notes] Extracting action items...');

        // Try AI extraction, fallback to simple
        let data;
        try {
            data = await ActionItemExtractor.extract(notes, context);
            console.log('[Meeting Notes] AI extraction successful');
        } catch (error) {
            console.warn('[Meeting Notes] AI extraction failed, using fallback');
            data = ActionItemExtractor.extractSimple(notes);
        }

        return { success: true, data };
    } catch (error: any) {
        console.error('[Meeting Notes] Extraction error:', error);
        return { success: false, error: "Failed to extract action items" };
    }
}

export async function saveMeetingNotesAction(data: {
    eventId: string;
    rawNotes: string;
    summary?: string;
    keyPoints?: string[];
    decisions?: string[];
    actionItems?: any[];
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        console.log('[Meeting Notes] Saving notes and creating tasks...');

        // Save meeting notes
        const [note] = await db.insert(meetingNotes).values({
            eventId: data.eventId,
            userId: session.user.id,
            rawNotes: data.rawNotes,
            summary: data.summary,
            keyPoints: data.keyPoints,
            decisions: data.decisions,
        }).returning();

        console.log('[Meeting Notes] Notes saved:', note.id);

        // Create action items and tasks
        if (data.actionItems && data.actionItems.length > 0) {
            for (const item of data.actionItems) {
                // Create task first
                const [task] = await db.insert(tasks).values({
                    userId: session.user.id,
                    title: item.description,
                    status: 'todo',
                    // Add due date if available
                }).returning();

                console.log('[Meeting Notes] Task created:', task.id);

                // Create action item linked to task
                await db.insert(actionItems).values({
                    meetingNoteId: note.id,
                    taskId: task.id,
                    description: item.description,
                    assignee: item.assignee,
                    dueDate: item.dueDate ? new Date(item.dueDate) : null,
                    priority: item.priority,
                    confidence: item.confidence,
                });
            }
        }

        revalidatePath('/calendar');
        return { success: true, tasksCreated: data.actionItems?.length || 0 };
    } catch (error: any) {
        console.error('[Meeting Notes] Save error:', error);
        return { success: false, error: "Failed to save meeting notes" };
    }
}
