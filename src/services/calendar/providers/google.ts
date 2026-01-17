
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
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> {
        const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

        const requestBody: calendar_v3.Schema$Event = {
            summary: event.title || "New Event",
            description: event.description,
            start: { dateTime: event.startTime?.toISOString() },
            end: { dateTime: event.endTime?.toISOString() }
        };

        try {
            const res = await calendar.events.insert({
                calendarId: 'primary',
                requestBody
            });

            return this.normalizeEvent(res.data);
        } catch (error) {
            console.error("Google Create Event Error:", error);
            throw error;
        }
    }
    async updateEvent(id: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent> {
        const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });

        const patchBody: calendar_v3.Schema$Event = {};
        if (event.title) patchBody.summary = event.title;
        if (event.description) patchBody.description = event.description;
        if (event.startTime) patchBody.start = { dateTime: event.startTime.toISOString() };
        if (event.endTime) patchBody.end = { dateTime: event.endTime.toISOString() };

        try {
            const res = await calendar.events.patch({
                calendarId: 'primary',
                eventId: id, // This is the Google ID (providerEventId)
                requestBody: patchBody
            });

            return this.normalizeEvent(res.data);
        } catch (error) {
            console.error("Google Update Event Error:", error);
            throw error;
        }
    }
    async deleteEvent(id: string): Promise<void> {
        const calendar = google.calendar({ version: 'v3', auth: this.oAuth2Client });
        try {
            await calendar.events.delete({
                calendarId: 'primary',
                eventId: id
            });
        } catch (error) {
            console.error("Google Delete Event Error:", error);
            throw error;
        }
    }
}
