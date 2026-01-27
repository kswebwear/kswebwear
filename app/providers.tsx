"use client";

import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/context/ThemeContext";

import { Toaster } from "sonner";

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <ThemeProvider>
            <AuthProvider>
                <CartProvider>
                    {children}
                    <Toaster position="top-center" richColors />
                </CartProvider>
            </AuthProvider>
        </ThemeProvider>
    );
}
