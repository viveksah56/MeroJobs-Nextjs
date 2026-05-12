import { NextRequest, NextResponse } from 'next/server';

const AUTH_TOKEN_KEY = 'auth_token';

const protectedRoutes = ['/dashboard', '/profile', '/jobs/saved'];
const publicRoutes = ['/login', '/register', '/forgot-password'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(AUTH_TOKEN_KEY)?.value;

  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      loginUrl.searchParams.set('redirect', pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  if (publicRoutes.some((route) => pathname.startsWith(route))) {
    if (token) {
      return NextResponse.redirect(new URL('/dashboard', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|og-image.png|apple-touch-icon.png).*)',
  ],
};
