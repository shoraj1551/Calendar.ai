"use server";

import { auth } from "@/auth";
import { db } from "@/db";
import { userSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";

// Helper to ensure user exists
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
        console.warn("getSettings: No session email found, returning defaults");
        return {
            defaultView: "week",
            workingHoursStart: 9,
            workingHoursEnd: 17,
            showWeekends: true,
            firstDayOfWeek: 0,
            emailNotifications: true,
            browserNotifications: true,
            reminderMinutes: 15,
            timezone: "UTC",
        };
    }

    try {
        const userId = await ensureUser(session.user.email);
        const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));

        if (!settings[0]) {
            // Return defaults if no settings exist
            return {
                defaultView: "week",
                workingHoursStart: 9,
                workingHoursEnd: 17,
                showWeekends: true,
                firstDayOfWeek: 0,
                emailNotifications: true,
                browserNotifications: true,
                reminderMinutes: 15,
                timezone: "UTC",
            };
        }

        return {
            defaultView: settings[0].defaultView,
            workingHoursStart: settings[0].workingHoursStart,
            workingHoursEnd: settings[0].workingHoursEnd,
            showWeekends: settings[0].showWeekends,
            firstDayOfWeek: settings[0].firstDayOfWeek,
            emailNotifications: settings[0].emailNotifications,
            browserNotifications: settings[0].browserNotifications,
            reminderMinutes: settings[0].reminderMinutes,
            timezone: settings[0].timezone,
        };
    } catch (error) {
        console.error("getSettings Error:", error);
        return {
            defaultView: "week",
            workingHoursStart: 9,
            workingHoursEnd: 17,
            showWeekends: true,
            firstDayOfWeek: 0,
            emailNotifications: true,
            browserNotifications: true,
            reminderMinutes: 15,
            timezone: "UTC",
        };
    }
}

export async function updateSettings(newSettings: any) {
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
            defaultView: newSettings.defaultView || "week",
            workingHoursStart: newSettings.workingHoursStart || 9,
            workingHoursEnd: newSettings.workingHoursEnd || 17,
            showWeekends: newSettings.showWeekends !== undefined ? newSettings.showWeekends : true,
            firstDayOfWeek: newSettings.firstDayOfWeek || 0,
            emailNotifications: newSettings.emailNotifications !== undefined ? newSettings.emailNotifications : true,
            browserNotifications: newSettings.browserNotifications !== undefined ? newSettings.browserNotifications : true,
            reminderMinutes: newSettings.reminderMinutes || 15,
            timezone: newSettings.timezone || "UTC",
            updatedAt: new Date(),
        }).onConflictDoUpdate({
            target: userSettings.userId,
            set: {
                defaultView: newSettings.defaultView,
                workingHoursStart: newSettings.workingHoursStart,
                workingHoursEnd: newSettings.workingHoursEnd,
                showWeekends: newSettings.showWeekends,
                firstDayOfWeek: newSettings.firstDayOfWeek,
                emailNotifications: newSettings.emailNotifications,
                browserNotifications: newSettings.browserNotifications,
                reminderMinutes: newSettings.reminderMinutes,
                timezone: newSettings.timezone,
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
