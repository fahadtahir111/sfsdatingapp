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

  const transactions = await prisma.roseTransaction.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      amount: true,
      type: true,
      createdAt: true,
      user: { select: { id: true, name: true, email: true } },
    },
  });

  const rows = [
    ["TX ID", "User ID", "User Name", "User Email", "Amount", "Type", "Date"],
    ...transactions.map((tx) => [
      tx.id,
      tx.user.id,
      tx.user.name || "",
      tx.user.email || "",
      tx.amount,
      tx.type,
      new Date(tx.createdAt).toISOString(),
    ]),
  ];

  const csv = rows.map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(",")).join("\n");

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="sfs-roses-${Date.now()}.csv"`,
    },
  });
}
