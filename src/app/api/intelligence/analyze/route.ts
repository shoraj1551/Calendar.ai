import { auth } from "@/auth";
import { getAggregatedEvents } from "@/services/calendar/service";
import { analyzeSchedule } from "@/services/intelligence/analyzer";
import { generateSuggestions } from "@/services/intelligence/scheduler";
import { GentleAnalyticsService } from "@/services/intelligence/gentle-analytics";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";
import { db } from "@/db";
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { start, end } = await req.json();
        const startDate = new Date(start);
        const endDate = new Date(end);

        // 1. Resolve User & Fetch real data
        const userId = await EventRepository.ensureUser(session.user.email!);
        const events = await getAggregatedEvents(session.accessToken as string, userId);

        // 2. Fetch User Settings
        const settingsRecord = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        const prefs = settingsRecord[0] || {};

        const analysisSettings = {
            workStart: prefs.workStart || "09:00",
            workEnd: prefs.workEnd || "17:00",
            lunch: prefs.lunch !== false
        };

        // 3. Analyze
        const metrics = analyzeSchedule(events, startDate, endDate, analysisSettings);

        // 4. Generate Suggestions
        const suggestions = generateSuggestions(metrics, events, analysisSettings);

        // 5. Calculate Overall Health Score (Average of daily scores)
        const avgScore = metrics.reduce((acc, curr) => acc + curr.overloadScore, 0) / (metrics.length || 1);

        // 6. Generate Gentle Analysis (Non-Judgmental)
        const gentleAnalysis = GentleAnalyticsService.analyzeGentle(metrics);

        return NextResponse.json({
            metrics, // Keeping for backward compatibility if needed, but UI should prefer gentleAnalysis
            suggestions,
            overallScore: Math.round(avgScore),
            gentleAnalysis
        });

    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
