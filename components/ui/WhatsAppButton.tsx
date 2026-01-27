"use client";

import { useEffect, useState } from "react";
import { MessageCircle } from "lucide-react";
import { getSettings } from "@/lib/db";
import { motion, AnimatePresence } from "framer-motion";

export function WhatsAppButton() {
    const [whatsappNumber, setWhatsappNumber] = useState<string>("");
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await getSettings("store") as any;
            if (data?.whatsapp) {
                setWhatsappNumber(data.whatsapp);
                setIsVisible(true);
            }
        };
        fetchSettings();
    }, []);

    const handleClick = () => {
        if (!whatsappNumber) return;
        const cleanNumber = whatsappNumber.replace(/\D/g, "");
        window.open(`https://wa.me/${cleanNumber}`, "_blank");
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.button
                    initial={{ opacity: 0, scale: 0.5, y: 50 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.5, y: 50 }}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={handleClick}
                    className="fixed bottom-8 right-8 z-50 h-16 w-16 bg-[#25D366] text-white rounded-full shadow-[0_8px_30px_rgb(37,211,102,0.4)] flex items-center justify-center group border-4 border-white dark:border-zinc-900"
                    aria-label="Contact on WhatsApp"
                >
                    <MessageCircle className="h-8 w-8 fill-current" />
                    <span className="absolute right-full mr-4 px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-black uppercase tracking-widest rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none border border-white/10">
                        Chat with us
                    </span>
                </motion.button>
            )}
        </AnimatePresence>
    );
}
