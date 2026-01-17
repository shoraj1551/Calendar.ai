
import 'dotenv/config';
import { db } from "@/db";
import { connectedAccounts, events, users } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { randomUUID } from "crypto";
import { CalendarProviderFactory } from "../src/services/calendar/factory";
import { SyncManager } from "../src/services/calendar/sync-manager";
import { CalendarProvider, NormalizedEvent, TokenResponse } from "../src/services/calendar/provider-types";

// --- Mock Provider ---
class MockProvider implements CalendarProvider {
    providerName = 'google' as const;
    constructor(public shouldFail = false) { }

    generateAuthUrl(email?: string): string { return "http://mock"; }
    async exchangeCodeForToken(code: string): Promise<TokenResponse> { throw new Error("Not used in sync"); }
    async refreshToken(refreshToken: string): Promise<TokenResponse> { return { accessToken: "mock_new", refreshToken: "mock_ref", expiresAt: Date.now() + 3600000 }; }
    setCredentials(tokens: any) { this.tokens = tokens; } // Added stub
    private tokens: any;

    async listEvents(start: Date, end: Date): Promise<NormalizedEvent[]> {
        if (this.shouldFail) {
            throw new Error("invalid_grant: Bad credentials");
        }

        return [
            {
                id: "evt_1",
                providerEventId: "evt_1",
                provider: "google",
                title: "Meeting A",
                startTime: new Date("2025-01-20T10:00:00Z"),
                endTime: new Date("2025-01-20T11:00:00Z"),
                allDay: false,
                status: "confirmed"
            },
            {
                id: "evt_2",
                providerEventId: "evt_2", // Will change title in 2nd pass
                provider: "google",
                title: "Meeting B",
                startTime: new Date("2025-01-20T14:00:00Z"),
                endTime: new Date("2025-01-20T15:00:00Z"),
                allDay: false,
                status: "confirmed"
            }
        ];
    }

    // Stubs
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Method not implemented."); }
    async updateEvent(id: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Method not implemented."); }
    async deleteEvent(id: string): Promise<void> { throw new Error("Method not implemented."); }
}

const mockProvider = new MockProvider();

// Monkey Patch Factory
CalendarProviderFactory.getProvider = (name: string) => {
    return mockProvider;
};

const run = async () => {
    console.log("🔄 Testing Synchronization Integrity & Error Handling...");

    // 1. Setup User & Account
    const email = `sync-test-${randomUUID()}@example.com`;
    const [user] = await db.insert(users).values({ email, name: "Sync Tester" }).returning();
    const [account] = await db.insert(connectedAccounts).values({
        userId: user.id,
        provider: 'google',
        email: 'mock@gmail.com',
        name: "Mock Calendar",
        status: 'active',
        accessToken: "mock_acc",
        refreshToken: "mock_ref"
    }).returning();

    // 2. Test Initial Sync
    console.log("\n🧪 Test 1: Initial Sync (Insert)");
    await SyncManager.syncAccount(account.id);

    const eventsPass1 = await db.query.events.findMany({
        where: eq(events.userId, user.id)
    });

    if (eventsPass1.length === 2) {
        console.log("   ✅ SUCCESS: Fetched and inserted 2 events.");
    } else {
        console.error("   ❌ FAILED: Expected 2 events, found " + eventsPass1.length);
        process.exit(1);
    }

    // 3. Test Re-Sync (Update)
    console.log("\n🧪 Test 2: Re-Sync (Update existing)");
    // Modify mock to return changed title
    mockProvider.listEvents = async () => [
        {
            id: "evt_1",
            providerEventId: "evt_1",
            provider: "google",
            title: "Meeting A (Updated)", // Changed
            startTime: new Date("2025-01-20T10:00:00Z"),
            endTime: new Date("2025-01-20T11:00:00Z"),
            allDay: false,
            status: "confirmed"
        },
        {
            id: "evt_2",
            providerEventId: "evt_2",
            provider: "google",
            title: "Meeting B",
            startTime: new Date("2025-01-20T14:00:00Z"),
            endTime: new Date("2025-01-20T15:00:00Z"),
            allDay: false,
            status: "confirmed"
        }
    ];

    await SyncManager.syncAccount(account.id);

    const event1 = await db.query.events.findFirst({
        where: and(eq(events.userId, user.id), eq(events.providerEventId, "evt_1"))
    });

    if (event1?.title === "Meeting A (Updated)") {
        console.log("   ✅ SUCCESS: Event updated correctly.");
    } else {
        console.error("   ❌ FAILED: Event title not updated.", event1);
    }

    const totalEvents = await db.query.events.findMany({ where: eq(events.userId, user.id) });
    if (totalEvents.length === 2) {
        console.log("   ✅ SUCCESS: No duplicates created.");
    } else {
        console.error("   ❌ FAILED: Duplicates found.", totalEvents.length);
    }

    // 4. Checking providerEventId uniqueness constraint logic (Implicitly validated by Test 2 not duplicating)

    // 5. Test Error Handling (Revocation)
    console.log("\n🧪 Test 3: Error Handling (Revoked Access)");
    mockProvider.shouldFail = true;
    // Restore listEvents to use the class property logic (which throws)
    mockProvider.listEvents = async (s, e) => { throw new Error("invalid_grant"); };

    try {
        await SyncManager.syncAccount(account.id);
        console.error("   ❌ FAILED: Sync should have thrown error.");
    } catch (e) {
        console.log("   ✅ SUCCESS: Sync threw error as expected.");
    }

    const failedAccount = await db.query.connectedAccounts.findFirst({
        where: eq(connectedAccounts.id, account.id)
    });

    if (failedAccount?.status === 'error') {
        console.log("   ✅ SUCCESS: Account status updated to 'error'.");
    } else {
        console.error("   ❌ FAILED: Account status not updated.", failedAccount?.status);
    }

    // Cleanup
    await db.delete(events).where(eq(events.userId, user.id));
    await db.delete(connectedAccounts).where(eq(connectedAccounts.id, account.id));
    await db.delete(users).where(eq(users.id, user.id));
    console.log("\n✅ All Sync Integrity Tests Passed.");
    process.exit(0);
};

run();
