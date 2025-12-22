
import "dotenv/config";
import { getAggregatedEvents } from "@/services/calendar/service";
import { db } from "@/db";
import { users, userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";

async function runTests() {
    console.log("Starting Calendar Block Tests...");
    const testEmail = `blocks_test_${Date.now()}@calendar.ai`;
    let userId = "";

    try {
        // 1. Setup User
        const [user] = await db.insert(users).values({
            email: testEmail,
            name: "Blocks Tester"
        }).returning();
        userId = user.id;

        // 2. Enable Lunch
        await db.insert(userSettings).values({
            userId,
            preferences: {
                lunch: true,
                workStart: "09:00",
                workEnd: "17:00"
            }
        });

        // 3. Fetch Events
        const events = await getAggregatedEvents("mock_token", userId);

        // 4. Verify Lunch
        const lunchEvents = events.filter(e => e.type === 'lunch');
        if (lunchEvents.length > 0) {
            console.log(`✅ PASS: Found ${lunchEvents.length} lunch blocks.`);
        } else {
            console.error("❌ FAIL: No lunch blocks found despite setting enabled.");
            process.exit(1);
        }

        // 5. Verify Holidays
        const holidayEvents = events.filter(e => e.type === 'holiday');
        if (holidayEvents.length > 0) {
            console.log(`✅ PASS: Found ${holidayEvents.length} holidays (e.g. ${holidayEvents[0].title}).`);
        } else {
            console.error("❌ FAIL: No holidays generated.");
            process.exit(1);
        }

        console.log("\nAll Calendar Block Tests Passed!");

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
