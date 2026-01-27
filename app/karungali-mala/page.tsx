"use client";

import { useEffect, useState } from "react";
import { getAllProducts, getAllDesigns, getSettings } from "@/lib/db";
import { Product, Design } from "@/lib/types";
import { motion } from "framer-motion";
import Link from "next/link";
import { DesignCard } from "@/components/products/DesignCard";

export default function KarungaliMalaPage() {
    const [items, setItems] = useState<(Design | Product)[]>([]);
    const [heroImage, setHeroImage] = useState("https://images.unsplash.com/photo-1590736962236-07753a35b12a?q=80&w=2070&auto=format&fit=crop");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMala = async () => {
            try {
                const [allProducts, allDesigns, storeSettings] = await Promise.all([
                    getAllProducts(),
                    getAllDesigns(),
                    getSettings("store") as any
                ]);

                if (storeSettings?.karungaliMalaImage) {
                    setHeroImage(storeSettings.karungaliMalaImage);
                }

                // Filter designs for 'karungali'
                const filteredDesigns = allDesigns.filter(d =>
                    d.title.toLowerCase().includes("karungali") ||
                    d.categories.some(c => c.toLowerCase().includes("karungali"))
                ).map(d => ({ ...d, type: 'design' }));

                // Filter products for 'karungali'
                const filteredProducts = allProducts.filter(p =>
                    p.category.toLowerCase().includes("karungali") ||
                    p.name.toLowerCase().includes("karungali")
                ).map(p => ({ ...p, type: 'product' }));

                const combined = [...filteredDesigns, ...filteredProducts] as any[];
                setItems(combined);
            } catch (err) {
                console.error("Error fetching Karungali collection:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchMala();
    }, []);

    return (
        <div className="container mx-auto px-4 py-20 max-w-[1400px]">
            <div className="flex flex-col md:flex-row gap-16 items-center mb-24 px-4 pt-12">
                <div className="flex-1 space-y-8">
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase italic leading-none">
                        Karungali <br />
                        <span className="text-primary not-italic">Mala.</span>
                    </h1>
                    <p className="text-xl text-muted-foreground font-light leading-relaxed max-w-xl">
                        Experience the spiritual power and timeless aesthetic of authentic Karungali.
                        Meticulously crafted beads known for their grounding energy and deep,
                        natural obsidian-like finish.
                    </p>
                </div>
                <div className="flex-1 aspect-video md:aspect-square w-full rounded-[3rem] overflow-hidden shadow-2xl border border-white/10">
                    <img
                        src={heroImage}
                        alt="Karungali beads"
                        className="h-full w-full object-cover"
                    />
                </div>
            </div>

            <div className="space-y-4 mb-16 px-4">
                <h2 className="text-xs font-black uppercase tracking-[0.3em] text-primary border-l-4 border-primary pl-4">The Collection</h2>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="aspect-[4/5] bg-muted animate-pulse rounded-[2.5rem]" />
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                    {items.map((item: any) => (
                        item.type === 'design' ? (
                            <DesignCard key={item.id} design={item} />
                        ) : (
                            <motion.div
                                key={item.id}
                                whileHover={{ y: -8 }}
                                className="group relative"
                            >
                                <Link href={`/products/${item.id}`}>
                                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-card border border-white/10 relative">
                                        <img
                                            src={item.images[0]}
                                            alt={item.name}
                                            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                                        />
                                        {!item.inStock && (
                                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center">
                                                <span className="bg-white text-black px-4 py-2 font-black uppercase tracking-[0.2em] text-[10px]">Sold Out</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 px-2 space-y-1">
                                        <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">{item.name}</h3>
                                        <div className="flex justify-between items-center text-xs font-bold uppercase tracking-widest text-muted-foreground">
                                            <span>${item.price.toFixed(2)}</span>
                                            <span className="text-primary">View Product</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    ))}
                </div>
            )}

            {!loading && items.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-[3rem] opacity-50">
                    <p className="text-xl font-black uppercase tracking-widest italic">New Karungali arrivals coming soon.</p>
                </div>
            )}
        </div>
    );
}
