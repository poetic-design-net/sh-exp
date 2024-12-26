import { db } from 'lib/firebase-admin-server';
import { FieldPath, Query, CollectionReference } from 'firebase-admin/firestore';
import type { Product } from 'types/product';
import { createCachedFunction, CACHE_TAGS } from 'lib/cache';

// Helper function to convert Firestore data to Product type
function convertFirestoreData(doc: FirebaseFirestore.DocumentSnapshot): Product {
  const data = doc.data();
  if (!data) throw new Error("Document data is undefined");

  // Handle stock based on WooCommerce data if available
  let stockValue = 0;
  if (data.stockQuantity !== undefined) {
    stockValue = data.stockQuantity;
  } else if (data.stock !== undefined) {
    stockValue = data.stock;
  }

  return {
    id: doc.id,
    name: data.name || "",
    slug: data.slug || doc.id,
    description: data.description || "",
    price: data.price || 0,
    categoryIds: data.categoryIds || [],
    categories: data.categories || [],
    stock: stockValue,
    stockStatus: data.stockStatus,
    stockQuantity: data.stockQuantity,
    images: data.images || [],
    avifImages: data.avifImages || [],  // AVIF-optimierte Bildversionen
    isActive: data.isActive ?? true,
    isSubscription: data.isSubscription || false,
    subscription: data.subscription ? {
      price: data.subscription.price || 0,
      period: data.subscription.period || 'month',
      length: data.subscription.length || 0,
      trialLength: data.subscription.trialLength || 0
    } : undefined,
    catalogVisibility: data.catalogVisibility || 'visible',
    status: data.status || 'publish',
    createdAt: data.createdAt?._seconds ? data.createdAt._seconds * 1000 : Date.now(),
    updatedAt: data.updatedAt?._seconds ? data.updatedAt._seconds * 1000 : Date.now(),
    wooCommerceId: data.wooCommerceId,
  };
}

export interface PaginatedProducts {
  products: Product[];
  total: number;
  hasMore: boolean;
}

export interface GetProductsOptions {
  ids?: string[];
}

export const getProducts = createCachedFunction(
  async (page: number = 1, limit: number = 10, options?: GetProductsOptions): Promise<PaginatedProducts> => {
    const baseQuery = db.collection("products") as CollectionReference;
    let query: Query = baseQuery;
    
    // If specific IDs are requested, use where-in clause
    if (options?.ids && options.ids.length > 0) {
      // Firebase limits 'in' queries to 10 items
      const batchSize = 10;
      const batches: Query[] = [];
      
      for (let i = 0; i < options.ids.length; i += batchSize) {
        const batchIds = options.ids.slice(i, i + batchSize);
        batches.push(baseQuery.where(FieldPath.documentId(), "in", batchIds));
      }
      
      if (batches.length === 1) {
        query = batches[0];
      } else if (batches.length > 1) {
        // For multiple batches, we need to merge results later
        // For now, just use the first batch
        query = batches[0];
      }
    }

    // Get total count
    let total = 0;
    if (options?.ids?.length) {
      total = options.ids.length;
    } else {
      const totalSnapshot = await query.count().get();
      total = totalSnapshot.data().count;
    }

    // Get paginated data with limit
    const snapshot = await query
      .orderBy("createdAt", "desc")
      .limit(limit)
      .offset((page - 1) * limit)
      .get();

    const products = snapshot.docs.map(convertFirestoreData);
    const hasMore = total > page * limit;

    return {
      products,
      total,
      hasMore
    };
  },
  {
    tags: [CACHE_TAGS.products],
    revalidateSeconds: 300 // 5 minutes
  }
);

export async function getProductById(id: string): Promise<Product | null> {
  const doc = await db.collection("products").doc(id).get();
  if (!doc.exists) return null;
  return convertFirestoreData(doc);
}

export const getProductBySlug = createCachedFunction(
  async (slug: string): Promise<Product | null> => {
    const snapshot = await db
      .collection("products")
      .where("slug", "==", slug)
      .limit(1)
      .get();
    
    return snapshot.empty ? null : convertFirestoreData(snapshot.docs[0]);
  },
  {
    tags: [CACHE_TAGS.products],
    revalidateSeconds: 300 // 5 minutes
  }
);

export const getProductsByCategory = createCachedFunction(
  async (categoryId: string): Promise<Product[]> => {
    const snapshot = await db
      .collection("products")
      .where("categoryIds", "array-contains", categoryId)
      .where("isActive", "==", true)
      .orderBy("createdAt", "desc")
      .limit(50) // Limit products per category
      .get();

    return snapshot.docs.map(convertFirestoreData);
  },
  {
    tags: [CACHE_TAGS.products],
    revalidateSeconds: 300 // 5 minutes
  }
);

export async function createProduct(data: Omit<Product, "id" | "createdAt" | "updatedAt">): Promise<Product> {
  const now = Date.now();
  const productData = {
    ...data,
    isActive: true, // Set to active by default for new products
    catalogVisibility: data.catalogVisibility || 'visible',
    status: data.status || 'publish',
    createdAt: now,
    updatedAt: now,
  };

  const docRef = await db.collection("products").add(productData);
  const newDoc = await docRef.get();
  return convertFirestoreData(newDoc);
}

export async function updateProduct(id: string, data: Partial<Omit<Product, "id" | "createdAt" | "updatedAt">>): Promise<Product> {
  const updateData = {
    ...data,
    updatedAt: Date.now(),
  };

  await db.collection("products").doc(id).update(updateData);
  const updatedDoc = await db.collection("products").doc(id).get();
  return convertFirestoreData(updatedDoc);
}

export async function deleteProduct(id: string): Promise<void> {
  await db.collection("products").doc(id).delete();
}
