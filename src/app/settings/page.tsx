import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DashboardLayout } from "@/components/layout/dashboard-layout";
import { User, Calendar, Zap, Settings as SettingsIcon } from "lucide-react";
import { CalendarSettings } from "@/features/settings/components/calendar-settings";
import { EnergyZoneSettings } from "@/features/settings/components/energy-zone-settings";

export default function SettingsPage() {
    return (
        <DashboardLayout>
            <div className="p-6 max-w-4xl mx-auto">
                <h1 className="text-3xl font-bold mb-6">Settings</h1>

                <Tabs defaultValue="calendar" className="space-y-6">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="calendar" className="gap-2">
                            <Calendar className="h-4 w-4" />
                            Calendar
                        </TabsTrigger>
                        <TabsTrigger value="energy" className="gap-2">
                            <Zap className="h-4 w-4" />
                            Energy Zones
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="calendar">
                        <CalendarSettings />
                    </TabsContent>

                    <TabsContent value="energy">
                        <EnergyZoneSettings />
                    </TabsContent>
                </Tabs>
            </div>
        </DashboardLayout>
    );
}
