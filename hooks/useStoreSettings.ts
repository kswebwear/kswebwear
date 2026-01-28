"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/db";

export function useStoreSettings() {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const data = await getSettings("store") as any;
                setSettings(data);
            } catch (err) {
                console.error("Error fetching store settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return { settings, loading };
}
