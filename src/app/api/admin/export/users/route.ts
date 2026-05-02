import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { getAdminUser } from "@/lib/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const admin = await getAdminUser();
  if (!admin || admin.adminRole !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      email: true,
      roseBalance: true,
      isSuspended: true,
      createdAt: true,
      profile: { select: { occupation: true, trustScore: true, professionalVerified: true } },
      subscriptions: { orderBy: { createdAt: "desc" }, take: 1, select: { tier: true, createdAt: true } },
    },
  });

  const rows = [
    ["ID", "Name", "Email", "Roses", "Suspended", "Joined", "Occupation", "TrustScore", "ProfVerified", "SubTier", "SubDate"],
    ...users.map((u) => [
      u.id,
      u.name || "",
      u.email || "",
      u.roseBalance,
      u.isSuspended ? "Yes" : "No",
      new Date(u.createdAt).toISOString(),
      u.profile?.occupation || "",
      u.profile?.trustScore ?? 0,
      u.profile?.professionalVerified ? "Yes" : "No",
      u.subscriptions?.[0]?.tier || "Free",
      u.subscriptions?.[0]?.createdAt ? new Date(u.subscriptions[0].createdAt).toISOString() : "",
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="sfs-users-${Date.now()}.csv"`,
    },
  });
}
