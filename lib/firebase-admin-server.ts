import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  // Parse service account from environment variable
  const serviceAccount = JSON.parse(
    Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString()
  );

  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
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
