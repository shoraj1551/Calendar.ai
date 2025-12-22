"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings, users } from "@/db/schema"; // Added users
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to ensure user exists (mirroring EventRepository logic)
async function ensureUser(email: string) {
    const user = await db.query.users.findFirst({ where: eq(users.email, email) });
    if (user) return user.id;

    const [newUser] = await db.insert(users).values({
        email,
        name: email.split("@")[0]
    }).returning();
    return newUser.id;
}

export async function getSettings() {
    const session = await auth();

    if (!session?.user?.email) {
        // For development/demo purposes, return empty (defaults) instead of blocking
        console.warn("getSettings: No session email found, returning defaults");
        return {};
    }

    try {
        const userId = await ensureUser(session.user.email);
        const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        return settings[0]?.preferences || {};
    } catch (error) {
        console.error("getSettings Error:", error);
        return {};
    }
}

export async function updateSettings(newPreferences: Record<string, any>) {
    const session = await auth();

    if (!session?.user?.email) {
        console.warn("updateSettings: No session email found, skipping save");
        return { error: "Unauthorized" };
    }

    try {
        const userId = await ensureUser(session.user.email);

        // Upsert logic
        await db.insert(userSettings).values({
            userId: userId,
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
    } catch (error) {
        console.error("updateSettings Error:", error);
        return { error: "Failed to save" };
    }
}
