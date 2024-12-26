import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';

// Load service account from environment variable
import serviceAccount from '../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json' assert { type: 'json' };

// Initialize Firebase Admin SDK
function initializeFirebaseAdmin() {
  if (!getApps().length) {
    try {
      console.log('Starting Firebase Admin initialization...');
      
      // Use storage bucket from environment variable or fallback to project ID based name
      const storageBucket = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${serviceAccount.project_id}.firebasestorage.app`;
      console.log('Using storage bucket:', storageBucket);
      
      const app = admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: storageBucket
      });

      console.log('Firebase Admin initialized with:');
      console.log('- Project ID:', serviceAccount.project_id);
      console.log('- Client Email:', serviceAccount.client_email);
      console.log('- Storage Bucket:', app.options.storageBucket);

      return app;
    } catch (error) {
      console.error('Error initializing Firebase Admin:', error);
      throw error;
    }
  }
  return admin.app();
}

// Initialize Firebase Admin
const app = initializeFirebaseAdmin();

// Export initialized services
export const auth = admin.auth(app);
export const db = admin.firestore(app);
export const storage = admin.storage(app);
