import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:admin@localhost:5432/calendar_ai";

// Workaround for ENOTFOUND: Manually resolve hostname if needed (or hardcode IP if known)
// We will simply use the connection string as is for now, but adding logging.
console.log(`[DB] Connecting...`);

let finalConnectionString = connectionString;
if (connectionString.includes("pg-3ee00806-calendarai-d621.k.aivencloud.com")) {
    console.log("[DB] Applying DNS Patch: Swapping hostname for known IP (64.227.191.215)");
    finalConnectionString = connectionString.replace("pg-3ee00806-calendarai-d621.k.aivencloud.com", "64.227.191.215");
}

export const client = postgres(finalConnectionString, {
    prepare: false,
    // Add strict timeout to fail fast if stuck
    connect_timeout: 10,
    onnotice: () => { },
    ssl: { rejectUnauthorized: false } // Required when using IP directly often
});
export const db = drizzle(client, { schema });
