"use server";

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { claimDailyBonus as claimDailyBonusServer } from "./economy";

export async function claimDailyBonus() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  return await claimDailyBonusServer(userId);
}
