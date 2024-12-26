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
  width?: number;
  height?: number;
}

async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .webp({
      quality: 75,
      effort: 5,
      lossless: false,
      nearLossless: false,
      smartSubsample: true,
    })
    .toBuffer();
}

export async function uploadMedia(
  file: Buffer,
  filename: string,
  contentType: string,
  category?: string,
  tags?: string[]
): Promise<MediaItem> {
  try {
    console.log('Upload started:', { filename, contentType });
    const bucket = storage.bucket();
    const isImage = contentType.startsWith('image/');
    console.log('File type check:', { isImage, contentType });

    let finalBuffer = file;
    let finalContentType = contentType;
    const timestamp = Date.now();
    const baseFilename = filename.replace(/\.[^/.]+$/, '');

    // Konvertiere alle Bilder zu WebP (außer bereits WebP)
    if (isImage && !contentType.includes('webp')) {
      console.log('Starting WebP conversion for:', baseFilename);
      finalBuffer = await convertToWebP(file);
      console.log('WebP conversion completed:', {
        originalSize: file.length,
        webpSize: finalBuffer.length,
        reduction: ((1 - finalBuffer.length / file.length) * 100).toFixed(2) + '%'
      });

      finalContentType = 'image/webp';
      filename = `${baseFilename}.webp`;
    }

    // Speichere die finale Version
    const path = `media/${timestamp}-${filename}`;
    console.log('Saving file:', {
      path,
      contentType: finalContentType,
      size: finalBuffer.length
    });

    const fileRef = bucket.file(path);
    await fileRef.save(finalBuffer, {
      metadata: {
        contentType: finalContentType,
        cacheControl: 'public, max-age=31536000'
      },
      validation: false,
      resumable: false
    });

    await fileRef.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${path}`;
    console.log('File saved successfully:', {
      url,
      size: finalBuffer.length
    });

    const derivedCategory = category || 'general';

    // Hole die Bildabmessungen für Bilder
    let width, height;
    if (isImage) {
      const metadata = await sharp(finalBuffer).metadata();
      width = metadata.width;
      height = metadata.height;
      console.log('Image dimensions:', { width, height });
    }

    const mediaItem: Omit<MediaItem, 'id'> = {
      url,
      filename,
      contentType: finalContentType,
      size: finalBuffer.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      directory: 'media',
      category: derivedCategory,
      tags: tags || [],
      ...(width && height ? { width, height } : {})
    };

    const docRef = await db.collection('media').add(mediaItem);
    console.log('MediaItem saved to database:', { id: docRef.id });

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
    console.log('Starting delete operation for media ID:', id);
    
    const doc = await db.collection('media').doc(id).get();
    if (!doc.exists) {
      throw new Error('Media item not found');
    }

    const mediaItem = doc.data() as MediaItem;
    console.log('Found media item:', { url: mediaItem.url });

    const bucket = storage.bucket();
    
    try {
      // Extrahiere den Pfad nach "storage.googleapis.com/BUCKET_NAME/"
      const urlObj = new URL(mediaItem.url);
      const pathParts = urlObj.pathname.split('/');
      const path = pathParts.slice(2).join('/'); // Überspringe leeres Element und Bucket-Namen
      
      console.log('Attempting to delete file:', {
        url: mediaItem.url,
        extractedPath: path
      });

      await bucket.file(path).delete();
      console.log('Successfully deleted file:', path);
    } catch (error) {
      console.error("Error deleting file:", {
        url: mediaItem.url,
        error: error
      });
    }

    // Delete from Firestore
    await db.collection('media').doc(id).delete();
    console.log('Successfully deleted media item from Firestore');
  } catch (error) {
    console.error("Error in deleteMedia:", error);
    throw error;
  }
}

export async function getMediaItems(): Promise<MediaItem[]> {
  const snapshot = await db.collection('media')
    .orderBy('createdAt', 'desc')
    .get();

  return snapshot.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data.createdAt?.toDate(),
      updatedAt: data.updatedAt?.toDate(),
    } as MediaItem;
  });
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
