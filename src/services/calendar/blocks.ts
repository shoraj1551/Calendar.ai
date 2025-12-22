
// Force Recompile: 2025-12-22T17:42:00
import { UnifiedEvent } from "./types";
import { HolidayService } from "./holidays";
import { addDays, eachDayOfInterval, format, parse, setHours, setMinutes, isWeekend, startOfYear, endOfYear, isSameDay } from "date-fns";

interface BlockSettings {
    lunch?: boolean;
    workStart?: string;
    workEnd?: string;
}

export const BlockGenerator = {
    /**
     * Generates Lunch blocks based on user preferences.
     */
    generateLunchBlocks(
        rangeStart: Date,
        rangeEnd: Date,
        settings: { lunch?: boolean; workStart?: string; workEnd?: string }
    ): UnifiedEvent[] {
        if (settings.lunch === false) return [];

        const blocks: UnifiedEvent[] = [];
        const days = eachDayOfInterval({ start: rangeStart, end: rangeEnd });

        days.forEach(day => {
            if (isWeekend(day)) return; // Skip weekends for now

            // Lunch is typically 1pm - 2pm or 12pm - 1pm. 
            // We'll hardcode 13:00-13:45 for now, or make it configurable later.
            const start = new Date(day);
            start.setHours(13, 0, 0, 0); // 1:00 PM
            const end = new Date(day);
            end.setHours(13, 45, 0, 0); // 1:45 PM

            blocks.push({
                id: `lunch-${format(day, "yyyy-MM-dd")}`,
                title: "Lunch 🍱",
                start,
                end,
                allDay: false,
                provider: "local",
                status: "confirmed",
                type: "lunch",
                description: "Protected time for nourishment.",
            });
        });

        return blocks;
    },

    /**
     * Generates Holidays (Indian & Global Major).
     */
    /**
     * Generates Holidays (Indian & Global Major).
     */
    generateHolidays(year: number): UnifiedEvent[] {
        return HolidayService.getHolidays(year);
    },

    /**
     * Generates all synthetic blocks (Lunch, Holidays) for a specific single day.
     * Useful for conflict checking during event creation.
     */
    generateBlocksForDay(date: Date, settings: BlockSettings, ignoredHolidays: string[] = []): UnifiedEvent[] {
        const blocks: UnifiedEvent[] = [];
        const year = date.getFullYear();

        // 1. Holidays (Hard Blocks) - Filtered
        const holidays = this.generateHolidays(year).filter(h => !ignoredHolidays.includes(h.title));
        const todaysHoliday = holidays.find(h => isSameDay(h.start, date));

        if (todaysHoliday) {
            blocks.push(todaysHoliday);
            return blocks; // If it's a holiday, block the whole day? Or adding other blocks?
            // Usually if full day holiday, no need for lunch blocks etc.
        }

        // 2. Lunch Check
        if (settings.lunch !== false && !isWeekend(date)) {
            // Hardcoded 13:00 - 13:45 for consistency
            const start = new Date(date);
            start.setHours(13, 0, 0, 0);
            const end = new Date(date);
            end.setHours(13, 45, 0, 0);

            blocks.push({
                id: `lunch-${format(date, "yyyy-MM-dd")}`,
                title: "Lunch 🍱",
                start,
                end,
                allDay: false,
                provider: "local",
                status: "confirmed",
                type: "lunch",
                description: "Protected time for nourishment.",
            });
        }

        return blocks;
    }
};
