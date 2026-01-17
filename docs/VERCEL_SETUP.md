# Vercel Deployment Configuration Guide

## Step 1: Create Vercel Account

1. Go to https://vercel.com/signup
2. Sign up with GitHub (recommended)
3. Authorize Vercel to access your GitHub

## Step 2: Import Project

1. Go to https://vercel.com/new
2. Click "Import Project"
3. Select "Import Git Repository"
4. Find `calendar-ai` in the list
5. Click "Import"

## Step 3: Configure Project

Vercel will auto-detect Next.js. Verify these settings:

### Build & Development Settings

```
Framework Preset: Next.js
Build Command: npm run build
Output Directory: .next
Install Command: npm install
Development Command: npm run dev
```

**Leave these as default - Vercel auto-fills them correctly!**

### Root Directory

```
Root Directory: ./
```

## Step 4: Environment Variables

This is the MOST IMPORTANT step!

Click "Environment Variables" and add each one:

### Required Variables

| Name | Value | Where to Get |
|------|-------|--------------|
| `DATABASE_URL` | `postgresql://user:pass@host:5432/db` | Your PostgreSQL provider |
| `AUTH_SECRET` | `your-32-char-secret` | Generate: `openssl rand -base64 32` |
| `NEXTAUTH_URL` | `https://your-project.vercel.app` | Will be provided after first deploy |
| `GOOGLE_CLIENT_ID` | `xxx.apps.googleusercontent.com` | Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | `GOCSPX-xxx` | Google Cloud Console |
| `OPENROUTER_API_KEY` | `sk-or-v1-xxx` | OpenRouter dashboard |
| `OPENROUTER_MODEL` | `anthropic/claude-3.5-sonnet` | Exact model name |

### How to Add Each Variable

1. Enter **Name** (e.g., `DATABASE_URL`)
2. Enter **Value** (paste your actual value)
3. Select **Environment**: Production, Preview, Development (check all 3)
4. Click "Add"
5. Repeat for each variable

### Generate AUTH_SECRET

On your computer, run:

```bash
# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Mac/Linux
openssl rand -base64 32

# Or use online generator
# https://generate-secret.vercel.app/32
```

Copy the output and use it as `AUTH_SECRET`.

## Step 5: Deploy

1. Click "Deploy" button
2. Wait 2-3 minutes
3. Watch the build logs
4. If successful, you'll see "Congratulations!" 🎉

## Step 6: Get Your URL

After deployment:
1. Copy your Vercel URL (e.g., `https://calendar-ai-abc123.vercel.app`)
2. Go back to Environment Variables
3. Update `NEXTAUTH_URL` to your actual URL
4. Redeploy (Vercel → Deployments → ... → Redeploy)

## Step 7: Update Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select your project
3. Go to "APIs & Services" → "Credentials"
4. Click your OAuth 2.0 Client ID
5. Under "Authorized redirect URIs", add:
   ```
   https://your-project.vercel.app/api/auth/callback/google
   ```
6. Click "Save"

## Step 8: Test Your Deployment

Visit your Vercel URL and test:

- [ ] Landing page loads
- [ ] Click "Sign in with Google"
- [ ] OAuth flow completes
- [ ] Redirected to dashboard
- [ ] Can access all pages
- [ ] Calendar syncs (if you connect Google Calendar)

## Troubleshooting

### Build Fails

**Check build logs** in Vercel dashboard.

Common issues:
- Missing environment variables
- TypeScript errors
- Missing dependencies

**Fix**: 
```bash
# Test build locally first
npm run build

# If it works locally, check Vercel logs for specific error
```

### "Sign in with Google" doesn't work

**Check**:
- `GOOGLE_CLIENT_ID` is correct
- `GOOGLE_CLIENT_SECRET` is correct
- Redirect URI added to Google Console
- `NEXTAUTH_URL` matches your Vercel URL

### Database connection fails

**Check**:
- `DATABASE_URL` is correct
- Database allows connections from Vercel
- SSL mode: `?sslmode=require` if needed

### Environment variables not working

**Check**:
- Variables are set for "Production" environment
- No typos in variable names
- Values don't have extra spaces
- Redeploy after adding variables

## Custom Domain (Optional)

### Add Custom Domain

1. Go to Project Settings → Domains
2. Enter your domain (e.g., `calendar-ai.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (5-60 minutes)

### Update Environment Variables

After adding custom domain:
1. Update `NEXTAUTH_URL` to `https://calendar-ai.com`
2. Update Google OAuth redirect URI
3. Redeploy

## Automatic Deployments

Vercel automatically deploys when you push to GitHub:

```bash
# Make changes
git add .
git commit -m "Add new feature"
git push

# Vercel automatically deploys!
```

### Preview Deployments

- Every branch gets a preview URL
- Pull requests get preview deployments
- Test before merging to main

### Production Deployments

- Pushes to `main` branch deploy to production
- Automatic rollback if deployment fails

## Monitoring

### View Logs

1. Vercel Dashboard → Your Project
2. Click "Deployments"
3. Click any deployment
4. View "Build Logs" or "Function Logs"

### Analytics

1. Go to Project → Analytics
2. View traffic, performance, errors

## ✅ Deployment Checklist

- [ ] Vercel account created
- [ ] Project imported from GitHub
- [ ] All environment variables added
- [ ] First deployment successful
- [ ] `NEXTAUTH_URL` updated
- [ ] Google OAuth redirect URI updated
- [ ] Tested sign-in flow
- [ ] All features working
- [ ] Custom domain added (optional)

---

## 🎉 Success!

Your Calendar.ai app is now live at:
**https://your-project.vercel.app**

Share it with the world! 🚀

---

## Support

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Support**: https://vercel.com/support
- **Community**: https://github.com/vercel/vercel/discussions
