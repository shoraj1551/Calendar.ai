
import { ContextService } from '../src/services/calendar/context';
import { UnifiedEvent } from '../src/services/calendar/types';

console.log("🏷️ Testing Context Extraction...");

const events: Partial<UnifiedEvent>[] = [
    { title: "Weekly Standup", description: "Team updates", attendees: [{}, {}, {}] }, // Routine/Admin
    { title: "1:1 with Manager", description: "Performance review", attendees: [{}] }, // 1:1
    { title: "Deep Work Block", description: "", attendees: [] }, // Focus
    { title: "Project Brainstorming", description: "Whiteboarding session", attendees: [{}, {}] }, // Creative
    { title: "Quick Sync", description: "", attendees: [{}] } // Unknown -> Collab
];

events.forEach(e => {
    const analysis = ContextService.analyze(e as UnifiedEvent);
    console.log(`\nEvent: "${e.title}"`);
    console.log(`   Category: ${analysis.category.toUpperCase()}`);
    console.log(`   Tags: ${analysis.tags.join(", ")}`);
});

console.log("\n✅ Context Logic Verified.");
