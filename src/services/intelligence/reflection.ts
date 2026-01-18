
import { UnifiedEvent } from "../calendar/types";
import { differenceInMinutes, isSameDay, endOfWeek, eachDayOfInterval, isWeekend } from "date-fns";

export interface ReflectionInsight {
    type: "praise" | "nudge" | "alert";
    message: string;
    category: "balance" | "focus" | "recovery";
}

export interface DailyReflection {
    date: Date;
    metrics: {
        totalMeetingHours: number;
        focusHours: number;
        collaborationRatio: number; // 0-1 (1 = all meetings)
        fragmentationCount: number; // Number of gaps < 30m
        lunchTaken: boolean;
    };
    insights: ReflectionInsight[];
}

export interface WeeklySummary {
    period: {
        start: Date;
        end: Date;
    };
    totals: {
        meetings: number;
        focus: number;
        avgDailyMeetings: string;
    };
    primaryInsight: string;
}

export const ReflectionService = {
    /**
     * Analyzes a single day and generates a reflection.
     */
    analyzeDay(date: Date, events: UnifiedEvent[]): DailyReflection {
        const dayEvents = events.filter(e => isSameDay(e.start, date) && !e.allDay && e.type !== 'block');

        let totalMeetingMins = 0;
        let focusMins = 0; // Simplified for now: assume gaps > 60m are focus
        const gaps: number[] = [];
        let lunchTaken = false;

        // Sort events
        dayEvents.sort((a, b) => a.start.getTime() - b.start.getTime());

        // 1. Calculate Metrics
        dayEvents.forEach(e => {
            const dur = differenceInMinutes(e.end, e.start);
            totalMeetingMins += dur;

            // Simple Lunch Check
            if (e.type === 'lunch' || (e.title.toLowerCase().includes("lunch"))) {
                lunchTaken = true;
            }
        });

        // Calculate Focus & Fragmentation (Gaps)
        // Assume work day 9-5 for gap calculation baseline
        const workStart = new Date(date); workStart.setHours(9, 0, 0, 0);
        const workEnd = new Date(date); workEnd.setHours(17, 0, 0, 0);

        // Add pseudo-events for start/end of day to calculate gaps
        // This is a simplified fragmentation check
        let lastEnd = workStart;

        dayEvents.forEach(e => {
            if (e.start < lastEnd) {
                lastEnd = e.end > lastEnd ? e.end : lastEnd;
                return;
            }

            const gap = differenceInMinutes(e.start, lastEnd);
            if (gap > 0) {
                gaps.push(gap);
                if (gap >= 60) focusMins += gap;
            }
            lastEnd = e.end > lastEnd ? e.end : lastEnd;
        });

        // Final gap
        const finalGap = differenceInMinutes(workEnd, lastEnd);
        if (finalGap > 0) {
            gaps.push(finalGap);
            if (finalGap >= 60) focusMins += finalGap;
        }

        const fragmentationCount = gaps.filter(g => g > 0 && g < 45).length;
        const totalWorkMins = 480; // 8 hours
        const collabRatio = totalMeetingMins / totalWorkMins;

        // 2. Generate Insights
        const insights: ReflectionInsight[] = [];

        // Insight: Meeting Load
        if (totalMeetingMins > 300) { // > 5 hours
            insights.push({
                type: "alert",
                category: "balance",
                message: `You carried a heavy load today (${(totalMeetingMins / 60).toFixed(1)}h meetings). Prioritize tasks that refuel you tomorrow.`
            });
        } else if (totalMeetingMins < 120) {
            insights.push({
                type: "praise",
                category: "focus",
                message: "You had plenty of heads-down time today. Hopefully, you made good progress on your core work."
            });
        }

        // Insight: Fragmentation
        if (fragmentationCount > 3) {
            insights.push({
                type: "nudge",
                category: "focus",
                message: "Your day felt a bit choppy with frequent context switching. Try grouping meetings to save mental energy."
            });
        }

        // Insight: Lunch
        if (!lunchTaken) {
            insights.push({
                type: "nudge",
                category: "recovery",
                message: "It looks like you didn't block time for lunch. Even 20 minutes away from the screen helps maintain focus."
            });
        }

        return {
            date,
            metrics: {
                totalMeetingHours: parseFloat((totalMeetingMins / 60).toFixed(1)),
                focusHours: parseFloat((focusMins / 60).toFixed(1)),
                collaborationRatio: parseFloat(collabRatio.toFixed(2)),
                fragmentationCount,
                lunchTaken
            },
            insights
        };
    },

    /**
     * Generates a weekly summary.
     */
    analyzeWeek(weekStart: Date, events: UnifiedEvent[]): WeeklySummary {
        const days = eachDayOfInterval({ start: weekStart, end: endOfWeek(weekStart) });
        const reflections = days.map(d => this.analyzeDay(d, events));

        // Aggregate
        const totalMeetings = reflections.reduce((acc, r) => acc + r.metrics.totalMeetingHours, 0);
        const totalFocus = reflections.reduce((acc, r) => acc + r.metrics.focusHours, 0);
        const activeDays = reflections.filter(r => !isWeekend(r.date)).length;

        return {
            period: { start: weekStart, end: endOfWeek(weekStart) },
            totals: {
                meetings: totalMeetings,
                focus: totalFocus,
                avgDailyMeetings: (totalMeetings / (activeDays || 1)).toFixed(1) + "h"
            },
            primaryInsight: totalMeetings > 20
                ? "This was a highly collaborative week. Ensure next week has some protected time."
                : "Good balance of focus and collaboration this week."
        };
    }
};
