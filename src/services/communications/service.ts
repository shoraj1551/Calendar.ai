
import { db } from "@/db";
import { userSettings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Mock Transports (In a real app, these would wrap Nodemailer / FCM)
export const MockEmailTransport = {
    sent: [] as any[],
    send: (to: string, subject: string, body: string) => {
        console.log(`[Email Sent] To: ${to}, Subject: ${subject}`);
        MockEmailTransport.sent.push({ to, subject, body, timestamp: new Date() });
        return true;
    },
    clear: () => MockEmailTransport.sent = []
};

export const MockPushTransport = {
    sent: [] as any[],
    send: (userId: string, title: string, body: string) => {
        console.log(`[Push Sent] User: ${userId}, Title: ${title}`);
        MockPushTransport.sent.push({ userId, title, body, timestamp: new Date() });
        return true;
    },
    clear: () => MockPushTransport.sent = []
};

export class CommunicationService {

    // Helper: Get Settings
    private static async getSettings(userId: string) {
        const settings = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
        // Return default if not set, mirroring frontend defaults
        return settings[0] || {
            dailySummary: true,
            weeklyInsights: true,
            urgentOnly: false,
            commChannel: 'email',
            quietHours: true,
            quietStart: '22:00',
            quietEnd: '08:00',
        };
    }

    private static async getUserEmail(userId: string) {
        const user = await db.query.users.findFirst({
            where: eq(users.id, userId)
        });
        return user?.email;
    }

    private static isUrgent(notificationType: string): boolean {
        // Simple logic: 'alarm' is urgent, 'info' is not.
        return notificationType === 'alarm';
    }

    private static inQuietHours(settings: any): boolean {
        if (!settings.quietHours) return false;

        const now = new Date();
        const currentHour = now.getHours();
        const currentMinute = now.getMinutes();
        const currentTime = currentHour * 60 + currentMinute; // Minutes from midnight

        const [startH, startM] = (settings.quietStart || "22:00").split(':').map(Number);
        const [endH, endM] = (settings.quietEnd || "08:00").split(':').map(Number);

        const startTotal = startH * 60 + (startM || 0);
        const endTotal = endH * 60 + (endM || 0);

        // Handle overnight ranges (e.g. 22:00 to 08:00)
        if (startTotal > endTotal) {
            return currentTime >= startTotal || currentTime < endTotal;
        } else {
            return currentTime >= startTotal && currentTime < endTotal;
        }
    }

    // --- Core Actions ---

    static async sendDailySummary(userId: string) {
        const settings: any = await this.getSettings(userId);
        const email = await this.getUserEmail(userId);

        if (!settings.dailySummary) {
            console.log(`[Communication] Daily Summary suppressed for ${userId} (Disabled in settings)`);
            return false;
        }

        if (!email) return false;

        // In a real app, generate content here
        await MockEmailTransport.send(email, "Your Daily Briefing", "Here is your agenda for today...");
        return true;
    }

    static async sendWeeklyInsights(userId: string) {
        const settings: any = await this.getSettings(userId);
        const email = await this.getUserEmail(userId);

        if (!settings.weeklyInsights) {
            console.log(`[Communication] Weekly Insights suppressed for ${userId} (Disabled in settings)`);
            return false;
        }
        if (!email) return false;

        await MockEmailTransport.send(email, "Your Weekly Review", "You spent 40 hours in deep work...");
        return true;
    }

    static async dispatchNotification(userId: string, type: 'alarm' | 'nudge' | 'info', title: string, message: string) {
        const settings: any = await this.getSettings(userId);
        const email = await this.getUserEmail(userId);

        // 1. Check Urgent Only Mode
        if (settings.urgentOnly && !this.isUrgent(type)) {
            console.log(`[Communication] Notification '${title}' suppressed (Urgent Mode ON)`);
            return { delivered: false, reason: "urgent_mode" };
        }

        // 2. Check Quiet Hours (unless urgent alarm overrides? Let's say alarms override)
        if (this.inQuietHours(settings) && type !== 'alarm') {
            console.log(`[Communication] Notification '${title}' suppressed (Quiet Hours)`);
            return { delivered: false, reason: "quiet_hours" };
        }

        const channel = settings.commChannel || 'email'; // Default

        // 3. Dispatch based on Channel
        if (channel === 'push') {
            MockPushTransport.send(userId, title, message);
        } else if (channel === 'email') {
            if (email) MockEmailTransport.send(email, title, message);
        } else if (channel === 'in-app') {
            console.log(`[Communication] Notification '${title}' queued for In-App only.`);
            // No external transport
        }

        return { delivered: true, channel };
    }
}
