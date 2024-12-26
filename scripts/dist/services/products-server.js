import { db } from "@/lib/firebase-admin-server";
// Helper function to convert Firestore data to Product type
function convertFirestoreData(doc) {
    const data = doc.data();
    if (!data)
        throw new Error("Document data is undefined");
    // Handle stock based on WooCommerce data if available
    let stockValue = 0;
    if (data.stockQuantity !== undefined) {
        stockValue = data.stockQuantity;
    }
    else if (data.stock !== undefined) {
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
export async function getProducts() {
    const snapshot = await db.collection("products").get();
    return snapshot.docs.map(convertFirestoreData);
}
export async function getProductById(id) {
    const doc = await db.collection("products").doc(id).get();
    if (!doc.exists)
        return null;
    return convertFirestoreData(doc);
}
export async function getProductBySlug(slug) {
    const snapshot = await db
        .collection("products")
        .where("slug", "==", slug)
        .limit(1)
        .get();
    if (snapshot.empty)
        return null;
    return convertFirestoreData(snapshot.docs[0]);
}
export async function getProductsByCategory(categoryId) {
    const snapshot = await db
        .collection("products")
        .where("categoryIds", "array-contains", categoryId)
        .get();
    return snapshot.docs.map(convertFirestoreData);
}
export async function createProduct(data) {
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
export async function updateProduct(id, data) {
    const updateData = {
        ...data,
        updatedAt: Date.now(),
    };
    await db.collection("products").doc(id).update(updateData);
    const updatedDoc = await db.collection("products").doc(id).get();
    return convertFirestoreData(updatedDoc);
}
export async function deleteProduct(id) {
    await db.collection("products").doc(id).delete();
}
