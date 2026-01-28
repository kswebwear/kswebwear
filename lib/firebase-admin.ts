import "server-only";
import { initializeApp, getApps, cert, getApp } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore } from "firebase-admin/firestore";

// You can use a service account if you have one, or standard Google Cloud credentials in production
// For Vercel, using the "private key" env var approach is common if outside GCP.
// However, standard `initializeApp()` works with GOOGLE_APPLICATION_CREDENTIALS for generic usage.
// Given the user is on Vercel next, we'll try standard init which falls back to credentials.
// For robust Vercel usage, we often parse the service account JSON from env.

const firebaseAdminConfig = {
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
};

function customInitApp() {
    try {
        if (getApps().length > 0) {
            return getApp();
        }

        if (process.env.FIREBASE_PRIVATE_KEY) {
            return initializeApp({
                credential: cert(firebaseAdminConfig),
            });
        }

        // Fallback for environments where GOOGLE_APPLICATION_CREDENTIALS might be set
        // or just to attempt default init.
        return initializeApp();
    } catch (error) {
        console.warn("Firebase Admin Init Error (likely missing env vars during build):", error);
        return null;
    }
}

const app = customInitApp();

// Export safe proxies or nulls. 
// If app failed to init, accessing auth/db will throw or return mocks depending on need.
// Since this is server-only, we can throw at runtime if logic tries to use it.

let auth: any;
let db: any;

if (app) {
    auth = getAuth(app);
    db = getFirestore(app);
} else {
    // Mock or specific error thrower to prevent import-time crashes
    const crash = () => { throw new Error("Firebase Admin not validated. Check env vars."); };
    auth = { verifyIdToken: crash, getUser: crash };
    db = { collection: crash, doc: crash };
}

export { auth, db };
