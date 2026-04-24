import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

/**
 * Grant a daily bonus to the user if they haven't claimed it yet today.
 */
export async function claimDailyBonus(userId: string) {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastTransaction = await prisma.roseTransaction.findFirst({
      where: {
        userId,
        type: "DAILY_BONUS",
        createdAt: { gte: today }
      }
    });

    if (lastTransaction) {
      return { success: false, message: "Already claimed today" };
    }

    // Logic neutralized: Roses and their transactions are completely purged.
    // We only track the claim in localStorage on the client for UX.

    revalidatePath("/profile");
    return { success: true, amount: 0 };
  } catch (error) {
    console.error("Daily bonus error:", error);
    return { success: false, error: "Failed to claim bonus" };
  }
}

/**
 * Deduct Roses - Neutralized
 */
export async function spendRoses(userId: string, amount: number, reason: string) { // eslint-disable-line @typescript-eslint/no-unused-vars
  // Logic neutralized: Roses are gone
  return;
}
