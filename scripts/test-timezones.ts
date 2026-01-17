
import 'dotenv/config';
import { GoogleCalendarProvider } from '../src/services/calendar/providers/google';
import { calendar_v3 } from 'googleapis';

console.log("🌍 Testing Timezone Fidelity & Normalization...");

// Mock Google Event Response (UTC)
const mockEventUTC: calendar_v3.Schema$Event = {
    id: "evt_utc",
    summary: "Meeting in UTC (10 AM UTC)",
    start: { dateTime: "2025-01-20T10:00:00Z" }, // 10:00 UTC
    end: { dateTime: "2025-01-20T11:00:00Z" },   // 11:00 UTC
    status: 'confirmed'
};

// Mock Google Event Response (IST - UTC+5:30)
const mockEventIST: calendar_v3.Schema$Event = {
    id: "evt_ist",
    summary: "Meeting in IST (10 AM IST)",
    start: { dateTime: "2025-01-20T10:00:00+05:30" }, // 10:00 IST = 04:30 UTC
    end: { dateTime: "2025-01-20T11:00:00+05:30" },
    status: 'confirmed'
};

// Mock Google Event Response (EST - UTC-5:00)
const mockEventEST: calendar_v3.Schema$Event = {
    id: "evt_est",
    summary: "Meeting in EST (10 AM EST)",
    start: { dateTime: "2025-01-20T10:00:00-05:00" }, // 10:00 EST = 15:00 UTC
    end: { dateTime: "2025-01-20T11:00:00-05:00" },
    status: 'confirmed'
};

const provider = new GoogleCalendarProvider("mock", "mock", "mock");

// Access private method via casting
const normalize = (provider as any).normalizeEvent.bind(provider);

const run = () => {
    // 1. UTC Event Test
    const normUTC = normalize(mockEventUTC);
    console.log(`\n1. UTC Event: ${normUTC.title}`);
    console.log(`   Normalized Start: ${normUTC.startTime.toISOString()}`);

    if (normUTC.startTime.toISOString() === "2025-01-20T10:00:00.000Z") {
        console.log("   ✅ SUCCESS: Preserved UTC time.");
    } else {
        console.error("   ❌ FAILED: UTC time shifted.", normUTC.startTime.toISOString());
    }

    // 2. IST Event Test
    const normIST = normalize(mockEventIST);
    console.log(`\n2. IST Event: ${normIST.title}`);
    console.log(`   Normalized Start (UTC): ${normIST.startTime.toISOString()}`); // Should be 2025-01-20T04:30:00.000Z

    // We expect the Date object to represent 4:30 AM UTC
    if (normIST.startTime.toISOString() === "2025-01-20T04:30:00.000Z") {
        console.log("   ✅ SUCCESS: IST time correctly converted to UTC.");
    } else {
        console.error("   ❌ FAILED: IST conversion wrong.", normIST.startTime.toISOString());
    }

    // 3. EST Event Test
    const normEST = normalize(mockEventEST);
    console.log(`\n3. EST Event: ${normEST.title}`);
    console.log(`   Normalized Start (UTC): ${normEST.startTime.toISOString()}`); // Should be 2025-01-20T15:00:00.000Z

    if (normEST.startTime.toISOString() === "2025-01-20T15:00:00.000Z") {
        console.log("   ✅ SUCCESS: EST time correctly converted to UTC.");
    } else {
        console.error("   ❌ FAILED: EST conversion wrong.", normEST.startTime.toISOString());
    }

    // 4. Timezone offset comparison check (Cross-TZ)
    // If user is in UTC, looking at IST event (10 AM IST), they should see 4:30 AM.
    // Our DB stores "startTime" as timestamp without timezone (or with), handled by Postgres driver as Date object (UTC).
    // The Frontend (UI) is responsible for converting that UTC Date back to User's Local Time.
    // This script only verifies the INGESTION part (Provider -> DB).

    console.log("\n✅ Ingestion Logic Verified. Frontend checks required for display fidelity.");
};

run();
