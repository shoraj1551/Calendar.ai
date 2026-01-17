-- Migration: Add user_settings and user_energy_zones tables
-- Run this SQL in your PostgreSQL database

-- Create user_settings table
CREATE TABLE IF NOT EXISTS user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id),
    
    -- Calendar preferences
    default_view TEXT NOT NULL DEFAULT 'week' CHECK (default_view IN ('day', 'week', 'month')),
    working_hours_start INTEGER NOT NULL DEFAULT 9,
    working_hours_end INTEGER NOT NULL DEFAULT 17,
    show_weekends BOOLEAN NOT NULL DEFAULT true,
    first_day_of_week INTEGER NOT NULL DEFAULT 0,
    
    -- Notification preferences
    email_notifications BOOLEAN NOT NULL DEFAULT true,
    browser_notifications BOOLEAN NOT NULL DEFAULT true,
    reminder_minutes INTEGER NOT NULL DEFAULT 15,
    
    -- Other preferences
    timezone TEXT NOT NULL DEFAULT 'UTC',
    
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create user_energy_zones table
CREATE TABLE IF NOT EXISTS user_energy_zones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    
    -- Time range (24-hour format)
    start_hour INTEGER NOT NULL CHECK (start_hour >= 0 AND start_hour <= 23),
    end_hour INTEGER NOT NULL CHECK (end_hour >= 0 AND end_hour <= 23),
    
    -- Energy level
    energy_level TEXT NOT NULL CHECK (energy_level IN ('high', 'medium', 'low')),
    
    -- Metadata
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_settings_user_id ON user_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_user_energy_zones_user_id ON user_energy_zones(user_id);

-- Verify tables created
SELECT 'user_settings table created' as status 
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_settings');

SELECT 'user_energy_zones table created' as status 
WHERE EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user_energy_zones');
