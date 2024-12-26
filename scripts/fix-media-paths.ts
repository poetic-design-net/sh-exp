import * as admin from 'firebase-admin';

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64 || '', 'base64').toString()
);

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: process.env.FIREBASE_STORAGE_BUCKET
  });
}

const db = admin.firestore();
const storage = admin.storage();

async function fixMediaPaths() {
  console.log('Starting media paths fix...');
  
  try {
    const snapshot = await db.collection('media').get();
    const bucket = storage.bucket();
    let fixed = 0;
    let notFound = 0;
    let total = snapshot.docs.length;

    console.log(`Processing ${total} media items...`);

    for (const doc of snapshot.docs) {
      const data = doc.data();
      console.log(`\nChecking item ${doc.id}:`, {
        filename: data.filename,
        directory: data.directory,
        currentPath: data.path
      });

      // Mögliche Pfade
      const possiblePaths = [
        data.path, // Gespeicherter vollständiger Pfad
        `${data.directory}/${data.filename}`, // Alter Pfad-Style
        `media/${data.filename}`, // Fallback
        `media/${data.filename.replace(/\.[^/.]+$/, '')}.webp` // WebP Variante
      ].filter(Boolean);

      let foundPath = null;

      // Prüfe jeden möglichen Pfad
      for (const path of possiblePaths) {
        try {
          const [exists] = await bucket.file(path).exists();
          if (exists) {
            foundPath = path;
            console.log(`Found file at: ${path}`);
            break;
          } else {
            console.log(`File not found at: ${path}`);
          }
        } catch (error) {
          console.warn(`Error checking path ${path}:`, error);
        }
      }

      if (foundPath) {
        try {
          // Generiere neue signierte URL
          const [signedUrl] = await bucket.file(foundPath).getSignedUrl({
            action: 'read',
            expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
          });

          // Aktualisiere Dokument
          await doc.ref.update({
            path: foundPath,
            url: signedUrl,
            updatedAt: new Date()
          });

          console.log(`Updated document ${doc.id} with path: ${foundPath}`);
          fixed++;
        } catch (error) {
          console.error(`Error updating document ${doc.id}:`, error);
        }
      } else {
        console.warn(`No file found for document ${doc.id}`);
        notFound++;
      }

      // Kleine Pause zwischen Items
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('\nMigration completed:');
    console.log(`Total items: ${total}`);
    console.log(`Fixed items: ${fixed}`);
    console.log(`Not found: ${notFound}`);

  } catch (error) {
    console.error('Error during migration:', error);
  }
}

// Führe die Migration aus
fixMediaPaths()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });