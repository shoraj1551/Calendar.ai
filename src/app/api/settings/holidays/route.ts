
import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET /api/settings/holidays
export async function GET(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Resolve User
    const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
    if (!user) return NextResponse.json({ ignored: [] });

    // Fetch Settings
    const settings = await db.query.userSettings.findFirst({ where: eq(userSettings.userId, user.id) });

    return NextResponse.json({
        ignoredHolidays: (settings?.ignoredHolidays as string[]) || []
    });
}

// POST /api/settings/holidays (Replace List)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { ignoredHolidays } = await req.json();
        if (!Array.isArray(ignoredHolidays)) {
            return NextResponse.json({ error: "Invalid format" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({ where: eq(users.email, session.user.email) });
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Upsert Settings
        await db.insert(userSettings).values({
            userId: user.id,
            ignoredHolidays
        }).onConflictDoUpdate({
            target: userSettings.userId,
            set: { ignoredHolidays, updatedAt: new Date() }
        });

        return NextResponse.json({ success: true, ignoredHolidays });
    } catch (error) {
        console.error("Settings Update Error:", error);
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
