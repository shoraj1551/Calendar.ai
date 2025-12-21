import { google } from "googleapis";
import { OAuth2Client } from "google-auth-library";

/**
 * Creates a Google Calendar client with the user's access token.
 */
export const getGoogleCalendarClient = (accessToken: string) => {
    const auth = new OAuth2Client();
    auth.setCredentials({ access_token: accessToken });

    return google.calendar({ version: "v3", auth });
};

/**
 * Fetches events from the user's primary calendar.
 */
export const fetchGoogleEvents = async (accessToken: string, timeMin: Date, timeMax: Date) => {
    const calendar = getGoogleCalendarClient(accessToken);

    try {
        const response = await calendar.events.list({
            calendarId: "primary",
            timeMin: timeMin.toISOString(),
            timeMax: timeMax.toISOString(),
            singleEvents: true,
            orderBy: "startTime",
        });

        return response.data.items || [];
    } catch (error) {
        console.error("Error fetching Google events:", error);
        throw new Error("Failed to fetch events from Google Calendar");
    }
};
