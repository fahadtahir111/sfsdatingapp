"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
// revalidatePath removed

export async function fetchFeedPosts() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
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
  } catch (error) {
    console.error("fetchFeedPosts error:", error);
    return [];
  }
}

export async function getCurrentUser() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) return null;

    let image = null;
    try {
      const photos = JSON.parse(user.profile?.photos || "[]");
      image = photos[0];
    } catch {}

    return {
      id: user.id,
      name: user.name,
      image: image || `https://ui-avatars.com/api/?name=${user.name}`
    };
  } catch {
    return null;
  }
}

