export interface UnifiedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    provider: "google" | "outlook" | "local";
    status: "confirmed" | "tentative" | "cancelled";
    type: "work" | "personal"; // Derived from calendar source or heuristic
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
