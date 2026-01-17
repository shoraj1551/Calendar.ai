import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

const connectionString = process.env.DATABASE_URL || "postgres://postgres:admin@localhost:5432/calendar_ai";

// Workaround for ENOTFOUND: Manually resolve hostname if needed (or hardcode IP if known)
// We will simply use the connection string as is for now, but adding logging.
console.log(`[DB] Connecting...`);

// Connection string is used directly. DNS resolution is handled by the driver.
const finalConnectionString = connectionString;

export const client = postgres(finalConnectionString, {
    prepare: false,
    connect_timeout: 10,
    onnotice: () => { },
    ssl: finalConnectionString.includes("localhost") ? false : { rejectUnauthorized: false } // Disable SSL for local
});
export const db = drizzle(client, { schema });
