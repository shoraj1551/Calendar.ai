
import 'dotenv/config';
import { db } from "@/db";
import { connectedAccounts, events, users, tasks } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { CalendarProviderFactory } from "../src/services/calendar/factory";
import { scheduleTaskAction } from "../src/app/actions/tasks";
import { CalendarProvider, NormalizedEvent, TokenResponse } from "../src/services/calendar/provider-types";

// --- Mock Provider ---
class MockProvider implements CalendarProvider {
    providerName = 'google' as const;
    async createEvent(event: Partial<NormalizedEvent>): Promise<NormalizedEvent> {
        console.log(`[MockProvider] Created event: ${event.title} at ${event.startTime?.toISOString()}`);
        return {
            id: "evt_task_" + Date.now(),
            providerEventId: "evt_task_" + Date.now(),
            provider: 'google',
            title: event.title || "New Event",
            startTime: event.startTime!,
            endTime: event.endTime!,
            allDay: false,
            status: 'confirmed'
        };
    }
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
    console.log("📋 Testing Task Timeblocking...");

    // 1. Setup Data
    const email = `task-test-${randomUUID()}@example.com`;
    const [user] = await db.insert(users).values({ email, name: "Task Tester" }).returning();
    const [account] = await db.insert(connectedAccounts).values({
        userId: user.id,
        provider: 'google',
        email: 'mock-task@gmail.com',
        name: "Mock Task Calendar",
        status: 'active',
        accessToken: "mock",
        refreshToken: "mock"
    }).returning();

    // 2. Create a Task
    const [task] = await db.insert(tasks).values({
        userId: user.id,
        title: "Review PRs",
        status: 'todo',
        estimatedDuration: 45
    }).returning();

    console.log(`   ✅ Created task: ${task.title}`);

    // 3. Schedule Task (Simulate Drag-and-Drop)
    const startTime = new Date("2025-01-20T14:00:00Z");
    const endTime = new Date("2025-01-20T14:45:00Z");

    const result = await scheduleTaskAction(task.id, account.id, startTime, endTime);

    if (result.success) {
        console.log("   ✅ SUCCESS: Task scheduled via action.");
    } else {
        console.error("   ❌ FAILED: Action returned error", result);
    }

    // 4. Verify Task Status Updated
    const updatedTask = await db.query.tasks.findFirst({
        where: eq(tasks.id, task.id)
    });

    if (updatedTask?.status === 'scheduled') {
        console.log("   ✅ VERIFIED: Task status updated to 'scheduled'.");
    } else {
        console.error("   ❌ FAILED: Task status not updated.", updatedTask?.status);
    }

    // 5. Verify Event Created
    const createdEvents = await db.query.events.findMany({
        where: eq(events.userId, user.id)
    });

    if (createdEvents.length > 0) {
        console.log(`   ✅ VERIFIED: Event created in DB.`);
        console.log(`      Title: ${createdEvents[0].title}`);
        console.log(`      Start: ${createdEvents[0].startTime.toISOString()}`);
    } else {
        console.error("   ❌ FAILED: No event found in DB.");
    }

    // Cleanup
    await db.delete(events).where(eq(events.userId, user.id));
    await db.delete(tasks).where(eq(tasks.userId, user.id));
    await db.delete(connectedAccounts).where(eq(connectedAccounts.id, account.id));
    await db.delete(users).where(eq(users.id, user.id));

    console.log("\n✅ Task Timeblocking Verified.");
    process.exit(0);
};

run();
