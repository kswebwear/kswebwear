"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { getSettings } from "@/lib/db";

type Theme = "dark" | "light";

interface ThemeContextType {
    theme: Theme;
    setTheme: (theme: Theme) => void;
    loading: boolean;
}

export const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>("dark");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Load theme from localStorage on mount
        const savedTheme = localStorage.getItem("ks-theme") as Theme;
        if (savedTheme) {
            setTheme(savedTheme);
            document.documentElement.className = savedTheme;
        } else {
            // Check system preference if no saved theme
            const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
            const initialTheme = systemPrefersDark ? "dark" : "light";
            // For KSWebWear, we default to dark for the premium feel if no preference
            setTheme("dark");
            document.documentElement.className = "dark";
        }
        setLoading(false);
    }, []);

    const updateTheme = (newTheme: Theme) => {
        setTheme(newTheme);
        document.documentElement.className = newTheme;
        localStorage.setItem("ks-theme", newTheme);
    };

    return (
        <ThemeContext.Provider value={{ theme, setTheme: updateTheme, loading }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error("useTheme must be used within a ThemeProvider");
    }
    return context;
}
