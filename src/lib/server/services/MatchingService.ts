import { prisma } from "@/lib/prisma";
import { User, Profile, FilterPreference, Prisma } from "@prisma/client";

export interface MatchCandidate extends User {
  profile: Profile | null;
  score?: number;
}

export interface UserWithProfile extends User {
  profile: Profile | null;
  filterPref?: FilterPreference | null;
  swipesGiven?: { toUserId: string }[];
  matches1?: unknown[];
  matches2?: unknown[];
  swipesReceived?: unknown[];
}

export class MatchingService {
  /**
   * Calculates the Elite Compatibility Score between two users.
   * Formula: Score = (S * 0.3) + (P * 0.25) + (A * 0.2) + (T * 0.15) + (Pop * 0.1)
   */
  public static calculateScore(user1: UserWithProfile, user2: UserWithProfile): number {
    const similarity = this.calculateSimilarity(user1, user2); // 0-100
    const proximity = this.calculateProximity(user1, user2); // 0-100
    const activity = this.calculateActivity(user2); // 0-100
    const trust = this.calculateTrust(user2); // 0-100
    const popularity = this.calculatePopularity(user2); // 0-100

    const score = 
      (similarity * 0.30) + 
      (proximity * 0.25) + 
      (activity * 0.20) + 
      (trust * 0.15) + 
      (popularity * 0.10);

    return Math.round(score);
  }

  private static calculateSimilarity(u1: UserWithProfile, u2: UserWithProfile): number {
    const tags1 = new Set(JSON.parse(u1.profile?.networkingGoals || "[]"));
    const tags2 = new Set(JSON.parse(u2.profile?.networkingGoals || "[]"));
    
    if (tags1.size === 0 || tags2.size === 0) return 50;

    const intersection = new Set([...tags1].filter(x => tags2.has(x)));
    const union = new Set([...tags1, ...tags2]);
    const jaccard = (intersection.size / union.size) * 100;

    // Add industry bonus
    const industryBonus = u1.profile?.industry === u2.profile?.industry ? 20 : 0;
    
    return Math.min(jaccard + industryBonus, 100);
  }

  private static calculateProximity(u1: UserWithProfile, u2: UserWithProfile): number {
    // Placeholder for real geo-calc. For now, simulate based on locationString
    if (u1.profile?.locationString === u2.profile?.locationString) return 100;
    return 60; // Default medium score
  }

  private static calculateActivity(u: UserWithProfile): number {
    const lastActive = new Date(u.lastActive).getTime();
    const now = Date.now();
    const hoursSinceActive = (now - lastActive) / (1000 * 60 * 60);
    
    if (hoursSinceActive < 24) return 100;
    if (hoursSinceActive < 72) return 80;
    return Math.max(100 - hoursSinceActive / 2, 20);
  }

  private static calculateTrust(u: UserWithProfile): number {
    let score = u.profile?.trustScore || 50;
    if (u.profile?.verificationStatus === "VERIFIED") score += 20;
    if (u.profile?.professionalVerified) score += 10;
    return Math.min(score, 100);
  }

  private static calculatePopularity(u: UserWithProfile): number {
    // Based on match count relative to total swipes received
    const matchCount = (u.matches1?.length || 0) + (u.matches2?.length || 0);
    const swipeCount = u.swipesReceived?.length || 1;
    let score = Math.min((matchCount / swipeCount) * 100 + 30, 100);

    // Profile Boost (Premium feature)
    if (u.profile?.boostedUntil && new Date(u.profile.boostedUntil) > new Date()) {
      score += 25; // 25% visibility boost
    }

    return Math.min(score, 100);
  }

  /**
   * Fetches potential candidates for a user based on preferences and algorithm.
   */
  public static async getDiscoverCandidates(
    userId: string, 
    limit = 20, 
    filters?: { minAge?: number; maxAge?: number; searchQuery?: string }
  ): Promise<MatchCandidate[]> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { 
        profile: true, 
        filterPref: true,
        swipesGiven: { select: { toUserId: true } }
      }
    });

    if (!user) throw new Error("User not found");

    const excludedUserIds = [userId, ...user.swipesGiven.map(s => s.toUserId)];

    const candidates = await prisma.user.findMany({
      where: {
        id: { notIn: excludedUserIds },
        isSuspended: false,
        AND: [
          {
            profile: {
              gender: user.profile?.interestedIn || undefined,
              age: {
                gte: filters?.minAge || user.filterPref?.minAge || 18,
                lte: filters?.maxAge || user.filterPref?.maxAge || 99
              }
            }
          },
          filters?.searchQuery ? {
            OR: [
              { name: { contains: filters.searchQuery, mode: 'insensitive' } as unknown as Prisma.StringNullableFilter },
              { profile: { occupation: { contains: filters.searchQuery, mode: 'insensitive' } } as unknown as Prisma.ProfileWhereInput },
              { profile: { locationString: { contains: filters.searchQuery, mode: 'insensitive' } } as unknown as Prisma.ProfileWhereInput }
            ]
          } as Prisma.UserWhereInput : {}
        ]
      },
      include: { 
        profile: true,
        matches1: true,
        matches2: true,
        swipesReceived: true
      },
      take: 100 // Pool size for ranking
    });

    // Rank candidates
    const ranked = candidates.map(c => ({
      ...c,
      score: this.calculateScore(user as UserWithProfile, c as UserWithProfile)
    })).sort((a, b) => (b.score || 0) - (a.score || 0));

    // Add some randomness to avoid stagnant feeds
    return ranked.slice(0, limit).sort(() => Math.random() - 0.5);
  }
}
