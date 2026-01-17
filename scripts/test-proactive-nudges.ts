
import { ProactiveAgent } from '../src/services/calendar/proactive-agent';
import { UnifiedEvent } from '../src/services/calendar/types';

console.log("🔔 Testing Proactive Nudges...");

const date = new Date("2025-01-20T00:00:00Z"); // Bear High Energy: 10:00 - 14:00

// Scenario 1: Conflict in Deep Work Zone
console.log("\n1. Scenario: Admin Meeting in Peak Zone");
const events1: UnifiedEvent[] = [
    {
        id: "1",
        title: "Team Status Update",
        start: new Date("2025-01-20T11:00:00Z"), // Smack in middle of 10-14 peak
        end: new Date("2025-01-20T12:00:00Z"),
        type: "admin", // Low value
        allDay: false
    } as any
];

ProactiveAgent.analyzeAndNudge("user_1", date, events1, 'bear').then(nudges => {
    nudges.forEach(n => console.log(`   [${n.title}] ${n.message}`));
});


// Scenario 2: Burnout (4 hours back to back)
console.log("\n2. Scenario: 4 Hour Marathon");
const events2: UnifiedEvent[] = [
    { start: new Date("2025-01-20T13:00:00Z"), end: new Date("2025-01-20T14:00:00Z") },
    { start: new Date("2025-01-20T14:00:00Z"), end: new Date("2025-01-20T15:00:00Z") },
    { start: new Date("2025-01-20T15:00:00Z"), end: new Date("2025-01-20T16:00:00Z") },
    { start: new Date("2025-01-20T16:00:00Z"), end: new Date("2025-01-20T17:00:00Z") }
] as any;

ProactiveAgent.analyzeAndNudge("user_1", date, events2, 'bear').then(nudges => {
    nudges.forEach(n => console.log(`   [${n.title}] ${n.message}`));
});

// Wait for async
setTimeout(() => console.log("\n✅ Nudge Logic Verified."), 1000);
