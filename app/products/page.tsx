"use client";

import { useEffect, useState } from "react";
import { Design } from "@/lib/types";
import { getAllDesigns } from "@/lib/db";
import { DesignCard } from "@/components/products/DesignCard";
import { Loader2, Search, Filter } from "lucide-react";

export default function ProductsPage() {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCategory, setSelectedCategory] = useState("All");
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetch = async () => {
            try {
                const data = await getAllDesigns();
                setDesigns(data);
            } catch (err) {
                console.error("Error fetching designs:", err);
            } finally {
                setLoading(false);
            }
        };
        fetch();
    }, []);

    const categories = ["All", ...Array.from(new Set(designs.flatMap(d => d.categories)))];

    const filteredDesigns = designs.filter(design => {
        const matchesCategory = selectedCategory === "All" || design.categories.includes(selectedCategory);
        const matchesSearch = design.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            design.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
        return matchesCategory && matchesSearch;
    });

    if (loading) {
        return (
            <div className="flex h-[70vh] items-center justify-center">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
            </div>
        );
    }

    return (
        <div className="min-h-screen py-12 px-4 md:px-8 max-w-[1400px] mx-auto">
            {/* Header */}
            <header className="mb-16 space-y-8">
                <div className="space-y-4">
                    <h1 className="text-6xl md:text-9xl font-black tracking-tighter uppercase leading-[0.85]">
                        The <br />
                        <span className="text-primary italic">Gallery.</span>
                    </h1>
                    <p className="text-lg text-muted-foreground uppercase tracking-widest font-bold">
                        Browse our library of {designs.length}+ unique print designs
                    </p>
                </div>

                {/* Search & Filters */}
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                        <input
                            type="text"
                            placeholder="Search designs or tags..."
                            className="w-full h-14 bg-card border border-white/10 rounded-2xl pl-12 pr-6 outline-none focus:border-primary/50 transition-colors font-bold uppercase text-xs tracking-widest"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>

                    <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 no-scrollbar">
                        {categories.map(cat => (
                            <button
                                key={cat}
                                onClick={() => setSelectedCategory(cat)}
                                className={`h-12 px-6 rounded-2xl font-black uppercase text-[10px] tracking-widest transition-all whitespace-nowrap ${selectedCategory === cat
                                        ? "bg-primary text-primary-foreground shadow-lg shadow-primary/20"
                                        : "bg-card border border-white/10 text-muted-foreground hover:border-white/30"
                                    }`}
                            >
                                {cat}
                            </button>
                        ))}
                    </div>
                </div>
            </header>

            {/* Designs Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-x-8 gap-y-12">
                {filteredDesigns.map((design) => (
                    <DesignCard key={design.id} design={design} />
                ))}
            </div>

            {filteredDesigns.length === 0 && (
                <div className="py-20 text-center space-y-4 opacity-50">
                    <Search className="h-12 w-12 mx-auto" />
                    <p className="text-xl font-bold uppercase tracking-widest">No designs found</p>
                    <button
                        onClick={() => { setSearchQuery(""); setSelectedCategory("All"); }}
                        className="text-primary underline font-bold uppercase text-xs tracking-widest"
                    >
                        Clear Filters
                    </button>
                </div>
            )}
        </div>
    );
}
