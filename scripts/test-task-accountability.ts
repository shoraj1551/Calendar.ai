
import "dotenv/config";
import { AccountabilityService } from "@/services/tasks/accountability";
import { db } from "@/db";
import { users, userSettings, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { addDays, subDays } from "date-fns";

async function runTests() {
    console.log("Starting Accountability Tests...");
    const testEmail = `coach_test_${Date.now()}@calendar.ai`;
    let userId = "";

    try {
        // 1. Setup User
        const [user] = await db.insert(users).values({
            email: testEmail,
            name: "Coach Tester"
        }).returning();
        userId = user.id;

        // 2. Create Overdue Task
        await db.insert(tasks).values({
            userId,
            title: "Forget about me",
            status: "todo",
            dueDate: subDays(new Date(), 1), // Yesterday
        });

        // --- Test 1: Disabled Checkins ---
        console.log("\n[Test 1] Testing Checkins Disabled...");
        await db.insert(userSettings).values({
            userId,
            preferences: { enableCheckins: false, accountabilityMode: 'strict' }
        });

        const result1 = await AccountabilityService.runCheck(userId);
        if (result1.sent === false && result1.reason === "disabled") {
            console.log("✅ PASS: Checkins disabled.");
        } else {
            console.error("❌ FAIL: Sent checkin despite being disabled.");
            console.log(result1);
            process.exit(1);
        }

        // --- Test 2: Strict Mode ---
        console.log("\n[Test 2] Testing Strict Mode...");
        await db.update(userSettings).set({ preferences: { enableCheckins: true, accountabilityMode: 'strict' } }).where(eq(userSettings.userId, userId));

        const result2 = await AccountabilityService.runCheck(userId);
        if (result2.sent === true && result2.message?.includes("unacceptable")) {
            console.log("✅ PASS: Strict tone applied.");
        } else {
            console.error("❌ FAIL: Strict tone missing.");
            console.log(result2);
            process.exit(1);
        }

        // --- Test 3: Gentle Mode ---
        console.log("\n[Test 3] Testing Gentle Mode...");
        await db.update(userSettings).set({ preferences: { enableCheckins: true, accountabilityMode: 'gentle' } }).where(eq(userSettings.userId, userId));

        const result3 = await AccountabilityService.runCheck(userId);
        if (result3.sent === true && result3.message?.includes("No pressure")) {
            console.log("✅ PASS: Gentle tone applied.");
        } else {
            console.error("❌ FAIL: Gentle tone missing.");
            console.log(result3);
            process.exit(1);
        }

        console.log("\nAll Accountability Tests Passed!");

    } catch (e) {
        console.error("Test Suite Error:", e);
    } finally {
        if (userId) {
            await db.delete(tasks).where(eq(tasks.userId, userId));
            await db.delete(userSettings).where(eq(userSettings.userId, userId));
            await db.delete(users).where(eq(users.id, userId));
        }
        process.exit(0);
    }
}

runTests();
