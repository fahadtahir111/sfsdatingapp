/* eslint-disable @typescript-eslint/no-explicit-any */
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { notFound, redirect } from "next/navigation";
import BoardroomClient from "./BoardroomClient";

export default async function BoardroomPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const user = await getCurrentUser();
  if (!user) redirect("/auth/login");

  const boardroom = await (prisma as any).boardroom.findUnique({
    where: { id: resolvedParams.id },
    include: {
      host: {
        include: {
          profile: true
        }
      }
    }
  });

  if (!boardroom || !boardroom.isLive) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-stone-950">
      <BoardroomClient boardroom={boardroom} />
    </div>
  );
}
