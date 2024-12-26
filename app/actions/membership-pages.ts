"use server";

import { db } from "@/lib/firebase-admin-server";
import type { 
  MembershipPage, 
  CreateMembershipPageInput, 
  UpdateMembershipPageInput 
} from "@/types/membership-page";
import { revalidatePath } from "next/cache";

// Cache for membership pages
const pagesCache = new Map<string, { data: MembershipPage[], timestamp: number }>();
const PAGE_CACHE_TTL = 5 * 60 * 1000; // 5 minutes cache

export async function getMembershipPages(membershipId?: string): Promise<MembershipPage[]> {
  const cacheKey = `membership-pages-${membershipId || 'all'}`;
  
  // Check cache first
  const cached = pagesCache.get(cacheKey);
  if (cached && (Date.now() - cached.timestamp) < PAGE_CACHE_TTL) {
    return cached.data;
  }

  let query = db.collection("membership_pages")
    .orderBy("createdAt", "desc");

  if (membershipId) {
    query = query.where("membershipId", "==", membershipId);
  }
  
  const snapshot = await query.get();

  const pages = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data(),
  })) as MembershipPage[];

  // Update cache
  pagesCache.set(cacheKey, { data: pages, timestamp: Date.now() });

  return pages;
}

export async function getMembershipPageBySlug(slug: string): Promise<MembershipPage | null> {
  const snapshot = await db
    .collection("membership_pages")
    .where("slug", "==", slug)
    .where("isPublished", "==", true)
    .limit(1)
    .get();

  if (snapshot.empty) {
    return null;
  }

  const doc = snapshot.docs[0];
  return {
    id: doc.id,
    ...doc.data(),
  } as MembershipPage;
}

export async function getMembershipPageById(id: string): Promise<MembershipPage | null> {
  const doc = await db.collection("membership_pages").doc(id).get();
  
  if (!doc.exists) {
    return null;
  }

  return {
    id: doc.id,
    ...doc.data(),
  } as MembershipPage;
}

export async function createMembershipPage(input: CreateMembershipPageInput): Promise<MembershipPage> {
  // Validate slug uniqueness
  const existingPage = await getMembershipPageBySlug(input.slug);
  if (existingPage) {
    throw new Error("Eine Seite mit dieser URL existiert bereits");
  }

  const now = Date.now();
  const data = {
    ...input,
    createdAt: now,
    updatedAt: now,
  };
  
  const docRef = await db.collection("membership_pages").add(data);
  
  // Revalidate admin pages list and the new page
  revalidatePath("/admin/membership-pages");
  revalidatePath(`/mitgliedschaft/${input.slug}`);
  
  return {
    id: docRef.id,
    ...data,
  };
}

export async function updateMembershipPage(id: string, input: UpdateMembershipPageInput): Promise<MembershipPage> {
  // If slug is being updated, validate uniqueness
  if (input.slug) {
    const existingPage = await getMembershipPageBySlug(input.slug);
    if (existingPage && existingPage.id !== id) {
      throw new Error("Eine Seite mit dieser URL existiert bereits");
    }
  }

  const now = Date.now();
  const data = {
    ...input,
    updatedAt: now,
  };
  
  await db.collection("membership_pages").doc(id).update(data);
  
  const updatedPage = await getMembershipPageById(id);
  if (!updatedPage) {
    throw new Error("Seite nicht gefunden");
  }

  // Revalidate admin pages list and the updated page
  revalidatePath("/admin/membership-pages");
  revalidatePath(`/mitgliedschaft/${updatedPage.slug}`);
  
  return updatedPage;
}

export async function deleteMembershipPage(id: string): Promise<void> {
  const page = await getMembershipPageById(id);
  if (!page) {
    throw new Error("Seite nicht gefunden");
  }

  await db.collection("membership_pages").doc(id).delete();
  
  // Revalidate admin pages list and the deleted page
  revalidatePath("/admin/membership-pages");
  revalidatePath(`/mitgliedschaft/${page.slug}`);
}
