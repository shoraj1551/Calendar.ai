import { auth } from "@/auth";
import { ActivityRepository } from "@/services/activity/db";
import { AnalyticsEngine } from "@/services/activity/analytics";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// POST /api/activity (Log Heartbeat)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const body = await req.json();

        if (body.type === "heartbeat") {
            await ActivityRepository.logHeartbeat(userId, body.metadata);
            return NextResponse.json({ success: true });
        }

        return NextResponse.json({ error: "Unknown type" }, { status: 400 });
    } catch (error) {
        return NextResponse.json({ error: "Failed to log" }, { status: 500 });
    }
}

// GET /api/activity (Get Timeline)
export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const { searchParams } = new URL(req.url);
        const dateStr = searchParams.get("date");
        const date = dateStr ? new Date(dateStr) : new Date();

        const timeline = await AnalyticsEngine.getDailyTimeline(userId, date);
        return NextResponse.json({ timeline });
    } catch (error) {
        return NextResponse.json({ error: "Failed to get timeline" }, { status: 500 });
    }
}
