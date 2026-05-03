"use server";

import { getCurrentUser } from "@/lib/auth";
import { DiscoveryService } from "@/lib/server/services/DiscoveryService";
import { revalidatePath } from "next/cache";

export async function fetchDiscoverFeed(filters?: { minAge?: number; maxAge?: number; searchQuery?: string }) {
  try {
    const user = await getCurrentUser();
    if (!user) return [];
    
    // Pass filters to DiscoveryService (I'll check if DiscoveryService supports them)
    return await DiscoveryService.getRankedFeed(user.id, filters);
  } catch (error) {
    console.error("Error fetching discover feed:", error);
    return [];
  }
}

export async function submitSwipe(toUserId: string, action: "LIKE" | "PASS" | "ROSE") {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");

    const result = await DiscoveryService.processSwipe(user.id, toUserId, action);
    
    if (result.matched) {
      revalidatePath("/chat");
      revalidatePath("/matches");
    }

    return result;
  } catch (error) {
    console.error("Error submitting swipe:", error);
    throw new Error("Failed to process swipe");
  }
}
