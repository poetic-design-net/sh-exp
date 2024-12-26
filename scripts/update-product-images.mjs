import admin from 'firebase-admin';
import { getApps } from 'firebase-admin/app';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Initialize Firebase Admin
const serviceAccount = require(join(__dirname, '../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json'));

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
  });
}

const db = admin.firestore();

async function updateProductImages() {
  try {
    console.log('Starting product images update...');
    
    // Get all products to get their image URLs
    const productsSnapshot = await db.collection('products').get();
    const productImageUrls = new Set();
    
    productsSnapshot.forEach(doc => {
      const product = doc.data();
      if (product.images && Array.isArray(product.images)) {
        product.images.forEach(imageUrl => {
          if (typeof imageUrl === 'string') {
            productImageUrls.add(imageUrl);
          }
        });
      }
    });

    console.log(`Found ${productImageUrls.size} product image URLs to process`);

    // Get all media items that need updating
    const mediaSnapshot = await db.collection('media').get();
    let updateCount = 0;
    const batch = db.batch();
    const batchSize = 500; // Firestore batch limit
    let currentBatch = 0;

    for (const doc of mediaSnapshot.docs) {
      const mediaItem = doc.data();
      // If this media item's URL is used in a product and doesn't have the correct category
      if (productImageUrls.has(mediaItem.url) && mediaItem.category !== 'products') {
        batch.update(doc.ref, { 
          category: 'products',
          updatedAt: new Date()
        });
        updateCount++;
        currentBatch++;

        // If we've reached the batch limit, commit and start a new batch
        if (currentBatch === batchSize) {
          await batch.commit();
          console.log(`Committed batch of ${currentBatch} updates`);
          currentBatch = 0;
        }
      }
    }

    // Commit any remaining updates
    if (currentBatch > 0) {
      await batch.commit();
      console.log(`Committed final batch of ${currentBatch} updates`);
    }

    console.log(`Successfully updated ${updateCount} product images`);
    console.log('Product images update completed');
  } catch (error) {
    console.error('Error updating product images:', error);
    process.exit(1);
  }
}

// Run the update
updateProductImages().then(() => process.exit(0));
