import { EventRepository } from "@/services/events/db";
import { TaskRepository } from "@/services/tasks/db";
import { NotificationManager } from "@/services/notifications/manager";
import { db } from "@/db";
import { meetings } from "@/db/schema";
import { eq, desc, gte } from "drizzle-orm";
import { format } from "date-fns";

export const ContextAssembler = {
    async assemble(userId: string): Promise<string> {
        const today = new Date();
        const startOfDay = new Date(today.setHours(0, 0, 0, 0));

        // 1. Fetch Events (Next 24h)
        const events = await EventRepository.getByRange(userId, startOfDay, new Date(today.getTime() + 86400000));

        // 2. Fetch Pending Tasks
        const tasks = await TaskRepository.list(userId);
        const pendingTasks = tasks.filter(t => t.status !== 'done').slice(0, 5); // Top 5

        // 3. Fetch Recent Meeting Summaries (Last 3)
        const recentMeetings = await db.select().from(meetings)
            .where(eq(meetings.userId, userId))
            .orderBy(desc(meetings.createdAt))
            .limit(3);

        // 4. Build Context String
        let context = `Current Time: ${new Date().toLocaleString()}\n\n`;

        context += `## Upcoming Events:\n`;
        if (events.length === 0) context += "No events scheduled.\n";
        events.forEach(e => {
            const duration = Math.round((e.end.getTime() - e.start.getTime()) / 60000);
            context += `- [${format(e.start, "HH:mm")}] ${e.title} (${duration}m)\n`;
        });

        context += `\n## Top Pending Tasks:\n`;
        if (pendingTasks.length === 0) context += "No pending tasks.\n";
        pendingTasks.forEach(t => {
            context += `- [${t.priority.toUpperCase()}] ${t.title} ${t.dueDate ? `(Due: ${format(t.dueDate, "MM/dd")})` : ''}\n`;
        });

        context += `\n## Recent Meeting Context:\n`;
        recentMeetings.forEach(m => {
            context += `- ${m.title}: ${m.summary?.substring(0, 100)}...\n`;
        });

        return context;
    }
};
