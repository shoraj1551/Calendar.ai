
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
    console.error("DATABASE_URL not found");
    process.exit(1);
}

const client = postgres(connectionString);
const db = drizzle(client);

async function checkTables() {
    try {
        console.log("Connected to DB...");

        // Query information_schema for tables
        const result = await client`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema NOT IN ('pg_catalog', 'information_schema')
            ORDER BY table_schema, table_name;
        `;

        if (result.length === 0) {
            console.log("No tables found in user schemas.");
        } else {
            console.log("Found tables:");
            result.forEach(row => {
                console.log(`- ${row.table_schema}.${row.table_name}`);
            });
        }
    } catch (e) {
        console.error("Error connecting or querying:", e);
    } finally {
        await client.end();
    }
}

checkTables();
