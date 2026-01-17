import { db } from "@/db";
import { events, tasks, userEnergyZones } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { format, startOfDay, endOfDay } from "date-fns";

export class CalendarContextBuilder {
    /**
     * Build context for a specific day
     */
    static async buildDayContext(userId: string, date: Date): Promise<string> {
        const dayStart = startOfDay(date);
        const dayEnd = endOfDay(date);

        // Get events for the day
        const dayEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, userId),
                gte(events.startTime, dayStart),
                lte(events.endTime, dayEnd)
            ),
            orderBy: (events, { asc }) => [asc(events.startTime)]
        });

        // Get pending tasks
        const userTasks = await db.query.tasks.findMany({
            where: and(
                eq(tasks.userId, userId),
                eq(tasks.status, 'todo')
            ),
            limit: 10
        });

        // Get energy zones
        const energyZones = await db.query.userEnergyZones.findMany({
            where: eq(userEnergyZones.userId, userId)
        });

        // Format events
        const eventsList = dayEvents.length > 0
            ? dayEvents.map(e =>
                `- ${format(e.startTime, 'h:mm a')}-${format(e.endTime, 'h:mm a')}: ${e.title}${e.description ? ` (${e.description})` : ''}`
            ).join('\n')
            : '- No events scheduled';

        // Format energy zones
        const highEnergyZones = energyZones
            .filter(z => z.energyLevel === 'high')
            .map(z => `${z.startHour}:00-${z.endHour}:00`)
            .join(', ') || 'Not configured';

        const lowEnergyZones = energyZones
            .filter(z => z.energyLevel === 'low')
            .map(z => `${z.startHour}:00-${z.endHour}:00`)
            .join(', ') || 'Not configured';

        // Format tasks
        const tasksList = userTasks.length > 0
            ? userTasks.slice(0, 5).map(t =>
                `- ${t.title}${t.estimatedDuration ? ` (${t.estimatedDuration} min)` : ''}`
            ).join('\n')
            : '- No pending tasks';

        return `
Today is ${format(date, 'EEEE, MMMM d, yyyy')}.

Your Schedule:
${eventsList}

Energy Zones:
- High Energy: ${highEnergyZones}
- Low Energy: ${lowEnergyZones}

Pending Tasks (${userTasks.length} total):
${tasksList}
${userTasks.length > 5 ? `... and ${userTasks.length - 5} more` : ''}
        `.trim();
    }

    /**
     * Build context for a week
     */
    static async buildWeekContext(userId: string, startDate: Date, endDate: Date): Promise<string> {
        const weekEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, userId),
                gte(events.startTime, startDate),
                lte(events.endTime, endDate)
            ),
            orderBy: (events, { asc }) => [asc(events.startTime)]
        });

        // Group by day
        const dayGroups = new Map<string, typeof weekEvents>();
        weekEvents.forEach(e => {
            const day = format(e.startTime, 'EEEE');
            if (!dayGroups.has(day)) {
                dayGroups.set(day, []);
            }
            dayGroups.get(day)!.push(e);
        });

        const weekSummary = Array.from(dayGroups.entries())
            .map(([day, events]) => {
                const count = events.length;
                const totalMinutes = events.reduce((sum, e) =>
                    sum + (e.endTime.getTime() - e.startTime.getTime()) / 60000, 0
                );
                const hours = Math.round(totalMinutes / 60 * 10) / 10;
                return `- ${day}: ${count} events, ${hours} hours`;
            })
            .join('\n');

        return `
Week of ${format(startDate, 'MMM d')} - ${format(endDate, 'MMM d, yyyy')}

Weekly Summary:
${weekSummary || '- No events this week'}

Total Events: ${weekEvents.length}
        `.trim();
    }
}
