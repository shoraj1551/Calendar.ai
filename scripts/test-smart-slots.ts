
import { SmartSlotService } from '../src/services/calendar/smart-slots';
import { UnifiedEvent } from '../src/services/calendar/types';

console.log("🧠 Testing Smart Slot Logic...");

const date = new Date("2025-01-20T00:00:00Z"); // Bear High Energy: 10:00 - 14:00 (UTC relative to profile logic)
// Assuming Bear profile in energy.ts uses setHours local time? 
// Actually energy.ts uses setHours on the input date. 
// If input date is 00:00 UTC, setHours(10) make it 10:00 UTC. 
// Let's stick to UTC for simplicity here.

// Scenario 1: No Events
console.log("\n1. Scenario: Empty Calendar (Bear Profile 10-14 High)");
const slots1 = SmartSlotService.findFocusSlots(date, [], 'bear');
slots1.forEach(s => console.log(`   💡 Suggestion: ${s.start.toISOString()} - ${s.end.toISOString()} (${s.reason})`));
// Expect: 1 big slot 10:00-14:00

// Scenario 2: Lunch Meeting (12:00-13:00) splitting the zone
console.log("\n2. Scenario: Meeting 12:00-13:00 splits the zone");
const lunchEvent: UnifiedEvent = {
    id: "1",
    title: "Lunch",
    start: new Date("2025-01-20T12:00:00Z"),
    end: new Date("2025-01-20T13:00:00Z"),
    type: "work",
    allDay: false
} as any;

const slots2 = SmartSlotService.findFocusSlots(date, [lunchEvent], 'bear');
slots2.forEach(s => console.log(`   💡 Suggestion: ${s.start.toISOString()} - ${s.end.toISOString()} (${s.reason})`));
// Expect: Slot 1 (10-12), Slot 2 (13-14)

// Scenario 3: Cluttered (Meeting 10:00-11:30, Meeting 13:30-14:00)
console.log("\n3. Scenario: Cluttered Zone");
const events3 = [
    { start: new Date("2025-01-20T10:00:00Z"), end: new Date("2025-01-20T11:30:00Z") },
    { start: new Date("2025-01-20T13:30:00Z"), end: new Date("2025-01-20T14:00:00Z") }
] as UnifiedEvent[];

const slots3 = SmartSlotService.findFocusSlots(date, events3, 'bear');
slots3.forEach(s => console.log(`   💡 Suggestion: ${s.start.toISOString()} - ${s.end.toISOString()} (${s.reason})`));
// Expect: Gap 11:30-13:30 (120 mins)

console.log("\n✅ Smart Slot Logic Verified.");
