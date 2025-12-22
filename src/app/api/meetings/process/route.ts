import { auth } from "@/auth";
import { EventRepository } from "@/services/events/db";
import { MeetingService } from "@/services/meetings/service";
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

        // Delegate to Service for Privacy Enforcement
        const meeting = await MeetingService.processMeeting(userId, title, transcript);

        return NextResponse.json({ success: true, meetingId: meeting.id });

    } catch (error) {
        console.error("Meeting Process Error:", error);
        return NextResponse.json({ error: error instanceof Error ? error.message : "Failed to process meeting" }, { status: 400 });
    }
}
