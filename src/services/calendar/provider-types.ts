
import { type calendar_v3 } from "googleapis";

// Standard Event Interface (Normalized)
export interface NormalizedEvent {
    id: string;
    title: string;
    description?: string;
    startTime: Date;
    endTime: Date;
    allDay: boolean;
    location?: string;
    status: 'confirmed' | 'tentative' | 'cancelled';
    organizer?: { email: string; self: boolean };
    attendees?: { email: string; responseStatus: string }[];
    htmlLink?: string;
    provider: 'google' | 'outlook' | 'ical';
    providerEventId: string;
}

// Provider Interface
export interface CalendarProvider {
    providerName: 'google' | 'outlook' | 'ical';

    // Auth Generation
    generateAuthUrl(email?: string): string;

    // Token Management
    exchangeCodeForToken(code: string): Promise<TokenResponse>;
    refreshToken(refreshToken: string): Promise<TokenResponse>;

    // Data Fetching
    listEvents(startTime: Date, endTime: Date): Promise<NormalizedEvent[]>;
    createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent>;
    updateEvent(eventId: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent>;
    deleteEvent(eventId: string): Promise<void>;
}

export interface TokenResponse {
    accessToken: string;
    refreshToken?: string; // May not be returned on every refresh
    expiresAt: number; // Timestamp
}
