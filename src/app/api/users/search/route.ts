import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

type SearchUserRow = {
  id: string;
  name: string | null;
  profile: {
    photos: string | null;
    occupation: string | null;
    trustScore: number | null;
    professionalVerified: boolean | null;
  } | null;
  subscriptions: Array<{
    tier: string;
  }>;
};

export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const q = req.nextUrl.searchParams.get("q")?.trim() ?? "";
  if (q.length < 1) return NextResponse.json([]);

  const users = await prisma.user.findMany({
    where: {
      id: { not: me.id },
      name: { contains: q, mode: "insensitive" },
    },
    take: 20,
    include: {
      profile: true,
      subscriptions: {
        orderBy: { createdAt: "desc" },
        take: 1,
      },
    },
  });

  const result = (users as SearchUserRow[]).map((u) => {
    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(u.name || "User")}`;
    try {
      const photos = JSON.parse(u.profile?.photos || "[]");
      if (photos[0]) avatar = photos[0];
    } catch {}

    return {
      id: u.id,
      name: u.name,
      avatar,
      occupation: u.profile?.occupation ?? null,
      trustScore: u.profile?.trustScore ?? 50,
      professionalVerified: u.profile?.professionalVerified ?? false,
      tier: u.subscriptions?.[0]?.tier ?? "Free",
    };
  });

  return NextResponse.json(result);
}
