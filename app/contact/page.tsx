"use client";

import { motion } from "framer-motion";
import { Mail, MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export default function ContactPage() {
    const { settings } = useStoreSettings();
    const whatsappNumber = settings?.whatsapp || "+61-XXXX-XXXX";
    const whatsappLink = `https://wa.me/${whatsappNumber.replace(/[\+\-]/g, "")}`;

    return (
        <div className="min-h-screen bg-black text-white py-20 px-4 md:px-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16">
                <div className="space-y-12">
                    <div className="space-y-6">
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-5xl md:text-7xl font-black tracking-tighter uppercase"
                        >
                            Get in <br />
                            <span className="text-primary italic">Touch.</span>
                        </motion.h1>
                        <p className="text-xl text-white/60 font-light leading-relaxed max-w-md">
                            Have a question about an order or want to discuss a custom design? We're here to help.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {[
                            { icon: MessageCircle, label: "WhatsApp", value: whatsappNumber, link: whatsappLink },
                            { icon: Mail, label: "Email", value: "contact@kswebwear.com.au", link: "mailto:contact@kswebwear.com.au" },
                            { icon: Clock, label: "Business Hours", value: "Mon - Fri, 9am - 5pm AEST", link: null },
                            { icon: MapPin, label: "Studio Location", value: "Melbourne, Australia", link: null },
                        ].map((item, i) => (
                            <div key={i} className="flex gap-4 items-start">
                                <div className="h-10 w-10 bg-primary/10 rounded-xl flex items-center justify-center shrink-0">
                                    <item.icon className="h-5 w-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-xs font-black uppercase tracking-widest text-white/40 mb-1">{item.label}</p>
                                    {item.link ? (
                                        <a href={item.link} className="text-lg font-bold hover:text-primary transition-colors">{item.value}</a>
                                    ) : (
                                        <p className="text-lg font-bold">{item.value}</p>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 md:p-12 space-y-8"
                >
                    <h2 className="text-2xl font-black tracking-tight uppercase">Send a Message</h2>
                    <form className="space-y-6">
                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Name</label>
                                <Input className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="Your name" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Email</label>
                                <Input className="bg-white/5 border-white/10 rounded-xl h-12" type="email" placeholder="Your email" />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Inquiry Type</label>
                            <Input className="bg-white/5 border-white/10 rounded-xl h-12" placeholder="Custom Printing / Order Support / FAQ" />
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-white/40 ml-1">Message</label>
                            <Textarea className="bg-white/5 border-white/10 rounded-xl min-h-[150px]" placeholder="How can we help?" />
                        </div>
                        <Button className="w-full h-14 rounded-xl bg-primary text-primary-foreground font-black uppercase tracking-widest hover:scale-105 active:scale-95 transition-all">
                            Send Message
                        </Button>
                    </form>
                </motion.div>
            </div>
        </div>
    );
}
