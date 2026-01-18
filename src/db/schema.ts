import { pgTable, text, timestamp, uuid, boolean, integer, index, jsonb, real } from "drizzle-orm/pg-core";
import { sql } from "drizzle-orm";

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
    status: text("status", { enum: ["todo", "in_progress", "done", "scheduled"] }).default("todo").notNull(),
    priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
    dueDate: timestamp("due_date"),
    estimatedDuration: integer("estimated_duration").default(30), // minutes for timeblocking
    allocatedEventId: text("allocated_event_id"), // links to calendar event when scheduled
    source: text("source", { enum: ["manual", "ai", "meeting"] }).default("manual").notNull(),
    sourceId: text("source_id"),
    completedAt: timestamp("completed_at"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Meeting Notes
export const meetingNotes = pgTable("meeting_notes", {
    id: uuid("id").defaultRandom().primaryKey(),
    eventId: uuid("event_id").references(() => events.id, { onDelete: 'cascade' }).notNull(),
    userId: uuid("user_id").references(() => users.id).notNull(),

    // Content
    rawNotes: text("raw_notes").notNull(),
    summary: text("summary"),
    keyPoints: text("key_points").array(),
    decisions: text("decisions").array(),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Action Items extracted from meetings
export const actionItems = pgTable("action_items", {
    id: uuid("id").defaultRandom().primaryKey(),
    meetingNoteId: uuid("meeting_note_id").references(() => meetingNotes.id, { onDelete: 'cascade' }).notNull(),
    taskId: uuid("task_id").references(() => tasks.id),

    // Content
    description: text("description").notNull(),
    assignee: text("assignee"),
    dueDate: timestamp("due_date"),
    priority: text("priority", { enum: ["low", "medium", "high"] }).default("medium").notNull(),
    status: text("status", { enum: ["pending", "in_progress", "completed", "cancelled"] }).default("pending").notNull(),

    // AI metadata
    confidence: real("confidence"),
    extractedFrom: text("extracted_from"),

    // Timestamps
    createdAt: timestamp("created_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
});

// User Settings
export const userSettings = pgTable("user_settings", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull().unique(),

    // Calendar preferences
    defaultView: text("default_view", { enum: ["day", "week", "month"] }).default("week").notNull(),
    workingHoursStart: integer("working_hours_start").default(9).notNull(),
    workingHoursEnd: integer("working_hours_end").default(17).notNull(),
    showWeekends: boolean("show_weekends").default(true).notNull(),
    firstDayOfWeek: integer("first_day_of_week").default(0).notNull(), // 0 = Sunday

    // Notification preferences
    emailNotifications: boolean("email_notifications").default(true).notNull(),
    browserNotifications: boolean("browser_notifications").default(true).notNull(),
    reminderMinutes: integer("reminder_minutes").default(15).notNull(),

    // Schedule analysis preferences
    lunchBreakEnabled: boolean("lunch_break_enabled").default(true).notNull(),
    ignoredHolidays: jsonb("ignored_holidays").default([]),

    // Communication preferences
    dailySummary: boolean("daily_summary").default(true).notNull(),
    weeklyInsights: boolean("weekly_insights").default(true).notNull(),
    urgentOnly: boolean("urgent_only").default(false).notNull(),
    commChannel: text("comm_channel", { enum: ["email", "push", "in-app"] }).default("email").notNull(),
    quietHours: boolean("quiet_hours").default(true).notNull(),
    quietStart: text("quiet_start").default("22:00").notNull(),
    quietEnd: text("quiet_end").default("08:00").notNull(),

    // Accountability preferences
    accountabilityMode: text("accountability_mode", { enum: ["gentle", "strict"] }).default("gentle").notNull(),
    enableCheckins: boolean("enable_checkins").default(true).notNull(),

    // Other preferences
    timezone: text("timezone").default("UTC").notNull(),

    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// User Energy Zones
export const userEnergyZones = pgTable("user_energy_zones", {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id").references(() => users.id).notNull(),

    // Time range (24-hour format)
    startHour: integer("start_hour").notNull(), // 0-23
    endHour: integer("end_hour").notNull(), // 0-23

    // Energy level
    energyLevel: text("energy_level", { enum: ["high", "medium", "low", "drain"] }).notNull(),

    // Metadata
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
    ignoredHolidays: jsonb("ignored_holidays").default([]),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
}, (table) => {
    return {
        userIdIdx: index("connected_accounts_user_id_idx").on(table.userId),
    };
});

