"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export async function fetchDiscoverFeed(filters?: {
  minAge?: number;
  maxAge?: number;
  networkingGoals?: string[];
}) {
  try {
    const session = await getServerSession(authOptions);
    const currentUserId = (session?.user as { id: string } | undefined)?.id;

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
    const myInterestedIn = currentUser.profile?.interestedIn;
    const myGender = currentUser.profile?.gender;
    
    const potentialMatches = await prisma.profile.findMany({
      where: {
        userId: { notIn: excludedIds },
        gender: myInterestedIn || undefined,
        interestedIn: myGender || undefined,
        incognitoMode: false,
        // Advanced Filters
        age: {
          gte: filters?.minAge || undefined,
          lte: filters?.maxAge || undefined
        },
        ...(filters?.networkingGoals && filters.networkingGoals.length > 0 ? {
          networkingGoals: {
            contains: filters.networkingGoals[0] // Simple check for MVP
          }
        } : {})
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
    const session = await getServerSession(authOptions);
    const fromUserId = (session?.user as { id: string } | undefined)?.id;

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
        // We have a match!
        const match = await prisma.match.create({
          data: {
            user1Id: fromUserId,
            user2Id: toUserId,
          }
        });

        // Create a new Conversation immediately upon matching
        const conversation = await prisma.conversation.create({
          data: {
            userLinks: {
              create: [
                { userId: fromUserId },
                { userId: toUserId }
              ]
            }
          }
        });

        return { matched: true, matchId: match.id, conversationId: conversation.id };
      }
    }

    return { matched: false };
  } catch (error) {
    console.error("Error submitting swipe:", error);
    throw new Error("Failed to process swipe");
  }
}

