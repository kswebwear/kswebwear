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
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'), // specific fix for Vercel env
};

function customInitApp() {
    if (getApps().length <= 0) {
        if (process.env.FIREBASE_PRIVATE_KEY) {
            return initializeApp({
                credential: cert(firebaseAdminConfig)
            });
        }
        return initializeApp(); // fallback to default creds
    }
    return getApp();
}

const app = customInitApp();
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db };
