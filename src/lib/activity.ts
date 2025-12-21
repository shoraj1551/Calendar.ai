"use client";

import { useEffect, useRef } from 'react';

// Sends heartbeat every 5 minutes if user interacts
export function useActivityTracker() {
    const lastInteraction = useRef<Date>(new Date());
    const heartbeatInterval = useRef<NodeJS.Timeout | null>(null);

    useEffect(() => {
        // 1. Listen for user activity
        const updateActivity = () => {
            lastInteraction.current = new Date();
        };

        window.addEventListener('mousemove', updateActivity);
        window.addEventListener('keydown', updateActivity);
        window.addEventListener('click', updateActivity);

        // 2. Heartbeat Loop
        heartbeatInterval.current = setInterval(async () => {
            const now = new Date();
            const timeSinceInteraction = now.getTime() - lastInteraction.current.getTime();

            // Only logs if active within last 5 minutes
            if (timeSinceInteraction < 5 * 60 * 1000) {
                try {
                    await fetch('/api/activity', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'heartbeat',
                            timestamp: now.toISOString(),
                            metadata: { path: window.location.pathname }
                        })
                    });
                } catch (e) {
                    console.error("Failed to send heartbeat", e);
                }
            }
        }, 5 * 60 * 1000); // 5 minutes

        return () => {
            window.removeEventListener('mousemove', updateActivity);
            window.removeEventListener('keydown', updateActivity);
            window.removeEventListener('click', updateActivity);
            if (heartbeatInterval.current) clearInterval(heartbeatInterval.current);
        };
    }, []);
}
