import { prisma } from "@/lib/prisma";
import { UserRole } from "../middleware/auth";

export class BillingService {
  /**
   * Processes a successful Stripe checkout session
   */
  public static async handleSubscriptionCreated(data: {
    userId: string;
    stripeSubId: string;
    tier: UserRole;
    expiresAt: Date;
  }) {
    return prisma.$transaction(async (tx) => {
      // 1. Create Subscription record
      await tx.subscription.create({
        data: {
          userId: data.userId,
          stripeSubId: data.stripeSubId,
          tier: data.tier,
          expiresAt: data.expiresAt
        }
      });

      // 2. Grant Initial "Roses" as a bonus for premium tiers
      if (data.tier === UserRole.ELITE) {
        await tx.user.update({
          where: { id: data.userId },
          data: { roseBalance: { increment: 50 } }
        });
      }
    });
  }

  /**
   * Handles subscription cancellation webhooks
   */
  public static async handleSubscriptionCancelled(stripeSubId: string) {
    return prisma.subscription.updateMany({
      where: { stripeSubId },
      data: { expiresAt: new Date() } // Expire immediately or at end of period
    });
  }

  /**
   * Generates a Stripe Checkout session link (Placeholder)
   */
  public static async createCheckoutSession(userId: string, tier: UserRole) {
    // In production, use stripe.checkout.sessions.create()
    return {
      url: `https://checkout.stripe.com/pay/${userId}_${tier}`
    };
  }
}
