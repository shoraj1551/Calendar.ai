# Enabling Real Google OAuth

Currently, the application uses a "Simulated" authentication flow for demonstration purposes because it lacks real API Credentials. To enable real "Sign in with Google" and actual Calendar Syncing, follow these steps:

## 1. Create Google Cloud Project
1.  Go to [Google Cloud Console](https://console.cloud.google.com/).
2.  Create a new project (e.g., "Calendar AI").
3.  Navigate to **APIs & Services > Credentials**.

## 2. Configure OAuth Consent Screen
1.  Select **External** User Type.
2.  Fill in app name and support email.
3.  **Scopes**: Add the following scopes:
    *   `.../auth/userinfo.email`
    *   `.../auth/userinfo.profile`
    *   `.../auth/calendar` (For Calendar Sync)

## 3. Create Credentials
1.  Click **Create Credentials > OAuth Client ID**.
2.  Application Type: **Web application**.
3.  **Authorized Redirect URIs**:
    *   For local development: `http://localhost:3000/api/auth/callback/google`
    *   For production: `https://your-domain.com/api/auth/callback/google`

## 4. Update Assistant Configuration
1.  Copy the **Client ID** and **Client Secret**.
2.  Open your `.env` file in the project root.
3.  Add/Update these variables:
    ```env
    AUTH_GOOGLE_ID=your_client_id_here
    AUTH_GOOGLE_SECRET=your_client_secret_here
    ```

## 5. Switch to Real Auth
1.  Open `src/auth.ts`.
2.  Ensure the Google Provider is correctly responding to these environment variables (it is already set up to do so by default in NextAuth).
3.  The "Connect new account" flow in `accounts-section.tsx` currently hits a custom API. To make it "Real":
    *   You would replace the `fetch('/api/accounts')` logic with `signIn('google')` from `next-auth/react`.
    *   This forces a redirect to Google, and upon return, the session is updated.
