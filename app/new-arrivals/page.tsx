"use client";

import { useEffect, useState } from "react";
import { getAllProducts, getAllDesigns } from "@/lib/db";
import { Product, Design } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { DesignCard } from "@/components/products/DesignCard";

export default function NewArrivalsPage() {
    const [items, setItems] = useState<(Design | Product)[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchNew = async () => {
            try {
                const [allProducts, allDesigns] = await Promise.all([
                    getAllProducts(),
                    getAllDesigns()
                ]);

                // Combine and sort by createdAt
                const combined = [
                    ...allDesigns.map(d => ({ ...d, type: 'design' })),
                    ...allProducts.map(p => ({ ...p, type: 'product' }))
                ] as any[];

                const sorted = combined.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)).slice(0, 12);
                setItems(sorted);
            } catch (err) {
                console.error("Error fetching arrivals:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchNew();
    }, []);

    return (
        <div className="container mx-auto px-4 py-16 md:py-24 max-w-[1400px]">
            <div className="space-y-4 mb-16 px-4">
                <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] italic">New <br />Arrivals.</h1>
                <p className="text-lg text-muted-foreground uppercase tracking-widest font-bold max-w-2xl">
                    The latest additions to our collective. Meticulously designed, freshly dropped.
                </p>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-[3/4] bg-muted animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {items.map((item: any, idx) => (
                        item.type === 'design' ? (
                            <DesignCard key={item.id} design={item} />
                        ) : (
                            <motion.div
                                key={item.id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="group relative"
                            >
                                <Link href={`/products/${item.id}`}>
                                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] border border-white/10 bg-card transition-transform group-hover:scale-[1.02]">
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
                                        />
                                    </div>
                                    <div className="mt-6 px-2 space-y-1">
                                        <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest font-bold">${item.price.toFixed(2)}</p>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    ))}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center py-20 border rounded-3xl border-dashed">
                    <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold">No new items found. Check back later!</p>
                </div>
            )}
        </div>
    );
}
