
import { db } from "@/db";
import { userEnergyZones } from "@/db/schema";
import { eq, and, or } from "drizzle-orm";

export type EnergyLevel = "high" | "medium" | "low" | "drain";

export const EnergyService = {
    /**
     * Seeds default energy zones for a user (Morning = High, Lunch = Drain, Afternoon = Medium).
     */
    async seedDefaultZones(userId: string) {
        const defaultZones = [
            { dayOfWeek: "all", startTime: "09:00", endTime: "11:30", energyLevel: "high" }, // Deep Work
            { dayOfWeek: "all", startTime: "13:00", endTime: "14:00", energyLevel: "drain" }, // Post-Lunch Dip
            { dayOfWeek: "all", startTime: "14:00", endTime: "16:00", energyLevel: "medium" }, // Collab
            { dayOfWeek: "all", startTime: "16:00", endTime: "17:00", energyLevel: "low" },   // Wrap up
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
            and(
                eq(userEnergyZones.userId, userId),
                or(
                    eq(userEnergyZones.dayOfWeek, "all"),
                    eq(userEnergyZones.dayOfWeek, date.toLocaleDateString("en-US", { weekday: "long" }).toLowerCase())
                )
            )
        );

        if (zones.length === 0) return "medium"; // Default

        const hour = date.getHours();
        const minute = date.getMinutes();
        const timeVal = hour * 60 + minute; // Minutes from midnight

        let currentLevel: EnergyLevel = "medium";

        // 2. Find matching zone
        // Simple linear scan. If multiple match, last one wins (or "High" wins? let's stick to simple first match for now)
        for (const zone of zones) {
            const [startH, startM] = zone.startTime.split(":").map(Number);
            const [endH, endM] = zone.endTime.split(":").map(Number);

            const startVal = startH * 60 + startM;
            const endVal = endH * 60 + endM;

            if (timeVal >= startVal && timeVal < endVal) {
                currentLevel = zone.energyLevel as EnergyLevel;
                break;
            }
        }

        return currentLevel;
    }
};
