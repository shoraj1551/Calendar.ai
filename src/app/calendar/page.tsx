import { CalendarView } from "@/features/calendar/components/calendar-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { SmartInput } from "@/features/calendar/components/smart-input";

export default function CalendarPage() {
    return (
        <DashboardLayout>
            <div className="space-y-4">
                <SmartInput />
                <CalendarView />
            </div>
        </DashboardLayout>
    );
}
