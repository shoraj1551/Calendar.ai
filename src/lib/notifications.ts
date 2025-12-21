"use client";

import { useEffect, useRef } from "react";

export type NotificationType = "alarm" | "nudge" | "info";

export interface Alert {
    id: string;
    type: NotificationType;
    title: string;
    message: string;
    scheduledFor: string;
    data: any;
}

// 1. Audio Utility
export function playAlarmSound() {
    // Simple beep using Web Audio API or an Audio object
    try {
        const audio = new Audio("/sounds/alarm.mp3"); // Expects public/sounds/alarm.mp3
        audio.play().catch(e => console.log("Audio play failed (user gesture required)", e));
    } catch (e) {
        console.error("Sound error", e);
    }
}

// 2. Poller Hook
export function useNotificationPoller(onAlert: (alert: Alert) => void) {
    const pollInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        const checkAlerts = async () => {
            try {
                const res = await fetch("/api/notifications");
                if (res.ok) {
                    const data = await res.json();
                    if (data.alerts && Array.isArray(data.alerts)) {
                        data.alerts.forEach((alert: Alert) => {
                            // Trigger callback
                            onAlert(alert);
                            // Auto-Ack to prevent loop (or UI handles ack)
                            // For MVP, we ack immediately after showing
                            fetch("/api/notifications", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ id: alert.id })
                            });

                            // Play sound if alarm
                            if (alert.type === "alarm") {
                                playAlarmSound();
                            }
                        });
                    }
                }
            } catch (e) {
                console.error("Polling error", e);
            }
        };

        // Initial check
        checkAlerts();

        // Loop every 60s
        pollInterval.current = setInterval(checkAlerts, 60000);

        return () => {
            if (pollInterval.current) clearInterval(pollInterval.current);
        };
    }, [onAlert]);
}
