"use client";

import Link from "next/link";
import { X, Minus, Plus, ShoppingBag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useEffect } from "react";

export function CartSheet() {
    const { items, removeItem, updateQuantity, cartTotal, open, setOpen } = useCart();

    // Prevent body scroll when open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [open]);

    // console.log("CartSheet render, open:", open);
    // if (!open) return null; // Debug: Render always

    return (
        <div
            className="fixed inset-0 flex justify-end transition-opacity duration-200"
            style={{
                zIndex: 9999,
                opacity: open ? 1 : 0,
                pointerEvents: open ? 'auto' : 'none'
            }}
        >
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
                onClick={() => setOpen(false)}
            />

            {/* Drawer */}
            <div className="relative z-[100] flex h-full w-full max-w-md flex-col bg-background shadow-xl">
                <div className="flex items-center justify-between border-b px-4 py-3">
                    <h2 className="text-lg font-semibold">Shopping Cart</h2>
                    <Button variant="ghost" size="icon" onClick={() => setOpen(false)}>
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-4 py-6">
                    {items.length === 0 ? (
                        <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
                            <div className="relative mb-4 h-16 w-16 text-muted-foreground">
                                <ShoppingBag className="h-full w-full" />
                                <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-xs font-bold text-primary-foreground">
                                    0
                                </span>
                            </div>
                            <p className="text-xl font-medium text-muted-foreground">Your cart is empty</p>
                            <Button onClick={() => setOpen(false)}>Start Shopping</Button>
                        </div>
                    ) : (
                        <ul className="space-y-6">
                            {items.map((item) => (
                                <li key={item.cartId} className="flex gap-4">
                                    <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                                        <img
                                            src={item.image}
                                            alt={item.name}
                                            className="h-full w-full object-cover"
                                        />
                                    </div>

                                    <div className="flex flex-1 flex-col">
                                        <div className="flex justify-between text-base font-medium">
                                            <h3 className="line-clamp-2">{item.name}</h3>
                                            <p className="ml-4">${(item.price * item.quantity).toFixed(2)}</p>
                                        </div>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {item.size && <span>Size: {item.size}</span>}
                                            {item.size && item.color && <span> | </span>}
                                            {item.color && <span>Color: {item.color}</span>}
                                        </p>

                                        <div className="flex flex-1 items-end justify-between text-sm">
                                            <div className="flex items-center border rounded-md">
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-none border-r"
                                                    onClick={() => updateQuantity(item.cartId, item.quantity - 1)}
                                                >
                                                    <Minus className="h-3 w-3" />
                                                </Button>
                                                <span className="w-8 text-center">{item.quantity}</span>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    className="h-8 w-8 rounded-none border-l"
                                                    onClick={() => updateQuantity(item.cartId, item.quantity + 1)}
                                                >
                                                    <Plus className="h-3 w-3" />
                                                </Button>
                                            </div>

                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950"
                                                onClick={() => removeItem(item.cartId)}
                                            >
                                                Remove
                                            </Button>
                                        </div>
                                    </div>
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {items.length > 0 && (
                    <div className="border-t bg-muted/20 px-4 py-6">
                        <div className="flex justify-between text-base font-medium">
                            <p>Subtotal</p>
                            <p>${cartTotal.toFixed(2)}</p>
                        </div>
                        <p className="mt-0.5 text-sm text-muted-foreground">
                            Shipping and taxes calculated at checkout.
                        </p>
                        <div className="mt-6">
                            <Link href="/checkout" onClick={() => setOpen(false)}>
                                <Button className="w-full text-lg py-6">Checkout</Button>
                            </Link>
                        </div>
                        <div className="mt-6 flex justify-center text-center text-sm text-muted-foreground">
                            <p>
                                or{" "}
                                <button
                                    type="button"
                                    className="font-medium text-primary hover:text-primary/80 hover:underline"
                                    onClick={() => setOpen(false)}
                                >
                                    Continue Shopping
                                    <span aria-hidden="true"> &rarr;</span>
                                </button>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
