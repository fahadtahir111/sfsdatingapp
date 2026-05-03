import { NextResponse, type NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'
);

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('auth-token')?.value;

  const { pathname } = request.nextUrl;

  // Paths that require authentication
  const protectedPaths = [
    '/admin',
    '/discover',
    '/chat',
    '/profile',
    '/settings',
    '/verify',
    '/events',
    '/premium',
    '/store',
    '/reels',
  ];

  const isProtected = protectedPaths.some((path) =>
    pathname.startsWith(path)
  );

  const isAuthPage = pathname === '/' || pathname.startsWith('/auth');

  if (isProtected) {
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  // Redirect authenticated users away from landing/login pages to feed
  if (isAuthPage && token) {
    try {
      await jwtVerify(token, SECRET);
      return NextResponse.redirect(new URL('/discover', request.url));
    } catch {
      // Invalid token, allow staying on auth page
      return NextResponse.next();
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/',
    '/auth/:path*',
    '/discover/:path*',
    '/admin/:path*',
    '/chat/:path*',
    '/profile/:path*',
    '/settings/:path*',
    '/verify/:path*',
    '/events/:path*',
    '/premium/:path*',
    '/store/:path*',
    '/reels/:path*',
  ],
};
