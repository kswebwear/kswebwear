"use client";

import { useState } from "react";
import { db } from "@/lib/firebase";
import { collection, doc, setDoc, Timestamp } from "firebase/firestore";
import { Button } from "@/components/ui/button";
import { Loader2, Database, CheckCircle2 } from "lucide-react";

const SAMPLE_DESIGNS = [
    {
        title: "Karungali Traditional",
        description: "Elegant traditional patterns inspired by Karungali beadwork.",
        mainImage: "https://kswebwear.com.au/cdn/shop/files/karungali-mala-original-ebony-wood-prayer-beads-360_large.jpg",
        categories: ["Traditional", "Spiritual"],
        tags: ["karungali", "beads", "black"],
        featured: true
    },
    {
        title: "Banana Text Round",
        description: "Minimalist circular text design for a clean look.",
        mainImage: "https://kswebwear.com.au/cdn/shop/products/banana-text-round-white_large.jpg",
        categories: ["Minimalist", "Typographic"],
        tags: ["banana", "text", "white"],
        featured: true
    },
    {
        title: "Stay Wild",
        description: "Classic adventure-themed graphic.",
        mainImage: "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000",
        categories: ["Nature", "Adventure"],
        tags: ["wild", "animal", "outdoor"],
        featured: true
    }
];

const SAMPLE_TEMPLATES = [
    {
        id: "classic-tee",
        name: "Classic Unisex Tee",
        basePrice: 29.99,
        description: "100% Cotton premium feel",
        category: "apparel",
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "White", hex: "#FFFFFF" },
            { name: "Navy", hex: "#000080" }
        ]
    },
    {
        id: "premium-hoodie",
        name: "Heavyweight Hoodie",
        basePrice: 54.99,
        description: "Cozy fleece lined",
        category: "apparel",
        sizes: ["S", "M", "L", "XL", "2XL"],
        colors: [
            { name: "Black", hex: "#000000" },
            { name: "Heather Grey", hex: "#808080" },
            { name: "Forest Green", hex: "#013220" }
        ]
    }
];

export default function DesignSeederPage() {
    const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

    const handleSeed = async () => {
        setStatus("loading");
        try {
            // Seed Designs
            for (const design of SAMPLE_DESIGNS) {
                const designRef = doc(collection(db, "designs"));
                await setDoc(designRef, {
                    ...design,
                    createdAt: Timestamp.now().toMillis()
                });
            }

            // Seed Templates
            for (const template of SAMPLE_TEMPLATES) {
                const templateRef = doc(db, "product_templates", template.id);
                await setDoc(templateRef, {
                    ...template,
                    createdAt: Timestamp.now().toMillis()
                });
            }

            setStatus("success");
        } catch (err) {
            console.error("Seeding error:", err);
            setStatus("error");
        }
    };

    return (
        <div className="max-w-xl mx-auto py-20 px-6 text-center space-y-8">
            <div className="space-y-4">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                    <Database className="h-10 w-10 text-primary" />
                </div>
                <h1 className="text-4xl font-black uppercase tracking-tighter italic">Design Seeder</h1>
                <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold">
                    Populate your design library with sample data for Phase 17
                </p>
            </div>

            <div className="bg-card border p-8 rounded-[2.5rem] space-y-6 shadow-2xl">
                {status === "idle" && (
                    <>
                        <p className="text-sm font-medium leading-relaxed">
                            This will add 3 sample designs and 2 product templates to your Firestore database.
                        </p>
                        <Button onClick={handleSeed} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest text-lg">
                            Seed Design Data
                        </Button>
                    </>
                )}

                {status === "loading" && (
                    <div className="flex flex-col items-center gap-4 py-8">
                        <Loader2 className="h-12 w-12 animate-spin text-primary" />
                        <p className="font-bold uppercase text-xs tracking-widest animate-pulse">Adding master records...</p>
                    </div>
                )}

                {status === "success" && (
                    <div className="flex flex-col items-center gap-6 py-8">
                        <CheckCircle2 className="h-16 w-16 text-green-500" />
                        <div className="space-y-2">
                            <p className="font-bold uppercase tracking-widest text-lg">Database Seeded!</p>
                            <p className="text-sm text-muted-foreground">Go to your products page to see it in action.</p>
                        </div>
                        <Button onClick={() => window.location.href = '/products'} className="w-full h-14 rounded-2xl font-black uppercase tracking-widest bg-green-500 hover:bg-green-600">
                            View Gallery
                        </Button>
                    </div>
                )}

                {status === "error" && (
                    <div className="space-y-4 text-red-500">
                        <p className="font-bold">Failed to seed database.</p>
                        <Button onClick={() => setStatus("idle")} variant="outline" className="w-full border-red-500/20">Try Again</Button>
                    </div>
                )}
            </div>
        </div>
    );
}
