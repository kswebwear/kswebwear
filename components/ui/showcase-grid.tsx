"use client";

import { DesignCard } from "./design-card";
import { Product } from "@/lib/types";
import { motion } from "framer-motion";

interface ShowcaseGridProps {
    products: Product[];
    onQuickView?: (product: Product) => void;
}

export function ShowcaseGrid({ products, onQuickView }: ShowcaseGridProps) {
    return (
        <div className="columns-1 sm:columns-2 lg:columns-3 gap-12">
            {products.map((product, idx) => (
                <motion.div
                    key={product.id}
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true, margin: "-100px" }}
                    transition={{
                        duration: 0.6,
                        delay: idx * 0.05,
                        ease: [0.21, 0.47, 0.32, 0.98]
                    }}
                >
                    <DesignCard
                        product={product}
                        onQuickView={onQuickView}
                    />
                </motion.div>
            ))}
        </div>
    );
}
