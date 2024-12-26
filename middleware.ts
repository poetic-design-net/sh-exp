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
    console.log('Middleware: Protected route accessed:', request.nextUrl.pathname);
    
    const sessionCookie = request.cookies.get('session');
    console.log('Middleware: Session cookie present:', !!sessionCookie?.value);
    
    if (!sessionCookie?.value) {
      console.log('Middleware: No session cookie, redirecting to login');
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', request.nextUrl.pathname);
      
      const response = NextResponse.redirect(loginUrl);
      response.headers.set('x-middleware-cache', 'no-cache');
      response.headers.set('Cache-Control', 'no-store, must-revalidate');
      response.headers.set('Pragma', 'no-cache');
      return response;
    }

    // Allow access to protected route but ensure no caching
    console.log('Middleware: Session cookie found, allowing access');
    const response = NextResponse.next();
    
    // Set strong no-cache headers
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('Cache-Control', 'no-store, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    // Add custom header to track middleware execution
    response.headers.set('x-middleware-handled', 'true');
    
    return response;
  }

  // For non-protected routes
  console.log('Middleware: Non-protected route accessed:', request.nextUrl.pathname);
  const response = NextResponse.next();
  
  // Set appropriate cache headers based on route
  if (request.nextUrl.pathname.startsWith('/api/')) {
    response.headers.set('Cache-Control', 'no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
  } else {
    response.headers.set('Cache-Control', 'public, max-age=300, stale-while-revalidate=60');
  }
  
  response.headers.set('x-middleware-cache', 'no-cache');
  response.headers.set('x-middleware-handled', 'true');
  
  return response;
}
