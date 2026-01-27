"use client";

import { motion } from "framer-motion";
import { HelpCircle, ChevronRight } from "lucide-react";

export default function FAQPage() {
    const faqs = [
        {
            q: "How long does shipping take?",
            a: "Most custom apparel orders are printed and shipped within 3-5 business days. Express shipping within Australia usually takes an additional 1-3 business days."
        },
        {
            q: "Can I provide my own T-shirts for printing?",
            a: "Yes! Use our 'Just Print' service. We recommend 50-75% polyester blends for the best results. Contact us via WhatsApp to arrange drop-off."
        },
        {
            q: "What is your return policy?",
            a: "As most items are custom-made to order, we only offer returns for manufacturing defects or shipping damage. Please contact us within 7 days of receiving your order if there's an issue."
        },
        {
            q: "Do you offer bulk discounts?",
            a: "Absolutely. We specialize in family sets and event orders. Discounts are applied automatically for large quantities, or you can contact us for a custom quote."
        },
        {
            q: "How should I care for my printed apparel?",
            a: "For longevity, we recommend machine washing cold, inside out, and hanging to dry. Avoid ironing directly over the printed design."
        }
    ];

    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8">
            <div className="max-w-3xl mx-auto space-y-16">
                <div className="text-center space-y-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 text-primary text-xs font-black uppercase tracking-[0.2em]"
                    >
                        <HelpCircle className="h-4 w-4" />
                        Common Questions
                    </motion.div>
                    <h1 className="text-5xl md:text-7xl font-black tracking-tighter uppercase">FAQ.</h1>
                </div>

                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <motion.div
                            key={i}
                            initial={{ opacity: 0, y: 10 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: i * 0.1 }}
                            className="group p-8 bg-white/5 border border-white/10 rounded-[2rem] hover:bg-white/10 transition-all"
                        >
                            <div className="flex gap-4 items-start">
                                <ChevronRight className="h-5 w-5 text-primary mt-1 shrink-0 transition-transform group-hover:translate-x-1" />
                                <div className="space-y-4">
                                    <h3 className="text-xl font-bold uppercase tracking-tight">{faq.q}</h3>
                                    <p className="text-white/40 leading-relaxed font-light">{faq.a}</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </div>
    );
}
