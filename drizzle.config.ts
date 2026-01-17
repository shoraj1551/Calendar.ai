import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

let connectionString = process.env.DATABASE_URL!;
// Temporarily disabled DNS patch - using proper hostname for Aiven connection
// if (connectionString && connectionString.includes("pg-3ee00806-calendarai-d621.k.aivencloud.com")) {
//     console.log("Applying DNS Patch to Connection String...");
//     connectionString = connectionString.replace("pg-3ee00806-calendarai-d621.k.aivencloud.com", "64.227.191.215");
// }


export default defineConfig({
    schema: "./src/db/schema.ts",
    out: "./drizzle",
    dialect: "postgresql",
    dbCredentials: {
        url: connectionString,
        ssl: { rejectUnauthorized: false } // Force node-postgres (used by drizzle-kit) to accept IP cert
    },
});
