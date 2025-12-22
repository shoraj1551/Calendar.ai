
import 'dotenv/config';
import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";

async function check() {
    console.log("🔍 Checking Application DB Connection...");
    console.log(`📡 URL: ${process.env.DATABASE_URL ? "Defined" : "MISSING"}`);

    try {
        const email = "shorajtomer@gmail.com";
        console.log(`👤 Querying for user: ${email}`);

        const user = await db.query.users.findFirst({
            where: eq(users.email, email)
        });

        if (user) {
            console.log(`✅ SUCCESS: Found user ${user.id}`);
        } else {
            console.log("✅ SUCCESS: DB Connected (User not found, but query worked)");
        }
        process.exit(0);
    } catch (e: any) {
        console.error("❌ FAILED:");
        console.error(e);
        process.exit(1);
    }
}

check();
