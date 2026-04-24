"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Submit verification data.
 * In a real app, this would handle file uploads to S3/Cloudinary.
 * Here we simulate the process and set status to PENDING.
 */
export async function submitVerification() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) throw new Error("Unauthorized");

    // 1. Update Profile Status
    await prisma.profile.update({
      where: { userId },
      data: { 
        verificationStatus: "PENDING",
        trustScore: { increment: 10 } // Incremental reward for starting verification
      }
    });

    // 2. In a real app, we'd create a Verification model record here.
    // For now, we'll just simulate the delay and revalidate.
    
    revalidatePath("/profile");
    revalidatePath("/verify");

    return { success: true };
  } catch (error) {
    console.error("Error in submitVerification:", error);
    return { success: false, error: "Submission failed." };
  }
}

/**
 * Instant verification for development/demo purposes.
 */
export async function simulateVerifyUser() {
  const session = await getServerSession(authOptions);
  const userId = (session?.user as { id: string } | undefined)?.id;
  if (!userId) return { success: false };

  await prisma.profile.update({
    where: { userId },
    data: { verificationStatus: "VERIFIED", trustScore: 100 }
  });

  revalidatePath("/profile");
  return { success: true };
}
