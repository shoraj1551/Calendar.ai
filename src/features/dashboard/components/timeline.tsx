"use client";

import { format, isSameDay, areIntervalsOverlapping } from "date-fns";
import { Loader2, Calendar as CalendarIcon, Clock, Briefcase, User, Zap, Shield, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";
import { useCalendarEvents } from "@/features/calendar/hooks/use-calendar-events";

const getEventType = (e: any) => {
    const title = e.title.toLowerCase();
    if (e.type === 'personal') return 'personal';
    if (title.includes('focus') || title.includes('deep work') || title.includes('lunch')) return 'focus';
    return 'work';
};

const TYPE_STYLES = {
    work: { border: "border-blue-500", bg: "bg-blue-50 dark:bg-blue-900/20", icon: Briefcase, text: "text-blue-700 dark:text-blue-300", protected: false },
    focus: { border: "border-green-500", bg: "bg-green-50/50 dark:bg-green-900/10", icon: Zap, text: "text-green-700 dark:text-green-300", protected: true },
    personal: { border: "border-orange-500", bg: "bg-orange-50/50 dark:bg-orange-900/10", icon: User, text: "text-orange-700 dark:text-orange-300", protected: true },
};

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

            <div className="space-y-0 relative flex-1 overflow-y-auto custom-scrollbar pr-2">
                {todaysEvents.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">
                        <p>No events scheduled today.</p>
                        <p className="text-sm mt-1">Enjoy your freedom!</p>
                    </div>
                ) : (
                    todaysEvents.map((event, i) => {
                        const isPast = event.end < new Date();
                        const isNow = event.start <= new Date() && event.end >= new Date();
                        const type = getEventType(event);
                        const styles = TYPE_STYLES[type as keyof typeof TYPE_STYLES];
                        const Icon = styles.icon;

                        return (
                            <div key={event.id} className="relative pl-6 py-2 group">
                                {/* Connector Line */}
                                {i !== todaysEvents.length - 1 && (
                                    <div className="absolute left-[9px] top-8 bottom-[-8px] w-[2px] bg-gray-100 dark:bg-gray-800" />
                                )}

                                {/* Dot / Icon */}
                                <div className={`absolute left-0 top-3 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white dark:border-gray-900 z-10 transition-all
                                    ${isNow ? "bg-red-500 scale-110 shadow-md ring-2 ring-red-200" : isPast ? "bg-gray-300" : styles.bg.replace('/20', '')}
                                `}>
                                    {isNow ? (
                                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    ) : (
                                        <Icon className={`w-3 h-3 text-white`} />
                                    )}
                                </div>

                                {/* Event Card */}
                                <div className={`rounded-lg p-3 transition-all border-l-4 ${styles.border} ${isNow ? "bg-white shadow-md ring-1 ring-gray-100 dark:bg-gray-800 dark:ring-gray-700" : "hover:bg-gray-50 dark:hover:bg-gray-800/50"} ${isPast ? "opacity-60 grayscale" : ""}`}>
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs font-mono font-medium text-gray-500">
                                            {format(event.start, "h:mm")} - {format(event.end, "h:mm a")}
                                        </span>
                                        {isNow && <span className="text-[10px] font-bold text-red-500 uppercase tracking-wider animate-pulse">Now</span>}
                                    </div>

                                    <h4 className={`font-medium text-sm ${styles.text}`}>
                                        {event.title}
                                    </h4>

                                    {/* Location / Details on Hover */}
                                    {event.location && (
                                        <div className="hidden group-hover:block pt-2 animate-in fade-in slide-in-from-top-1">
                                            <p className="text-xs text-gray-500 flex items-center gap-1">
                                                📍 {event.location}
                                            </p>
                                        </div>
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
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-400"></span> Work</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500"></span> Focus</div>
                    <div className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-orange-400"></span> Personal</div>
                </div>
            </div>
        </div>
    );
}
