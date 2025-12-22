
import { DayMetrics } from "./types";
import { format } from "date-fns";

export interface GentleDayInsight {
    date: string;
    loadState: "Balanced" | "Heavy" | "Light";
    focusState: "Good Flow" | "Fragmented" | "Scattered";
    recoveryState: "Recharged" | "Needs Break" | "Neutral";
    message: string;
}

export interface GentleTrend {
    type: "praise" | "nudge";
    title: string;
    description: string;
}

export interface GentleAnalysisResult {
    dailyInsights: GentleDayInsight[];
    trends: GentleTrend[];
    summary: string;
}

export const GentleAnalyticsService = {
    /**
     * Transforms raw metrics into a gentle, non-judgmental report.
     */
    analyzeGentle(metrics: DayMetrics[]): GentleAnalysisResult {
        const dailyInsights: GentleDayInsight[] = metrics.map(day => {
            // 1. Load State (Bio-Cost)
            let loadState: GentleDayInsight["loadState"] = "Balanced";
            if (day.overloadScore > 70) loadState = "Heavy";
            else if (day.overloadScore < 30) loadState = "Light";

            // 2. Focus State (Cognitive Flow)
            let focusState: GentleDayInsight["focusState"] = "Good Flow";
            if (day.fragmentationScore > 60) focusState = "Scattered";
            else if (day.fragmentationScore > 40) focusState = "Fragmented";

            // 3. Recovery State
            let recoveryState: GentleDayInsight["recoveryState"] = "Neutral";
            if (!day.lunchBreak && day.totalMeetingMinutes > 240) recoveryState = "Needs Break";
            else if (day.lunchBreak) recoveryState = "Recharged";

            // 4. Construct Message
            let message = "A balanced day.";
            if (loadState === "Heavy") {
                message = "You carried a heavy load. Prioritize rest this evening.";
            } else if (focusState === "Scattered") {
                message = "Your schedule was a bit choppy. Grouping meetings might help flow.";
            } else if (recoveryState === "Needs Break") {
                message = "It looks like you missed lunch. Fuel is vital for sustained energy.";
            } else if (loadState === "Light") {
                message = "A lighter day. Ideally, you found time for deep work or learning.";
            }

            return {
                date: format(day.date, "yyyy-MM-dd"),
                loadState,
                focusState,
                recoveryState,
                message
            };
        });

        // 5. Identify Trends
        const trends: GentleTrend[] = [];

        // Trend: Chronic Overload
        const heavyDays = dailyInsights.filter(d => d.loadState === "Heavy").length;
        if (heavyDays >= 3) {
            trends.push({
                type: "nudge",
                title: "High Octane Week",
                description: `You've had ${heavyDays} heavy days recently. Ensure you have a lighter day planned soon to recover.`
            });
        }

        // Trend: Consistent Lunch
        const lunchDays = activeDays(metrics).filter(d => d.lunchBreak).length;
        if (lunchDays >= 4) {
            trends.push({
                type: "praise",
                title: "Fueling Success",
                description: "Great job consistently taking lunch breaks. It fuels your afternoon focus."
            });
        }

        // Summary
        const summary = heavyDays > 2
            ? "This period has been demanding. Be kind to yourself and prioritize recovery."
            : "You're maintaining a sustainable rhythm. Keep listening to your energy needs.";

        return {
            dailyInsights,
            trends,
            summary
        };
    }
};

function activeDays(metrics: DayMetrics[]) {
    return metrics.filter(d => d.meetingCount > 0);
}
