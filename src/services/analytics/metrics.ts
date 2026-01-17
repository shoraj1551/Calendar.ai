import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { differenceInMinutes, startOfDay, endOfDay, eachDayOfInterval } from "date-fns";
import { UnifiedEvent } from "../calendar/types";

export interface WeeklyMetrics {
    totalHours: number;
    byCategory: Record<string, number>; // hours per category
    meetingLoad: number; // percentage of time in meetings
    focusBlocks: number; // count of uninterrupted 60+ min blocks
    averageMeetingDuration: number;
    dailyBreakdown: Array<{
        date: string;
        work: number;
        meetings: number;
        focus: number;
        personal: number;
    }>;
}

export interface EnergyAlignment {
    highEnergyUtilization: number; // % of high-energy time used
    lowEnergyMeetings: number; // count of meetings during low energy
    optimalScheduling: number; // 0-100 score
}

export interface FocusMetrics {
    totalFocusTime: number; // hours
    averageBlockDuration: number; // minutes
    longestBlock: number; // minutes
    fragmentedTime: number; // hours in blocks <30 min
}

export class AnalyticsService {
    /**
     * Calculate weekly metrics from calendar events
     */
    static async calculateWeeklyMetrics(
        userId: string,
        startDate: Date,
        endDate: Date
    ): Promise<WeeklyMetrics> {
        const userEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, userId),
                gte(events.startTime, startDate),
                lte(events.endTime, endDate)
            )
        });

        const unifiedEvents = userEvents.map(e => ({
            ...e,
            start: e.startTime,
            end: e.endTime
        } as UnifiedEvent));

        // Calculate total hours
        const totalMinutes = unifiedEvents.reduce((sum, e) =>
            sum + differenceInMinutes(e.end, e.start), 0
        );
        const totalHours = totalMinutes / 60;

        // Group by category
        const byCategory: Record<string, number> = {};
        unifiedEvents.forEach(e => {
            const minutes = differenceInMinutes(e.end, e.start);
            const hours = minutes / 60;
            byCategory[e.type] = (byCategory[e.type] || 0) + hours;
        });

        // Calculate meeting load
        const meetingMinutes = unifiedEvents
            .filter(e => e.type === 'work' && e.title.toLowerCase().includes('meeting'))
            .reduce((sum, e) => sum + differenceInMinutes(e.end, e.start), 0);
        const meetingLoad = totalMinutes > 0 ? (meetingMinutes / totalMinutes) * 100 : 0;

        // Count focus blocks (gaps >= 60 minutes)
        const focusBlocks = this.calculateFocusBlocks(unifiedEvents);

        // Average meeting duration
        const meetings = unifiedEvents.filter(e => e.type === 'work');
        const avgMeetingDuration = meetings.length > 0
            ? meetings.reduce((sum, e) => sum + differenceInMinutes(e.end, e.start), 0) / meetings.length
            : 0;

        // Daily breakdown
        const days = eachDayOfInterval({ start: startDate, end: endDate });
        const dailyBreakdown = days.map(day => {
            const dayEvents = unifiedEvents.filter(e =>
                e.start >= startOfDay(day) && e.end <= endOfDay(day)
            );

            return {
                date: day.toISOString().split('T')[0],
                work: this.sumHoursByType(dayEvents, 'work'),
                meetings: this.sumHoursByType(dayEvents, 'work') * 0.6, // Estimate
                focus: this.sumHoursByType(dayEvents, 'focus'),
                personal: this.sumHoursByType(dayEvents, 'personal'),
            };
        });

        return {
            totalHours,
            byCategory,
            meetingLoad,
            focusBlocks,
            averageMeetingDuration,
            dailyBreakdown
        };
    }

    /**
     * Calculate focus time metrics
     */
    static calculateFocusTime(events: UnifiedEvent[]): FocusMetrics {
        // Sort events by start time
        const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

        const focusBlocks: number[] = [];

        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = differenceInMinutes(sorted[i + 1].start, sorted[i].end);
            if (gap >= 30) {
                focusBlocks.push(gap);
            }
        }

        const totalFocusMinutes = focusBlocks.reduce((sum, b) => sum + b, 0);
        const longBlocks = focusBlocks.filter(b => b >= 60);
        const fragmentedBlocks = focusBlocks.filter(b => b < 30);

        return {
            totalFocusTime: totalFocusMinutes / 60,
            averageBlockDuration: focusBlocks.length > 0
                ? focusBlocks.reduce((sum, b) => sum + b, 0) / focusBlocks.length
                : 0,
            longestBlock: focusBlocks.length > 0 ? Math.max(...focusBlocks) : 0,
            fragmentedTime: fragmentedBlocks.reduce((sum, b) => sum + b, 0) / 60
        };
    }

    /**
     * Helper: Calculate focus blocks
     */
    private static calculateFocusBlocks(events: UnifiedEvent[]): number {
        const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
        let count = 0;

        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = differenceInMinutes(sorted[i + 1].start, sorted[i].end);
            if (gap >= 60) count++;
        }

        return count;
    }

    /**
     * Helper: Sum hours by event type
     */
    private static sumHoursByType(events: UnifiedEvent[], type: string): number {
        return events
            .filter(e => e.type === type)
            .reduce((sum, e) => sum + differenceInMinutes(e.end, e.start), 0) / 60;
    }
}
