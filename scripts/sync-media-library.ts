const admin = require('firebase-admin');
const { getApps } = require('firebase-admin/app');

// Initialize Firebase Admin
const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
  });
}

const storage = admin.storage();
const db = admin.firestore();

async function syncMediaLibrary() {
  try {
    console.log('Starting media library sync...');
    
    // Get all files from Firebase Storage
    const [files] = await storage.bucket().getFiles();
    console.log(`Found ${files.length} files in storage`);

    // Process each file
    for (const file of files) {
      try {
        // Only process image files (check file extension)
        if (!file.name.match(/\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
          console.log(`Skipping ${file.name} - not an image file`);
          continue;
        }

        // Get the Firebase Storage URL
        const [signedUrl] = await file.getSignedUrl({
          action: 'read',
          expires: '01-01-2100' // Far future expiration
        });

        // Convert signed URL to direct Firebase Storage URL
        const directUrl = `https://firebasestorage.googleapis.com/v0/b/${storage.bucket().name}/o/${encodeURIComponent(file.name)}?alt=media`;

        // Check if media item already exists in Firestore
        const querySnapshot = await db.collection('media')
          .where('url', '==', directUrl)
          .get();

        if (!querySnapshot.empty) {
          console.log(`Skipping ${file.name} - already exists in media library`);
          continue;
        }

        // Get file metadata
        const [metadata] = await file.getMetadata();
        
        // Create media item in Firestore
        const mediaItem = {
          url: directUrl,
          filename: file.name.split('/').pop() || '',
          contentType: metadata.contentType || 'application/octet-stream',
          size: metadata.size ? Number(metadata.size) : 0,
          createdAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
          updatedAt: metadata.updated ? new Date(metadata.updated) : new Date(),
          path: file.name, // Add the full path for better organization
          directory: file.name.split('/').slice(0, -1).join('/') || 'root' // Add the directory path
        };

        await db.collection('media').add(mediaItem);
        console.log(`Added ${file.name} to media library`);

      } catch (error) {
        console.error(`Error processing file ${file.name}:`, error);
        // Continue with next file even if current one fails
        continue;
      }
    }

    console.log('Media library sync completed');
  } catch (error) {
    console.error('Error syncing media library:', error);
    process.exit(1);
  }
}

// Run the sync
syncMediaLibrary().then(() => process.exit(0));
