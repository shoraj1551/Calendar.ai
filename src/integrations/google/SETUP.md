# Google Authentication Setup Guide

To enable Google Sign-In and Calendar access, you need to create OAuth credentials in the Google Cloud Console.

## Step 1: Create a Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/).
2. Click **Select a project** > **New Project**.
3. Name it `Calendar-AI` and click **Create**.

## Step 2: Enable APIs
1. Go to **APIs & Services** > **Library**.
2. Search for and enable the following APIs:
   - **Google Calendar API** (Required for fetching events)
   - **Google People API** (Optional, for profile info)

## Step 3: Configure Consent Screen
1. Go to **APIs & Services** > **OAuth consent screen**.
2. Select **External** (unless you have a Google Workspace organization) and click **Create**.
3. Fill in the App Name (`Calendar.ai`), User Support Email, and Developer Contact Info.
4. Click **Save and Continue**.
5. **Scopes**: Add the following scopes:
   - `.../auth/userinfo.email`
   - `.../auth/userinfo.profile`
   - `.../auth/calendar` (or `.../auth/calendar.readonly`)
6. **Test Users**: Add your own Google email to the list of test users.

## Step 4: Create Credentials
1. Go to **APIs & Services** > **Credentials**.
2. Click **Create Credentials** > **OAuth client ID**.
3. Application Type: **Web application**.
4. Name: `Calendar-AI Web Client`.
5. **Authorized JavaScript origins**:
   - `http://localhost:3000`
6. **Authorized redirect URIs**:
   - `http://localhost:3000/api/auth/callback/google`
7. Click **Create**.

## Step 5: Update Environment Variables
Copy the **Client ID** and **Client Secret** and update your `.env` file:

```env
AUTH_GOOGLE_ID="your-client-id.apps.googleusercontent.com"
AUTH_GOOGLE_SECRET="your-client-secret"
AUTH_SECRET="generated-secret" # Run `npx auth secret` to generate
```
