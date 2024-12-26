"use server";

import { db } from "@/lib/firebase-admin-server";
import type { Funnel } from "@/types/funnel";
import { revalidatePath } from "next/cache";
import { Timestamp } from 'firebase-admin/firestore';

function isValidDate(date: any): date is Date {
  return date instanceof Date && !isNaN(date.getTime());
}

function convertToFirestoreDate(date: any): Timestamp {
  if (!date) {
    console.warn('Invalid date provided:', date);
    return Timestamp.now();
  }

  try {
    if (date instanceof Date) {
      return Timestamp.fromDate(date);
    }
    if (date instanceof Timestamp) {
      return date;
    }
    if (typeof date === 'object' && date.seconds) {
      return new Timestamp(date.seconds, date.nanoseconds || 0);
    }
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return Timestamp.fromDate(parsedDate);
      }
    }
    console.warn('Falling back to current timestamp for:', date);
    return Timestamp.now();
  } catch (error) {
    console.error('Error converting date:', error);
    return Timestamp.now();
  }
}

function convertFromFirestoreDate(date: any): Date {
  if (!date) {
    console.warn('Invalid date provided:', date);
    return new Date();
  }

  try {
    if (date instanceof Date) {
      return date;
    }
    if (date instanceof Timestamp) {
      return date.toDate();
    }
    if (typeof date === 'object' && date.seconds) {
      return new Date(date.seconds * 1000);
    }
    if (typeof date === 'string') {
      const parsedDate = new Date(date);
      if (!isNaN(parsedDate.getTime())) {
        return parsedDate;
      }
    }
    console.warn('Falling back to current date for:', date);
    return new Date();
  } catch (error) {
    console.error('Error converting date:', error);
    return new Date();
  }
}

function convertToFirestoreData(data: any): any {
  if (!data) return null;

  if (data instanceof Date) {
    return convertToFirestoreDate(data);
  }

  if (Array.isArray(data)) {
    return data.map(item => convertToFirestoreData(item));
  }

  if (typeof data === 'object') {
    const result: any = {};
    for (const key in data) {
      if (data[key] !== undefined) {
        result[key] = convertToFirestoreData(data[key]);
      }
    }
    return result;
  }

  return data;
}

export async function getFunnels(): Promise<Funnel[]> {
  const snapshot = await db.collection("funnels").get();
  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      name: data.name,
      slug: data.slug,
      products: data.products,
      settings: {
        checkoutStyle: data.settings?.checkoutStyle || "integrated",
        upsellDiscount: data.settings?.upsellDiscount || 10,
        mainProductDiscount: data.settings?.mainProductDiscount || 0,
        countdown: data.settings?.countdown ? {
          startDate: convertFromFirestoreDate(data.settings.countdown.startDate),
          endDate: convertFromFirestoreDate(data.settings.countdown.endDate),
          redirectUrl: data.settings.countdown.redirectUrl || "",
        } : undefined,
      },
      content: {
        testimonials: data.content?.testimonials || [],
        faq: data.content?.faq || [],
      },
      analytics: {
        conversionRate: data.analytics?.conversionRate || 0,
        totalSales: data.analytics?.totalSales || 0,
      },
      isActive: data.isActive,
      createdAt: convertFromFirestoreDate(data.createdAt),
      updatedAt: convertFromFirestoreDate(data.updatedAt),
    } as Funnel;
  });
}

export async function getFunnelBySlug(slug: string): Promise<Funnel | null> {
  const snapshot = await db
    .collection("funnels")
    .where("slug", "==", slug)
    .limit(1)
    .get();

  if (snapshot.empty) return null;
  
  const doc = snapshot.docs[0];
  const data = doc.data();
  return {
    id: doc.id,
    name: data.name,
    slug: data.slug,
    products: data.products,
    settings: {
      checkoutStyle: data.settings?.checkoutStyle || "integrated",
      upsellDiscount: data.settings?.upsellDiscount || 10,
      mainProductDiscount: data.settings?.mainProductDiscount || 0,
      countdown: data.settings?.countdown ? {
        startDate: convertFromFirestoreDate(data.settings.countdown.startDate),
        endDate: convertFromFirestoreDate(data.settings.countdown.endDate),
        redirectUrl: data.settings.countdown.redirectUrl || "",
      } : undefined,
    },
    content: {
      testimonials: data.content?.testimonials || [],
      faq: data.content?.faq || [],
    },
    analytics: {
      conversionRate: data.analytics?.conversionRate || 0,
      totalSales: data.analytics?.totalSales || 0,
    },
    isActive: data.isActive,
    createdAt: convertFromFirestoreDate(data.createdAt),
    updatedAt: convertFromFirestoreDate(data.updatedAt),
  } as Funnel;
}

export async function createFunnel(
  data: Omit<Funnel, "id" | "createdAt" | "updatedAt" | "analytics">
): Promise<Funnel> {
  const now = new Date();
  const funnelData = {
    ...data,
    analytics: {
      conversionRate: 0,
      totalSales: 0,
    },
    createdAt: now,
    updatedAt: now,
  };

  const firestoreData = convertToFirestoreData(funnelData);
  const docRef = await db.collection("funnels").add(firestoreData);
  revalidatePath("/admin/funnels");
  
  return {
    id: docRef.id,
    ...funnelData,
  } as Funnel;
}

export async function updateFunnel(
  id: string,
  data: Partial<Omit<Funnel, "id" | "createdAt" | "updatedAt">>
): Promise<Funnel> {
  const now = new Date();
  
  // Get the current funnel data
  const currentDoc = await db.collection("funnels").doc(id).get();
  if (!currentDoc.exists) {
    throw new Error("Funnel not found");
  }

  // Convert dates to Firestore Timestamps
  const updateData = {
    ...data,
    updatedAt: now,
  };

  console.log('Data before Firestore conversion:', JSON.stringify(updateData, null, 2));
  const firestoreData = convertToFirestoreData(updateData);
  console.log('Data after Firestore conversion:', JSON.stringify(firestoreData, null, 2));

  // Update the document
  await db.collection("funnels").doc(id).update(firestoreData);
  revalidatePath("/admin/funnels");
  revalidatePath("/angebot/[slug]");
  
  // Fetch and return the updated document
  const doc = await db.collection("funnels").doc(id).get();
  const docData = doc.data()!;
  return {
    id: doc.id,
    name: docData.name,
    slug: docData.slug,
    products: docData.products,
    settings: {
      checkoutStyle: docData.settings?.checkoutStyle || "integrated",
      upsellDiscount: docData.settings?.upsellDiscount || 10,
      mainProductDiscount: docData.settings?.mainProductDiscount || 0,
      countdown: docData.settings?.countdown ? {
        startDate: convertFromFirestoreDate(docData.settings.countdown.startDate),
        endDate: convertFromFirestoreDate(docData.settings.countdown.endDate),
        redirectUrl: docData.settings.countdown.redirectUrl || "",
      } : undefined,
    },
    content: {
      testimonials: docData.content?.testimonials || [],
      faq: docData.content?.faq || [],
    },
    analytics: {
      conversionRate: docData.analytics?.conversionRate || 0,
      totalSales: docData.analytics?.totalSales || 0,
    },
    isActive: docData.isActive,
    createdAt: convertFromFirestoreDate(docData.createdAt),
    updatedAt: convertFromFirestoreDate(docData.updatedAt),
  } as Funnel;
}

export async function deleteFunnel(id: string): Promise<void> {
  await db.collection("funnels").doc(id).delete();
  revalidatePath("/admin/funnels");
}

export async function updateFunnelAnalytics(
  id: string, 
  data: { conversionRate?: number; totalSales?: number }
): Promise<void> {
  const doc = await db.collection("funnels").doc(id).get();
  if (!doc.exists) {
    throw new Error("Funnel not found");
  }

  const currentAnalytics = doc.data()?.analytics || {
    conversionRate: 0,
    totalSales: 0,
  };

  await db.collection("funnels").doc(id).update({
    analytics: {
      ...currentAnalytics,
      ...data,
    },
    updatedAt: convertToFirestoreDate(new Date()),
  });

  revalidatePath("/admin/funnels");
}
