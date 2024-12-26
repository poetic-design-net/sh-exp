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
export async function verifyUserIsAdmin(token) {
    try {
        const decodedToken = await auth.verifyIdToken(token);
        const user = await auth.getUser(decodedToken.uid);
        // Überprüfe custom claims für Admin-Status
        const customClaims = user.customClaims || {};
        return customClaims.admin === true;
    }
    catch (error) {
        console.error('Error verifying admin status:', error);
        return false;
    }
}
