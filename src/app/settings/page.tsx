import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SettingsForm } from "@/features/settings/settings-form";

export default async function SettingsPage() {
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    return (
        <DashboardLayout>
            <SettingsForm />
        </DashboardLayout>
    );
}
