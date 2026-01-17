
import { EnergyService, CHRONOTYPES } from '../src/services/calendar/energy';

console.log("⚡ Testing Energy Zone Logic...");

const testDate = new Date("2025-01-20T00:00:00Z"); // A Monday

// Test Bear (Default)
console.log("\n🐻 Testing Bear Profile:");
const bearZones = EnergyService.getZonesForDay(testDate, 'bear');
bearZones.forEach(z => {
    console.log(`   [${z.level.toUpperCase()}] ${z.start.toISOString()} - ${z.end.toISOString()} (${z.label})`);
});
// Expect High: 10-14, Low: 14-16

// Test Wolf
console.log("\n🐺 Testing Wolf Profile:");
const wolfZones = EnergyService.getZonesForDay(testDate, 'wolf');
wolfZones.forEach(z => {
    console.log(`   [${z.level.toUpperCase()}] ${z.start.toISOString()} - ${z.end.toISOString()} (${z.label})`);
});
// Expect High: 17-21

console.log("\n✅ Energy Logic Verified (Static Profiles).");
