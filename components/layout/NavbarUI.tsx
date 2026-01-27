"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "../../lib/utils";
import { ShoppingBag, User, Menu, X, Sun, Moon, LayoutDashboard, UserCircle, LogOut } from "lucide-react";
import { Button } from "../ui/button";
import { useState, useEffect, useContext } from "react";
import { ThemeContext } from "../../context/ThemeContext";
import { useCart } from "../../context/CartContext";
import { useAuth } from "../../context/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { auth } from "../../lib/firebase";
import { signOut } from "firebase/auth";

interface NavItem {
    label: string;
    href: string;
}

export function NavbarUI({ menuItems }: { menuItems: NavItem[] }) {
    const pathname = usePathname();
    const [mounted, setMounted] = useState(false);
    const [isScrolled, setIsScrolled] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { cartCount: itemsCount } = useCart();
    const { user, profile } = useAuth();

    // Use context directly to avoid "useTheme must be used within a ThemeProvider" error during certain SSR passes
    const themeContext = useContext(ThemeContext);
    const theme = themeContext?.theme || "dark";
    const setTheme = themeContext?.setTheme || (() => { });

    useEffect(() => {
        setMounted(true);
        const handleScroll = () => {
            setIsScrolled(window.scrollY > 20);
        };
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    const isAdmin = pathname.startsWith("/admin");

    if (!mounted) {
        return (
            <nav className={cn(
                "fixed top-0 left-0 right-0 z-50 py-6 bg-transparent border-transparent border-b",
                isAdmin && "bg-background/80 backdrop-blur-md py-4 border-white/5 shadow-sm"
            )}>
                <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between">
                        <div className="h-10 w-32 bg-white/5 animate-pulse rounded-lg" />
                        <div className="hidden md:flex gap-8">
                            {[1, 2, 3, 4, 5].map(i => (
                                <div key={i} className="h-4 w-12 bg-white/5 animate-pulse rounded" />
                            ))}
                        </div>
                        <div className="flex gap-4">
                            <div className="h-10 w-10 bg-white/5 animate-pulse rounded-full" />
                            <div className="h-10 w-10 bg-white/5 animate-pulse rounded-full" />
                        </div>
                    </div>
                </div>
            </nav>
        );
    }

    return (
        <nav
            className={cn(
                "fixed top-0 left-0 right-0 z-50 transition-all duration-300 border-b",
                isScrolled || isAdmin
                    ? "bg-background/80 backdrop-blur-md py-4 border-white/5 shadow-sm"
                    : "bg-transparent py-6 border-transparent"
            )}
        >
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between">
                    {/* Logo */}
                    <Link href="/" className="group flex items-center gap-2" suppressHydrationWarning>
                        <img
                            src="/logo.png"
                            alt="KSWebWear"
                            className="h-10 w-auto brightness-110 contrast-125 transition-transform group-hover:scale-105"
                        />
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-8">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-[10px] font-black uppercase tracking-widest transition-colors hover:text-primary",
                                    pathname === item.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 sm:gap-4">
                        {/* Theme Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="rounded-full hover:bg-accent h-10 w-10 flex items-center justify-center transition-colors"
                            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
                            title={theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
                        >
                            {theme === "dark" ? (
                                <Sun className="h-5 w-5 text-yellow-500 fill-yellow-500" />
                            ) : (
                                <Moon className="h-5 w-5 text-slate-700 fill-slate-700" />
                            )}
                        </Button>

                        {/* User Profile Dropdown */}
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" size="icon" className="group rounded-full hover:bg-accent h-10 w-10">
                                    <User className="h-5 w-5 transition-transform group-hover:scale-110" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-56 mt-2 p-2 rounded-2xl border-white/10 bg-background/95 backdrop-blur-xl shadow-2xl z-[60]">
                                {user ? (
                                    <>
                                        <DropdownMenuLabel className="px-3 py-2">
                                            <div className="flex flex-col">
                                                <span className="text-sm font-bold truncate capitalize">{profile?.firstName || 'User'}</span>
                                                <span className="text-[10px] text-muted-foreground truncate">{user.email}</span>
                                            </div>
                                        </DropdownMenuLabel>
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem asChild>
                                            <Link href="/account" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl hover:bg-accent transition-colors">
                                                <UserCircle className="h-4 w-4" />
                                                <span className="text-xs font-bold uppercase tracking-wider">My Account</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        {(profile?.role === 'admin' || user?.email === 'info.kswebwear@gmail.com') && (
                                            <DropdownMenuItem asChild>
                                                <Link href="/admin" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl hover:bg-accent text-primary transition-colors">
                                                    <LayoutDashboard className="h-4 w-4" />
                                                    <span className="text-xs font-bold uppercase tracking-wider">Admin Dashboard</span>
                                                </Link>
                                            </DropdownMenuItem>
                                        )}
                                        <DropdownMenuSeparator className="bg-white/5" />
                                        <DropdownMenuItem
                                            className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl hover:bg-destructive/10 text-destructive transition-colors"
                                            onClick={() => signOut(auth)}
                                        >
                                            <LogOut className="h-4 w-4" />
                                            <span className="text-xs font-bold uppercase tracking-wider">Log Out</span>
                                        </DropdownMenuItem>
                                    </>
                                ) : (
                                    <>
                                        <DropdownMenuItem asChild>
                                            <Link href="/login" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl hover:bg-accent">
                                                <span className="text-xs font-bold uppercase tracking-wider">Log In</span>
                                            </Link>
                                        </DropdownMenuItem>
                                        <DropdownMenuItem asChild>
                                            <Link href="/signup" className="flex items-center gap-2 px-3 py-2 cursor-pointer rounded-xl hover:bg-primary hover:text-primary-foreground">
                                                <span className="text-xs font-bold uppercase tracking-wider">Sign Up</span>
                                            </Link>
                                        </DropdownMenuItem>
                                    </>
                                )}
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* Cart */}
                        <Button
                            variant="default"
                            size="icon"
                            className="group relative rounded-full h-10 w-10 bg-primary text-primary-foreground shadow-[0_0_20px_rgba(var(--primary-rgb),0.3)] transition-transform hover:scale-105 active:scale-95"
                            onClick={() => {
                                window.dispatchEvent(new CustomEvent('open-cart'));
                            }}
                        >
                            <ShoppingBag className="h-5 w-5 transition-transform group-hover:scale-110" />
                            {itemsCount > 0 && (
                                <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-white text-primary text-[10px] font-black flex items-center justify-center shadow-lg border-2 border-primary">
                                    {itemsCount}
                                </span>
                            )}
                        </Button>

                        {/* Mobile Menu Toggle */}
                        <Button
                            variant="ghost"
                            size="icon"
                            className="md:hidden rounded-full hover:bg-accent"
                            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                        >
                            {isMobileMenuOpen ? (
                                <X className="h-6 w-6" />
                            ) : (
                                <Menu className="h-6 w-6" />
                            )}
                        </Button>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div className="md:hidden absolute top-full left-0 right-0 bg-background/95 backdrop-blur-xl border-b border-white/5 p-6 animate-in slide-in-from-top duration-300 shadow-2xl">
                    <div className="flex flex-col gap-6">
                        {menuItems.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={cn(
                                    "text-sm font-black uppercase tracking-widest py-2 border-b border-white/5",
                                    pathname === item.href
                                        ? "text-primary"
                                        : "text-muted-foreground"
                                )}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                {item.label}
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </nav>
    );
}
