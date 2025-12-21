import { UnifiedEvent } from "../calendar/types";
import { DayMetrics, Suggestion } from "./types";
import { addMinutes, format } from "date-fns";

/**
 * Generates suggestions based on daily metrics.
 */
export const generateSuggestions = (metrics: DayMetrics[], events: UnifiedEvent[]): Suggestion[] => {
    const suggestions: Suggestion[] = [];

    metrics.forEach((day) => {
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
            suggestions.push({
                id: `focus-${day.date.getTime()}`,
                type: "focus_block",
                title: "Defend Focus Time",
                description: `You barely have any focus time on ${format(day.date, "EEEE")}. Block 1h now?`,
                score: 80,
                action: { type: "create" }
            });
        }
        // 3. Protect Lunch
        if (!day.lunchBreak && day.meetingCount > 2) {
            suggestions.push({
                id: `lunch-${day.date.getTime()}`,
                type: "add_break",
                title: `No Lunch Detected on ${format(day.date, "EEEE")}`,
                description: "You have no break between 11:30 and 14:30. Block 30m?",
                score: 90,
                action: { type: "create" }
            });
        }

        // 4. Leave on Time
        if (day.lateWorkMinutes > 0) {
            suggestions.push({
                id: `late-${day.date.getTime()}`,
                type: "move_event",
                title: "Late Meetings Detected",
                description: `You have ${day.lateWorkMinutes}m of meetings after 5pm. Reschedule?`,
                score: 85,
                action: { type: "update" }
            });
        }

        // 5. Defrag
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
