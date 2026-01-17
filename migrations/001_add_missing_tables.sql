-- Add the 2 missing tables to your Aiven database
-- Run this in the Aiven SQL editor

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
-- VERIFY ALL 12 TABLES EXIST
-- ============================================
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
