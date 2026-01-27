"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    Package,
    ShoppingBag,
    Settings,
    LogOut,
    Users,
    Tag,
    Palette
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

const sidebarItems = [
    {
        title: "Dashboard",
        href: "/admin",
        icon: LayoutDashboard,
    },
    {
        title: "Designs",
        href: "/admin/designs",
        icon: Palette,
    },
    {
        title: "Products",
        href: "/admin/products",
        icon: Package,
    },
    {
        title: "Orders",
        href: "/admin/orders",
        icon: ShoppingBag,
    },
    {
        title: "Customers",
        href: "/admin/customers",
        icon: Users,
    },
    {
        title: "Discounts",
        href: "/admin/discounts",
        icon: Tag,
    },
    {
        title: "Settings",
        href: "/admin/settings",
        icon: Settings,
    },
];

import { AdminGuard } from "@/components/auth/AdminGuard";

export default function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();

    return (
        <AdminGuard>
            <div className="flex min-h-screen flex-col md:flex-row bg-muted/40">
                {/* Sidebar */}
                <aside className="w-full border-r bg-background md:w-64 md:flex-shrink-0">
                    <div className="flex h-16 items-center border-b px-6">
                        <Link href="/" className="flex items-center gap-2 font-bold text-lg">
                            <span className="text-primary">KSWebWear</span> Admin
                        </Link>
                    </div>
                    <div className="flex flex-col gap-2 p-4">
                        {sidebarItems.map((item) => (
                            <Link key={item.href} href={item.href}>
                                <Button
                                    variant={pathname === item.href ? "secondary" : "ghost"}
                                    className={cn(
                                        "w-full justify-start gap-2",
                                        pathname === item.href && "bg-muted"
                                    )}
                                >
                                    <item.icon className="h-4 w-4" />
                                    {item.title}
                                </Button>
                            </Link>
                        ))}
                        <div className="my-2 border-t" />
                        <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 text-red-500 hover:text-red-600 hover:bg-red-50"
                            onClick={() => {
                                import("@/lib/firebase").then(({ auth }) => auth.signOut());
                            }}
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </Button>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 p-4 md:p-8 pt-24 md:pt-24 overflow-y-auto">
                    {children}
                </main>
            </div>
        </AdminGuard>
    );
}
