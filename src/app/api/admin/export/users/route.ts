import { NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const role = await getAdminRole();
  if (role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      email: true,
      name: true,
      isSuspended: true,
      roseBalance: true,
      createdAt: true,
      lastActive: true,
    },
  });

  const header = "id,email,name,isSuspended,roseBalance,createdAt,lastActive";
  const rows = users.map((u) =>
    [u.id, u.email, u.name ?? "", String(u.isSuspended), String(u.roseBalance), u.createdAt.toISOString(), u.lastActive.toISOString()]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="users-export.csv"`,
    },
  });
}

