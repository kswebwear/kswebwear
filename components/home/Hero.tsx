"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect } from "react";
import { ChevronRight, ChevronLeft, Sparkles } from "lucide-react";

interface HeroProps {
    settings?: {
        homeHeroImage?: string;
        useHeroCarousel?: boolean;
        homeCarousel?: string[];
        showDiscountHighlight?: boolean;
        discountHighlight?: {
            text: string;
            link: string;
        };
    };
}

export function Hero({ settings }: HeroProps) {
    const [currentSlide, setCurrentSlide] = useState(0);
    const carouselImages = settings?.homeCarousel || [];
    const useCarousel = settings?.useHeroCarousel && carouselImages.length > 0;
    const singleImage = settings?.homeHeroImage || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?q=80&w=2070&auto=format&fit=crop";

    useEffect(() => {
        if (useCarousel) {
            const timer = setInterval(() => {
                setCurrentSlide((prev) => (prev + 1) % carouselImages.length);
            }, 5000);
            return () => clearInterval(timer);
        }
    }, [useCarousel, carouselImages.length]);

    const activeImage = useCarousel ? carouselImages[currentSlide] : singleImage;

    return (
        <section className="relative w-full flex flex-col h-[90vh]">
            {/* Promo Highlight Bar */}
            {/* Promo Highlight Bar */}
            {settings?.showDiscountHighlight && settings.discountHighlight?.text && (
                <div className="w-full bg-primary py-3 px-4 shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] z-50">
                    <div className="container mx-auto flex items-center justify-center">
                        <Link href={settings.discountHighlight?.link || "/products"} className="flex items-center gap-2 group">
                            <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                            <span className="text-xs sm:text-sm font-black uppercase tracking-[0.2em] text-primary-foreground group-hover:underline decoration-2 underline-offset-4">
                                {settings.discountHighlight?.text}
                            </span>
                            <Sparkles className="h-4 w-4 text-primary-foreground animate-pulse" />
                        </Link>
                    </div>
                </div>
            )}

            <div className="relative flex-1 flex items-center justify-center bg-black text-center text-white overflow-hidden">
                {/* Background Layer */}
                <AnimatePresence mode="wait">
                    <motion.div
                        key={activeImage}
                        initial={{ opacity: 0, scale: 1.1 }}
                        animate={{ opacity: 0.6, scale: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1 }}
                        className="absolute inset-0 z-0 bg-cover bg-center"
                        style={{ backgroundImage: `url('${activeImage}')` }}
                    />
                </AnimatePresence>

                <div className="absolute inset-0 z-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
                <div className="absolute inset-0 z-0 bg-black/30 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-black/40 to-black/80" />

                {/* Content Layer */}
                <div className="relative z-10 container mx-auto px-4 flex flex-col items-center gap-8">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8, ease: "easeOut" }}
                        className="space-y-4"
                    >
                        <h1 className="text-5xl font-black tracking-tighter sm:text-6xl md:text-7xl lg:text-8xl bg-clip-text text-transparent bg-gradient-to-br from-white to-neutral-400">
                            WEAR THE <br className="hidden sm:block" /> FUTURE.
                        </h1>
                        <p className="mx-auto max-w-[600px] text-lg text-neutral-300 md:text-xl font-light tracking-wide leading-relaxed">
                            Meticulously curated streetwear for the avant-garde. <br className="hidden md:block" /> Quality that speaks louder than words.
                        </p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
                        className="flex flex-col gap-4 sm:flex-row"
                    >
                        <Link href="/products" suppressHydrationWarning>
                            <Button size="lg" className="min-w-[180px] h-14 text-lg font-semibold tracking-wide bg-white text-black hover:bg-neutral-200 hover:scale-105 transition-all duration-300">
                                SHOP COLLECTION
                            </Button>
                        </Link>
                        <Link href="/new-arrivals" suppressHydrationWarning>
                            <Button size="lg" variant="outline" className="min-w-[180px] h-14 text-lg font-semibold tracking-wide border-white/30 text-white hover:bg-white/10 hover:border-white backdrop-blur-sm bg-transparent transition-all duration-300">
                                NEW ARRIVALS
                            </Button>
                        </Link>
                    </motion.div>
                </div>

                {/* Carousel Controls */}
                {useCarousel && (
                    <>
                        <button
                            onClick={() => setCurrentSlide(prev => (prev - 1 + carouselImages.length) % carouselImages.length)}
                            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors z-20"
                        >
                            <ChevronLeft className="h-6 w-6" />
                        </button>
                        <button
                            onClick={() => setCurrentSlide(prev => (prev + 1) % carouselImages.length)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full border border-white/10 bg-black/20 backdrop-blur-md hover:bg-white/10 transition-colors z-20"
                        >
                            <ChevronRight className="h-6 w-6" />
                        </button>

                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                            {carouselImages.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setCurrentSlide(i)}
                                    className={`h-1 transition-all duration-300 rounded-full ${i === currentSlide ? "w-8 bg-white" : "w-2 bg-white/30"}`}
                                />
                            ))}
                        </div>
                    </>
                )}
            </div>
        </section>
    );
}
