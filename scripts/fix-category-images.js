const admin = require('firebase-admin');
const fetch = require('node-fetch');
const sharp = require('sharp');

// Load service account
const serviceAccount = require('../components/stefanhiene-2ec0a-firebase-adminsdk-n9cn1-90a966e10a.json');

// Initialize Firebase Admin SDK
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    storageBucket: 'stefanhiene-2ec0a.firebasestorage.app'
  });
}

const db = admin.firestore();
const storage = admin.storage();

async function convertToAVIF(buffer) {
  return sharp(buffer)
    .avif({
      quality: 80,
      effort: 6,
      chromaSubsampling: '4:2:0'
    })
    .toBuffer();
}

async function convertToWebP(buffer) {
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

async function convertImage(buffer) {
  const [avif, webp] = await Promise.all([
    convertToAVIF(buffer),
    convertToWebP(buffer)
  ]);
  
  return { avif, webp };
}

async function migrateImage(imageUrl, destinationPath) {
  try {
    const bucket = storage.bucket();
    const response = await fetch(imageUrl);
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    let buffer = Buffer.from(arrayBuffer);
    const contentType = response.headers.get('content-type');
    let avifUrl;

    // Konvertiere alle Bilder (außer bereits AVIF)
    if (contentType?.startsWith('image/') && !contentType.includes('avif')) {
      const baseDestination = destinationPath.replace(/\.[^/.]+$/, '');
      const { avif, webp } = await convertImage(buffer);

      // Upload AVIF Version als Hauptversion
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

      // Upload WebP als Fallback
      const webpPath = `${baseDestination}.webp`;
      const webpRef = bucket.file(webpPath);
      await webpRef.save(webp, {
        metadata: {
          contentType: 'image/webp',
          cacheControl: 'public, max-age=31536000'
        }
      });
      await webpRef.makePublic();
      const webpUrl = `https://storage.googleapis.com/${bucket.name}/${webpPath}`;

      return {
        success: true,
        url: avifUrl, // AVIF als Hauptversion
        fallbackUrl: webpUrl // WebP als Fallback
      };
    }

    // Wenn es bereits ein AVIF ist oder kein Bild
    const file = bucket.file(destinationPath);
    await file.save(buffer, {
      metadata: {
        contentType: contentType || 'application/octet-stream',
        cacheControl: 'public, max-age=31536000'
      },
      validation: false,
      resumable: false
    });

    await file.makePublic();
    const url = `https://storage.googleapis.com/${bucket.name}/${file.name}`;

    return {
      success: true,
      url
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

async function fixCategoryImages() {
  const logs = [];
  const log = (message) => {
    console.log(message);
    logs.push(message);
  };

  try {
    log('🚀 Starting category image migration');
    const snapshot = await db.collection("categories").get();
    
    for (const doc of snapshot.docs) {
      const data = doc.data();
      
      if (!data.images?.[0]) {
        log(`⏩ Category ${doc.id} has no images, skipping...`);
        continue;
      }

      log(`📸 Processing category ${doc.id}...`);
      
      // Re-upload the image with AVIF and WebP conversion
      const result = await migrateImage(
        data.images[0],
        `categories/${doc.id}/image`
      );

      if (!result.success) {
        log(`❌ Failed to migrate image for category ${doc.id}: ${result.error}`);
        continue;
      }

      // Update the category with both URLs
      const updateData = {
        images: [result.url] // AVIF als Hauptversion
      };
      
      if (result.fallbackUrl) {
        updateData.fallbackImages = [result.fallbackUrl]; // WebP als Fallback
      }

      await doc.ref.update(updateData);

      log(`✅ Successfully migrated image for category ${doc.id}`);
      log(`📊 AVIF URL: ${result.url}`);
      if (result.fallbackUrl) {
        log(`📊 WebP Fallback URL: ${result.fallbackUrl}`);
      }
    }

    log('🎉 All category images have been migrated');
    process.exit(0);
  } catch (error) {
    log(`❌ Error migrating category images: ${error.message}`);
    console.error('Error details:', error);
    process.exit(1);
  }
}

console.log('='.repeat(80));
console.log('Starting category image migration');
console.log('='.repeat(80));

fixCategoryImages();
