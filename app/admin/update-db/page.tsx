"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { getAllTemplates } from "@/lib/db";
import { doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

export default function UpdateDbPage() {
    const [loading, setLoading] = useState(false);
    const [log, setLog] = useState<string[]>([]);

    const addLog = (msg: string) => setLog(prev => [...prev, msg]);

    const handleAddXS = async () => {
        setLoading(true);
        setLog([]);
        try {
            addLog("Fetching templates...");
            const templates = await getAllTemplates();
            addLog(`Found ${templates.length} templates.`);

            let updatedCount = 0;

            for (const template of templates) {
                if (!template.sizes.includes("XS")) {
                    addLog(`Updating ${template.name} (${template.id})...`);
                    const newSizes = ["XS", ...template.sizes];

                    const ref = doc(db, "product_templates", template.id);
                    await updateDoc(ref, { sizes: newSizes });
                    updatedCount++;
                } else {
                    addLog(`Skipping ${template.name} - already has XS.`);
                }
            }

            addLog(`Done! Updated ${updatedCount} templates.`);
            toast.success(`Updated ${updatedCount} templates to include XS.`);
        } catch (error) {
            console.error(error);
            addLog(`Error: ${error}`);
            toast.error("Failed to update templates.");
        } finally {
            setLoading(false);
        }
    };

    const handleStandardize = async () => {
        setLoading(true);
        setLog([]);
        try {
            addLog("Fetching templates...");
            const templates = await getAllTemplates();
            let updatedCount = 0;

            for (const template of templates) {
                const updates: any = {};
                let changed = false;

                // 1. Update Kids Sizes
                if (template.demographic === 'Kids') {
                    // Check if sizes are old style (numbers) vs new style (standard)
                    // Just force update to standard if it's the specific "Kids Play Tee" or simply enforces standard sizes for all Kids items if safe.
                    // Let's safe check: if it has 2T or 4T, update it.
                    if (template.sizes.includes('2T') || template.sizes.includes('4T') || !template.sizes.includes('XS')) {
                        updates.sizes = ["XS", "S", "M", "L", "XL"];
                        addLog(`Updating sizes for ${template.name}...`);
                        changed = true;
                    }
                }

                // 2. Reorder Colors (White, Black, ...)
                // We find White and Black and move them to front.
                const colors = [...template.colors];
                const whiteIdx = colors.findIndex(c => c.name.toLowerCase() === 'white' || c.hex.toLowerCase() === '#ffffff');
                const blackIdx = colors.findIndex(c => c.name.toLowerCase() === 'black' || c.hex.toLowerCase() === '#000000');

                // If both exist
                if (whiteIdx !== -1 || blackIdx !== -1) {
                    const newColors = [];
                    // Add White
                    if (whiteIdx !== -1) newColors.push(colors[whiteIdx]);
                    // Add Black
                    if (blackIdx !== -1) newColors.push(colors[blackIdx]);
                    // Add others
                    for (let i = 0; i < colors.length; i++) {
                        if (i !== whiteIdx && i !== blackIdx) {
                            newColors.push(colors[i]);
                        }
                    }

                    // Check if actually changed order
                    if (JSON.stringify(newColors) !== JSON.stringify(template.colors)) {
                        updates.colors = newColors;
                        addLog(`Reordering colors for ${template.name}...`);
                        changed = true;
                    }
                }

                if (changed) {
                    const ref = doc(db, "product_templates", template.id);
                    await updateDoc(ref, updates);
                    updatedCount++;
                }
            }
            addLog(`Done! Updated ${updatedCount} templates.`);
            toast.success(`Standardized ${updatedCount} templates.`);
        } catch (error) {
            console.error(error);
            addLog(`Error: ${error}`);
            toast.error("Failed to standardize.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto py-12 space-y-8">
            <h1 className="text-3xl font-bold">Database Updates</h1>

            <div className="p-6 border rounded-xl space-y-4">
                <h2 className="text-xl font-semibold">Product Templates</h2>
                <p className="text-muted-foreground">Add 'XS' size to all product templates if missing.</p>
                <Button onClick={handleAddXS} disabled={loading}>
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Add XS Size
                </Button>
            </div>

            <div className="p-6 border rounded-xl space-y-4">
                <h2 className="text-xl font-semibold">Standardize Colors & Sizes</h2>
                <p className="text-muted-foreground">
                    1. Update <strong>Kids</strong> sizes to XS, S, M, L, XL.<br />
                    2. Reorder colors to <strong>White, Black</strong>, then others.
                </p>
                <Button onClick={handleStandardize} disabled={loading} variant="outline">
                    {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Standardize Templates
                </Button>
            </div>

            <div className="bg-black/80 text-green-400 font-mono p-4 rounded-xl text-xs h-64 overflow-y-auto">
                {log.length === 0 ? "Ready..." : log.map((l, i) => <div key={i}>{l}</div>)}
            </div>
        </div>
    );
}
