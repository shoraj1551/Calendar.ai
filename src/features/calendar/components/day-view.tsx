
import { startOfDay, format, addHours, differenceInMinutes, isSameDay, isToday } from "date-fns";
import { cn } from "@/lib/utils";
import { UnifiedEvent } from "@/services/calendar/types";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DayViewProps {
    currentDate: Date;
    events: UnifiedEvent[];
}

export function DayView({ currentDate, events }: DayViewProps) {
    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const dayStart = startOfDay(currentDate);

    // Filter events for this day
    const dailyEvents = events.filter(e => isSameDay(e.start, currentDate));

    const getEventStyle = (event: UnifiedEvent) => {
        // Base positioning
        const startMinutes = differenceInMinutes(event.start, dayStart);
        const durationMinutes = differenceInMinutes(event.end, event.start);
        const top = Math.max(0, startMinutes); // minutes from top
        const height = Math.max(20, durationMinutes); // min height 20px

        // Determine Color/Style based on type
        let baseClass = "bg-primary text-primary-foreground";

        switch (event.type) {
            case "work":
                baseClass = "bg-blue-600/90 text-white border-l-4 border-blue-800";
                break;
            case "personal":
                baseClass = "bg-purple-600/90 text-white border-l-4 border-purple-800";
                break;
            // @ts-ignore - types will be added
            case "lunch":
                baseClass = "bg-orange-100 text-orange-800 border-l-4 border-orange-400 bg-[url('/patterns/diagonal.png')]";
                break;
            // @ts-ignore
            case "break":
                baseClass = "bg-teal-100 text-teal-800 border-l-4 border-teal-400";
                break;
            // @ts-ignore 
            case "holiday":
                baseClass = "bg-red-50 text-red-800 border-l-4 border-red-400";
                break;
        }

        return {
            style: {
                top: `${top}px`, // 1 min = 1 px height for simplicity (or scalar)
                height: `${height}px`,
            },
            className: cn("absolute left-2 right-2 rounded-md p-2 text-xs overflow-hidden shadow-sm transition-all hover:brightness-110 hover:z-50 cursor-pointer", baseClass)
        };
    };

    return (
        <div className="flex h-full flex-col bg-background">
            {/* Header */}
            <div className="flex items-center justify-center border-b py-4 shadow-sm z-20 bg-background">
                <div className="text-center">
                    <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {format(currentDate, "EEEE")}
                    </div>
                    <div className={cn("text-4xl font-bold mt-1", isToday(currentDate) && "text-primary")}>
                        {format(currentDate, "d")}
                    </div>
                    <div className="text-lg text-muted-foreground">
                        {format(currentDate, "MMMM yyyy")}
                    </div>
                </div>
            </div>

            {/* Time Grid */}
            <ScrollArea className="flex-1 relative">
                <div className="flex relative min-h-[1440px]">
                    {/* Time Column */}
                    <div className="w-20 border-r bg-muted/5 sticky left-0 z-10 text-xs font-medium text-muted-foreground">
                        {hours.map((hour) => (
                            <div key={hour} className="h-[60px] relative border-b border-transparent">
                                <span className="absolute -top-3 right-3 bg-background px-1">
                                    {format(addHours(dayStart, hour), "h a")}
                                </span>
                            </div>
                        ))}
                    </div>

                    {/* Events Column */}
                    <div className="flex-1 relative bg-grid-slate-100/50">
                        {/* Grid Lines */}
                        {hours.map((hour) => (
                            <div key={hour} className="h-[60px] border-b border-dashed border-border/40 w-full" />
                        ))}

                        {/* Current Time Line (if today) */}
                        {isToday(currentDate) && (
                            <div
                                className="absolute w-full border-t-2 border-red-500 z-40 pointer-events-none flex items-center"
                                style={{ top: `${differenceInMinutes(new Date(), dayStart)}px` }}
                            >
                                <div className="absolute -left-2 w-4 h-4 rounded-full bg-red-500" />
                            </div>
                        )}

                        {/* Events */}
                        {dailyEvents.map((event) => {
                            const { style, className } = getEventStyle(event);
                            return (
                                <div
                                    key={event.id}
                                    style={style}
                                    className={className}
                                    title={`${event.title} (${format(event.start, "h:mm a")} - ${format(event.end, "h:mm a")})`}
                                >
                                    <div className="font-bold truncate">{event.title}</div>
                                    <div className="flex items-center gap-1 opacity-90">
                                        <span>{format(event.start, "h:mm")}</span>
                                        <span>-</span>
                                        <span>{format(event.end, "h:mm a")}</span>
                                    </div>
                                    {event.description && (
                                        <div className="mt-1 opacity-75 truncate">{event.description}</div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
