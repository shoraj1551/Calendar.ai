import { auth } from "@/auth";
import { TaskRepository } from "@/services/tasks/db";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// GET /api/tasks (List)
export async function GET() {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const tasks = await TaskRepository.list(userId);
        return NextResponse.json({ tasks });
    } catch (error) {
        console.error("Task List Error:", error);
        return NextResponse.json({ error: "Failed to list tasks" }, { status: 500 });
    }
}

// POST /api/tasks (Create)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const data = await req.json();

        const task = await TaskRepository.create({
            userId,
            ...data
        });
        return NextResponse.json({ task });
    } catch (error) {
        console.error("Task Create Error:", error);
        return NextResponse.json({ error: "Failed to create task" }, { status: 500 });
    }
}
