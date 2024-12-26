import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
// Initialize Firebase Admin SDK using environment variables
if (!getApps().length) {
    admin.initializeApp({
        credential: admin.credential.cert({
            projectId: process.env.FIREBASE_PROJECT_ID,
            clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
            privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n')
        }),
        storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });
}
// Export initialized services
export var auth = admin.auth();
export var db = admin.firestore();
export var storage = admin.storage();
// Mark this module as server-only
export var runtime = 'nodejs';
