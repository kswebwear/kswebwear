"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Expand } from "lucide-react";
import { Product } from "@/lib/types";

interface DesignCardProps {
    product: Product;
    onQuickView?: (product: Product) => void;
}

export function DesignCard({ product, onQuickView }: DesignCardProps) {
    const [isHovered, setIsHovered] = useState(false);

    return (
        <motion.div
            layout
            onHoverStart={() => setIsHovered(true)}
            onHoverEnd={() => setIsHovered(false)}
            className="break-inside-avoid mb-12 group cursor-pointer"
            onClick={() => onQuickView?.(product)}
        >
            {/* Image Container */}
            <div className="relative aspect-[4/5] overflow-hidden bg-gray-50 rounded-[32px] transition-all duration-700">
                <AnimatePresence mode="wait">
                    <motion.img
                        key={isHovered && product.images[1] ? product.images[1] : product.images[0]}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.8 }}
                        src={isHovered && product.images[1] ? product.images[1] : product.images[0]}
                        alt={product.name}
                        className={`h-full w-full object-cover transition-transform duration-[2000ms] ease-out ${isHovered ? 'scale-110' : 'scale-100'}`}
                    />
                </AnimatePresence>

                {/* Minimalist Quick View Button */}
                <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-500">
                    <div className="bg-white/90 backdrop-blur-md px-8 py-4 rounded-full border border-white shadow-2xl flex items-center gap-3 scale-90 group-hover:scale-100 transition-transform duration-500">
                        <span className="text-[10px] font-black uppercase tracking-[0.2em]">Explore 3D</span>
                        <Expand className="w-3 h-3" />
                    </div>
                </div>

                {/* Badge if featured */}
                {product.featured && (
                    <div className="absolute top-6 left-6">
                        <span className="bg-black text-white text-[8px] font-black uppercase tracking-[0.3em] px-3 py-1.5 rounded-full">Limited</span>
                    </div>
                )}
            </div>

            {/* Re-imagined Sleek Info Section */}
            <div className="mt-6 px-4 space-y-2 text-center md:text-left transition-all duration-500 group-hover:translate-y-[-4px]">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-1">
                    <h3 className="text-sm font-black uppercase tracking-tight leading-none text-black/80">{product.name}</h3>
                    <div className="h-px flex-1 bg-black/5 mx-4 hidden md:block" />
                    <p className="text-sm font-light text-black/40">${product.price.toFixed(0)}</p>
                </div>
                <p className="text-[9px] font-black tracking-[0.2em] uppercase opacity-20">{product.category}</p>
            </div>
        </motion.div>
    );
}
