
"use client";

import { useState } from "react";
import { startOfDay, format, addHours, differenceInMinutes, isSameDay, isToday, addMinutes } from "date-fns";
import { cn } from "@/lib/utils";
import { UnifiedEvent } from "@/services/calendar/types";
import { ScrollArea } from "@/components/ui/scroll-area";
import { EnergyService } from "@/services/calendar/energy";
import { useDraggable, useDroppable } from '@dnd-kit/core';
import { EventDetailPopover } from "./event-detail-popover";

interface DayViewProps {
    currentDate: Date;
    events: UnifiedEvent[];
    onTimeSlotClick: (date: Date, time: string) => void;
}

// Draggable Event Component
function DraggableEventItem({ event, dayStart, styleInfo }: { event: UnifiedEvent, dayStart: Date, styleInfo: { style: any, className: string } }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: event.id,
        data: { type: 'event', event }
    });

    const style = {
        ...styleInfo.style,
        transform: transform ? `translate3d(${transform.x}px, ${transform.y}px, 0)` : undefined,
        zIndex: isDragging ? 100 : undefined,
        opacity: isDragging ? 0.8 : 1,
    };

    return (
        <EventDetailPopover event={event}>
            <div
                ref={setNodeRef}
                style={style}
                {...listeners}
                {...attributes}
                className={cn(styleInfo.className, "pointer-events-auto touch-none select-none")}
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
        </EventDetailPopover>
    );
}

export function DayView({ currentDate, events, onTimeSlotClick }: DayViewProps) {
    const hours = Array.from({ length: 24 }).map((_, i) => i);
    const dayStart = startOfDay(currentDate);
    const dailyEvents = events.filter(e => isSameDay(e.start, currentDate));

    const energyZones = EnergyService.getZonesForDay(currentDate, 'bear');

    // Droppable Area
    const { setNodeRef } = useDroppable({
        id: 'day-grid',
    });

    const getEventStyle = (event: UnifiedEvent) => {
        const startMinutes = differenceInMinutes(event.start, dayStart);
        const durationMinutes = differenceInMinutes(event.end, event.start);
        const top = Math.max(0, startMinutes);
        const height = Math.max(20, durationMinutes);

        let baseClass = "bg-primary text-primary-foreground";
        switch (event.type) {
            case "work": baseClass = "bg-blue-600/90 text-white border-l-4 border-blue-800"; break;
            case "personal": baseClass = "bg-purple-600/90 text-white border-l-4 border-purple-800"; break;
            // @ts-ignore
            case "lunch": baseClass = "bg-orange-100 text-orange-800 border-l-4 border-orange-400 bg-[url('/patterns/diagonal.png')]"; break;
            // @ts-ignore
            case "break": baseClass = "bg-teal-100 text-teal-800 border-l-4 border-teal-400"; break;
            // @ts-ignore
            case "holiday": baseClass = "bg-red-50 text-red-800 border-l-4 border-red-400"; break;
        }

        return {
            style: { top: `${top}px`, height: `${height}px` },
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
                <div className="flex relative min-h-[1440px]" ref={setNodeRef}>
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
                        {/* Energy Zones Layer */}
                        <div className="absolute inset-0 z-0">
                            {energyZones.map((zone, idx) => {
                                const startMins = differenceInMinutes(zone.start, dayStart);
                                const duration = differenceInMinutes(zone.end, zone.start);
                                if (zone.level === 'medium') return null;
                                let bgClass = "";
                                if (zone.level === 'high') bgClass = "bg-yellow-100/30 dark:bg-yellow-500/10 border-l-2 border-yellow-400";
                                if (zone.level === 'low') bgClass = "bg-slate-100/50 dark:bg-slate-800/20";
                                return (
                                    <div key={`idx-${idx}`} className={cn("absolute w-full flex items-start justify-end px-2 pt-1 pointer-events-none", bgClass)} style={{ top: `${startMins}px`, height: `${duration}px` }}>
                                        <span className={cn("text-[10px] font-semibold uppercase tracking-wider", zone.level === 'high' ? "text-yellow-600/50 dark:text-yellow-500/50" : "text-slate-400/50")}>
                                            {zone.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Grid Lines */}
                        <div className="relative z-0">
                            {hours.map((hour) => (
                                <div
                                    key={hour}
                                    className="h-[60px] border-b border-dashed border-border/40 w-full hover:bg-muted/30 cursor-pointer transition-colors relative"
                                    onClick={() => {
                                        const timeStr = `${hour.toString().padStart(2, "0")}:00`;
                                        onTimeSlotClick(currentDate, timeStr);
                                    }}
                                />
                            ))}
                        </div>

                        {/* Current Time Line */}
                        {isToday(currentDate) && (
                            <div className="absolute w-full border-t-2 border-red-500 z-40 pointer-events-none flex items-center" style={{ top: `${differenceInMinutes(new Date(), dayStart)}px` }}>
                                <div className="absolute -left-2 w-4 h-4 rounded-full bg-red-500" />
                            </div>
                        )}

                        {/* Events Layer */}
                        <div className="absolute inset-0 pointer-events-none z-10">
                            {dailyEvents.map((event) => {
                                const styleInfo = getEventStyle(event);
                                return (
                                    <DraggableEventItem
                                        key={event.id}
                                        event={event}
                                        dayStart={dayStart}
                                        styleInfo={styleInfo}
                                    />
                                );
                            })}
                        </div>
                    </div>
                </div>
            </ScrollArea>
        </div>
    );
}
