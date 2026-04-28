import { prisma } from "./prisma";
import { revalidatePath } from "next/cache";

/**
 * Grant a daily bonus to the user if they haven't claimed it yet today.
 */
/**
 * Grant tokens to the user for various activities.
 */
export async function grantTokens(userId: string, amount: number, type: string) {
  try {
    await prisma.$transaction([
      prisma.roseTransaction.create({
        data: {
          userId,
          amount,
          type,
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          roseBalance: { increment: amount }
        }
      })
    ]);

    revalidatePath("/profile");
    return { success: true, amount };
  } catch (error) {
    console.error("Grant tokens error:", error);
    return { success: false, error: "Failed to grant tokens" };
  }
}

/**
 * Spend tokens for premium features.
 */
export async function spendTokens(userId: string, amount: number, reason: string) {
  try {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || user.roseBalance < amount) {
      return { success: false, error: "Insufficient balance" };
    }

    await prisma.$transaction([
      prisma.roseTransaction.create({
        data: {
          userId,
          amount: -amount,
          type: `SPEND_${reason.toUpperCase()}`,
        }
      }),
      prisma.user.update({
        where: { id: userId },
        data: {
          roseBalance: { decrement: amount }
        }
      })
    ]);

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Spend tokens error:", error);
    return { success: false, error: "Failed to spend tokens" };
  }
}

export async function claimDailyBonus(userId: string) {
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

  return await grantTokens(userId, 50, "DAILY_BONUS");
}
