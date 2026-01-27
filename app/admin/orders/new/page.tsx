"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getAllProducts, createOrder } from "@/lib/db";
import { Product, Order } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Trash, Loader2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { toast } from "sonner";

export default function ManualOrderPage() {
    const router = useRouter();
    const [products, setProducts] = useState<Product[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [orderData, setOrderData] = useState({
        customerEmail: "",
        firstName: "",
        lastName: "",
        line1: "",
        line2: "",
        city: "",
        state: "",
        postalCode: "",
        country: "Australia",
        items: [] as any[],
    });

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

    const addItem = () => {
        setOrderData(prev => ({
            ...prev,
            items: [...prev.items, { productId: "", quantity: 1, size: "", color: "", beadSize: "" }]
        }));
    };

    const removeItem = (index: number) => {
        setOrderData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
        }));
    };

    const updateItem = (index: number, updates: any) => {
        setOrderData(prev => ({
            ...prev,
            items: prev.items.map((item, i) => i === index ? { ...item, ...updates } : item)
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (orderData.items.length === 0) return toast.error("Add at least one item");

        setSaving(true);
        try {
            const formattedItems = orderData.items.map(item => {
                const product = products.find(p => p.id === item.productId);
                return {
                    productId: item.productId,
                    cartId: `${item.productId}-${Date.now()}`,
                    name: product?.name || "Product",
                    price: product?.price || 0,
                    image: product?.images[0] || "",
                    quantity: item.quantity,
                    size: item.size,
                    color: item.color,
                    beadSize: item.beadSize,
                };
            });

            const total = formattedItems.reduce((acc, item) => acc + item.price * item.quantity, 0);

            const order: Omit<Order, "id" | "orderNumber"> = {
                userId: "manual",
                stripeSessionId: "manual",
                items: formattedItems,
                totalAmount: total,
                status: "pending",
                shippingAddress: {
                    line1: orderData.line1,
                    line2: orderData.line2,
                    city: orderData.city,
                    state: orderData.state,
                    postalCode: orderData.postalCode,
                    country: orderData.country,
                },
                createdAt: Date.now(),
            };

            await createOrder(order);
            toast.success("Order created successfully");
            router.push("/admin/orders");
        } catch (err) {
            console.error(err);
            toast.error("Failed to create order");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin" /></div>;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="flex items-center gap-4">
                <Link href="/admin/orders">
                    <Button variant="ghost" size="icon">
                        <ArrowLeft className="h-4 w-4" />
                    </Button>
                </Link>
                <h1 className="text-3xl font-bold">Create Manual Order</h1>
            </div>

            <form onSubmit={handleSubmit} className="space-y-8">
                <div className="bg-card p-6 rounded-xl border space-y-4">
                    <h2 className="text-xl font-bold">Customer Details</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>First Name</Label>
                            <Input required value={orderData.firstName} onChange={e => setOrderData({ ...orderData, firstName: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Last Name</Label>
                            <Input required value={orderData.lastName} onChange={e => setOrderData({ ...orderData, lastName: e.target.value })} />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label>Email</Label>
                        <Input type="email" required value={orderData.customerEmail} onChange={e => setOrderData({ ...orderData, customerEmail: e.target.value })} />
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border space-y-4">
                    <h2 className="text-xl font-bold">Shipping Address</h2>
                    <div className="space-y-2">
                        <Label>Address Line 1</Label>
                        <Input required value={orderData.line1} onChange={e => setOrderData({ ...orderData, line1: e.target.value })} />
                    </div>
                    <div className="space-y-2">
                        <Label>Address Line 2</Label>
                        <Input value={orderData.line2} onChange={e => setOrderData({ ...orderData, line2: e.target.value })} />
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label>City</Label>
                            <Input required value={orderData.city} onChange={e => setOrderData({ ...orderData, city: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>State</Label>
                            <Input required value={orderData.state} onChange={e => setOrderData({ ...orderData, state: e.target.value })} />
                        </div>
                        <div className="space-y-2">
                            <Label>Postal Code</Label>
                            <Input required value={orderData.postalCode} onChange={e => setOrderData({ ...orderData, postalCode: e.target.value })} />
                        </div>
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl border space-y-6">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Order Items</h2>
                        <Button type="button" onClick={addItem} variant="outline" size="sm">
                            <Plus className="h-4 w-4 mr-2" /> Add Item
                        </Button>
                    </div>

                    <div className="space-y-4">
                        {orderData.items.map((item, idx) => (
                            <div key={idx} className="flex gap-4 items-end border-b pb-4">
                                <div className="flex-1 space-y-2">
                                    <Label>Product</Label>
                                    <select
                                        className="w-full h-10 px-3 bg-background border rounded-md"
                                        value={item.productId}
                                        onChange={e => updateItem(idx, { productId: e.target.value })}
                                        required
                                    >
                                        <option value="">Select Product...</option>
                                        {products.map(p => (
                                            <option key={p.id} value={p.id}>{p.name} - ${p.price}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="w-24 space-y-2">
                                    <Label>Qty</Label>
                                    <Input type="number" min="1" value={item.quantity} onChange={e => updateItem(idx, { quantity: parseInt(e.target.value) })} />
                                </div>
                                <div className="w-32 space-y-2">
                                    <Label>Variant</Label>
                                    <Input placeholder="Size/Color" value={item.size || item.beadSize} onChange={e => updateItem(idx, { size: e.target.value })} />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeItem(idx)}>
                                    <Trash className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>
                </div>

                <Button className="w-full h-14 text-lg font-bold" disabled={saving}>
                    {saving ? "Creating Order..." : "Create Order"}
                </Button>
            </form>
        </div>
    );
}
