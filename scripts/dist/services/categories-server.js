import { db } from "@/lib/firebase-admin";
async function processImageUrl(imageData) {
    if (!imageData)
        return undefined;
    // Handle both string URLs and object formats
    const imageUrl = typeof imageData === 'string' ? imageData : (imageData.src || imageData.url);
    if (!imageUrl)
        return undefined;
    return imageUrl;
}
export async function getCategories() {
    const snapshot = await db.collection("categories").get();
    const categories = await Promise.all(snapshot.docs.map(async (doc) => {
        const data = doc.data();
        let images;
        // Handle old image format
        if (data.image) {
            const imageUrl = await processImageUrl(data.image);
            images = imageUrl ? [imageUrl] : undefined;
        }
        return {
            id: doc.id,
            name: data.name,
            description: data.description,
            slug: data.slug,
            parentId: data.parentId,
            images: images || data.images,
            createdAt: data.createdAt,
            updatedAt: data.updatedAt
        };
    }));
    return categories;
}
export async function getCategoryById(id) {
    const doc = await db.collection("categories").doc(id).get();
    if (!doc.exists)
        return null;
    const data = doc.data();
    let images;
    // Handle old image format
    if (data.image) {
        const imageUrl = await processImageUrl(data.image);
        images = imageUrl ? [imageUrl] : undefined;
    }
    return {
        id: doc.id,
        name: data.name,
        description: data.description,
        slug: data.slug,
        parentId: data.parentId,
        images: images || data.images,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}
export async function getCategoryBySlug(slug) {
    const snapshot = await db
        .collection("categories")
        .where("slug", "==", slug)
        .limit(1)
        .get();
    if (snapshot.empty)
        return null;
    const doc = snapshot.docs[0];
    const data = doc.data();
    let images;
    // Handle old image format
    if (data.image) {
        const imageUrl = await processImageUrl(data.image);
        images = imageUrl ? [imageUrl] : undefined;
    }
    return {
        id: doc.id,
        name: data.name,
        description: data.description,
        slug: data.slug,
        parentId: data.parentId,
        images: images || data.images,
        createdAt: data.createdAt,
        updatedAt: data.updatedAt
    };
}
export async function createCategory(data) {
    const now = Date.now();
    const categoryData = {
        ...data,
        createdAt: now,
        updatedAt: now,
    };
    const docRef = await db.collection("categories").add(categoryData);
    return { id: docRef.id, ...categoryData };
}
export async function updateCategory(id, data) {
    const updateData = {
        ...data,
        updatedAt: Date.now(),
    };
    await db.collection("categories").doc(id).update(updateData);
    const updatedDoc = await db.collection("categories").doc(id).get();
    const updatedData = updatedDoc.data();
    return {
        id: updatedDoc.id,
        name: updatedData.name,
        description: updatedData.description,
        slug: updatedData.slug,
        parentId: updatedData.parentId,
        images: updatedData.images,
        createdAt: updatedData.createdAt,
        updatedAt: updatedData.updatedAt
    };
}
export async function deleteCategory(id) {
    await db.collection("categories").doc(id).delete();
}
