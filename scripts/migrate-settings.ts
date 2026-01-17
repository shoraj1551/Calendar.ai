import { db } from '../src/db';
import { sql } from 'drizzle-orm';

async function runMigration() {
    console.log('🔄 Starting database migration...');

    try {
        // Create user_settings table
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_settings (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL UNIQUE REFERENCES users(id),
        default_view TEXT NOT NULL DEFAULT 'week' CHECK (default_view IN ('day', 'week', 'month')),
        working_hours_start INTEGER NOT NULL DEFAULT 9,
        working_hours_end INTEGER NOT NULL DEFAULT 17,
        show_weekends BOOLEAN NOT NULL DEFAULT true,
        first_day_of_week INTEGER NOT NULL DEFAULT 0,
        email_notifications BOOLEAN NOT NULL DEFAULT true,
        browser_notifications BOOLEAN NOT NULL DEFAULT true,
        reminder_minutes INTEGER NOT NULL DEFAULT 15,
        timezone TEXT NOT NULL DEFAULT 'UTC',
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        console.log('✅ user_settings table created');

        // Create user_energy_zones table
        await db.execute(sql`
      CREATE TABLE IF NOT EXISTS user_energy_zones (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id UUID NOT NULL REFERENCES users(id),
        start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
        end_hour INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 23),
        energy_level TEXT NOT NULL CHECK (energy_level IN ('high', 'medium', 'low')),
        created_at TIMESTAMP NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMP NOT NULL DEFAULT NOW()
      );
    `);
        console.log('✅ user_energy_zones table created');

        // Create indexes
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
    `);
        await db.execute(sql`
      CREATE INDEX IF NOT EXISTS idx_user_energy_zones_user_id ON user_energy_zones(user_id);
    `);
        console.log('✅ Indexes created');

        console.log('🎉 Migration completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('❌ Migration failed:', error);
        process.exit(1);
    }
}

runMigration();
