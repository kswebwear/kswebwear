"use client";

import { useEffect, useState } from "react";
import { Design } from "@/lib/types";
import { getAllDesigns, deleteDesign, updateDesign } from "@/lib/db";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Plus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Star,
    ExternalLink,
    Loader2,
    CheckSquare,
    Square,
    X
} from "lucide-react";
import Link from "next/link";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";

export default function AdminDesignsPage() {
    const [designs, setDesigns] = useState<Design[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    const fetchDesigns = async () => {
        setLoading(true);
        try {
            const data = await getAllDesigns();
            setDesigns(data);
        } catch (err) {
            console.error("Error fetching designs:", err);
            toast.error("Failed to fetch designs.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDesigns();
    }, []);

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this design?")) return;
        try {
            await deleteDesign(id);
            setDesigns(prev => prev.filter(d => d.id !== id));
            toast.success("Design deleted");
        } catch (err) {
            toast.error("Failed to delete design");
        }
    };

    const toggleFeatured = async (design: Design) => {
        try {
            await updateDesign(design.id, { featured: !design.featured });
            setDesigns(prev => prev.map(d =>
                d.id === design.id ? { ...d, featured: !d.featured } : d
            ));
            toast.success(design.featured ? "Removed from featured" : "Marked as featured");
        } catch (err) {
            toast.error("Failed to update featured status");
        }
    };

    const handleBulkFeature = async (featured: boolean) => {
        try {
            const promises = selectedIds.map(id => updateDesign(id, { featured }));
            await Promise.all(promises);
            setDesigns(prev => prev.map(d =>
                selectedIds.includes(d.id) ? { ...d, featured } : d
            ));
            toast.success(`Bulk updated ${selectedIds.length} designs`);
            setSelectedIds([]);
        } catch (err) {
            toast.error("Failed bulk update");
        }
    };

    const handleBulkDelete = async () => {
        if (!confirm(`Are you sure you want to delete ${selectedIds.length} designs?`)) return;
        try {
            const promises = selectedIds.map(id => deleteDesign(id));
            await Promise.all(promises);
            setDesigns(prev => prev.filter(d => !selectedIds.includes(d.id)));
            toast.success(`Deleted ${selectedIds.length} designs`);
            setSelectedIds([]);
        } catch (err) {
            toast.error("Failed bulk delete");
        }
    };

    const toggleSelection = (id: string) => {
        setSelectedIds(prev =>
            prev.includes(id)
                ? prev.filter(i => i !== id)
                : [...prev, id]
        );
    };

    const selectAll = () => {
        if (selectedIds.length === filteredDesigns.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredDesigns.map(d => d.id));
        }
    };

    const filteredDesigns = designs.filter(d =>
        d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        d.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Designs Library</h1>
                    <p className="text-muted-foreground mt-1">
                        Manage your artwork master records for use on product templates.
                    </p>
                </div>
                <Link href="/admin/designs/new">
                    <Button className="gap-2">
                        <Plus className="h-4 w-4" />
                        Add New Design
                    </Button>
                </Link>
            </div>

            <div className="flex flex-col md:flex-row gap-4 bg-background p-4 rounded-xl border">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search designs by title or tags..."
                        className="pl-10"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                {filteredDesigns.length > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={selectAll}
                        className="gap-2"
                    >
                        {selectedIds.length === filteredDesigns.length ? <X className="h-4 w-4" /> : <CheckSquare className="h-4 w-4" />}
                        {selectedIds.length === filteredDesigns.length ? "Deselect All" : "Select All"}
                    </Button>
                )}
            </div>

            {selectedIds.length > 0 && (
                <div className="flex items-center justify-between bg-primary/10 border border-primary/20 p-4 rounded-xl animate-in slide-in-from-top-2">
                    <span className="text-sm font-bold uppercase tracking-tight">
                        {selectedIds.length} Designs Selected
                    </span>
                    <div className="flex gap-2">
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleBulkFeature(true)}>
                            <Star className="h-4 w-4 fill-current" /> Feature
                        </Button>
                        <Button size="sm" variant="outline" className="gap-2" onClick={() => handleBulkFeature(false)}>
                            <Star className="h-4 w-4" /> Unfeature
                        </Button>
                        <Button size="sm" variant="destructive" className="gap-2" onClick={handleBulkDelete}>
                            <Trash2 className="h-4 w-4" /> Delete
                        </Button>
                    </div>
                </div>
            )}

            {loading ? (
                <div className="flex justify-center py-20">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredDesigns.map((design) => (
                        <div key={design.id} className={`group relative bg-card border rounded-2xl overflow-hidden hover:shadow-lg transition-all ${selectedIds.includes(design.id) ? 'ring-2 ring-primary' : ''}`}>
                            <div className="aspect-square relative overflow-hidden bg-muted">
                                <img
                                    src={design.mainImage}
                                    alt={design.title}
                                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                                />
                                <div className="absolute top-3 left-3 flex gap-2 z-10">
                                    <Checkbox
                                        checked={selectedIds.includes(design.id)}
                                        onCheckedChange={() => toggleSelection(design.id)}
                                        className="bg-white/90 data-[state=checked]:bg-primary"
                                    />
                                </div>
                                <div className="absolute top-3 right-3 flex gap-2">
                                    <button
                                        onClick={() => toggleFeatured(design)}
                                        className={`p-2 rounded-full backdrop-blur-md transition-all ${design.featured
                                            ? "bg-yellow-500 text-white"
                                            : "bg-black/20 text-white/70 hover:bg-black/40"
                                            }`}
                                    >
                                        <Star className={`h-4 w-4 ${design.featured ? "fill-current" : ""}`} />
                                    </button>
                                </div>
                            </div>

                            <div className="p-4">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-bold truncate pr-4">{design.title}</h3>
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" size="icon" className="h-8 w-8">
                                                <MoreVertical className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuItem asChild>
                                                <Link href={`/admin/designs/edit/${design.id}`} className="flex items-center gap-2">
                                                    <Edit className="h-4 w-4" /> Edit
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem asChild>
                                                <Link href={`/products/${design.id}`} target="_blank" className="flex items-center gap-2">
                                                    <ExternalLink className="h-4 w-4" /> View Public
                                                </Link>
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                className="text-red-600 focus:text-red-700 focus:bg-red-50"
                                                onClick={() => handleDelete(design.id)}
                                            >
                                                <Trash2 className="h-4 w-4 mr-2" /> Delete
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                                <div className="flex flex-wrap gap-1 mb-2">
                                    {design.categories.slice(0, 2).map(cat => (
                                        <span key={cat} className="px-2 py-0.5 bg-muted rounded text-[10px] uppercase font-bold text-muted-foreground">
                                            {cat}
                                        </span>
                                    ))}
                                    {design.categories.length > 2 && (
                                        <span className="text-[10px] text-muted-foreground font-bold">+{design.categories.length - 2}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {!loading && filteredDesigns.length === 0 && (
                <div className="text-center py-20 border-2 border-dashed rounded-3xl">
                    <p className="text-muted-foreground">No designs found matching your search.</p>
                </div>
            )}
        </div>
    );
}
