import { auth } from "@/auth";
import { AIOrchestrator } from "@/services/ai/orchestrator";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const brief = await AIOrchestrator.generateDailyBrief(session.user.id);
        return NextResponse.json({ markdown: brief });
    } catch (error) {
        console.error("Brief Generation Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
