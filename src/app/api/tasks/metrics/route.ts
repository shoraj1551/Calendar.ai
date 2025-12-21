import { auth } from "@/auth";
import { TaskMetrics } from "@/services/tasks/metrics";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// GET /api/tasks/metrics
export async function GET() {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const score = await TaskMetrics.getAccountabilityScore(userId);
        return NextResponse.json({ score });
    } catch (error) {
        console.error("Task Metrics Error:", error);
        return NextResponse.json({ error: "Failed to get metrics" }, { status: 500 });
    }
}
