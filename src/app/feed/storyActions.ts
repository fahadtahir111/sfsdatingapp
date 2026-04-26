"use server";

import { prisma } from "@/lib/prisma";

import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function getStories() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return [];

    // Fetch friends first to see stories only from friends
    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [{ user1Id: userId }, { user2Id: userId }]
      }
    });

    const friendIds = friendships.map(f => f.user1Id === userId ? f.user2Id : f.user1Id);
    // Also include own stories
    const allRelevantIds = [...friendIds, userId];

    const stories = await prisma.story.findMany({
      where: {
        userId: { in: allRelevantIds },
        expiresAt: { gt: new Date() }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile: {
              select: {
                photos: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" }
    });

    // Group stories by user for the tray
    const groupedStories: Record<string, { userId: string; userName: string; userImage: string; stories: Array<{ id: string; mediaUrl: string; mediaType: string; createdAt: string }> }> = {};
    stories.forEach(story => {
      if (!groupedStories[story.userId]) {
        let photos: string[] = [];
        try { photos = JSON.parse(story.user.profile?.photos || "[]"); } catch { }
        
        groupedStories[story.userId] = {
          userId: story.userId,
          userName: story.user.name || "Unknown",
          userImage: photos[0] || `https://ui-avatars.com/api/?name=${story.user.name}`,
          stories: []
        };
      }
      groupedStories[story.userId].stories.push({
        id: story.id,
        mediaUrl: story.mediaUrl,
        mediaType: story.mediaType,
        createdAt: story.createdAt.toISOString(),
      });
    });

    return Object.values(groupedStories);
  } catch (error) {
    console.error("Error fetching stories:", error);
    return [];
  }
}

export async function createStory(mediaUrl: string, mediaType: "IMAGE" | "VIDEO") {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours from now

    const story = await prisma.story.create({
      data: {
        userId,
        mediaUrl,
        mediaType: mediaType.toLowerCase(),
        expiresAt,
      }
    });

    revalidatePath("/feed");
    return { success: true, story };
  } catch (error) {
    console.error("Error creating story:", error);
    return { success: false, error: error instanceof Error ? error.message : String(error) };
  }
}


