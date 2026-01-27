"use client";

import { useEffect, useState } from "react";
import { collection, getDocs, deleteDoc, doc, setDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash, Plus, Loader2, Zap } from "lucide-react";
import { Discount, createDiscount } from "@/lib/discounts";
import { toast } from "sonner";
import Link from "next/link";

export default function AdminDiscountsPage() {
    const [discounts, setDiscounts] = useState<Discount[]>([]);
    const [loading, setLoading] = useState(true);
    const [creating, setCreating] = useState(false);

    const [formData, setFormData] = useState({
        code: "",
        type: "percentage" as "percentage" | "fixed",
        value: "",
        minPurchase: "",
        usageLimit: "",
        expiryDate: "",
    });

    useEffect(() => {
        fetchDiscounts();
    }, []);

    const fetchDiscounts = async () => {
        setLoading(true);
        try {
            const snap = await getDocs(collection(db, "discounts"));
            const list = snap.docs.map(doc => ({ id: doc.id, ...doc.data() } as Discount));
            setDiscounts(list);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        try {
            await createDiscount({
                code: formData.code.toUpperCase(),
                type: formData.type,
                value: parseFloat(formData.value),
                minPurchase: formData.minPurchase ? parseFloat(formData.minPurchase) : undefined,
                usageLimit: formData.usageLimit ? parseInt(formData.usageLimit) : undefined,
                expiryDate: formData.expiryDate ? new Date(formData.expiryDate).getTime() : undefined,
                active: true,
            });
            toast.success("Discount created successfully");
            setFormData({ code: "", type: "percentage", value: "", minPurchase: "", usageLimit: "", expiryDate: "" });
            fetchDiscounts();
        } catch (err) {
            console.error(err);
            toast.error("Failed to create discount");
        } finally {
            setCreating(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Delete this discount?")) return;
        try {
            await deleteDoc(doc(db, "discounts", id));
            toast.success("Discount deleted");
            fetchDiscounts();
        } catch (err) {
            toast.error("Failed to delete discount");
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-3xl font-bold tracking-tighter uppercase">Discount <span className="text-primary italic">Codes</span></h1>
                <Link href="/admin/discounts/bulk">
                    <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary hover:text-white">
                        <Zap className="h-4 w-4 mr-2" /> Bulk Discounts
                    </Button>
                </Link>
            </div>

            <div className="grid gap-8 lg:grid-cols-3">
                <form onSubmit={handleSubmit} className="lg:col-span-1 space-y-4 border p-6 rounded-xl bg-card">
                    <h2 className="text-xl font-bold">Create New</h2>
                    <div className="space-y-2">
                        <Label>Code</Label>
                        <Input
                            value={formData.code}
                            onChange={e => setFormData({ ...formData, code: e.target.value })}
                            placeholder="SAVE20"
                            required
                        />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Type</Label>
                            <select
                                className="w-full h-10 px-3 bg-background border rounded-md"
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value as any })}
                            >
                                <option value="percentage">Percentage (%)</option>
                                <option value="fixed">Fixed Amount ($)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label>Value</Label>
                            <Input
                                type="number"
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                                placeholder="20"
                                required
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Min. Purchase ($)</Label>
                        <Input
                            type="number"
                            value={formData.minPurchase}
                            onChange={e => setFormData({ ...formData, minPurchase: e.target.value })}
                            placeholder="50"
                        />
                    </div>
                    <div className="space-y-2">
                        <Label>Expiry Date</Label>
                        <Input
                            type="date"
                            value={formData.expiryDate}
                            onChange={e => setFormData({ ...formData, expiryDate: e.target.value })}
                        />
                    </div>
                    <Button className="w-full" disabled={creating}>
                        {creating ? "Creating..." : "Create Discount"}
                    </Button>
                </form>

                <div className="lg:col-span-2 space-y-4">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Code</TableHead>
                                <TableHead>Value</TableHead>
                                <TableHead>Used</TableHead>
                                <TableHead>Status</TableHead>
                                <TableHead className="text-right">Actions</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {discounts.map(d => (
                                <TableRow key={d.id}>
                                    <TableCell className="font-bold">{d.code}</TableCell>
                                    <TableCell>
                                        {d.type === 'percentage' ? `${d.value}%` : `$${d.value.toFixed(2)}`}
                                    </TableCell>
                                    <TableCell>{d.usedCount} {d.usageLimit ? `/ ${d.usageLimit}` : ""}</TableCell>
                                    <TableCell>
                                        <Badge variant={d.active ? "default" : "secondary"}>
                                            {d.active ? "Active" : "Disabled"}
                                        </Badge>
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button variant="ghost" size="icon" onClick={() => handleDelete(d.id)}>
                                            <Trash className="h-4 w-4 text-red-500" />
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </div>
        </div>
    );
}
