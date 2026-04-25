"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";
import { checkFeatureAccess } from "@/lib/access";

export async function fetchWhoLikedMe() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    // 1. Check Feature Access
    const hasAccess = await checkFeatureAccess(userId, "who_liked_me");
    if (!hasAccess) {
      return { success: false, locked: true };
    }

    // 2. Fetch swipes where current user is the target and action is LIKE or ROSE
    // And where a match hasn't been created yet.
    const likes = await prisma.swipe.findMany({
      where: {
        toUserId: userId,
        action: "LIKE",
        fromUser: {
          matches1: { none: { user2Id: userId } },
          matches2: { none: { user1Id: userId } }
        }
      },
      include: {
        fromUser: {
          include: { profile: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    return {
      success: true,
      data: likes.map(l => ({
        id: l.fromUserId,
        name: l.fromUser.name,
        image: JSON.parse(l.fromUser.profile?.photos || "[]")[0],
        action: l.action,
        date: l.createdAt
      }))
    };
  } catch (error) {
    console.error("fetchWhoLikedMe error:", error);
    return { success: false, error: "Failed to fetch likes" };
  }
}

