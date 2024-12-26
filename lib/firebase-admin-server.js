import * as admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
// Load service account
var serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');
// Initialize Firebase Admin SDK
if (!getApps().length) {
    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
        storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
    });
}
// Export initialized services
export var auth = admin.auth();
export var db = admin.firestore();
export var storage = admin.storage();
// Mark this module as server-only
export var runtime = 'nodejs';
