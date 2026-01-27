"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { Star } from "lucide-react";

import { useEffect, useState } from "react";
import { getFeaturedDesigns, getFeaturedProducts } from "@/lib/db";
import { Design, Product } from "@/lib/types";
import { DesignCard } from "@/components/products/DesignCard";

const container = {
    hidden: { opacity: 0 },
    show: {
        opacity: 1,
        transition: {
            staggerChildren: 0.1,
            delayChildren: 0.3,
        },
    },
};

export function FeaturedProducts() {
    const [items, setItems] = useState<(Design | Product)[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFeatured = async () => {
            try {
                const [designs, products] = await Promise.all([
                    getFeaturedDesigns(),
                    getFeaturedProducts()
                ]);

                const combined = [
                    ...designs.map(d => ({ ...d, type: 'design' as const })),
                    ...products.map(p => ({ ...p, type: 'product' as const }))
                ].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));

                setItems(combined);
            } catch (err) {
                console.error("Error fetching featured items:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchFeatured();
    }, []);

    if (loading) {
        return (
            <div className="w-full py-20 flex justify-center">
                <p className="text-muted-foreground animate-pulse text-xs font-black uppercase tracking-widest">Loading featured items...</p>
            </div>
        );
    }

    if (items.length === 0) return null;

    return (
        <section className="w-full py-20 md:py-28 lg:py-36 bg-background">
            <div className="container mx-auto px-4 md:px-6">
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-16 px-4">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="space-y-4"
                    >
                        <h2 className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.85] italic">Featured <br />Artworks.</h2>
                        <p className="text-muted-foreground text-lg uppercase tracking-widest font-bold">The most popular designs of the season.</p>
                    </motion.div>
                    <Link href="/products" suppressHydrationWarning>
                        <Button className="h-14 px-8 rounded-2xl bg-primary text-primary-foreground font-black uppercase tracking-widest text-xs hover:scale-110 active:scale-95 transition-all">
                            Explore All Designs
                        </Button>
                    </Link>
                </div>

                <motion.div
                    variants={container}
                    initial="hidden"
                    whileInView="show"
                    viewport={{ once: true, margin: "-100px" }}
                    className="grid grid-cols-1 gap-12 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                >
                    {items.map((item: any) => (
                        item.type === 'design' ? (
                            <DesignCard key={item.id} design={item} />
                        ) : (
                            <motion.div
                                key={item.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 }
                                }}
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
                                        {item.featured && (
                                            <div className="absolute top-6 left-6 flex items-center gap-2 px-3 py-1 bg-primary text-primary-foreground rounded-full text-[10px] font-black uppercase tracking-widest italic shadow-xl">
                                                <Star className="h-3 w-3 fill-current" />
                                                Featured
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-6 px-2 space-y-1">
                                        <div className="flex justify-between items-start gap-4">
                                            <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors truncate">{item.name}</h3>
                                            <span className="text-lg font-black italic tracking-tighter">${item.price.toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between items-center text-[10px] font-bold uppercase tracking-widest text-muted-foreground/50">
                                            <span>{item.category}</span>
                                            <span className="text-primary opacity-0 group-hover:opacity-100 transition-opacity">Shop Now →</span>
                                        </div>
                                    </div>
                                </Link>
                            </motion.div>
                        )
                    ))}
                </motion.div>
            </div>
        </section>
    );
}
