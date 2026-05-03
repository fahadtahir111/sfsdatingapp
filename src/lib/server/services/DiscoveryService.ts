import { MatchingService, MatchCandidate } from "./MatchingService";
import { prisma } from "@/lib/prisma";

export class DiscoveryService {
  /**
   * Fetches the ranked discover feed for a user
   */
  public static async getRankedFeed(userId: string, filters?: { minAge?: number; maxAge?: number; searchQuery?: string }) {
    const candidates: MatchCandidate[] = await MatchingService.getDiscoverCandidates(userId, 20, filters);
    
    return candidates.map(user => {
      let photos = [];
      try { photos = JSON.parse(user.profile?.photos || "[]"); } catch {}

      // Calculate age
      let age = user.profile?.age || 0;
      if (user.profile?.birthDate) {
        const diff = Date.now() - new Date(user.profile.birthDate).getTime();
        age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      }

      return {
        id: user.id,
        name: user.name || "Unknown",
        age: age || 25,
        role: user.profile?.occupation || "Elite Member",
        image: photos[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=050505&color=FFD700&size=400`,
        trustScore: user.profile?.trustScore || 50,
        networkingGoals: JSON.parse(user.profile?.networkingGoals || "[]"),
        isVerified: user.profile?.verificationStatus === "VERIFIED",
        score: user.score // Algorithm score
      };
    });
  }

  /**
   * Processes a swipe and checks for matches
   */
  public static async processSwipe(fromUserId: string, toUserId: string, action: "LIKE" | "PASS" | "ROSE") {
    // 1. Record Swipe
    await prisma.swipe.upsert({
      where: { fromUserId_toUserId: { fromUserId, toUserId } },
      update: { action },
      create: { fromUserId, toUserId, action }
    });

    if (action === "PASS") return { matched: false };

    // 2. Check for Match
    const reciprocal = await prisma.swipe.findUnique({
      where: { fromUserId_toUserId: { fromUserId: toUserId, toUserId: fromUserId } }
    });

    if (reciprocal && (reciprocal.action === "LIKE" || reciprocal.action === "ROSE")) {
      // Create Match
      const match = await prisma.match.upsert({
        where: { user1Id_user2Id: this.getMatchKey(fromUserId, toUserId) },
        update: {},
        create: {
          user1Id: fromUserId < toUserId ? fromUserId : toUserId,
          user2Id: fromUserId < toUserId ? toUserId : fromUserId
        }
      });

      // Ensure Conversation exists
      const conversation = await prisma.conversation.create({
        data: {
          userLinks: {
            create: [{ userId: fromUserId }, { userId: toUserId }]
          }
        }
      });

      // REAL-TIME NOTIFICATION
      const { SignalingService } = await import("@/lib/server/services/SignalingService");
      await SignalingService.notifyMatch(fromUserId, { targetId: toUserId, conversationId: conversation.id });
      await SignalingService.notifyMatch(toUserId, { targetId: fromUserId, conversationId: conversation.id });

      return { matched: true, matchId: match.id, conversationId: conversation.id };
    }

    return { matched: false };
  }

  private static getMatchKey(id1: string, id2: string) {
    return id1 < id2 ? { user1Id: id1, user2Id: id2 } : { user1Id: id2, user2Id: id1 };
  }
}
