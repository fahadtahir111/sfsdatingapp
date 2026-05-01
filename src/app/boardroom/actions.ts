"use server";

/* eslint-disable @typescript-eslint/no-explicit-any */

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getActiveBoardrooms() {
  return await (prisma as any).boardroom.findMany({
    where: { isLive: true },
    include: {
      host: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function createBoardroom(title: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const boardroom = await (prisma as any).boardroom.create({
    data: {
      title,
      description: description ?? null,
      hostId: user.id,
      isLive: true,
    },
  });

  revalidatePath("/boardroom");
  return boardroom as { id: string; title: string };
}

export async function endBoardroom(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await (prisma as any).boardroom.update({
    where: { id, hostId: user.id },
    data: { isLive: false },
  });

  revalidatePath("/boardroom");
}
