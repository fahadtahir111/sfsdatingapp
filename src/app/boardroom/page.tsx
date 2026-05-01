export const dynamic = "force-dynamic";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { redirect } from "next/navigation";
import BoardroomListClient from "./BoardroomListClient";
import DashboardLayout from "@/components/layout/DashboardLayout";

/* eslint-disable @typescript-eslint/no-explicit-any */

export default async function BoardroomPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  const rooms = await (prisma as any).boardroom.findMany({
    where: { isLive: true },
    include: {
      host: {
        include: { profile: true },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  // Serialize for client
  const serialized = rooms.map((r: any) => ({
    id: r.id,
    title: r.title,
    host: {
      name: r.host.name,
      profile: { photos: r.host.profile?.photos ?? null },
    },
  }));

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">The Boardroom</h1>
          <p className="text-stone-500 font-medium">Join live audio networking sessions with elite founders.</p>
        </div>
        <BoardroomListClient initialRooms={serialized} />
      </div>
    </DashboardLayout>
  );
}
