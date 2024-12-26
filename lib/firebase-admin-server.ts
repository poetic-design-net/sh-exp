import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    console.log('Initializing Firebase Admin SDK...');
    
    // Parse service account from environment variable
    const serviceAccount = JSON.parse(
      Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString()
    );

    // Log storage bucket configuration
    console.log('Storage bucket configuration:', {
      bucket: process.env.FIREBASE_STORAGE_BUCKET,
      projectId: serviceAccount.project_id
    });

    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    console.error('Error initializing Firebase Admin SDK:', error);
    throw error;
  }
}

// Verify storage bucket is accessible
try {
  const bucket = admin.storage().bucket();
  console.log('Storage bucket verified:', bucket.name);
} catch (error) {
  console.error('Error accessing storage bucket:', error);
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
