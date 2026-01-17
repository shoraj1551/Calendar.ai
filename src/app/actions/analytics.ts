'use server'

import { AnalyticsService } from "@/services/analytics/metrics";
import { InsightsEngine } from "@/services/analytics/insights";
import { revalidatePath } from "next/cache";

export async function getWeeklyMetricsAction(
    userId: string,
    startDate: Date,
    endDate: Date
) {
    try {
        const metrics = await AnalyticsService.calculateWeeklyMetrics(userId, startDate, endDate);
        return { success: true, metrics };
    } catch (error: any) {
        console.error("[Analytics] Failed to fetch metrics:", error);
        return { success: false, error: "Failed to fetch metrics. Please try again." };
    }
}

export async function getInsightsAction(userId: string) {
    try {
        const insights = await InsightsEngine.generateInsights(userId);
        return { success: true, insights };
    } catch (error: any) {
        console.error("[Analytics] Failed to generate insights:", error);
        return { success: false, error: "Failed to generate insights. Please try again." };
    }
}
