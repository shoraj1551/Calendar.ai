export interface UnifiedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay?: boolean;
    provider?: "local" | "google" | "outlook";
    status?: "confirmed" | "tentative" | "cancelled";
    type?: "work" | "personal" | "break" | "lunch" | "holiday";
    isUrgent?: boolean; // Override flag for soft blocks
    description?: string;
    location?: string;
    meetLink?: string; // e.g., Google Meet URL
    connectedAccountId?: string | null;  // Added for calendar account tracking
    providerEventId?: string | null;     // Added for provider event ID
}

export interface CalendarSource {
    id: string;
    name: string;
    provider: "google" | "outlook";
    primary: boolean;
    accessRole: "owner" | "reader" | "writer";
}
