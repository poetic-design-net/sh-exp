import { NextRequest, NextResponse } from 'next/server';
import { auth } from 'lib/firebase-admin-server';
import { cookies } from 'next/headers';

const SESSION_COOKIE_NAME = 'session';
const SESSION_EXPIRATION_TIME = 60 * 60 * 24 * 5 * 1000; // 5 days

export async function POST(request: NextRequest) {
  try {
    const { idToken } = await request.json();

    if (!idToken) {
      return NextResponse.json(
        { error: 'ID token is required' },
        { status: 400 }
      );
    }

    // Create session cookie
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: SESSION_EXPIRATION_TIME
    });

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
    cookies().set(options);

    return NextResponse.json(
      { status: 'success' },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store'
        }
      }
    );
  } catch (error) {
    console.error('Error creating session:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE() {
  try {
    cookies().delete(SESSION_COOKIE_NAME);
    
    return NextResponse.json(
      { status: 'success' },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'private, no-store'
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
