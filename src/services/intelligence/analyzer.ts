import { UnifiedEvent } from "../calendar/types";
import { DayMetrics } from "./types";
import { differenceInMinutes, isSameDay, eachDayOfInterval } from "date-fns";

// Define Settings Interface locally to avoid circular deps, or import if available
interface AnalysisSettings {
    workStart: string; // "09:00"
    workEnd: string; // "17:00"
    lunch?: boolean;
}

/**
 * analyzes a single day to calculate metrics.
 */
const analyzeDay = (date: Date, events: UnifiedEvent[], settings: AnalysisSettings): DayMetrics => {
    const dailyEvents = events.filter((e) => isSameDay(e.start, date)).sort((a, b) => a.start.getTime() - b.start.getTime());

    let totalMeetingMinutes = 0;
    let focusMinutes = 0;
    let longestFocusBlock = 0;

    // Parse Settings
    const [startH, startM] = settings.workStart.split(':').map(Number);
    const [endH, endM] = settings.workEnd.split(':').map(Number);

    // 1. Calculate Meeting Time
    dailyEvents.forEach((e) => {
        totalMeetingMinutes += differenceInMinutes(e.end, e.start);
    });

    // 2. Calculate Focus Time
    const dayStart = new Date(date); dayStart.setHours(startH, startM, 0, 0);
    const dayEnd = new Date(date); dayEnd.setHours(endH, endM, 0, 0);

    let lastEndTime = dayStart;

    // Add a dummy event at the end of the day to process the last gap
    const checkPoints = [...dailyEvents, { start: dayEnd, end: dayEnd } as UnifiedEvent];

    checkPoints.forEach((event) => {
        // Only consider events within work hours for gaps
        if (event.start < lastEndTime) {
            if (event.end > lastEndTime) lastEndTime = event.end;
            return;
        }

        // Calculate gap
        const gap = differenceInMinutes(event.start, lastEndTime);
        if (gap >= 30) {
            focusMinutes += gap;
            if (gap > longestFocusBlock) longestFocusBlock = gap;
        }

        if (event.end > lastEndTime) lastEndTime = event.end;
    });

    // 3. Late Work & Lunch & Fragmentation
    let lateWorkMinutes = 0;
    let hasLunch = false;
    let fragmentationScore = 0;

    // Lunch Window: Assuming 11:30 - 14:30 standard window for "Lunch" detection
    // Could eventually be configurable
    const lunchStart = new Date(date); lunchStart.setHours(11, 30, 0, 0);
    const lunchEnd = new Date(date); lunchEnd.setHours(14, 30, 0, 0);
    const workEnd = dayEnd; // Consistent with dayEnd above

    // Re-scan for new metrics
    lastEndTime = dayStart;
    checkPoints.forEach((event) => {
        // Late Work
        if (event.start >= workEnd) {
            lateWorkMinutes += differenceInMinutes(event.end, event.start);
        } else if (event.end > workEnd) {
            lateWorkMinutes += differenceInMinutes(event.end, workEnd);
        }

        // Gap Analysis
        if (event.start > lastEndTime) {
            const gapStart = lastEndTime;
            const gapEnd = event.start;
            const gapDuration = differenceInMinutes(gapEnd, gapStart);

            // Lunch Check (simplistic overlap)
            if (gapDuration >= 30) {
                if (gapStart >= lunchStart && gapEnd <= lunchEnd) {
                    hasLunch = true;
                } else if (gapStart < lunchStart && gapEnd > lunchStart) {
                    hasLunch = true; // Overlaps start
                }
            }

            // Fragmentation (many small gaps are bad)
            if (gapDuration < 30 && gapDuration > 5) {
                fragmentationScore += 10;
            }
        }
        if (event.end > lastEndTime) lastEndTime = event.end;
    });

    // 4. Enhanced Scoring
    let overloadScore = 0;
    const meetingHours = totalMeetingMinutes / 60;
    if (meetingHours > 4) overloadScore += (meetingHours - 4) * 20;
    if (focusMinutes < 120) overloadScore += (120 - focusMinutes) * 0.5;
    if (!hasLunch && totalMeetingMinutes > 240) overloadScore += 10;
    if (lateWorkMinutes > 0) overloadScore += 15;

    return {
        date,
        totalMeetingMinutes,
        focusMinutes,
        longestFocusBlock,
        meetingCount: dailyEvents.length,
        overloadScore: Math.min(100, Math.max(0, overloadScore)),
        fragmentationScore: Math.min(100, fragmentationScore),
        lateWorkMinutes,
        lunchBreak: hasLunch
    };
};

/**
 * Analyzes a range of dates.
 */
export const analyzeSchedule = (events: UnifiedEvent[], start: Date, end: Date, settings: AnalysisSettings = { workStart: "09:00", workEnd: "17:00" }): DayMetrics[] => {
    const days = eachDayOfInterval({ start, end });
    return days.map((day) => analyzeDay(day, events, settings));
};
