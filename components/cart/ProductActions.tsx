"use client";

import { useCart } from "@/context/CartContext";
import { Button } from "@/components/ui/button";
import { Product } from "@/lib/types";
import { useState } from "react";
import { cn } from "@/lib/utils";

export function ProductActions({ product }: { product: Product }) {
    const { addItem, setOpen } = useCart();
    const [adding, setAdding] = useState(false);
    const [selectedSize, setSelectedSize] = useState<string>(
        product.sizes && product.sizes.length > 0 ? product.sizes[0] : ""
    );
    const [selectedColor, setSelectedColor] = useState<string>(
        product.colors && product.colors.length > 0 ? product.colors[0] : ""
    );
    const [selectedBeadSize, setSelectedBeadSize] = useState<string>(
        product.beadSizes && product.beadSizes.length > 0 ? product.beadSizes[0] : ""
    );

    const handleAddToCart = () => {
        setAdding(true);
        addItem({
            ...product,
            selectedSize,
            selectedColor,
            selectedbeadSize: selectedBeadSize,
        });
        setTimeout(() => {
            setAdding(false);
            setOpen(true);
        }, 500);
    };

    const isSoldOut = product.inStock === false;

    return (
        <div className="flex flex-col gap-6">
            <div className="space-y-4 pt-4 border-t border-border">
                {product.sizes && product.sizes.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Size</span>
                        <div className="flex flex-wrap gap-2">
                            {product.sizes.map((size) => (
                                <Button
                                    key={size}
                                    variant={selectedSize === size ? "default" : "outline"}
                                    className="min-w-[3rem]"
                                    onClick={() => setSelectedSize(size)}
                                    disabled={isSoldOut}
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {product.beadSizes && product.beadSizes.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Bead Size</span>
                        <div className="flex flex-wrap gap-2">
                            {product.beadSizes.map((size) => (
                                <Button
                                    key={size}
                                    variant={selectedBeadSize === size ? "default" : "outline"}
                                    onClick={() => setSelectedBeadSize(size)}
                                    disabled={isSoldOut}
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                {product.colors && product.colors.length > 0 && (
                    <div className="space-y-2">
                        <span className="text-sm font-medium">Color</span>
                        <div className="flex flex-wrap gap-2">
                            {product.colors.map((color) => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    disabled={isSoldOut}
                                    className={cn(
                                        "h-10 w-10 rounded-full border-2 transition-all",
                                        selectedColor === color ? "border-primary scale-110" :
                                            (color.toLowerCase() === 'white' || color.toLowerCase() === '#ffffff')
                                                ? "border-black/10 hover:border-black/20"
                                                : "border-white/40 hover:border-white/70"
                                    )}
                                    style={{ backgroundColor: color.toLowerCase() }}
                                    title={color}
                                />
                            ))}
                        </div>
                    </div>
                )}
            </div>

            <div className="flex flex-col gap-4 sm:flex-row pt-4">
                <Button
                    size="lg"
                    className="flex-1 text-base font-bold"
                    onClick={handleAddToCart}
                    disabled={adding || isSoldOut}
                >
                    {isSoldOut ? "Sold Out" : adding ? "Added!" : "Add to Cart"}
                </Button>
                <Button
                    size="lg"
                    variant="secondary"
                    className="flex-1 text-base font-medium"
                    disabled={isSoldOut}
                >
                    Buy Now
                </Button>
            </div>
        </div>
    );
}
