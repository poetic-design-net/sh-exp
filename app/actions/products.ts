"use server";

import { db } from "@/lib/firebase-admin-server";
import type { Product } from "@/types/product";
import { cache } from 'react';

// Helper function to convert Firebase timestamp to milliseconds
const convertTimestamp = (timestamp: { seconds: number } | undefined) => 
  timestamp ? timestamp.seconds * 1000 : Date.now();

// Helper function to convert Firebase document to Product
const convertDocToProduct = (doc: FirebaseFirestore.DocumentSnapshot): Product => {
  const data = doc.data();
  return {
    id: doc.id,
    ...data,
    createdAt: convertTimestamp(data?.createdAt),
    updatedAt: convertTimestamp(data?.updatedAt),
  } as Product;
};

// Cache the products list for 1 minute
export const getProducts = cache(async (): Promise<Product[]> => {
  const snapshot = await db.collection("products").get();
  return snapshot.docs.map(convertDocToProduct);
});

// Cache individual product fetches
export const getProductById = cache(async (id: string): Promise<Product | null> => {
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return convertDocToProduct(doc);
});

export async function getProductDetails(id: string): Promise<Product | null> {
  return getProductById(id);
}

// Optimize batch fetching with chunking
export async function getProductsByIds(ids: string[]): Promise<Product[]> {
  if (ids.length === 0) return [];
  
  // Firebase has a limit of 10 items for 'in' queries
  const chunkSize = 10;
  const chunks = [];
  
  for (let i = 0; i < ids.length; i += chunkSize) {
    chunks.push(ids.slice(i, i + chunkSize));
  }

  const productPromises = chunks.map(async (chunk) => {
    const snapshot = await db
      .collection("products")
      .where("id", "in", chunk)
      .get();
    
    return snapshot.docs.map(convertDocToProduct);
  });

  const productsArrays = await Promise.all(productPromises);
  return productsArrays.flat();
}

// Add a new helper for efficient product existence checking
export async function checkProductsExist(ids: string[]): Promise<boolean> {
  if (ids.length === 0) return true;
  
  const products = await getProductsByIds(ids);
  return products.length === ids.length;
}

// Add a helper for getting active products only
export async function getActiveProducts(): Promise<Product[]> {
  const snapshot = await db
    .collection("products")
    .where("isActive", "==", true)
    .get();
  
  return snapshot.docs.map(convertDocToProduct);
}

// Add a helper for getting products by category
export async function getProductsByCategory(categoryId: string): Promise<Product[]> {
  const snapshot = await db
    .collection("products")
    .where("categoryIds", "array-contains", categoryId)
    .where("isActive", "==", true)
    .get();
  
  return snapshot.docs.map(convertDocToProduct);
}
