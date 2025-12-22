import { auth } from "@/auth";
import { AIOrchestrator } from "@/services/ai/orchestrator";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    // if (!session?.user?.id) return new NextResponse("Unauthorized", { status: 401 }); 
    // Mock user for dev if needed, but normally use session.
    const userId = session?.user?.id || "user_1";

    try {
        const { prompt } = await req.json();

        // 1. Ask AI to interpret (Dry Run)
        const interpretation = await AIOrchestrator.processCommand(userId, prompt);

        // 2. Map AI Intent to Proposed Changes
        const changes = [];
        const { intent, params, originalEvent } = interpretation;

        if (intent === "create_event") {
            changes.push({
                id: "new-1",
                type: "create",
                summary: `Schedule '${params.title}' (${params.duration || "60m"})`,
                details: params
            });
        } else if (intent === "reschedule_event") {
            changes.push({
                id: "update-1",
                type: "update",
                summary: `Move '${params.title || "Meeting"}' to ${params.newTime || "suggested time"}`,
                original: originalEvent?.startTime || "Original Time",
                details: params
            });
        } else if (intent === "block_time") {
            changes.push({
                id: "block-1",
                type: "create",
                summary: `Block '${params.title || "Focus Time"}'`,
                details: params
            });
        } else {
            // Fallback/Generic
            changes.push({
                id: "unknown-1",
                type: "create",
                summary: `Action: ${intent.replace(/_/g, " ")}`,
                details: params
            });
        }

        return NextResponse.json({ changes });
    } catch (error) {
        console.error("Preview Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
