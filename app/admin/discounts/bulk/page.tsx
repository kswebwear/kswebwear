"use client";

import { useEffect, useState } from "react";
import { getAllProducts, updateProduct } from "@/lib/db";
import { Product } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function BulkDiscountPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [applying, setApplying] = useState(false);

    const [target, setTarget] = useState<"all" | "featured" | string>("all");
    const [discountPercentage, setDiscountPercentage] = useState("10");

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const all = await getAllProducts();
                setProducts(all);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchProducts();
    }, []);

    const categories = Array.from(new Set(products.map(p => p.category)));

    const handleApply = async () => {
        const percentage = parseFloat(discountPercentage);
        if (isNaN(percentage) || percentage < 0 || percentage > 100) {
            toast.error("Please enter a valid percentage (0-100)");
            return;
        }

        if (!confirm(`Apply ${percentage}% discount to ${target === "all" ? "ALL products" : target === "featured" ? "all FEATURED products" : `all "${target}" products`}? This will set their "Compare At" price to the current price and reduce the current price.`)) {
            return;
        }

        setApplying(true);
        try {
            const filtered = products.filter(p => {
                if (target === "all") return true;
                if (target === "featured") return p.featured;
                return p.category === target;
            });

            const factor = (100 - percentage) / 100;

            for (const product of filtered) {
                await updateProduct(product.id, {
                    compareAtPrice: product.price,
                    price: parseFloat((product.price * factor).toFixed(2))
                });
            }

            toast.success(`Applied discount to ${filtered.length} products!`);
            router.push("/admin/products");
            router.refresh();
        } catch (err) {
            console.error(err);
            toast.error("Failed to apply bulk discount");
        } finally {
            setApplying(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-primary" /></div>;

    return (
        <div className="max-w-2xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/discounts">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold italic tracking-tighter uppercase">Bulk <span className="text-primary">Discounts</span></h1>
            </div>

            <div className="bg-card p-8 rounded-2xl border shadow-xl space-y-6">
                <div className="p-4 bg-primary/5 rounded-xl border border-primary/10 flex gap-4">
                    <Zap className="h-6 w-6 text-primary shrink-0" />
                    <p className="text-sm text-muted-foreground">
                        This tool allows you to reduce prices in bulk. The current price will be moved to "Original Price" and the new discounted price will be set.
                    </p>
                </div>

                <div className="space-y-4">
                    <div className="space-y-2">
                        <Label className="text-base font-bold">Apply To</Label>
                        <select
                            className="w-full h-12 px-4 bg-background border rounded-xl font-medium focus:ring-2 ring-primary ring-offset-2 transition-all"
                            value={target}
                            onChange={e => setTarget(e.target.value)}
                        >
                            <option value="all">All Products ({products.length})</option>
                            <option value="featured">All Featured Products ({products.filter(p => p.featured).length})</option>
                            <optgroup label="By Category">
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>
                                        {cat} ({products.filter(p => p.category === cat).length})
                                    </option>
                                ))}
                            </optgroup>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label className="text-base font-bold">Discount Percentage (%)</Label>
                        <div className="relative">
                            <Input
                                type="number"
                                value={discountPercentage}
                                onChange={e => setDiscountPercentage(e.target.value)}
                                className="h-12 pl-4 pr-12 text-xl font-black bg-muted/30 border-none rounded-xl"
                            />
                            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold">%</div>
                        </div>
                    </div>

                    <div className="pt-6">
                        <Button
                            onClick={handleApply}
                            className="w-full h-14 text-lg font-black uppercase tracking-tighter"
                            disabled={applying}
                        >
                            {applying ? (
                                <>
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                    Applying...
                                </>
                            ) : "Apply Discount"}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    );
}
