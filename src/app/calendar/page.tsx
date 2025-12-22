import { CalendarView } from "@/features/calendar/components/calendar-view";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default function CalendarPage() {
    return (
        <DashboardLayout>
            <CalendarView />
        </DashboardLayout>
    );
}
