import { auth } from "@/auth";
import { getAggregatedEvents } from "@/services/calendar/service";
import { analyzeSchedule } from "@/services/intelligence/analyzer";
import { generateSuggestions } from "@/services/intelligence/scheduler";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.accessToken) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    try {
        const { start, end } = await req.json();
        const startDate = new Date(start);
        const endDate = new Date(end);

        // 1. Resolve User & Fetch real data
        const userId = await EventRepository.ensureUser(session.user.email!);
        const events = await getAggregatedEvents(session.accessToken as string, userId);

        // 2. Analyze
        const metrics = analyzeSchedule(events, startDate, endDate);

        // 3. Generate Suggestions
        const suggestions = generateSuggestions(metrics, events);

        // 4. Calculate Overall Health Score (Average of daily scores)
        const avgScore = metrics.reduce((acc, curr) => acc + curr.overloadScore, 0) / (metrics.length || 1);

        return NextResponse.json({
            metrics,
            suggestions,
            overallScore: Math.round(avgScore)
        });

    } catch (error) {
        console.error("Analysis API Error:", error);
        return NextResponse.json({ error: "Analysis failed" }, { status: 500 });
    }
}
