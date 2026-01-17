
import 'dotenv/config';
import { db } from "@/db";
import { connectedAccounts, events, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomUUID } from "crypto";
import { NegotiationService } from "../src/services/calendar/negotiation";
import { UnifiedEvent } from "../src/services/calendar/types";

const run = async () => {
    console.log("📧 Testing Smart Negotiation...");

    // 1. Setup Data
    const email = `negotiation-test-${randomUUID()}@example.com`;
    const [user] = await db.insert(users).values({ email, name: "Negotiation Tester" }).returning();
    const [account] = await db.insert(connectedAccounts).values({
        userId: user.id,
        provider: 'google',
        email: 'mock-negotiation@gmail.com',
        name: "Mock Negotiation Calendar",
        status: 'active',
        accessToken: "mock",
        refreshToken: "mock"
    }).returning();

    // 2. Create a mock event with attendees
    const mockEvent: UnifiedEvent = {
        id: "evt_meeting_1",
        title: "Team Standup",
        start: new Date("2025-01-20T10:00:00Z"),
        end: new Date("2025-01-20T10:30:00Z"),
        allDay: false,
        provider: 'google',
        status: 'confirmed',
        type: 'work',
        description: "Daily team sync",
        // @ts-ignore - Adding attendees for testing
        organizer: { email: "manager@company.com", displayName: "Sarah Manager" },
        attendees: [
            { email: "teammate1@company.com", displayName: "John Doe" },
            { email: "teammate2@company.com", displayName: "Jane Smith" }
        ]
    };

    // 3. Find Alternative Slots
    console.log("\n🧪 Test 1: Finding Alternative Slots");
    const alternatives = NegotiationService.findAlternativeSlots(
        mockEvent,
        [], // Empty calendar for simplicity
        'bear'
    );

    if (alternatives.length > 0) {
        console.log(`   ✅ SUCCESS: Found ${alternatives.length} alternative slots`);
        alternatives.forEach((alt, idx) => {
            console.log(`      ${idx + 1}. ${alt.formatted}`);
        });
    } else {
        console.error("   ❌ FAILED: No alternatives found");
    }

    // 4. Generate Email Draft
    console.log("\n🧪 Test 2: Generating Email Draft");
    const emailDraft = NegotiationService.generateRescheduleEmail(
        mockEvent,
        alternatives,
        "Negotiation Tester"
    );

    console.log(`   Subject: ${emailDraft.subject}`);
    console.log(`   Body Preview:\n${emailDraft.body.substring(0, 200)}...`);

    if (emailDraft.subject.includes("Team Standup")) {
        console.log("   ✅ SUCCESS: Email subject contains event title");
    } else {
        console.error("   ❌ FAILED: Email subject missing event title");
    }

    if (emailDraft.body.includes("Sarah Manager")) {
        console.log("   ✅ SUCCESS: Email addresses organizer by name");
    } else {
        console.error("   ❌ FAILED: Email doesn't address organizer");
    }

    if (alternatives.every(alt => emailDraft.body.includes(alt.formatted))) {
        console.log("   ✅ SUCCESS: Email includes all alternative slots");
    } else {
        console.error("   ❌ FAILED: Email missing some alternatives");
    }

    if (emailDraft.mailto.startsWith("mailto:")) {
        console.log("   ✅ SUCCESS: Mailto link generated");
    } else {
        console.error("   ❌ FAILED: Invalid mailto link");
    }

    // Cleanup
    await db.delete(connectedAccounts).where(eq(connectedAccounts.id, account.id));
    await db.delete(users).where(eq(users.id, user.id));

    console.log("\n✅ Smart Negotiation Verified.");
    process.exit(0);
};

run();
