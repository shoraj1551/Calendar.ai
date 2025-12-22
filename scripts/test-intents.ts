
import 'dotenv/config';
import { EventRepository } from "../src/services/events/db";
import { db } from "@/db";

const run = async () => {
    console.log("🧪 Testing Meaningful Time Blocks...");
    const email = "shorajtomer@gmail.com";

    // 1. Create specific intents
    console.log("\n1. Creating 'Focus' block...");
    const focusEvt = await EventRepository.create(email, {
        title: "Deep Work Session",
        start: new Date(),
        end: new Date(new Date().getTime() + 3600000),
        type: "focus",
        description: "Coding intensely"
    });
    console.log(`   ✅ Created ID: ${focusEvt.id} | Type: ${focusEvt.type}`);

    console.log("\n2. Creating 'Social' block...");
    const socialEvt = await EventRepository.create(email, {
        title: "Dinner with Team",
        start: new Date(),
        end: new Date(new Date().getTime() + 7200000),
        type: "social",
        description: "Networking"
    });
    console.log(`   ✅ Created ID: ${socialEvt.id} | Type: ${socialEvt.type}`);

    // 3. Verify Persistence
    if (focusEvt.type === 'focus' && socialEvt.type === 'social') {
        console.log("\n✅ SUCCESS: Blocks persisted with correct semantic types.");
    } else {
        console.error("\n❌ FAILED: Types reverted to default.");
        process.exit(1);
    }

    // Cleanup (Optional, but good practice)
    await EventRepository.delete(focusEvt.id);
    await EventRepository.delete(socialEvt.id);
    console.log("\n🧹 Cleanup done.");
    process.exit(0);
};

run();
