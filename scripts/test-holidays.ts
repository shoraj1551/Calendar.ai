
import { HolidayService } from "../src/services/calendar/holidays";
import { format } from "date-fns";

const run = () => {
    console.log("🕉️ Testing Regional Holiday Awareness...");

    console.log("\n2025 Holidays:");
    const holidays2025 = HolidayService.getHolidays(2025);

    // Check for specific Indian Festivals
    const diwali = holidays2025.find(h => h.title.includes("Diwali"));
    const holi = holidays2025.find(h => h.title.includes("Holi"));
    const independence = holidays2025.find(h => h.title.includes("Independence Day"));

    if (diwali) console.log(`   ✅ Found Diwali: ${format(diwali.start, "yyyy-MM-dd")}`);
    else console.error("   ❌ Missing Diwali!");

    if (holi) console.log(`   ✅ Found Holi: ${format(holi.start, "yyyy-MM-dd")}`);
    else console.error("   ❌ Missing Holi!");

    if (independence) console.log(`   ✅ Found Independence Day: ${format(independence.start, "yyyy-MM-dd")}`);
    else console.error("   ❌ Missing Independence Day!");

    if (diwali && holi && independence) {
        console.log("\n✅ SUCCESS: Regional holidays are correctly integrated.");
    } else {
        process.exit(1);
    }
}

run();
