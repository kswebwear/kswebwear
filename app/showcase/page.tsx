"use client";

import { useState, useEffect } from "react";
import { ShowcaseGrid } from "@/components/ui/showcase-grid";
import { Product } from "@/lib/types";
import { getAllProducts } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";
import { X, ShoppingBag, ArrowRight, MousePointer2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TShirtModel } from "@/components/ui/tshirt-model";

export default function ShowcasePage() {
    const [products, setProducts] = useState<Product[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
    const [loading, setLoading] = useState(true);
    const [selectedColor, setSelectedColor] = useState("white");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const data = await getAllProducts();
                setProducts(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    useEffect(() => {
        if (selectedProduct) {
            setSelectedColor(selectedProduct.colors?.[0] || "white");
        }
    }, [selectedProduct]);

    return (
        <div className="min-h-screen bg-white">
            {/* Minimalist Hero Section */}
            <section className="relative h-[40vh] flex flex-col items-center justify-center text-black px-4 pt-20">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center space-y-4"
                >
                    <span className="text-xs font-black uppercase tracking-[0.3em] text-primary">Est. 2024</span>
                    <h1 className="text-6xl md:text-8xl font-black tracking-tighter uppercase leading-tight">
                        Signature <br /> <span className="italic font-light">Collection.</span>
                    </h1>
                </motion.div>
                <motion.div
                    initial={{ scaleX: 0 }}
                    animate={{ scaleX: 1 }}
                    transition={{ delay: 0.5, duration: 1 }}
                    className="h-px w-24 bg-black mt-12"
                />
            </section>

            {/* Gallery Section */}
            <main className="container mx-auto px-6 py-24">
                <div className="flex flex-col md:flex-row justify-between items-center mb-24 gap-8">
                    <div className="flex items-center gap-4">
                        <span className="text-sm font-bold uppercase tracking-widest opacity-30">Selection</span>
                        <div className="h-px w-12 bg-black/10" />
                        <h2 className="text-xl font-black uppercase tracking-tighter">Premium Designs</h2>
                    </div>

                    <div className="flex gap-2">
                        {["All", "Minimal", "Bold", "Retro"].map((f) => (
                            <button key={f} className="text-[10px] font-black uppercase tracking-[0.2em] px-4 py-2 hover:bg-black hover:text-white transition-colors border border-black/5 rounded-full">
                                {f}
                            </button>
                        ))}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="aspect-[4/5] bg-gray-50 animate-pulse rounded-2xl" />
                        ))}
                    </div>
                ) : (
                    <ShowcaseGrid
                        products={products}
                        onQuickView={setSelectedProduct}
                    />
                )}
            </main>

            {/* 3D Immersive Modal */}
            <AnimatePresence>
                {selectedProduct && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-8">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setSelectedProduct(null)}
                            className="absolute inset-0 bg-white/90 backdrop-blur-xl"
                        />

                        <motion.div
                            layoutId={selectedProduct.id}
                            className="relative w-full max-w-7xl bg-white md:border md:rounded-[40px] md:shadow-2xl flex flex-col md:flex-row h-full md:h-[85vh] overflow-hidden"
                        >
                            <Button
                                size="icon"
                                variant="ghost"
                                className="absolute top-8 right-8 z-20 hover:rotate-90 transition-transform duration-500"
                                onClick={() => setSelectedProduct(null)}
                            >
                                <X className="w-8 h-8" />
                            </Button>

                            {/* 3D Viewer Side */}
                            <div className="flex-1 bg-gray-50 relative flex items-center justify-center">
                                <TShirtModel
                                    designUrl={selectedProduct.images[0]}
                                    color={selectedColor}
                                />

                                <div className="absolute bottom-12 left-12 flex items-center gap-3 bg-white/50 backdrop-blur-md px-4 py-2 rounded-full border border-white">
                                    <MousePointer2 className="w-4 h-4 text-black/40 animate-bounce" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-black/60">Interact to rotate</span>
                                </div>
                            </div>

                            {/* Info Side */}
                            <div className="w-full md:w-[450px] p-12 md:p-16 flex flex-col justify-between bg-white border-l">
                                <div className="space-y-12">
                                    <div>
                                        <div className="flex items-center gap-2 mb-4">
                                            <span className="h-px w-8 bg-primary" />
                                            <p className="text-primary font-black uppercase tracking-[0.2em] text-[10px]">{selectedProduct.category}</p>
                                        </div>
                                        <h2 className="text-5xl font-black tracking-tighter uppercase leading-none mb-4">{selectedProduct.name}</h2>
                                        <p className="text-3xl font-light">${selectedProduct.price.toFixed(2)}</p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">About this design</h4>
                                        <p className="text-sm leading-relaxed text-black/60 font-medium">
                                            {selectedProduct.description}
                                        </p>
                                    </div>

                                    <div className="space-y-6">
                                        <h4 className="text-[10px] font-black uppercase tracking-[0.2em] opacity-30">Select Tone</h4>
                                        <div className="flex gap-3">
                                            {selectedProduct.colors?.map((color) => (
                                                <button
                                                    key={color}
                                                    onClick={() => setSelectedColor(color)}
                                                    className={`w-10 h-10 rounded-full border-4 transition-all duration-500 ${selectedColor === color ? 'border-black scale-110' : 'border-transparent opacity-40 hover:opacity-100'
                                                        }`}
                                                    style={{ backgroundColor: color.toLowerCase() }}
                                                />
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-16 space-y-6">
                                    <Button className="w-full h-16 text-xs font-black uppercase tracking-[0.3em] rounded-full transition-all hover:scale-[1.02]">
                                        Secure this piece
                                        <ArrowRight className="ml-4 w-4 h-4" />
                                    </Button>
                                    <p className="text-center text-[9px] font-medium opacity-20 uppercase tracking-[0.4em]">
                                        Free express shipping australia wide
                                    </p>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
