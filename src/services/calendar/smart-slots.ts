
import { EnergyService } from "./energy";
import { UnifiedEvent } from "./types";
import { areIntervalsOverlapping, differenceInMinutes, addMinutes } from "date-fns";

export interface SmartSlot {
    start: Date;
    end: Date;
    score: number; // 0-100 likelihood of being a good slot
    reason: string;
}

export class SmartSlotService {
    /**
     * Finds "High Focus" opportunities in the user's High Energy zones
     * that do not conflict with existing events.
     */
    static findFocusSlots(date: Date, events: UnifiedEvent[], chronotype = 'bear'): SmartSlot[] {
        // 1. Get High Energy Zones
        const zones = EnergyService.getZonesForDay(date, chronotype as any);
        const peakZones = zones.filter(z => z.level === 'high');

        const suggestions: SmartSlot[] = [];

        // 2. Intersect High Energy Zones with Free Time
        for (const zone of peakZones) {
            // Start with the full zone as a candidate slot
            let currentSlotStart = zone.start;
            const zoneEnd = zone.end;

            // Sort events by start time to process sequentially
            const sortedEvents = events
                .filter(e => areIntervalsOverlapping(
                    { start: e.start, end: e.end },
                    { start: zone.start, end: zone.end }
                ))
                .sort((a, b) => a.start.getTime() - b.start.getTime());

            if (sortedEvents.length === 0) {
                // Entire zone is free!
                suggestions.push({
                    start: zone.start,
                    end: zone.end,
                    score: 95,
                    reason: "Perfect 100% Focus Block available during your peak energy."
                });
                continue;
            }

            // check gaps between zoneStart -> event1 -> event2 -> zoneEnd
            for (const event of sortedEvents) {
                // Gap before this event?
                const gapDuration = differenceInMinutes(event.start, currentSlotStart);

                if (gapDuration >= 30) {
                    suggestions.push({
                        start: currentSlotStart,
                        end: event.start,
                        score: 80,
                        reason: `Free ${gapDuration}m block in your high energy zone.`
                    });
                }

                // Move pointer to end of this event (if it pushes past current pointer)
                if (event.end > currentSlotStart) {
                    currentSlotStart = event.end;
                }
            }

            // Gap after last event?
            const finalGap = differenceInMinutes(zoneEnd, currentSlotStart);
            if (finalGap >= 30) {
                suggestions.push({
                    start: currentSlotStart,
                    end: zoneEnd,
                    score: 85,
                    reason: `Free ${finalGap}m block at the end of your peak window.`
                });
            }
        }

        return suggestions;
    }
}
