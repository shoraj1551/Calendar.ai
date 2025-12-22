import { db } from "@/db";
import { events as eventsTable, connectedAccounts, userSettings } from "@/db/schema";
import { eq, inArray, and, or } from "drizzle-orm";
import { fetchGoogleEvents } from "@/integrations/google/client";
import { UnifiedEvent } from "./types";
import { addMonths, subMonths, startOfMonth, endOfMonth } from "date-fns";
import { EventRepository } from "../events/db";
import { BlockGenerator } from "./blocks";

/**
 * Normalizes a Google Event into our UnifiedEvent schema.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const normalizeGoogleEvent = (event: any): UnifiedEvent => {
    const isAllDay = !event.start?.dateTime;
    const start = new Date(event.start?.dateTime || event.start?.date);
    const end = new Date(event.end?.dateTime || event.end?.date);

    return {
        id: event.id || "unknown",
        title: event.summary || "(No Title)",
        start,
        end,
        allDay: isAllDay,
        provider: "google",
        status: event.status === "confirmed" ? "confirmed" : "tentative",
        type: "personal", // Defaulting to personal for now; can be enhanced later
        description: event.description,
        location: event.location,
        meetLink: event.htmlLink,
    };
};



/**
 * Fetches and aggregates events from Local DB, respecting account visibility.
 */
export const getAggregatedEvents = async (accessToken: string, userId: string): Promise<UnifiedEvent[]> => {
    // 1. Get Active Accounts & Settings
    const activeAccounts = await db.query.connectedAccounts.findMany({
        where: and(
            eq(connectedAccounts.userId, userId),
            eq(connectedAccounts.status, 'active')
        )
    });

    const settingsRec = await db.select().from(userSettings).where(eq(userSettings.userId, userId));
    const prefs = settingsRec[0]?.preferences as any || {};

    const activeAccountIds = activeAccounts.map(a => a.id);

    // 2. Query Events
    const whereClause = activeAccountIds.length > 0
        ? or(
            eq(eventsTable.provider, 'local'),
            inArray(eventsTable.connectedAccountId, activeAccountIds)
        )
        : eq(eventsTable.provider, 'local');

    const dbEvents = await db.query.events.findMany({
        where: and(
            eq(eventsTable.userId, userId),
            whereClause
        )
    });

    const unifiedDbEvents = dbEvents.map(e => ({
        id: e.id,
        title: e.title,
        start: e.startTime,
        end: e.endTime,
        allDay: e.allDay || false,
        provider: e.provider as any,
        status: e.status as any,
        type: e.type as any,
        description: e.description || undefined,
        location: e.location || undefined,
        meetLink: e.htmlLink || undefined,
        connectedAccountId: e.connectedAccountId || undefined
    }));

    // 3. Generate Blocks (Lunch & Holidays)
    // Range: Current month +/- 1 month (approx)
    const now = new Date();
    const rangeStart = startOfMonth(subMonths(now, 1));
    const rangeEnd = endOfMonth(addMonths(now, 1));

    const lunchBlocks = BlockGenerator.generateLunchBlocks(rangeStart, rangeEnd, {
        lunch: prefs.lunch,
        workStart: prefs.workStart,
        workEnd: prefs.workEnd
    });

    const holidays = BlockGenerator.generateHolidays(now.getFullYear());

    // 4. Merge & Sort
    return [...unifiedDbEvents, ...lunchBlocks, ...holidays].sort((a, b) => a.start.getTime() - b.start.getTime());
};
