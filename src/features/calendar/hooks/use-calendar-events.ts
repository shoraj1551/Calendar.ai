import { UnifiedEvent } from "@/services/calendar/types";
import { useEffect, useState } from "react";

export function useCalendarEvents() {
    const [events, setEvents] = useState<UnifiedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchEvents() {
            try {
                const res = await fetch("/api/calendar/events");
                if (!res.ok) {
                    if (res.status === 401) {
                        // User not logged in, just return empty (middleware handles redirect mostly)
                        setEvents([]);
                        return;
                    }
                    throw new Error("Failed to search events");
                }
                const data = await res.json();
                const parsedEvents = (data.events || []).map((e: any) => ({
                    ...e,
                    start: new Date(e.start),
                    end: new Date(e.end),
                }));
                setEvents(parsedEvents);
            } catch (err) {
                console.error("Failed to fetch events", err);
                setError("Failed to load events");
            } finally {
                setLoading(false);
            }
        }

        fetchEvents();
    }, []);

    return { events, loading, error };
}
