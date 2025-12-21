import { ActivityRepository } from "./db";

export interface TimeBlock {
    start: Date;
    end: Date;
    type: "active" | "idle";
    durationMinutes: number;
}

export const AnalyticsEngine = {
    async getDailyTimeline(userId: string, date: Date): Promise<TimeBlock[]> {
        const startOfDay = new Date(date); startOfDay.setHours(0, 0, 0, 0);
        const endOfDay = new Date(date); endOfDay.setHours(23, 59, 59, 999);

        // Fetch raw logs
        const logs = await ActivityRepository.getLogs(userId, startOfDay, endOfDay);
        // Sort ascending
        logs.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());

        const timeline: TimeBlock[] = [];
        if (logs.length === 0) return timeline;

        let currentBlockStart = logs[0].timestamp;
        let lastLogTime = logs[0].timestamp;

        // Reconstruct Active Blocks based on 5-min heartbeat gap
        for (let i = 1; i < logs.length; i++) {
            const currentLogTime = logs[i].timestamp;
            const diffMinutes = (currentLogTime.getTime() - lastLogTime.getTime()) / 60000;

            if (diffMinutes > 10) {
                // Gap > 10 mins -> End current block, assume idle gap
                timeline.push({
                    start: currentBlockStart,
                    end: lastLogTime,
                    type: "active",
                    durationMinutes: Math.round((lastLogTime.getTime() - currentBlockStart.getTime()) / 60000)
                });

                // Add Idle Block (implicit)
                timeline.push({
                    start: lastLogTime,
                    end: currentLogTime,
                    type: "idle",
                    durationMinutes: Math.round(diffMinutes)
                });

                currentBlockStart = currentLogTime;
            }
            lastLogTime = currentLogTime;
        }

        // Close last block
        timeline.push({
            start: currentBlockStart,
            end: lastLogTime,
            type: "active",
            durationMinutes: Math.round((lastLogTime.getTime() - currentBlockStart.getTime()) / 60000)
        });

        return timeline;
    }
};
