import { db } from "./src/db/index.js";
import { sql } from "drizzle-orm";

async function addLunchBreakColumn() {
    try {
        console.log("Adding lunch_break_enabled column to user_settings table...");

        await db.execute(sql`
            ALTER TABLE user_settings 
            ADD COLUMN IF NOT EXISTS lunch_break_enabled boolean DEFAULT true NOT NULL
        `);

        console.log("✓ Successfully added lunch_break_enabled column!");
        process.exit(0);
    } catch (error) {
        console.error("Error adding column:", error);
        process.exit(1);
    }
}

addLunchBreakColumn();
