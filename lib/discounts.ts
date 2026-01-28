import { db } from "./firebase";
import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    query,
    where
} from "firebase/firestore";

export interface Discount {
    id: string;
    code: string;
    type: 'percentage' | 'fixed';
    value: number;
    minPurchase?: number;
    usageLimit?: number;
    usedCount: number;
    expiryDate?: number;
    active: boolean;
}

export async function createDiscount(discount: Omit<Discount, "id" | "usedCount">) {
    const code = discount.code.toUpperCase();
    const newDocRef = doc(collection(db, "discounts"));
    await setDoc(newDocRef, {
        ...discount,
        code,
        usedCount: 0,
        createdAt: Date.now()
    });
    return newDocRef.id;
}

export async function validateDiscount(code: string, cartTotal: number): Promise<Discount | null> {
    const discountsRef = collection(db, "discounts");
    const q = query(discountsRef, where("code", "==", code.toUpperCase()), where("active", "==", true));
    const snapshot = await getDocs(q);

    if (snapshot.empty) return null;

    const discount = { id: snapshot.docs[0].id, ...snapshot.docs[0].data() } as Discount;

    // Check expiry
    if (discount.expiryDate && discount.expiryDate < Date.now()) return null;

    // Check usage limit
    if (discount.usageLimit && discount.usedCount >= discount.usageLimit) return null;

    // Check minimum purchase
    if (discount.minPurchase && cartTotal < discount.minPurchase) return null;

    return discount;
}

export async function incrementDiscountUsage(id: string) {
    const docRef = doc(db, "discounts", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        const currentCount = snapshot.data().usedCount || 0;
        await setDoc(docRef, { usedCount: currentCount + 1 }, { merge: true });
    }
}
