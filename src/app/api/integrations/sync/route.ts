
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedAccounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";
import { SyncManager } from "@/services/calendar/sync-manager";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { accountId } = await req.json();

        // Validate Ownership
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        const account = await db.query.connectedAccounts.findFirst({
            where: and(
                eq(connectedAccounts.id, accountId),
                eq(connectedAccounts.userId, user!.id)
            )
        });

        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        // Trigger Sync
        const result = await SyncManager.syncAccount(accountId);

        return NextResponse.json({ success: true, count: result.count });
    } catch (error: any) {
        return NextResponse.json({ error: error.message || "Sync failed" }, { status: 500 });
    }
}
