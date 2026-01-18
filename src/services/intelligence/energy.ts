
import { db } from "@/db";
import { userEnergyZones } from "@/db/schema";
import { eq } from "drizzle-orm";

export type EnergyLevel = "high" | "medium" | "low" | "drain";

export const EnergyService = {
    /**
     * Seeds default energy zones for a user (Morning = High, Lunch = Drain, Afternoon = Medium).
     */
    async seedDefaultZones(userId: string) {
        const defaultZones = [
            { startHour: 9, endHour: 11, energyLevel: "high" }, // Deep Work (9-11am)
            { startHour: 13, endHour: 14, energyLevel: "drain" }, // Post-Lunch Dip
            { startHour: 14, endHour: 16, energyLevel: "medium" }, // Collab
            { startHour: 16, endHour: 17, energyLevel: "low" },   // Wrap up
        ];

        const values = defaultZones.map(z => ({ ...z, userId, energyLevel: z.energyLevel as EnergyLevel }));

        // Check if zones exist first to avoid duplicates
        const existing = await db.select().from(userEnergyZones).where(eq(userEnergyZones.userId, userId));
        if (existing.length === 0) {
            await db.insert(userEnergyZones).values(values);
        }
    },

    /**
     * Gets the predicted energy level for a specific time.
     */
    async getEnergyLevel(userId: string, date: Date): Promise<EnergyLevel> {
        // 1. Fetch zones
        const zones = await db.select().from(userEnergyZones).where(
            eq(userEnergyZones.userId, userId)
        );

        if (zones.length === 0) return "medium"; // Default

        const hour = date.getHours();
        const minute = date.getMinutes();
        const timeVal = hour * 60 + minute; // Minutes from midnight

        let currentLevel: EnergyLevel = "medium";

        // 2. Find matching zone
        // Simple linear scan. If multiple match, last one wins (or "High" wins? let's stick to simple first match for now)
        for (const zone of zones) {
            const startVal = zone.startHour * 60; // Convert hour to minutes
            const endVal = zone.endHour * 60;

            if (timeVal >= startVal && timeVal < endVal) {
                currentLevel = zone.energyLevel as EnergyLevel;
                break;
            }
        }

        return currentLevel;
    }
};
