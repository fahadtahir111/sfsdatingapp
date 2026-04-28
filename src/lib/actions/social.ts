/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser, getAuthToken, verifyJWT } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { grantTokens } from "@/lib/economy";

export async function toggleLike(targetId: string, type: string) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    if (type === "REEL") {
      const existingLike = await prisma.reelLike.findUnique({
        where: { userId_reelId: { userId, reelId: targetId } }
      });
      if (existingLike) {
        await prisma.reelLike.delete({ where: { id: existingLike.id } });
        return { liked: false };
      } else {
        await prisma.reelLike.create({ data: { userId, reelId: targetId } });
        // Reward user for engagement
        await grantTokens(userId, 2, "REEL_LIKE_REWARD");
        return { liked: true };
      }
    } else {
      const existingLike = await prisma.postLike.findUnique({
        where: { userId_postId: { userId, postId: targetId } }
      });
      if (existingLike) {
        await prisma.postLike.delete({ where: { id: existingLike.id } });
        await prisma.post.update({ where: { id: targetId }, data: { likesCount: { decrement: 1 } } });
      } else {
        await prisma.postLike.create({ data: { userId, postId: targetId } });
        await prisma.post.update({ where: { id: targetId }, data: { likesCount: { increment: 1 } } });
        // Reward user for engagement
        await grantTokens(userId, 1, "POST_LIKE_REWARD");
      }
      return { liked: !existingLike };
    }
  } catch (error) {
    console.error("toggleLike error:", error);
    return { error: "Failed to toggle like" };
  } finally {
    revalidatePath("/feed");
    revalidatePath("/reels");
    revalidatePath("/profile");
  }
}

export async function createSocialContent(content: string, mediaUrl?: string, mediaType?: string, asReel: boolean = false) {
  try {
    const token = await getAuthToken();
    if (!token) {
      console.log("createSocialContent: No auth token found");
      throw new Error("Unauthorized - Missing Cookie");
    }
    const payload = await verifyJWT(token);
    if (!payload || !payload.userId) {
      console.log("createSocialContent: JWT verification failed or missing userId");
      throw new Error("Unauthorized - Invalid JWT");
    }
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (!user) {
      console.log("createSocialContent: User not found for ID:", payload.userId);
      throw new Error("Unauthorized - User not found in DB");
    }
    const userId = user.id;

    if (asReel && mediaUrl) {
      const reel = await prisma.reel.create({
        data: {
          userId,
          videoUrl: mediaUrl,
          caption: content,
        }
      });
      
      // Major reward for creating content
      await grantTokens(userId, 100, "REEL_CREATION_REWARD");
      
      revalidatePath("/reels");
      revalidatePath("/feed");
      revalidatePath("/profile");
      return { success: true, item: reel, type: "REEL" };
    } else {
      const post = await prisma.post.create({
        data: {
          userId,
          content,
          mediaUrl,
          mediaType: mediaType || (mediaUrl ? "IMAGE" : "STATUS")
        }
      });

      // Reward for feed post
      await grantTokens(userId, 50, "POST_CREATION_REWARD");

      revalidatePath("/feed");
      revalidatePath("/profile");
      return { success: true, item: post, type: "POST" };
    }
  } catch (error) {
    console.error("createSocialContent error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}


export async function vouchForUser(targetId: string) {
  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Unauthorized");
    if (user.id === targetId) throw new Error("Cannot vouch for yourself");

    await (prisma as any).vouch.create({
      data: {
        vouchById: user.id,
        vouchForId: targetId
      }
    });

    // Award trust score bonus
    await (prisma as any).profile.update({
      where: { userId: targetId },
      data: { trustScore: { increment: 5 } }
    });

    revalidatePath("/profile/" + targetId);
    return { success: true };
  } catch (error) {
    console.error("Vouch error:", error);
    return { success: false, error: "Already vouched or failed" };
  }
}

export async function deleteOwnContent(targetId: string, type: "POST" | "REEL") {
  try {
    const user = await getCurrentUser();
    if (!user) return { success: false, error: "Unauthorized" };

    if (type === "POST") {
      const post = await prisma.post.findUnique({ where: { id: targetId }, select: { userId: true } });
      if (!post) return { success: false, error: "Post not found" };
      if (post.userId !== user.id) return { success: false, error: "Forbidden" };
      await prisma.post.delete({ where: { id: targetId } });
    } else {
      const reel = await prisma.reel.findUnique({ where: { id: targetId }, select: { userId: true } });
      if (!reel) return { success: false, error: "Reel not found" };
      if (reel.userId !== user.id) return { success: false, error: "Forbidden" };
      await prisma.reel.delete({ where: { id: targetId } });
    }

    revalidatePath("/feed");
    revalidatePath("/reels");
    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("deleteOwnContent error:", error);
    return { success: false, error: "Failed to delete content" };
  }
}
