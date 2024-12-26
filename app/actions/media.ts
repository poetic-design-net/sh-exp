"use server";

import { storage } from "lib/firebase-admin-server";
import { db } from "lib/firebase-admin-server";
import sharp from 'sharp';
import type { MediaItem } from "services/server/media-library";

const SIZES = {
  thumbnail: 150,
  small: 400,
  medium: 800,
  large: 1200,
  max: 1920
};

async function processImage(buffer: Buffer, width: number, isMax: boolean = false): Promise<Buffer> {
  try {
    const image = sharp(buffer, {
      limitInputPixels: 268402689,
      sequentialRead: true
    });

    const metadata = await image.metadata();
    const isPhotographic = metadata.hasAlpha;

    return await image
      .resize(width, null, {
        fit: 'inside',
        withoutEnlargement: true,
        fastShrinkOnLoad: true
      })
      .webp({
        quality: isMax ? 70 : 60,
        effort: 4,
        lossless: false,
        nearLossless: false,
        smartSubsample: true,
        alphaQuality: isPhotographic ? 70 : 60,
        force: true
      })
      .toBuffer();
  } catch (error) {
    console.error('Error in processImage:', error);
    throw error;
  }
}

function getWebPFilename(originalFilename: string, size: string): string {
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
    let width: number | undefined;
    let height: number | undefined;
    
    if (isImage) {
      console.log('Original file size:', file.length);
      
      const metadata = await sharp(file).metadata();
      width = metadata.width || undefined;
      height = metadata.height || undefined;
      
      const results = await Promise.all(
        Object.keys(SIZES).map(async (variantName) => {
          const result = await uploadImageVariant(
            bucket,
            file,
            filename,
            variantName
          );
          console.log(`${variantName} variant size:`, result.size);
          return result;
        })
      );

      results.forEach(({ variantName, url, size }) => {
        variants[variantName] = { url, size };
      });

      const largeVariant = results.find(r => r.variantName === 'large');
      mainUrl = largeVariant?.url || variants.medium.url;
      mainSize = largeVariant?.size || variants.medium.size;
    } else {
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
      filename: isImage ? getWebPFilename(filename, 'large') : filename,
      contentType: isImage ? 'image/webp' : contentType,
      size: mainSize,
      createdAt: new Date(),
      updatedAt: new Date(),
      directory: 'media',
      category: derivedCategory,
      tags: tags || [],
      width: isImage ? width : undefined,
      height: isImage ? height : undefined,
      variants: isImage ? {
        thumbnail: variants.thumbnail,
        small: variants.small,
        medium: variants.medium,
        large: variants.large,
        max: variants.max
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
    
    if (mediaItem.variants) {
      for (const variant of Object.values(mediaItem.variants)) {
        if (variant?.url) {
          try {
            const path = decodeURIComponent(variant.url.split('/')[4]);
            await bucket.file(path).delete();
          } catch (error) {
            console.error("Error deleting variant:", error);
          }
        }
      }
    }

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
  let query = db.collection('media')
    .orderBy('createdAt', 'desc');

  if (category) {
    query = query.where('category', '==', category);
  }

  const totalSnapshot = await query.count().get();
  const total = totalSnapshot.data().count;

  const snapshot = await query
    .offset((page - 1) * limit)
    .limit(limit)
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
    .filter(item => !item.filename.includes('-thumbnail.webp') &&
                    !item.filename.includes('-small.webp') && 
                    !item.filename.includes('-medium.webp') && 
                    !item.filename.includes('-max.webp'));

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
