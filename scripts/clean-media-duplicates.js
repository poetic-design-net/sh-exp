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

async function cleanDuplicates() {
  try {
    console.log('Starting cleanup of duplicate media entries...');
    
    // Get all media items
    const snapshot = await db.collection('media').get();
    console.log(`Found ${snapshot.docs.length} total media items`);

    // Group documents by path
    const pathToDocsMap = new Map();
    snapshot.docs.forEach(doc => {
      const data = doc.data();
      if (data.path) {
        const docs = pathToDocsMap.get(data.path) || [];
        docs.push({
          id: doc.id,
          ...data
        });
        pathToDocsMap.set(data.path, docs);
      }
    });

    // Process duplicates
    let duplicatesFound = 0;
    let duplicatesFixed = 0;
    const batch = db.batch();
    let currentBatch = 0;
    const BATCH_SIZE = 500;

    for (const [path, docs] of pathToDocsMap.entries()) {
      if (docs.length > 1) {
        duplicatesFound++;
        console.log(`\nFound ${docs.length} documents for path: ${path}`);
        
        // Sort by createdAt to keep the oldest one
        docs.sort((a, b) => {
          const aDate = a.createdAt?.toDate?.() || new Date(0);
          const bDate = b.createdAt?.toDate?.() || new Date(0);
          return aDate - bDate;
        });

        // Keep the first (oldest) document and delete the rest
        const [keep, ...remove] = docs;
        console.log(`Keeping document ${keep.id}, removing ${remove.length} duplicates`);

        // Delete duplicates
        for (const doc of remove) {
          batch.delete(db.collection('media').doc(doc.id));
          currentBatch++;
          duplicatesFixed++;

          // Commit batch if it reaches the size limit
          if (currentBatch === BATCH_SIZE) {
            console.log('Committing batch...');
            await batch.commit();
            currentBatch = 0;
          }
        }
      }
    }

    // Commit any remaining operations
    if (currentBatch > 0) {
      console.log('Committing final batch...');
      await batch.commit();
    }

    console.log('\nCleanup completed:');
    console.log(`Total duplicates found: ${duplicatesFound}`);
    console.log(`Documents removed: ${duplicatesFixed}`);

  } catch (error) {
    console.error('Error cleaning duplicates:', error);
  }
}

cleanDuplicates()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
