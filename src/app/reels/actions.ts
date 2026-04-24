"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

import { formatRelativeTime } from "@/lib/utils/format";

/**
 * Fetch all reels with user info, likes, and comments.
 */
export async function getReels() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    // We don't strictly require a session to VIEW reels, but let's check for Likes
    
    const reels = await prisma.reel.findMany({
      include: {
        user: {
          include: { profile: true }
        },
        likes: {
          where: { userId: userId || "" }
        },
        _count: {
          select: {
            likes: true,
            comments: true
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reels.map(r => ({
      id: r.id,
      url: r.videoUrl,
      user: `@${r.user.name?.toLowerCase().replace(/\s/g, '') || "elite_user"}`,
      caption: r.caption || "",
      song: `Original Audio - ${r.user.name || "SFS Elite"}`,
      likes: r._count.likes,
      comments: r._count.comments,
      isLiked: r.likes.length > 0
    }));
  } catch (error) {
    console.error("Error fetching reels:", error);
    return [];
  }
}



/**
 * Post a comment on a reel.
 */
export async function postReelComment(reelId: string, text: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) throw new Error("Unauthorized");

    const comment = await prisma.reelComment.create({
      data: {
        userId,
        reelId,
        text
      },
      include: {
        user: true
      }
    });

    return {
      id: comment.id,
      user: comment.user.name || "User",
      text: comment.text,
      time: "Just now"
    };
  } catch (error) {
    console.error("Error posting comment:", error);
    throw new Error("Failed to post comment");
  }
}

/**
 * Fetch comments for a reel.
 */
export async function getReelComments(reelId: string) {
  try {
    const comments = await prisma.reelComment.findMany({
      where: { reelId },
      include: { user: true },
      orderBy: { createdAt: 'desc' }
    });

    return comments.map(c => ({
      id: c.id,
      user: c.user.name || "User",
      text: c.text,
      time: formatRelativeTime(c.createdAt)
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}



