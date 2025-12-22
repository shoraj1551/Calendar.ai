ALTER TABLE "users" ADD COLUMN "onboarding_status" text DEFAULT 'pending';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_start" text DEFAULT '09:00';--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "work_end" text DEFAULT '17:00';