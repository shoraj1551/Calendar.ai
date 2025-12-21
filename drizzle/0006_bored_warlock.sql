ALTER TABLE "meetings" ADD COLUMN "embedding" jsonb;--> statement-breakpoint
CREATE INDEX "timestamp_idx" ON "activity_logs" USING btree ("timestamp");--> statement-breakpoint
CREATE INDEX "start_time_idx" ON "events" USING btree ("start_time");--> statement-breakpoint
CREATE INDEX "scheduled_for_idx" ON "notifications" USING btree ("scheduled_for");