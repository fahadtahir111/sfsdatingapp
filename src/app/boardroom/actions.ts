"use server";

// Re-syncing types after DB push

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

type BoardroomRecord = {
  id: string;
  title: string;
  description: string | null;
  hostId: string;
  isLive: boolean;
  createdAt: Date;
  host: {
    id: string;
    name: string | null;
    profile: {
      photos: string | null;
    } | null;
  };
};

type BoardroomClientShape = {
  findMany: (args: {
    where: { isLive: boolean };
    include: { host: { include: { profile: true } } };
    orderBy: { createdAt: "desc" };
  }) => Promise<BoardroomRecord[]>;
  create: (args: {
    data: {
      title: string;
      description?: string;
      hostId: string;
      isLive: boolean;
    };
  }) => Promise<BoardroomRecord>;
  update: (args: {
    where: { id: string; hostId: string };
    data: { isLive: boolean };
  }) => Promise<BoardroomRecord>;
};

const boardroomDb = (prisma as unknown as { boardroom: BoardroomClientShape }).boardroom;

export async function getActiveBoardrooms() {
  return await boardroomDb.findMany({
    where: { isLive: true },
    include: {
      host: {
        include: {
          profile: true
        }
      }
    },
    orderBy: { createdAt: "desc" }
  });
}

export async function createBoardroom(title: string, description?: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const boardroom = await boardroomDb.create({
    data: {
      title,
      description,
      hostId: user.id,
      isLive: true,
    }
  });

  revalidatePath("/boardroom");
  return boardroom;
}

export async function endBoardroom(id: string) {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  await boardroomDb.update({
    where: { id, hostId: user.id },
    data: { isLive: false }
  });

  revalidatePath("/boardroom");
}
