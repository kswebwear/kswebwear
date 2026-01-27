"use client";

import { useEffect, useState } from "react";
import { getSettings } from "@/lib/db";

export function useStoreSettings() {
    const [settings, setSettings] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings("store");
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
