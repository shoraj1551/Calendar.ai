"use server";

import { auth } from "@/auth";
import { db } from "@/db"; // Assuming db is exported from here, need to verify
import { userSettings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export async function getSettings() {
    const session = await auth();

    if (!session?.user?.id) {
        // For development/demo purposes, return empty (defaults) instead of blocking
        console.warn("getSettings: No session found, returning defaults");
        return {};
    }

    const settings = await db.select().from(userSettings).where(eq(userSettings.userId, session.user.id));

    return settings[0]?.preferences || {};
}

export async function updateSettings(newPreferences: Record<string, any>) {
    const session = await auth();

    if (!session?.user?.id) {
        console.warn("updateSettings: No session found, skipping save");
        return { error: "Unauthorized" };
    }

    // Upsert logic
    await db.insert(userSettings).values({
        userId: session.user.id,
        preferences: newPreferences,
        updatedAt: new Date(),
    }).onConflictDoUpdate({
        target: userSettings.userId,
        set: {
            preferences: newPreferences,
            updatedAt: new Date(),
        }
    });

    revalidatePath("/settings");
    return { success: true };
}
