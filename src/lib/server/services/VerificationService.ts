import { prisma } from "@/lib/prisma";

export class VerificationService {
  /**
   * Submits a new verification request
   */
  public static async submitRequest(userId: string, idUrl?: string, selfieUrl?: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Update Profile status
      await tx.profile.update({
        where: { userId },
        data: {
          verificationStatus: "PENDING",
          onboardingStep: 4,
          onboardingCompletedAt: new Date()
        }
      });

      // 2. Upsert Verification record
      return tx.verification.upsert({
        where: { userId },
        create: {
          userId,
          idUrl: idUrl || null,
          selfieUrl: selfieUrl || null,
          status: "PENDING"
        },
        update: {
          idUrl: idUrl || null,
          selfieUrl: selfieUrl || null,
          status: "PENDING",
          createdAt: new Date() // Reset request time
        }
      });
    });
  }

  /**
   * Approves a verification request (Admin only)
   */
  public static async approveRequest(userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { userId },
        data: {
          verificationStatus: "VERIFIED",
          trustScore: { increment: 50 } // Massive boost for verified users
        }
      });

      return tx.verification.update({
        where: { userId },
        data: { status: "VERIFIED" }
      });
    });
  }

  /**
   * Rejects a verification request
   */
  public static async rejectVerification(userId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.profile.update({
        where: { userId },
        data: { verificationStatus: "REJECTED" }
      });

      return tx.verification.update({
        where: { userId },
        data: { status: "REJECTED" }
      });
    });
  }
}
