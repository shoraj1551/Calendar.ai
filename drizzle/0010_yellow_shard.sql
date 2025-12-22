ALTER TABLE "events" ADD COLUMN "provider_event_id" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "status" text DEFAULT 'confirmed';--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "html_link" text;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "organizer" jsonb;--> statement-breakpoint
ALTER TABLE "events" ADD COLUMN "attendees" jsonb;--> statement-breakpoint
CREATE INDEX "provider_event_id_idx" ON "events" USING btree ("provider_event_id");