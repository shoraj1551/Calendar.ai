
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedAccounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

// GET: List all accounts for the current user
export async function GET() {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const accounts = await db.select().from(connectedAccounts).where(eq(connectedAccounts.userId, user.id));
        return NextResponse.json({ accounts });
    } catch (error) {
        console.error("Fetch Accounts Error:", error);
        return NextResponse.json({ error: "Failed to fetch accounts" }, { status: 500 });
    }
}

// POST: Add a new account (Simulated Auth)
export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { provider, email, name } = await req.json();

        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        // Check if account already exists
        const existing = await db.query.connectedAccounts.findFirst({
            where: and(
                eq(connectedAccounts.userId, user.id),
                eq(connectedAccounts.email, email),
                eq(connectedAccounts.provider, provider)
            )
        });

        if (existing) {
            return NextResponse.json({ error: "Account already connected" }, { status: 400 });
        }

        // Create new account
        const [newAccount] = await db.insert(connectedAccounts).values({
            userId: user.id,
            provider,
            email,
            name,
            status: 'active',
            isPrimary: false, // Only the initial login account is primary (handle this logic later if needed)
            accessToken: "simulated_token_" + Math.random().toString(36).substring(7),
            expiresAt: new Date(Date.now() + 3600 * 1000) // 1 hour
        }).returning();

        return NextResponse.json({ account: newAccount });
    } catch (error) {
        console.error("Add Account Error:", error);
        return NextResponse.json({ error: "Failed to add account" }, { status: 500 });
    }
}

// DELETE: Remove an account (with Primary Protection)
export async function DELETE(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { searchParams } = new URL(req.url);
        const id = searchParams.get("id");

        if (!id) {
            return NextResponse.json({ error: "Account ID required" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Fetch the account to check if it's primary or belongs to user
        const account = await db.query.connectedAccounts.findFirst({
            where: and(
                eq(connectedAccounts.id, id),
                eq(connectedAccounts.userId, user.id)
            )
        });

        if (!account) {
            return NextResponse.json({ error: "Account not found" }, { status: 404 });
        }

        if (account.isPrimary) {
            return NextResponse.json({ error: "Cannot remove your Primary Identity account." }, { status: 403 });
        }

        await db.delete(connectedAccounts).where(eq(connectedAccounts.id, id));

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Delete Account Error:", error);
        return NextResponse.json({ error: "Failed to delete account" }, { status: 500 });
    }
}
// PATCH: Update account status (Active/Paused)
export async function PATCH(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { id, status } = await req.json();

        if (!id || !['active', 'paused'].includes(status)) {
            return NextResponse.json({ error: "Invalid ID or Status" }, { status: 400 });
        }

        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

        // Verify ownership
        const account = await db.query.connectedAccounts.findFirst({
            where: and(
                eq(connectedAccounts.id, id),
                eq(connectedAccounts.userId, user.id)
            )
        });

        if (!account) return NextResponse.json({ error: "Account not found" }, { status: 404 });

        await db.update(connectedAccounts)
            .set({ status, updatedAt: new Date() })
            .where(eq(connectedAccounts.id, id));

        return NextResponse.json({ success: true, status });
    } catch (error) {
        console.error("Update Account Error:", error);
        return NextResponse.json({ error: "Failed to update account" }, { status: 500 });
    }
}
