import { db } from "@/lib/firebase";
import { format } from "date-fns";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowUpRight, DollarSign, Users, Package, ShoppingBag } from "lucide-react";
import { getAllOrders, getAllProducts } from "@/lib/db";
import { collection, getDocs } from "firebase/firestore";

export const dynamic = 'force-dynamic';

export default async function AdminDashboard() {
    const orders = await getAllOrders();
    const products = await getAllProducts();

    // Fetch users count manually since we don't have a helper for all users yet
    const usersSnapshot = await getDocs(collection(db, "users"));
    const usersCount = usersSnapshot.size;

    const totalRevenue = orders.reduce((acc, order) => acc + (order.totalAmount || 0), 0);
    const activeOrders = orders.filter(o => o.status !== 'cancelled' && o.status !== 'completed').length;

    // Report Logic: Sales Trends (Last 7 Days)
    const last7Days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return format(d, 'MMM dd');
    }).reverse();

    const salesPerDay = last7Days.map(dayStr => {
        const dayTotal = orders
            .filter(o => format(new Date(o.createdAt), 'MMM dd') === dayStr)
            .reduce((acc, o) => acc + (o.totalAmount || 0), 0);
        return { day: dayStr, total: dayTotal };
    });

    const maxSales = Math.max(...salesPerDay.map(s => s.total), 1);

    // Report Logic: Top Selling Products
    const productSalesCount: Record<string, number> = {};
    orders.forEach(order => {
        (order.items || []).forEach(item => {
            productSalesCount[item.name] = (productSalesCount[item.name] || 0) + (item.quantity || 1);
        });
    });

    const topProducts = Object.entries(productSalesCount)
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

    return (
        <div className="space-y-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-4xl font-black uppercase tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground uppercase text-[10px] font-bold tracking-widest mt-1">Real-time overview of your store's performance.</p>
                </div>
                <Link href="/admin/orders">
                    <Button variant="outline" className="h-12 rounded-xl border-white/10 font-bold uppercase text-[10px] tracking-widest">
                        View All Orders <ArrowUpRight className="ml-2 h-4 w-4" />
                    </Button>
                </Link>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {/* Stats Cards */}
                <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <DollarSign className="h-3 w-3 text-green-500" /> Total Revenue
                    </p>
                    <p className="text-4xl font-black tracking-tighter">${totalRevenue.toFixed(2)}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <ShoppingBag className="h-3 w-3 text-blue-500" /> Active Orders
                    </p>
                    <p className="text-4xl font-black tracking-tighter">{activeOrders}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Package className="h-3 w-3 text-purple-500" /> Total Products
                    </p>
                    <p className="text-4xl font-black tracking-tighter">{products.length}</p>
                </div>
                <div className="p-6 rounded-2xl bg-card border border-white/10 space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-widest text-muted-foreground flex items-center gap-2">
                        <Users className="h-3 w-3 text-orange-500" /> Customers
                    </p>
                    <p className="text-4xl font-black tracking-tighter">{usersCount}</p>
                </div>
            </div>

            <div className="grid gap-8 lg:grid-cols-2">
                {/* Sales Trend Chart */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">Sales Trend</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Last 7 days performance</p>
                    </div>

                    <div className="h-60 flex items-end justify-between gap-4">
                        {salesPerDay.map((s, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center gap-4">
                                <div className="w-full relative group">
                                    <div
                                        className="w-full bg-primary/20 hover:bg-primary/40 transition-all rounded-t-xl relative group"
                                        style={{ height: `${(s.total / maxSales) * 100}%`, minHeight: '4px' }}
                                    >
                                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 px-2 py-1 rounded text-[10px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-20">
                                            ${s.total.toFixed(0)}
                                        </div>
                                    </div>
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-tighter text-muted-foreground rotate-[-45deg] whitespace-nowrap mt-2">
                                    {s.day}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Top Selling Products */}
                <div className="p-8 rounded-3xl bg-card border border-white/10 space-y-8">
                    <div className="space-y-1">
                        <h3 className="text-xl font-black uppercase tracking-tight">Top Products</h3>
                        <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest">Most popular items by volume</p>
                    </div>

                    <div className="space-y-4">
                        {topProducts.map((p, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                <div className="flex items-center gap-4">
                                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center text-xs font-black text-primary">
                                        #{i + 1}
                                    </div>
                                    <span className="font-bold text-sm uppercase tracking-tight line-clamp-1">{p.name}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <span className="text-lg font-black tracking-tighter">{p.count}</span>
                                    <span className="text-[10px] font-bold text-muted-foreground uppercase uppercase tracking-widest">Sold</span>
                                </div>
                            </div>
                        ))}
                        {topProducts.length === 0 && (
                            <div className="h-40 flex items-center justify-center text-muted-foreground text-[10px] font-bold uppercase tracking-widest">
                                No sales data yet.
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
