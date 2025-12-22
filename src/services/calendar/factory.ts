
import { CalendarProvider } from "./provider-types";
import { GoogleCalendarProvider } from "./providers/google";
import { OutlookCalendarProvider } from "./providers/outlook";

export class CalendarProviderFactory {
    static getProvider(providerName: string): CalendarProvider {
        switch (providerName) {
            case 'google':
                return new GoogleCalendarProvider(
                    process.env.AUTH_GOOGLE_ID!,
                    process.env.AUTH_GOOGLE_SECRET!,
                    `${process.env.NEXTAUTH_URL}/api/auth/callback/google-calendar`
                );
            case 'outlook':
                return new OutlookCalendarProvider(
                    process.env.AUTH_MICROSOFT_ENTRA_ID_ID!,
                    process.env.AUTH_MICROSOFT_ENTRA_ID_SECRET!,
                    `${process.env.NEXTAUTH_URL}/api/auth/callback/outlook-calendar`
                );
            case 'ical':
                throw new Error("iCloud/WebCal read-only sync not yet implemented in factory");
            default:
                throw new Error(`Unsupported provider: ${providerName}`);
        }
    }
}
