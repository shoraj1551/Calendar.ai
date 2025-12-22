
import { google, calendar_v3 } from "googleapis";
import { CalendarProvider, NormalizedEvent, TokenResponse } from "../provider-types";

export class GoogleCalendarProvider implements CalendarProvider {
    providerName = 'google' as const;
    private oAuth2Client;

    constructor(clientId: string, clientSecret: string, redirectUri: string) {
        this.oAuth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri);
    }

    setCredentials(tokens: TokenResponse) {
        this.oAuth2Client.setCredentials({
            access_token: tokens.accessToken,
            refresh_token: tokens.refreshToken,
            expiry_date: tokens.expiresAt
        });
    }

    generateAuthUrl(email?: string): string {
        return this.oAuth2Client.generateAuthUrl({
            access_type: "offline",
            scope: [
                "https://www.googleapis.com/auth/calendar",
                "https://www.googleapis.com/auth/userinfo.email"
            ],
            login_hint: email,
            prompt: "consent"
        });
    }

    async exchangeCodeForToken(code: string): Promise<TokenResponse> {
        const { tokens } = await this.oAuth2Client.getToken(code);
        return {
            accessToken: tokens.access_token!,
            refreshToken: tokens.refresh_token!,
            expiresAt: tokens.expiry_date!
        };
    }

    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        this.oAuth2Client.setCredentials({ refresh_token: refreshToken });
        const { credentials } = await this.oAuth2Client.refreshAccessToken();
        return {
            accessToken: credentials.access_token!,
            refreshToken: credentials.refresh_token!, // Google might not rotate it
            expiresAt: credentials.expiry_date!
        };
    }

    async listEvents(startTime: Date, endTime: Date): Promise<NormalizedEvent[]> {
        const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

        try {
            const res = await calendar.events.list({
                calendarId: 'primary',
                timeMin: startTime.toISOString(),
                timeMax: endTime.toISOString(),
                singleEvents: true,
                orderBy: 'startTime',
            });

            return (res.data.items || []).map(event => this.normalizeEvent(event));
        } catch (error) {
            console.error("Google List Events Error:", error);
            throw error;
        }
    }

    private normalizeEvent(event: calendar_v3.Schema$Event): NormalizedEvent {
        return {
            id: event.id!, // We might prepend 'google_' later in factories
            providerEventId: event.id!,
            provider: 'google',
            title: event.summary || "(No Title)",
            description: event.description || undefined,
            startTime: new Date(event.start?.dateTime || event.start?.date!), // Handle all-day
            endTime: new Date(event.end?.dateTime || event.end?.date!),
            allDay: !!event.start?.date, // If dateTime is missing, it's all-day
            location: event.location || undefined,
            status: event.status === 'confirmed' ? 'confirmed' : event.status === 'cancelled' ? 'cancelled' : 'tentative',
            organizer: event.organizer ? { email: event.organizer.email!, self: !!event.organizer.self } : undefined,
            htmlLink: event.htmlLink || undefined
        };
    }

    // Stubs for now
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Not implemented"); }
    async updateEvent(id: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Not implemented"); }
    async deleteEvent(id: string): Promise<void> { throw new Error("Not implemented"); }
}
