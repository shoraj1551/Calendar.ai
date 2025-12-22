
import "dotenv/config";
import { CommunicationService, MockEmailTransport, MockPushTransport } from "@/services/communications/service";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

async function runTests() {
    console.log("Starting Communication Backend Tests...");
    const testEmail = `test_user_${Date.now()}@example.com`;
    let userId = "";

    try {
        // 1. Setup Test User
        console.log(`Creating test user: ${testEmail}`);
        const [user] = await db.insert(users).values({
            email: testEmail,
            name: "Test User",
        }).returning();
        userId = user.id;

        // --- TEST 1: Daily Summary (Enabled) ---
        console.log("\n[Test 1] Testing Daily Summary (Enabled)...");
        // Initialize Settings
        await db.insert(userSettings).values({
            userId,
            preferences: { dailySummary: true, commChannel: 'email' }
        });

        await CommunicationService.sendDailySummary(userId);

        if (MockEmailTransport.sent.length === 1 && MockEmailTransport.sent[0].subject.includes("Daily Briefing")) {
            console.log("✅ PASS: Daily Summary email sent.");
        } else {
            console.error("❌ FAIL: Daily Summary email NOT sent.");
            console.log(MockEmailTransport.sent);
            process.exit(1);
        }
        MockEmailTransport.clear();


        // --- TEST 2: Daily Summary (Disabled) ---
        console.log("\n[Test 2] Testing Daily Summary (Disabled)...");
        await db.update(userSettings)
            .set({ preferences: { dailySummary: false, commChannel: 'email' } })
            .where(eq(userSettings.userId, userId));

        await CommunicationService.sendDailySummary(userId);

        if (MockEmailTransport.sent.length === 0) {
            console.log("✅ PASS: Daily Summary suppressed.");
        } else {
            console.error("❌ FAIL: Daily Summary email sent despite being disabled.");
            process.exit(1);
        }


        // --- TEST 3: Notification Channels (Push) ---
        console.log("\n[Test 3] Testing Channel Switching (Push)...");
        await db.update(userSettings)
            .set({ preferences: { commChannel: 'push', dailySummary: false } }) // Reset dailySummary just in case
            .where(eq(userSettings.userId, userId));

        await CommunicationService.dispatchNotification(userId, 'info', "Test Push", "Hello");

        if (MockPushTransport.sent.length === 1 && MockEmailTransport.sent.length === 0) {
            console.log("✅ PASS: Notification sent via Push only.");
        } else {
            console.error("❌ FAIL: Notification channel logic failed.");
            console.log("Push:", MockPushTransport.sent.length, "Email:", MockEmailTransport.sent.length);
            process.exit(1);
        }
        MockPushTransport.clear();


        // --- TEST 4: Urgent Only Mode ---
        console.log("\n[Test 4] Testing Urgent-Only Suppression...");
        await db.update(userSettings)
            .set({ preferences: { commChannel: 'push', urgentOnly: true } })
            .where(eq(userSettings.userId, userId));

        // Try sending 'info' (should fail)
        const result1 = await CommunicationService.dispatchNotification(userId, 'info', "Low Priority", "Ignore me");

        // Try sending 'alarm' (should pass)
        const result2 = await CommunicationService.dispatchNotification(userId, 'alarm', "High Priority", "Wake up!");

        if (result1.delivered === false && result2.delivered === true) {
            console.log("✅ PASS: Urgent mode correctly filtered notifications.");
        } else {
            console.error("❌ FAIL: Urgent mode logic failed.");
            console.log("Info Result:", result1);
            console.log("Alarm Result:", result2);
            process.exit(1);
        }

    } catch (error) {
        console.error("Test Suite Error:", error);
    } finally {
        // Cleanup
        if (userId) {
            console.log("\nCleaning up test data...");
            await db.delete(userSettings).where(eq(userSettings.userId, userId));
            await db.delete(users).where(eq(users.id, userId));
        }
        process.exit(0);
    }
}

runTests();
