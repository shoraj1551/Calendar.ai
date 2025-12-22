
import { db } from "@/db";
import { connectedAccounts, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CalendarProviderFactory } from "./factory";
import { NormalizedEvent } from "./provider-types";
import { addDays, subDays } from "date-fns";

export class SyncManager {
    static async syncAccount(accountId: string) {
        console.log(`[Sync] Starting sync for account ${accountId}`);

        const account = await db.query.connectedAccounts.findFirst({
            where: eq(connectedAccounts.id, accountId)
        });

        if (!account) throw new Error("Account not found");
        if (account.status !== 'active') throw new Error("Account is not active");

        try {
            const provider = CalendarProviderFactory.getProvider(account.provider);

            if (account.accessToken) {
                if (account.provider === 'google') {
                    (provider as any).setCredentials({
                        accessToken: account.accessToken,
                        refreshToken: account.refreshToken,
                        expiresAt: account.expiresAt?.getTime()
                    });
                } else if (account.provider === 'outlook') {
                    (provider as any).setAccessToken(account.accessToken);
                }
            }

            const now = new Date();
            const start = subDays(now, 30);
            const end = addDays(now, 90);

            const fetchedEvents = await provider.listEvents(start, end);
            console.log(`[Sync] Fetched ${fetchedEvents.length} events from ${account.provider}`);

            for (const event of fetchedEvents) {
                // Check if event exists
                const existing = await db.query.events.findFirst({
                    where: and(
                        eq(events.userId, account.userId),
                        eq(events.providerEventId, event.providerEventId),
                        eq(events.provider, account.provider)
                    )
                });

                if (existing) {
                    await db.update(events).set({
                        title: event.title,
                        description: event.description,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        allDay: event.allDay,
                        location: event.location,
                        status: event.status,
                        htmlLink: event.htmlLink,
                        organizer: event.organizer,
                        attendees: event.attendees,
                        connectedAccountId: account.id // Ensure link is maintained/healed
                    }).where(eq(events.id, existing.id));
                } else {
                    await db.insert(events).values({
                        userId: account.userId,
                        connectedAccountId: account.id, // Link to source
                        title: event.title,
                        description: event.description,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        allDay: event.allDay,
                        location: event.location,
                        status: event.status,
                        htmlLink: event.htmlLink,
                        organizer: event.organizer,
                        attendees: event.attendees,
                        provider: account.provider,
                        providerEventId: event.providerEventId,
                        type: 'work'
                    });
                }
            }

            await db.update(connectedAccounts)
                .set({
                    updatedAt: now
                })
                .where(eq(connectedAccounts.id, accountId));

            return { success: true, count: fetchedEvents.length };

        } catch (error: any) {
            console.error(`[Sync] Failed for account ${accountId}`, error);
            await db.update(connectedAccounts)
                .set({ status: 'error' })
                .where(eq(connectedAccounts.id, accountId));
            throw error;
        }
    }
}
