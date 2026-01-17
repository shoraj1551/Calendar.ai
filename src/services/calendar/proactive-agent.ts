
import { UnifiedEvent } from "./types";
import { EnergyService, EnergyZone } from "./energy";
import { areIntervalsOverlapping, differenceInMinutes, addMinutes } from "date-fns";
import { NotificationManager } from "@/services/notifications/manager";

export class ProactiveAgent {

    /**
     * Analyzes a day's schedule and schedules nudges/alerts for the user.
     */
    static async analyzeAndNudge(userId: string, date: Date, events: UnifiedEvent[], chronotype = 'bear') {
        const nudges = [];

        // 1. Energy Protection Nudges
        const peakZones = EnergyService.getZonesForDay(date, chronotype as any).filter(z => z.level === 'high');

        for (const zone of peakZones) {
            const conflicts = events.filter(e =>
                areIntervalsOverlapping(
                    { start: e.start, end: e.end },
                    { start: zone.start, end: zone.end }
                ) && e.type !== 'focus' && e.type !== 'work' // Assume 'work' might be urgent, but 'focus' is good
            );

            for (const conflict of conflicts) {
                // If a random 'social' or 'admin' meeting eats into peak focus
                if (differenceInMinutes(conflict.end, conflict.start) > 30) {
                    nudges.push({
                        type: 'nudge',
                        title: 'Protect Your Peak',
                        message: `"${conflict.title}" overlaps with your high energy window (${conflict.start.getHours()}:00). Can this be moved?`
                    });
                }
            }
        }

        // 2. Recovery Nudges (Back-to-Back Detection)
        // Sort by start time
        const sorted = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());
        let consecutiveMinutes = 0;
        let batchStart = sorted[0]?.start;

        for (let i = 0; i < sorted.length - 1; i++) {
            const current = sorted[i];
            const next = sorted[i + 1];
            const gap = differenceInMinutes(next.start, current.end);

            const duration = differenceInMinutes(current.end, current.start);
            consecutiveMinutes += duration;

            if (gap > 15) {
                // Break detected, reset
                consecutiveMinutes = 0;
                batchStart = next.start;
            } else {
                // Back-to-back
                if (consecutiveMinutes > 180) { // 3 hours
                    nudges.push({
                        type: 'nudge',
                        title: 'Recovery Risk',
                        message: `You have 3+ hours of back-to-back meetings starting at ${batchStart.getHours()}:00. Schedule a walk?`
                    });
                    consecutiveMinutes = 0; // Don't spam
                }
            }
        }

        // 3. Commit to DB (Mocking the DB call in this logic file, or actually calling it if strictly Execution)
        // For now, we return them or log them.
        return nudges;
    }
}
