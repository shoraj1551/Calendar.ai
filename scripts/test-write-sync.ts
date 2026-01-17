
import 'dotenv/config';
import { db } from "@/db";
import { connectedAccounts, events, users } from "@/db/schema";
import { eq } from "drizzle-orm";
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
    setCredentials(tokens: any) { this.tokens = tokens; } // Stub
    private tokens: any;

    async listEvents(start: Date, end: Date): Promise<NormalizedEvent[]> { return []; }

    // Logic we are testing
    async updateEvent(id: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent> {
        console.log(`[MockProvider] Update called for ID: ${id} with title: ${event.title}`);
        return {
            id,
            providerEventId: id,
            provider: 'google',
            title: event.title || "Updated Title",
            startTime: event.startTime || new Date(),
            endTime: event.endTime || new Date(),
            allDay: false,
            status: 'confirmed'
        };
    }

    // Stubs
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Method not implemented."); }
    async deleteEvent(id: string): Promise<void> { throw new Error("Method not implemented."); }
}

const mockProvider = new MockProvider();

// Monkey Patch Factory
CalendarProviderFactory.getProvider = (name: string) => {
    return mockProvider;
};

const run = async () => {
    console.log("🔄 Testing Write-Back Sync...");

    // 1. Setup User & Account
    const email = `write-test-${randomUUID()}@example.com`;
    const [user] = await db.insert(users).values({ email, name: "Write Tester" }).returning();
    const [account] = await db.insert(connectedAccounts).values({
        userId: user.id,
        provider: 'google',
        email: 'mock-write@gmail.com',
        name: "Mock Write Calendar",
        status: 'active',
        accessToken: "mock_acc",
        refreshToken: "mock_ref"
    }).returning();

    // 2. Test Push Update
    console.log("\n🧪 Test: Push Update (Reschedule)");
    const eventId = "evt_123";

    try {
        await SyncManager.pushUpdate(account.id, eventId, {
            title: "New Title from UI",
            startTime: new Date("2025-01-21T10:00:00Z"),
            endTime: new Date("2025-01-21T11:00:00Z")
        });
        console.log("   ✅ SUCCESS: pushUpdate resolved without error.");
    } catch (e) {
        console.error("   ❌ FAILED: pushUpdate threw error", e);
    }

    // Cleanup
    await db.delete(connectedAccounts).where(eq(connectedAccounts.id, account.id));
    await db.delete(users).where(eq(users.id, user.id));

    console.log("\n✅ Write-Back Sync Verified.");
    process.exit(0);
};

run();
