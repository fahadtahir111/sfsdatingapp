"use server";

import { getCurrentUser } from "@/lib/auth";
import { claimDailyBonus as claimDailyBonusServer } from "./economy";

export async function claimDailyBonus() {
  const user = await getCurrentUser();
  const userId = user?.id;
  if (!userId) return { success: false, error: "Unauthorized" };

  return await claimDailyBonusServer(userId);
}
