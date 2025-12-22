
import "dotenv/config";
import { analyzeSchedule } from "@/services/intelligence/analyzer";
import { generateSuggestions } from "@/services/intelligence/scheduler";
import { UnifiedEvent } from "@/services/calendar/types";
import { format, addHours } from "date-fns";

// Mock Event Factory
const createEvent = (start: string, end: string): UnifiedEvent => ({
    id: "mock-1",
    title: "Meeting",
    start: new Date(start),
    end: new Date(end),
    provider: "local",
    type: "work",
    allDay: false,
    status: "confirmed"
});

async function runTests() {
    console.log("Starting Personal Time Logic Tests...");

    const today = new Date();
    const dateStr = format(today, "yyyy-MM-dd");

    // --- CASE 1: Default Settings (9-5) ---
    // Meeting at 6pm should be flagged as "Late"
    console.log("\n[Test 1] Testing Default Work Hours (9-5)...");
    const events1 = [createEvent(`${dateStr}T18:00:00`, `${dateStr}T19:00:00`)];

    // Default Settings
    const metrics1 = analyzeSchedule(events1, today, today, { workStart: "09:00", workEnd: "17:00", lunch: true });
    const suggestions1 = generateSuggestions(metrics1, events1, { workStart: "09:00", workEnd: "17:00", lunch: true });

    if (metrics1[0].lateWorkMinutes === 60 && suggestions1.some(s => s.type === 'move_event' && s.description.includes('after 17:00'))) {
        console.log("✅ PASS: 6pm meeting flagged as late (Work ends 17:00).");
    } else {
        console.error("❌ FAIL: 6pm meeting NOT correctly flagged.");
        console.log("Late Mins:", metrics1[0].lateWorkMinutes);
        console.log("Suggestions:", suggestions1.map(s => s.description));
        process.exit(1);
    }


    // --- CASE 2: Custom Work Hours (10-7) ---
    // Meeting at 6pm should be OK. Meeting at 8pm should be late.
    console.log("\n[Test 2] Testing Custom Work Hours (10-19)...");
    const events2 = [
        createEvent(`${dateStr}T18:00:00`, `${dateStr}T19:00:00`), // OK (ends at workEnd)
        createEvent(`${dateStr}T20:00:00`, `${dateStr}T21:00:00`)  // LATE
    ];

    const settings2 = { workStart: "10:00", workEnd: "19:00", lunch: true };
    const metrics2 = analyzeSchedule(events2, today, today, settings2);
    const suggestions2 = generateSuggestions(metrics2, events2, settings2);

    if (metrics2[0].lateWorkMinutes === 60 && suggestions2.some(s => s.description.includes('after 19:00'))) {
        console.log("✅ PASS: 6pm meeting accepted, 8pm flagged as late (Work ends 19:00).");
    } else {
        console.error("❌ FAIL: Custom work hours logic failed.");
        console.log("Late Mins:", metrics2[0].lateWorkMinutes);
        console.log("Suggestions:", suggestions2.map(s => s.description));
        process.exit(1);
    }


    // --- CASE 3: Lunch Suppression ---
    // Packed schedule 10am-4pm.
    // If lunch=true, should suggest break.
    // If lunch=false, should NOT suggest break.
    console.log("\n[Test 3] Testing Lunch Suppression...");
    const events3 = [
        createEvent(`${dateStr}T10:00:00`, `${dateStr}T16:00:00`) // 6h marathon
    ];

    // 3a. Enabled
    const suggestions3a = generateSuggestions(
        analyzeSchedule(events3, today, today, { workStart: "09:00", workEnd: "17:00", lunch: true }),
        events3,
        { workStart: "09:00", workEnd: "17:00", lunch: true }
    );

    // 3b. Disabled
    const suggestions3b = generateSuggestions(
        analyzeSchedule(events3, today, today, { workStart: "09:00", workEnd: "17:00", lunch: false }),
        events3,
        { workStart: "09:00", workEnd: "17:00", lunch: false }
    );

    const hasLunchSuggestionA = suggestions3a.some(s => s.id.startsWith('lunch-'));
    const hasLunchSuggestionB = suggestions3b.some(s => s.id.startsWith('lunch-'));

    if (hasLunchSuggestionA && !hasLunchSuggestionB) {
        console.log("✅ PASS: Lunch suggestion respects user preference.");
    } else {
        console.error("❌ FAIL: Lunch toggle logic failed.");
        console.log("Enabled Config -> Has Suggestion:", hasLunchSuggestionA);
        console.log("Disabled Config -> Has Suggestion:", hasLunchSuggestionB);
        process.exit(1);
    }

    console.log("\nAll Personal Time Tests Passed!");
    process.exit(0);
}

runTests();
