import { db } from "@/db";
import { events, userEnergyZones } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";
import { differenceInMinutes, startOfDay, endOfDay, addDays } from "date-fns";

export interface FocusSlot {
    start: Date;
    end: Date;
    duration: number; // minutes
    qualityScore: number; // 0-100
    energyLevel: 'high' | 'medium' | 'low';
    reason: string;
}

export class FocusSessionService {
    /**
     * Find optimal focus slots for the next N days
     */
    static async findOptimalFocusSlots(
        userId: string,
        daysAhead: number = 7,
        minDuration: number = 60 // minimum 1 hour
    ): Promise<FocusSlot[]> {
        const today = startOfDay(new Date());
        const endDate = endOfDay(addDays(today, daysAhead));

        // Get user's events
        const userEvents = await db.query.events.findMany({
            where: and(
                eq(events.userId, userId),
                gte(events.startTime, today),
                lte(events.endTime, endDate)
            ),
            orderBy: (events, { asc }) => [asc(events.startTime)]
        });

        // Get user's energy zones
        const energyZones = await db.query.userEnergyZones.findMany({
            where: eq(userEnergyZones.userId, userId)
        });

        // Find gaps in schedule
        const slots: FocusSlot[] = [];

        for (let day = 0; day < daysAhead; day++) {
            const currentDay = addDays(today, day);
            const dayStart = new Date(currentDay);
            dayStart.setHours(8, 0, 0, 0); // Start at 8 AM

            const dayEnd = new Date(currentDay);
            dayEnd.setHours(18, 0, 0, 0); // End at 6 PM

            const dayEvents = userEvents.filter(e =>
                e.startTime >= dayStart && e.endTime <= dayEnd
            );

            // Find gaps between events
            let currentTime = dayStart;

            for (const event of dayEvents) {
                const gapMinutes = differenceInMinutes(event.startTime, currentTime);

                if (gapMinutes >= minDuration) {
                    const slot = this.createFocusSlot(
                        currentTime,
                        event.startTime,
                        energyZones
                    );
                    if (slot) slots.push(slot);
                }

                currentTime = event.endTime;
            }

            // Check gap after last event
            const finalGap = differenceInMinutes(dayEnd, currentTime);
            if (finalGap >= minDuration) {
                const slot = this.createFocusSlot(
                    currentTime,
                    dayEnd,
                    energyZones
                );
                if (slot) slots.push(slot);
            }
        }

        // Sort by quality score (highest first)
        return slots
            .sort((a, b) => b.qualityScore - a.qualityScore)
            .slice(0, 10); // Return top 10 slots
    }

    /**
     * Create a focus slot with quality scoring
     */
    private static createFocusSlot(
        start: Date,
        end: Date,
        energyZones: any[]
    ): FocusSlot | null {
        const duration = differenceInMinutes(end, start);
        const hour = start.getHours();

        // Determine energy level for this time
        const energyZone = energyZones.find(z =>
            hour >= z.startHour && hour < z.endHour
        );
        const energyLevel = energyZone?.energyLevel || 'medium';

        // Calculate quality score
        let qualityScore = 50; // Base score

        // Bonus for high energy zones
        if (energyLevel === 'high') qualityScore += 30;
        else if (energyLevel === 'medium') qualityScore += 15;

        // Bonus for longer duration
        if (duration >= 120) qualityScore += 20; // 2+ hours
        else if (duration >= 90) qualityScore += 10; // 1.5+ hours

        // Bonus for morning slots (9 AM - 12 PM)
        if (hour >= 9 && hour < 12) qualityScore += 10;

        // Penalty for late afternoon (4 PM+)
        if (hour >= 16) qualityScore -= 10;

        const reason = this.generateReason(duration, energyLevel, hour);

        return {
            start,
            end,
            duration,
            qualityScore: Math.min(100, Math.max(0, qualityScore)),
            energyLevel,
            reason
        };
    }

    /**
     * Generate human-readable reason for slot quality
     */
    private static generateReason(
        duration: number,
        energyLevel: string,
        hour: number
    ): string {
        const reasons: string[] = [];

        if (energyLevel === 'high') {
            reasons.push('High energy zone');
        }

        if (duration >= 120) {
            reasons.push('Long uninterrupted block');
        }

        if (hour >= 9 && hour < 12) {
            reasons.push('Optimal morning time');
        }

        return reasons.join(' • ') || 'Available slot';
    }
}
