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

  if (isProtected) {
    if (!token) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }

    try {
      await jwtVerify(token, SECRET);
      return NextResponse.next();
    } catch (error) {
      const url = new URL('/auth/login', request.url);
      url.searchParams.set('callbackUrl', pathname);
      return NextResponse.redirect(url);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/discover/:path*',
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
