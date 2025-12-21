import { startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, addHours, startOfDay, differenceInMinutes, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { UnifiedEvent } from "@/services/calendar/types";

interface WeekViewProps {
    currentDate: Date;
    events: UnifiedEvent[];
}

export function WeekView({ currentDate, events }: WeekViewProps) {
    const start = startOfWeek(currentDate);
    const end = endOfWeek(start);
    const days = eachDayOfInterval({ start, end });
    const hours = Array.from({ length: 24 }).map((_, i) => i);

    return (
        <div className="flex h-full flex-col bg-background overflow-hidden">
            {/* Header Day Row */}
            <div className="flex border-b pl-16">
                {days.map((day) => (
                    <div
                        key={day.toString()}
                        className={cn(
                            "flex-1 py-3 text-center border-l first:border-l-0",
                            isToday(day) && "bg-muted/30"
                        )}
                    >
                        <div className="text-xs font-medium text-muted-foreground">
                            {format(day, "EEE")}
                        </div>
                        <div
                            className={cn(
                                "mt-1 text-xl font-semibold",
                                isToday(day) && "text-primary"
                            )}
                        >
                            {format(day, "d")}
                        </div>
                        {/* Events Overlay */}
                        {events
                            .filter((event) => isSameDay(event.start, day))
                            .map((event) => {
                                const startMinutes = differenceInMinutes(event.start, startOfDay(event.start));
                                const durationMinutes = differenceInMinutes(event.end, event.start);
                                const top = (startMinutes / 1440) * 100; // % of day
                                const height = (durationMinutes / 1440) * 100;

                                return (
                                    <div
                                        key={event.id}
                                        className={cn(
                                            "absolute left-0 right-0 m-1 rounded p-1 text-xs leading-tight overflow-hidden",
                                            event.type === "work" ? "bg-primary/90 text-primary-foreground" : "bg-green-500/90 text-white"
                                        )}
                                        style={{
                                            top: `${top}%`,
                                            height: `${height}%`,
                                            minHeight: "20px"
                                        }}
                                        title={`${event.title} (${format(event.start, "HH:mm")} - ${format(event.end, "HH:mm")})`}
                                    >
                                        <div className="font-semibold">{event.title}</div>
                                        <div className="text-[10px]">{format(event.start, "h:mma")}</div>
                                    </div>
                                );
                            })}
                    </div>
                ))}
            </div>

            {/* Time Grid Scroll Area */}
            <div className="flex-1 overflow-y-auto no-scrollbar">
                <div className="relative flex min-h-[1440px]">
                    {/* Time Sidebar */}
                    <div className="w-16 flex-none border-r bg-background/95 backdrop-blur z-10 sticky left-0">
                        {hours.map((hour) => (
                            <div
                                key={hour}
                                className="h-[60px] border-b text-xs text-muted-foreground text-right pr-2 pt-2"
                            >
                                {format(addHours(startOfDay(new Date()), hour), "h a")}
                            </div>
                        ))}
                    </div>

                    {/* Days Columns */}
                    <div className="flex flex-1">
                        {days.map((day) => (
                            <div
                                key={day.toString()}
                                className={cn(
                                    "flex-1 border-r border-b last:border-r-0",
                                    isToday(day) && "bg-muted/10"
                                )}
                            >
                                {hours.map((hour) => (
                                    <div
                                        key={`${day}-${hour}`}
                                        className="h-[60px] border-b border-dashed border-border/50 hover:bg-muted/20 transition-colors"
                                    />
                                ))}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
