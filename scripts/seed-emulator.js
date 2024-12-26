const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Set emulator environment variables
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';
process.env.FIREBASE_STORAGE_EMULATOR_HOST = '127.0.0.1:9199';

// Initialize Firebase Admin without credentials for emulator
admin.initializeApp({
  projectId: 'stefanhiene-2ec0a'
});

const db = admin.firestore();

async function importCollection(collection, documents) {
  console.log(`\nImporting ${collection}...`);
  console.log(`Total documents: ${documents.length}`);
  
  try {
    const batches = [];
    let currentBatch = db.batch();
    let operationCount = 0;
    let totalImported = 0;
    
    for (const doc of documents) {
      const { id, ...docData } = doc;
      const ref = db.collection(collection).doc(id);
      currentBatch.set(ref, docData);
      operationCount++;
      
      // Firestore has a limit of 500 operations per batch
      if (operationCount === 400) {
        batches.push(currentBatch);
        currentBatch = db.batch();
        operationCount = 0;
        totalImported += 400;
        console.log(`Queued batch: ${totalImported}/${documents.length} documents`);
      }
    }
    
    // Add the last batch if it has any operations
    if (operationCount > 0) {
      batches.push(currentBatch);
    }
    
    // Commit all batches
    console.log(`Committing ${batches.length} batches...`);
    await Promise.all(batches.map(batch => batch.commit()));
    console.log(`✓ Successfully imported ${collection}`);
    
  } catch (error) {
    console.error(`✗ Error importing ${collection}:`, error);
    throw error;
  }
}

async function importData() {
  try {
    const exportPath = path.join(__dirname, '../firebase-export/firestore-export.json');
    
    if (!fs.existsSync(exportPath)) {
      console.error('Export file not found. Please run export-firestore-data.js first.');
      process.exit(1);
    }
    
    const data = JSON.parse(fs.readFileSync(exportPath, 'utf8'));
    
    // Import collections in a specific order to handle dependencies
    const collectionOrder = [
      'users',           // Base user data first
      'categories',      // Categories before products
      'products',        // Products before orders
      'memberships',     // Memberships before user_memberships
      'user_memberships',
      'orders',
      'media',
      'funnels',
      'landing-pages'
    ];
    
    console.log('Starting import process...');
    console.log('Collections to import:', collectionOrder.join(', '));
    
    for (const collection of collectionOrder) {
      if (data[collection]) {
        await importCollection(collection, data[collection]);
      } else {
        console.warn(`⚠ Collection ${collection} not found in export data`);
      }
    }
    
    console.log('\n✓ Import completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('\n✗ Import failed:', error);
    process.exit(1);
  }
}

// Add error handling for uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
  process.exit(1);
});

console.log('Starting Firestore emulator seed script...');
importData();
