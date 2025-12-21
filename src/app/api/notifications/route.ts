import { auth } from "@/auth";
import { NotificationManager } from "@/services/notifications/manager";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// GET /api/notifications (Poll for pending)
export async function GET() {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const alerts = await NotificationManager.getPending(userId);
        return NextResponse.json({ alerts });
    } catch (error) {
        return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
    }
}

// POST /api/notifications (Ack)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const { id } = await req.json();
        await NotificationManager.markAsRead(id);
        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Failed to acknowledge" }, { status: 500 });
    }
}
