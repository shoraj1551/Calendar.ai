import { db } from "@/db";
import { activityLogs } from "@/db/schema";

export const SecurityService = {
    // Log Security Events (Login, Export, Permission Change)
    async logAudit(userId: string, action: string, resource: string, details?: Record<string, unknown>) {
        await db.insert(activityLogs).values({
            userId,
            type: "action", // Using 'action' type for security events to reuse table
            metadata: JSON.stringify({
                isSecurityAudit: true,
                action,
                resource,
                details,
                ip: "recorded-by-middleware"
            })
        });
    }
};
