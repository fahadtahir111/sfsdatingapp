"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";

/**
 * Fetch referral data for the current user.
 * Generates a code if one doesn't exist.
 */
export async function getReferralData() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    let userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { referralCode: true, id: true, name: true }
    });

    if (!userData) throw new Error("User not found");

    // Lazy generate referral code if missing
    if (!userData.referralCode) {
      const newCode = `SFS-${userData.name?.split(' ')[0].toUpperCase() || 'ELITE'}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      userData = await prisma.user.update({
        where: { id: userId },
        data: { referralCode: newCode },
        select: { referralCode: true, id: true, name: true }
      });
    }

    // Get successfully referred users
    const referrals = await prisma.user.findMany({
      where: { referredById: userId },
      select: {
        id: true,
        name: true,
        createdAt: true,
        subscriptions: {
          orderBy: { createdAt: 'desc' },
          take: 1
        }
      }
    });

    // Calculate total network impact
    // 5 points for Elite upgrade, 1 point for Free signup
    const stats = referrals.map(r => {
      const sub = r.subscriptions[0];
      const isPremium = sub?.tier === "Elite" || sub?.tier === "Signature";
      return {
        id: r.id,
        name: r.name || "Elite Member",
        date: r.createdAt,
        reward: isPremium ? 5 : 1, // Points for tracking growth
        status: isPremium ? "Premium Referral" : "Basic Referral"
      };
    });

    const totalEarned = stats.reduce((acc, curr) => acc + curr.reward, 0);

    return {
      referralCode: userData.referralCode,
      referrals: stats,
      totalEarned,
      success: true
    };
  } catch (error) {
    console.error("Error fetching referral data:", error);
    return { success: false, error: "Failed to load referral data" };
  }
}

/**
 * Process a referral during signup.
 * Note: This would be called from the register action.
 */
export async function linkReferral(newUserId: string, code: string) {
  try {
    const referrer = await prisma.user.findUnique({
      where: { referralCode: code }
    });

    if (!referrer || referrer.id === newUserId) return { success: false };

    await prisma.user.update({
      where: { id: newUserId },
      data: { referredById: referrer.id }
    });

    return { success: true };
  } catch (error) {
    console.error("Error linking referral:", error);
    return { success: false };
  }
}
