"use server";

import { db } from "@/lib/firebase-admin-server";
import type { LandingPage } from "@/types/landing-page";
import { revalidatePath } from "next/cache";

export async function getLandingPages(): Promise<LandingPage[]> {
  const snapshot = await db.collection("landing-pages").get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      slug: data.slug,
      description: data.description,
      components: data.components,
      navigation: data.navigation,
      isActive: data.isActive,
      metadata: data.metadata,
      createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
      updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
    } as LandingPage;
  });
}

export async function getLandingPageBySlug(slug: string): Promise<LandingPage | null> {
  const snapshot = await db
    .collection("landing-pages")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    title: data.title,
    slug: data.slug,
    description: data.description,
    components: data.components,
    navigation: data.navigation,
    isActive: data.isActive,
    metadata: data.metadata,
    createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
    updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date(),
  } as LandingPage;
}

export async function createLandingPage(
  data: Omit<LandingPage, "id" | "createdAt" | "updatedAt">
): Promise<LandingPage> {
  const now = new Date();
  const landingPageData = {
    ...data,
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection("landing-pages").add(landingPageData);
  revalidatePath("/admin/landing-pages");
  
  return {
    id: docRef.id,
    ...landingPageData,
  } as LandingPage;
}

export async function updateLandingPage(
  id: string,
  data: Partial<Omit<LandingPage, "id" | "createdAt" | "updatedAt">>
): Promise<LandingPage> {
  const now = new Date();
  const updateData = {
    ...data,
    updatedAt: now,
  };

  await db.collection("landing-pages").doc(id).update(updateData);
  revalidatePath("/admin/landing-pages");
  revalidatePath("/l/[slug]");
  
  const doc = await db.collection("landing-pages").doc(id).get();
  if (!doc.exists) {
    throw new Error("Landing page not found");
  }

  const docData = doc.data()!;
  return {
    id: doc.id,
    title: docData.title,
    slug: docData.slug,
    description: docData.description,
    components: docData.components,
    navigation: docData.navigation,
    isActive: docData.isActive,
    metadata: docData.metadata,
    createdAt: docData.createdAt ? new Date(docData.createdAt.seconds * 1000) : new Date(),
    updatedAt: docData.updatedAt ? new Date(docData.updatedAt.seconds * 1000) : new Date(),
  } as LandingPage;
}

export async function deleteLandingPage(id: string): Promise<void> {
  await db.collection("landing-pages").doc(id).delete();
  revalidatePath("/admin/landing-pages");
}

export async function duplicateLandingPage(id: string): Promise<LandingPage> {
  // Get the original landing page
  const doc = await db.collection("landing-pages").doc(id).get();
  if (!doc.exists) {
    throw new Error("Landing page not found");
  }

  const originalData = doc.data()!;
  
  // Create new title and slug
  const newTitle = `${originalData.title} (Kopie)`;
  const newSlug = `${originalData.slug}-copy`;

  // Create new landing page data, keeping all original data but updating specific fields
  const duplicateData: Omit<LandingPage, "id" | "createdAt" | "updatedAt"> = {
    title: newTitle,
    slug: newSlug,
    description: originalData.description,
    components: originalData.components,
    navigation: originalData.navigation,
    isActive: false, // Set to inactive by default
    metadata: originalData.metadata,
  };

  // Create the duplicate
  const newLandingPage = await createLandingPage(duplicateData);
  revalidatePath("/admin/landing-pages");

  return newLandingPage;
}
