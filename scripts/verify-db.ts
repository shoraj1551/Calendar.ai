
import 'dotenv/config';
import { db } from "../src/db";
import { events, connectedAccounts } from "../src/db/schema";
import { eq } from "drizzle-orm";

async function checkEvents() {
    try {
        console.log("Querying events...");
        const allEvents = await db.query.events.findMany({
            limit: 5
        });

        console.log(`Found ${allEvents.length} events.`);
        if (allEvents.length > 0) {
            console.log("Sample Event:", JSON.stringify(allEvents[0], null, 2));
        }

        const accounts = await db.query.connectedAccounts.findMany();
        console.log(`Found ${accounts.length} connected accounts.`);
        if (accounts.length > 0) {
            console.log("Sample Account:", JSON.stringify(accounts[0], null, 2));
        }

    } catch (error) {
        console.error("Error querying database:", error);
    }
    process.exit(0);
}

checkEvents();
