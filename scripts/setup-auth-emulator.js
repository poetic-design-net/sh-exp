const admin = require('firebase-admin');
const path = require('path');

// Set emulator environment variables
process.env.FIRESTORE_EMULATOR_HOST = '127.0.0.1:8080';
process.env.FIREBASE_AUTH_EMULATOR_HOST = '127.0.0.1:9099';

// Initialize Firebase Admin without credentials for emulator
admin.initializeApp({
  projectId: 'stefanhiene-2ec0a'
});

async function setupTestUser() {
  try {
    // Create a test admin user
    const userRecord = await admin.auth().createUser({
      email: 'test@example.com',
      password: 'test123456',
      emailVerified: true,
    });

    // Set admin custom claims
    await admin.auth().setCustomUserClaims(userRecord.uid, {
      admin: true
    });

    console.log('✓ Test admin user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: test123456');
    
    process.exit(0);
  } catch (error) {
    console.error('Error creating test user:', error);
    process.exit(1);
  }
}

setupTestUser();
