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
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        return NextResponse.json({ error: `Failed to sync calendar: ${errorMessage}` }, { status: 500 });
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
        const userId = await EventRepository.ensureUser(session.user.email);
        const event = await EventRepository.create(userId, data);
        return NextResponse.json({ event });
    } catch (error) {
        console.error("Create API Error:", error);
        return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
    }
}

// PATCH /api/calendar/events (Update Event)
export async function PATCH(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, ...data } = await req.json();
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        const event = await EventRepository.update(id, data);
        return NextResponse.json({ event });
    } catch (error) {
        console.error("Update API Error:", error);
        return NextResponse.json({ error: "Failed to update event" }, { status: 500 });
    }
}

// DELETE /api/calendar/events (Delete Event)
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");
        if (!id) return NextResponse.json({ error: "ID required" }, { status: 400 });

        await EventRepository.delete(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete API Error:", error);
        return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
    }
}
