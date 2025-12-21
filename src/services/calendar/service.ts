import { fetchGoogleEvents } from "@/integrations/google/client";
import { UnifiedEvent } from "./types";
import { addMonths, subMonths } from "date-fns";
import { EventRepository } from "../events/db";

/**
 * Normalizes a Google Event into our UnifiedEvent schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeGoogleEvent = (event: any): UnifiedEvent => {
    const isAllDay = !event.start?.dateTime;
    const start = new Date(event.start?.dateTime || event.start?.date);
    const end = new Date(event.end?.dateTime || event.end?.date);

    return {
        id: event.id || "unknown",
        title: event.summary || "(No Title)",
        start,
        end,
        allDay: isAllDay,
        provider: "google",
        status: event.status === "confirmed" ? "confirmed" : "tentative",
        type: "personal", // Defaulting to personal for now; can be enhanced later
        description: event.description,
        location: event.location,
        meetLink: event.htmlLink,
    };
};

/**
 * Fetches and aggregates events from all connected providers.
 */
export const getAggregatedEvents = async (accessToken: string, userId: string): Promise<UnifiedEvent[]> => {
    // if (!accessToken) return []; // Allow local-only mode if we want, but keeping consistent for now

    const now = new Date();
    const timeMin = subMonths(now, 1);
    const timeMax = addMonths(now, 2);

    const events: UnifiedEvent[] = [];

    // 1. Fetch Google Events
    if (accessToken) {
        try {
            const googleEvents = await fetchGoogleEvents(accessToken, timeMin, timeMax);
            events.push(...googleEvents.map(normalizeGoogleEvent));
        } catch (error) {
            console.error("Google Sync Error:", error);
        }
    }

    // 2. Fetch Local Events
    if (userId) {
        try {
            const localEvents = await EventRepository.getByRange(userId, timeMin, timeMax);
            events.push(...localEvents);
        } catch (error) {
            console.error("Local DB Error:", error);
        }
    }

    // Sort by start time
    return events.sort((a, b) => a.start.getTime() - b.start.getTime());
};
