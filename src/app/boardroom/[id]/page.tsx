/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import BoardroomClient from "./BoardroomClient";

export default async function BoardroomRoomPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const boardroom = await (prisma as any).boardroom.findUnique({
    where: { id: resolvedParams.id },
    include: {
      host: {
        include: { profile: true },
      },
    },
  });

  if (!boardroom || !boardroom.isLive) {
    notFound();
  }

  // Serialize only what the client needs
  const boardroomData = {
    id: boardroom.id,
    title: boardroom.title,
    description: boardroom.description ?? null,
    hostId: boardroom.hostId,
    host: {
      name: boardroom.host.name ?? null,
    },
  };

  return <BoardroomClient boardroom={boardroomData} />;
}
