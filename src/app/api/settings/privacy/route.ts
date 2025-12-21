import { auth } from "@/auth";
import { PermissionService, PermissionScope } from "@/services/security/permissions";
import { SecurityService } from "@/services/security/audit";
import { EventRepository } from "@/services/events/db";
import { NextResponse } from "next/server";

// POST /api/settings/privacy (Update Permissions)
export async function POST(req: Request) {
    const session = await auth();
    if (!session || !session.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
        const userId = await EventRepository.ensureUser(session.user.email);
        const { scope, enabled } = await req.json();

        // In a real app we'd update the DB. For MVP we audit log the request.
        await SecurityService.logAudit(userId, "PERMISSION_UPDATE", "user_settings", { scope, enabled });

        // Request logic
        if (enabled) {
            await PermissionService.request(userId, scope as PermissionScope);
        }

        return NextResponse.json({ success: true, message: "Privacy settings updated" });
    } catch (error) {
        return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
    }
}
