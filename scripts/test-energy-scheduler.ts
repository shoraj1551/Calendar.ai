
import { generateSuggestions } from "../src/services/intelligence/scheduler";
import { format } from "date-fns";

// Mock Data
const mockMetrics = [{
    date: new Date("2025-12-22T09:00:00"),
    totalMeetingMinutes: 120,
    focusMinutes: 30, // Low focus
    longestFocusBlock: 30,
    meetingCount: 3,
    overloadScore: 40,
    fragmentationScore: 20,
    lateWorkMinutes: 0,
    lunchBreak: true
}];

const mockEvents = [
    {
        id: "evt-1",
        title: "Brainstorming",
        start: new Date("2025-12-22T09:30:00"), // 9:30 AM
        end: new Date("2025-12-22T10:30:00"),
        allDay: false,
        type: "work" as const, // Cast to any to satify type in test
        provider: "local",
        status: "confirmed"
    }
] as any[];

const mockZones = [
    { start: "09:00", end: "11:00", level: "high" as const }, // High Energy Morning
    { start: "13:00", end: "14:00", level: "drain" as const }
];

const runTest = () => {
    console.log("🧪 Testing Energy-Aware Scheduler...");

    const suggestions = generateSuggestions(
        mockMetrics,
        mockEvents,
        { workStart: "09:00", workEnd: "17:00", lunch: true },
        mockZones
    );

    console.log("\n💡 Generated Suggestions:");
    suggestions.forEach(s => {
        console.log(` - [${s.type}] ${s.title} (Score: ${s.score})`);
        console.log(`   "${s.description}"`);
    });

    const hasEnergyMismatch = suggestions.some(s => s.id.includes("energy-mismatch"));
    if (hasEnergyMismatch) {
        console.log("\n✅ SUCCESS: Detected 'Brainstorming' meeting in High Energy zone!");
    } else {
        console.log("\n❌ FAILED: Did not suggest moving the morning meeting.");
        process.exit(1);
    }
};

runTest();
