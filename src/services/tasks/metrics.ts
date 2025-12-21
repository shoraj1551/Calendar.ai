import { db } from "@/db";
import { tasks } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";

export const TaskMetrics = {
    async getAccountabilityScore(userId: string) {
        const allTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));

        if (allTasks.length === 0) return 100; // Start perfect

        let score = 100;
        let completedOnTime = 0;
        let overdue = 0;

        allTasks.forEach(task => {
            if (task.status === "done") {
                // Bonus for completion
                if (task.dueDate && task.completedAt && task.completedAt <= task.dueDate) {
                    completedOnTime++;
                }
            } else if (task.dueDate && task.dueDate < new Date()) {
                // Penalty for overdue
                overdue++;
            }
        });

        // Simple scoring algorithm
        // -5 per overdue
        // +2 per on-time completion (capped at 100)

        score -= (overdue * 5);
        score += (completedOnTime * 2);

        return Math.min(100, Math.max(0, score));
    }
};
