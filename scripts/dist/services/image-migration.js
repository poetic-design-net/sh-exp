import { storage } from '../lib/firebase-admin';
import sharp from 'sharp';
import fetch from 'node-fetch';
const defaultOptions = {
    width: 1200,
    quality: 80,
    format: 'webp'
};
export async function migrateImage(imageUrl, destinationPath, options = defaultOptions) {
    try {
        const bucket = storage.bucket();
        const response = await fetch(imageUrl);
        if (!response.ok) {
            throw new Error(`Failed to fetch image: ${response.statusText}`);
        }
        const arrayBuffer = await response.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const sharpInstance = sharp(buffer);
        const optimizedBuffer = await sharpInstance
            .resize(options.width, null, {
            withoutEnlargement: true,
            fit: 'inside'
        })
            .webp({ quality: options.quality })
            .toBuffer();
        const file = bucket.file(destinationPath);
        await file.save(optimizedBuffer, {
            metadata: {
                contentType: 'image/webp'
            },
            validation: false,
            resumable: false
        });
        await file.makePublic();
        const publicUrl = `https://storage.googleapis.com/${bucket.name}/${file.name}`;
        return {
            success: true,
            url: publicUrl
        };
    }
    catch (error) {
        return {
            success: false,
            error: error.message
        };
    }
}
export async function migrateProductImages(productId, images) {
    const sizes = [
        { width: 1200, suffix: 'large' },
        { width: 800, suffix: 'medium' },
        { width: 400, suffix: 'small' }
    ];
    const migratedUrls = [];
    for (let i = 0; i < images.length; i++) {
        const imageUrl = images[i];
        try {
            const imageVersions = await Promise.all(sizes.map(async (size) => {
                const fileName = `products/${productId}/image-${i + 1}-${size.suffix}.webp`;
                return await migrateImage(imageUrl, fileName, {
                    ...defaultOptions,
                    width: size.width
                });
            }));
            const largeVersion = imageVersions[0];
            if (largeVersion.success && largeVersion.url) {
                migratedUrls.push(largeVersion.url);
            }
        }
        catch (error) {
            console.error(`Error migrating image ${imageUrl}:`, error);
        }
    }
    return migratedUrls;
}
export function isFirebaseStorageUrl(url) {
    return url.startsWith('https://storage.googleapis.com/') ||
        url.startsWith('https://firebasestorage.googleapis.com/');
}
export function generateSrcSet(baseUrl) {
    const sizes = [
        { width: 1200, suffix: 'large' },
        { width: 800, suffix: 'medium' },
        { width: 400, suffix: 'small' }
    ];
    return sizes
        .map(size => {
        const url = baseUrl.replace('-large.webp', `-${size.suffix}.webp`);
        return `${url} ${size.width}w`;
    })
        .join(', ');
}
