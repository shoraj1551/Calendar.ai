import { pgTable, text, timestamp, uuid, boolean, integer, index, jsonb } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
    id: uuid("id").defaultRandom().primaryKey(),
    email: text("email").notNull().unique(),
    name: text("name"),
    onboardingStatus: text("onboarding_status", { enum: ["pending", "completed"] }).default("pending"),
    workStart: text("work_start").default("09:00"),
    workEnd: text("work_end").default("17:00"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const events = pgTable("events", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    connectedAccountId: uuid("connected_account_id").references(() => connectedAccounts.id), // Link to source account
    title: text("title").notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    allDay: boolean("all_day").default(false),
    location: text("location"),
    type: text("type", { enum: ["work", "personal", "focus", "recovery", "social", "admin", "lunch", "holiday", "life_event"] }).default("work"),
    provider: text("provider").default("local"),
    providerEventId: text("provider_event_id"),
    status: text("status", { enum: ["confirmed", "tentative", "cancelled"] }).default("confirmed"),
    isUrgent: boolean("is_urgent").default(false), // Soft Block override flag
    htmlLink: text("html_link"),
    organizer: jsonb("organizer"),
    attendees: jsonb("attendees"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        startTimeIdx: index("start_time_idx").on(table.startTime),
        providerEventIdIdx: index("provider_event_id_idx").on(table.providerEventId),
    };
});

export const tasks = pgTable("tasks", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    title: text("title").notNull(),
    description: text("description"),
    status: text("status", { enum: ["todo", "in_progress", "done"] }).default("todo").notNull(),
    priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
    dueDate: timestamp("due_date"),
    source: text("source", { enum: ["manual", "ai", "meeting"] }).default("manual").notNull(),
    sourceId: text("source_id"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const meetings = pgTable("meetings", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    eventId: uuid("event_id").references(() => events.id),
    title: text("title").notNull(),
    startTime: timestamp("start_time").defaultNow().notNull(),
    endTime: timestamp("end_time"),
    transcript: text("transcript"),
    summary: text("summary"),
    audioUrl: text("audio_url"),
    embedding: jsonb("embedding"), // Vector support (simulated)
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const focusSessions = pgTable("focus_sessions", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time"),
    label: text("label"),
    duration: integer("duration"),
    status: text("status", { enum: ["completed", "interrupted", "running"] }).default("running").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const activityLogs = pgTable("activity_logs", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    timestamp: timestamp("timestamp").defaultNow().notNull(),
    type: text("type", { enum: ["heartbeat", "page_view", "action"] }).notNull(),
    metadata: text("metadata"),
}, (table) => {
    return {
        timestampIdx: index("timestamp_idx").on(table.timestamp),
    };
});

export const notifications = pgTable("notifications", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    type: text("type", { enum: ["alarm", "nudge", "info"] }).notNull(),
    title: text("title").notNull(),
    message: text("message"),
    scheduledFor: timestamp("scheduled_for").defaultNow().notNull(),
    isRead: boolean("is_read").default(false),
    data: text("data"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        scheduledForIdx: index("scheduled_for_idx").on(table.scheduledFor),
    };
});

export const userSettings = pgTable("user_settings", {
    userId: uuid("user_id").references(() => users.id).primaryKey(),
    preferences: jsonb("preferences").notNull().default({}),
    ignoredHolidays: jsonb("ignored_holidays").default([]), // List of holiday IDs to ignore
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
export const connectedAccounts = pgTable("connected_accounts", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    provider: text("provider", { enum: ["google", "outlook", "exchange", "ical"] }).notNull(),
    email: text("email").notNull(),
    name: text("name"),
    status: text("status", { enum: ["active", "paused", "error"] }).default("active").notNull(),
    isPrimary: boolean("is_primary").default(false).notNull(),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    expiresAt: timestamp("expires_at"),
    preferences: jsonb("preferences").notNull().default({}),
    ignoredHolidays: jsonb("ignored_holidays").default([]), // List of holiday IDs to ignore
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdIdx: index("connected_accounts_user_id_idx").on(table.userId),
    };
});

export const userEnergyZones = pgTable("user_energy_zones", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),
    dayOfWeek: text("day_of_week").notNull(), // "monday", ... "all"
    startTime: text("start_time").notNull(), // "09:00"
    endTime: text("end_time").notNull(), // "11:00"
    energyLevel: text("energy_level", { enum: ["high", "medium", "low", "drain"] }).default("medium").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdIdx: index("energy_zones_user_id_idx").on(table.userId),
    };
});
