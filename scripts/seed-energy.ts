
import 'dotenv/config';
import { db } from "@/db";
import { users } from "@/db/schema";
import { EnergyService } from "@/services/intelligence/energy";
import { eq } from "drizzle-orm";

const seed = async () => {
    console.log("🌱 Seeding Energy Zones...");

    // 1. Get a user (just the first one for now)
    const allUsers = await db.select().from(users).limit(1);
    if (allUsers.length === 0) {
        console.error("❌ No users found in DB. Cannot seed.");
        process.exit(1);
    }

    const user = allUsers[0];
    console.log(`👤 Found User: ${user.email} (${user.id})`);

    // 2. Seed
    await EnergyService.seedDefaultZones(user.id);
    console.log("✅ Seeded default zones.");

    // 3. Verify
    const level = await EnergyService.getEnergyLevel(user.id, new Date()); // Now
    console.log(`⚡ Current Energy Level for User: ${level.toUpperCase()}`);

    process.exit(0);
};

seed();
