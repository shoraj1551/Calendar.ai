import { startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, format } from "date-fns";
import { cn } from "@/lib/utils";
import { UnifiedEvent } from "@/services/calendar/types";

interface MonthViewProps {
    currentDate: Date;
    events: UnifiedEvent[];
}

export function MonthView({ currentDate, events }: MonthViewProps) {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(monthStart);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const dateFormat = "d";
    const days = eachDayOfInterval({
        start: startDate,
        end: endDate,
    });
    const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

    return (
        <div className="flex flex-col h-full bg-background">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b">
                {weekDays.map((day) => (
                    <div
                        key={day}
                        className="py-2 text-center text-sm font-medium text-muted-foreground border-r last:border-r-0"
                    >
                        {day}
                    </div>
                ))}
            </div>

            {/* Calendar Grid */}
            <div className="flex-1 grid grid-cols-7 grid-rows-5 md:grid-rows-6">
                {days.map((day, idx) => {
                    return (
                        <div
                            key={day.toString()}
                            className={cn(
                                "border-b border-r p-2 transition-colors hover:bg-muted/50 last:border-r-0",
                            )}
                        >
                            <div
                                className={cn(
                                    "flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium",
                                    !isSameMonth(day, monthStart) && "text-muted-foreground",
                                    isSameDay(day, new Date()) && "bg-accent text-accent-foreground"
                                )}
                            >
                                <span className="text-sm font-medium">{format(day, dateFormat)}</span>
                            </div>
                            <div className="mt-1 space-y-1">
                                {events
                                    .filter((event) => isSameDay(event.start, day))
                                    .map((event) => (
                                        <div
                                            key={event.id}
                                            className={cn(
                                                "truncate px-1 text-[10px] rounded-sm cursor-pointer",
                                                event.type === "work" ? "bg-primary/90 text-primary-foreground" : "bg-green-500/90 text-white"
                                            )}
                                            title={event.title}
                                        >
                                            {event.title}
                                        </div>
                                    ))}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div >
    );
}
