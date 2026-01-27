import {
    collection,
    doc,
    getDoc,
    getDocs,
    setDoc,
    deleteDoc,
    query,
    where,
    Timestamp
} from "firebase/firestore";
import { db } from "./firebase";
import { UserProfile, Product, Order, Design, ProductTemplate } from "./types";

// --- Users ---

export async function createUserProfile(user: UserProfile) {
    const userRef = doc(db, "users", user.uid);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
        await setDoc(userRef, {
            ...user,
            createdAt: Timestamp.now().toMillis(),
        });
    }
}

export async function getUserProfile(uid: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", uid);
    const snapshot = await getDoc(userRef);
    if (snapshot.exists()) {
        return snapshot.data() as UserProfile;
    }
    return null;
}

export async function getAllUsers(): Promise<UserProfile[]> {
    const usersRef = collection(db, "users");
    const snapshot = await getDocs(usersRef);
    return snapshot.docs.map(doc => doc.data() as UserProfile);
}

export async function updateUserProfile(uid: string, data: Partial<UserProfile>) {
    const userRef = doc(db, "users", uid);
    await setDoc(userRef, data, { merge: true });
}

// --- Products ---

export async function getFeaturedProducts(): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const q = query(productsRef, where("featured", "==", true), where("inStock", "==", true));
    const snapshot = await getDocs(q);

    // Final filter for hidden if it exists on products too (optional but safe)
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Product))
        .filter(p => !p.hidden);
}

export async function getAllProducts(includeHidden = false): Promise<Product[]> {
    const productsRef = collection(db, "products");
    const snapshot = await getDocs(productsRef);

    const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Product));

    if (includeHidden) return items;
    return items.filter(p => !p.hidden);
}

export async function getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, "products", id);
    const snapshot = await getDoc(docRef);

    if (snapshot.exists()) {
        return {
            id: snapshot.id,
            ...snapshot.data()
        } as Product;
    }
    return null;
}

export async function createProduct(product: Omit<Product, "id">) {
    const newProductRef = doc(collection(db, "products"));
    await setDoc(newProductRef, {
        ...product,
        createdAt: Timestamp.now().toMillis(),
    });
    return newProductRef.id;
}


export async function updateProduct(id: string, product: Partial<Product>) {
    const productRef = doc(db, "products", id);
    await setDoc(productRef, product, { merge: true });
}

export async function deleteProduct(id: string) {
    const productRef = doc(db, "products", id);
    await deleteDoc(productRef);
}

// --- Designs ---

export async function getAllDesigns(includeHidden = false): Promise<Design[]> {
    const designsRef = collection(db, "designs");
    const snapshot = await getDocs(designsRef);
    const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Design));

    if (includeHidden) return items;
    return items.filter(d => !d.hidden);
}

export async function getFeaturedDesigns(): Promise<Design[]> {
    const designsRef = collection(db, "designs");
    const q = query(designsRef, where("featured", "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs
        .map(doc => ({ id: doc.id, ...doc.data() } as Design))
        .filter(d => !d.hidden);
}

export async function getDesign(id: string): Promise<Design | null> {
    const docRef = doc(db, "designs", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as Design;
    }
    return null;
}

export async function createDesign(design: Omit<Design, "id">) {
    const newDesignRef = doc(collection(db, "designs"));
    await setDoc(newDesignRef, {
        ...design,
        createdAt: Timestamp.now().toMillis(),
    });
    return newDesignRef.id;
}

export async function getUniqueCategoriesAndTags(): Promise<{ categories: string[], tags: string[] }> {
    const designs = await getAllDesigns();
    const categories = new Set<string>();
    const tags = new Set<string>();

    designs.forEach(d => {
        d.categories?.forEach(c => categories.add(c));
        d.tags?.forEach(t => tags.add(t));
    });

    return {
        categories: Array.from(categories).sort(),
        tags: Array.from(tags).sort()
    };
}

export async function updateDesign(id: string, design: Partial<Design>) {
    const designRef = doc(db, "designs", id);
    await setDoc(designRef, design, { merge: true });
}

export async function deleteDesign(id: string) {
    const designRef = doc(db, "designs", id);
    await deleteDoc(designRef);
}

// --- Product Templates ---

export async function getAllTemplates(): Promise<ProductTemplate[]> {
    const templatesRef = collection(db, "product_templates");
    const snapshot = await getDocs(templatesRef);
    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as ProductTemplate));
}

export async function getTemplate(id: string): Promise<ProductTemplate | null> {
    const docRef = doc(db, "product_templates", id);
    const snapshot = await getDoc(docRef);
    if (snapshot.exists()) {
        return { id: snapshot.id, ...snapshot.data() } as ProductTemplate;
    }
    return null;
}


// --- Orders ---

async function getNextOrderNumber(): Promise<string> {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);
    const orderCount = snapshot.size;
    const nextNumber = orderCount + 1001; // Start from ORD-1001
    return `ORD-${nextNumber}`;
}

export async function createOrder(order: Omit<Order, "id" | "orderNumber">) {
    const orderNumber = await getNextOrderNumber();
    const newOrderRef = doc(collection(db, "orders"));
    await setDoc(newOrderRef, {
        ...order,
        orderNumber,
        createdAt: Timestamp.now().toMillis(),
    });
    return { id: newOrderRef.id, orderNumber };
}

export async function getAllOrders(): Promise<Order[]> {
    const ordersRef = collection(db, "orders");
    const snapshot = await getDocs(ordersRef);

    return snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
    } as Order));
}

export async function getOrderBySessionId(sessionId: string): Promise<Order | null> {
    const ordersRef = collection(db, "orders");
    const q = query(ordersRef, where("stripeSessionId", "==", sessionId));
    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return {
            id: doc.id,
            ...doc.data()
        } as Order;
    }
    return null;
}

export async function updateOrderStatus(orderId: string, status: Order["status"]) {
    const orderRef = doc(db, "orders", orderId);
    await setDoc(orderRef, { status }, { merge: true });
}

// --- Settings ---

export async function getSettings(id: string) {
    const settingsRef = doc(db, "settings", id);
    const snapshot = await getDoc(settingsRef);
    if (snapshot.exists()) {
        return snapshot.data();
    }
    return null;
}

export async function updateSettings(id: string, data: any) {
    const settingsRef = doc(db, "settings", id);
    await setDoc(settingsRef, data, { merge: true });
}
