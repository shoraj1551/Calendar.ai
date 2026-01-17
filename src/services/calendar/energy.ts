
import { addDays, setHours, setMinutes, format } from "date-fns";

export type EnergyLevel = 'high' | 'medium' | 'low' | 'drain';

export interface EnergyZone {
    start: Date;
    end: Date;
    level: EnergyLevel;
    label: string;
}

export const CHRONOTYPES = {
    bear: {
        high: [10, 14], // 10am - 2pm
        low: [14, 16],  // 2pm - 4pm (The dip)
        medium: [9, 17] // Work day boundaries
    },
    wolf: {
        high: [17, 21], // 5pm - 9pm
        low: [9, 11],   // Groggy mornings
        medium: [11, 19]
    },
    lion: {
        high: [8, 12],  // 8am - 12pm
        low: [15, 17],  // Early crash
        medium: [7, 16]
    },
    dolphin: {
        high: [10, 12], // Short peak
        low: [12, 16],  // Long dip
        medium: [9, 18]
    }
};

export class EnergyService {
    static getZonesForDay(date: Date, chronotype: keyof typeof CHRONOTYPES = 'bear'): EnergyZone[] {
        const profile = CHRONOTYPES[chronotype];
        const zones: EnergyZone[] = [];

        // Base: Medium Energy for the work day (simplified)
        // In real app, we'd clip this to user work hours
        const workStart = setMinutes(setHours(date, profile.medium[0]), 0);
        const workEnd = setMinutes(setHours(date, profile.medium[1]), 0);

        // High Energy Zone
        const peakStart = setMinutes(setHours(date, profile.high[0]), 0);
        const peakEnd = setMinutes(setHours(date, profile.high[1]), 0);

        zones.push({
            start: peakStart,
            end: peakEnd,
            level: 'high',
            label: 'Peak Focus'
        });

        // Dip Zone
        const dipStart = setMinutes(setHours(date, profile.low[0]), 0);
        const dipEnd = setMinutes(setHours(date, profile.low[1]), 0);

        zones.push({
            start: dipStart,
            end: dipEnd,
            level: 'low',
            label: 'Energy Dip'
        });

        return zones.sort((a, b) => a.start.getTime() - b.start.getTime());
    }
}
