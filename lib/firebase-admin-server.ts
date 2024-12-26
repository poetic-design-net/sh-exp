import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

function validateEnvironmentVariables() {
  const required = ['FIREBASE_SERVICE_ACCOUNT_BASE64', 'FIREBASE_STORAGE_BUCKET'];
  const missing = required.filter(key => !process.env[key]);
  
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

function getServiceAccount() {
  try {
    const base64 = process.env.FIREBASE_SERVICE_ACCOUNT_BASE64;
    if (!base64) throw new Error('FIREBASE_SERVICE_ACCOUNT_BASE64 is empty');
    
    const decoded = Buffer.from(base64, 'base64').toString();
    if (!decoded) throw new Error('Failed to decode base64 service account');
    
    const parsed = JSON.parse(decoded);
    if (!parsed.project_id) throw new Error('Invalid service account format');
    
    return parsed;
  } catch (error) {
    throw new Error(`Failed to parse service account: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// Initialize Firebase Admin SDK
if (!getApps().length) {
  try {
    console.log('Validating environment...');
    validateEnvironmentVariables();

    console.log('Parsing service account...');
    const serviceAccount = getServiceAccount();

    console.log('Storage bucket configuration:', {
      bucket: process.env.FIREBASE_STORAGE_BUCKET,
      projectId: serviceAccount.project_id
    });

    console.log('Initializing Firebase Admin SDK...');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET
    });

    console.log('Firebase Admin SDK initialized successfully');
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Fatal error initializing Firebase Admin SDK:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Firebase initialization failed: ${errorMessage}`);
  }
}

// Verify storage bucket is accessible
async function verifyStorageBucket() {
  try {
    const bucket = admin.storage().bucket();
    const [exists] = await bucket.exists();
    if (!exists) {
      throw new Error('Storage bucket does not exist');
    }
    console.log('Storage bucket verified:', bucket.name);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    console.error('Error accessing storage bucket:', {
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    });
    throw new Error(`Storage bucket access failed: ${errorMessage}`);
  }
}

// Verify storage bucket on initialization
verifyStorageBucket().catch(error => {
  console.error('Storage bucket verification failed:', error);
});

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
