/* eslint-disable */
import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load service account (Assuming you have one or use default credentials)
// For local convenience, we'll try to use the environment variables if possible
// or provide instructions to download a service account key JSON.

console.log("-----------------------------------------");
console.log("🚀 KSWebWear Admin Promotion Utility");
console.log("-----------------------------------------");

const uid = process.argv[2];

if (!uid) {
    console.error("❌ Error: Please provide a User UID.");
    console.log("Usage: node scripts/make-admin.mjs <UID>");
    process.exit(1);
}

// NOTE: For this to work locally without a JSON file, 
// you can temporary use the client SDK with user auth, 
// but it's safer to just do it in the Firebase Console.

console.log(`\nTo make UID: ${uid} an admin:`);
console.log("1. Go to Firebase Console -> Firestore");
console.log(`2. Find collection 'users', document '${uid}'`);
console.log("3. Change 'role' from 'user' to 'admin'\n");

console.log("If you want a programmatic way, I can set up a secure Admin API route for you.");
