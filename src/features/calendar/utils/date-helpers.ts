import { startOfWeek, endOfWeek, startOfMonth, endOfMonth, eachDayOfInterval, format, addMonths, subMonths, isSameMonth, isSameDay, isToday } from "date-fns";

export const getMonthDays = (date: Date) => {
    const monthStart = startOfMonth(date);
    const monthEnd = endOfMonth(date);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    return eachDayOfInterval({
        start: startDate,
        end: endDate,
    });
};

export const getWeekDays = (date: Date) => {
    const start = startOfWeek(date);
    const end = endOfWeek(date);
    return eachDayOfInterval({ start, end });
};

export const formatDate = (date: Date, formatStr: string) => format(date, formatStr);
