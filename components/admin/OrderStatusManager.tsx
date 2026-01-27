"use client";

import { useState } from "react";
import { Order } from "@/lib/types";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { updateOrderStatus } from "@/lib/db";
import { useRouter } from "next/navigation";
import { Loader2, Check, Save } from "lucide-react";

interface OrderStatusManagerProps {
    order: Order;
}

export function OrderStatusManager({ order }: OrderStatusManagerProps) {
    const [status, setStatus] = useState<Order["status"]>(order.status);
    const [notify, setNotify] = useState(false);
    const [loading, setLoading] = useState(false);
    const [saved, setSaved] = useState(false);
    const router = useRouter();

    const handleSave = async () => {
        setLoading(true);
        setSaved(false);
        try {
            // Update in DB
            await updateOrderStatus(order.id, status);

            // Handle optional email notification
            if (notify) {
                // We'll call an API route to handle email sending from server
                await fetch("/api/admin/notify-status-update", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        orderId: order.id,
                        status: status,
                    }),
                });
            }

            setSaved(true);
            router.refresh();
            // Reset saved icon after 3 seconds
            setTimeout(() => setSaved(false), 3000);
        } catch (err) {
            console.error("Failed to update status:", err);
            alert("Error saving status update.");
        } finally {
            setLoading(false);
        }
    };

    const hasChanged = status !== order.status;

    return (
        <div className="flex flex-col gap-3">
            <div className="flex items-center gap-2">
                <Select value={status} onValueChange={(value) => setStatus(value as Order["status"])}>
                    <SelectTrigger className="w-[140px] h-9">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="processing">Processing</SelectItem>
                        <SelectItem value="shipped">Shipped</SelectItem>
                        <SelectItem value="delivered">Delivered</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                    </SelectContent>
                </Select>

                <Button
                    size="sm"
                    variant={saved ? "outline" : "default"}
                    className="h-9 w-9 p-0"
                    onClick={handleSave}
                    disabled={loading || (!hasChanged && !saved)}
                >
                    {loading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : saved ? (
                        <Check className="h-4 w-4 text-green-500" />
                    ) : (
                        <Save className="h-4 w-4" />
                    )}
                </Button>
            </div>

            <div className="flex items-center space-x-2">
                <Checkbox
                    id={`notify-${order.id}`}
                    checked={notify}
                    onCheckedChange={(checked) => setNotify(checked as boolean)}
                />
                <Label
                    htmlFor={`notify-${order.id}`}
                    className="text-[10px] uppercase font-bold text-muted-foreground cursor-pointer leading-none"
                >
                    Notify Customer
                </Label>
            </div>
        </div>
    );
}
