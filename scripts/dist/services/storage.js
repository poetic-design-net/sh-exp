import { storage } from "@/lib/firebase-admin";
export async function uploadProductImage(file, filename) {
    try {
        const bucket = storage.bucket();
        const path = `products/${Date.now()}-${filename}`;
        const fileRef = bucket.file(path);
        await fileRef.save(file, {
            metadata: {
                contentType: "image/jpeg", // Adjust based on file type
            },
        });
        // Make the file publicly accessible
        await fileRef.makePublic();
        // Get the public URL
        return `https://storage.googleapis.com/${bucket.name}/${path}`;
    }
    catch (error) {
        console.error("Error uploading image:", error);
        throw error;
    }
}
export async function deleteProductImage(url) {
    try {
        const bucket = storage.bucket();
        const path = url.split(`${bucket.name}/`)[1];
        await bucket.file(path).delete();
    }
    catch (error) {
        console.error("Error deleting image:", error);
        throw error;
    }
}
