/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function updateUserPresence(presence: string) {
  const user = await getCurrentUser();
  if (!user?.id) return { success: false };

  await (prisma as any).user.update({
    where: { id: user.id },
    data: {
      presence,
      lastActive: new Date(),
    },
  });

  return { success: true };
}

export async function getUserPresence(userId: string) {
  const user = await (prisma as any).user.findUnique({
    where: { id: userId },
    select: { presence: true, lastActive: true },
  });
  return user;
}
