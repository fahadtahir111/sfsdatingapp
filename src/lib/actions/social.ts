"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

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
    const token = await require("@/lib/auth").getAuthToken();
    if (!token) throw new Error("Unauthorized - Missing Cookie");
    const payload = await require("@/lib/auth").verifyJWT(token);
    if (!payload || !payload.userId) throw new Error("Unauthorized - Invalid JWT");
    const user = await prisma.user.findUnique({ where: { id: payload.userId as string } });
    if (!user) throw new Error("Unauthorized - User not found in DB");
    const userId = user.id;

    if (asReel && mediaUrl) {
      const reel = await prisma.reel.create({
        data: {
          userId,
          videoUrl: mediaUrl,
          caption: content,
        }
      });
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
      revalidatePath("/feed");
      revalidatePath("/profile");
      return { success: true, item: post, type: "POST" };
    }
  } catch (error) {
    console.error("createSocialContent error:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}

