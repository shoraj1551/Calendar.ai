# Calendar.ai

An intelligent calendar management application with AI-powered focus time recommendations, task timeblocking, and smart scheduling.

## Features

- 📅 **Google Calendar Integration** - Bidirectional sync with Google Calendar
- 🛡️ **Shield Up** - Automatically find and block focus time
- 🎯 **Focus Defense** - AI-powered focus session recommendations based on energy zones
- ✅ **Task Timeblocking** - Drag tasks onto calendar to schedule them
- 📊 **Analytics & Insights** - Visualize calendar patterns and productivity metrics
- 💬 **AI Chat** - Natural language queries about your calendar
- 🔄 **Smart Negotiation** - Generate reschedule requests with alternative time slots

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: NextAuth.js (Google OAuth + Mock Account)
- **UI**: Tailwind CSS + Shadcn/UI
- **Charts**: Recharts
- **AI**: OpenRouter (Claude 3.5 Sonnet)
- **Drag & Drop**: dnd-kit

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- PostgreSQL database
- Google OAuth credentials (for calendar integration)
- OpenRouter API key (for AI features)

### Installation

1. **Clone the repository**:
   ```bash
   git clone <repository-url>
   cd Calendar.ai
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Set up environment variables**:
   
   Create a `.env.local` file in the root directory:
   
   ```env
   # Database
   DATABASE_URL=postgresql://user:password@localhost:5432/calendar_ai
   
   # Authentication
   AUTH_SECRET=your_auth_secret_here  # Generate with: openssl rand -base64 32
   NEXTAUTH_URL=http://localhost:3000
   
   # Google OAuth (for calendar integration)
   GOOGLE_CLIENT_ID=your_google_client_id
   GOOGLE_CLIENT_SECRET=your_google_client_secret
   
   # OpenRouter (for AI features)
   OPENROUTER_API_KEY=your_openrouter_api_key
   OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
   ```

4. **Set up the database**:
   ```bash
   npm run db:push
   ```

5. **Run the development server**:
   ```bash
   npm run dev
   ```

6. **Open the application**:
   Navigate to [http://localhost:3000](http://localhost:3000)

### Google OAuth Setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable Google Calendar API
4. Create OAuth 2.0 credentials
5. Add authorized redirect URI: `http://localhost:3000/api/auth/callback/google`
6. Copy Client ID and Client Secret to `.env.local`

### OpenRouter Setup

1. Sign up at [OpenRouter](https://openrouter.ai/)
2. Generate an API key
3. Add to `.env.local` as `OPENROUTER_API_KEY`

## Usage

### Quick Start with Mock Account

For testing without Google OAuth:
1. Click "Sign in with Mock Account"
2. Explore features with sample data

### Connecting Google Calendar

1. Sign in with Google
2. Grant calendar permissions
3. Your events will sync automatically

### Using Focus Defense

1. Navigate to Dashboard
2. View AI-recommended focus sessions
3. Click "Book" to schedule focus time
4. Sessions are created based on your energy zones and calendar gaps

### Task Timeblocking

1. Add tasks in the sidebar
2. Drag tasks onto calendar
3. Tasks become scheduled events

### Analytics

1. Navigate to `/analytics`
2. View weekly time allocation
3. Check focus time trends
4. Get AI-powered insights

## Project Structure

```
src/
├── app/                    # Next.js app router pages
│   ├── actions/           # Server actions
│   ├── api/               # API routes
│   ├── analytics/         # Analytics page
│   ├── calendar/          # Calendar page
│   └── dashboard/         # Dashboard page
├── components/            # Shared components
│   ├── ui/               # Shadcn UI components
│   └── layout/           # Layout components
├── features/             # Feature-specific components
│   ├── analytics/        # Analytics components
│   ├── calendar/         # Calendar components
│   ├── chat/            # Chat interface
│   ├── focus/           # Focus Defense components
│   └── tasks/           # Task management
├── services/            # Business logic
│   ├── analytics/       # Analytics service
│   ├── calendar/        # Calendar sync
│   └── focus/          # Focus session service
├── db/                 # Database schema & config
└── types/              # TypeScript types
```

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run db:push` - Push schema changes to database
- `npm run db:studio` - Open Drizzle Studio

## Testing

See [TESTING.md](./TESTING.md) for the comprehensive testing checklist.

## Deployment

### Vercel (Recommended)

1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Railway

1. Install Railway CLI: `npm i -g @railway/cli`
2. Login: `railway login`
3. Initialize: `railway init`
4. Add environment variables
5. Deploy: `railway up`

## Environment Variables Reference

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `AUTH_SECRET` | NextAuth secret key | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | For Google Calendar |
| `GOOGLE_CLIENT_SECRET` | Google OAuth client secret | For Google Calendar |
| `OPENROUTER_API_KEY` | OpenRouter API key | For AI features |
| `OPENROUTER_MODEL` | LLM model to use | Optional (default: claude-3.5-sonnet) |

## Known Issues

- Task persistence requires session refresh after auth fix
- Shield Up requires connected Google Calendar account
- Analytics requires at least 7 days of event data for meaningful insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

MIT

## Support

For issues and questions, please open a GitHub issue.
