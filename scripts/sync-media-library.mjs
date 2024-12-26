import { storage, db } from '../lib/firebase-admin-server.js';

async function syncMediaLibrary() {
  try {
    console.log('Starting media library sync...');
    
    // Get all files from Firebase Storage
    const [files] = await storage.bucket().getFiles();
    console.log(`Found ${files.length} files in storage`);

    // Process each file
    for (const file of files) {
      try {
        // Skip files that don't start with 'media/'
        if (!file.name.startsWith('media/')) {
          console.log(`Skipping ${file.name} - not in media directory`);
          continue;
        }

        // Check if media item already exists in Firestore
        const querySnapshot = await db.collection('media')
          .where('url', '==', `https://storage.googleapis.com/${storage.bucket().name}/${file.name}`)
          .get();

        if (!querySnapshot.empty) {
          console.log(`Skipping ${file.name} - already exists in media library`);
          continue;
        }

        // Get file metadata
        const [metadata] = await file.getMetadata();
        
        // Create media item in Firestore
        const mediaItem = {
          url: `https://storage.googleapis.com/${storage.bucket().name}/${file.name}`,
          filename: file.name.split('/').pop() || '',
          contentType: metadata.contentType || 'application/octet-stream',
          size: metadata.size ? Number(metadata.size) : 0,
          createdAt: metadata.timeCreated ? new Date(metadata.timeCreated) : new Date(),
          updatedAt: metadata.updated ? new Date(metadata.updated) : new Date(),
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
