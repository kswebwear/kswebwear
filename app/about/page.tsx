"use client";

import { motion } from "framer-motion";
import { Users, Heart, Zap, Search, ShoppingBag, CreditCard, Package } from "lucide-react";

export default function AboutPage() {
    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-4xl mx-auto space-y-16">
                <section className="space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="flex justify-center mb-12"
                    >
                        <img src="/logo.png" alt="KSWebWear Logo" className="h-40 md:h-56 w-auto" />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter text-center uppercase"
                    >
                        TEES THAT <br />
                        <span className="text-primary italic">SCREAM YOU.</span>
                    </motion.h1>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="space-y-6 text-xl text-muted-foreground leading-relaxed font-light text-center max-w-2xl mx-auto"
                    >
                        <p>
                            We are a passionate, small family-run business based in the heart of Australia ("Down Under").
                            Our mission is simple: providing high-quality, custom-made apparel at a price that actually makes sense.
                        </p>
                        <p>
                            Starting with our signature custom tees, we are rapidly expanding into hoodies,
                            spiritually crafted Karungali Mala, and curated lifestyle accessories designed for your unique expression.
                        </p>
                    </motion.div>
                </section>

                <section className="grid md:grid-cols-3 gap-12 pt-12 border-t text-center">
                    <div className="space-y-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Users className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-widest">Family First</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            From our family to yours. We specialize in bulk custom orders—perfect for
                            large family gatherings, milestones, and special events.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Heart className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-widest">Australian Pride</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            Proudly Australian owned and operated. We bring local care and
                            dedication to every single garment we print.
                        </p>
                    </div>
                    <div className="space-y-4">
                        <div className="h-12 w-12 bg-primary/10 rounded-full flex items-center justify-center mx-auto">
                            <Zap className="h-6 w-6 text-primary" />
                        </div>
                        <h2 className="text-xl font-bold uppercase tracking-widest">Premium Quality</h2>
                        <p className="text-muted-foreground leading-relaxed text-sm">
                            We use only premium cotton and state-of-the-art printing
                            to ensure your message lasts as long as your memories.
                        </p>
                    </div>
                </section>

                <section className="relative h-[400px] rounded-3xl overflow-hidden shadow-2xl">
                    <img
                        src="https://images.unsplash.com/photo-1558769132-cb1aea458c5e?q=80&w=2070&auto=format&fit=crop"
                        alt="Quality fabrics"
                        className="h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center p-8 text-center">
                        <p className="text-3xl md:text-4xl text-white font-black tracking-tighter max-w-lg">
                            DESIGNED FOR THE <br /> FUTURE, <br /> INSPIRED BY THE NOW.
                        </p>
                    </div>
                </section>

                <section className="space-y-12">
                    <motion.h2
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        className="text-4xl font-black tracking-tighter text-center uppercase"
                    >
                        How it <span className="text-primary italic">works.</span>
                    </motion.h2>

                    <div className="grid gap-8">
                        {[
                            {
                                icon: Search,
                                title: "Explore Designs",
                                text: "Access designs through our menu bar or scroll through our featured collections on the home page."
                            },
                            {
                                icon: Zap,
                                title: "Choose a Design",
                                text: "Select your preferred color, size, and style. Our premium cotton tees are designed for both comfort and bold expression."
                            },
                            {
                                icon: ShoppingBag,
                                title: "Review Your Cart",
                                text: "Navigate to your cart using the bag icon. Ensure everything looks perfect before proceeding to checkout."
                            },
                            {
                                icon: CreditCard,
                                title: "Check Out & Pay",
                                text: "Enter your delivery details and choose your preferred payment method. Our checkout is secure and streamlined."
                            },
                            {
                                icon: Package,
                                title: "We Print & Ready Your Order",
                                text: "Once recieved, we immediately get to work printing your custom gear and preparing it for express shipment to your door."
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="flex gap-6 items-start p-6 bg-muted/30 rounded-2xl border border-transparent hover:border-primary/20 transition-all"
                            >
                                <div className="h-12 w-12 bg-primary text-primary-foreground rounded-full flex items-center justify-center shrink-0 font-black">
                                    <step.icon className="h-6 w-6" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold uppercase tracking-tight mb-2">{step.title}</h3>
                                    <p className="text-muted-foreground leading-relaxed">{step.text}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </section>
            </div>
        </div>
    );
}
