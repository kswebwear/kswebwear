export interface UserProfile {
    uid: string;
    email: string | null;
    displayName: string | null;
    photoURL: string | null;
    phoneNumber?: string | null;
    address?: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    } | null;
    role: 'user' | 'admin';
    createdAt?: number; // Timestamp
}

export interface Design {
    id: string;
    title: string;
    description: string;
    mainImage: string;
    backImage?: string | null; // Optional back print image
    allowedColors?: string[]; // Optional restriction on colors
    colorImages?: Record<string, string>; // Map of color names to specific mockup images
    categories: string[];
    tags: string[];
    featured?: boolean;
    hidden?: boolean;
    printOptions?: {
        front: boolean;
        back: boolean;
    };
    price?: number | null; // Override base price
    compareAtPrice?: number | null;
    sizeGuide?: string | null; // Custom image URL for this design
    allowedDemographics?: ('Men' | 'Women' | 'Kids' | 'Infants')[];
    createdAt: number;
}

export interface StoreSettings {
    id: string;
    logo?: string;
    homeHeroImage?: string;
    karungaliMalaImage?: string;
    defaultSizeGuide?: string;
    showDiscountHighlight?: boolean;
    discountHighlight?: {
        text: string;
        link: string;
        bgColor?: string;
        textColor?: string;
    };
    useHeroCarousel?: boolean;
    homeCarousel?: string[];
    whatsappNumber?: string;
    showWhatsApp?: boolean;
    googleAnalyticsId?: string;
    activeTheme?: string;
}

export interface ProductTemplate {
    id: string; // e.g., "classic-tee", "premium-hoodie"
    name: string;
    basePrice: number;
    description: string;
    colors: { name: string; hex: string; image?: string }[];
    sizes: string[];
    category: string; // 'apparel', 'mug', etc.
    sizeGuide?: string; // Default size guide for this template
    demographic?: 'Men' | 'Women' | 'Kids' | 'Infants' | 'Unisex';
}

export interface Product {
    id: string; // Firestore Document ID
    name: string;
    description: string;
    price: number;
    compareAtPrice?: number; // For discounts
    images: string[];
    category: string;
    sizes?: string[]; // clothing sizes
    colors?: string[];
    beadSizes?: string[]; // for Karungali Mala
    inStock: boolean;
    featured?: boolean;
    hidden?: boolean;
    createdAt: number;
}

export interface CartItem {
    cartId: string; // Unique ID (productId + variant)
    productId: string;
    name: string;
    price: number;
    image: string;
    quantity: number;
    size?: string;
    color?: string;
    beadSize?: string;
}

export interface Order {
    id: string;
    orderNumber: string; // Sequential order number like "ORD-1001"
    userId: string;
    stripeSessionId: string; // To link with Stripe
    items: CartItem[];
    totalAmount: number;
    status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'completed';
    shippingAddress: {
        line1: string;
        line2?: string;
        city: string;
        state: string;
        postalCode: string;
        country: string;
    };
    createdAt: number;
}
