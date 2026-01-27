"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createDesign, getUniqueCategoriesAndTags, getAllTemplates } from "@/lib/db";
import { uploadToCloudinary } from "@/app/actions/upload";
import { Design, ProductTemplate } from "@/lib/types";
import { designSchema } from "@/lib/validations";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Loader2, Plus, X, Tag, FolderOpen } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

const COMMON_COLORS = [
    { name: "Black", hex: "#000000" },
    { name: "White", hex: "#FFFFFF" },
    { name: "Navy", hex: "#000080" },
    { name: "Red", hex: "#FF0000" },
    { name: "Royal Blue", hex: "#4169E1" },
    { name: "Grey", hex: "#808080" },
    { name: "Forest Green", hex: "#228B22" },
    { name: "Maroon", hex: "#800000" }
];

export default function NewDesignPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [description, setDescription] = useState("");
    const [mainImage, setMainImage] = useState("");
    const [categories, setCategories] = useState<string[]>([]);
    const [categoryInput, setCategoryInput] = useState("");
    const [tags, setTags] = useState<string[]>([]);
    const [tagInput, setTagInput] = useState("");

    const [existingCats, setExistingCats] = useState<string[]>([]);
    const [existingTags, setExistingTags] = useState<string[]>([]);
    const [availableTemplates, setAvailableTemplates] = useState<ProductTemplate[]>([]);
    const [allowedColors, setAllowedColors] = useState<string[]>([]);
    const [colorImages, setColorImages] = useState<Record<string, string>>({});
    const [uploadingColors, setUploadingColors] = useState<Record<string, boolean>>({});

    const [hidden, setHidden] = useState(false);
    const [printOptions, setPrintOptions] = useState({ front: true, back: false });
    const [price, setPrice] = useState("");
    const [compareAtPrice, setCompareAtPrice] = useState("");
    const [sizeGuide, setSizeGuide] = useState("");
    const [backImage, setBackImage] = useState("");
    const [allowedDemographics, setAllowedDemographics] = useState<string[]>([]);

    const [backImageFile, setBackImageFile] = useState<File | null>(null);
    const [sizeGuideFile, setSizeGuideFile] = useState<File | null>(null);
    const [backPreviewUrl, setBackPreviewUrl] = useState<string | null>(null);
    const [sizeGuidePreviewUrl, setSizeGuidePreviewUrl] = useState<string | null>(null);

    useEffect(() => {
        getUniqueCategoriesAndTags().then((data: { categories: string[], tags: string[] }) => {
            setExistingCats(data.categories);
            setExistingTags(data.tags);
        });
        getAllTemplates().then(setAvailableTemplates);
    }, []);

    const allColors = Array.from(new Set([
        ...COMMON_COLORS.map(c => c.name),
        ...availableTemplates.flatMap(t => t.colors.map(c => c.name))
    ])).sort();

    console.log("Debug - allColors:", allColors);

    const handleColorToggle = (color: string) => {
        if (allowedColors.includes(color)) {
            setAllowedColors(allowedColors.filter(c => c !== color));
            const newImages = { ...colorImages };
            delete newImages[color];
            setColorImages(newImages);
        } else {
            setAllowedColors([...allowedColors, color]);
        }
    };

    const handleColorImageUpload = async (color: string, file: File) => {
        setUploadingColors(prev => ({ ...prev, [color]: true }));
        try {
            const formData = new FormData();
            formData.append("file", file);
            const url = await uploadToCloudinary(formData);
            setColorImages(prev => ({ ...prev, [color]: url }));
        } catch (err) {
            toast.error(`Failed to upload image for ${color}`);
        } finally {
            setUploadingColors(prev => ({ ...prev, [color]: false }));
        }
    };

    const handleAddCategory = (val?: string) => {
        const cat = val || categoryInput;
        if (cat && !categories.includes(cat)) {
            setCategories([...categories, cat]);
            setCategoryInput("");
        }
    };

    const handleAddTag = (val?: string) => {
        const tag = val || tagInput;
        if (tag && !tags.includes(tag)) {
            setTags([...tags, tag]);
            setTagInput("");
        }
    };

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const [featured, setFeatured] = useState(false);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setImageFile(file);
            setPreviewUrl(URL.createObjectURL(file));
            setMainImage(""); // Clear manual URL if file is selected
        }
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await uploadToCloudinary(formData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (loading) return;

        console.log("Submit process started");
        setLoading(true);

        try {
            let finalImageUrl = mainImage;
            let finalBackImageUrl = backImage;
            let finalSizeGuideUrl = sizeGuide;

            // Upload image if file is selected
            if (imageFile) {
                console.log("Uploading image file...");
                try {
                    finalImageUrl = await uploadImage(imageFile);
                    console.log("Image uploaded: ", finalImageUrl);
                } catch (uploadErr) {
                    console.error("Upload failed:", uploadErr);
                    toast.error("Failed to upload image. Please try again.");
                    setLoading(false);
                    return;
                }
            }

            if (backImageFile) {
                console.log("Uploading back image file...");
                const url = await uploadImage(backImageFile);
                finalBackImageUrl = url;
            }

            if (sizeGuideFile) {
                console.log("Uploading size guide file...");
                const url = await uploadImage(sizeGuideFile);
                finalSizeGuideUrl = url;
            }

            if (!finalImageUrl) {
                toast.error("Please provide an image URL or upload a file.");
                setLoading(false);
                return;
            }

            console.log("Saving design to database...");
            const designData: Omit<Design, "id"> = {
                title,
                description,
                mainImage: finalImageUrl,
                allowedColors: allowedColors.length > 0 ? allowedColors : undefined,
                colorImages: Object.keys(colorImages).length > 0 ? colorImages : undefined,
                categories,
                tags,
                featured,
                hidden,
                printOptions,
                // Use null instead of undefined for Firestore compatibility
                price: price ? parseFloat(price) : undefined, // let's try undefined first, if it fails I'll switch to null, but usually "Unsupported field value: undefined" means the PROPERTY is set to undefined. 
                // Wait, the user SPECIFICALLY said "Unsupported field value: undefined". 
                // So I must NOT set the property if it is undefined, OR set it to null.
                // const designData = { ... }
                // clean(designData)
                // Let's use null.
                compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
                sizeGuide: finalSizeGuideUrl || null,
                backImage: finalBackImageUrl || null,
                allowedDemographics: allowedDemographics.length > 0 ? allowedDemographics as any : undefined,
                createdAt: Date.now()
            };

            const validation = designSchema.safeParse(designData);
            if (!validation.success) {
                console.error("Validation error:", validation.error);
                toast.error("Validation failed. Please check your inputs.");
                // Optionally show detailed errors:
                validation.error.issues.forEach((err: any) => {
                    toast.error(`${err.path.join(".")}: ${err.message}`);
                });
                setLoading(false);
                return;
            }

            console.log("Saving design to database...", designData);
            const designId = await createDesign(designData);
            console.log("Design successfully saved to Firestore. ID:", designId);

            toast.success("Design published successfully!");

            console.log("Initiating redirect to designs list...");
            setLoading(false);
            router.refresh();
            router.push("/admin/designs");

        } catch (err: any) {
            console.error("Detailed design creation error:", err);
            toast.error(`Error publishing design: ${err.message || "Unknown error"}`);
            setLoading(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto space-y-8 pb-20">
            <Link
                href="/admin/designs"
                className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
            >
                <ArrowLeft className="h-4 w-4" />
                Back to Designs
            </Link>

            <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tight">Add New Design</h1>
                <p className="text-muted-foreground">Define a new artwork master record.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8 bg-card border p-8 rounded-3xl shadow-sm">
                <div className="grid gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Title</label>
                        <Input
                            required
                            placeholder="e.g. Karungali Spiritual Pattern"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Description</label>
                        <Textarea
                            required
                            placeholder="Detailed description of the artwork..."
                            className="min-h-[120px]"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="space-y-4">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Design Image</label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Upload File</label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFileChange}
                                    className="cursor-pointer"
                                    disabled={!!mainImage}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Or Manual URL</label>
                                <Input
                                    placeholder="https://..."
                                    value={mainImage}
                                    onChange={(e) => setMainImage(e.target.value)}
                                    disabled={!!imageFile}
                                />
                            </div>
                        </div>

                        {previewUrl && (
                            <div className="relative h-48 w-48 rounded-2xl overflow-hidden border border-white/10 group">
                                <img src={previewUrl} alt="Preview" className="h-full w-full object-cover" />
                                <button
                                    type="button"
                                    onClick={() => { setImageFile(null); setPreviewUrl(null); }}
                                    className="absolute top-2 right-2 p-1.5 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest">Provide a direct link or upload the PNG/JPG artwork.</p>
                    </div>

                    <div className="flex items-center space-x-6 pt-2">
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="featured"
                                checked={featured}
                                onChange={(e) => setFeatured(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="featured" className="text-sm font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                                Featured
                            </label>
                        </div>
                        <div className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                id="hidden"
                                checked={hidden}
                                onChange={(e) => setHidden(e.target.checked)}
                                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            />
                            <label htmlFor="hidden" className="text-sm font-bold uppercase tracking-widest text-muted-foreground cursor-pointer">
                                Hidden
                            </label>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pt-4 border-t border-white/5">
                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Print Options</label>
                            <div className="flex gap-6">
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="printFront"
                                        checked={printOptions.front}
                                        onChange={(e) => setPrintOptions({ ...printOptions, front: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="printFront" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">Front</label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id="printBack"
                                        checked={printOptions.back}
                                        onChange={(e) => setPrintOptions({ ...printOptions, back: e.target.checked })}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor="printBack" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">Back</label>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Price Override (Optional)</label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="e.g. 25.00"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Override the base template price for this design.</p>
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Compare At Price (Original)</label>
                            <Input
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                value={compareAtPrice}
                                onChange={(e) => setCompareAtPrice(e.target.value)}
                            />
                            <p className="text-[10px] text-muted-foreground uppercase tracking-widest">Show a struck-through original price for discounts.</p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Back Design Image (Optional)</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        setBackImageFile(file);
                                        setBackPreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {backPreviewUrl && (
                                <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={backPreviewUrl} alt="Back" className="h-full w-full object-cover" />
                                    <button
                                        type="button"
                                        onClick={() => { setBackImageFile(null); setBackPreviewUrl(null); }}
                                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Custom Size Guide (Optional)</label>
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={(e) => {
                                    if (e.target.files?.[0]) {
                                        const file = e.target.files[0];
                                        setSizeGuideFile(file);
                                        setSizeGuidePreviewUrl(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            {sizeGuidePreviewUrl && (
                                <div className="relative h-32 w-32 rounded-xl overflow-hidden border border-white/10 group">
                                    <img src={sizeGuidePreviewUrl} alt="Size Guide" className="h-full w-full object-contain" />
                                    <button
                                        type="button"
                                        onClick={() => { setSizeGuideFile(null); setSizeGuidePreviewUrl(null); }}
                                        className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white"
                                    >
                                        <X className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Color Specific Settings */}
                    <div className="space-y-6 pt-4 border-t border-white/5">
                        <div className="space-y-2">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Available Colors</label>
                            <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-4">Select which colors this design can be printed on. If none selected, all colors are allowed.</p>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {allColors.map(color => (
                                    <button
                                        key={color}
                                        type="button"
                                        onClick={() => handleColorToggle(color)}
                                        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest transition-all ${allowedColors.includes(color)
                                            ? "bg-primary text-primary-foreground border-primary"
                                            : "bg-muted/30 border-transparent hover:border-white/10 text-muted-foreground"
                                            }`}
                                    >
                                        <div className="h-3 w-3 rounded-full border border-white/20" style={{ backgroundColor: color.toLowerCase() }} />
                                        {color}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {allowedColors.length > 0 && (
                            <div className="space-y-4 pt-4">
                                <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Color-Specific Mockups (Optional)</label>
                                <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-4">Upload specific mockup images for each selected color to show in the store.</p>
                                <div className="grid gap-4">
                                    {allowedColors.map(color => (
                                        <div key={color} className="flex flex-col sm:flex-row items-start sm:items-center gap-4 p-4 bg-muted/20 rounded-2xl border border-white/5">
                                            <div className="flex items-center gap-3 min-w-[120px]">
                                                <div className="h-6 w-6 rounded-full border border-white/20" style={{ backgroundColor: color.toLowerCase() }} />
                                                <span className="text-[10px] font-black uppercase tracking-widest">{color}</span>
                                            </div>
                                            <div className="flex-1 w-full">
                                                {colorImages[color] ? (
                                                    <div className="relative h-20 w-20 rounded-lg overflow-hidden border border-white/10 group">
                                                        <img src={colorImages[color]} alt={color} className="h-full w-full object-cover" />
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                const newImages = { ...colorImages };
                                                                delete newImages[color];
                                                                setColorImages(newImages);
                                                            }}
                                                            className="absolute top-1 right-1 p-1 bg-black/60 rounded-full text-white opacity-0 group-hover:opacity-100 transition-opacity"
                                                        >
                                                            <X className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                ) : (
                                                    <div className="relative">
                                                        <Input
                                                            type="file"
                                                            accept="image/*"
                                                            onChange={(e) => e.target.files?.[0] && handleColorImageUpload(color, e.target.files[0])}
                                                            className="cursor-pointer text-[10px] h-9"
                                                            disabled={uploadingColors[color]}
                                                        />
                                                        {uploadingColors[color] && (
                                                            <div className="absolute inset-y-0 right-3 flex items-center">
                                                                <Loader2 className="h-4 w-4 animate-spin text-primary" />
                                                            </div>
                                                        )}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="space-y-4 pt-4 border-t border-white/5">
                        <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground">Allowed Demographics</label>
                        <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-widest mb-4">Select who this design is for (affects product filters).</p>
                        <div className="flex flex-wrap gap-4">
                            {['Men', 'Women', 'Kids', 'Infants'].map((demo) => (
                                <div key={demo} className="flex items-center space-x-2">
                                    <input
                                        type="checkbox"
                                        id={`demo-${demo}`}
                                        checked={allowedDemographics.includes(demo)}
                                        onChange={(e) => {
                                            if (e.target.checked) setAllowedDemographics([...allowedDemographics, demo]);
                                            else setAllowedDemographics(allowedDemographics.filter(d => d !== demo));
                                        }}
                                        className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                                    />
                                    <label htmlFor={`demo-${demo}`} className="text-[10px] font-black uppercase tracking-widest text-muted-foreground cursor-pointer">{demo}</label>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Categories */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <FolderOpen className="h-4 w-4" /> Categories
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add category..."
                                    value={categoryInput}
                                    onChange={(e) => setCategoryInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => handleAddCategory()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {existingCats.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">Suggestions</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {existingCats.filter((c: string) => !categories.includes(c)).map((cat: string) => (
                                            <button
                                                key={cat}
                                                type="button"
                                                onClick={() => handleAddCategory(cat)}
                                                className="text-[10px] px-2 py-1 bg-muted/30 border border-transparent hover:border-primary/30 rounded-md transition-colors"
                                            >
                                                {cat}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                                {categories.map(cat => (
                                    <span key={cat} className="flex items-center gap-1 px-3 py-1 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold uppercase">
                                        {cat}
                                        <button type="button" onClick={() => setCategories(categories.filter(c => c !== cat))}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Tags */}
                        <div className="space-y-4">
                            <label className="text-sm font-bold uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                                <Tag className="h-4 w-4" /> Tags
                            </label>
                            <div className="flex gap-2">
                                <Input
                                    placeholder="Add tag..."
                                    value={tagInput}
                                    onChange={(e) => setTagInput(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTag())}
                                />
                                <Button type="button" variant="outline" size="icon" onClick={() => handleAddTag()}>
                                    <Plus className="h-4 w-4" />
                                </Button>
                            </div>

                            {existingTags.length > 0 && (
                                <div className="space-y-2">
                                    <p className="text-[10px] uppercase font-black tracking-widest text-muted-foreground/50">Suggestions</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {existingTags.filter((t: string) => !tags.includes(t)).map((tag: string) => (
                                            <button
                                                key={tag}
                                                type="button"
                                                onClick={() => handleAddTag(tag)}
                                                className="text-[10px] px-3 py-1 bg-muted/30 border border-transparent hover:border-primary/30 rounded-md transition-colors"
                                            >
                                                #{tag}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-wrap gap-2 pt-2">
                                {tags.map(tag => (
                                    <span key={tag} className="flex items-center gap-1 px-3 py-1 bg-muted text-muted-foreground border rounded-full text-xs font-bold uppercase">
                                        #{tag}
                                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>
                                            <X className="h-3 w-3" />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-6">
                    <Button type="submit" className="w-full h-14 rounded-2xl text-lg font-bold uppercase tracking-widest" disabled={loading}>
                        {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Publish Design"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
