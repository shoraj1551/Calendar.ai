import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsForm } from "@/features/settings/settings-form";
import { Card, CardContent } from "@/components/ui/card";

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    return (
        <DashboardLayout>
            <div className="max-w-2xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                        Settings
                    </h1>
                    <p className="text-gray-500">Manage your preferences and AI automation levels.</p>
                </div>

                <Card>
                    <CardContent className="p-6">
                        <SettingsForm />
                    </CardContent>
                </Card>

                <div className="text-center text-xs text-gray-400">
                    <p>Calendar.ai v0.1.0 Alpha</p>
                    <p>Session ID: {session.user?.id || "N/A"}</p>
                </div>
            </div>
        </DashboardLayout>
    );
}
