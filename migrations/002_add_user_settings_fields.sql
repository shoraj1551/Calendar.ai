-- Manual migration to add missing columns to user_settings table
-- Run this SQL on your database before deploying to Vercel

-- Add lunch_break_enabled column (if not exists)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS lunch_break_enabled boolean DEFAULT true NOT NULL;

-- Add ignored_holidays column (if not exists)
ALTER TABLE user_settings 
ADD COLUMN IF NOT EXISTS ignored_holidays jsonb DEFAULT '[]'::jsonb;

-- Verify the columns were added
SELECT column_name, data_type, column_default 
FROM information_schema.columns 
WHERE table_name = 'user_settings' 
AND column_name IN ('lunch_break_enabled', 'ignored_holidays');
