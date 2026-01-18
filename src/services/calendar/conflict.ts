import { db } from "@/db";
import { userSettings, events as eventsTable } from "@/db/schema";
import { eq, and, gte, lte, or, ne } from "drizzle-orm";
import { areIntervalsOverlapping, isSameDay } from "date-fns";
import { BlockGenerator } from "./blocks";

interface ValidationResult {
    valid: boolean;
    conflictReason?: string;
    isHardBlock?: boolean;
}

export const ConflictService = {
    /**
     * Validates if an event time conflicts with any protected "Hard Blocks".
     * 
     * @param userId The ID of the user creating the event.
     * @param start Event start time
     * @param end Event end time
     * @returns detailed validation result
     */
    async validateEventTime(userId: string, start: Date, end: Date, isUrgent: boolean = false): Promise<ValidationResult> {
        // 1. Fetch User Preferences
        const settingsRec = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        const prefs = settingsRec[0] || {};
        const ignoredHolidays: string[] = []; // Field doesn't exist in schema

        // 2. Generate Synthetic Blocks (Holidays/Lunch)
        const syntheticBlocks = BlockGenerator.generateBlocksForDay(start, {
            lunch: false, // Lunch feature disabled for now
            workStart: `${prefs.workingHoursStart || 9}:00`,
            workEnd: `${prefs.workingHoursEnd || 17}:00`
        }, ignoredHolidays);

        // 3. Fetch Existing DB Blocks (Focus/Recovery/Social/LifeEvent)
        // We only care about blocks that intersect with the new event
        const dbBlocks = await db.select().from(eventsTable).where(
            and(
                eq(eventsTable.userId, userId),
                lte(eventsTable.startTime, end),
                gte(eventsTable.endTime, start),
                or(
                    eq(eventsTable.type, 'focus'),
                    eq(eventsTable.type, 'recovery'),
                    eq(eventsTable.type, 'social'),
                    eq(eventsTable.type, 'life_event'),
                    eq(eventsTable.type, 'holiday') // In case we start storing holidays in DB too
                ),
                ne(eventsTable.status, 'cancelled')
            )
        );

        // Map DB blocks to UnifiedEvent-like structure for uniform checking
        const mappedDbBlocks = dbBlocks.map(e => ({
            id: e.id,
            title: e.title,
            start: e.startTime,
            end: e.endTime,
            type: e.type,
            isUrgent: e.isUrgent
        }));

        const allBlocks = [...syntheticBlocks, ...mappedDbBlocks];

        // 4. Check for Intersections
        for (const block of allBlocks) {
            // Re-check overlap just to be sure (DB query is inclusive)
            const isOverlapping = areIntervalsOverlapping(
                { start, end },
                { start: block.start, end: block.end }
            );

            if (isOverlapping) {
                // Determine Block Type
                const hardTypes = ["holiday", "life_event", "lunch"];
                const softTypes = ["focus", "recovery", "social"];

                // @ts-ignore
                const isHard = hardTypes.includes(block.type);
                // @ts-ignore
                const isSoft = softTypes.includes(block.type);

                if (isHard) {
                    return {
                        valid: false,
                        conflictReason: `Hard Block: Time is protected for '${block.title}'. Cannot schedule.`,
                        isHardBlock: true
                    };
                }

                if (isSoft) {
                    if (isUrgent) {
                        // Allow override
                        continue;
                    } else {
                        return {
                            valid: false,
                            conflictReason: `Soft Block: Time is protected for '${block.title}'. Mark as 'Urgent' to override.`,
                            isHardBlock: false
                        };
                    }
                }
            }
        }

        return { valid: true };
    },
    /**
     * Validates if adding a meeting would overload the user's day.
     * Checks if total meeting time > 6 hours.
     */
    async validateDailyLoad(userId: string, date: Date, newDurationMinutes: number): Promise<{ overloaded: boolean; message?: string }> {
        // Define day range
        const dayStart = new Date(date); dayStart.setHours(0, 0, 0, 0);
        const dayEnd = new Date(date); dayEnd.setHours(23, 59, 59, 999);

        // Fetch existing events
        const events = await db.select().from(eventsTable).where(
            and(
                eq(eventsTable.userId, userId),
                gte(eventsTable.startTime, dayStart),
                lte(eventsTable.endTime, dayEnd),
                // Only count work-related events for load
                or(eq(eventsTable.type, 'work'), eq(eventsTable.type, 'focus'))
            )
        );

        let totalMinutes = 0;
        events.forEach(e => {
            if (e.status !== 'cancelled') {
                const dur = (e.endTime.getTime() - e.startTime.getTime()) / (1000 * 60);
                totalMinutes += dur;
            }
        });

        // Add new event duration
        const finalLoad = totalMinutes + newDurationMinutes;
        const DAILY_LIMIT_MINS = 360; // 6 hours

        if (finalLoad > DAILY_LIMIT_MINS) {
            return {
                overloaded: true,
                message: `This meeting pushes your day to ${(finalLoad / 60).toFixed(1)} hours of work. AI suggests declining or scheduling for later.`
            };
        }

        return { overloaded: false };
    }
};
