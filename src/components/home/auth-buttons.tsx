"use client";

import { signIn, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { ArrowRight, LayoutDashboard, LogOut } from "lucide-react";
import Link from "next/link";

export function LoginButton() {
    return (
        <Button
            size="lg"
            className="text-lg px-8 py-6 rounded-full shadow-lg hover:shadow-xl transition-all"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
        >
            Get Started with Google <ArrowRight className="w-5 h-5 ml-2" />
        </Button>
    );
}

export function DashboardButton() {
    return (
        <Link href="/dashboard">
            <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 py-6 rounded-full border-2 border-gray-900 dark:border-gray-100 hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
                Go to Dashboard <LayoutDashboard className="w-5 h-5 ml-2" />
            </Button>
        </Link>
    );
}

export function LogoutButton({ className, variant = "ghost" }: { className?: string, variant?: "ghost" | "outline" | "default" }) {
    return (
        <Button
            variant={variant}
            size="sm"
            className={className}
            onClick={() => signOut({ callbackUrl: "/" })}
        >
            <LogOut className="w-4 h-4 mr-2" />
            Log Out
        </Button>
    );
}

export function HeaderSignInButton() {
    return (
        <button
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
            className="text-sm font-medium hover:underline text-gray-600 dark:text-gray-400"
        >
            Sign In
        </button>
    );
}
