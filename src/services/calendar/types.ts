export interface UnifiedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    provider: "google" | "outlook" | "local";
    status: "confirmed" | "tentative" | "cancelled";
    type: "work" | "personal" | "focus" | "recovery" | "social" | "admin" | "lunch" | "holiday" | "life_event" | "block"; // Derived from calendar source or heuristic
    isUrgent?: boolean; // Override flag for soft blocks
    description?: string;
    location?: string;
    meetLink?: string; // e.g., Google Meet URL
}

export interface CalendarSource {
    id: string;
    name: string;
    provider: "google" | "outlook";
    primary: boolean;
    accessRole: "owner" | "reader" | "writer";
}
