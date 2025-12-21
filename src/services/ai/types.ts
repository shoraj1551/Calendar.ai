export type IntentType = "create_event" | "reschedule_event" | "query_schedule" | "unknown";

export interface CreateEventParams {
    title: string;
    start: string; // ISO string
    end: string; // ISO string
    attendees?: string[];
}

export interface RescheduleEventParams {
    eventId?: string; // If known
    newTime: string; // ISO string
}

export interface QueryScheduleParams {
    date: string; // ISO string or "today" | "tomorrow"
}

export interface AICommandResult {
    intent: IntentType;
    params?: CreateEventParams | RescheduleEventParams | QueryScheduleParams;
    confidence: number;
    rawText: string;
    confirmationParams?: {
        message: string; // "I understood you want to book a meeting..."
    }
}
