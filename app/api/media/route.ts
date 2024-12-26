import { NextRequest, NextResponse } from 'next/server';
import { getMediaItems, uploadMedia } from 'services/server/media-library';
import { auth, db } from 'lib/firebase-admin-server';
import { cookies } from 'next/headers';

// Markiere diese Route als Node.js Runtime wegen Firebase Admin
export const runtime = 'nodejs';

async function verifyAdmin() {
  const cookieStore = cookies();
  const sessionCookie = cookieStore.get('session')?.value;

  if (!sessionCookie) {
    return { isAdmin: false };
  }

  try {
    const decodedToken = await auth.verifySessionCookie(sessionCookie);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    return {
      isAdmin: userData?.role === 'admin',
      uid: decodedToken.uid,
      email: decodedToken.email
    };
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return { isAdmin: false };
  }
}

export async function GET(request: NextRequest) {
  try {
    // Verify admin session
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const items = await getMediaItems();
    
    // Cache die Response für 2 Minuten mit stale-while-revalidate
    const response = NextResponse.json(items);
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=120, stale-while-revalidate=60'
    );
    
    // Füge Debugging-Header hinzu
    response.headers.set('X-Total-Items', items.length.toString());
    response.headers.set('X-Response-Time', Date.now().toString());
    
    return response;
  } catch (error) {
    console.error('Error in GET /api/media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Verify admin session
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const category = formData.get('category') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const mediaItem = await uploadMedia(
      buffer,
      file.name,
      file.type,
      category
    );

    return NextResponse.json(mediaItem);
  } catch (error) {
    console.error('Error in POST /api/media:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
