import { UnifiedEvent } from "../calendar/types";
import { DayMetrics, Suggestion } from "./types";
import { format } from "date-fns";

interface AnalysisSettings {
    workStart: string;
    workEnd: string;
    lunch?: boolean;
}

/**
 * Generates suggestions based on daily metrics.
 */

interface EnergyZone {
    start: string; // "09:00"
    end: string;   // "11:00"
    level: "high" | "medium" | "low" | "drain";
}

/**
 * Generates suggestions based on daily metrics.
 */
export const generateSuggestions = (
    metrics: DayMetrics[],
    events: UnifiedEvent[],
    settings: AnalysisSettings = { workStart: "09:00", workEnd: "17:00" },
    energyZones: EnergyZone[] = []
): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    metrics.forEach((day) => {
        const dayStr = format(day.date, "yyyy-MM-dd");

        // 1. Suggest Breaks for High Overload
        if (day.overloadScore > 70) {
            suggestions.push({
                id: `break-${day.date.getTime()}`,
                type: "add_break",
                title: `Take a break on ${format(day.date, "EEEE")}`,
                description: `You have ${Math.round(day.totalMeetingMinutes / 60)} hours of meetings. Consider blocking 15m for a walk.`,
                score: day.overloadScore,
                action: { type: "create" }
            });
        }

        // 2. Protect Focus Time if missing
        if (day.focusMinutes < 60 && day.meetingCount > 0) {
            // Smart Focus: Check if we have a High Energy zone
            const highEnergyZone = energyZones.find(z => z.level === "high");
            const focusTimeMsg = highEnergyZone
                ? `You missed your peak energy window (${highEnergyZone.start}-${highEnergyZone.end}). Block it out next time?`
                : `You barely have any focus time on ${format(day.date, "EEEE")}. Block 1h now?`;

            suggestions.push({
                id: `focus-${day.date.getTime()}`,
                type: "focus_block",
                title: "Defend Focus Time",
                description: focusTimeMsg,
                score: 80,
                // Proposed start time logic would go here in a real implementation
                action: { type: "create" }
            });
        }

        // 3. Energy Mismatch Check (New)
        // Find meetings in High Energy Zones
        const dailyEvents = events.filter(e => format(e.start, "yyyy-MM-dd") === dayStr && !e.allDay && e.type !== 'block');

        dailyEvents.forEach(e => {
            const startH = e.start.getHours();
            const startM = e.start.getMinutes();
            const timeVal = startH * 60 + startM;

            energyZones.forEach(zone => {
                if (zone.level === 'high') {
                    const [zStartH, zStartM] = zone.start.split(':').map(Number);
                    const [zEndH, zEndM] = zone.end.split(':').map(Number);
                    const zStartVal = zStartH * 60 + zStartM;
                    const zEndVal = zEndH * 60 + zEndM;

                    // If event starts during high energy zone
                    if (timeVal >= zStartVal && timeVal < zEndVal) {
                        suggestions.push({
                            id: `energy-mismatch-${e.id}`,
                            type: "move_event",
                            title: "Protect Peak Energy",
                            description: `"${e.title}" is in your high energy window (${zone.start}-${zone.end}). Move to afternoon?`,
                            score: 75,
                            reason: "High Energy Zone Protection",
                            action: { type: "update", targetEventId: e.id }
                        });
                    }
                }
            });
        });

        // 4. Protect Lunch
        if (settings.lunch !== false && !day.lunchBreak && (day.meetingCount > 2 || day.totalMeetingMinutes > 240)) {
            suggestions.push({
                id: `lunch-${day.date.getTime()}`,
                type: "add_break",
                title: `No Lunch Detected on ${format(day.date, "EEEE")}`,
                description: "You have no break between 11:30 and 14:30. Block 30m?",
                score: 90,
                action: { type: "create" }
            });
        }

        // 5. Leave on Time
        if (day.lateWorkMinutes > 0) {
            const displayEnd = settings.workEnd; // e.g. "18:00"
            suggestions.push({
                id: `late-${day.date.getTime()}`,
                type: "move_event",
                title: "Late Meetings Detected",
                description: `You have ${day.lateWorkMinutes}m of meetings after ${displayEnd}. Reschedule?`,
                score: 85,
                action: { type: "update" }
            });
        }

        // 6. Defrag
        if (day.fragmentationScore > 50) {
            suggestions.push({
                id: `defrag-${day.date.getTime()}`,
                type: "move_event",
                title: "Fragmented Schedule",
                description: "You have many small gaps. Consolidate meetings to unlock focus time?",
                score: 60,
                action: { type: "update" }
            });
        }
    });

    return suggestions.sort((a, b) => b.score - a.score);
};
