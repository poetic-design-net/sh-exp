const admin = require('firebase-admin');
require('dotenv').config({ path: '.env.local' });

// Initialize Firebase Admin
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
};

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();
const storage = admin.storage();

async function fixMissingPaths() {
  try {
    console.log('Starting to fix missing paths...');
    const snapshot = await db.collection('media').get();
    console.log(`Found ${snapshot.docs.length} media items`);

    let fixed = 0;
    let alreadyOk = 0;
    let failed = 0;

    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (!data.path && data.url) {
        console.log(`\nProcessing item ${doc.id}:`);
        console.log('URL:', data.url);
        
        try {
          // Extract path from URL
          let path;
          if (data.url.includes('firebasestorage.googleapis.com')) {
            // Handle signed URLs
            const urlPath = new URL(data.url).pathname;
            const match = urlPath.match(/o\/(.*?)\?/);
            if (match) {
              path = decodeURIComponent(match[1]);
            }
          } else if (data.url.includes('storage.googleapis.com')) {
            // Handle public URLs
            const urlParts = data.url.split('storage.googleapis.com/')[1];
            // Remove query parameters if present
            const cleanUrl = urlParts.split('?')[0];
            // Remove bucket name from path
            path = cleanUrl.split('/').slice(1).join('/');
          }

          if (path) {
            console.log('Extracted path:', path);
            
            // Try both the extracted path and the full media path
            const pathsToTry = [
              path,
              `media/${data.filename}`,
              `media/${path.split('/').pop()}` // Just the filename with media prefix
            ];

            let exists = false;
            let workingPath = null;

            for (const testPath of pathsToTry) {
              console.log('Trying path:', testPath);
              const [fileExists] = await storage.bucket().file(testPath).exists();
              if (fileExists) {
                exists = true;
                workingPath = testPath;
                break;
              }
            }
            
            if (exists && workingPath) {
              // Update document with path
              await doc.ref.update({
                path: workingPath,
                updatedAt: new Date()
              });
              console.log(`Fixed path: ${workingPath}`);
              fixed++;
            } else {
              console.log('File not found in any of these locations:', pathsToTry);
              failed++;
            }
          } else {
            console.log('Could not extract path from URL');
            failed++;
          }
        } catch (error) {
          console.error(`Error processing item ${doc.id}:`, error);
          failed++;
        }
      } else if (data.path) {
        alreadyOk++;
      } else {
        console.log(`\nItem ${doc.id} has no URL or path`);
        failed++;
      }
    }

    console.log('\nSummary:');
    console.log(`Total items: ${snapshot.docs.length}`);
    console.log(`Already had paths: ${alreadyOk}`);
    console.log(`Fixed: ${fixed}`);
    console.log(`Failed: ${failed}`);

  } catch (error) {
    console.error('Error fixing paths:', error);
  }
}

fixMissingPaths()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
