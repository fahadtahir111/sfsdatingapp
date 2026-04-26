"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";
// revalidatePath removed

export async function fetchFeedPosts() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return [];

    // 1. Get list of friend IDs
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      }
    });

    const friendIds = friendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    const targetIds = [...friendIds, userId];

    // 2. Fetch Reels
    const reels = await prisma.reel.findMany({
      where: { userId: { in: targetIds } },
      include: {
        user: { include: { profile: true, subscriptions: { where: { expiresAt: { gt: new Date() } }, take: 1 } } },
        likes: { where: { userId } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 15
    });

    // 3. Fetch Posts
    const posts = await prisma.post.findMany({
      where: { userId: { in: targetIds } },
      include: {
        user: { include: { profile: true, subscriptions: { where: { expiresAt: { gt: new Date() } }, take: 1 } } },
        likes: { where: { userId } },
        _count: { select: { likes: true, comments: true } }
      },
      orderBy: { createdAt: "desc" },
      take: 15
    });

    // 4. Merge and Map
    const merged = [
      ...reels.map(r => ({
        id: r.id,
        type: "REEL",
        content: r.caption || "",
        mediaUrl: r.videoUrl,
        mediaType: "VIDEO",
        createdAt: r.createdAt,
        user: {
          id: r.user.id,
          name: r.user.name,
          image: JSON.parse(r.user.profile?.photos || "[]")[0],
          tier: r.user.subscriptions[0]?.tier || "Free"
        },
        likesCount: r._count.likes,
        commentsCount: r._count.comments,
        isLiked: r.likes.length > 0
      })),
      ...posts.map(p => ({
        id: p.id,
        type: "POST",
        content: p.content || "",
        mediaUrl: p.mediaUrl,
        mediaType: p.mediaType,
        createdAt: p.createdAt,
        user: {
          id: p.user.id,
          name: p.user.name,
          image: JSON.parse(p.user.profile?.photos || "[]")[0],
          tier: p.user.subscriptions[0]?.tier || "Free"
        },
        likesCount: p._count.likes,
        commentsCount: p._count.comments,
        isLiked: p.likes.length > 0
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return merged.slice(0, 30);
  } catch (error: unknown) {
    console.error("fetchFeedPosts error:", error);
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw new Error("Failed to fetch feed posts");
  }
}

export async function getFeedUser() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return null;

    const dbUser = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!dbUser) return null;

    let image = null;
    try {
      const photos = JSON.parse(dbUser.profile?.photos || "[]");
      image = photos[0];
    } catch {}

    return {
      id: dbUser.id,
      name: dbUser.name,
      image: image || `https://ui-avatars.com/api/?name=${dbUser.name}`
    };
  } catch {
    return null;
  }
}

