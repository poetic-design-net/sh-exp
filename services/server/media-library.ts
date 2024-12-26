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

// Globaler URL Cache
const urlCache = new Map<string, {url: string, expires: number}>();

// Retry Funktion mit exponential backoff
async function retryOperation<T>(
  operation: () => Promise<T>,
  path: string,
  maxRetries = 3,
  isDnsOperation = false
): Promise<T> {
  let lastError: Error | null = null;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: any) {
      lastError = error;
      
      // Bei DNS-Fehlern längere Wartezeit
      const isDnsError = error.code === 'ENOTFOUND' || isDnsOperation;
      const delay = isDnsError 
        ? Math.min(500 * Math.pow(2, attempt), 3000)
        : Math.min(100 * Math.pow(2, attempt), 1000);
      
      if (attempt === maxRetries) break;
      
      console.warn(
        `Retry attempt ${attempt} for ${path} after ${isDnsError ? 'DNS' : ''} error:`,
        error.message
      );
      
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
  throw lastError || new Error('Retry operation failed');
}

export async function getMediaItems(): Promise<MediaItem[]> {
  try {
    console.time('getMediaItems');
    
    const now = Date.now();
    const bucket = storage.bucket();
    const batchSize = 50;

    // DNS Cache warm-up
    try {
      console.log('Performing DNS warm-up...');
      await retryOperation(
        () => bucket.file('test').exists(),
        'DNS warm-up',
        3,
        true
      );
      console.log('DNS warm-up completed');
    } catch (error) {
      console.warn('DNS warm-up failed, continuing anyway:', error);
    }

    // Hole alle Dokumente
    const snapshot = await db.collection('media')
      .orderBy('createdAt', 'desc')
      .get();

    const docs = snapshot.docs;
    const results: MediaItem[] = [];
    
    // Verarbeite Dokumente in Batches
    for (let i = 0; i < docs.length; i += batchSize) {
      const batch = docs.slice(i, i + batchSize);
      const batchNumber = Math.floor(i / batchSize) + 1;
      console.time(`Processing batch ${batchNumber}`);

      try {
        const processBatch = async () => {
          const batchPromises = batch.map(async (doc) => {
            const processItem = async () => {
              const data = doc.data();
              
              // Versuche verschiedene Pfadkombinationen
              const possiblePaths = [
                data.path, // Gespeicherter vollständiger Pfad
                `${data.directory}/${data.filename}`, // Alter Pfad-Style
                `media/${data.filename}` // Fallback
              ].filter(Boolean); // Entferne undefined/null Werte

              console.log('Processing item:', {
                id: doc.id,
                possiblePaths,
                filename: data.filename,
                directory: data.directory,
                storedPath: data.path
              });

              // Versuche jeden möglichen Pfad
              for (const path of possiblePaths) {
                const fileRef = bucket.file(path);
                const cacheKey = `${bucket.name}/${path}`;

                // Prüfe Cache
                const cached = urlCache.get(cacheKey);
                if (cached && cached.expires > now) {
                  console.log(`Cache hit for ${path}`);
                  return {
                    id: doc.id,
                    ...data,
                    url: cached.url,
                    createdAt: data.createdAt?.toDate(),
                    updatedAt: data.updatedAt?.toDate(),
                  } as MediaItem;
                }

                try {
                  // Prüfe Existenz
                  const exists = await retryOperation(
                    async () => {
                      const [exists] = await fileRef.exists();
                      return exists;
                    },
                    path
                  );

                  if (exists) {
                    console.log(`File found at ${path}`);
                    
                    // Generiere URL
                    const signedUrl = await retryOperation(
                      async () => {
                        const [url] = await fileRef.getSignedUrl({
                          action: 'read',
                          expires: now + 7 * 24 * 60 * 60 * 1000, // 7 days
                        });
                        return url;
                      },
                      path
                    );

                    // Cache URL
                    urlCache.set(cacheKey, {
                      url: signedUrl,
                      expires: now + 6 * 24 * 60 * 60 * 1000 // Cache für 6 Tage
                    });

                    return {
                      id: doc.id,
                      ...data,
                      url: signedUrl,
                      path, // Aktualisiere den Pfad
                      createdAt: data.createdAt?.toDate(),
                      updatedAt: data.updatedAt?.toDate(),
                    } as MediaItem;
                  }
                } catch (error) {
                  console.warn(`Error checking path ${path}:`, error);
                  continue;
                }
              }

              console.warn(`File not found in any location for item ${doc.id}`);
              return null;
            };

            try {
              return await Promise.race([
                processItem(),
                new Promise<null>((_, reject) => {
                  setTimeout(() => reject(new Error('Item timeout')), 5000);
                })
              ]).catch(error => {
                console.error(`Item processing failed:`, error);
                return null;
              });
            } catch (error) {
              console.error(`Error processing item ${doc.id}:`, error);
              return null;
            }
          });

          return await Promise.all(batchPromises);
        };

        // Batch timeout wrapper
        const batchResults = await Promise.race([
          processBatch(),
          new Promise<(MediaItem | null)[]>((_, reject) => {
            setTimeout(() => reject(new Error('Batch timeout')), 15000);
          })
        ]).catch(error => {
          console.error(`Batch ${batchNumber} failed:`, error);
          return [] as (MediaItem | null)[];
        });

        const validResults = batchResults.filter((item): item is MediaItem => item !== null);
        results.push(...validResults);
        
        console.timeEnd(`Processing batch ${batchNumber}`);
        console.log(`Batch ${batchNumber} completed: ${validResults.length}/${batch.length} items processed`);

        // Kleine Pause zwischen Batches
        if (i + batchSize < docs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(`Error processing batch ${batchNumber}:`, error);
        // Fahre mit dem nächsten Batch fort
        continue;
      }
    }

    console.timeEnd('getMediaItems');
    console.log(`Total items processed: ${results.length}/${docs.length}`);
    
    return results;
  } catch (error) {
    console.error("Error in getMediaItems:", error);
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
    console.log('Upload started:', { filename, contentType });
    const bucket = storage.bucket();
    const isImage = contentType.startsWith('image/');
    console.log('File type check:', { isImage, contentType });

    let finalBuffer = file;
    let finalContentType = contentType;
    const timestamp = Date.now();
    const baseFilename = filename.replace(/\.[^/.]+$/, '');

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

    const storagePath = `media/${timestamp}-${filename}`;
    console.log('Saving file:', {
      storagePath,
      contentType: finalContentType,
      size: finalBuffer.length
    });

    const fileRef = bucket.file(storagePath);
    await retryOperation(
      () => fileRef.save(finalBuffer, {
        metadata: {
          contentType: finalContentType,
          cacheControl: 'public, max-age=31536000'
        },
        validation: false,
        resumable: false
      }),
      storagePath
    );

    const [signedUrl] = await retryOperation(
      () => fileRef.getSignedUrl({
        action: 'read',
        expires: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days
      }),
      storagePath
    );
    
    console.log('File saved successfully:', {
      signedUrl,
      storagePath,
      bucket: bucket.name,
      size: finalBuffer.length
    });

    const url = signedUrl;
    const derivedCategory = category || 'general';

    let width, height;
    if (isImage) {
      const metadata = await sharp(finalBuffer).metadata();
      width = metadata.width;
      height = metadata.height;
      console.log('Image dimensions:', { width, height });
    }

    const mediaItem: Omit<MediaItem, 'id'> = {
      url,
      filename: `${timestamp}-${filename}`, // Speichere vollständigen Dateinamen mit Timestamp
      contentType: finalContentType,
      size: finalBuffer.length,
      createdAt: new Date(),
      updatedAt: new Date(),
      directory: 'media',
      category: derivedCategory,
      tags: tags || [],
      path: storagePath, // Speichere vollständigen Pfad
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
      const path = `${mediaItem.directory}/${mediaItem.filename}`;
      console.log('Attempting to delete file:', { path });

      const fileRef = bucket.file(path);
      const [exists] = await retryOperation(
        () => fileRef.exists(),
        path
      );

      if (exists) {
        await retryOperation(
          () => fileRef.delete(),
          path
        );
        console.log('Successfully deleted file:', path);
      } else {
        console.warn('File not found in storage:', path);
      }
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
