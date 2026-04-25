"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Creates a new Reel for the authenticated user.
 */
export async function createReel(videoUrl: string, caption: string) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    if (!userId) {
      throw new Error("Unauthorized: You must be logged in to post reels.");
    }

    const reel = await prisma.reel.create({
      data: {
        userId,
        videoUrl,
        caption,
      },
    });

    // Revalidate the reels feed to show the new reel immediately
    revalidatePath("/reels");

    return { success: true, reel };
  } catch (error) {
    console.error("Error creating reel:", error);
    return { success: false, error: "Failed to post reel. Please try again." };
  }
}

