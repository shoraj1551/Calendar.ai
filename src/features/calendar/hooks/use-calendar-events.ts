import { UnifiedEvent } from "@/services/calendar/types";
import { useEffect, useState } from "react";

export function useCalendarEvents() {
    const [events, setEvents] = useState<UnifiedEvent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchEvents = async () => {
        setLoading(true);
        try {
            const res = await fetch("/api/calendar/events");
            if (!res.ok) {
                if (res.status === 401) {
                    setEvents([]);
                    return;
                }
                const errorData = await res.json().catch(() => ({ error: res.statusText }));
                console.error("Fetch Events Error:", errorData);
                throw new Error(errorData.error || `Error ${res.status}`);
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
    };

    useEffect(() => {
        fetchEvents();
    }, []);

    return { events, loading, error, refresh: fetchEvents };
}
