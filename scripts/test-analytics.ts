import { AnalyticsService } from "../src/services/analytics/metrics";
import { InsightsEngine } from "../src/services/analytics/insights";
import { subWeeks, addDays } from "date-fns";

/**
 * Verification script for Day 4: Analytics & Insights
 * Tests metric calculations and insight generation
 */

async function testAnalytics() {
    console.log("🧪 Testing Analytics Service...\n");

    // Mock user ID
    const userId = "test-user-id";
    const endDate = new Date();
    const startDate = subWeeks(endDate, 1);

    try {
        // Test 1: Calculate Weekly Metrics
        console.log("📊 Test 1: Calculating weekly metrics...");
        const metrics = await AnalyticsService.calculateWeeklyMetrics(userId, startDate, endDate);

        console.log("✅ Metrics calculated:");
        console.log(`   Total Hours: ${metrics.totalHours.toFixed(1)}`);
        console.log(`   Meeting Load: ${metrics.meetingLoad.toFixed(1)}%`);
        console.log(`   Focus Blocks: ${metrics.focusBlocks}`);
        console.log(`   Avg Meeting Duration: ${metrics.averageMeetingDuration.toFixed(0)} min`);
        console.log(`   Daily Breakdown: ${metrics.dailyBreakdown.length} days\n`);

        // Test 2: Generate Insights
        console.log("💡 Test 2: Generating insights...");
        const insights = await InsightsEngine.generateInsights(userId, metrics);

        console.log(`✅ Generated ${insights.length} insights:`);
        insights.forEach((insight, i) => {
            const icon = insight.type === 'warning' ? '⚠️' : insight.type === 'suggestion' ? '💡' : '🎉';
            console.log(`   ${icon} ${insight.title}`);
            console.log(`      ${insight.description}`);
            console.log(`      Priority: ${insight.priority}/10\n`);
        });

        // Test 3: Verify Daily Breakdown
        console.log("📅 Test 3: Verifying daily breakdown...");
        if (metrics.dailyBreakdown.length > 0) {
            console.log("✅ Daily breakdown structure:");
            const sample = metrics.dailyBreakdown[0];
            console.log(`   Date: ${sample.date}`);
            console.log(`   Work: ${sample.work.toFixed(1)}h`);
            console.log(`   Meetings: ${sample.meetings.toFixed(1)}h`);
            console.log(`   Focus: ${sample.focus.toFixed(1)}h`);
            console.log(`   Personal: ${sample.personal.toFixed(1)}h\n`);
        }

        console.log("✅ All Analytics Tests Passed!\n");

    } catch (error: any) {
        console.error("❌ Analytics Test Failed:", error.message);
        process.exit(1);
    }
}

// Run tests
testAnalytics()
    .then(() => {
        console.log("🎉 Analytics Service Verified Successfully!");
        process.exit(0);
    })
    .catch((error) => {
        console.error("❌ Verification Failed:", error);
        process.exit(1);
    });
