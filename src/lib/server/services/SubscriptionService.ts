import { prisma } from "@/lib/prisma";
import { UserRole } from "../middleware/auth";

export class SubscriptionService {
  /**
   * Checks if a user has access to a specific feature based on their tier.
   */
  public static async hasFeatureAccess(userId: string, requiredTier: UserRole) {
    const sub = await prisma.subscription.findFirst({
      where: {
        userId,
        expiresAt: { gte: new Date() }
      },
      orderBy: { createdAt: "desc" }
    });

    const currentTier = (sub?.tier as UserRole) || UserRole.FREE;
    
    const tiers: Record<UserRole, number> = {
      [UserRole.FREE]: 0,
      [UserRole.SIGNATURE]: 1,
      [UserRole.ELITE]: 2,
      [UserRole.ADMIN]: 3
    };

    return tiers[currentTier] >= tiers[requiredTier];
  }

  /**
   * Gating logic for swipe limits
   */
  public static async canSwipe(userId: string) {
    const isElite = await this.hasFeatureAccess(userId, UserRole.ELITE);
    if (isElite) return true; // Unlimited swipes for Elite

    const swipeCount = await prisma.swipe.count({
      where: {
        fromUserId: userId,
        createdAt: { gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      }
    });

    const limit = (await this.hasFeatureAccess(userId, UserRole.SIGNATURE)) ? 200 : 50;
    return swipeCount < limit;
  }

  /**
   * Triggers a profile boost for Elite users
   */
  public static async boostProfile(userId: string) {
    const isElite = await this.hasFeatureAccess(userId, UserRole.ELITE);
    if (!isElite) throw new Error("Boost requires Elite subscription");

    return prisma.profile.update({
      where: { userId },
      data: { boostedUntil: new Date(Date.now() + 60 * 60 * 1000) } // 1 hour boost
    });
  }
}
