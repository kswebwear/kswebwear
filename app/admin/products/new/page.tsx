"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createProduct } from "@/lib/db";
import { ArrowLeft, Upload, X, Plus, Trash, Loader2 } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";
import { uploadToCloudinary } from "@/app/actions/upload";
import { Checkbox } from "@/components/ui/checkbox";


const SIZES = ["S", "M", "L", "XL", "XXL", "7", "8", "9", "10", "11"];
const COLORS = ["Red", "Blue", "Black", "White", "Green", "Yellow", "Purple"];
const BEAD_SIZES = ["6mm", "8mm", "10mm", "12mm", "14mm"];

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [previewUrls, setPreviewUrls] = useState<string[]>([]);

    const [formData, setFormData] = useState({
        name: "",
        description: "",
        price: "",
        compareAtPrice: "",
        category: "",
        images: [] as string[],
        selectedSizes: [] as string[],
        selectedColors: [] as string[],
        selectedBeadSizes: [] as string[],
        featured: false,
        inStock: true,
    });

    const isKarungali = formData.category.toLowerCase().includes("karungali");

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files);
            setImageFiles(prev => [...prev, ...files]);
            const newUrls = files.map(file => URL.createObjectURL(file));
            setPreviewUrls(prev => [...prev, ...newUrls]);
        }
    };

    const removeImage = (index: number) => {
        setPreviewUrls(prev => prev.filter((_, i) => i !== index));
        // Note: files in imageFiles don't strictly match previewUrls order after some deletions
        // but it's handled in handleSubmit by counting blobs
    };

    const setMainImage = (index: number) => {
        setPreviewUrls(prev => {
            const newUrls = [...prev];
            const [main] = newUrls.splice(index, 1);
            return [main, ...newUrls];
        });
    };

    const toggleSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            selectedSizes: prev.selectedSizes.includes(size)
                ? prev.selectedSizes.filter(s => s !== size)
                : [...prev.selectedSizes, size]
        }));
    };

    const toggleBeadSize = (size: string) => {
        setFormData(prev => ({
            ...prev,
            selectedBeadSizes: prev.selectedBeadSizes.includes(size)
                ? prev.selectedBeadSizes.filter(s => s !== size)
                : [...prev.selectedBeadSizes, size]
        }));
    };

    const toggleColor = (color: string) => {
        setFormData(prev => ({
            ...prev,
            selectedColors: prev.selectedColors.includes(color)
                ? prev.selectedColors.filter(c => c !== color)
                : [...prev.selectedColors, color]
        }));
    };

    const uploadImage = async (file: File) => {
        const formData = new FormData();
        formData.append("file", file);
        return await uploadToCloudinary(formData);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            setUploading(true);
            const uploadedUrls: string[] = [];
            for (const file of imageFiles) {
                const url = await uploadImage(file);
                uploadedUrls.push(url);
            }

            const currentUrls = previewUrls.map(url => {
                if (url.startsWith('blob:')) {
                    return uploadedUrls.shift() || "";
                }
                return url;
            }).filter(Boolean);

            if (currentUrls.length === 0) {
                toast.error("Please upload at least one image.");
                setLoading(false);
                return;
            }

            await createProduct({
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                compareAtPrice: formData.compareAtPrice ? parseFloat(formData.compareAtPrice) : undefined,
                category: formData.category,
                images: currentUrls,
                sizes: isKarungali ? [] : formData.selectedSizes,
                colors: isKarungali ? [] : formData.selectedColors,
                beadSizes: isKarungali ? formData.selectedBeadSizes : [],
                featured: formData.featured,
                inStock: formData.inStock,
                createdAt: Date.now(),
            });

            toast.success("Product created successfully!");
            router.push("/admin/products");
            router.refresh();
        } catch (error) {
            console.error("Error creating product:", error);
            toast.error("Failed to create product");
        } finally {
            setLoading(false);
            setUploading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center gap-4">
                <Link href="/admin/products">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-2xl font-bold">Add New Product</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6 border p-6 rounded-lg bg-card">
                <div className="space-y-2">
                    <Label htmlFor="name">Product Name</Label>
                    <Input id="name" name="name" required value={formData.name} onChange={handleChange} placeholder="e.g. Premium Hoodie" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="price">Sales Price ($)</Label>
                        <Input id="price" name="price" type="number" step="0.01" required value={formData.price} onChange={handleChange} placeholder="0.00" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="compareAtPrice">Original Price ($)</Label>
                        <Input id="compareAtPrice" name="compareAtPrice" type="number" step="0.01" value={formData.compareAtPrice} onChange={handleChange} placeholder="Optional" />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <Input id="category" name="category" required value={formData.category} onChange={handleChange} placeholder="Apparel or Karungali Mala" />
                </div>

                <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea id="description" name="description" required value={formData.description} onChange={handleChange} placeholder="Product description..." />
                </div>

                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <Label>Product Gallery</Label>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="h-8"
                            onClick={() => document.getElementById('imageFile')?.click()}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Image
                        </Button>
                        <input
                            id="imageFile"
                            type="file"
                            accept="image/*"
                            multiple
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        {previewUrls.map((url, index) => (
                            <div key={index} className="group relative aspect-square overflow-hidden rounded-xl border bg-muted">
                                <img src={url} alt={`Preview ${index}`} className="h-full w-full object-cover" />
                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <Button
                                        type="button"
                                        variant="destructive"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removeImage(index)}
                                    >
                                        <Trash className="h-4 w-4" />
                                    </Button>
                                    {index !== 0 && (
                                        <Button
                                            type="button"
                                            variant="secondary"
                                            size="sm"
                                            className="h-8 px-2 text-[10px] font-bold uppercase"
                                            onClick={() => setMainImage(index)}
                                        >
                                            Set Main
                                        </Button>
                                    )}
                                </div>
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold uppercase rounded">
                                        Main
                                    </div>
                                )}
                            </div>
                        ))}
                        {previewUrls.length === 0 && (
                            <div
                                className="aspect-square flex flex-col items-center justify-center border-2 border-dashed rounded-xl cursor-pointer hover:bg-muted/50 transition-colors"
                                onClick={() => document.getElementById('imageFile')?.click()}
                            >
                                <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                                <span className="text-xs text-muted-foreground font-medium">Upload Images</span>
                            </div>
                        )}
                    </div>
                </div>

                {!isKarungali ? (
                    <>
                        <div className="space-y-3">
                            <Label>Sizes</Label>
                            <div className="flex flex-wrap gap-2">
                                {SIZES.map(size => (
                                    <Button
                                        key={size}
                                        type="button"
                                        variant={formData.selectedSizes.includes(size) ? "default" : "outline"}
                                        className="h-8 w-8 p-0"
                                        onClick={() => toggleSize(size)}
                                    >
                                        {size}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            <Label>Colors</Label>
                            <div className="flex flex-wrap gap-2">
                                {COLORS.map(color => (
                                    <Button
                                        key={color}
                                        type="button"
                                        variant={formData.selectedColors.includes(color) ? "default" : "outline"}
                                        size="sm"
                                        onClick={() => toggleColor(color)}
                                    >
                                        {color}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="space-y-3">
                        <Label>Bead Sizes</Label>
                        <div className="flex flex-wrap gap-2">
                            {BEAD_SIZES.map(size => (
                                <Button
                                    key={size}
                                    type="button"
                                    variant={formData.selectedBeadSizes.includes(size) ? "default" : "outline"}
                                    className="h-9 px-3"
                                    onClick={() => toggleBeadSize(size)}
                                >
                                    {size}
                                </Button>
                            ))}
                        </div>
                    </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="featured"
                            checked={formData.featured}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: !!checked }))}
                        />
                        <Label htmlFor="featured" className="cursor-pointer">Featured Product</Label>
                    </div>

                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id="inStock"
                            checked={formData.inStock}
                            onCheckedChange={(checked) => setFormData(prev => ({ ...prev, inStock: !!checked }))}
                        />
                        <Label htmlFor="inStock" className="cursor-pointer">In Stock</Label>
                    </div>
                </div>

                <div className="pt-4">
                    <Button type="submit" className="w-full" size="lg" disabled={loading || uploading}>
                        {uploading ? "Uploading Image..." : loading ? "Creating..." : "Create Product"}
                    </Button>
                </div>
            </form>
        </div>
    );
}
