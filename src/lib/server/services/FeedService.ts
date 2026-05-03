import { prisma } from "@/lib/prisma";

export class FeedService {
  /**
   * Generates a personalized feed for a user.
   * Logic: Candidates -> Scoring -> Diversity -> Ranking
   */
  public static async getPersonalizedFeed(userId: string, pageSize = 20, cursor?: string) {
    // 1. Candidate Generation (Fetch pool of posts)
    const pool = await prisma.post.findMany({
      where: {
        user: { isSuspended: false }
      },
      take: 100, // Fixed pool size for ranking
      ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
      include: {
        user: { include: { profile: true } },
        likes: { select: { userId: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: "desc" }
    });

    // 2. Scoring System
    const scoredPool = pool.map(post => {
      let score = 100;

      // Recency Decay (Linear decay over 7 days)
      const ageInHours = (Date.now() - post.createdAt.getTime()) / (1000 * 60 * 60);
      score -= Math.min(ageInHours * 0.5, 80);

      // Engagement Signal
      const engagement = (post._count.likes * 2) + (post._count.comments * 5);
      score += Math.min(engagement, 50);

      // Relationship Signal (If user follows or is friends)
      // Note: This would require a connection check which we can optimize with a set
      // For now, placeholder for high-intent signal
      
      // Content Type Diversity (Bonus for media-rich posts)
      if (post.mediaType === "VIDEO") score += 15;
      if (post.mediaUrl) score += 10;

      return { ...post, score };
    });

    // 3. Ranking
    const ranked = scoredPool.sort((a, b) => b.score - a.score);

    // 4. Diversity Filter (Mix following and discovery)
    // In a real system, we'd ensure a specific ratio here.
    
    return ranked.slice(0, pageSize);
  }

  /**
   * Generates a specialized Networking feed for Professional mode.
   */
  public static async getNetworkingFeed() {
    // Focus on industry alignment and high trust profiles
    return prisma.post.findMany({
      where: {
        user: {
          profile: { isNetworkingMode: true }
        }
      },
      include: {
        user: { include: { profile: true } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 20
    });
  }
}
