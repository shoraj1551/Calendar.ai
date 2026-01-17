ALTER TABLE "connected_accounts" ADD COLUMN "preferences" jsonb DEFAULT '{}'::jsonb NOT NULL;--> statement-breakpoint
ALTER TABLE "connected_accounts" ADD COLUMN "ignored_holidays" jsonb DEFAULT '[]'::jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "is_urgent" boolean DEFAULT false;--> statement-breakpoint
ALTER TABLE "user_settings" ADD COLUMN "ignored_holidays" jsonb DEFAULT '[]'::jsonb;