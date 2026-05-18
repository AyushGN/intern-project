import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes only accessible when NOT authenticated
const AUTH_ROUTES = ['/login', '/register'];

// Routes that require authentication
const PROTECTED_ROUTES = ['/profile', '/checkout', '/order-success', '/farmer', '/shop'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get('token')?.value;
  const isAuthenticated = !!token;

  // If trying to access auth pages while already logged in → redirect home
  if (isAuthenticated && AUTH_ROUTES.some(route => pathname.startsWith(route))) {
    return NextResponse.redirect(new URL('/', request.url));
  }

  // If trying to access protected pages without being logged in → redirect to login
  if (!isAuthenticated && PROTECTED_ROUTES.some(route => pathname.startsWith(route))) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all paths except:
     * - api routes
     * - static files (_next/static, _next/image, favicon, public images)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|images).*)',
  ],
};
