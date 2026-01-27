"use client";

import { useEffect, useState } from "react";
import { getAllUsers, updateUserProfile } from "@/lib/db";
import { UserProfile } from "@/lib/types";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Search,
    Edit,
    Loader2,
    Save,
    X,
    UserCircle,
    Phone,
    Mail,
    MapPin
} from "lucide-react";
import { toast } from "sonner";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

export default function AdminCustomersPage() {
    const [users, setUsers] = useState<UserProfile[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [editingUser, setEditingUser] = useState<UserProfile | null>(null);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        setLoading(true);
        try {
            const data = await getAllUsers();
            setUsers(data.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0)));
        } catch (err) {
            console.error("Error fetching users:", err);
            toast.error("Failed to load customers");
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;

        setSaving(true);
        try {
            await updateUserProfile(editingUser.uid, editingUser);
            setUsers(prev => prev.map(u => u.uid === editingUser.uid ? editingUser : u));
            toast.success("Customer profile updated successfully");
            setEditingUser(null);
        } catch (err) {
            toast.error("Failed to update customer");
        } finally {
            setSaving(false);
        }
    };

    const filteredUsers = users.filter(u =>
    (u.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        u.phoneNumber?.toLowerCase().includes(searchQuery.toLowerCase()))
    );

    if (loading) return (
        <div className="flex h-screen items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
    );

    return (
        <div className="space-y-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Customers</h1>
                    <p className="text-muted-foreground mt-1">Manage user profiles and contact information.</p>
                </div>
                <Badge variant="secondary" className="text-base px-4 py-2 w-fit">
                    {users.length} Total Registered
                </Badge>
            </div>

            <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                    placeholder="Search by name, email, or phone..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            <div className="rounded-2xl border bg-card overflow-hidden">
                <Table>
                    <TableHeader className="bg-muted/50">
                        <TableRow>
                            <TableHead>Customer</TableHead>
                            <TableHead>Contact Info</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredUsers.map((user) => (
                            <TableRow key={user.uid} className="hover:bg-muted/30 transition-colors">
                                <TableCell>
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-primary font-bold text-lg">
                                            {(user.displayName || user.email || "?")[0].toUpperCase()}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="font-bold tracking-tight">{user.displayName || "Not set"}</span>
                                            <span className="text-[10px] uppercase tracking-widest text-muted-foreground">UID: {user.uid.slice(0, 8)}...</span>
                                        </div>
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <div className="flex flex-col gap-1">
                                        <div className="flex items-center gap-1.5 text-xs">
                                            <Mail className="h-3 w-3 text-muted-foreground" />
                                            {user.email}
                                        </div>
                                        {user.phoneNumber && (
                                            <div className="flex items-center gap-1.5 text-xs font-bold text-primary">
                                                <Phone className="h-3 w-3" />
                                                {user.phoneNumber}
                                            </div>
                                        )}
                                    </div>
                                </TableCell>
                                <TableCell>
                                    <Badge variant={user.role === 'admin' ? "default" : "secondary"} className="capitalize font-black text-[10px] tracking-widest px-2">
                                        {user.role}
                                    </Badge>
                                </TableCell>
                                <TableCell className="text-xs text-muted-foreground font-medium">
                                    {user.createdAt ? new Date(user.createdAt).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : 'N/A'}
                                </TableCell>
                                <TableCell className="text-right">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => setEditingUser(user)}
                                        className="h-9 w-9 rounded-xl hover:bg-primary/10 hover:text-primary"
                                    >
                                        <Edit className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                        {filteredUsers.length === 0 && (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-20 text-muted-foreground italic tracking-wide">
                                    No customers match your search criteria.
                                </TableCell>
                            </TableRow>
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Edit User Modal */}
            <Dialog open={!!editingUser} onOpenChange={(open: boolean) => !open && setEditingUser(null)}>
                <DialogContent className="max-w-xl p-0 overflow-hidden rounded-3xl border-white/10 bg-zinc-950">
                    <form onSubmit={handleUpdateUser}>
                        <div className="p-8 space-y-8">
                            <DialogHeader>
                                <div className="flex items-center gap-4 mb-2">
                                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary font-bold text-xl border border-primary/20">
                                        {(editingUser?.displayName || editingUser?.email || "?")[0].toUpperCase()}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-2xl font-black uppercase tracking-tight italic">Edit Profile</DialogTitle>
                                        <DialogDescription className="text-[10px] uppercase tracking-widest font-bold text-muted-foreground">
                                            Update information for {editingUser?.email}
                                        </DialogDescription>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="grid gap-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-name" className="text-[10px] uppercase tracking-widest font-bold">Display Name</Label>
                                        <Input
                                            id="edit-name"
                                            value={editingUser?.displayName || ""}
                                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, displayName: e.target.value } : null)}
                                            placeholder="John Doe"
                                            className="bg-white/5 border-white/10 h-11"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="edit-phone" className="text-[10px] uppercase tracking-widest font-bold">Phone Number</Label>
                                        <Input
                                            id="edit-phone"
                                            value={editingUser?.phoneNumber || ""}
                                            onChange={(e) => setEditingUser(prev => prev ? { ...prev, phoneNumber: e.target.value } : null)}
                                            placeholder="+61 400 000 000"
                                            className="bg-white/5 border-white/10 h-11"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-[10px] uppercase tracking-widest font-bold">Address Information</Label>
                                    <div className="grid gap-3 p-4 rounded-2xl bg-white/5 border border-white/10">
                                        <Input
                                            value={editingUser?.address?.line1 || ""}
                                            onChange={(e) => setEditingUser(prev => {
                                                if (!prev) return null;
                                                return { ...prev, address: { ...(prev.address || { city: '', state: '', postalCode: '', country: 'Australia' }), line1: e.target.value } as any };
                                            })}
                                            placeholder="Street Address Line 1"
                                            className="bg-white/5 border-white/5 h-10 text-sm"
                                        />
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                value={editingUser?.address?.city || ""}
                                                onChange={(e) => setEditingUser(prev => {
                                                    if (!prev) return null;
                                                    return { ...prev, address: { ...(prev.address || { line1: '', state: '', postalCode: '', country: 'Australia' }), city: e.target.value } as any };
                                                })}
                                                placeholder="City"
                                                className="bg-white/5 border-white/5 h-10 text-sm"
                                            />
                                            <Input
                                                value={editingUser?.address?.state || ""}
                                                onChange={(e) => setEditingUser(prev => {
                                                    if (!prev) return null;
                                                    return { ...prev, address: { ...(prev.address || { line1: '', city: '', postalCode: '', country: 'Australia' }), state: e.target.value } as any };
                                                })}
                                                placeholder="State"
                                                className="bg-white/5 border-white/5 h-10 text-sm"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                value={editingUser?.address?.postalCode || ""}
                                                onChange={(e) => setEditingUser(prev => {
                                                    if (!prev) return null;
                                                    return { ...prev, address: { ...(prev.address || { line1: '', city: '', state: '', country: 'Australia' }), postalCode: e.target.value } as any };
                                                })}
                                                placeholder="Postcode"
                                                className="bg-white/5 border-white/5 h-10 text-sm"
                                            />
                                            <Input
                                                value={editingUser?.address?.country || "Australia"}
                                                onChange={(e) => setEditingUser(prev => {
                                                    if (!prev) return null;
                                                    return { ...prev, address: { ...(prev.address || { line1: '', city: '', state: '', postalCode: '' }), country: e.target.value } as any };
                                                })}
                                                placeholder="Country"
                                                className="bg-white/5 border-white/5 h-10 text-sm"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex items-center gap-3 p-6 bg-zinc-900/50 border-t border-white/5">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 h-12 rounded-xl uppercase tracking-widest font-bold text-[10px]"
                                onClick={() => setEditingUser(null)}
                            >
                                <X className="h-4 w-4 mr-2" /> Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-[2] h-12 rounded-xl uppercase tracking-widest font-black italic bg-primary hover:scale-[1.02] active:scale-[0.98] transition-all"
                                disabled={saving}
                            >
                                {saving ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Save className="h-4 w-4 mr-2" />}
                                Save Profile Changes
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    );
}
