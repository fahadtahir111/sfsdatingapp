"use server";

import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

import { getCurrentUser } from "@/lib/auth";

import { formatRelativeTime } from "@/lib/utils/format";

/**
 * Fetch all reels with user info, likes, and comments.
 */
export async function getReels(mode: "discover" | "following" = "discover") {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;

    let whereClause: Prisma.ReelWhereInput = {};
    if (mode === "following" && userId) {
      const friendships = await prisma.friendship.findMany({
        where: {
          OR: [{ user1Id: userId }, { user2Id: userId }],
        },
        select: {
          user1Id: true,
          user2Id: true,
        },
      });
      const friendIds = friendships.map((f) => (f.user1Id === userId ? f.user2Id : f.user1Id));
      const targetIds = [...new Set([userId, ...friendIds])];
      whereClause = { userId: { in: targetIds } };
    } else {
      // In discover mode, we want to ensure we aren't accidentally filtering by the current user
      whereClause = {};
    }

    const reels = await prisma.reel.findMany({
      where: whereClause,
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
      userId: r.userId,
      canDelete: r.userId === userId,
      user: `@${r.user.name?.toLowerCase().replace(/\s/g, '') || "elite_user"}`,
      userAvatar: (() => {
        try {
          return JSON.parse(r.user.profile?.photos || "[]")[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user.name || "User")}`;
        } catch {
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(r.user.name || "User")}`;
        }
      })(),
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
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    const comment = await prisma.reelComment.create({
      data: {
        userId,
        reelId,
        text
      },
      include: {
        user: {
          include: { profile: true },
        }
      }
    });

    return {
      id: comment.id,
      userId: comment.userId,
      user: comment.user.name || "User",
      userAvatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(comment.user.name || "User")}`,
      text: comment.text,
      canDelete: true,
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
    const currentUser = await getCurrentUser();
    const comments = await prisma.reelComment.findMany({
      where: { reelId },
      include: {
        user: {
          include: { profile: true },
        },
      },
      orderBy: { createdAt: 'desc' }
    });

    return comments.map(c => ({
      id: c.id,
      userId: c.userId,
      user: c.user.name || "User",
      userAvatar: (() => {
        try {
          return JSON.parse(c.user.profile?.photos || "[]")[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.name || "User")}`;
        } catch {
          return `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user.name || "User")}`;
        }
      })(),
      text: c.text,
      canDelete: c.userId === currentUser?.id,
      time: formatRelativeTime(c.createdAt)
    }));
  } catch (error) {
    console.error("Error fetching comments:", error);
    return [];
  }
}

export async function deleteReel(reelId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const reel = await prisma.reel.findUnique({
    where: { id: reelId },
    select: { userId: true },
  });
  if (!reel) return { success: false, error: "Reel not found" };
  if (reel.userId !== user.id) return { success: false, error: "Forbidden" };

  await prisma.reel.delete({ where: { id: reelId } });
  return { success: true };
}

export async function deleteReelComment(commentId: string) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };

  const comment = await prisma.reelComment.findUnique({
    where: { id: commentId },
    select: { userId: true },
  });
  if (!comment) return { success: false, error: "Comment not found" };
  if (comment.userId !== user.id) return { success: false, error: "Forbidden" };

  await prisma.reelComment.delete({ where: { id: commentId } });
  return { success: true };
}



