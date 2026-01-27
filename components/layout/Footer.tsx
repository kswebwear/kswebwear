"use client";

import Link from "next/link";
import { useStoreSettings } from "@/hooks/useStoreSettings";

export function Footer() {
    const { settings, loading } = useStoreSettings();
    const social = {
        facebook: settings?.facebook || "#",
        instagram: settings?.instagram || "#"
    };

    return (
        <footer className="w-full border-t border-white/10 bg-black py-12 md:py-24 text-white">
            <div className="container mx-auto px-4 md:px-6">
                <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Shop</h4>
                        <ul className="space-y-3 text-sm text-white/40">
                            <li><Link href="/products" className="hover:text-white transition-colors" suppressHydrationWarning>All Products</Link></li>
                            <li><Link href="/products/qwmViwaf3jmbgRjZMHB2" className="hover:text-white transition-colors" suppressHydrationWarning>Karungali Mala</Link></li>
                            <li><Link href="/new-arrivals" className="hover:text-white transition-colors" suppressHydrationWarning>New Arrivals</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Support</h4>
                        <ul className="space-y-3 text-sm text-white/40">
                            <li><Link href="/contact" className="hover:text-white transition-colors" suppressHydrationWarning>Contact Us</Link></li>
                            <li><Link href="/faq" className="hover:text-white transition-colors" suppressHydrationWarning>FAQ</Link></li>
                            <li><Link href="/just-print" className="hover:text-white transition-colors underline decoration-primary/30" suppressHydrationWarning>Just Print Service</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Company</h4>
                        <ul className="space-y-3 text-sm text-white/40">
                            <li><Link href="/about" className="hover:text-white transition-colors" suppressHydrationWarning>About Us</Link></li>
                            <li><Link href="/privacy" className="hover:text-white transition-colors" suppressHydrationWarning>Privacy Policy</Link></li>
                            <li><Link href="/terms" className="hover:text-white transition-colors" suppressHydrationWarning>Terms of Service</Link></li>
                        </ul>
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-xs font-black uppercase tracking-widest text-primary">Connect</h4>
                        <ul className="space-y-3 text-sm text-white/40">
                            <li><a href={social.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" suppressHydrationWarning>Instagram</a></li>
                            <li><a href={social.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors" suppressHydrationWarning>Facebook</a></li>
                        </ul>
                    </div>
                </div>
                <div className="mt-20 pt-8 border-t border-white/5 flex flex-col items-center justify-between gap-6 sm:flex-row">
                    <div className="flex items-center gap-4">
                        <img src="/logo.png" alt="KSWebWear Logo" className="h-10 w-auto brightness-110 contrast-125" />
                        <p className="text-[10px] uppercase tracking-widest text-white/20">
                            &copy; {new Date().getFullYear()} KSWebWear. All rights reserved.
                        </p>
                    </div>
                    <div className="flex gap-4 text-[10px] uppercase tracking-widest text-white/20 font-bold">
                        <span>EST. 2024</span>
                        <span>•</span>
                        <span>AUSTRALIA</span>
                    </div>
                </div>
            </div>
        </footer>
    );
}
