
import { db } from "@/db";
import { connectedAccounts, events } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { CalendarProviderFactory } from "./factory";
import { NormalizedEvent } from "./provider-types";
import { addDays, subDays } from "date-fns";

export class SyncManager {
    private static async getAuthenticatedProvider(accountId: string) {
        const account = await db.query.connectedAccounts.findFirst({
            where: eq(connectedAccounts.id, accountId)
        });

        if (!account) throw new Error("Account not found");
        if (account.status !== 'active') throw new Error("Account is not active");

        const provider = CalendarProviderFactory.getProvider(account.provider);

        // Check & Refresh Token (if expiring within 5 mins)
        if (account.expiresAt && account.expiresAt.getTime() < Date.now() + 5 * 60 * 1000) {
            console.log(`[Sync] Token for account ${accountId} expired or expiring soon. Refreshing...`);
            if (!account.refreshToken) {
                throw new Error("Cannot refresh token: No refresh token available");
            }

            try {
                const newTokens = await provider.refreshToken(account.refreshToken);

                // Update DB with new tokens
                await db.update(connectedAccounts).set({
                    accessToken: newTokens.accessToken,
                    refreshToken: newTokens.refreshToken || account.refreshToken, // Keep old if not rotated
                    expiresAt: new Date(newTokens.expiresAt),
                    updatedAt: new Date()
                }).where(eq(connectedAccounts.id, accountId));

                // Update local object
                account.accessToken = newTokens.accessToken;
                account.refreshToken = newTokens.refreshToken || account.refreshToken;
                account.expiresAt = new Date(newTokens.expiresAt);

                console.log(`[Sync] Token refreshed successfully for account ${accountId}`);
            } catch (refreshError) {
                console.error(`[Sync] Failed to refresh token for account ${accountId}`, refreshError);
                await db.update(connectedAccounts).set({ status: 'error' }).where(eq(connectedAccounts.id, accountId));
                throw new Error("Failed to refresh authentication token");
            }
        }

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

        return { provider, account };
    }

    static async pushCreate(accountId: string, event: Partial<NormalizedEvent>) {
        const { provider, account } = await this.getAuthenticatedProvider(accountId);
        console.log(`[Sync] Pushing create event to ${provider.providerName}`);
        const created = await provider.createEvent(event);

        // Save to DB
        await db.insert(events).values({
            userId: account.userId,
            connectedAccountId: account.id,
            title: created.title,
            description: created.description,
            startTime: created.startTime,
            endTime: created.endTime,
            allDay: created.allDay,
            location: created.location,
            status: created.status,
            htmlLink: created.htmlLink,
            organizer: created.organizer as any,
            attendees: created.attendees as any,
            provider: account.provider,
            providerEventId: created.providerEventId,
            type: 'work' // Default
        });

        return created;
    }

    static async pushUpdate(accountId: string, providerEventId: string, updates: Partial<NormalizedEvent>) {
        const { provider, account } = await this.getAuthenticatedProvider(accountId);
        console.log(`[Sync] Pushing update for event ${providerEventId} to ${provider.providerName}`);
        const updated = await provider.updateEvent(providerEventId, updates);

        // Update Local DB
        await db.update(events).set({
            title: updated.title,
            description: updated.description,
            startTime: updated.startTime,
            endTime: updated.endTime,
            allDay: updated.allDay,
            location: updated.location,
            status: updated.status,
            htmlLink: updated.htmlLink,
            // organizer/attendees might be complex to merge
        }).where(and(
            eq(events.providerEventId, providerEventId),
            eq(events.connectedAccountId, accountId)
        ));

        return updated;
    }

    static async syncAccount(accountId: string) {
        console.log(`[Sync] Starting sync for account ${accountId}`);

        try {
            const { provider, account } = await this.getAuthenticatedProvider(accountId);

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
                        organizer: event.organizer as any,
                        attendees: event.attendees as any,
                        connectedAccountId: account.id
                    }).where(eq(events.id, existing.id));
                } else {
                    await db.insert(events).values({
                        userId: account.userId,
                        connectedAccountId: account.id,
                        title: event.title,
                        description: event.description,
                        startTime: event.startTime,
                        endTime: event.endTime,
                        allDay: event.allDay,
                        location: event.location,
                        status: event.status,
                        htmlLink: event.htmlLink,
                        organizer: event.organizer as any,
                        attendees: event.attendees as any,
                        provider: account.provider,
                        providerEventId: event.providerEventId,
                        type: 'work'
                    });
                }
            }

            await db.update(connectedAccounts)
                .set({ updatedAt: now })
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

