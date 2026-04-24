"use server";

import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { revalidatePath } from "next/cache";

/**
 * Send a friend request.
 */
export async function sendFriendRequest(receiverId: string) {
  try {
    const session = await getServerSession(authOptions);
    const senderId = (session?.user as { id: string } | undefined)?.id;
    if (!senderId) return { success: false, error: "Unauthorized" };
    if (senderId === receiverId) return { success: false, error: "Cannot add yourself" };

    // Check if already friends
    const existingFriendship = await prisma.friendship.findFirst({
      where: {
        OR: [
          { user1Id: senderId, user2Id: receiverId },
          { user1Id: receiverId, user2Id: senderId }
        ]
      }
    });
    if (existingFriendship) return { success: false, error: "Already friends" };

    // Check if request already exists
    const existingRequest = await prisma.friendRequest.findUnique({
      where: { senderId_receiverId: { senderId, receiverId } }
    });
    if (existingRequest) return { success: false, error: "Request already sent" };

    await prisma.friendRequest.create({
      data: {
        senderId,
        receiverId,
        status: "PENDING"
      }
    });

    revalidatePath("/profile");
    return { success: true };
  } catch (error) {
    console.error("Error sending friend request:", error);
    return { success: false, error: "Request failed" };
  }
}

/**
 * Accept a friend request.
 */
export async function acceptFriendRequest(requestId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    const request = await prisma.friendRequest.findUnique({
      where: { id: requestId }
    });

    if (!request || request.receiverId !== userId) {
      return { success: false, error: "Invalid request" };
    }

    // Use transaction to delete request and create friendship
    await prisma.$transaction([
      prisma.friendRequest.delete({ where: { id: requestId } }),
      prisma.friendship.create({
        data: {
          user1Id: request.senderId,
          user2Id: request.receiverId
        }
      })
    ]);

    revalidatePath("/feed");
    return { success: true };
  } catch (error) {
    console.error("Error accepting request:", error);
    return { success: false, error: "Failed to accept" };
  }
}

/**
 * Reject a friend request.
 */
export async function rejectFriendRequest(requestId: string) {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) return { success: false, error: "Unauthorized" };

    await prisma.friendRequest.update({
      where: { id: requestId, receiverId: userId },
      data: { status: "REJECTED" }
    });

    return { success: true };
  } catch (error) {
    console.error("Error rejecting request:", error);
    return { success: false, error: "Failed to reject" };
  }
}

/**
 * Get pending friend requests for the current user.
 */
export async function getPendingRequests() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) return [];

    return await prisma.friendRequest.findMany({
      where: { receiverId: userId, status: "PENDING" },
      include: {
        senderUser: {
          include: { profile: true }
        }
      }
    });
  } catch (error) {
    console.error("Error fetching requests:", error);
    return [];
  }
}

/**
 * Get the count of pending friend requests for the current user.
 */
export async function getPendingRequestsCount() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) return 0;

    return await prisma.friendRequest.count({
      where: { receiverId: userId, status: "PENDING" }
    });
  } catch (error) {
    console.error("Error fetching request count:", error);
    return 0;
  }
}

/**
 * Get accepted friends for the current user.
 */
export async function getFriends() {
  try {
    const session = await getServerSession(authOptions);
    const userId = (session?.user as { id: string } | undefined)?.id;
    if (!userId) return [];

    const friendships = await prisma.friendship.findMany({
      where: {
        OR: [
          { user1Id: userId },
          { user2Id: userId }
        ]
      },
      include: {
        user1: { include: { profile: true } },
        user2: { include: { profile: true } }
      }
    });

    return friendships.map(f => {
      const friend = f.user1Id === userId ? f.user2 : f.user1;
      return {
        id: f.id,
        friendId: friend.id,
        name: friend.name,
        image: friend.profile?.photos ? JSON.parse(friend.profile.photos)[0] : `https://ui-avatars.com/api/?name=${friend.name}`
      };
    });
  } catch (error) {
    console.error("Error fetching friends:", error);
    return [];
  }
}

