const admin = require('firebase-admin');
const { getApps } = require('firebase-admin/app');

// Initialize Firebase Admin
const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');

if (!getApps().length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
}

async function makeUserAdmin(email: string) {
  try {
    // Get user by email
    const user = await admin.auth().getUserByEmail(email);
    
    // Update Firestore user document
    await admin.firestore().collection('users').doc(user.uid).set({
      email: email,
      role: 'admin'
    }, { merge: true });
    
    console.log(`Successfully set admin role for user: ${email}`);
  } catch (error) {
    console.error('Error setting admin role:', error);
  } finally {
    // Exit the process
    process.exit();
  }
}

// Check if email was provided as command line argument
const email = process.argv[2];
if (!email) {
  console.error('Please provide an email address as an argument');
  console.log('Usage: npm run set-admin your.email@example.com');
  process.exit(1);
}

// Execute the function
makeUserAdmin(email);
