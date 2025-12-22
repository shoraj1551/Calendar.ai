import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

let connectionString = process.env.DATABASE_URL!;
if (connectionString && connectionString.includes("pg-3ee00806-calendarai-d621.k.aivencloud.com")) {
    console.log("Applying DNS Patch to Connection String...");
    connectionString = connectionString.replace("pg-3ee00806-calendarai-d621.k.aivencloud.com", "64.227.191.215");
    // Append SSL rejectUnauthorized=false to avoid IP certificate mismatch issues if needed, strictly speaking URLs usually handle param params but here we have string. 
    // Drizzle kit often needs explicit SSL params if not in string. 
    // Usually 'sslmode=require' is in string. We might need logic.
    // However, Aiven usually works with IP if 'sslmode=require' is present, but certificate validation fails.
    // If connection string has sslmode=require, we might change it to no-verify if possible or just rely on it working loosely.
}

export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString,
        ssl: { rejectUnauthorized: false } // Force node-postgres (used by drizzle-kit) to accept IP cert
    },
});
