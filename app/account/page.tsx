"use client";

import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Loader2, Package, User, Mail, Calendar } from "lucide-react";
import Link from "next/link";

export default function AccountPage() {
    const { user, profile, loading } = useAuth();

    if (loading) {
        return (
            <div className="flex h-screen items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center h-screen space-y-4">
                <h1 className="text-2xl font-bold">Please sign in to view your account</h1>
                <Link href="/login">
                    <Button>Sign In</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto py-20 px-4 md:px-8 space-y-12">
            <div className="space-y-4">
                <h1 className="text-4xl font-black uppercase tracking-tighter">My Account</h1>
                <p className="text-muted-foreground uppercase text-xs tracking-widest font-bold">Manage your profile and track orders</p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
                {/* Profile Card */}
                <div className="md:col-span-1 space-y-6">
                    <div className="p-8 border rounded-[2rem] bg-card space-y-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-10 w-10 text-primary" />
                            </div>
                            <div>
                                <h3 className="text-xl font-bold capitalize">{profile?.firstName} {profile?.lastName}</h3>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <div className="space-y-4 pt-4 border-t">
                            <div className="flex items-center gap-3 text-sm">
                                <Mail className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-muted-foreground">{user.email}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm">
                                <Calendar className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-muted-foreground capitalize">Role: {profile?.role || 'Customer'}</span>
                            </div>
                        </div>

                        {profile?.role === 'admin' && (
                            <Link href="/admin" className="block pt-4">
                                <Button variant="outline" className="w-full">Admin Dashboard</Button>
                            </Link>
                        )}
                    </div>
                </div>

                {/* Orders Section */}
                <div className="md:col-span-2 space-y-6">
                    <div className="p-8 border rounded-[2rem] bg-card min-h-[400px] flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-bold uppercase tracking-tight flex items-center gap-2">
                                <Package className="h-6 w-6 text-primary" />
                                Order History
                            </h2>
                        </div>

                        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                            <Package className="h-12 w-12" />
                            <div>
                                <h3 className="font-bold uppercase text-sm tracking-widest">No orders yet</h3>
                                <p className="text-xs">Once you make a purchase, your orders will appear here.</p>
                            </div>
                            <Link href="/products">
                                <Button variant="link" className="text-primary font-bold uppercase text-xs tracking-widest">Start Shopping</Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
