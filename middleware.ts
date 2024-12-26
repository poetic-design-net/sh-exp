import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cookies } from 'next/headers'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
  runtime: 'nodejs'
}

export async function middleware(request: NextRequest) {
  // Skip basic auth in development
  if (process.env.NODE_ENV === 'production') {
    // Basic auth
    const basicAuth = request.headers.get('authorization')
    
    if (!basicAuth) {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted Site"'
        }
      })
    }

    const auth = basicAuth.split(' ')[1]
    const [user, pwd] = Buffer.from(auth, 'base64').toString().split(':')

    // You can change these credentials in your environment variables
    if (user !== 'admin' || pwd !== 'admin') {
      return new NextResponse(null, {
        status: 401,
        headers: {
          'WWW-Authenticate': 'Basic realm="Restricted Site"'
        }
      })
    }
  }

  // For protected routes, check auth
  if (request.nextUrl.pathname.startsWith('/app') || request.nextUrl.pathname.startsWith('/admin')) {
    const sessionCookie = request.cookies.get('session');
    
    if (!sessionCookie?.value) {
      const response = NextResponse.redirect(new URL('/login', request.url));
      response.headers.set('x-middleware-cache', 'no-cache');
      return response;
    }

    // Allow access to protected route but ensure no caching
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    return response;
  }

  // Set no-cache headers
  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  response.headers.set('Cache-Control', 'no-store')
  
  return response
}
