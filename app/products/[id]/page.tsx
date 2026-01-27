import { notFound } from "next/navigation";
import { getDesign, getAllTemplates, getProduct, getSettings } from "@/lib/db";
import { DesignConfigurator } from "@/components/products/DesignConfigurator";
import { ProductActions } from "@/components/cart/ProductActions";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const revalidate = 3600;

export default async function ProductPage({
    params,
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    // We cannot use hooks in a server component, so we'll just show all images or a simple layout

    // Try to fetch as a design first
    const design = await getDesign(id);
    const settings = await getSettings("store") as any;

    if (design) {
        if (design.hidden) {
            notFound();
        }
        const templates = await getAllTemplates();
        const defaultTemplates: any[] = templates.length > 0 ? templates : [
            {
                id: "classic-tee",
                name: "Classic Unisex Tee",
                basePrice: 29.99,
                description: "100% Cotton premium feel",
                category: "apparel",
                sizes: ["S", "M", "L", "XL", "2XL"],
                colors: [{ name: "Black", hex: "#000000" }, { name: "White", hex: "#FFFFFF" }, { name: "Navy", hex: "#000080" }],
                demographic: "Unisex"
            },
            {
                id: "kids-tee",
                name: "Kids Play Tee",
                basePrice: 24.99,
                description: "Durable cotton for active kids",
                category: "apparel",
                sizes: ["2T", "4T", "6", "8", "10"],
                colors: [{ name: "Red", hex: "#FF0000" }, { name: "Blue", hex: "#0000FF" }, { name: "Yellow", hex: "#FFFF00" }],
                demographic: "Kids"
            },
            {
                id: "women-tee",
                name: "Women's Fitted Tee",
                basePrice: 32.99,
                description: "Slim fit soft cotton",
                category: "apparel",
                sizes: ["XS", "S", "M", "L", "XL"],
                colors: [{ name: "Pink", hex: "#FFC0CB" }, { name: "White", hex: "#FFFFFF" }, { name: "Black", hex: "#000000" }],
                demographic: "Women"
            }
        ];

        return (
            <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto">
                <Link
                    href="/products"
                    className="mb-12 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Gallery
                </Link>

                <DesignConfigurator
                    design={design}
                    templates={defaultTemplates}
                    defaultSizeGuide={settings?.defaultSizeGuide}
                />
            </div>
        );
    }

    // Fallback to standalone product (e.g., Karungali Mala)
    const product = await getProduct(id);

    if (!product) {
        notFound();
    }

    return (
        <div className="min-h-screen pt-32 pb-12 px-4 md:px-8 max-w-[1400px] mx-auto">
            <Link
                href="/products"
                className="mb-12 inline-flex items-center gap-2 text-xs font-black uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to All
            </Link>

            <div className="grid gap-12 lg:grid-cols-2">
                <div className="space-y-4">
                    <div className="aspect-[4/5] overflow-hidden rounded-[2.5rem] bg-card/50 border border-white/10 relative group">
                        {/* Contrast Halo Effect */}
                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_80%)] pointer-events-none" />
                        <img
                            src={product.images[0]}
                            alt={product.name}
                            className="h-full w-full object-cover relative z-10"
                        />
                    </div>
                    {/* Multi-image display (simple list for now) */}
                    {product.images.length > 1 && (
                        <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                            {product.images.map((img, i) => (
                                <div key={i} className="h-24 w-24 flex-shrink-0 rounded-2xl border border-white/10 overflow-hidden bg-card">
                                    <img src={img} alt={`${product.name} ${i + 1}`} className="h-full w-full object-cover" />
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-10">
                    <div className="space-y-4">
                        <span className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                            {product.category}
                        </span>
                        <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                            {product.name}
                        </h1>
                        <p className="text-xl text-muted-foreground font-light leading-relaxed">
                            {product.description}
                        </p>
                    </div>

                    <div className="pt-8 space-y-6">
                        <div className="flex items-baseline gap-4">
                            <span className="text-5xl font-black tracking-tighter text-primary">
                                ${product.price.toFixed(2)}
                            </span>
                        </div>
                        <ProductActions product={product} />
                    </div>
                </div>
            </div>
        </div>
    );
}
