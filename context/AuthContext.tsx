"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { User } from "firebase/auth";
import { auth } from "@/lib/firebase";

interface AuthContextType {
    user: User | null;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    profile: any | null; // Typed loosely to avoid circular deps, or import UserProfile
    loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    profile: null,
    loading: true,
});

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [profile, setProfile] = useState<any | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Use onIdTokenChanged to handle token refreshes automatically
        const unsubscribe = auth.onIdTokenChanged(async (firebaseUser) => {
            if (firebaseUser) {
                setUser(firebaseUser);

                // Set cookie for server-side auth (middleware)
                const token = await firebaseUser.getIdToken();
                document.cookie = `firebaseToken=${token}; path=/; max-age=3600; secure; samesite=strict`;

                try {
                    const { createUserProfile, getUserProfile } = await import("@/lib/db");
                    let p = await getUserProfile(firebaseUser.uid);

                    if (!p) {
                        await createUserProfile({
                            uid: firebaseUser.uid,
                            email: firebaseUser.email,
                            displayName: firebaseUser.displayName,
                            photoURL: firebaseUser.photoURL,
                            role: 'user',
                            createdAt: Date.now(),
                        });
                        p = await getUserProfile(firebaseUser.uid);
                    }
                    setProfile(p);
                } catch (error) {
                    console.error("Error syncing user profile:", error);
                }
            } else {
                setUser(null);
                setProfile(null);
                // Clear cookie
                document.cookie = "firebaseToken=; path=/; max-age=0";
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    return (
        <AuthContext.Provider value={{ user, profile, loading }}>
            {children}
        </AuthContext.Provider>
    );
}
