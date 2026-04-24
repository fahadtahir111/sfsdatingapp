import { prisma } from "./prisma";

export type SubscriptionTier = "Free" | "Signature" | "Elite";

export const TIER_FEATURES: Record<SubscriptionTier, string[]> = {
  Free: [
    "basic_discovery",
    "chat_limited",
    "profile_basic"
  ],
  Signature: [
    "basic_discovery",
    "chat_unlimited",
    "profile_basic",
    "advanced_filters",
    "read_receipts",
    "unlimited_swipes"
  ],
  Elite: [
    "basic_discovery",
    "chat_unlimited",
    "profile_basic",
    "advanced_filters",
    "read_receipts",
    "unlimited_swipes",
    "ghost_mode",
    "who_liked_me",
    "priority_discovery",
    "private_events"
  ]
};

/**
 * Check if a user has access to a specific feature.
 */
export async function checkFeatureAccess(userId: string, feature: string): Promise<boolean> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      subscriptions: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  if (!user) return false;

  const activeSub = user.subscriptions[0];
  const tier: SubscriptionTier = (activeSub?.tier as SubscriptionTier) || "Free";

  return TIER_FEATURES[tier].includes(feature);
}

/**
 * Get the current tier for a user.
 */
export async function getUserTier(userId: string): Promise<SubscriptionTier> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { 
      subscriptions: {
        where: { expiresAt: { gt: new Date() } },
        orderBy: { createdAt: 'desc' },
        take: 1
      }
    }
  });

  return (user?.subscriptions[0]?.tier as SubscriptionTier) || "Free";
}
