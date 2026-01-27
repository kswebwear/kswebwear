"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";

import { validateDiscount } from "@/lib/discounts";
import { toast } from "sonner";

const AU_STATES = [
    { label: "New South Wales", value: "NSW" },
    { label: "Victoria", value: "VIC" },
    { label: "Queensland", value: "QLD" },
    { label: "Western Australia", value: "WA" },
    { label: "South Australia", value: "SA" },
    { label: "Tasmania", value: "TAS" },
    { label: "Northern Territory", value: "NT" },
    { label: "Australian Capital Territory", value: "ACT" }
];

export default function CheckoutPage() {
    const { items, cartTotal, clearCart } = useCart();
    const { user } = useAuth();
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const [promoCode, setPromoCode] = useState("");
    const [discount, setDiscount] = useState<any>(null);
    const [promoError, setPromoError] = useState("");
    const [checkingPromo, setCheckingPromo] = useState(false);

    // Shipping Address State
    const [shippingAddress, setShippingAddress] = useState({
        city: "",
        state: "",
        postalCode: ""
    });

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setShippingAddress(prev => ({ ...prev, [name]: value }));
    };

    const handleApplyPromo = async () => {
        if (!promoCode) return;
        setCheckingPromo(true);
        setPromoError("");
        try {
            const d = await validateDiscount(promoCode, cartTotal);
            if (d) {
                setDiscount(d);
            } else {
                setPromoError("Invalid or expired promo code");
            }
        } catch (err) {
            setPromoError("Error validating code");
        } finally {
            setCheckingPromo(false);
        }
    };

    const discountAmount = discount ? (discount.type === 'percentage' ? (cartTotal * discount.value / 100) : discount.value) : 0;
    const finalTotal = Math.max(0, cartTotal - discountAmount);

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        const form = e.target as HTMLFormElement;
        const formData = new FormData(form);

        try {
            const response = await fetch("/api/create-checkout-session", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({
                    items,
                    userId: user?.uid || null,
                    discountCode: discount?.code || null,
                    discountAmount: discountAmount,
                    // We don't strictly need address here as Stripe collects it, 
                    // but we can pass it as metadata or use it if our API supports it.
                    // For now, Stripe's prefilled info:
                    customerDetails: {
                        email: (document.getElementById("email") as HTMLInputElement).value,
                        name: `${formData.get("firstName")} ${formData.get("lastName")}`,
                    }
                }),
            });

            const data = await response.json();
            if (data.error) throw new Error(data.error);
            window.location.href = data.url;
        } catch (error: any) {
            console.error("Checkout error:", error);
            toast.error(`Failed to process checkout: ${error.message || "Unknown error"}.`);
            setLoading(false);
        }
    };

    if (items.length === 0) {
        return (
            <div className="container mx-auto px-4 py-24 text-center">
                <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
                <Button onClick={() => router.push("/products")}>Continue Shopping</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 md:px-6 lg:py-12">
            <h1 className="text-3xl font-bold mb-8">Checkout</h1>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Checkout Form */}
                <div className="space-y-6">
                    <div className="bg-card p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4 text-primary">Contact Information</h2>
                        <div className="space-y-4">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="font-medium">Email Address</Label>
                                <Input id="email" type="email" defaultValue={user?.email || ""} required className="bg-muted/30" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-card p-6 rounded-lg border">
                        <h2 className="text-xl font-semibold mb-4 text-primary">Shipping Address</h2>
                        <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="firstName">First Name</Label>
                                    <Input id="firstName" required />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="lastName">Last Name</Label>
                                    <Input id="lastName" required />
                                </div>
                            </div>
                            <div className="space-y-2 relative">
                                <Label htmlFor="address">Address Line 1</Label>
                                <Input
                                    id="address"
                                    name="address"
                                    required
                                    placeholder="Street address, P.O. box"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="address2">Address Line 2 (Optional)</Label>
                                <Input id="address2" name="address2" placeholder="Apartment, suite, unit, building, floor" />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="city">City / Suburb</Label>
                                    <Input id="city" name="city" required value={shippingAddress.city} onChange={handleAddressChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="state">State</Label>
                                    <select
                                        id="state"
                                        name="state"
                                        required
                                        value={shippingAddress.state}
                                        onChange={handleAddressChange as any}
                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                    >
                                        <option value="">Select State</option>
                                        {AU_STATES.map(s => (
                                            <option key={s.value} value={s.value}>{s.label}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="postalCode">Postal Code</Label>
                                    <Input id="postalCode" name="postalCode" required value={shippingAddress.postalCode} onChange={handleAddressChange} />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="country">Country</Label>
                                    <Input id="country" required value="Australia" readOnly className="bg-muted/50 cursor-not-allowed" />
                                </div>
                            </div>
                        </form>
                    </div>
                </div>

                {/* Order Summary */}
                <div>
                    <div className="bg-muted/50 p-6 rounded-2xl sticky top-24 border">
                        <h2 className="text-2xl font-bold mb-6">Order Summary</h2>
                        <ul className="space-y-4 mb-6">
                            {items.map((item) => (
                                <li key={item.cartId} className="flex gap-4">
                                    <div className="h-16 w-16 overflow-hidden rounded-lg border bg-background">
                                        <img src={item.image} alt={item.name} className="h-full w-full object-cover" />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-bold text-sm tracking-tight">{item.name}</h3>
                                        <p className="text-xs text-muted-foreground mt-0.5">
                                            {item.size && <span>Size: {item.size}</span>}
                                            {item.size && (item.color || item.beadSize) && <span> | </span>}
                                            {item.color && <span>Color: {item.color}</span>}
                                            {item.beadSize && <span>Beads: {item.beadSize}</span>}
                                        </p>
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-bold text-sm">${(item.price * item.quantity).toFixed(2)}</p>
                                </li>
                            ))}
                        </ul>

                        <div className="space-y-4 mb-6 border-y border-border py-4">
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Promo Code"
                                    value={promoCode}
                                    onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                                    className="uppercase font-bold tracking-widest bg-background"
                                />
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleApplyPromo}
                                    disabled={checkingPromo || !promoCode}
                                >
                                    {checkingPromo ? "..." : "Apply"}
                                </Button>
                            </div>
                            {promoError && <p className="text-xs text-red-500 font-medium">{promoError}</p>}
                            {discount && (
                                <div className="flex justify-between text-xs text-green-600 font-bold bg-green-50 p-2 rounded border border-green-100 italic">
                                    <span>Applied: {discount.code}</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span className="font-medium">${cartTotal.toFixed(2)}</span>
                            </div>
                            {discount && (
                                <div className="flex justify-between items-center text-sm text-green-600">
                                    <span>Discount</span>
                                    <span>-${discountAmount.toFixed(2)}</span>
                                </div>
                            )}
                            <div className="flex justify-between items-center text-sm">
                                <span className="text-muted-foreground">Shipping</span>
                                <span className="text-primary font-bold uppercase text-xs">Free</span>
                            </div>
                            <div className="flex justify-between items-center text-xl font-black mt-4 pt-4 border-t border-border">
                                <span>Total</span>
                                <span className="text-primary tracking-tighter">${finalTotal.toFixed(2)} AUD</span>
                            </div>
                        </div>

                        <Button type="submit" form="checkout-form" className="w-full mt-8 font-black text-lg h-14" disabled={loading}>
                            {loading ? "Processing..." : "Finish & Pay"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
