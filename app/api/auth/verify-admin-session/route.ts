import { NextRequest, NextResponse } from 'next/server';
import { auth, db } from 'lib/firebase-admin-server';
import { createCachedFunction, CACHE_TAGS } from 'lib/cache';

// Markiere diese Route als Node.js Runtime wegen Firebase Admin
export const runtime = 'nodejs';

// Create a cached version of the admin verification
const getAdminStatus = createCachedFunction(
  async (token: string) => {
    console.log('Verifying admin status for token...');
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Token decoded, uid:', decodedToken.uid);
    
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    console.log('User doc exists:', userDoc.exists);
    
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';
    console.log('Admin verification result:', isAdmin, 'role:', userData?.role);
    
    return {
      isAdmin,
      uid: decodedToken.uid,
      email: decodedToken.email
    };
  },
  {
    tags: [CACHE_TAGS.users],
    revalidateSeconds: 300 // 5 minutes
  }
);

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json();

    if (!token) {
      return NextResponse.json(
        { error: 'Token ist erforderlich' },
        { status: 400 }
      );
    }

    try {
      const result = await getAdminStatus(token);
      return NextResponse.json(result);
    } catch (error) {
      console.error('Token verification failed:', error);
      return NextResponse.json(
        { error: 'Authentifizierung fehlgeschlagen' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error in verify-admin-session:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 401 }
    );
  }
}
