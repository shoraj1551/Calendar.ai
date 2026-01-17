import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Shield } from "lucide-react";
import { format } from "date-fns";
import { PermissionControl } from "@/components/permission-control";
import { shieldUpAction } from "@/app/actions/calendar";
import { toast } from "sonner";

export type CalendarViewType = "month" | "week" | "day";

interface CalendarHeaderProps {
    currentDate: Date;
    view: CalendarViewType;
    onViewChange: (view: CalendarViewType) => void;
    onPrev: () => void;
    onNext: () => void;
    onToday: () => void;
}

export function CalendarHeader({ currentDate, view, onViewChange, onPrev, onNext, onToday }: CalendarHeaderProps) {

    const handleShieldUp = async () => {
        toast.loading("Finding your best focus slot...");
        try {
            const res = await shieldUpAction(currentDate);
            if (res.success) {
                toast.success(res.message);
            } else {
                toast.error(res.error || res.message);
            }
        } catch (e) {
            toast.error("Failed to shield up.");
        } finally {
            toast.dismiss(); // dismiss loading
        }
    };

    return (
        <div className="flex items-center justify-between border-b px-6 py-4">
            <div className="flex items-center gap-4">
                <h2 className="text-2xl font-semibold text-foreground">
                    {format(currentDate, "MMMM yyyy")}
                </h2>
                <div className="flex items-center gap-1">
                    <Button variant="outline" size="icon" onClick={onPrev}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" onClick={onToday}>
                        Today
                    </Button>
                    <Button variant="outline" size="icon" onClick={onNext}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
            </div>
            <div className="flex items-center gap-4">
                <Button variant="default" className="gap-2 bg-indigo-600 hover:bg-indigo-700 text-white" onClick={handleShieldUp}>
                    <Shield className="h-4 w-4" />
                    Shield Up
                </Button>
                <PermissionControl />
                <div className="flex items-center gap-2 border rounded-md p-1">
                    <Button
                        variant={view === "month" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange("month")}
                    >
                        Month
                    </Button>
                    <Button
                        variant={view === "week" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange("week")}
                    >
                        Week
                    </Button>
                    <Button
                        variant={view === "day" ? "secondary" : "ghost"}
                        size="sm"
                        onClick={() => onViewChange("day")}
                    >
                        Day
                    </Button>
                </div>
            </div>
        </div>
    );
}
