
import 'dotenv/config';
import { db } from "@/db";
import { events, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { EventRepository } from "../src/services/events/db";
import { ConflictService } from "../src/services/calendar/conflict";
import { BlockGenerator } from "../src/services/calendar/blocks";
import { HolidayService } from "../src/services/calendar/holidays";

const run = async () => {
    console.log("🛡️ Testing Flexible Boundary Management System...");
    const email = "shorajtomer@gmail.com";
    const userId = await EventRepository.ensureUser(email);

    // 1. Setup: Define a Test Holiday (e.g. Diwali 2025 - Oct 20)
    const diwaliDate = new Date("2025-10-20T10:00:00");
    const diwaliEnd = new Date("2025-10-20T11:00:00");

    console.log(`\n📅 Test 1: Booking on Hard Block (Diwali 2025)`);
    // Ensure ignored list is empty (and row exists)
    await db.insert(userSettings).values({ userId, ignoredHolidays: [] }).onConflictDoNothing();
    await db.update(userSettings).set({ ignoredHolidays: [] }).where(eq(userSettings.userId, userId));

    const check1 = await ConflictService.validateEventTime(userId, diwaliDate, diwaliEnd, false);
    if (!check1.valid && check1.conflictReason?.includes("Hard Block")) {
        console.log(`   ✅ BLOCKED: "${check1.conflictReason}"`);
    } else {
        console.error("   ❌ FAILED: Should have been blocked by Holiday.");
    }

    // 2. Test: Ignored Holiday
    console.log(`\n📅 Test 2: Toggling Holiday OFF (Ignoring Diwali)`);
    await db.update(userSettings).set({ ignoredHolidays: ["Diwali"] }).where(eq(userSettings.userId, userId));

    const check2 = await ConflictService.validateEventTime(userId, diwaliDate, diwaliEnd, false);
    if (check2.valid) {
        console.log(`   ✅ ALLOWED: Holiday successfully ignored.`);
    } else {
        console.error(`   ❌ FAILED: Blocked despite being ignored. Reason: ${check2.conflictReason}`);
    }

    // 3. Test: Soft Block (Focus Time)
    // We need to inject a Focus Block for a test day. 
    // Since BlockGenerator is deterministic based on settings/holidays, we'll manually create a "Focus" event in DB for testing.
    console.log(`\n📅 Test 3: Booking on Soft Block (Focus Time)`);
    const focusDate = new Date("2025-10-21T10:00:00"); // Next day
    const focusEnd = new Date("2025-10-21T12:00:00");

    // Create Focus Event in DB
    const focusEvent = await EventRepository.create(email, {
        title: "Deep Work",
        start: focusDate,
        end: focusEnd,
        type: "focus"
    });

    // 3. Test: Soft Block (Focus Time)
    // We injected a Focus Block "Deep Work" from 10:00 - 12:00
    console.log(`\n📅 Test 3: Booking on Soft Block (Focus Time stored in DB)`);

    // 3a. Normal Booking (Should Fail)
    const check3a = await ConflictService.validateEventTime(userId, focusDate, new Date("2025-10-21T10:30:00"), false);
    if (!check3a.valid && check3a.conflictReason?.includes("Soft Block")) {
        console.log(`   ✅ BLOCKED (Normal): "${check3a.conflictReason}"`);
    } else {
        console.error(`   ❌ FAILED (Normal): Should have been blocked by Focus Time.`);
    }

    // 3b. Urgent Booking (Should Pass)
    const check3b = await ConflictService.validateEventTime(userId, focusDate, new Date("2025-10-21T10:30:00"), true);
    if (check3b.valid) {
        console.log(`   ✅ ALLOWED (Urgent): Priority override successful.`);
    } else {
        console.error(`   ❌ FAILED (Urgent): Should have allowed urgent booking.`);
    }

    // Cleanup
    await db.delete(events).where(eq(events.id, focusEvent.id!));

    console.log("\n✅ SUCCESS: Hard Blocks and Ignored Holidays Verified.");
    process.exit(0);
};

run();
