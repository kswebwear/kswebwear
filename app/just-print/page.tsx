"use client";

import { motion } from "framer-motion";
import { MessageCircle, Mail, AlertTriangle, CheckCircle2, Package, Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function JustPrintPage() {
    const { settings } = useStoreSettings();
    const whatsappNumber = settings?.whatsapp || "your-number";
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/\+/g, "")}`;
    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8">
            <div className="max-w-4xl mx-auto space-y-24">
                {/* Hero Section */}
                <section className="text-center space-y-8">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]"
                    >
                        <Printer className="h-4 w-4" />
                        Custom Printing Service
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-8xl font-black tracking-tighter uppercase leading-[0.9]"
                    >
                        JUST <br />
                        <span className="text-primary italic">PRINT.</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.2 }}
                        className="text-xl text-white/60 font-light leading-relaxed max-w-2xl mx-auto"
                    >
                        You bring the gear, we bring the vibe. High-quality custom printing for your own apparel.
                        Perfect for unique one-offs or small business batches.
                    </motion.p>
                </section>

                {/* How it works */}
                <section className="space-y-12">
                    <h2 className="text-3xl font-black tracking-tighter uppercase text-center">The Workflow</h2>
                    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                        {[
                            {
                                icon: MessageCircle,
                                title: "1. Contact Us",
                                desc: "Shoot us a message on WhatsApp or Email to discuss your design and quantity."
                            },
                            {
                                icon: CheckCircle2,
                                title: "2. Confirm Details",
                                desc: "We'll verify your design suitability and confirm the placement on your apparel."
                            },
                            {
                                icon: Package,
                                title: "3. Handover",
                                desc: "Drop off or ship your T-shirts to our studio in Australia."
                            }
                        ].map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 bg-white/5 border border-white/10 rounded-3xl space-y-4 hover:bg-white/10 transition-all"
                            >
                                <step.icon className="h-8 w-8 text-primary" />
                                <h3 className="text-xl font-bold uppercase tracking-tight">{step.title}</h3>
                                <p className="text-white/40 text-sm leading-relaxed font-light">{step.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </section>

                {/* Technical Note */}
                <motion.section
                    initial={{ opacity: 0 }}
                    whileInView={{ opacity: 1 }}
                    viewport={{ once: true }}
                    className="p-8 md:p-12 bg-primary/5 border border-primary/20 rounded-[2.5rem] relative overflow-hidden"
                >
                    <div className="relative z-10 flex flex-col md:flex-row gap-8 items-center">
                        <div className="h-16 w-16 bg-primary/20 rounded-2xl flex items-center justify-center shrink-0">
                            <AlertTriangle className="h-8 w-8 text-primary" />
                        </div>
                        <div className="space-y-4">
                            <h3 className="text-2xl font-black tracking-tight uppercase">Material & Quality Note</h3>
                            <div className="space-y-2 text-white/60 font-light leading-relaxed">
                                <p>For best results, we recommend a <span className="text-white font-bold">50-75% polyester blend</span>.</p>
                                <p>Printing quality may vary depending on the material and design complexity. We'll always advise you on the best path forward before we press.</p>
                            </div>
                        </div>
                    </div>
                </motion.section>

                {/* Contact Actions */}
                <section className="flex flex-col md:flex-row gap-6 justify-center items-center pb-20 relative z-10">
                    <a
                        href={whatsappLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full md:w-auto h-16 px-10 rounded-2xl bg-[#25D366] text-white font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_0_20px_rgba(37,211,102,0.3)] cursor-pointer"
                    >
                        <MessageCircle className="h-5 w-5" />
                        WhatsApp Us
                    </a>
                    <a
                        href="mailto:contact@kswebwear.com.au"
                        target="_top"
                        className="w-full md:w-auto h-16 px-10 rounded-2xl border border-white/20 text-white hover:text-white font-black uppercase tracking-widest hover:bg-white/10 hover:scale-105 active:scale-95 transition-all flex items-center justify-center gap-3 cursor-pointer relative z-20"
                    >
                        <Mail className="h-5 w-5" />
                        <span>Email Design</span>
                    </a>
                </section>
            </div>
        </div>
    );
}
