"use client";

import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar-events";
import { isSameDay } from "date-fns";
import { Activity, AlertCircle, CheckCircle, Battery } from "lucide-react";

export function CapacityIndicator() {
    const { events, loading } = useCalendarEvents();
    const today = new Date();

    const todaysEvents = events.filter(e => isSameDay(e.start, today));

    // Metrics
    const totalDuration = todaysEvents.reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 3600000, 0);
    const meetingEvents = todaysEvents.filter(e => !e.title.toLowerCase().includes("focus") && e.type !== "personal");
    const meetingDuration = meetingEvents.reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 3600000, 0);

    // Calculate longest stretch without break (simplified)
    // In a real app we'd sort and check gaps.
    const isHeavy = meetingDuration > 5;
    const isOverload = meetingDuration > 7;

    if (loading) return <div className="h-6 w-32 bg-gray-100 rounded animate-pulse" />;

    if (isOverload) {
        return (
            <div className="flex items-center gap-2 text-orange-600 dark:text-orange-400 animate-in fade-in">
                <AlertCircle className="w-5 h-5" />
                <span className="font-medium">Heavy load ({Math.round(meetingDuration)}h). Prioritize breaks.</span>
            </div>
        );
    }

    if (isHeavy) {
        return (
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 animate-in fade-in">
                <Battery className="w-5 h-5 rotate-90" />
                <span className="font-medium">Busy day ({Math.round(meetingDuration)}h meetings). Pace yourself.</span>
            </div>
        );
    }

    return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400 animate-in fade-in">
            <CheckCircle className="w-5 h-5" />
            <span className="font-medium">Healthy balance. Enjoy your focus time.</span>
        </div>
    );
}
