
import { CalendarProvider, NormalizedEvent, TokenResponse } from "../provider-types";

export class OutlookCalendarProvider implements CalendarProvider {
    providerName = 'outlook' as const;
    private accessToken: string = "";

    constructor(
        private clientId: string,
        private clientSecret: string,
        private redirectUri: string
    ) { }

    setAccessToken(token: string) {
        this.accessToken = token;
    }

    generateAuthUrl(email?: string): string {
        const tenant = "common";
        const scopes = "offline_access user.read Calendars.ReadWrite";
        return `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/authorize?client_id=${this.clientId}&response_type=code&redirect_uri=${encodeURIComponent(this.redirectUri)}&response_mode=query&scope=${encodeURIComponent(scopes)}&login_hint=${email || ''}`;
    }

    async exchangeCodeForToken(code: string): Promise<TokenResponse> {
        // Implemented in callback API, but good to have here for completeness if moving logic
        throw new Error("Use direct fetch in callback for now");
    }

    async refreshToken(refreshToken: string): Promise<TokenResponse> {
        const tenant = "common";
        const tokenEndpoint = `https://login.microsoftonline.com/${tenant}/oauth2/v2.0/token`;

        const params = new URLSearchParams();
        params.append('client_id', this.clientId);
        params.append('client_secret', this.clientSecret);
        params.append('scope', 'offline_access user.read Calendars.ReadWrite');
        params.append('refresh_token', refreshToken);
        params.append('grant_type', 'refresh_token');

        const res = await fetch(tokenEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: params
        });

        if (!res.ok) throw new Error("Failed to refresh Outlook token");

        const tokens = await res.json();
        return {
            accessToken: tokens.access_token,
            refreshToken: tokens.refresh_token, // Rotated often
            expiresAt: Date.now() + (tokens.expires_in * 1000)
        };
    }

    async listEvents(startTime: Date, endTime: Date): Promise<NormalizedEvent[]> {
        if (!this.accessToken) throw new Error("No access token set");

        const start = startTime.toISOString();
        const end = endTime.toISOString();

        // MS Graph API
        const url = `https://graph.microsoft.com/v1.0/me/calendarView?startDateTime=${start}&endDateTime=${end}&$top=100`;

        const res = await fetch(url, {
            headers: { Authorization: `Bearer ${this.accessToken}` }
        });

        if (!res.ok) throw new Error("Failed to fetch Outlook events");

        const data = await res.json();
        return (data.value || []).map((e: any) => this.normalizeEvent(e));
    }

    private normalizeEvent(event: any): NormalizedEvent {
        return {
            id: event.id,
            providerEventId: event.id,
            provider: 'outlook',
            title: event.subject || "(No Subject)",
            description: event.bodyPreview || undefined,
            startTime: new Date(event.start.dateTime + 'Z'), // MS often sends local time without Z, but Graph usually returns UTC if PREFER header set. Assuming ISO for now.
            endTime: new Date(event.end.dateTime + 'Z'),
            allDay: event.isAllDay,
            location: event.location?.displayName || undefined,
            status: event.isCancelled ? 'cancelled' : 'confirmed',
            organizer: event.organizer ? { email: event.organizer.emailAddress.address, self: false } : undefined, // Logic for self check needed
            htmlLink: event.webLink
        };
    }

    // Stubs
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Not implemented"); }
    async updateEvent(id: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Not implemented"); }
    async deleteEvent(id: string): Promise<void> { throw new Error("Not implemented"); }
}
