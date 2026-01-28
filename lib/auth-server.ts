import { cookies } from "next/headers";
import { auth } from "@/lib/firebase-admin";
import { getUserProfile } from "@/lib/db";


export async function getServerAuth() {
    try {
        const cookieStore = await cookies();
        const token = cookieStore.get("firebaseToken")?.value;

        if (!token) {
            return { user: null, profile: null };
        }

        // Verify token on server-side using Admin SDK
        const decodedToken = await auth.verifyIdToken(token);

        // Fetch full profile from DB
        const profile = await getUserProfile(decodedToken.uid);

        return { user: decodedToken, profile };
    } catch {
        // console.error("Auth verification failed:", error); // Silent fail usually better for auth checks unless debugging
        return { user: null, profile: null };
    }
}

export async function requireAuth() {
    const { user, profile } = await getServerAuth();

    if (!user || !profile) {
        throw new Error("Unauthorized");
    }

    return { user, profile };
}

export async function requireAdmin() {
    const { user, profile } = await requireAuth();

    if (profile.role !== "admin") {
        throw new Error("Forbidden: Admin access required");
    }

    return { user, profile };
}
