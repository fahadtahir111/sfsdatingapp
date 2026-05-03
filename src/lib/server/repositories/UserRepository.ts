import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class UserRepository {
  /**
   * Optimized user fetch with full profile and settings
   */
  public static async getFullUser(userId: string) {
    return prisma.user.findUnique({
      where: { id: userId },
      include: {
        profile: true,
        filterPref: true,
        subscriptions: {
          where: { expiresAt: { gte: new Date() } },
          orderBy: { createdAt: "desc" },
          take: 1
        },
        _count: {
          select: {
            matches1: true,
            matches2: true,
            posts: true,
            reels: true
          }
        }
      }
    });
  }

  /**
   * Bulk fetch users with specific profile criteria (for matching/feed)
   */
  public static async findUsersByCriteria(where: Prisma.UserWhereInput, take = 50) {
    return prisma.user.findMany({
      where,
      include: {
        profile: true
      },
      take
    });
  }

  /**
   * Update user status and metadata
   */
  public static async updateActivity(userId: string) {
    return prisma.user.update({
      where: { id: userId },
      data: { lastActive: new Date() }
    });
  }
  
  public static async incrementRoseBalance(userId: string, amount: number) {
    return prisma.user.update({
      where: { id: userId },
      data: {
        roseBalance: { increment: amount }
      }
    });
  }
}
