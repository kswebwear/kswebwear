"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Link from "next/link"; // Added import for Link

function SuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { clearCart } = useCart();
    const [sessionId, setSessionId] = useState<string | null>(null);
    const [orderNumber, setOrderNumber] = useState<string | null>(null);
    const [error, setError] = useState<boolean>(false);
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        const id = searchParams?.get("session_id");
        if (id) {
            setSessionId(id);
            // Only clear cart if we have a valid session and haven't processed it yet
            // We use a simple ref-like approach to avoid double-clearing if needed
            clearCart();
        }
    }, [searchParams, clearCart]);

    // Polling logic for order number
    useEffect(() => {
        if (!sessionId || orderNumber || !mounted) return;

        let attempts = 0;
        const maxAttempts = 12; // Increased attempts
        let isSubscribed = true;

        const pollOrder = async () => {
            if (!isSubscribed) return;
            try {
                const res = await fetch(`/api/orders/by-session?session_id=${sessionId}`);
                if (res.ok) {
                    const data = await res.json();
                    if (isSubscribed) {
                        setOrderNumber(data.order.orderNumber);
                        return true;
                    }
                }
            } catch (err) {
                console.error("Polling error:", err);
            }
            return false;
        };

        const interval = setInterval(async () => {
            attempts++;
            const found = await pollOrder();
            if (found || attempts >= maxAttempts) {
                clearInterval(interval);
                if (!found && isSubscribed) setError(true);
            }
        }, 4000); // Slightly longer interval

        pollOrder();

        return () => {
            isSubscribed = false;
            clearInterval(interval);
        };
    }, [sessionId, orderNumber, mounted]);

    if (!mounted) {
        return (
            <div className="container mx-auto px-4 py-16 md:py-24 text-center">
                <div className="animate-pulse space-y-4">
                    <div className="h-12 w-12 bg-muted rounded-full mx-auto" />
                    <div className="h-4 w-48 bg-muted mx-auto rounded" />
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-16 md:py-24">
            <div className="max-w-2xl mx-auto text-center space-y-6">
                <div className="flex justify-center">
                    <CheckCircle className="h-20 w-20 text-green-500 animate-in zoom-in duration-500" />
                </div>

                <h1 className="text-4xl font-bold tracking-tight">Order Confirmed!</h1>

                <p className="text-lg text-muted-foreground font-light">
                    Thank you for your purchase. We&apos;ve received your order and are getting it ready for shipment.
                </p>

                {sessionId && (
                    <div className="bg-card p-8 rounded-2xl border shadow-sm space-y-4 animate-in fade-in slide-in-from-bottom-4 duration-700">
                        <div className="space-y-1">
                            <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Order Reference</p>
                            <p className="font-mono text-3xl font-black text-primary">
                                {orderNumber || (error ? (
                                    <span className="text-amber-500 text-xl tracking-normal">LOGGED & PROCESSING</span>
                                ) : (
                                    <span className="animate-pulse">VERIFYING...</span>
                                ))}
                            </p>
                        </div>
                        <div className="pt-4 border-t border-dashed">
                            <p className="text-xs text-muted-foreground opacity-50">
                                Session ID: {sessionId.slice(0, 16)}...
                            </p>
                        </div>
                    </div>
                )}

                <div className="pt-8 space-y-6">
                    <div className="space-y-2">
                        <p className="text-base text-muted-foreground">
                            A confirmation email will be sent to your inbox once processing is complete.
                        </p>
                        <p className="text-sm text-muted-foreground font-light italic">
                            Didn&apos;t receive it? Check your spam or <Link href="/contact" className="underline underline-offset-4 hover:text-primary transition-colors">contact us</Link>.
                        </p>
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
                        <Button onClick={() => router.push("/products")} variant="outline" className="h-12 px-8 text-base rounded-xl">
                            Continue Shopping
                        </Button>
                        <Button onClick={() => router.push("/")} className="h-12 px-8 text-base bg-black text-white hover:bg-neutral-800 rounded-xl">
                            Back to Home
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function CheckoutSuccessPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-16 md:py-24 text-center">
                <p>Loading...</p>
            </div>
        }>
            <SuccessContent />
        </Suspense>
    );
}
