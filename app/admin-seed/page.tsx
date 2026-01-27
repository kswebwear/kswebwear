"use client";

import { useState } from "react";
import { createProduct } from "@/lib/db";
import { Button } from "@/components/ui/button";

const MOCK_PRODUCTS = [
    {
        name: "Classic White Tee",
        description: "A premium quality white t-shirt essential for any wardrobe.",
        price: 29.99,
        category: "T-Shirts",
        images: ["https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=1780&auto=format&fit=crop"],
        sizes: ["S", "M", "L", "XL"],
        colors: ["White"],
        inStock: true,
        featured: true,
        createdAt: Date.now(),
    },
    {
        name: "Black Denim Jacket",
        description: "Rugged yet stylish black denim jacket.",
        price: 89.99,
        category: "Outerwear",
        images: ["https://images.unsplash.com/photo-1601924994987-69e26d50dc26?q=80&w=2070&auto=format&fit=crop"],
        sizes: ["M", "L", "XL"],
        colors: ["Black"],
        inStock: true,
        featured: true,
        createdAt: Date.now(),
    },
    {
        name: "Urban Cargo Pants",
        description: "Functional and fashionable cargo pants.",
        price: 59.99,
        category: "Pants",
        images: ["https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?q=80&w=1888&auto=format&fit=crop"],
        sizes: ["30", "32", "34", "36"],
        colors: ["Olive", "Black"],
        inStock: true,
        featured: true,
        createdAt: Date.now(),
    },
    {
        name: "Retro Sneakers",
        description: "Vintage inspired sneakers with modern comfort.",
        price: 119.99,
        category: "Footwear",
        images: ["https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=2012&auto=format&fit=crop"],
        sizes: ["8", "9", "10", "11"],
        colors: ["White/Red"],
        inStock: true,
        featured: true,
        createdAt: Date.now(),
    },
];

export default function SeedPage() {
    const [status, setStatus] = useState("Idle");

    const handleSeed = async () => {
        setStatus("Seeding...");
        try {
            for (const product of MOCK_PRODUCTS) {
                await createProduct(product);
            }
            setStatus("Success! Products added to Firestore.");
        } catch (error: any) {
            console.error(error);
            setStatus("Error: " + error.message);
        }
    };

    return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4">
            <h1 className="text-2xl font-bold">Database Seeder</h1>
            <p>This will add {MOCK_PRODUCTS.length} sample products to your &quot;products&quot; collection in Firebase.</p>
            <Button onClick={handleSeed} disabled={status === "Seeding..."}>
                {status === "Seeding..." ? "Adding..." : "Seed Products"}
            </Button>
            <p className="text-sm text-muted-foreground">{status}</p>
        </div>
    );
}
