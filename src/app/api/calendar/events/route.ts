import { auth } from "@/auth";
import { getAggregatedEvents } from "@/services/calendar/service";
import { EventRepository } from "@/services/events/db";
import { ConflictService } from "@/services/calendar/conflict";
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

        // [HARD BLOCK CHECK]
        const { searchParams } = new URL(req.url);
        const force = searchParams.get("force") === "true";
        const isUrgent = data.isUrgent === true;

        if (!force && data.start && data.end) {
            const conflict = await ConflictService.validateEventTime(userId, new Date(data.start), new Date(data.end), isUrgent);
            if (!conflict.valid && conflict.isHardBlock) {
                return NextResponse.json({
                    error: "Conflict with protected time block",
                    reason: conflict.conflictReason,
                    code: "HARD_BLOCK_CONFLICT"
                }, { status: 409 });
            }
        }

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

        // [HARD BLOCK CHECK]
        const { searchParams } = new URL(req.url);
        const force = searchParams.get("force") === "true";

        // Only validate if time is changing
        if (!force && (data.start || data.end)) {
            // We need both start and end to validate. If only one is provided, we might need to fetch the existing event.
            // For now, assuming full update or frontend sends both. 
            // Better Robustness: Fetch existing event if one date is missing.

            let start = data.start ? new Date(data.start) : null;
            let end = data.end ? new Date(data.end) : null;

            if (start && end) { // Only check if we have a complete range
                const userId = await EventRepository.ensureUser(session.user.email); // Re-resolving ID slightly inefficient but safe
                // 2. Validate Hard Conflicts (Holiday/Lunch/Soft Blocks)
                const isUrgent = data.isUrgent === true;
                const conflict = await ConflictService.validateEventTime(userId, start, end, isUrgent);
                if (!conflict.valid && conflict.isHardBlock) {
                    return NextResponse.json({
                        error: "Conflict with protected time block",
                        reason: conflict.conflictReason,
                        code: "HARD_BLOCK_CONFLICT"
                    }, { status: 409 });
                }

                // 3. Validate Daily Load (Proactive AI Guard)
                const durationMins = (end.getTime() - start.getTime()) / 60000;
                const loadCheck = await ConflictService.validateDailyLoad(userId, start, durationMins);

                if (loadCheck.overloaded) { // force check is already handled by the outer if (!force)
                    return NextResponse.json({
                        error: "Overload Warning",
                        message: loadCheck.message,
                        isSoftBlock: true // UI hint to show "Override" button
                    }, { status: 409 });
                }
            }
        }

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
