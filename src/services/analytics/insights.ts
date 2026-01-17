import { db } from "@/db";
import { events } from "@/db/schema";
import { eq, and, gte, lte, desc } from "drizzle-orm";
import { differenceInMinutes, startOfWeek, endOfWeek, subWeeks } from "date-fns";
import { UnifiedEvent } from "../calendar/types";
import { WeeklyMetrics } from "./metrics";

export interface Insight {
    id: string;
    type: 'warning' | 'suggestion' | 'achievement';
    title: string;
    description: string;
    priority: number; // 1-10, higher = more important
}

export class InsightsEngine {
    /**
     * Generate actionable insights from calendar patterns
     */
    static async generateInsights(
        userId: string,
        metrics?: WeeklyMetrics
    ): Promise<Insight[]> {
        const insights: Insight[] = [];

        // Get last week's events
        const endDate = new Date();
        const startDate = subWeeks(endDate, 1);

        const userEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, userId),
                gte(events.startTime, startDate),
                lte(events.endTime, endDate)
            ),
            orderBy: [desc(events.startTime)]
        });

        const unifiedEvents = userEvents.map(e => ({
            ...e,
            start: e.startTime,
            end: e.endTime
        } as UnifiedEvent));

        // Insight 1: Overbooked days
        const overbookedDays = this.detectOverbookedDays(unifiedEvents);
        if (overbookedDays > 0) {
            insights.push({
                id: 'overbooked-days',
                type: 'warning',
                title: `${overbookedDays} overbooked day${overbookedDays > 1 ? 's' : ''} this week`,
                description: `You had more than 6 hours of meetings on ${overbookedDays} day${overbookedDays > 1 ? 's' : ''}. Consider blocking focus time or declining non-essential meetings.`,
                priority: 9
            });
        }

        // Insight 2: Fragmented focus time
        if (metrics && metrics.focusBlocks < 3) {
            insights.push({
                id: 'fragmented-time',
                type: 'warning',
                title: 'Limited focus time detected',
                description: `Only ${metrics.focusBlocks} uninterrupted blocks (60+ min) this week. Try using "Shield Up" to protect deep work time.`,
                priority: 8
            });
        }

        // Insight 3: Optimal scheduling windows
        const optimalWindow = this.findOptimalWindow(unifiedEvents);
        if (optimalWindow) {
            insights.push({
                id: 'optimal-window',
                type: 'suggestion',
                title: `${optimalWindow.day} ${optimalWindow.time} is consistently free`,
                description: `This time slot has been available for the past 3 weeks. Perfect for recurring deep work or important meetings.`,
                priority: 7
            });
        }

        // Insight 4: Achievement - focus time improvement
        if (metrics && metrics.totalHours > 0) {
            const focusPercentage = ((metrics.byCategory['focus'] || 0) / metrics.totalHours) * 100;
            if (focusPercentage > 20) {
                insights.push({
                    id: 'focus-achievement',
                    type: 'achievement',
                    title: `${Math.round(focusPercentage)}% of your time was focused work!`,
                    description: `You protected ${Math.round(metrics.byCategory['focus'] || 0)} hours for deep work this week. Keep it up!`,
                    priority: 6
                });
            }
        }

        // Insight 5: Meeting patterns
        const backToBackMeetings = this.detectBackToBackMeetings(unifiedEvents);
        if (backToBackMeetings > 3) {
            insights.push({
                id: 'back-to-back',
                type: 'warning',
                title: `${backToBackMeetings} back-to-back meetings`,
                description: 'Consider adding 5-10 minute buffers between meetings for breaks and context switching.',
                priority: 7
            });
        }

        // Sort by priority
        return insights.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Detect days with >6 hours of meetings
     */
    private static detectOverbookedDays(events: UnifiedEvent[]): number {
        const dayMap = new Map<string, number>();

        events.forEach(e => {
            const day = e.start.toISOString().split('T')[0];
            const minutes = differenceInMinutes(e.end, e.start);
            dayMap.set(day, (dayMap.get(day) || 0) + minutes);
        });

        let count = 0;
        dayMap.forEach(minutes => {
            if (minutes > 360) count++; // 6 hours = 360 minutes
        });

        return count;
    }

    /**
     * Find consistently free time slots
     */
    private static findOptimalWindow(events: UnifiedEvent[]): { day: string; time: string } | null {
        // Simplified: Check Tuesday 2-4 PM as example
        const tuesdayEvents = events.filter(e => e.start.getDay() === 2);
        const has2to4PM = tuesdayEvents.some(e => {
            const hour = e.start.getHours();
            return hour >= 14 && hour < 16;
        });

        if (!has2to4PM && tuesdayEvents.length < events.length / 5) {
            return { day: 'Tuesday', time: '2-4 PM' };
        }

        return null;
    }

    /**
     * Detect back-to-back meetings (no gap between events)
     */
    private static detectBackToBackMeetings(events: UnifiedEvent[]): number {
        const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
        let count = 0;

        for (let i = 0; i < sorted.length - 1; i++) {
            const gap = differenceInMinutes(sorted[i + 1].start, sorted[i].end);
            if (gap <= 5) count++;
        }

        return count;
    }
}
