import { auth } from "@/auth";
import { db } from "@/db";
import { meetings, tasks } from "@/db/schema";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// POST /api/meetings/process
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const { title, transcript } = await req.json();

        // 1. Send Transcript to AI (Mocked for now, assumes LLM service)
        // In real app: call OpenAI/Ollama here
        const summary = `Meeting about: ${title}. Key metrics discussed.`;

        // 2. Extract Action Items (Mocked)
        const extractedTasks = [
            { title: "Review Action Item 1", priority: "high" },
            { title: "Schedule Follow-up", priority: "medium" }
        ];

        // 3. Save Meeting
        const [meeting] = await db.insert(meetings).values({
            userId,
            title,
            transcript,
            summary,
            startTime: new Date(), // Approximate
        }).returning();

        // 4. Create Linked Tasks
        for (const task of extractedTasks) {
            await db.insert(tasks).values({
                userId,
                title: task.title,
                source: "meeting",
                sourceId: meeting.id,
                priority: task.priority as any
            });
        }

        return NextResponse.json({ success: true, meetingId: meeting.id });

    } catch (error) {
        console.error("Meeting Process Error:", error);
        return NextResponse.json({ error: "Failed to process meeting" }, { status: 500 });
    }
}
