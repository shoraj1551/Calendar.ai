import { auth } from "@/auth";
import { AIOrchestrator } from "@/services/ai/orchestrator";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const { text } = await req.json(); // Front-end sends 'text'

        if (!text) {
            return NextResponse.json({ error: "Query required" }, { status: 400 });
        }

        // Use the Orchestrator for Context-Aware Parsing
        // We map 'text' -> 'userQuery'
        const result = await AIOrchestrator.processCommand(userId, text);

        return NextResponse.json(result);
    } catch (error) {
        console.error("AI Command Error:", error);
        return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
    }
}
