import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export enum UserRole {
  FREE = "Free",
  SIGNATURE = "Signature",
  ELITE = "Elite",
  ADMIN = "Admin"
}

export async function authorize(requiredRole: UserRole = UserRole.FREE) {
  const user = await getCurrentUser();
  
  if (!user) {
    return { authorized: false, response: NextResponse.json({ error: "Unauthorized" }, { status: 401 }) };
  }

  if (user.isSuspended) {
    return { authorized: false, response: NextResponse.json({ error: "Account suspended" }, { status: 403 }) };
  }

  // Get active subscription
  const sub = await prisma.subscription.findFirst({
    where: { 
      userId: user.id,
      expiresAt: { gte: new Date() }
    },
    orderBy: { createdAt: "desc" }
  });

  const currentRole = sub?.tier || UserRole.FREE;

  const roleHierarchy: Record<string, number> = {
    [UserRole.FREE]: 0,
    [UserRole.SIGNATURE]: 1,
    [UserRole.ELITE]: 2,
    [UserRole.ADMIN]: 3
  };

  if (roleHierarchy[currentRole] < roleHierarchy[requiredRole]) {
    return { 
      authorized: false, 
      response: NextResponse.json({ error: `Requires ${requiredRole} tier` }, { status: 403 }) 
    };
  }

  return { authorized: true, user, role: currentRole };
}

/**
 * Rate Limiting Logic (Placeholder for Redis)
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export async function checkRateLimit(userId: string, key: string, limit = 100, windowSeconds = 60) {
  // In production, use Redis: 
  // const current = await redis.incr(`rate_limit:${userId}:${key}`);
  // if (current === 1) await redis.expire(`rate_limit:${userId}:${key}`, windowSeconds);
  // return current <= limit;
  return true;
}
