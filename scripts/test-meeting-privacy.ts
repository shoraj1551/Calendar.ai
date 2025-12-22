
import "dotenv/config";
import { MeetingService } from "@/services/meetings/service";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

async function runTests() {
    console.log("Starting Meeting Privacy Tests...");
    const testEmail = `privacy_test_${Date.now()}@calendar.ai`;
    let userId = "";

    try {
        // 1. Setup User
        const [user] = await db.insert(users).values({
            email: testEmail,
            name: "Privacy Tester"
        }).returning();
        userId = user.id;

        // --- Test 1: Record All = FALSE ---
        console.log("\n[Test 1] Testing 'Record All' Disabled...");
        await db.insert(userSettings).values({
            userId,
            preferences: { recordAll: false, autoJoin: true }
        });

        try {
            await MeetingService.processMeeting(userId, "My Secret Core", "transcript...");
            console.error("❌ FAIL: Processing should have been blocked.");
            process.exit(1);
        } catch (e: any) {
            if (e.message.includes("Meeting processing disabled")) {
                console.log("✅ PASS: Processing blocked by settings.");
            } else {
                console.error("❌ FAIL: Unexpected error:", e);
                process.exit(1);
            }
        }

        // --- Test 2: Auto Join = FALSE ---
        console.log("\n[Test 2] Testing 'Auto Join' Disabled...");
        await db.update(userSettings).set({ preferences: { recordAll: true, autoJoin: false } }).where(eq(userSettings.userId, userId));

        const joinResult1 = await MeetingService.shouldBotJoin(userId, "Daily Standup");
        if (joinResult1.join === false) {
            console.log("✅ PASS: Bot declined join (Auto join disabled).");
        } else {
            console.error("❌ FAIL: Bot joined despite settings off.");
            process.exit(1);
        }

        // --- Test 3: Privacy Keyword Filter ---
        console.log("\n[Test 3] Testing Privacy Keyword Filter...");
        await db.update(userSettings)
            .set({ preferences: { recordAll: true, autoJoin: true, privacyMode: 'private' } })
            .where(eq(userSettings.userId, userId));

        const joinResult2 = await MeetingService.shouldBotJoin(userId, "Project Secret CONFIDENTIAL");
        const joinResult3 = await MeetingService.shouldBotJoin(userId, "Public Update");

        if (joinResult2.join === false && joinResult3.join === true) {
            console.log("✅ PASS: Confidential meeting rejected, Public accepted.");
        } else {
            console.error("❌ FAIL: Keyword filter failed.");
            console.log("Confidential:", joinResult2);
            console.log("Public:", joinResult3);
            process.exit(1);
        }

        console.log("\nAll Meeting Privacy Tests Passed!");

    } catch (e) {
        console.error("Test Suite Error:", e);
    } finally {
        if (userId) {
            await db.delete(userSettings).where(eq(userSettings.userId, userId));
            await db.delete(users).where(eq(users.id, userId));
        }
        process.exit(0);
    }
}

runTests();
