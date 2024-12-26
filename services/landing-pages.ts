"use client";

import type { LandingPage } from "types/landing-page";
import { initializeApp, getApp, getApps } from "firebase/app";
import { collection, getDocs, query, where, addDoc, updateDoc, deleteDoc, doc, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);

const COLLECTION_NAME = 'landing-pages';

export async function getLandingPages(): Promise<LandingPage[]> {
  const landingPagesRef = collection(db, COLLECTION_NAME);
  const snapshot = await getDocs(landingPagesRef);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  })) as LandingPage[];
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const landingPagesRef = collection(db, COLLECTION_NAME);
  const q = query(landingPagesRef, where("slug", "==", slug));
  const snapshot = await getDocs(q);

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
    createdAt: doc.data().createdAt?.toDate(),
    updatedAt: doc.data().updatedAt?.toDate()
  } as LandingPage;
}

export async function createLandingPage(
  landingPage: Omit<LandingPage, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const navigation = {
    ...landingPage.navigation,
    settings: {
      mobileBreakpoint: landingPage.navigation?.settings?.mobileBreakpoint || 768,
      showSocialLinks: landingPage.navigation?.settings?.showSocialLinks || false,
      enableSearch: landingPage.navigation?.settings?.enableSearch || false,
    }
  };

  const docRef = await addDoc(collection(db, COLLECTION_NAME), {
    ...landingPage,
    navigation,
    createdAt: new Date(),
    updatedAt: new Date()
  });

  return docRef.id;
}

export async function updateLandingPage(
  id: string, 
  landingPage: Partial<Omit<LandingPage, "id" | "createdAt" | "updatedAt">>
): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  const navigation = landingPage.navigation ? {
    ...landingPage.navigation,
    settings: {
      mobileBreakpoint: landingPage.navigation?.settings?.mobileBreakpoint || 768,
      showSocialLinks: landingPage.navigation?.settings?.showSocialLinks || false,
      enableSearch: landingPage.navigation?.settings?.enableSearch || false,
    }
  } : undefined;

  await updateDoc(docRef, {
    ...landingPage,
    ...(navigation && { navigation }),
    updatedAt: new Date()
  });
}

export async function deleteLandingPage(id: string): Promise<void> {
  const docRef = doc(db, COLLECTION_NAME, id);
  await deleteDoc(docRef);
}
