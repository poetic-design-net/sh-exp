import { auth, db } from "lib/firebase-admin-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const { token } = await request.json();
    
    if (!token) {
      return new NextResponse('No token provided', { status: 401 });
    }

    // Verify ID token
    const decodedToken = await auth.verifyIdToken(token);
    const user = await auth.getUser(decodedToken.uid);
    const userDoc = await db.collection('users').doc(decodedToken.uid).get();
    const userData = userDoc.data();
    
    console.log('✅ Token verified for user:', {
      uid: user.uid,
      email: user.email,
      role: userData?.role
    });

    return new NextResponse(JSON.stringify({ 
      status: 'success',
      user: {
        uid: user.uid,
        email: user.email,
        role: userData?.role || null
      }
    }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    });
  } catch (error) {
    console.error('Token verification error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Ungültiger Token' }), 
      { status: 401 }
    );
  }
}
