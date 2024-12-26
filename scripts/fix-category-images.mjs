import admin from 'firebase-admin';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Load service account
const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
  });
}

const db = admin.firestore();

// Map of category names to their image files
const categoryImageMap = {
  'Abos': 'Kategorie_Abos-blau.webp',
  'Bücher': 'Kategorie_Buecher-blau.webp',
  'Flatrates': 'Kategorie_Flatrates-blau.webp',
  'Kalender': 'Kategorie_Kalender-blau.webp',
  'Kurse': 'Kategorie_Kurse-blau.webp',
  'Musik': 'Kategorie_Musik-blau.webp',
  'Videos': 'Kategorie_Videos-blau.webp'
};

async function updateCategoryDocuments() {
  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log('🚀 Starting to update category documents');
    const snapshot = await db.collection("categories").get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const categoryName = data.name;
      
      if (!categoryName || !categoryImageMap[categoryName]) {
        log(`⏩ Category ${doc.id} (${categoryName}) has no matching image, skipping...`);
        continue;
      }

      log(`📸 Processing category ${doc.id} (${categoryName})...`);
      
      const imageFileName = categoryImageMap[categoryName];
      const imageUrl = `https://storage.googleapis.com/stefanhiene-2ec0a.firebasestorage.app/categories/${imageFileName}`;

      // Update both the legacy image field and the new images array
      const updateData = {
        image: {
          src: imageUrl,
          alt: `${categoryName} Kategorie`,
          id: data.image?.id || Date.now() // preserve existing ID or generate new one
        },
        images: [imageUrl]
      };

      await doc.ref.update(updateData);

      log(`✅ Successfully updated category ${categoryName}`);
      log(`📊 Image URL: ${imageUrl}`);
    }

    log('🎉 All category documents have been updated');
    process.exit(0);
  } catch (error) {
    log(`❌ Error updating category documents: ${error.message}`);
    console.error('Error details:', error);
    process.exit(1);
  }
}

console.log('='.repeat(80));
console.log('Starting to update category documents');
console.log('='.repeat(80));

updateCategoryDocuments();
