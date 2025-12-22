import { auth } from "@/auth";
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return new NextResponse("Unauthorized", { status: 401 });
    }

    try {
        const { workStart, workEnd } = await req.json();

        await db.update(users)
            .set({
                onboardingStatus: "completed",
                workStart,
                workEnd
            })
            .where(eq(users.email, session.user.email));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Onboarding Error:", error);
        return new NextResponse("Internal Error", { status: 500 });
    }
}
