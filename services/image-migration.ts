import { storage } from 'lib/firebase-admin';
import fetch from 'node-fetch';
import sharp from 'sharp';

interface ImageDownloadResult {
  success: boolean;
  url?: string;
  avifUrl?: string;
  error?: string;
}

interface ImageUploadOptions {
  contentType?: string;
}

const defaultOptions: ImageUploadOptions = {
  contentType: 'image/avif'
};

async function convertToAVIF(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .avif({
      quality: 80,
      effort: 6,
      chromaSubsampling: '4:2:0'
    })
    .toBuffer();
}

async function convertToWebP(buffer: Buffer): Promise<Buffer> {
  return sharp(buffer)
    .webp({
      quality: 90,
      effort: 4,
      lossless: false,
      nearLossless: false,
      smartSubsample: true,
    })
    .toBuffer();
}

async function convertImage(buffer: Buffer): Promise<{avif: Buffer, webp: Buffer}> {
  const [avif, webp] = await Promise.all([
    convertToAVIF(buffer),
    convertToWebP(buffer)
  ]);
  
  return { avif, webp };
}

/**
 * Migriert ein einzelnes Bild zu Firebase Storage
 */
export async function migrateImage(
  imageUrl: string,
  destinationPath: string,
  options: ImageUploadOptions = defaultOptions
): Promise<ImageDownloadResult> {
  try {
    const bucket = storage.bucket();
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type') || options.contentType;
    let avifUrl: string | undefined;

    // Konvertiere alle Bilder (außer bereits AVIF)
    if (contentType?.startsWith('image/') && !contentType.includes('avif')) {
      const baseDestination = destinationPath.replace(/\.[^/.]+$/, '');
      const { avif, webp } = await convertImage(buffer);

      // Upload AVIF Version
      const avifPath = `${baseDestination}.avif`;
      const avifRef = bucket.file(avifPath);
      await avifRef.save(avif, {
        metadata: {
          contentType: 'image/avif',
          cacheControl: 'public, max-age=31536000'
        }
      });
      await avifRef.makePublic();
      avifUrl = `https://storage.googleapis.com/${bucket.name}/${avifPath}`;

      // Setze WebP als Fallback
      buffer = webp;
      destinationPath = `${baseDestination}.webp`;
    }

    const file = bucket.file(destinationPath);
    await file.save(buffer, {
      metadata: {
        contentType: contentType?.includes('avif') ? 'image/avif' : 'image/webp',
        cacheControl: 'public, max-age=31536000'
      },
      validation: false,
      resumable: false
    });

    await file.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    return {
      success: true,
      url,
      ...(avifUrl && { avifUrl })
    };
  } catch (error: any) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Migriert mehrere Produktbilder zu Firebase Storage
 */
export async function migrateProductImages(
  productId: string,
  imageUrls: string[]
): Promise<string[]> {
  const migratedUrls: string[] = [];

  for (let i = 0; i < imageUrls.length; i++) {
    const imageUrl = imageUrls[i];
    try {
      const fileName = `products/${productId}/image-${i + 1}`;
      const result = await migrateImage(imageUrl, fileName);
      
      if (result.success && result.url) {
        migratedUrls.push(result.url);
        // AVIF URL wird in separatem Array oder Datenstruktur gespeichert wenn benötigt
      }
    } catch (error) {
      console.error(`Error migrating image ${imageUrl}:`, error);
    }
  }

  return migratedUrls;
}

/**
 * Überprüft ob eine URL von Firebase Storage stammt
 */
export function isFirebaseStorageUrl(url: string): boolean {
  return url.startsWith('https://storage.googleapis.com/') || 
         url.startsWith('https://firebasestorage.googleapis.com/');
}
