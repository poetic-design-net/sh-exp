import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ]
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
    // Let the client-side handle auth
    const response = NextResponse.next();
    response.headers.set('x-middleware-cache', 'no-cache');
    response.headers.set('Cache-Control', 'no-store');
    return response;
  }

  // Set no-cache headers
  const response = NextResponse.next()
  response.headers.set('x-middleware-cache', 'no-cache')
  response.headers.set('Cache-Control', 'no-store')
  
  return response
}
