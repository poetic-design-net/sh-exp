import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'lib/firebase-admin-server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
  console.log('Session POST request received');
  
  try {
    const body = await request.json();
    console.log('Request body:', { hasIdToken: !!body.idToken });

    if (!body.idToken) {
      console.error('No ID token provided');
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    try {
      // Verify the ID token first
      console.log('Verifying ID token...');
      await auth.verifyIdToken(body.idToken);
      console.log('ID token verified successfully');

      // Create session cookie
      console.log('Creating session cookie...');
      const sessionCookie = await auth.createSessionCookie(body.idToken, {
        expiresIn: SESSION_EXPIRATION_TIME
      });
      console.log('Session cookie created successfully');

      // Set cookie options
      const options = {
        name: SESSION_COOKIE_NAME,
        value: sessionCookie,
        maxAge: SESSION_EXPIRATION_TIME / 1000,
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        path: '/',
        sameSite: 'lax' as const,
      };

      // Set the cookie
      console.log('Setting cookie with options:', {
        ...options,
        value: '[REDACTED]'
      });
      cookies().set(options);

      const response = NextResponse.json(
        { status: 'success' },
        { 
          status: 200,
          headers: {
            'Cache-Control': 'no-store, must-revalidate',
            'Pragma': 'no-cache'
          }
        }
      );

      return response;
    } catch (error) {
      console.error('Firebase auth error:', {
        error,
        message: error instanceof Error ? error.message : String(error)
      });
      
      return NextResponse.json(
        { error: 'Invalid ID token' },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  console.log('Session DELETE request received');
  
  try {
    console.log('Deleting session cookie...');
    cookies().delete(SESSION_COOKIE_NAME);
    console.log('Session cookie deleted successfully');
    
    return NextResponse.json(
      { status: 'success' },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Error deleting session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
