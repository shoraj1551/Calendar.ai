"use client";

import { useState } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfDay, differenceInMinutes, addMinutes } from "date-fns";
import { CalendarHeader, type CalendarViewType } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { DayView } from "./day-view";
import { useCalendarEvents } from "../hooks/use-calendar-events";
import { CreateEventModal } from "./create-event-modal";
import { TaskSidebar } from "@/features/tasks/components/task-sidebar";
import { DndContext, DragEndEvent } from '@dnd-kit/core';
import { updateEventAction } from "@/app/actions/calendar";
import { scheduleTaskAction } from "@/app/actions/tasks";
import { toast } from "sonner";

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarViewType>("month");
    const { events, loading, refresh } = useCalendarEvents();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedSlot, setSelectedSlot] = useState<{ date: Date; time: string } | undefined>(undefined);

    const handlePrev = () => {
        if (view === "month") setCurrentDate((date) => subMonths(date, 1));
        if (view === "week") setCurrentDate((date) => subWeeks(date, 1));
        if (view === "day") setCurrentDate((date) => subDays(date, 1));
    };

    const handleNext = () => {
        if (view === "month") setCurrentDate((date) => addMonths(date, 1));
        if (view === "week") setCurrentDate((date) => addWeeks(date, 1));
        if (view === "day") setCurrentDate((date) => addDays(date, 1));
    };

    const handleToday = () => setCurrentDate(new Date());

    const handleTimeSelect = (date: Date, time: string) => {
        setSelectedSlot({ date, time });
        setIsModalOpen(true);
    };

    const handleEventCreated = () => {
        refresh();
    };

    async function handleDragEnd(event: DragEndEvent) {
        const { active, delta, over } = event;

        // Case 1: Dragging an Event (Rescheduling)
        if (active.data.current?.type === 'event') {
            if (!delta.y) return;

            const draggedEvent = active.data.current.event;
            const minutesMoved = Math.round(delta.y);
            const newStart = addMinutes(draggedEvent.start, minutesMoved);
            const remainder = newStart.getMinutes() % 15;
            const snappedStart = addMinutes(newStart, -remainder);
            const duration = differenceInMinutes(draggedEvent.end, draggedEvent.start);
            const snappedEnd = addMinutes(snappedStart, duration);

            if (!draggedEvent.connectedAccountId) {
                toast.error("Cannot move local-only event yet.");
                return;
            }

            try {
                const result = await updateEventAction(
                    draggedEvent.connectedAccountId,
                    draggedEvent.providerEventId,
                    { startTime: snappedStart, endTime: snappedEnd }
                );

                if (result.success) {
                    toast.success("Event updated");
                    refresh();
                } else {
                    toast.error(result.error || "Failed to update event");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to update event");
            }
        }

        // Case 2: Dragging a Task (Timeblocking)
        else if (active.data.current?.type === 'task') {
            const task = active.data.current.task;

            // Calculate drop position (y-offset from day start)
            const dayStart = startOfDay(currentDate);
            const minutesFromTop = Math.round(delta.y);
            const dropTime = addMinutes(dayStart, minutesFromTop);

            // Snap to 15 min
            const remainder = dropTime.getMinutes() % 15;
            const snappedStart = addMinutes(dropTime, -remainder);
            const duration = task.estimatedDuration || 30;
            const snappedEnd = addMinutes(snappedStart, duration);

            // Get first active account
            const firstEvent = events.find(e => e.connectedAccountId);
            if (!firstEvent?.connectedAccountId) {
                toast.error("No calendar account found");
                return;
            }

            try {
                const result = await scheduleTaskAction(
                    task.id,
                    firstEvent.connectedAccountId,
                    snappedStart,
                    snappedEnd
                );

                if (result.success) {
                    toast.success(result.message || "Task scheduled!");
                    refresh();
                } else {
                    toast.error(result.error || "Failed to schedule task");
                }
            } catch (err) {
                console.error(err);
                toast.error("Failed to schedule task");
            }
        }
    }

    return (
        <DndContext onDragEnd={handleDragEnd}>
            <div className="flex h-screen overflow-hidden bg-background">
                <div className="flex flex-col flex-1 overflow-hidden">
                    <CalendarHeader
                        currentDate={currentDate}
                        view={view}
                        onViewChange={setView}
                        onPrev={handlePrev}
                        onNext={handleNext}
                        onToday={handleToday}
                    />
                    <div className="flex-1 overflow-auto">
                        {view === "month" && (
                            <MonthView currentDate={currentDate} events={events} />
                        )}
                        {view === "week" && (
                            <WeekView currentDate={currentDate} events={events} />
                        )}
                        {view === "day" && (
                            <DayView
                                currentDate={currentDate}
                                events={events}
                                onTimeSlotClick={handleTimeSelect}
                            />
                        )}
                    </div>

                    <CreateEventModal
                        isOpen={isModalOpen}
                        onClose={() => setIsModalOpen(false)}
                        onEventCreated={handleEventCreated}
                        initialDate={selectedSlot?.date}
                        initialTime={selectedSlot?.time}
                    />
                </div>

                <TaskSidebar />
            </div>
        </DndContext>
    );
}
