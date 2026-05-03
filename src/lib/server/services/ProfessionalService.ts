import { prisma } from "@/lib/prisma";
import { UserRole } from "../middleware/auth";
import { SubscriptionService } from "./SubscriptionService";

export class ProfessionalService {
  /**
   * Fetches active boardrooms, prioritized by host tier (Elite hosts first)
   */
  public static async getPriorityBoardrooms() {
    const boardrooms = await prisma.boardroom.findMany({
      where: { isLive: true },
      include: {
        host: {
          include: { 
            profile: true,
            subscriptions: { where: { expiresAt: { gte: new Date() } } }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Sort by tier: Elite > Signature > Free
    return boardrooms.sort((a, b) => {
      const tierA = a.host.subscriptions[0]?.tier || UserRole.FREE;
      const tierB = b.host.subscriptions[0]?.tier || UserRole.FREE;
      
      const weights: Record<string, number> = {
        [UserRole.ELITE]: 3,
        [UserRole.SIGNATURE]: 2,
        [UserRole.FREE]: 1
      };

      return (weights[tierB] || 0) - (weights[tierA] || 0);
    });
  }

  /**
   * Records a vouch between two professional users
   */
  public static async vouchForUser(vouchById: string, vouchForId: string) {
    if (vouchById === vouchForId) throw new Error("Cannot vouch for yourself");

    // Check if vouchBy is Elite/Verified (Optional policy)
    const isElite = await SubscriptionService.hasFeatureAccess(vouchById, UserRole.ELITE);
    
    const vouch = await prisma.vouch.upsert({
      where: { vouchById_vouchForId: { vouchById, vouchForId } },
      update: {},
      create: { vouchById, vouchForId }
    });

    // Increment trust score of the receiver
    await prisma.profile.update({
      where: { userId: vouchForId },
      data: {
        trustScore: { increment: isElite ? 5 : 2 }
      }
    });

    return vouch;
  }

  public static async createBoardroom(userId: string, title: string, description?: string) {
    // Feature gate: Free users can only host 1 active boardroom at a time
    const activeCount = await prisma.boardroom.count({
      where: { hostId: userId, isLive: true }
    });

    const isSignature = await SubscriptionService.hasFeatureAccess(userId, UserRole.SIGNATURE);
    if (!isSignature && activeCount >= 1) {
      throw new Error("Free tier limited to 1 active boardroom. Upgrade to Signature for more.");
    }

    return prisma.boardroom.create({
      data: {
        title,
        description: description || null,
        hostId: userId,
        isLive: true
      }
    });
  }
}
