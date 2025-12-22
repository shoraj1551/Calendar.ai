import { auth } from "@/auth";
import { AccountabilityService } from "@/services/intelligence/accountability";
import { NextResponse } from "next/server";

export async function GET() {
    const session = await auth();
    if (!session || !session.user?.id) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const data = await AccountabilityService.getDailyScore(session.user.id);
        return NextResponse.json(data);
    } catch (error) {
        console.error("Accountability Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
