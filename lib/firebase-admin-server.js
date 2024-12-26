import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

let app;

try {
    // Initialize Firebase Admin SDK using environment variables
    if (!getApps().length) {
        if (!process.env.FIREBASE_PROJECT_ID || !process.env.FIREBASE_CLIENT_EMAIL || !process.env.FIREBASE_PRIVATE_KEY) {
            throw new Error('Missing required Firebase Admin environment variables');
        }

        app = admin.initializeApp({
            credential: admin.credential.cert({
                projectId: process.env.FIREBASE_PROJECT_ID,
                clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
                privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n')
            }),
            storageBucket: process.env.FIREBASE_STORAGE_BUCKET
        });
    } else {
        app = admin.app();
    }
} catch (error) {
    console.error('Firebase Admin initialization error:', error);
    throw new Error('Failed to initialize Firebase Admin');
}

// Export initialized services for backward compatibility
export const auth = admin.auth(app);
export const db = admin.firestore(app);
export const storage = admin.storage(app);

// Export async functions for server actions
export async function getAuth() {
    'use server';
    return auth;
}

export async function getFirestore() {
    'use server';
    return db;
}

export async function getStorage() {
    'use server';
    return storage;
}

// Helper function for admin verification
export async function verifyUserIsAdmin(token) {
    'use server';
    try {
        const decodedToken = await auth.verifyIdToken(token);
        const user = await auth.getUser(decodedToken.uid);
        const customClaims = user.customClaims || {};
        return customClaims.admin === true;
    } catch (error) {
        console.error('Error verifying admin status:', error);
        return false;
    }
}
