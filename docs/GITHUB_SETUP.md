# GitHub Repository Setup Guide

## Step 1: Initialize Git Repository

Open your terminal in the Calendar.ai folder and run:

```bash
# Initialize git (if not already done)
git init

# Check status
git status
```

## Step 2: Create .gitignore

Your `.gitignore` should include:

```
# Environment files (IMPORTANT - never commit these!)
.env
.env.local
.env.production
.env.*.local

# Dependencies
node_modules/

# Next.js
.next/
out/
build/

# Vercel
.vercel/

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
npm-debug.log*

# Database
*.db
*.sqlite
```

## Step 3: Stage Your Files

```bash
# Add all files
git add .

# Check what will be committed
git status

# Make sure .env files are NOT listed!
# If they are, add them to .gitignore and run git add . again
```

## Step 4: Make Initial Commit

```bash
git commit -m "Initial commit: Calendar.ai production ready

Features:
- Google Calendar integration
- AI-powered scheduling
- Task management
- Analytics dashboard
- Meeting intelligence
- PWA support
"
```

## Step 5: Create GitHub Repository

### Option A: Via GitHub Website

1. Go to https://github.com/new
2. Repository name: `calendar-ai`
3. Description: `AI-powered calendar management with smart scheduling`
4. Visibility: Choose Public or Private
5. **DO NOT** initialize with README (you already have code)
6. Click "Create repository"

### Option B: Via GitHub CLI (if installed)

```bash
gh repo create calendar-ai --public --source=. --remote=origin
```

## Step 6: Connect to GitHub

GitHub will show you commands like:

```bash
# Add remote
git remote add origin https://github.com/YOUR_USERNAME/calendar-ai.git

# Rename branch to main
git branch -M main

# Push to GitHub
git push -u origin main
```

**Replace `YOUR_USERNAME` with your actual GitHub username!**

## Step 7: Verify Upload

1. Go to your repository on GitHub
2. You should see all your files
3. **Check**: `.env` files should NOT be visible (they're in .gitignore)

## Step 8: Set Repository Description

On GitHub repository page:
1. Click "About" settings (gear icon)
2. Add description: `AI-powered calendar management with smart scheduling, task management, and meeting intelligence`
3. Add topics: `nextjs`, `typescript`, `ai`, `calendar`, `productivity`
4. Save

---

## ✅ Checklist

- [ ] Git initialized
- [ ] .gitignore configured
- [ ] .env files NOT committed
- [ ] Initial commit made
- [ ] GitHub repository created
- [ ] Code pushed to GitHub
- [ ] Repository visible on GitHub

---

## 🚨 Security Check

**CRITICAL**: Make sure these files are NOT on GitHub:
- `.env`
- `.env.local`
- `.env.production`
- Any file with passwords or API keys

If you accidentally committed them:

```bash
# Remove from git history
git rm --cached .env
git rm --cached .env.local
git commit -m "Remove environment files"
git push

# Then regenerate all API keys and passwords!
```

---

## Next Step

Once your code is on GitHub, proceed to Vercel deployment!
