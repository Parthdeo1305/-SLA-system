import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const PUBLIC_PATHS = ['/', '/login', '/signup'];

/**
 * Next.js Edge Middleware — Route Protection.
 *
 * Checks for the presence of the 'sts_token' in localStorage is not
 * possible at the edge, so we use a cookie-based flag set by the client
 * after login. If the flag is absent, redirect to /login.
 *
 * Note: This is a presence check only — the actual token validity
 * is verified by the Express API on every authenticated request.
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Logic to determine if a path is public
  // '/' is exactly public, others check if they start with the path
  const isPublicPath = pathname === '/' || PUBLIC_PATHS.some((p) => p !== '/' && pathname.startsWith(p));

  // Check for auth cookie set by the client after login
  const authToken = request.cookies.get('sts_auth')?.value;

  if (!isPublicPath && !authToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If already logged in, redirect away from auth pages
  if (isPublicPath && authToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths EXCEPT:
     * - _next/static (static files)
     * - _next/image (image optimisation)
     * - favicon.ico
     * - public files
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*$).*)',
  ],
};
