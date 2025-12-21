"use client";

import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar-events";
import { format, isSameDay } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock } from "lucide-react";

export function TimelineWidget() {
    const { events, loading: isLoading } = useCalendarEvents();
    const today = new Date();

    // Filter for today's events only
    const todaysEvents = events
        .filter(e => isSameDay(e.start, today))
        .sort((a, b) => a.start.getTime() - b.start.getTime());

    if (isLoading) {
        return (
            <div className="h-64 flex items-center justify-center bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800">
                <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-6 flex flex-col h-full">
            <div className="flex items-center justify-between mb-6">
                <h3 className="font-semibold text-gray-900 dark:text-gray-100 flex items-center gap-2">
                    <CalendarIcon className="w-4 h-4 text-blue-500" />
                    Today's Timeline
                </h3>
                <span className="text-xs font-medium text-gray-500 bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded-full">
                    {format(today, "EEEE, MMMM d")}
                </span>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-2 custom-scrollbar">
                {todaysEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>No events scheduled today.</p>
                        <p className="text-sm mt-1">Enjoy your freedom!</p>
                    </div>
                ) : (
                    todaysEvents.map((event) => {
                        const isPast = event.end < new Date();
                        const isNow = event.start <= new Date() && event.end >= new Date();

                        return (
                            <div
                                key={event.id}
                                className={`relative pl-4 border-l-2 transition-all group ${isNow ? "border-blue-500" : isPast ? "border-gray-200 dark:border-gray-700" : "border-blue-200 dark:border-blue-800"
                                    }`}
                            >
                                {/* Time Indicator Dot */}
                                <div className={`absolute -left-[5px] top-0 w-2 h-2 rounded-full ${isNow ? "bg-blue-500 animate-pulse" : isPast ? "bg-gray-300 dark:bg-gray-600" : "bg-blue-300 dark:bg-blue-700"
                                    }`} />

                                <div className="flex flex-col gap-1">
                                    <span className={`text-xs font-mono font-medium ${isNow ? "text-blue-600 dark:text-blue-400" : "text-gray-500"}`}>
                                        {format(event.start, "h:mm a")} - {format(event.end, "h:mm a")}
                                    </span>
                                    <h4 className={`font-medium text-sm ${isPast ? "text-gray-500 line-through decoration-gray-300" : "text-gray-900 dark:text-gray-100"}`}>
                                        {event.title}
                                    </h4>
                                    {event.location && (
                                        <p className="text-xs text-gray-400 truncate max-w-[200px]">{event.location}</p>
                                    )}
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer / Visual Summary */}
            <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    <span>{Math.round(todaysEvents.reduce((acc, e) => acc + (e.end.getTime() - e.start.getTime()) / 3600000, 0) * 10) / 10}h Planned</span>
                </div>
                <div className="flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                    <span>Focus</span>
                    <span className="w-2 h-2 rounded-full bg-green-500 ml-2"></span>
                    <span>Free</span>
                </div>
            </div>
        </div>
    );
}
