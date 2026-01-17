-- Add lunch_break_enabled column to user_settings table
ALTER TABLE "user_settings" ADD COLUMN "lunch_break_enabled" boolean DEFAULT true NOT NULL;
