import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

const isDevelopment = process.env.NODE_ENV === 'development';

// Set emulator hosts before initializing
if (isDevelopment) {
  process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
  process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
  process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';
  console.log('🔧 Using Firebase Emulators:', {
    firestore: process.env.FIRESTORE_EMULATOR_HOST,
    auth: process.env.FIREBASE_AUTH_EMULATOR_HOST,
    storage: process.env.FIREBASE_STORAGE_EMULATOR_HOST
  });
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
  if (isDevelopment) {
    // Use emulator in development
    admin.initializeApp({
      projectId: 'stefanhiene-2ec0a',
      storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
    });
    console.log('🔧 Using Firebase Emulators');
  } else {
    // Use production credentials in production
    const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
    });
    console.log('🚀 Using Production Firebase');
  }
}

// Export initialized services
export const auth = admin.auth();
export const db = admin.firestore();
export const storage = admin.storage();

// Admin verification function
export async function verifyUserIsAdmin(token: string): Promise<boolean> {
  try {
    let decodedToken;
    
    if (isDevelopment) {
      // In development, decode the token without verification
      try {
        // Try to decode the token parts
        const parts = token.split('.');
        if (parts.length !== 3) {
          console.error('Invalid token format');
          return false;
        }

        // Base64 decode and parse the payload
        const payload = parts[1].replace(/-/g, '+').replace(/_/g, '/');
        decodedToken = JSON.parse(Buffer.from(payload, 'base64').toString());
        console.log('🔧 Development mode: Decoded token:', decodedToken);
      } catch (error) {
        console.error('Error decoding token:', error);
        return false;
      }
    } else {
      // In production, verify the token
      decodedToken = await auth.verifyIdToken(token);
    }

    const uid = decodedToken.uid || decodedToken.user_id || decodedToken.sub;
    const userDoc = await db.collection('users').doc(uid).get();
    const userData = userDoc.data();
    
    console.log('Checking admin status for user:', {
      uid,
      userData,
      role: userData?.role,
      isAdmin: userData?.role === 'admin'
    });
    
    return userData?.role === 'admin';
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return false;
  }
}
