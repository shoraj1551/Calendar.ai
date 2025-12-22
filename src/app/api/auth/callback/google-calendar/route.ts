
import { auth } from "@/auth";
import { db } from "@/db";
import { connectedAccounts, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { google } from "googleapis";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const session = await auth();
    // Safety fallback: if session is lost (cookie issues), we might rely on 'state' param to re-hydrate or fail.
    // For now, strict session check.
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
        const oauth2Client = new google.auth.OAuth2(
            process.env.AUTH_GOOGLE_ID,
            process.env.AUTH_GOOGLE_SECRET,
            `${process.env.NEXTAUTH_URL}/api/auth/callback/google-calendar`
        );

        const { tokens } = await oauth2Client.getToken(code);
        oauth2Client.setCredentials(tokens);

        // Fetch User Profile from Google to get the *Calendar* email (might be different from Auth email)
        const oauth2 = google.oauth2({ auth: oauth2Client, version: 'v2' });
        const { data: userProfile } = await oauth2.userinfo.get();

        if (!userProfile.email) {
            throw new Error("Failed to get email from Google Profile");
        }

        // Database Persistence
        const user = await db.query.users.findFirst({
            where: eq(users.email, session.user.email)
        });

        if (!user) throw new Error("User not found in DB");

        // Upsert Account
        const existing = await db.query.connectedAccounts.findFirst({
            where: and(
                eq(connectedAccounts.userId, user.id),
                eq(connectedAccounts.email, userProfile.email),
                eq(connectedAccounts.provider, 'google')
            )
        });

        if (existing) {
            // Update Tokens
            await db.update(connectedAccounts)
                .set({
                    accessToken: tokens.access_token,
                    refreshToken: tokens.refresh_token || existing.refreshToken, // Google only sends refresh token on first consent or forced prompt
                    expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
                    status: 'active',
                    updatedAt: new Date()
                })
                .where(eq(connectedAccounts.id, existing.id));
        } else {
            // Insert New
            await db.insert(connectedAccounts).values({
                userId: user.id,
                provider: 'google',
                email: userProfile.email,
                name: userProfile.name || "Google Calendar",
                status: 'active',
                isPrimary: false,
                accessToken: tokens.access_token,
                refreshToken: tokens.refresh_token,
                expiresAt: new Date(tokens.expiry_date || Date.now() + 3600000),
            });
        }

        // Redirect back to settings with success
        return NextResponse.redirect(new URL("/settings?success=Connected", req.url));

    } catch (err: any) {
        console.error("Callback Error:", err);
        return NextResponse.redirect(new URL(`/settings?error=ConnectionFailed&details=${encodeURIComponent(err.message)}`, req.url));
    }
}
