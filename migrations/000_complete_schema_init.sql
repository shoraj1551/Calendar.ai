-- ============================================
-- Calendar.ai - Complete Database Schema
-- Run this on your Aiven PostgreSQL database
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- USERS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "users" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "email" text NOT NULL UNIQUE,
    "name" text,
    "onboarding_status" text DEFAULT 'pending',
    "work_start" text DEFAULT '09:00',
    "work_end" text DEFAULT '17:00',
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- CONNECTED ACCOUNTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "connected_accounts" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "provider" text NOT NULL,
    "email" text NOT NULL,
    "name" text,
    "status" text DEFAULT 'active' NOT NULL,
    "is_primary" boolean DEFAULT false NOT NULL,
    "access_token" text,
    "refresh_token" text,
    "expires_at" timestamp,
    "preferences" jsonb DEFAULT '{}' NOT NULL,
    "ignored_holidays" jsonb DEFAULT '[]',
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "connected_accounts_user_id_idx" ON "connected_accounts"("user_id");

-- ============================================
-- EVENTS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "events" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "connected_account_id" uuid REFERENCES "connected_accounts"("id"),
    "title" text NOT NULL,
    "description" text,
    "start_time" timestamp NOT NULL,
    "end_time" timestamp NOT NULL,
    "all_day" boolean DEFAULT false,
    "location" text,
    "type" text DEFAULT 'work',
    "provider" text DEFAULT 'local',
    "provider_event_id" text,
    "status" text DEFAULT 'confirmed',
    "is_urgent" boolean DEFAULT false,
    "html_link" text,
    "organizer" jsonb,
    "attendees" jsonb,
    "created_at" timestamp DEFAULT now()
);

CREATE INDEX IF NOT EXISTS "start_time_idx" ON "events"("start_time");
CREATE INDEX IF NOT EXISTS "provider_event_id_idx" ON "events"("provider_event_id");

-- ============================================
-- TASKS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "tasks" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "title" text NOT NULL,
    "description" text,
    "status" text DEFAULT 'todo' NOT NULL,
    "priority" text DEFAULT 'medium' NOT NULL,
    "due_date" timestamp,
    "estimated_duration" integer DEFAULT 30,
    "allocated_event_id" text,
    "source" text DEFAULT 'manual' NOT NULL,
    "source_id" text,
    "completed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- MEETING NOTES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "meeting_notes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "event_id" uuid NOT NULL REFERENCES "events"("id") ON DELETE CASCADE,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "raw_notes" text NOT NULL,
    "summary" text,
    "key_points" text[],
    "decisions" text[],
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- ACTION ITEMS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "action_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "meeting_note_id" uuid NOT NULL REFERENCES "meeting_notes"("id") ON DELETE CASCADE,
    "task_id" uuid REFERENCES "tasks"("id"),
    "description" text NOT NULL,
    "assignee" text,
    "due_date" timestamp,
    "priority" text DEFAULT 'medium' NOT NULL,
    "status" text DEFAULT 'pending' NOT NULL,
    "confidence" real,
    "extracted_from" text,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "completed_at" timestamp
);

-- ============================================
-- USER SETTINGS TABLE (WITH NEW FIELDS)
-- ============================================
CREATE TABLE IF NOT EXISTS "user_settings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL UNIQUE REFERENCES "users"("id"),
    
    -- Calendar preferences
    "default_view" text DEFAULT 'week' NOT NULL,
    "working_hours_start" integer DEFAULT 9 NOT NULL,
    "working_hours_end" integer DEFAULT 17 NOT NULL,
    "show_weekends" boolean DEFAULT true NOT NULL,
    "first_day_of_week" integer DEFAULT 0 NOT NULL,
    
    -- Notification preferences
    "email_notifications" boolean DEFAULT true NOT NULL,
    "browser_notifications" boolean DEFAULT true NOT NULL,
    "reminder_minutes" integer DEFAULT 15 NOT NULL,
    
    -- Schedule analysis preferences (NEW FIELDS)
    "lunch_break_enabled" boolean DEFAULT true NOT NULL,
    "ignored_holidays" jsonb DEFAULT '[]',
    
    -- Other preferences
    "timezone" text DEFAULT 'UTC' NOT NULL,
    
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- USER ENERGY ZONES TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "user_energy_zones" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "start_hour" integer NOT NULL,
    "end_hour" integer NOT NULL,
    "energy_level" text NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- MEETINGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "meetings" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "event_id" uuid REFERENCES "events"("id"),
    "title" text NOT NULL,
    "start_time" timestamp DEFAULT now() NOT NULL,
    "end_time" timestamp,
    "transcript" text,
    "summary" text,
    "audio_url" text,
    "embedding" jsonb,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- FOCUS SESSIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "focus_sessions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "start_time" timestamp NOT NULL,
    "end_time" timestamp,
    "label" text,
    "duration" integer,
    "status" text DEFAULT 'running' NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

-- ============================================
-- ACTIVITY LOGS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "activity_logs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "timestamp" timestamp DEFAULT now() NOT NULL,
    "type" text NOT NULL,
    "metadata" text
);

CREATE INDEX IF NOT EXISTS "timestamp_idx" ON "activity_logs"("timestamp");

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE IF NOT EXISTS "notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "users"("id"),
    "type" text NOT NULL,
    "title" text NOT NULL,
    "message" text,
    "scheduled_for" timestamp DEFAULT now() NOT NULL,
    "is_read" boolean DEFAULT false,
    "data" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE INDEX IF NOT EXISTS "scheduled_for_idx" ON "notifications"("scheduled_for");

-- ============================================
-- VERIFICATION QUERY
-- ============================================
-- Run this to verify all tables were created:
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
