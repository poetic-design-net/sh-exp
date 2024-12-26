import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// List of paths that require Node.js runtime
const NODE_RUNTIME_PATHS = [
  '/api/checkout/monero',
  '/api/checkout/stripe',
  '/api/checkout/paypal',
  '/api/categories',
  '/api/landing-pages',
  '/api/auth',
  '/api/activate-membership',
  '/api/set-admin',
  '/api/send-password-reset'
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Check if the current path requires Node.js runtime
  const requiresNode = NODE_RUNTIME_PATHS.some(path => pathname.startsWith(path));

  if (requiresNode) {
    // Add a header to indicate this route requires Node.js runtime
    const headers = new Headers(request.headers);
    headers.set('x-middleware-runtime', 'nodejs');

    // Return the request with the modified headers
    return NextResponse.next({
      request: {
        headers
      }
    });
  }

  return NextResponse.next();
}

// Configure which paths this middleware will run on
export const config = {
  matcher: '/api/:path*'
};
