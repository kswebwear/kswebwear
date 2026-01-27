"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSettings, updateSettings } from "@/lib/db";
import { Facebook, Instagram, Save, Loader2, MessageCircle, Plus, Trash, Upload, Megaphone } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { uploadToCloudinary } from "@/app/actions/upload";
import { toast } from "sonner";

export default function AdminSettingsPage() {
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [saveStatus, setSaveStatus] = useState("");
    const [settings, setSettings] = useState({
        facebook: "",
        instagram: "",
        whatsapp: "",
        googleAnalyticsId: "",
        menuItems: [] as { label: string, href: string }[],
        christmasMode: false,
        newYearMode: false,
        karungaliMalaImage: "",
        homeHeroImage: "",
        defaultSizeGuide: "",
        useHeroCarousel: false,
        homeCarousel: [] as string[],
        showDiscountHighlight: false,
        discountHighlight: {
            text: "",
            link: ""
        }
    });

    const [karungaliFile, setKarungaliFile] = useState<File | null>(null);
    const [homeFile, setHomeFile] = useState<File | null>(null);
    const [sizeGuideFile, setSizeGuideFile] = useState<File | null>(null);
    const [carouselFiles, setCarouselFiles] = useState<File[]>([]);

    const [karungaliPreview, setKarungaliPreview] = useState("");
    const [homePreview, setHomePreview] = useState("");
    const [sizeGuidePreview, setSizeGuidePreview] = useState("");
    const [carouselPreviews, setCarouselPreviews] = useState<string[]>([]);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await getSettings("store") as any;
                if (data) {
                    setSettings({
                        facebook: data.facebook || "",
                        instagram: data.instagram || "",
                        whatsapp: data.whatsapp || "",
                        googleAnalyticsId: data.googleAnalyticsId || "",
                        menuItems: data.menuItems || [],
                        christmasMode: data.christmasMode || false,
                        newYearMode: data.newYearMode || false,
                        karungaliMalaImage: data.karungaliMalaImage || "",
                        homeHeroImage: data.homeHeroImage || "",
                        defaultSizeGuide: data.defaultSizeGuide || "",
                        useHeroCarousel: data.useHeroCarousel || false,
                        homeCarousel: data.homeCarousel || [],
                        showDiscountHighlight: data.showDiscountHighlight || false,
                        discountHighlight: data.discountHighlight || { text: "", link: "" }
                    });
                    setKarungaliPreview(data.karungaliMalaImage || "");
                    setHomePreview(data.homeHeroImage || "");
                    setSizeGuidePreview(data.defaultSizeGuide || "");
                    setCarouselPreviews(data.homeCarousel || []);
                }
            } catch (err) {
                console.error("Error fetching settings:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const uploadImage = async (file: File) => {
        try {
            const formData = new FormData();
            formData.append("file", file);
            const url = await uploadToCloudinary(formData);
            return url;
        } catch (error: any) {
            console.error("Error in uploadImage:", error);
            throw new Error(`Cloudinary upload failed: ${error.message}`);
        }
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setSaveStatus("Starting save...");
        try {
            let finalSettings = { ...settings };

            if (karungaliFile) {
                setSaveStatus("Uploading Karungali image...");
                finalSettings.karungaliMalaImage = await uploadImage(karungaliFile);
            }

            if (homeFile) {
                setSaveStatus("Uploading Home image...");
                finalSettings.homeHeroImage = await uploadImage(homeFile);
            }

            if (sizeGuideFile) {
                setSaveStatus("Uploading default size guide...");
                finalSettings.defaultSizeGuide = await uploadImage(sizeGuideFile);
            }

            if (carouselFiles.length > 0) {
                setSaveStatus(`Uploading ${carouselFiles.length} carousel images...`);
                const urls = await Promise.all(carouselFiles.map(file => uploadImage(file)));
                finalSettings.homeCarousel = [...(finalSettings.homeCarousel || []), ...urls];
            }

            await updateSettings("store", finalSettings);
            await updateSettings("social", {
                facebook: settings.facebook,
                instagram: settings.instagram
            });

            setSettings(finalSettings);
            setKarungaliFile(null);
            setHomeFile(null);
            setSizeGuideFile(null);
            setCarouselFiles([]);
            setSaveStatus("Saved successfully!");
            toast.success("Settings saved successfully!");
        } catch (err: any) {
            setSaveStatus("Error!");
            toast.error(`Failed to save: ${err.message}`);
        } finally {
            setSaving(false);
            setTimeout(() => setSaveStatus(""), 3000);
        }
    };

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="max-w-2xl mx-auto space-y-6 pb-20">
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold tracking-tight">Store Settings</h1>
                <p className="text-muted-foreground">Manage your store's configuration and marketing.</p>
            </div>

            <form onSubmit={handleSave} className="space-y-8">
                {/* Communication */}
                <div className="border p-8 rounded-2xl bg-card space-y-6">
                    <h2 className="text-xl font-bold uppercase tracking-tight flex items-center gap-2 text-primary">
                        Communication
                    </h2>
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="whatsapp" className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-muted-foreground">
                                <MessageCircle className="h-3 w-3 text-green-500" /> WhatsApp Number
                            </Label>
                            <Input
                                id="whatsapp"
                                value={settings.whatsapp}
                                onChange={(e) => setSettings({ ...settings, whatsapp: e.target.value })}
                                placeholder="+61400000000"
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="gaId" className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Google Analytics ID</Label>
                            <Input
                                id="gaId"
                                value={settings.googleAnalyticsId}
                                onChange={(e) => setSettings({ ...settings, googleAnalyticsId: e.target.value })}
                                placeholder="G-XXXXXXXXXX"
                            />
                        </div>
                    </div>
                </div>

                {/* Promotional Highlight */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight">Promotional Highlight</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Global announcement bar</p>
                        </div>
                        <Switch
                            checked={settings.showDiscountHighlight}
                            onCheckedChange={(val) => setSettings({ ...settings, showDiscountHighlight: val })}
                        />
                    </div>
                    {settings.showDiscountHighlight && (
                        <div className="space-y-4 pt-4 border-t border-white/5">
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest">Announcement Text</Label>
                                <Input
                                    value={settings.discountHighlight.text}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        discountHighlight: { ...settings.discountHighlight, text: e.target.value }
                                    })}
                                    placeholder="Flash Sale: 20% OFF ALL ITEMS!"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] uppercase tracking-widest">Target Link</Label>
                                <Input
                                    value={settings.discountHighlight.link}
                                    onChange={(e) => setSettings({
                                        ...settings,
                                        discountHighlight: { ...settings.discountHighlight, link: e.target.value }
                                    })}
                                    placeholder="/products"
                                />
                            </div>
                        </div>
                    )}
                </div>

                {/* Navigation Menu */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight">Navigation Menu</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Manage header links</p>
                        </div>
                        <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setSettings({
                                ...settings,
                                menuItems: [...settings.menuItems, { label: "", href: "" }]
                            })}
                        >
                            <Plus className="h-4 w-4 mr-2" /> Add Link
                        </Button>
                    </div>
                    <div className="space-y-4">
                        {settings.menuItems.map((item, index) => (
                            <div key={index} className="flex gap-4 items-end p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="grid flex-1 gap-2">
                                    <Input
                                        value={item.label}
                                        placeholder="Label"
                                        onChange={(e) => {
                                            const newMenu = [...settings.menuItems];
                                            newMenu[index].label = e.target.value;
                                            setSettings({ ...settings, menuItems: newMenu });
                                        }}
                                    />
                                </div>
                                <div className="grid flex-1 gap-2">
                                    <Input
                                        value={item.href}
                                        placeholder="Route"
                                        onChange={(e) => {
                                            const newMenu = [...settings.menuItems];
                                            newMenu[index].href = e.target.value;
                                            setSettings({ ...settings, menuItems: newMenu });
                                        }}
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="destructive"
                                    size="icon"
                                    onClick={() => {
                                        const newMenu = settings.menuItems.filter((_, i) => i !== index);
                                        setSettings({ ...settings, menuItems: newMenu });
                                    }}
                                >
                                    <Trash className="h-4 w-4" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Hero Section */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="flex items-center justify-between">
                        <div className="space-y-1">
                            <h3 className="text-xl font-black uppercase tracking-tight">Hero Display</h3>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Single image vs Carousel</p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Carousel</span>
                            <Switch
                                checked={settings.useHeroCarousel}
                                onCheckedChange={(val) => setSettings({ ...settings, useHeroCarousel: val })}
                            />
                        </div>
                    </div>

                    {!settings.useHeroCarousel ? (
                        <div className="space-y-4">
                            <Label className="text-[10px] uppercase tracking-widest text-muted-foreground">Main Hero Image</Label>
                            <div
                                className="aspect-video rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                                onClick={() => document.getElementById('homeHeroInput')?.click()}
                            >
                                {homePreview ? (
                                    <img src={homePreview} alt="Hero" className="w-full h-full object-cover" />
                                ) : (
                                    <Upload className="h-8 w-8 text-muted-foreground/30" />
                                )}
                            </div>
                            <input id="homeHeroInput" type="file" hidden onChange={(e) => {
                                if (e.target.files?.[0]) {
                                    const file = e.target.files[0];
                                    setHomeFile(file);
                                    setHomePreview(URL.createObjectURL(file));
                                }
                            }} />
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">
                                Recommended: 1920x1080px or 16:9 aspect ratio.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {carouselPreviews.map((p, i) => (
                                    <div key={i} className="aspect-video rounded-xl overflow-hidden relative group border border-white/5">
                                        <img src={p} alt={`Slide ${i}`} className="w-full h-full object-cover" />
                                        <button
                                            type="button"
                                            onClick={() => {
                                                const np = carouselPreviews.filter((_, idx) => idx !== i);
                                                const nu = settings.homeCarousel.filter((_, idx) => idx !== i);
                                                setCarouselPreviews(np);
                                                setSettings({ ...settings, homeCarousel: nu });
                                            }}
                                            className="absolute top-2 right-2 p-1.5 rounded-full bg-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                        >
                                            <Trash className="h-3 w-3 text-white" />
                                        </button>
                                    </div>
                                ))}
                                <Button
                                    type="button"
                                    variant="outline"
                                    className="aspect-video flex flex-col gap-2 rounded-xl"
                                    onClick={() => document.getElementById('carouselInput')?.click()}
                                >
                                    <Plus className="h-6 w-6" />
                                    <span className="text-[10px] uppercase tracking-widest">Add Slide</span>
                                </Button>
                            </div>
                            <input id="carouselInput" type="file" multiple hidden onChange={(e) => {
                                if (e.target.files) {
                                    const files = Array.from(e.target.files);
                                    setCarouselFiles(prev => [...prev, ...files]);
                                    setCarouselPreviews(prev => [...prev, ...files.map(f => URL.createObjectURL(f))]);
                                }
                            }} />
                        </div>
                    )}
                </div>

                {/* Global Size Guide */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">Global Size Guide</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Appears on all products by default</p>
                    </div>
                    <div
                        className="aspect-[4/3] rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => document.getElementById('sizeGuideInput')?.click()}
                    >
                        {sizeGuidePreview ? (
                            <img src={sizeGuidePreview} alt="Size Guide" className="w-full h-full object-contain" />
                        ) : (
                            <Upload className="h-8 w-8 text-muted-foreground/30" />
                        )}
                    </div>
                    <input id="sizeGuideInput" type="file" hidden onChange={(e) => {
                        if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            setSizeGuideFile(file);
                            setSizeGuidePreview(URL.createObjectURL(file));
                        }
                    }} />
                </div>

                {/* Karungali Mala Hero */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">Karungali Mala Hero</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Image for specialty collection</p>
                    </div>
                    <div
                        className="aspect-video rounded-2xl overflow-hidden border border-white/5 flex items-center justify-center cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => document.getElementById('karungaliHeroInput')?.click()}
                    >
                        {karungaliPreview ? (
                            <img src={karungaliPreview} alt="Karungali" className="w-full h-full object-cover" />
                        ) : (
                            <Upload className="h-8 w-8 text-muted-foreground/30" />
                        )}
                    </div>
                    <input id="karungaliHeroInput" type="file" hidden onChange={(e) => {
                        if (e.target.files?.[0]) {
                            const file = e.target.files[0];
                            setKarungaliFile(file);
                            setKarungaliPreview(URL.createObjectURL(file));
                        }
                    }} />
                </div>

                {/* Seasonal Themes */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <h3 className="text-xl font-black uppercase tracking-tight text-primary">Seasonal Themes</h3>
                    <div className="grid gap-4">
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                            <Label className="text-[10px] font-black uppercase tracking-widest">Christmas Mode</Label>
                            <Switch checked={settings.christmasMode} onCheckedChange={(v) => setSettings({ ...settings, christmasMode: v })} />
                        </div>
                        <div className="flex items-center justify-between p-4 rounded-2xl bg-white/5">
                            <Label className="text-[10px] font-black uppercase tracking-widest">New Year Mode</Label>
                            <Switch checked={settings.newYearMode} onCheckedChange={(v) => setSettings({ ...settings, newYearMode: v })} />
                        </div>
                    </div>
                </div>

                {/* Social Links */}
                <div className="border p-8 rounded-2xl bg-card space-y-6">
                    <h2 className="text-xl font-bold uppercase tracking-tight">Social Links</h2>
                    <div className="space-y-4">
                        <Input value={settings.facebook} onChange={(e) => setSettings({ ...settings, facebook: e.target.value })} placeholder="Facebook URL" />
                        <Input value={settings.instagram} onChange={(e) => setSettings({ ...settings, instagram: e.target.value })} placeholder="Instagram URL" />
                    </div>
                </div>

                <div className="space-y-4">
                    <Button type="submit" className="w-full h-14 rounded-xl text-lg font-black uppercase tracking-[0.2em]" disabled={saving}>
                        {saving ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
                        {saving ? "Saving..." : "Save Configuration"}
                    </Button>
                    {saveStatus && <p className="text-center text-xs font-bold uppercase tracking-widest text-primary animate-pulse">{saveStatus}</p>}
                </div>
            </form>
        </div>
    );
}
