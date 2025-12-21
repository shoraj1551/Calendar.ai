import { auth } from "@/auth";
import { getAggregatedEvents } from "@/services/calendar/service";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// GET /api/calendar/events
export async function GET() {
    const session = await auth();

    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        // Resolve User ID from Email (or create phantom user)
        // Ideally this logic belongs in a middleware or better Auth adapter setup.
        const userId = await EventRepository.ensureUser(session.user.email);

        // Fetch aggregated events (Local + Google)
        const events = await getAggregatedEvents(session.accessToken as string, userId);
        return NextResponse.json({ events });
    } catch (error) {
        console.error("Sync API Error:", error);
        return NextResponse.json({ error: "Failed to sync calendar" }, { status: 500 });
    }
}

// POST /api/calendar/events (Create Event)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const data = await req.json();
        const event = await EventRepository.create(session.user.email, data);
        return NextResponse.json({ event });
    } catch (error) {
        console.error("Create API Error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}
