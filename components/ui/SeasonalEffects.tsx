"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/db";

export function SeasonalEffects() {
    const [theme, setTheme] = useState<{ christmasMode?: boolean, newYearMode?: boolean }>({
        christmasMode: false,
        newYearMode: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await getSettings("store") as any;
                if (data) {
                    setTheme({
                        christmasMode: data.christmasMode || false,
                        newYearMode: data.newYearMode || false
                    });
                }
            } catch (err) {
                console.error("Seasonal Effects error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    if (loading) return null;

    if (theme.christmasMode) {
        return <SnowEffect />;
    }

    if (theme.newYearMode) {
        return <FireworkEffect />;
    }

    return null;
}

function SnowEffect() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {Array.from({ length: 50 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute bg-white rounded-full opacity-60 animate-snow"
                    style={{
                        width: `${Math.random() * 4 + 2}px`,
                        height: `${Math.random() * 4 + 2}px`,
                        left: `${Math.random() * 100}%`,
                        animationDuration: `${Math.random() * 5 + 5}s`,
                        animationDelay: `${Math.random() * 5}s`,
                    }}
                />
            ))}
        </div>
    );
}

function FireworkEffect() {
    return (
        <div className="fixed inset-0 pointer-events-none z-[100] overflow-hidden">
            {Array.from({ length: 5 }).map((_, i) => (
                <div
                    key={i}
                    className="absolute animate-firework"
                    style={{
                        left: `${Math.random() * 80 + 10}%`,
                        top: `${Math.random() * 50 + 10}%`,
                        animationDelay: `${Math.random() * 2}s`,
                    }}
                >
                    {/* Simplified firework spark */}
                    <div className="h-1 w-1 bg-yellow-400 rounded-full shadow-[0_0_20px_#facc15]" />
                </div>
            ))}
        </div>
    );
}
