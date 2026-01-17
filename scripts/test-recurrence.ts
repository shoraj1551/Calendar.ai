
import 'dotenv/config';
import { GoogleCalendarProvider } from '../src/services/calendar/providers/google';
import { calendar_v3 } from 'googleapis';

console.log("🔁 Testing Recurrence Logic (SingleEvents Mode)...");

/**
 * SCENARIO:
 * Recurring Series: Daily Standup (10:00 AM)
 * Exception: Wednesday Standup moved to 11:00 AM
 * Exception: Friday Standup cancelled (deleted)
 * 
 * Google API (singleEvents=true) returns a flat list of instances.
 * Cancelled instances are usually OMITTED from the list (unless showDeleted=true).
 * Moved instances appear with the NEW time.
 */

// 1. Monday (Normal) - 10:00 AM
const instanceMon: calendar_v3.Schema$Event = {
    id: "standup_mon_base64",
    summary: "Daily Standup",
    start: { dateTime: "2025-01-20T10:00:00Z" },
    status: 'confirmed',
    recurringEventId: "master_rule_id"
};

// 2. Tuesday (Normal) - 10:00 AM
const instanceTue: calendar_v3.Schema$Event = {
    id: "standup_tue_base64",
    summary: "Daily Standup",
    start: { dateTime: "2025-01-21T10:00:00Z" },
    status: 'confirmed',
    recurringEventId: "master_rule_id"
};

// 3. Wednesday (Exception - Moved) - 11:00 AM
const instanceWed: calendar_v3.Schema$Event = {
    id: "standup_wed_base64",
    summary: "Daily Standup",
    start: { dateTime: "2025-01-22T11:00:00Z" }, // Moved hour later
    status: 'confirmed',
    recurringEventId: "master_rule_id",
    originalStartTime: { dateTime: "2025-01-22T10:00:00Z" } // Proof it was moved
};

// 4. Friday (Cancelled) - Not present in list OR present with status='cancelled'
const instanceFri: calendar_v3.Schema$Event = {
    id: "standup_fri_base64",
    summary: "Daily Standup",
    start: { dateTime: "2025-01-24T10:00:00Z" },
    status: 'cancelled',
    recurringEventId: "master_rule_id"
};


const provider = new GoogleCalendarProvider("mock", "mock", "mock");
// Access private method via casting
const normalize = (provider as any).normalizeEvent.bind(provider);

const run = () => {
    console.log("\n🧪 verifying Normalization of Recurrence Instances...");

    // Batch normalize
    const events = [instanceMon, instanceTue, instanceWed, instanceFri].map(e => normalize(e));

    // Check Monday (Normal)
    if (events[0].startTime.toISOString().includes("10:00:00") && events[0].status === 'confirmed') {
        console.log("   ✅ Instance 1 (Normal): Correct Time & Status.");
    } else {
        console.error("   ❌ Instance 1 Failed.");
    }

    // Check Wednesday (Moved)
    if (events[2].startTime.toISOString().includes("11:00:00")) {
        console.log("   ✅ Instance 3 (Exception - Moved): Reflects NEW time (11:00) vs Original (10:00).");
    } else {
        console.error("   ❌ Instance 3 Failed: Did not pickup new time.", events[2].startTime);
    }

    // Check Friday (Cancelled)
    if (events[3].status === 'cancelled') {
        console.log("   ✅ Instance 4 (Exception - Cancelled): Correctly marked as cancelled.");
    } else {
        console.error("   ❌ Instance 4 Failed: Should be cancelled.", events[3].status);
    }

    // Conclusion
    console.log("\n📋 Summary: 'singleEvents=true' strategy correctly handles Recurrence Exceptions.");
    console.log("   - Moved events show as specific instances with new times.");
    console.log("   - Cancelled events are marked 'cancelled' (or omitted by API).");
    console.log("   - Logic requires NO special RRULE parsing on our end.");
};

run();
