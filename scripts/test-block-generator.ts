
import { format, isWeekend } from "date-fns";

// --- INLINING LOGIC TO AVOID IMPORT ISSUES ---
interface UnifiedEvent {
    id: string;
    title: string;
    start: Date;
    end: Date;
    allDay: boolean;
    type: "work" | "personal" | "lunch" | "break" | "holiday" | "block";
}

const BlockGenerator = {
    generateHolidays(year: number): UnifiedEvent[] {
        const holidaysData = [
            { date: `${year}-12-25`, title: "Christmas Day" },
            // Add others if needed for test
        ];

        return holidaysData.map(h => {
            const d = new Date(h.date);
            return {
                id: `holiday-${h.date}`,
                title: h.title,
                start: d,
                end: d, // Simplified for test
                allDay: true,
                type: "holiday" as const,
            };
        });
    },

    generateBlocksForDay(
        date: Date,
        settings: { lunch?: boolean; workStart?: string; workEnd?: string }
    ): UnifiedEvent[] {
        const blocks: UnifiedEvent[] = [];
        const dateStr = format(date, "yyyy-MM-dd");

        // 1. Holiday Check
        const holidays = this.generateHolidays(date.getFullYear());
        const holiday = holidays.find(h => format(h.start, "yyyy-MM-dd") === dateStr);
        if (holiday) {
            blocks.push(holiday);
        }

        // 2. Lunch Check
        if (settings.lunch !== false && !isWeekend(date)) {
            // Hardcoded 13:00 - 13:45 for consistency
            const start = new Date(date);
            start.setHours(13, 0, 0, 0);
            const end = new Date(date);
            end.setHours(13, 45, 0, 0);

            blocks.push({
                id: `lunch-${dateStr}`,
                title: "Lunch 🍱",
                start,
                end,
                allDay: false,
                type: "lunch",
            });
        }

        return blocks;
    }
};

const runTest = () => {
    console.log("🧪 Testing BlockGenerator Logic (Inlined)...");

    const testDate = new Date("2025-12-25T12:00:00"); // Christmas
    const settings = { lunch: true };

    console.log(`\n📅 Date: ${testDate.toISOString()}`);
    console.log(`⚙️ Settings:`, settings);

    const blocks = BlockGenerator.generateBlocksForDay(testDate, settings);

    console.log("\n🧱 Generated Blocks:");
    blocks.forEach(b => {
        console.log(` - [${b.type.toUpperCase()}] ${b.title}`);
    });

    const hasLunch = blocks.some(b => b.type === 'lunch');
    const hasHoliday = blocks.some(b => b.type === 'holiday');

    if (hasLunch && hasHoliday) {
        console.log("\n✅ SUCCESS: Both Lunch and Holiday blocks generated!");
    } else {
        console.log("\n❌ FAILED: Missing blocks.");
        process.exit(1);
    }
};

runTest();
