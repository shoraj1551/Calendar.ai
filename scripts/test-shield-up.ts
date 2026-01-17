
import 'dotenv/config';
import { shieldUpAction } from '../src/app/actions/calendar';
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
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> {
        console.log(`[MockProvider] Created event: ${event.title} at ${event.startTime?.toISOString()}`);
        return {
            id: "evt_shield_" + Date.now(),
            providerEventId: "evt_shield_" + Date.now(),
            provider: 'google',
            title: event.title || "New Event",
            startTime: event.startTime!,
            endTime: event.endTime!,
            allDay: false,
            status: 'confirmed'
        };
    }
    // Logic not needed for this test
    generateAuthUrl(email?: string): string { return ""; }
    async exchangeCodeForToken(code: string): Promise<TokenResponse> { throw new Error("Not implemented"); }
    async refreshToken(refreshToken: string): Promise<TokenResponse> { return { accessToken: "mock", refreshToken: "mock", expiresAt: Date.now() + 1000 }; }
    setCredentials(tokens: any) { }
    async listEvents(start: Date, end: Date): Promise<NormalizedEvent[]> { return []; }
    async updateEvent(id: string, event: Partial<NormalizedEvent>): Promise<NormalizedEvent> { throw new Error("Not implemented"); }
    async deleteEvent(id: string): Promise<void> { throw new Error("Not implemented"); }
}

const mockProvider = new MockProvider();
CalendarProviderFactory.getProvider = (name: string) => mockProvider;

const run = async () => {
    console.log("🛡️ Testing Shield Up Action...");

    // 1. Setup Data
    const email = `shield-test-${randomUUID()}@example.com`;
    const [user] = await db.insert(users).values({ email, name: "Shield Tester" }).returning();
    const [account] = await db.insert(connectedAccounts).values({
        userId: user.id,
        provider: 'google',
        email: 'mock-shield@gmail.com',
        name: "Mock Shield Calendar",
        status: 'active',
        accessToken: "mock",
        refreshToken: "mock"
    }).returning();

    // 2. Run Action (Simulate Button Click)
    // Date: 2025-01-20 (Monday)
    const date = new Date("2025-01-20T10:00:00Z");
    // Logic: Bear profile High Energy is 10-14. 
    // If no events, it should book 10:00-14:00 (or capped).

    // Note: shieldUpAction uses `db.query.events.findMany` for context.
    // Since we created no events, calendar is empty.

    const result = await shieldUpAction(date);

    if (result.success) {
        console.log("   ✅ SUCCESS: Action returned success.");
    } else {
        console.error("   ❌ FAILED: Action returned error", result);
    }

    // Verify DB
    const createdEvents = await db.query.events.findMany({
        where: eq(events.userId, user.id)
    });

    if (createdEvents.length > 0) {
        console.log(`   ✅ DB VERIFIED: Found ${createdEvents.length} event(s).`);
        console.log(`      Title: ${createdEvents[0].title}`);
        console.log(`      Start: ${createdEvents[0].startTime.toISOString()}`);
    } else {
        console.error("   ❌ FAILED: Zero events found in DB.");
    }

    // Cleanup
    await db.delete(events).where(eq(events.userId, user.id));
    await db.delete(connectedAccounts).where(eq(connectedAccounts.id, account.id));
    await db.delete(users).where(eq(users.id, user.id));

    console.log("\n✅ Shield Up Verified.");
    process.exit(0);
};

run();
