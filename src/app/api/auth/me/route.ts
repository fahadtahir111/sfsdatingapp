import { NextResponse } from 'next/server';
import { getAuthToken, verifyJWT } from '../../../../lib/auth';
import { prisma } from '../../../../lib/prisma';
import { getAdminRoleFromEmail } from '@/lib/admin';

export async function GET() {
  const token = await getAuthToken();

  if (!token) {
    return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
  }

  const payload = await verifyJWT(token);

  if (!payload || !payload.userId) {
    return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: payload.userId as string },
    select: {
      id: true,
      email: true,
      name: true,
      profile: {
        select: {
          photos: true
        }
      },
      subscriptions: {
        orderBy: {
          createdAt: 'desc'
        },
        take: 1
      }
    },
  });

  if (!user) {
    return NextResponse.json({ message: 'User not found' }, { status: 404 });
  }

  let image = null;
  try {
    const photos = JSON.parse(user.profile?.photos || "[]");
    image = photos[0];
  } catch {}

  return NextResponse.json({
    ...user,
    image: image || `https://ui-avatars.com/api/?name=${user.name}`,
    adminRole: getAdminRoleFromEmail(user.email),
    tier: (user as { subscriptions?: { tier: string }[] }).subscriptions?.[0]?.tier || "Elite Member",
    profile: undefined,
    subscriptions: undefined
  });
}
