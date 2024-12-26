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

async function checkMedia() {
  const stats = {
    totalInFirestore: 0,
    totalInStorage: 0,
    missingFiles: 0,
    missingPaths: 0,
    byDirectory: {},
    missingFilesList: [],
    duplicateUrls: new Map(),
    urlTypes: {
      storage: 0,
      firebasestorage: 0,
      other: 0
    }
  };

  try {
    console.log('Starting media check...');
    
    // Get all media items from Firestore
    const snapshot = await db.collection('media').get();
    stats.totalInFirestore = snapshot.docs.length;
    console.log(`Found ${stats.totalInFirestore} media items in Firestore`);

    // Get all files in storage for quick lookup
    const [files] = await storage.bucket().getFiles();
    stats.totalInStorage = files.length;
    console.log(`Found ${stats.totalInStorage} files in Storage`);

    // Create maps for analysis
    const storageFiles = new Set(files.map(file => file.name));
    const pathToDocsMap = new Map(); // Track which docs reference each path
    const firestorePathsSet = new Set(); // Track unique paths in Firestore

    // Check each media item
    for (const doc of snapshot.docs) {
      const data = doc.data();
      const directory = data.path ? data.path.split('/')[0] : 'undefined';
      stats.byDirectory[directory] = (stats.byDirectory[directory] || 0) + 1;

      // Track URL types
      if (data.url) {
        if (data.url.includes('storage.googleapis.com')) {
          stats.urlTypes.storage++;
        } else if (data.url.includes('firebasestorage.googleapis.com')) {
          stats.urlTypes.firebasestorage++;
        } else {
          stats.urlTypes.other++;
        }

        // Track duplicate URLs
        const existingDoc = stats.duplicateUrls.get(data.url);
        if (existingDoc) {
          console.log(`\nFound duplicate URL:`, {
            url: data.url,
            docs: [existingDoc, doc.id]
          });
        } else {
          stats.duplicateUrls.set(data.url, doc.id);
        }
      }

      if (!data.path) {
        stats.missingPaths++;
        continue;
      }

      // Track paths and their documents
      if (data.path) {
        firestorePathsSet.add(data.path);
        const docs = pathToDocsMap.get(data.path) || [];
        docs.push(doc.id);
        pathToDocsMap.set(data.path, docs);

        // Check if file exists in storage
        if (!storageFiles.has(data.path)) {
          stats.missingFiles++;
          stats.missingFilesList.push({
            id: doc.id,
            path: data.path,
            filename: data.filename,
            url: data.url
          });
        }
      }
    }

    // Print summary
    console.log('\nSummary:');
    console.log('Total items in Firestore:', stats.totalInFirestore);
    console.log('Total files in Storage:', stats.totalInStorage);
    console.log('Unique paths in Firestore:', firestorePathsSet.size);
    console.log('Items missing path:', stats.missingPaths);
    console.log('Missing files:', stats.missingFiles);

    // Check for shared paths
    console.log('\nChecking for shared paths...');
    let sharedPathsCount = 0;
    for (const [path, docs] of pathToDocsMap.entries()) {
      if (docs.length > 1) {
        sharedPathsCount++;
        console.log(`\nPath "${path}" is shared by ${docs.length} documents:`, docs);
      }
    }
    console.log(`\nFound ${sharedPathsCount} paths that are shared by multiple documents`);

    // Check for orphaned files
    console.log('\nChecking for orphaned files...');
    let orphanedFiles = 0;
    for (const file of storageFiles) {
      if (!firestorePathsSet.has(file)) {
        orphanedFiles++;
        console.log('Orphaned file:', file);
      }
    }
    console.log(`Found ${orphanedFiles} files in Storage that are not referenced in Firestore`);

    console.log('\nURL Types:');
    console.log('storage.googleapis.com:', stats.urlTypes.storage);
    console.log('firebasestorage.googleapis.com:', stats.urlTypes.firebasestorage);
    console.log('other:', stats.urlTypes.other);

    console.log('\nItems by directory:');
    Object.entries(stats.byDirectory)
      .sort(([,a], [,b]) => b - a)
      .forEach(([dir, count]) => {
        console.log(`${dir}: ${count}`);
      });

    if (stats.missingFilesList.length > 0) {
      console.log('\nMissing files:');
      stats.missingFilesList.forEach(item => {
        console.log('\nMissing file:', {
          id: item.id,
          path: item.path,
          filename: item.filename
        });
      });
    }

    const duplicates = Array.from(stats.duplicateUrls.entries())
      .filter(([, docIds]) => Array.isArray(docIds));
    
    if (duplicates.length > 0) {
      console.log('\nDuplicate URLs:');
      duplicates.forEach(([url, docIds]) => {
        console.log(`URL ${url} used by documents:`, docIds);
      });
    }

  } catch (error) {
    console.error('Error checking media:', error);
  }
}

checkMedia()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
