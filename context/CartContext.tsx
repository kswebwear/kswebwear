"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { Product, CartItem } from "@/lib/types";

interface CartContextType {
    items: CartItem[];
    addItem: (product: Product & { selectedSize?: string; selectedColor?: string; selectedbeadSize?: string }, quantity?: number) => void;
    removeItem: (cartId: string) => void;
    updateQuantity: (cartId: string, quantity: number) => void;
    clearCart: () => void;
    cartCount: number;
    cartTotal: number;
    open: boolean;
    setOpen: (open: boolean) => void;
}

const CartContext = createContext<CartContextType>({
    items: [],
    addItem: () => { },
    removeItem: () => { },
    updateQuantity: () => { },
    clearCart: () => { },
    cartCount: 0,
    cartTotal: 0,
    open: false,
    setOpen: () => { },
});

export const useCart = () => useContext(CartContext);

export function CartProvider({ children }: { children: React.ReactNode }) {
    const [items, setItems] = useState<CartItem[]>([]);
    const [open, setOpen] = useState(false);

    // Load from local storage on mount
    useEffect(() => {
        const savedCart = localStorage.getItem("cart");
        if (savedCart) {
            try {
                const parsed = JSON.parse(savedCart);
                setItems(parsed);
            } catch (e) {
                console.error("Failed to parse cart", e);
            }
        }

        const handleOpenCart = () => setOpen(true);
        window.addEventListener('open-cart', handleOpenCart);
        return () => window.removeEventListener('open-cart', handleOpenCart);
    }, []);

    // Save to local storage on change
    useEffect(() => {
        localStorage.setItem("cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product: Product & { selectedSize?: string; selectedColor?: string; selectedbeadSize?: string }, quantity = 1) => {
        const size = product.selectedSize || "";
        const color = product.selectedColor || "";
        const beadSize = product.selectedbeadSize || "";
        const cartId = `${product.id}-${size}-${color}-${beadSize}`;

        setItems((prev) => {
            const existing = prev.find((item) => item.cartId === cartId);
            if (existing) {
                return prev.map((item) =>
                    item.cartId === cartId
                        ? { ...item, quantity: item.quantity + quantity }
                        : item
                );
            }
            return [
                ...prev,
                {
                    cartId,
                    productId: product.id,
                    name: product.name,
                    price: product.price,
                    image: product.images[0] || "",
                    quantity,
                    size,
                    color,
                    beadSize,
                },
            ];
        });
        setOpen(true);
    };

    const removeItem = (cartId: string) => {
        setItems((prev) => prev.filter((item) => item.cartId !== cartId));
    };

    const updateQuantity = (cartId: string, quantity: number) => {
        if (quantity < 1) {
            removeItem(cartId);
            return;
        }
        setItems((prev) =>
            prev.map((item) =>
                item.cartId === cartId ? { ...item, quantity } : item
            )
        );
    };

    const clearCart = () => setItems([]);

    const cartCount = items.reduce((acc, item) => acc + item.quantity, 0);
    const cartTotal = items.reduce((acc, item) => acc + item.price * item.quantity, 0);

    return (
        <CartContext.Provider
            value={{
                items,
                addItem,
                removeItem,
                updateQuantity,
                clearCart,
                cartCount,
                cartTotal,
                open,
                setOpen,
            }}
        >
            {children}
        </CartContext.Provider>
    );
}
