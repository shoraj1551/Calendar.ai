CREATE TABLE "action_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"meeting_note_id" uuid NOT NULL,
	"task_id" uuid,
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
--> statement-breakpoint
CREATE TABLE "meeting_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"user_id" uuid NOT NULL,
	"raw_notes" text NOT NULL,
	"summary" text,
	"key_points" text[],
	"decisions" text[],
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
DROP INDEX "energy_zones_user_id_idx";--> statement-breakpoint
ALTER TABLE "user_energy_zones" ALTER COLUMN "energy_level" DROP DEFAULT;--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'user_settings'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "user_settings" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "user_energy_zones" ADD COLUMN "start_hour" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_energy_zones" ADD COLUMN "end_hour" integer NOT NULL;--> statement-breakpoint
ALTER TABLE "user_energy_zones" ADD COLUMN "updated_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "default_view" text DEFAULT 'week' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "working_hours_start" integer DEFAULT 9 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "working_hours_end" integer DEFAULT 17 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "show_weekends" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "first_day_of_week" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "email_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "browser_notifications" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "reminder_minutes" integer DEFAULT 15 NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "lunch_break_enabled" boolean DEFAULT true NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "timezone" text DEFAULT 'UTC' NOT NULL;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "created_at" timestamp DEFAULT now() NOT NULL;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_meeting_note_id_meeting_notes_id_fk" FOREIGN KEY ("meeting_note_id") REFERENCES "public"."meeting_notes"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "action_items" ADD CONSTRAINT "action_items_task_id_tasks_id_fk" FOREIGN KEY ("task_id") REFERENCES "public"."tasks"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "meeting_notes" ADD CONSTRAINT "meeting_notes_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_energy_zones" DROP COLUMN "day_of_week";--> statement-breakpoint
ALTER TABLE "user_energy_zones" DROP COLUMN "start_time";--> statement-breakpoint
ALTER TABLE "user_energy_zones" DROP COLUMN "end_time";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "preferences";--> statement-breakpoint
ALTER TABLE "user_settings" DROP COLUMN "ignored_holidays";--> statement-breakpoint
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_user_id_unique" UNIQUE("user_id");