"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function fetchDiscoverFeed(filters?: {
  minAge?: number;
  maxAge?: number;
  networkingGoals?: string[];
}) {
  try {
    const user = await getCurrentUser();
    const currentUserId = user?.id;

    if (!currentUserId) return [];

    const currentUser = await prisma.user.findUnique({
      where: { id: currentUserId },
      include: { profile: true }
    });

    if (!currentUser) {
      return [];
    }

    // 2. Find profiles matching criteria that haven't been swiped on
    // This requires a complex NOT IN query for Prisma.
    // For MVP we fetch Swipes given by current user to exclude them.
    
    const swipesGiven = await prisma.swipe.findMany({
      where: { fromUserId: currentUserId },
      select: { toUserId: true }
    });
    
    const excludedIds = swipesGiven.map((s: { toUserId: string }) => s.toUserId);
    excludedIds.push(currentUserId); // exclude self

    // Target gender matching (Bidirectional)
    // 1. I am interested in them
    // 2. They are interested in me
    const myInterestedIn = currentUser.profile?.interestedIn?.trim();
    const myGender = currentUser.profile?.gender?.trim();

    const useBidirectionalPrefs =
      !!myInterestedIn &&
      !!myGender &&
      myInterestedIn.length > 0 &&
      myGender.length > 0;

    const ageFilter =
      filters?.minAge != null || filters?.maxAge != null
        ? {
            age: {
              ...(filters?.minAge != null ? { gte: filters.minAge } : {}),
              ...(filters?.maxAge != null ? { lte: filters.maxAge } : {}),
            },
          }
        : {};

    const potentialMatches = await prisma.profile.findMany({
      where: {
        userId: { notIn: excludedIds },
        incognitoMode: false,
        ...(useBidirectionalPrefs
          ? {
              gender: myInterestedIn,
              interestedIn: myGender,
            }
          : {}),
        ...ageFilter,
        ...(filters?.networkingGoals && filters.networkingGoals.length > 0
          ? {
              networkingGoals: {
                contains: filters.networkingGoals[0],
              },
            }
          : {}),
      },
      include: {
        user: true
      },
      take: 20,
    });

    // Format the response for the frontend Framer Motion cards
    return potentialMatches.map((profile) => {
      let photos = [];
      try { photos = JSON.parse(profile.photos); } catch {}

      // Calculate pseudo age from birthDate
      let age = 25; // default fallback
      if (profile.birthDate) {
        const diff = Date.now() - new Date(profile.birthDate).getTime();
        age = Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
      }

      return {
        id: profile.userId,
        name: profile.user.name || "Unknown",
        age: age,
        role: profile.occupation || profile.bio || "Member",
        image: photos.length > 0 ? photos[0] : `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.user.name || "U")}&background=random&size=200`,
        trustScore: profile.trustScore,
        networkingGoals: profile.networkingGoals ? JSON.parse(profile.networkingGoals) : [],
        isVerified: profile.verificationStatus === "VERIFIED"
      };
    });

  } catch (error) {
    console.error("Error fetching discover feed:", error);
    return [];
  }
}

export async function submitSwipe(toUserId: string, action: "LIKE" | "PASS") {
  try {
    const user = await getCurrentUser();
    const fromUserId = user?.id;

    if (!fromUserId) {
      throw new Error("Unauthorized: Please log in to swipe.");
    }

    // 1. Check if swipe already exists
    const existingSwipe = await prisma.swipe.findUnique({
      where: {
        fromUserId_toUserId: {
          fromUserId,
          toUserId
        }
      }
    });

    if (existingSwipe) {
      return { matched: false, message: "Already swiped" };
    }

    // 3. Record the swipe
    await prisma.swipe.create({
      data: {
        fromUserId,
        toUserId,
        action
      }
    });

    // 2. Check for a match if the action is LIKE
    if (action === "LIKE") {
      const reciprocalSwipe = await prisma.swipe.findFirst({
        where: {
          fromUserId: toUserId,
          toUserId: fromUserId,
          action: "LIKE"
        }
      });

      if (reciprocalSwipe) {
        const existingMatch = await prisma.match.findFirst({
          where: {
            OR: [
              { user1Id: fromUserId, user2Id: toUserId },
              { user1Id: toUserId, user2Id: fromUserId },
            ],
          },
        });

        let matchId = existingMatch?.id;
        if (!existingMatch) {
          try {
            const created = await prisma.match.create({
              data: {
                user1Id: fromUserId,
                user2Id: toUserId,
              },
            });
            matchId = created.id;
          } catch {
            const again = await prisma.match.findFirst({
              where: {
                OR: [
                  { user1Id: fromUserId, user2Id: toUserId },
                  { user1Id: toUserId, user2Id: fromUserId },
                ],
              },
            });
            matchId = again?.id;
          }
        }

        const existingConv = await prisma.conversation.findFirst({
          where: {
            AND: [
              { userLinks: { some: { userId: fromUserId } } },
              { userLinks: { some: { userId: toUserId } } },
            ],
          },
        });

        let conversationId = existingConv?.id;
        if (!existingConv) {
          try {
            const conv = await prisma.conversation.create({
              data: {
                userLinks: {
                  create: [{ userId: fromUserId }, { userId: toUserId }],
                },
              },
            });
            conversationId = conv.id;
          } catch {
            const convAgain = await prisma.conversation.findFirst({
              where: {
                AND: [
                  { userLinks: { some: { userId: fromUserId } } },
                  { userLinks: { some: { userId: toUserId } } },
                ],
              },
            });
            conversationId = convAgain?.id;
          }
        }

        revalidatePath("/chat");
        return {
          matched: true,
          matchId,
          conversationId,
        };
      }
    }

    return { matched: false };
  } catch (error) {
    console.error("Error submitting swipe:", error);
    throw new Error("Failed to process swipe");
  }
}

