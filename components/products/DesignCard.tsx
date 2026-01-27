"use client";

import Link from "next/link";
import { Design } from "@/lib/types";
import { motion } from "framer-motion";

export function DesignCard({ design }: { design: Design }) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -8 }}
            className="group relative"
        >
            <Link href={`/products/${design.id}`} className="block">
                <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-card border border-white/10 transition-colors group-hover:border-primary/50">
                    <img
                        src={design.mainImage}
                        alt={design.title}
                        className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />

                    {/* Hover Overlay */}
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-8 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                        <div className="flex flex-wrap gap-2 mb-3">
                            {design.categories.map(cat => (
                                <span key={cat} className="px-3 py-1 bg-primary/20 border border-primary/30 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                                    {cat}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-6 space-y-1 px-2">
                    <h3 className="text-lg font-black uppercase tracking-tight group-hover:text-primary transition-colors">
                        {design.title}
                    </h3>
                    <p className="text-xs text-muted-foreground uppercase tracking-[0.2em] font-bold">
                        View Product Range
                    </p>
                </div>
            </Link>
        </motion.div>
    );
}
