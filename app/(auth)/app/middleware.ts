import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { auth } from '@/lib/firebase-admin';

export async function middleware(request: Request) {
  try {
    const cookiesList = await cookies();
    const sessionCookie = cookiesList.get('session');

    if (!sessionCookie?.value) {
      return NextResponse.redirect(new URL('/', request.url));
    }

    // Verify session
    await auth.verifySessionCookie(sessionCookie.value);
    
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return NextResponse.redirect(new URL('/', request.url));
  }
}
