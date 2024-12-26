export const config = {
  firebase: {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "AIzaSyDV_eiDfZn8hEdSUU-3_ooiGm5aFMGvxyc",
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "stefanhiene-2ec0a.firebaseapp.com",
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "stefanhiene-2ec0a",
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "stefanhiene-2ec0a.firebasestorage.app",
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || "80241216538",
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || "1:80241216538:web:c96211fe87de2738dad5a3"
  },
  woocommerce: {
    url: process.env.WOOCOMMERCE_URL || "",
    consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || "",
    consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || ""
  },
  stripe: {
    publishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
    secretKey: process.env.STRIPE_SECRET_KEY || "",
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || ""
  },
  monero: {
    walletRpcUrl: process.env.MONERO_WALLET_RPC_URL || "",
    walletFilename: process.env.MONERO_WALLET_FILENAME || "",
    walletPassword: process.env.MONERO_WALLET_PASSWORD || ""
  }
};

// Validate required environment variables
export function validateConfig() {
  const requiredVars = [
    'WOOCOMMERCE_URL',
    'WOOCOMMERCE_CONSUMER_KEY',
    'WOOCOMMERCE_CONSUMER_SECRET'
  ];

  const missingVars = requiredVars.filter(varName => !process.env[varName]);

  if (missingVars.length > 0) {
    throw new Error(`Fehlende Umgebungsvariablen: ${missingVars.join(', ')}`);
  }
}

// Helper function to check if we're on the server side
export const isServer = typeof window === 'undefined';

// Helper function to check if we're in development mode
export const isDevelopment = process.env.NODE_ENV === 'development';
