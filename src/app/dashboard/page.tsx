import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { AIChatWidget } from "@/features/dashboard/components/ai-chat";
import { TimelineWidget } from "@/features/dashboard/components/timeline";
import { AccountabilityWidget } from "@/features/dashboard/components/accountability";

export default async function DashboardPage() {
    const session = await auth();
    if (!session) redirect("/api/auth/signin");

    const firstName = session.user?.name?.split(" ")[0] || "there";

    return (
        <DashboardLayout>
            {/* Header Section */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-gray-100 dark:to-gray-400 bg-clip-text text-transparent">
                    Good morning, {firstName}.
                </h1>
                <p className="text-gray-500 dark:text-gray-400 mt-2">
                    You have 4 hours of focus time available today.
                </p>
            </div>

            {/* Main Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 h-[calc(100vh-200px)]">

                {/* Left Column: AI & Timeline (7 cols) */}
                <div className="lg:col-span-7 flex flex-col gap-6 h-full">
                    {/* AI Widget (Top) */}
                    <AIChatWidget />

                    {/* Timeline (Bottom - Flex Grow) */}
                    <div className="flex-1 min-h-0">
                        <TimelineWidget />
                    </div>
                </div>

                {/* Right Column: Accountability & Insights (5 cols) */}
                <div className="lg:col-span-5 h-full">
                    <AccountabilityWidget />
                </div>
            </div>
        </DashboardLayout>
    );
}
