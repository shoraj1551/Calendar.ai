
import { auth } from "@/auth";
import { NextResponse } from "next/server";
import { google } from "googleapis";

export async function POST(req: Request) {
    const session = await auth();
    if (!session?.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { provider, email } = await req.json();

        if (provider === "google") {
            const oauth2Client = new google.auth.OAuth2(
                process.env.AUTH_GOOGLE_ID,
                process.env.AUTH_GOOGLE_SECRET,
                `${process.env.NEXTAUTH_URL}/api/auth/callback/google-calendar` // Dedicated callback for Calendar
            );

            const scopes = [
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/userinfo.email",
                "https://www.googleapis.com/auth/userinfo.profile",
            ];

            const url = oauth2Client.generateAuthUrl({
                access_type: "offline",
                scope: scopes,
                prompt: "consent", // Force refresh token
                login_hint: email,
                state: JSON.stringify({ userId: session.user.id }) // Pass state if needed
            });

            return NextResponse.json({ url });
        }

        if (provider === "outlook") {
            // Microsoft Graph Auth Logic
            const tenant = "common";
            const clientId = process.env.AUTH_MICROSOFT_ENTRA_ID_ID;
            const redirectUri = `${process.env.NEXTAUTH_URL}/api/auth/callback/outlook-calendar`;
            const scopes = "offline_access user.read Calendars.ReadWrite";

            const url = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${clientId}&response_type=code&redirect_uri=${encodeURIComponent(redirectUri)}&response_mode=query&scope=${encodeURIComponent(scopes)}&state=${session.user.id}&login_hint=${email}`;

            return NextResponse.json({ url });
        }

        return NextResponse.json({ error: "Provider not supported" }, { status: 400 });

    } catch (error) {
        console.error("Auth URL Generation Error:", error);
        return NextResponse.json({ error: "Failed to generate auth URL" }, { status: 500 });
    }
}
