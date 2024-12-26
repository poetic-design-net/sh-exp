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
    const { isAdmin } = await verifyAdmin();
    if (!isAdmin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Parse pagination parameters
    const searchParams = request.nextUrl.searchParams;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const category = searchParams.get('category') || undefined;

    const { items, total } = await getMediaItems({
      page,
      limit: Math.min(limit, 20), // Limit maximum items per page
      category
    });
    
    const response = NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=60, stale-while-revalidate=600'
      }
    });

    // Add strong caching headers with revalidation
    response.headers.set(
      'Cache-Control',
      'public, max-age=60, stale-while-revalidate=600'
    );
    
    // Add cache tags for better cache management
    response.headers.set(
      'Cache-Tag',
      `media-items,page-${page},category-${category || 'all'}`
    );
    
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
