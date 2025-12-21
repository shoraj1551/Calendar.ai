"use client";

import { useState } from "react";
import { addMonths, subMonths, addWeeks, subWeeks, addDays, subDays } from "date-fns";
import { CalendarHeader, type CalendarViewType } from "./calendar-header";
import { MonthView } from "./month-view";
import { WeekView } from "./week-view";
import { useCalendarEvents } from "../hooks/use-calendar-events";

export function CalendarView() {
    const [currentDate, setCurrentDate] = useState(new Date());
    const [view, setView] = useState<CalendarViewType>("month");
    const { events, loading } = useCalendarEvents();

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

    return (
        <div className="flex h-screen flex-col overflow-hidden bg-background">
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
                )}    {view === "day" && <div className="flex items-center justify-center h-full text-muted-foreground">Day View Coming Soon</div>}
            </div>
        </div>
    );
}
