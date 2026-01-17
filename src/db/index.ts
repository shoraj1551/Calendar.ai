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
    max: 10, // Connection pool size - critical for Vercel serverless
    idle_timeout: 20, // Close idle connections after 20 seconds
    prepare: false,
    connect_timeout: 10,
    onnotice: () => { },
    ssl: process.env.NODE_ENV === 'production'
        ? { rejectUnauthorized: true } // Verify SSL certificates in production
        : finalConnectionString.includes("localhost") ? false : { rejectUnauthorized: false }
});
export const db = drizzle(client, { schema });
