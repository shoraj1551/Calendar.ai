
import { GentleAnalyticsService } from "../src/services/intelligence/gentle-analytics";
import { DayMetrics } from "../src/services/intelligence/types";

const run = () => {
    console.log("🧘 Testing Gentle Personal Time Analytics...");

    // Mock "Bad" Data (High Overload, No Lunch)
    const mockMetrics: DayMetrics[] = [
        {
            date: new Date("2025-10-20"),
            totalMeetingMinutes: 480, // 8 hours
            meetingCount: 8,
            focusMinutes: 0,
            longestFocusBlock: 0,
            overloadScore: 95, // Critical Score
            fragmentationScore: 80, // Highly fragmented
            lateWorkMinutes: 60,
            lunchBreak: false // Skipped lunch
        },
        {
            date: new Date("2025-10-21"),
            totalMeetingMinutes: 300,
            meetingCount: 5,
            focusMinutes: 60,
            longestFocusBlock: 60,
            overloadScore: 60,
            fragmentationScore: 0,
            lateWorkMinutes: 0,
            lunchBreak: true
        }
    ];

    const result = GentleAnalyticsService.analyzeGentle(mockMetrics);

    console.log("\n📊 Day 1 Insight (Expected: Heavy, Supportive):");
    console.log(`   Load State: ${result.dailyInsights[0].loadState}`);
    console.log(`   Message: "${result.dailyInsights[0].message}"`);

    if (result.dailyInsights[0].loadState === "Heavy" && !result.dailyInsights[0].message.includes("Score")) {
        console.log("   ✅ SUCCESS: High overload converted to gentle 'Heavy' state without raw score.");
    } else {
        console.error("   ❌ FAILED: Message might be judgmental or missing state.");
    }

    // Check Trends (Optional)
    // console.log("\n📈 Trends:", result.trends);

    process.exit(0);
};

run();
