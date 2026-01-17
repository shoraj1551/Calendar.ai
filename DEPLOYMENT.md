# Calendar.ai - Vercel Deployment Guide

## 🚀 Quick Deploy to Vercel

### Prerequisites
- [x] GitHub account
- [x] Vercel account (sign up at https://vercel.com)
- [x] Production PostgreSQL database
- [x] Google OAuth credentials
- [x] OpenRouter API key

---

## Step 1: Prepare Your Code

### 1.1 Initialize Git (if not done)

```bash
git init
git add .
git commit -m "Initial commit - Calendar.ai production ready"
```

### 1.2 Create GitHub Repository

1. Go to https://github.com/new
2. Create repository named `calendar-ai`
3. Push your code:

```bash
git remote add origin https://github.com/YOUR_USERNAME/calendar-ai.git
git branch -M main
git push -u origin main
```

---

## Step 2: Deploy to Vercel

### Option A: Deploy via Vercel Dashboard (Recommended)

1. **Go to Vercel**: https://vercel.com/new

2. **Import Repository**:
   - Click "Import Project"
   - Select your GitHub repository
   - Vercel auto-detects Next.js ✅

3. **Configure Project**:
   - Project Name: `calendar-ai`
   - Framework Preset: Next.js (auto-detected)
   - Root Directory: `./`
   - Build Command: `npm run build` (auto-filled)
   - Output Directory: `.next` (auto-filled)

4. **Add Environment Variables**:
   
   Click "Environment Variables" and add:

   ```
   DATABASE_URL=postgresql://user:password@host:5432/calendar_ai
   AUTH_SECRET=your-32-char-secret-key
   NEXTAUTH_URL=https://your-project.vercel.app
   GOOGLE_CLIENT_ID=your-google-client-id
   GOOGLE_CLIENT_SECRET=your-google-client-secret
   OPENROUTER_API_KEY=your-openrouter-key
   OPENROUTER_MODEL=anthropic/claude-3.5-sonnet
   ```

5. **Deploy**:
   - Click "Deploy"
   - Wait 2-3 minutes
   - Your app is live! 🎉

### Option B: Deploy via Vercel CLI

```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy to preview
vercel

# Deploy to production
vercel --prod
```

---

## Step 3: Post-Deployment Setup

### 3.1 Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "Credentials"
4. Edit your OAuth 2.0 Client
5. Add Authorized redirect URIs:
   ```
   https://your-project.vercel.app/api/auth/callback/google
   ```

### 3.2 Set up Database

Your production database should have all tables. If starting fresh:

```bash
# Connect to production database
psql "your-production-database-url"

# Run migrations (if you have migration files)
# Or manually create tables from schema
```

### 3.3 Test Your Deployment

Visit your deployed URL and test:
- [ ] Landing page loads
- [ ] Sign in with Google works
- [ ] Dashboard accessible
- [ ] Calendar syncs
- [ ] Tasks work
- [ ] AI features functional

---

## Step 4: Custom Domain (Optional)

### 4.1 Add Domain in Vercel

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `calendar-ai.com`)
3. Follow DNS configuration instructions

### 4.2 Update Environment Variables

Update `NEXTAUTH_URL` to your custom domain:
```
NEXTAUTH_URL=https://calendar-ai.com
```

### 4.3 Update Google OAuth

Add your custom domain to Google OAuth redirect URIs:
```
https://calendar-ai.com/api/auth/callback/google
```

---

## Step 5: Enable PWA (Mobile Installation)

Your app is now installable on mobile devices!

### On Mobile (iOS/Android):

1. Visit your deployed URL
2. Look for "Add to Home Screen" prompt
3. Or tap browser menu → "Add to Home Screen"
4. App installs like a native app! 📱

### Test PWA Features:

- [ ] Installable on mobile
- [ ] Works offline (basic pages)
- [ ] Feels like native app
- [ ] Fast loading

---

## Step 6: Continuous Deployment

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys! 🚀
```

**Preview Deployments**: Every branch gets a preview URL
**Production Deployments**: Pushes to `main` deploy to production

---

## Troubleshooting

### Build Fails

**Check**:
- All dependencies in `package.json`
- No TypeScript errors
- Environment variables set correctly

**Fix**:
```bash
# Test build locally
npm run build

# If it works locally, check Vercel logs
```

### Database Connection Fails

**Check**:
- `DATABASE_URL` is correct
- Database allows connections from Vercel IPs
- SSL mode configured if required

**Fix**:
```
DATABASE_URL=postgresql://user:pass@host:5432/db?sslmode=require
```

### Authentication Not Working

**Check**:
- `NEXTAUTH_URL` matches your domain
- `AUTH_SECRET` is set
- Google OAuth redirect URI includes your domain

---

## Monitoring & Analytics

### Vercel Analytics (Built-in)

1. Go to Project → Analytics
2. View:
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Optional: Add Custom Analytics

```typescript
// src/app/layout.tsx
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
```

---

## Performance Optimization

### Check Lighthouse Score

1. Open deployed site
2. Open DevTools (F12)
3. Go to Lighthouse tab
4. Run audit
5. Target: Performance >85

### Optimize if Needed

- Enable image optimization (already configured)
- Add caching headers (already configured)
- Lazy load heavy components
- Code splitting

---

## Security Checklist

- [ ] Environment variables not in code
- [ ] `.env` files in `.gitignore`
- [ ] HTTPS enabled (automatic on Vercel)
- [ ] Security headers configured
- [ ] OAuth redirect URIs restricted
- [ ] Database credentials secure

---

## Backup & Recovery

### Database Backups

Set up automated backups for your production database:
- Daily backups recommended
- Keep at least 7 days of backups
- Test restore procedure

### Code Backups

Your code is backed up on GitHub:
- All commits saved
- Can rollback anytime
- Vercel keeps deployment history

---

## Success! 🎉

Your Calendar.ai app is now:
- ✅ Deployed to production
- ✅ Accessible worldwide
- ✅ Automatically updating
- ✅ Installable on mobile (PWA)
- ✅ Secure and fast

**Your App**: https://your-project.vercel.app

**Next Steps**:
1. Share with users
2. Gather feedback
3. Iterate and improve
4. Plan mobile apps (when ready)

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Vercel Support**: https://vercel.com/support

**Deployment Complete!** 🚀
