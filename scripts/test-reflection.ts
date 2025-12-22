
import { ReflectionService } from "../src/services/intelligence/reflection";
import forceRecompile from "../src/services/calendar/blocks"; // Dummy import to ensure TS picks up types if needed
import { format } from "date-fns";

// Mock Data
const mockEvents: any[] = [
    // Heavy Meeting Day (Monday)
    { start: new Date("2025-12-22T09:00:00"), end: new Date("2025-12-22T10:00:00"), allDay: false, type: "work", title: "Mtg 1" },
    { start: new Date("2025-12-22T10:30:00"), end: new Date("2025-12-22T11:30:00"), allDay: false, type: "work", title: "Mtg 2" },
    { start: new Date("2025-12-22T12:00:00"), end: new Date("2025-12-22T13:00:00"), allDay: false, type: "work", title: "Mtg 3" },
    { start: new Date("2025-12-22T14:00:00"), end: new Date("2025-12-22T17:00:00"), allDay: false, type: "work", title: "Workshop" },

    // Good Balance Day (Tuesday) with Lunch
    { start: new Date("2025-12-23T09:00:00"), end: new Date("2025-12-23T10:00:00"), allDay: false, type: "work", title: "Standup" },
    { start: new Date("2025-12-23T13:00:00"), end: new Date("2025-12-23T13:45:00"), allDay: false, type: "lunch", title: "Lunch" },
];

const runTest = () => {
    console.log(" Testing Reflection Service...");

    // Test Monday (Heavy)
    const monday = new Date("2025-12-22T09:00:00");
    console.log(`\n📅 Analyzing: ${format(monday, "yyyy-MM-dd")} (Expect: Heavy Load + No Lunch)`);
    const ref1 = ReflectionService.analyzeDay(monday, mockEvents);
    printReflection(ref1);

    // Test Tuesday (Good)
    const tuesday = new Date("2025-12-23T09:00:00");
    console.log(`\n📅 Analyzing: ${format(tuesday, "yyyy-MM-dd")} (Expect: Praise or Neutral)`);
    const ref2 = ReflectionService.analyzeDay(tuesday, mockEvents);
    printReflection(ref2);

    if (ref1.insights.some(i => i.type === 'alert') && ref1.metrics.lunchTaken === false) {
        console.log("\n✅ SUCCESS: Correctly identified heavy load and missing lunch.");
    } else {
        console.log("\n❌ FAILED: Logic did not trigger expected alerts.");
        process.exit(1);
    }
};

function printReflection(daily: any) {
    console.log(`   [Metrics] Meetings: ${daily.metrics.totalMeetingHours}h | Focus: ${daily.metrics.focusHours}h | Frag: ${daily.metrics.fragmentationCount}`);
    daily.insights.forEach((i: any) => {
        console.log(`   💡 [${i.category.toUpperCase()}] ${i.message}`);
    });
}

runTest();
