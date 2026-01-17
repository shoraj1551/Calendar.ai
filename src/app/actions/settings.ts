'use server'

import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings, userEnergyZones } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getUserSettingsAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        const settings = await db.query.userSettings.findFirst({
            where: eq(userSettings.userId, session.user.id)
        });

        return { success: true, settings };
    } catch (error: any) {
        console.error('[Settings] Get error:', error);
        return { success: false, error: "Failed to get settings" };
    }
}

export async function saveUserSettingsAction(data: {
    defaultView?: string;
    workingHoursStart?: number;
    workingHoursEnd?: number;
    showWeekends?: boolean;
    firstDayOfWeek?: number;
    timezone?: string;
}) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        // Upsert settings
        await db.insert(userSettings)
            .values({
                userId: session.user.id,
                ...data,
            })
            .onConflictDoUpdate({
                target: userSettings.userId,
                set: {
                    ...data,
                    updatedAt: new Date(),
                },
            });

        revalidatePath('/settings');
        return { success: true };
    } catch (error: any) {
        console.error('[Settings] Save error:', error);
        return { success: false, error: "Failed to save settings" };
    }
}

export async function getEnergyZonesAction() {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        const zones = await db.query.userEnergyZones.findMany({
            where: eq(userEnergyZones.userId, session.user.id)
        });

        return { success: true, zones };
    } catch (error: any) {
        console.error('[Energy Zones] Get error:', error);
        return { success: false, error: "Failed to get energy zones" };
    }
}

export async function saveEnergyZonesAction(zones: Array<{
    startHour: number;
    endHour: number;
    energyLevel: 'high' | 'medium' | 'low';
}>) {
    try {
        const session = await auth();
        if (!session?.user?.id) {
            return { success: false, error: "Please sign in" };
        }

        // Delete existing zones
        await db.delete(userEnergyZones)
            .where(eq(userEnergyZones.userId, session.user.id));

        // Insert new zones
        if (zones.length > 0) {
            await db.insert(userEnergyZones).values(
                zones.map(zone => ({
                    userId: session.user.id!,
                    ...zone,
                }))
            );
        }

        revalidatePath('/settings');
        return { success: true };
    } catch (error: any) {
        console.error('[Energy Zones] Save error:', error);
        return { success: false, error: "Failed to save energy zones" };
    }
}
