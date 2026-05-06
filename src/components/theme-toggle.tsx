"use client";

import { useTheme } from "next-themes";
import { useSyncExternalStore } from "react";
import { Moon, Sun } from "lucide-react";
import { Button } from "@/components/ui/button";

function subscribe() {
    return () => {};
}

function useIsClient() {
    return useSyncExternalStore(
        subscribe,
        () => true,
        () => false
    );
}

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();
    const isClient = useIsClient();

    if (!isClient) {
        return (
            <Button
                variant="ghost"
                size="icon"
                className="w-9 h-9 rounded-full"
                disabled
                aria-label="Toggle theme"
            >
                <span className="w-4 h-4" />
            </Button>
        );
    }

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="w-9 h-9 rounded-full transition-all duration-200 hover:bg-accent hover:scale-105 active:scale-95"
            aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
        >
            {theme === "dark" ? (
                <Sun className="w-4 h-4 text-foreground transition-transform duration-300 rotate-0 scale-100" />
            ) : (
                <Moon className="w-4 h-4 text-foreground transition-transform duration-300 rotate-0 scale-100" />
            )}
        </Button>
    );
}