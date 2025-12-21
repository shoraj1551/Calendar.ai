import { auth } from "@/auth";
import { NextResponse } from "next/server";

const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const MAX_REQUESTS = 100; // 100 requests per minute
const ipRequests = new Map<string, { count: number; timestamp: number }>();

export default auth((req) => {
    const { nextUrl } = req;
    const isLoggedIn = !!req.auth;
    const isApiAuthRoute = nextUrl.pathname.startsWith("/api/auth");
    const isDashboardRoute = nextUrl.pathname.startsWith("/dashboard") || nextUrl.pathname.startsWith("/calendar");
    const isApiRoute = nextUrl.pathname.startsWith("/api") && !isApiAuthRoute;

    // 1. Rate Limiting (Simple In-Memory)
    if (isApiRoute) {
        const ip = req.headers.get("x-forwarded-for") || "unknown";
        const now = Date.now();
        const record = ipRequests.get(ip) || { count: 0, timestamp: now };

        if (now - record.timestamp > RATE_LIMIT_WINDOW) {
            record.count = 1;
            record.timestamp = now;
        } else {
            record.count++;
        }

        ipRequests.set(ip, record);

        if (record.count > MAX_REQUESTS) {
            return NextResponse.json({ error: "Too Many Requests" }, { status: 429 });
        }
    }

    // 2. Route Protection
    if (isApiAuthRoute) {
        return NextResponse.next();
    }

    if (isDashboardRoute) {
        if (isLoggedIn) return NextResponse.next();
        return Response.redirect(new URL("/api/auth/signin", nextUrl));
    }

    return NextResponse.next();
});

export const config = {
    matcher: ["/((?!.+\\.[\\w]+$|_next).*)", "/", "/(api|trpc)(.*)"],
};
