#!/usr/bin/env node

// This script encodes the Firebase service account credentials into base64
// for use in the FIREBASE_SERVICE_ACCOUNT_BASE64 environment variable

const fs = require('fs');

// Create service account object from environment variables
const serviceAccount = {
  type: 'service_account',
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY?.split('-----')[2]?.split('\n')[0] || '',
  private_key: process.env.FIREBASE_PRIVATE_KEY,
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: '',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url: `https://www.googleapis.com/robot/v1/metadata/x509/${encodeURIComponent(
    process.env.FIREBASE_CLIENT_EMAIL || ''
  )}`
};

// Convert to base64
const base64 = Buffer.from(JSON.stringify(serviceAccount)).toString('base64');

console.log('Add this to your environment variables:');
console.log('\nFIREBASE_SERVICE_ACCOUNT_BASE64=' + base64);
