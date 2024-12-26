"use client";

import { FC, ReactNode, useMemo, Suspense, useEffect, useState } from "react";
import { FirebaseAppProvider, FirestoreProvider } from "reactfire";
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore";
import { getAuth, connectAuthEmulator } from "firebase/auth";
import { getStorage, connectStorageEmulator } from "firebase/storage";
import { initializeApp, getApp, getApps } from "firebase/app";
import { usePathname } from "next/navigation";
import { AuthProvider } from "contexts/auth-context";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Static fallback component that maintains visual consistency
const StaticFallback: FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <div style={{ opacity: 1 }}>
      {children}
    </div>
  );
};

// Firebase SDK Provider Component with improved error boundary
const FirebaseSDKProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const app = getApp();
  
  // Initialize services
  const firestore = useMemo(() => {
    return getFirestore(app);
  }, [app]);

  // Initialize storage
  useEffect(() => {
    getStorage(app);
  }, [app]);

  return (
    <FirestoreProvider sdk={firestore}>
      <AuthProvider>
        {children}
      </AuthProvider>
    </FirestoreProvider>
  );
};

// Helper to determine if a route should be static
const isStaticRoute = (pathname: string | null): boolean => {
  if (!pathname) return false;
  
  // Add routes that should be static
  const staticRoutes = [
    '/',
    '/products',
    '/categories',
  ];
  
  // Add route patterns that should be dynamic
  const dynamicPatterns = [
    '/admin',
    '/cart',
    '/login',
    '/app',
  ];

  // Landing pages are considered static
  if (pathname.startsWith('/l/')) {
    return true;
  }

  // Check if the path matches any dynamic patterns
  const isDynamic = dynamicPatterns.some(pattern => pathname.startsWith(pattern));
  if (isDynamic) return false;

  // Check if it's a static route
  return staticRoutes.includes(pathname);
};

export const MyFirebaseProvider: FC<{ children: ReactNode }> = ({ children }) => {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Initialize Firebase app with proper SSR handling
  const app = useMemo(() => {
    if (typeof window === "undefined") return null;
    return !getApps().length ? initializeApp(firebaseConfig) : getApp();
  }, []);

  // During SSR and initial mount, render children directly
  if (!mounted || (typeof window === "undefined" && isStaticRoute(pathname))) {
    return children;
  }

  // During SSR for dynamic routes, return children directly
  if (!app) {
    return children;
  }

  // Single Suspense boundary for all Firebase-related initialization
  return (
    <FirebaseAppProvider firebaseConfig={firebaseConfig} firebaseApp={app} suspense={true}>
      <FirebaseSDKProvider>
        {children}
      </FirebaseSDKProvider>
    </FirebaseAppProvider>
  );
};
