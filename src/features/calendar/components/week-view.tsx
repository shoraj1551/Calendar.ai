
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
                                    "flex-1 border-r border-b last:border-r-0 relative min-w-[120px]",
                                    isToday(day) && "bg-muted/10"
                                )}
                            >
                                {/* Grid Lines */}
                                {hours.map((hour) => (
                                    <div
                                        key={`${day}-${hour}`}
                                        className="h-[60px] border-b border-dashed border-border/50 hover:bg-muted/20 transition-colors"
                                    />
                                ))}

                                {/* Events */}
                                {events
                                    .filter((event) => isSameDay(event.start, day))
                                    .map((event) => {
                                        const startMinutes = differenceInMinutes(event.start, startOfDay(event.start));
                                        const durationMinutes = differenceInMinutes(event.end, event.start);
                                        const top = startMinutes; // 1min = 1px scaling
                                        const height = Math.max(20, durationMinutes);

                                        let baseClass = "bg-primary text-primary-foreground";
                                        if (event.type === "work") baseClass = "bg-blue-600/90 text-white border-l-2 border-blue-800";
                                        if (event.type === "personal") baseClass = "bg-purple-600/90 text-white border-l-2 border-purple-800";
                                        // @ts-ignore
                                        if (event.type === "lunch") baseClass = "bg-orange-100/90 text-orange-800 border-l-2 border-orange-400 bg-[url('/patterns/diagonal.png')]";
                                        // @ts-ignore
                                        if (event.type === "break") baseClass = "bg-teal-100/90 text-teal-800 border-l-2 border-teal-400";
                                        // @ts-ignore
                                        if (event.type === "holiday") baseClass = "bg-red-50/90 text-red-800 border-l-2 border-red-400";

                                        return (
                                            <div
                                                key={event.id}
                                                className={cn(
                                                    "absolute left-0.5 right-0.5 rounded px-1 text-[10px] leading-tight overflow-hidden shadow-sm hover:z-50 hover:brightness-105 cursor-pointer",
                                                    baseClass
                                                )}
                                                style={{
                                                    top: `${top}px`,
                                                    height: `${height}px`,
                                                }}
                                                title={`${event.title} (${format(event.start, "h:mm a")})`}
                                            >
                                                <div className="font-semibold truncate">{event.title}</div>
                                            </div>
                                        );
                                    })}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
