"use client";

import { useState, useEffect } from "react";
import { Design, ProductTemplate } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";
import { Check, Info, ShoppingBag, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function DesignConfigurator({
    design,
    templates,
    defaultSizeGuide
}: {
    design: Design;
    templates: ProductTemplate[];
    defaultSizeGuide?: string;
}) {
    const [selectedTemplate, setSelectedTemplate] = useState<ProductTemplate>(templates[0] || {} as ProductTemplate);

    // Demographics Logic
    const ALL_DEMOGRAPHICS = ['Men', 'Women', 'Kids', 'Infants'] as const;
    const availableDemographics = ALL_DEMOGRAPHICS.filter(d =>
        !design.allowedDemographics ||
        design.allowedDemographics.length === 0 ||
        design.allowedDemographics.includes(d)
    );
    const [selectedDemographic, setSelectedDemographic] = useState(availableDemographics[0] || 'Men');

    // Filter templates based on selected demographic
    const filteredTemplates = templates.filter(t => {
        if (!t.demographic || t.demographic === 'Unisex') return true;
        return t.demographic === selectedDemographic;
    });

    // Auto-select first template when demographic changes if current selection is invalid
    useEffect(() => {
        const isValid = filteredTemplates.find(t => t.id === selectedTemplate.id);
        if (!isValid && filteredTemplates.length > 0) {
            const newTemplate = filteredTemplates[0];
            setSelectedTemplate(newTemplate);
            const allowed = newTemplate.colors.filter(c => !design.allowedColors || design.allowedColors.length === 0 || design.allowedColors.includes(c.name));
            setSelectedColor(allowed[0] || newTemplate.colors[0]);
            setSelectedSize(newTemplate.sizes[0]);
        }
    }, [selectedDemographic, filteredTemplates, selectedTemplate.id]); // Removed design.allowedColors from dep array to check simple deps first, safe to include though.

    const initialAllowedColors = (templates[0]?.colors || []).filter(c => !design.allowedColors || design.allowedColors.length === 0 || design.allowedColors.includes(c.name));
    const [selectedColor, setSelectedColor] = useState(initialAllowedColors[0] || templates[0]?.colors[0] || { name: 'White', hex: '#FFFFFF' });
    const [selectedSize, setSelectedSize] = useState(templates[0].sizes[0]);
    const [selectedPrintSide, setSelectedPrintSide] = useState<'front' | 'back'>('front');
    const [showSizeGuide, setShowSizeGuide] = useState(false);
    const { addItem } = useCart();
    const [isAdding, setIsAdding] = useState(false);

    const isDarkColor = (hex: string) => {
        if (!hex) return false;
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        const hsp = Math.sqrt(0.299 * (r * r) + 0.587 * (g * g) + 0.114 * (b * b));
        return hsp < 127.5;
    };

    const previewBgClass = isDarkColor(selectedColor.hex) ? "bg-white/5" : "bg-card/50";
    const currentSizeGuide = design.sizeGuide || selectedTemplate.sizeGuide || defaultSizeGuide;

    const handleAddToCart = () => {
        setIsAdding(true);
        // Map Design + Template to the expected Product type for the Cart
        addItem({
            id: `${design.id}-${selectedTemplate.id}-${selectedPrintSide}`,
            name: `${design.title} - ${selectedTemplate.name}`,
            price: design.price || selectedTemplate.basePrice,
            images: [design.mainImage],
            description: design.description,
            category: selectedTemplate.category,
            inStock: true,
            createdAt: Date.now(),
            selectedSize,
            selectedColor: selectedColor.name,
            selectedPrintSide: (design.printOptions?.front && design.printOptions?.back) ? selectedPrintSide : undefined,
        } as any);

        setTimeout(() => setIsAdding(false), 1000);
    };

    return (
        <div className="grid gap-12 lg:grid-cols-2">
            {/* ... (Visual Preview content unchanged) ... */}
            {/* I will use the TargetContent to skip the middle part to keep the replacement chunk small if possible, or just replace the specific blocks. 
               Let's replace the handleAddToCart block and the Price block separately.
            */}

            {/* Visual Preview */}
            <div className="space-y-6">
                <div className={`aspect-[4/5] rounded-[2.5rem] border border-white/10 overflow-hidden relative group transition-colors duration-500 ${previewBgClass}`}>
                    {/* Contrast Halo Effect - Improved for better visibility of dark/light items */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.15)_0%,transparent_80%)] pointer-events-none" />
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={`${selectedColor.name}-${selectedPrintSide}`}
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="h-full w-full relative"
                        >
                            {/* Mockup Background (placeholder for template image) */}
                            {!design.colorImages?.[selectedColor.name] && (
                                <div
                                    className="absolute inset-0 transition-colors duration-500"
                                    style={{ backgroundColor: (selectedColor.hex || '#FFFFFF') + '22' }}
                                />
                            )}

                            {/* Design Preview */}
                            {design.colorImages?.[selectedColor.name] ? (
                                <div className="absolute inset-0">
                                    <img
                                        src={design.colorImages[selectedColor.name]}
                                        alt={`${design.title} - ${selectedColor.name}`}
                                        className="h-full w-full object-cover animate-in fade-in duration-500"
                                    />
                                </div>
                            ) : (
                                <div className="absolute inset-0 flex items-center justify-center p-20">
                                    <img
                                        src={selectedPrintSide === 'front' ? design.mainImage : design.backImage || design.mainImage}
                                        alt={design.title}
                                        className="max-h-full max-w-full drop-shadow-2xl object-contain animate-in zoom-in duration-700"
                                    />
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </div>

                <div className="flex gap-4 overflow-x-auto pb-2 no-scrollbar">
                    {filteredTemplates.map(t => (
                        <button
                            key={t.id}
                            onClick={() => {
                                setSelectedTemplate(t);
                                const allowed = t.colors.filter(c => !design.allowedColors || design.allowedColors.length === 0 || design.allowedColors.includes(c.name));
                                setSelectedColor(allowed[0] || t.colors[0]);
                                setSelectedSize(t.sizes[0]);
                            }}
                            className={`px-6 py-3 rounded-2xl border transition-all whitespace-nowrap font-black uppercase text-[10px] tracking-widest ${selectedTemplate.id === t.id
                                ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/20"
                                : "bg-card border-white/10 text-muted-foreground hover:border-white/30"
                                }`}
                        >
                            {t.name}
                        </button>
                    ))}
                    {filteredTemplates.length === 0 && (
                        <div className="text-sm text-muted-foreground italic px-4 py-2">
                            No styles available for {selectedDemographic}
                        </div>
                    )}
                </div>
            </div>

            {/* Selection UI */}
            <div className="space-y-10">
                <div className="space-y-4">
                    <div className="flex flex-wrap gap-2">
                        {design.categories.map(cat => (
                            <span key={cat} className="px-3 py-1 bg-primary/10 border border-primary/20 rounded-full text-[10px] font-black uppercase tracking-widest text-primary">
                                {cat}
                            </span>
                        ))}
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-none">
                        {design.title}
                    </h1>
                    <p className="text-xl text-muted-foreground font-light leading-relaxed">
                        {design.description}
                    </p>

                    {/* Demographic Tabs */}
                    {availableDemographics.length > 1 && (
                        <div className="flex flex-wrap gap-2 pt-2">
                            {availableDemographics.map(demo => (
                                <button
                                    key={demo}
                                    onClick={() => setSelectedDemographic(demo)}
                                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${selectedDemographic === demo
                                            ? "bg-foreground text-background"
                                            : "bg-muted/50 text-muted-foreground hover:bg-muted"
                                        }`}
                                >
                                    {demo}
                                </button>
                            ))}
                        </div>
                    )}
                </div>

                <div className="space-y-8">
                    {/* Color Selection */}
                    <div className="space-y-4">
                        <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Select Color: {selectedColor.name}</label>
                        <div className="flex flex-wrap gap-3">
                            {selectedTemplate.colors
                                .filter(color => !design.allowedColors || design.allowedColors.length === 0 || design.allowedColors.includes(color.name))
                                .map(color => (
                                    <button
                                        key={color.name}
                                        onClick={() => setSelectedColor(color)}
                                        className={`h-12 w-12 rounded-full border-2 transition-all flex items-center justify-center ${selectedColor.name === color.name
                                            ? "border-primary scale-110"
                                            : color.hex.toLowerCase() === '#ffffff'
                                                ? "border-zinc-300 dark:border-zinc-800 hover:border-zinc-400 dark:hover:border-zinc-700"
                                                : "border-white/10 hover:border-white/20"
                                            }`}
                                        style={{ backgroundColor: color.hex }}
                                        title={color.name}
                                    >
                                        {selectedColor.name === color.name && (
                                            <Check className={`h-5 w-5 ${color.hex === '#FFFFFF' ? 'text-black' : 'text-white'}`} />
                                        )}
                                    </button>
                                ))}
                        </div>
                    </div>

                    {/* Size Selection */}
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Select Size</label>
                            {currentSizeGuide && (
                                <button
                                    onClick={() => setShowSizeGuide(true)}
                                    className="text-[10px] uppercase font-bold text-primary flex items-center gap-1 hover:underline"
                                >
                                    <Info className="h-3 w-3" /> Size Guide
                                </button>
                            )}
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {selectedTemplate.sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`h-12 w-16 rounded-xl border font-black transition-all ${selectedSize === size
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                        : "bg-card border-white/10 text-muted-foreground hover:border-white/30"
                                        }`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Print Side Selection (Only if both enabled) */}
                    {design.printOptions?.front && design.printOptions?.back && (
                        <div className="space-y-4">
                            <label className="text-xs font-black uppercase tracking-[0.2em] text-muted-foreground">Print Location</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedPrintSide('front')}
                                    className={`flex-1 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${selectedPrintSide === 'front'
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                        : "bg-card border-white/10 text-muted-foreground hover:border-white/30"
                                        }`}
                                >
                                    Front
                                </button>
                                <button
                                    onClick={() => setSelectedPrintSide('back')}
                                    className={`flex-1 py-3 rounded-xl border font-black text-xs uppercase tracking-widest transition-all ${selectedPrintSide === 'back'
                                        ? "bg-primary text-primary-foreground border-primary shadow-lg"
                                        : "bg-card border-white/10 text-muted-foreground hover:border-white/30"
                                        }`}
                                >
                                    Back
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Price & Add to Cart */}
                    <div className="pt-8 space-y-6">
                        <div className="flex flex-col gap-1">
                            {design.compareAtPrice && (
                                <span className="text-sm font-bold text-muted-foreground line-through decoration-primary/40 tracking-wider">
                                    ${design.compareAtPrice.toFixed(2)}
                                </span>
                            )}
                            <div className="flex items-baseline gap-4">
                                <span className="text-5xl font-black tracking-tighter text-primary">
                                    ${(design.price || selectedTemplate.basePrice).toFixed(2)}
                                </span>
                                <span className="text-muted-foreground uppercase text-xs tracking-widest font-bold">Inc. GST</span>
                            </div>
                        </div>

                        <Button
                            className="w-full h-18 rounded-[2rem] text-xl font-black uppercase tracking-widest shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all"
                            onClick={handleAddToCart}
                            disabled={isAdding}
                        >
                            {isAdding ? "Added to Cart!" : (
                                <>
                                    <ShoppingBag className="mr-3 h-6 w-6" />
                                    Add to Cart
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Size Guide Modal */}
            <AnimatePresence>
                {showSizeGuide && currentSizeGuide && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                        onClick={() => setShowSizeGuide(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative max-w-4xl w-full bg-card rounded-[2.5rem] border border-white/10 p-8 shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setShowSizeGuide(false)}
                                className="absolute top-6 right-6 p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                            >
                                <X className="h-6 w-6 text-muted-foreground hover:text-white transition-colors" />
                            </button>
                            <h2 className="text-2xl font-black uppercase tracking-tighter mb-6">Size Guide</h2>
                            <div className="aspect-video w-full rounded-2xl overflow-hidden bg-muted">
                                <img src={currentSizeGuide} alt="Size Guide" className="h-full w-full object-contain" />
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
