import { getAllOrders } from "@/lib/db";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { OrderStatusManager } from "@/components/admin/OrderStatusManager";

export const dynamic = 'force-dynamic';

export default async function AdminOrdersPage() {
    const orders = await getAllOrders();

    // Sort by most recent first
    const sortedOrders = orders.sort((a, b) => b.createdAt - a.createdAt);

    return (
        <div className="space-y-6" suppressHydrationWarning>
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold tracking-tight">Orders</h1>
                <div className="flex gap-2">
                    <Link href="/admin/orders/new">
                        <Button className="font-bold">
                            <Plus className="h-4 w-4 mr-2" /> Create Manual Order
                        </Button>
                    </Link>
                    <Badge variant="secondary" className="text-base px-4 py-2">
                        {orders.length} Total
                    </Badge>
                </div>
            </div>

            <div className="rounded-md border bg-card overflow-hidden">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Order Number</TableHead>
                            <TableHead>Customer</TableHead>
                            <TableHead>Items</TableHead>
                            <TableHead>Total</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {sortedOrders.map((order) => (
                            <TableRow key={order.id}>
                                <TableCell className="font-mono font-semibold">
                                    {order.orderNumber || `ORD-${order.id.slice(0, 4)}`}
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span className="font-medium">{order.shippingAddress.line1}</span>
                                        <span className="text-sm text-muted-foreground">
                                            {order.shippingAddress.city}, {order.shippingAddress.state}
                                        </span>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        {order.items.slice(0, 2).map((item, idx) => (
                                            <span key={idx} className="text-sm">
                                                {item.quantity}x {item.name}
                                                {item.size && ` (${item.size})`}
                                            </span>
                                        ))}
                                        {order.items.length > 2 && (
                                            <span className="text-xs text-muted-foreground">
                                                +{order.items.length - 2} more
                                            </span>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell className="font-semibold">
                                    ${order.totalAmount.toFixed(2)}
                                </TableCell>
                                <TableCell>
                                    <OrderStatusManager order={order} />
                                </TableCell>
                                <TableCell className="text-sm text-muted-foreground">
                                    {new Date(order.createdAt).toLocaleDateString()}
                                </TableCell>
                                <TableCell>
                                    <a
                                        href={`/api/invoices/${order.id}`}
                                        download
                                        className="text-sm text-primary hover:underline"
                                    >
                                        Invoice
                                    </a>
                                </TableCell>
                            </TableRow>
                        ))}
                        {sortedOrders.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                                    No orders yet.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}
