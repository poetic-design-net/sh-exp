import { NextResponse } from 'next/server';
import { auth, db, verifyUserIsAdmin } from "lib/firebase-admin-server";

// Markiere diese Route als Node.js Runtime wegen Firebase Admin
export const runtime = 'nodejs';

export async function POST(request: Request) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      console.error('No Bearer token in Authorization header');
      return NextResponse.json({ isAdmin: false, error: 'No token provided' }, { status: 401 });
    }

    const token = authHeader.substring(7);

    console.log('Verifying admin status for token...');
    const decodedToken = await auth.verifyIdToken(token);
    console.log('Token decoded, uid:', decodedToken.uid);
    
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    console.log('User doc exists:', userDoc.exists);
    console.log('User data:', userDoc.data());
    
    const userData = userDoc.data();
    const isAdmin = userData?.role === 'admin';
    console.log('Admin verification result:', isAdmin, 'role:', userData?.role);
    
    if (!isAdmin) {
      return NextResponse.json(
        { isAdmin: false, error: 'Benutzer hat keine Administrator-Rechte' }, 
        { status: 403 }
      );
    }
    
    return NextResponse.json({ isAdmin: true });
  } catch (error) {
    console.error('Error verifying admin status:', error);
    return NextResponse.json(
      { isAdmin: false, error: 'Interner Server-Fehler' }, 
      { status: 500 }
    );
  }
}
