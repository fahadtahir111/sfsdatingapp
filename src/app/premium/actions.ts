"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Handle subscription upgrades.
 * Simulation logic: Updates the subscription tier.
 */
export async function upgradeSubscription(tier: "Signature" | "Elite") {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) throw new Error("Unauthorized");

    // 1. Update or Create Subscription
    const expiresAt = new Date();
    expiresAt.setMonth(expiresAt.getMonth() + 1);

    await prisma.subscription.upsert({
      where: { id: `sub-${userId}` },
      update: { tier, expiresAt },
      create: { 
        id: `sub-${userId}`,
        userId, 
        tier, 
        expiresAt 
      }
    });

    // 2. Grant Status Bonus (Placeholder for non-rose benefits)
    // In a real app, this might unlock specific features in the DB

    // 3. Update paths
    revalidatePath("/profile");
    revalidatePath("/premium");
    revalidatePath("/discover");

    return { success: true, tier };
  } catch (error) {
    console.error("Error in upgradeSubscription:", error);
    return { success: false, error: "Upgrade failed." };
  }
}

// sendRose function removed as per requirements.

