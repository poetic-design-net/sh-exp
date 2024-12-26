const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');

// Initialize Firebase Admin with production credentials
const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
});

const db = admin.firestore();

async function exportCollection(collectionName) {
  const snapshot = await db.collection(collectionName).get();
  const data = [];
  
  snapshot.forEach(doc => {
    data.push({
      id: doc.id,
      ...doc.data()
    });
  });
  
  return data;
}

async function exportData() {
  try {
    // Export all collections
    const collections = [
      'categories',
      'funnels',
      'landing-pages',
      'media',
      'memberships',
      'orders',
      'products',
      'user_memberships',
      'users'
    ];
    const exportData = {};
    
    for (const collection of collections) {
      console.log(`Exporting ${collection}...`);
      exportData[collection] = await exportCollection(collection);
    }
    
    // Create export directory if it doesn't exist
    const exportDir = path.join(__dirname, '../firebase-export');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir);
    }
    
    // Write to file
    fs.writeFileSync(
      path.join(exportDir, 'firestore-export.json'),
      JSON.stringify(exportData, null, 2)
    );
    
    console.log('Export completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Export failed:', error);
    process.exit(1);
  }
}

exportData();
