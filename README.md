# Calendar.ai - AI Wellness Calendar

An intelligent calendar application designed to prioritize user well-being, protect personal time, and suggest sustainable schedules.

## Version 0.2.0 Features

### 🛡️ Flexible Boundary Management
- **Hard Blocks**: Holidays (Indian/Global) and Life Events strictly block scheduling.
- **Soft Blocks**: Focus Time and Recovery periods protect your energy but allow "Urgent" overrides.
- **User Control**: Toggle specific holidays on/off via settings.

### 🧠 Gentle Personal Analytics
- **Non-Judgmental**: No more "Failure Scores". Analytics are presented as "Load States" (Balanced, Heavy, Light).
- **Supportive**: AI offers gentle recovery suggestions instead of productivity pressure.
- **Trends**: Identifies patterns in fragmentation and fueling (lunch habits).

### ⚡ Energy-Aware Scheduling
- **Chronotype Support**: Schedules high-focus tasks during your peak energy hours.
- **Proactive Guards**: Warns you *before* you book a meeting that would exceed your daily limits.

### 📝 Reflection Summaries
- **Daily/Weekly Insights**: AI summarizes your accomplishments and energy expenditure.
- **Wellness Focus**: Highlights what went well and where you preserved balance.

## Tech Stack
- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL (Neon/Aiven) via Drizzle ORM
- **AI**: OpenAI / Custom Heuristics
- **UI**: Tailwind CSS, Shadcn/UI

## Getting Started

1. Install dependencies:
\`\`\`bash
npm install
\`\`\`

2. Run development server:
\`\`\`bash
npm run dev
\`\`\`

3. Run verification scripts:
\`\`\`bash
npx tsx scripts/test-boundaries.ts
\`\`\`

