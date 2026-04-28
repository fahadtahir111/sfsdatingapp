/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

// Refreshing types for boostedUntil

import { getCurrentUser } from "@/lib/auth";
import { claimDailyBonus as claimServer, spendTokens } from "@/lib/economy";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";

export async function claimDailyBonus() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };
  return await claimServer(user.id);
}

export async function boostProfile() {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };
  
  // Cost for boosting
  const cost = 300;
  
  const result = await spendTokens(user.id, cost, "PROFILE_BOOST");
  if (result.success) {
    const tomorrow = new Date();
    tomorrow.setHours(tomorrow.getHours() + 24);
    
    await (prisma as any).profile.update({
      where: { userId: user.id },
      data: { 
        boostedUntil: tomorrow
      }
    });
    revalidatePath("/profile");
    revalidatePath("/discover");
  }
  return result;
}
