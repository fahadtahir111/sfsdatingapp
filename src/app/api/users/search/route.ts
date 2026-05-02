import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  const networkingOnly = req.nextUrl.searchParams.get("networking") === "true";

  if (q.length < 1 && !networkingOnly) return NextResponse.json([]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const whereClause: Record<string, any> = {
    id: { not: me.id },
  };

  if (q.length >= 1) {
    whereClause.OR = [
      { name: { contains: q, mode: "insensitive" } },
    ];
  }

  if (networkingOnly) {
    whereClause.profile = { isNetworkingMode: true };
  }

  const users = await prisma.user.findMany({
    where: whereClause,
    take: 30,
    include: {
      profile: {
        select: {
          photos: true,
          occupation: true,
          company: true,
          industry: true,
          trustScore: true,
          professionalVerified: true,
          isNetworkingMode: true,
        },
      },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1 },
    },
  });

  const result = users.map((u) => {
    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}&background=1a1a1a&color=FF1493`;
    try {
      const photos = JSON.parse((u.profile as { photos?: string })?.photos || "[]");
      if (photos[0]) avatar = photos[0];
    } catch {}

    return {
      id: u.id,
      name: u.name,
      avatar,
      occupation: (u.profile as { occupation?: string | null })?.occupation ?? null,
      company: (u.profile as { company?: string | null })?.company ?? null,
      industry: (u.profile as { industry?: string | null })?.industry ?? null,
      trustScore: (u.profile as { trustScore?: number | null })?.trustScore ?? 50,
      professionalVerified: (u.profile as { professionalVerified?: boolean | null })?.professionalVerified ?? false,
      tier: u.subscriptions?.[0]?.tier ?? "Free",
    };
  });

  return NextResponse.json(result);
}
