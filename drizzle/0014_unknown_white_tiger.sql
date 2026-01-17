ALTER TABLE "tasks" ADD COLUMN "estimated_duration" integer DEFAULT 30;--> statement-breakpoint
ALTER TABLE "tasks" ADD COLUMN "allocated_event_id" text;