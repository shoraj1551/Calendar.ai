
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedAccounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.redirect(new URL("/login?error=SessionExpired", req.url));
    }

    const { searchParams } = new URL(req.url);
    const code = searchParams.get("code");
    const error = searchParams.get("error");

    if (error) {
        return NextResponse.redirect(new URL(`/settings?error=AuthFailed&details=${error}`, req.url));
    }

    if (!code) {
        return NextResponse.redirect(new URL("/settings?error=NoCode", req.url));
    }

    try {
        // Exchange Code for Token (Direct Fetch)
        const tenant = "common";
        const tokenEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', process.env.AUTH_MICROSOFT_ENTRA_ID_ID!);
        params.append('scope', 'offline_access user.read Calendars.ReadWrite');
        params.append('code', code);
        params.append('redirect_uri', `${process.env.NEXTAUTH_URL}/api/auth/callback/outlook-calendar`);
        params.append('grant_type', 'authorization_code');
        params.append('client_secret', process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!);

        const tokenRes = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        if (!tokenRes.ok) {
            const errText = await tokenRes.text();
            throw new Error(`Microsoft Token Error: ${errText}`);
        }

        const tokens = await tokenRes.json();

        // Fetch User Profile to get Email
        const profileRes = await fetch("https://graph.microsoft.com/v1.0/me", {
            headers: { Authorization: `Bearer ${tokens.access_token}` }
        });

        if (!profileRes.ok) throw new Error("Failed to fetch Microsoft Profile");
        const profile = await profileRes.json();
        const email = profile.mail || profile.userPrincipalName;


        // Database Persistence
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) throw new Error("User not found in DB");

        const existing = await db.query.connectedAccounts.findFirst({
            where: and(
                eq(connectedAccounts.userId, user.id),
                eq(connectedAccounts.email, email),
                eq(connectedAccounts.provider, 'outlook')
            )
        });

        if (existing) {
            await db.update(connectedAccounts)
                .set({
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token,
                    expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
                    status: 'active',
                    updatedAt: new Date()
                })
                .where(eq(connectedAccounts.id, existing.id));
        } else {
            await db.insert(connectedAccounts).values({
                userId: user.id,
                provider: 'outlook',
                email: email,
                name: profile.displayName || "Outlook Calendar",
                status: 'active',
                isPrimary: false,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(Date.now() + (tokens.expires_in * 1000)),
            });
        }

        return NextResponse.redirect(new URL("/settings?success=Connected", req.url));

    } catch (err: any) {
        console.error("Outlook Callback Error:", err);
        return NextResponse.redirect(new URL(`/settings?error=ConnectionFailed&details=${encodeURIComponent(err.message)}`, req.url));
    }
}
