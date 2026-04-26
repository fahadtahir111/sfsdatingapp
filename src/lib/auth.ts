import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { prisma } from './prisma';

const SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET || 'fallback-secret-for-dev'
);

export async function signJWT(payload: Record<string, unknown>) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(SECRET);
}

export async function verifyJWT(token: string) {
  try {
    const { payload } = await jwtVerify(token, SECRET);
    return payload;
  } catch (error) {
    console.error("JWT Verification failed:", error instanceof Error ? error.message : "Unknown error");
    return null;
  }
}

export async function getCurrentUser() {
  const token = await getAuthToken();
  if (!token) {
    console.log("No auth token found in cookies");
    return null;
  }

  const payload = await verifyJWT(token);
  if (!payload) {
    console.log("JWT verification returned null");
    return null;
  }
  
  if (!payload.userId) {
    console.log("JWT payload missing userId");
    return null;
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId as string },
    });
    if (!user) console.log("User not found in DB for ID:", payload.userId);
    return user;
  } catch (error) {
    console.error("getCurrentUser Prisma Error:", error);
    return null;
  }
}

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 1 week
    path: '/',
  });
}

export async function getAuthToken() {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value;
}

export async function clearAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}
