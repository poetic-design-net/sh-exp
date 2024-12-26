"use server";

import { storage } from "lib/firebase-admin-server";
import { db } from "lib/firebase-admin-server";
import sharp from 'sharp';

export interface MediaItem {
  id: string;
  url: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: Date;
  updatedAt: Date;
  path?: string;
  directory?: string;
  category?: string;
  tags?: string[];
  productId?: string;
  variants?: {
    thumbnail?: { url: string; size: number };
    full?: { url: string; size: number };
  };
}

const SIZES = {
  thumbnail: 400,
  full: 1920
};

async function processImage(buffer: Buffer, width: number, isMax: boolean = false): Promise<Buffer> {
  try {
    // Initialize sharp with memory-efficient settings
    const image = sharp(buffer, {
      limitInputPixels: 268402689, // 16384 x 16384 pixels
      sequentialRead: true
    }).rotate(); // Auto-rotate based on EXIF

    // Get image info to make intelligent compression decisions
    const metadata = await image.metadata();
    const isPhotographic = metadata.hasAlpha;

    // Memory efficient pipeline
    return await image
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true,
        kernel: 'lanczos2' // Less memory intensive than default
      })
      .webp({
        quality: isMax ? 75 : 65,
        effort: 2, // Lower effort = less memory usage
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
        alphaQuality: isPhotographic ? 75 : 65,
        force: true
      })
      .toBuffer({ resolveWithObject: false }); // Don't include metadata in response
  } catch (error) {
    console.error('Error in processImage:', error);
    throw error;
  }
}

function getWebPFilename(originalFilename: string, size: string): string {
  // Remove any existing extension and add .webp
  const baseName = originalFilename.replace(/\.[^/.]+$/, '');
  return `${baseName}-${size}.webp`;
}

interface VariantResult {
  url: string;
  size: number;
  variantName: string;
}

async function uploadImageVariant(
  bucket: any,
  buffer: Buffer,
  originalFilename: string,
  variantName: string
): Promise<VariantResult> {
  try {
    const width = SIZES[variantName as keyof typeof SIZES];
    const isMax = variantName === 'max';
    const processedBuffer = await processImage(buffer, width, isMax);
    
    // Create WebP filename
    const webpFilename = getWebPFilename(originalFilename, variantName);
    const variantPath = `media/${Date.now()}-${webpFilename}`;
    
    const fileRef = bucket.file(variantPath);

    await fileRef.save(processedBuffer, {
      metadata: {
        contentType: 'image/webp',
      },
    });

    await fileRef.makePublic();
    
    const url = `https://storage.googleapis.com/${bucket.name}/${variantPath}`;
    
    return {
      url,
      size: processedBuffer.length,
      variantName
    };
  } catch (error) {
    console.error(`Error in uploadImageVariant for size ${variantName}:`, error);
    throw error;
  }
}

export async function uploadMedia(
  file: Buffer,
  filename: string,
  contentType: string,
  category?: string,
  tags?: string[]
): Promise<MediaItem> {
  try {
    const bucket = storage.bucket();
    const isImage = contentType.startsWith('image/');
    
    let variants: { [key: string]: { url: string; size: number } } = {};
    let mainUrl: string;
    let mainSize: number;
    
    if (isImage) {
      // Process variants sequentially to reduce memory usage
      const variantNames = Object.keys(SIZES);
      const results = [];
      
      for (const variantName of variantNames) {
        const result = await uploadImageVariant(
          bucket,
          file,
          filename,
          variantName
        );
        console.log(`${variantName} variant size:`, result.size);
        results.push(result);
        
        // Clear buffer after each variant
        if (global.gc) {
          global.gc();
        }
      }

      // Store URLs and sizes in variants
      results.forEach(({ variantName, url, size }) => {
        if (variantName === 'thumbnail' || variantName === 'full') {
          variants[variantName] = { url, size };
        }
      });

      // Use full variant as main
      const fullVariant = results.find(r => r.variantName === 'full');
      mainUrl = fullVariant?.url || '';
      mainSize = fullVariant?.size || 0;
    } else {
      // For non-image files, upload as-is
      const path = `media/${Date.now()}-${filename}`;
      const fileRef = bucket.file(path);
      await fileRef.save(file, {
        metadata: { contentType },
      });
      await fileRef.makePublic();
      mainUrl = `https://storage.googleapis.com/${bucket.name}/${path}`;
      mainSize = file.length;
    }

    const derivedCategory = category || 'general';

    const mediaItem: Omit<MediaItem, 'id'> = {
      url: mainUrl,
      filename: isImage ? getWebPFilename(filename, 'full') : filename,
      contentType: isImage ? 'image/webp' : contentType,
      size: mainSize,
      createdAt: new Date(),
      updatedAt: new Date(),
      directory: 'media',
      category: derivedCategory,
      tags: tags || [],
      variants: isImage ? {
        thumbnail: variants.thumbnail,
        full: variants.full
      } : undefined
    };

    const docRef = await db.collection('media').add(mediaItem);

    return {
      id: docRef.id,
      ...mediaItem,
    };
  } catch (error) {
    console.error("Error in uploadMedia:", error);
    throw error;
  }
}

export async function deleteMedia(id: string): Promise<void> {
  try {
    const doc = await db.collection('media').doc(id).get();
    if (!doc.exists) {
      throw new Error('Media item not found');
    }

    const mediaItem = doc.data() as MediaItem;
    const bucket = storage.bucket();
    
    // Delete all variants if they exist
    if (mediaItem.variants) {
      for (const variant of Object.values(mediaItem.variants)) {
        if (variant?.url) {
          try {
            const path = decodeURIComponent(variant.url.split('/')[4]); // Updated to work with new URL structure
            await bucket.file(path).delete();
          } catch (error) {
            console.error("Error deleting variant:", error);
          }
        }
      }
    }

    // Always delete from Firestore
    await db.collection('media').doc(id).delete();
  } catch (error) {
    console.error("Error deleting media:", error);
    throw error;
  }
}

export async function getMediaItems({ 
  page = 1, 
  limit = 20,
  category
}: { 
  page?: number; 
  limit?: number;
  category?: string;
} = {}): Promise<{ items: MediaItem[]; total: number }> {
  // Start with base query
  let query = db.collection('media')
    .orderBy('createdAt', 'desc');
  
  // Add category filter if specified
  if (category) {
    query = query.where('category', '==', category);
  }

  // Get total count
  const countSnapshot = await query.count().get();
  const total = countSnapshot.data().count;

  // Apply pagination
  const offset = (page - 1) * limit;
  const snapshot = await query
    .limit(limit)
    .offset(offset)
    .get();

  const items = snapshot.docs
    .map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        ...data,
        createdAt: data.createdAt?.toDate(),
        updatedAt: data.updatedAt?.toDate(),
      } as MediaItem;
    })
    .filter(item => !item.filename.includes('-thumbnail.webp'));

  return { items, total };
}

export async function updateMediaTags(id: string, tags: string[]): Promise<void> {
  try {
    await db.collection('media').doc(id).update({ tags });
  } catch (error) {
    console.error("Error updating media tags:", error);
    throw error;
  }
}

export async function updateMediaCategory(id: string, category: string): Promise<void> {
  try {
    await db.collection('media').doc(id).update({ category });
  } catch (error) {
    console.error("Error updating media category:", error);
    throw error;
  }
}
