import { db } from "@/db";
import { events, tasks, meetings, users } from "@/db/schema";
import { eq } from "drizzle-orm";

// Unified Data Access Layer
export const DataAccess = {
    users: {
        async getByEmail(email: string) {
            return await db.query.users.findFirst({ where: eq(users.email, email) });
        }
    },
    events: {
        async getById(id: string) {
            return await db.query.events.findFirst({ where: eq(events.id, id) });
        }
    },
    tasks: {
        async getById(id: string) {
            return await db.query.tasks.findFirst({ where: eq(tasks.id, id) });
        }
    },
    meetings: {
        async getById(id: string) {
            return await db.query.meetings.findFirst({ where: eq(meetings.id, id) });
        }
    }
};
