"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Trash, Loader2 } from "lucide-react";
import { deleteProduct } from "@/lib/db";
import { useRouter } from "next/navigation";

export function DeleteProductButton({
    productId,
    productName,
    redirectUrl = "/admin/products"
}: {
    productId: string;
    productName: string;
    redirectUrl?: string
}) {
    const [deleting, setDeleting] = useState(false);
    const router = useRouter();

    const handleDelete = async () => {
        if (!confirm(`Are you sure you want to delete "${productName}"? This action cannot be undone.`)) {
            return;
        }

        setDeleting(true);
        try {
            await deleteProduct(productId);
            if (redirectUrl) {
                router.push(redirectUrl);
            }
            router.refresh();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete product.");
        } finally {
            setDeleting(false);
        }
    };

    return (
        <Button
            variant="ghost"
            size="icon"
            onClick={handleDelete}
            disabled={deleting}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
        >
            {deleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash className="h-4 w-4" />}
        </Button>
    );
}
