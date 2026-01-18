-- Add CHECK constraint to enforce energy level enum values including 'drain'
ALTER TABLE "user_energy_zones" DROP CONSTRAINT IF EXISTS "user_energy_zones_energy_level_check";--> statement-breakpoint
ALTER TABLE "user_energy_zones" ADD CONSTRAINT "user_energy_zones_energy_level_check" CHECK ("energy_level" IN ('high', 'medium', 'low', 'drain'));
