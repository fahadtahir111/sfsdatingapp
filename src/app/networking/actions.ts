"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Update professional networking goals for a profile.
 * @param goals - Array of strings (tags)
 */
export async function updateNetworkingGoals(goals: string[]) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) throw new Error("Unauthorized");

    await prisma.profile.update({
      where: { userId },
      data: {
        networkingGoals: JSON.stringify(goals)
      }
    });

    revalidatePath("/profile");
    revalidatePath("/discover");
    
    return { success: true };
  } catch (error) {
    console.error("Error updating networking goals:", error);
    return { success: false, error: "Failed to update goals" };
  }
}

/**
 * Fetch available networking tags (Master List).
 */
export async function getNetworkingTags() {
  return [
    "Venture Funding",
    "Co-founder",
    "Creative Partner",
    "Seed Investor",
    "Board/Advisory",
    "Mentorship",
    "Social Networking",
    "Strategic Partnership",
    "Event Hosting",
    "Crypto/Web3"
  ];
}

