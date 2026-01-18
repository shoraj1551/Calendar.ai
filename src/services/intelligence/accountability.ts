import { db } from "@/db";
import { tasks, focusSessions } from "@/db/schema";
import { eq, and, gte, lte } from "drizzle-orm";

export const AccountabilityService = {
    async getDailyScore(userId: string) {
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // 1. Task Component (50%)
        const allTasks = await db.select().from(tasks).where(eq(tasks.userId, userId));
        let taskScore = 100;
        let overdueCount = 0;
        const pendingTasks = [];

        // Simple algo: Start at 100. -10 for every overdue task.
        // Cap at 0.
        for (const task of allTasks) {
            if (task.status !== "done") {
                pendingTasks.push(task);
                if (task.dueDate && task.dueDate < new Date()) {
                    overdueCount++;
                }
            }
        }
        taskScore -= (overdueCount * 10);
        taskScore = Math.max(0, taskScore);


        // 2. Focus Component (50%)
        // Goal: 4 Hours (240 mins)
        const sessions = await db.select().from(focusSessions).where(
            and(
                eq(focusSessions.userId, userId),
                gte(focusSessions.startTime, today),
                lte(focusSessions.startTime, tomorrow),
                eq(focusSessions.status, "completed")
            )
        );

        const totalFocusMinutes = sessions.reduce((acc, s) => acc + (s.duration || 0), 0);
        const focusGoal = 240; // 4 hours
        let focusScore = Math.round((totalFocusMinutes / focusGoal) * 100);
        focusScore = Math.min(100, focusScore); // Cap at 100% (or maybe allow bonus?) taking 100 for now.

        // Combined Score
        // Weighted average? Or simple average?
        // Let's do 60% Focus, 40% Tasks (Focus is king in this app)
        const totalScore = Math.round((focusScore * 0.6) + (taskScore * 0.4));

        return {
            score: totalScore,
            metrics: {
                focusMinutes: totalFocusMinutes,
                focusGoal,
                overdueTasks: overdueCount,
                completedTasks: allTasks.filter(t => t.status === 'done').length
            },
            nudges: pendingTasks.sort((a, b) => {
                // Priority Sort: High > Medium > Low
                const pMap = { high: 3, medium: 2, low: 1 };
                return (pMap[b.priority as keyof typeof pMap] || 0) - (pMap[a.priority as keyof typeof pMap] || 0);
            }).slice(0, 3)
        };
    }
};
