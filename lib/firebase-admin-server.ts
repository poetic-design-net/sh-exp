import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Load service account
const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');

// Initialize Firebase Admin SDK
if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
  });
}

// Export initialized services
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

// Admin verification function
export async function verifyUserIsAdmin(token: string): Promise<boolean> {
  try {
    const decodedToken = await auth.verifyIdToken(token);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin status:', error);
    throw new Error('Unauthorized. Make sure you have admin privileges.');
  }
}

// Mark this module as server-only
export const runtime = 'nodejs' as const;
