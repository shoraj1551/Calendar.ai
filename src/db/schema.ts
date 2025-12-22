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
    title: text("title").notNull(),
    description: text("description"),
    startTime: timestamp("start_time").notNull(),
    endTime: timestamp("end_time").notNull(),
    allDay: boolean("all_day").default(false),
    location: text("location"),
    type: text("type", { enum: ["work", "personal"] }).default("work"),
    provider: text("provider").default("local"),
    createdAt: timestamp("created_at").defaultNow(),
}, (table) => {
    return {
        startTimeIdx: index("start_time_idx").on(table.startTime),
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
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
