import { auth } from "@/lib/firebase-admin-server";
import { NextResponse } from "next/server";

const COOKIE_NAME = 'session';
const MAX_AGE = 60 * 60 * 24 * 5; // 5 days in seconds

export async function POST(request: Request) {
  try {
    const { idToken } = await request.json();
    
    if (!idToken) {
      return new NextResponse('No token provided', { status: 401 });
    }

    // Create proper session cookie in both development and production
    const sessionCookie = await auth.createSessionCookie(idToken, {
      expiresIn: MAX_AGE * 1000,
    });

    // Create response with cookie
    const response = new NextResponse(
      JSON.stringify({ status: 'success' }),
      {
        status: 200,
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    // Set cookie in response
    response.cookies.set({
      name: COOKIE_NAME,
      value: sessionCookie,
      maxAge: MAX_AGE,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Session creation error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }), 
      { status: 500 }
    );
  }
}

export async function DELETE() {
  const response = new NextResponse(
    JSON.stringify({ status: 'success' }),
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  );

  // Delete cookie by setting maxAge to 0
  response.cookies.set({
    name: COOKIE_NAME,
    value: '',
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
  });

  return response;
}
