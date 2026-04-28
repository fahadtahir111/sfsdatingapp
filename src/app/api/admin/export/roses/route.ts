import { NextResponse } from "next/server";
import { getAdminRole } from "@/lib/admin";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const role = await getAdminRole();
  if (role !== "superadmin") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const txs = await prisma.roseTransaction.findMany({
    orderBy: { createdAt: "desc" },
    take: 5000,
    select: {
      id: true,
      userId: true,
      amount: true,
      type: true,
      createdAt: true,
      user: {
        select: { email: true, name: true },
      },
    },
  });

  const header = "id,userId,userEmail,userName,amount,type,createdAt";
  const rows = txs.map((t) =>
    [t.id, t.userId, t.user.email, t.user.name ?? "", String(t.amount), t.type, t.createdAt.toISOString()]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(",")
  );
  const csv = [header, ...rows].join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="roses-ledger-export.csv"`,
    },
  });
}

