"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { revalidatePath } from "next/cache";
import { Message } from "@prisma/client";

/**
 * Fetch all conversations for the current user.
 * Includes the participant profile and the latest message.
 */
export async function getConversations() {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) return [];

    const userConvs = await prisma.userConversation.findMany({
      where: { userId },
      include: {
        conversation: {
          include: {
            userLinks: {
              where: { userId: { not: userId } },
              include: {
                user: {
                  include: { profile: true }
                }
              }
            },
            messages: {
              orderBy: { createdAt: 'desc' },
              take: 1
            }
          }
        }
      },
      orderBy: {
        conversation: { updatedAt: 'desc' }
      }
    });

    // 4. Fetch unread counts for each conversation
    const mapped = await Promise.all(userConvs.map(async (uc) => {
      const conv = uc.conversation;
      const otherUser = conv.userLinks[0]?.user;
      const lastMsg = conv.messages[0];
      
      const unreadCount = await prisma.message.count({
        where: {
          conversationId: conv.id,
          senderId: { not: userId },
          read: false
        }
      });

      let photos = [];
      try { photos = JSON.parse(otherUser?.profile?.photos || "[]"); } catch {}

      return {
        id: conv.id,
        name: otherUser?.name || "Unknown",
        image: photos[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || "U")}&background=random&size=100`,
        lastMessage:
          lastMsg?.messageType === "video_call"
            ? "Incoming Video Call..."
            : lastMsg?.messageType === "audio_call"
              ? "Incoming Audio Call..."
              : lastMsg?.messageType === "rose"
                ? "Sent you a rose"
                : lastMsg?.content || "No messages yet",
        lastMessageType: lastMsg?.messageType || "text",
        lastMessageAt: lastMsg?.createdAt || conv.updatedAt,
        time: lastMsg ? formatRelativeTime(lastMsg.createdAt) : "New Match",
        unread: unreadCount,
        userId: otherUser?.id
      };
    }));

    return mapped;
  } catch (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }
}

/**
 * Fetch messages for a specific conversation.
 */
export async function getMessages(conversationId: string): Promise<Message[]> {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    // SECURITY: Ensure the user is a member of this conversation
    const membership = await prisma.userConversation.findUnique({
      where: { userId_conversationId: { userId, conversationId } }
    });
    if (!membership) throw new Error("Forbidden: You are not a member of this conversation");

    const messages = await prisma.message.findMany({
      where: { conversationId },
      orderBy: { createdAt: 'asc' }
    });

    // Mark these messages as read for the receiver (simplified logic)
    await prisma.message.updateMany({
      where: { 
        conversationId,
        senderId: { not: userId },
        read: false
      },
      data: { read: true }
    });

    return messages;
  } catch (error) {
    console.error("Error fetching messages:", error);
    return [];
  }
}

/**
 * Send a message in a conversation.
 */
export async function sendMessage(conversationId: string, content: string, type: string = "text") {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    // SECURITY: Ensure the user is a member of this conversation
    const membership = await prisma.userConversation.findUnique({
      where: { userId_conversationId: { userId, conversationId } }
    });
    if (!membership) throw new Error("Forbidden: You are not a member of this conversation");

    const msg = await prisma.message.create({
      data: {
        content,
        conversationId,
        senderId: userId,
        messageType: type
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // REAL-TIME SIGNALING: Publish to Ably channel
    const { SignalingService } = await import("@/lib/server/services/SignalingService");
    await SignalingService.publishMessage(conversationId, {
      ...msg,
      senderName: user?.name
    });

    revalidatePath("/chat");
    return msg;
  } catch (error) {
    console.error("Error sending message:", error);
    throw new Error("Failed to send message");
  }
}

export async function getRoseBalance() {
  const user = await getCurrentUser();
  if (!user) return { success: false, balance: 0 };
  const dbUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: { roseBalance: true },
  });
  return { success: true, balance: dbUser?.roseBalance ?? 0 };
}

export async function sendRose(conversationId: string, amount = 1) {
  const user = await getCurrentUser();
  if (!user) return { success: false, error: "Unauthorized" };
  if (amount <= 0) return { success: false, error: "Invalid amount" };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { userLinks: true },
  });
  if (!conversation) return { success: false, error: "Conversation not found" };

  const isMember = conversation.userLinks.some((ul) => ul.userId === user.id);
  if (!isMember) return { success: false, error: "Forbidden" };

  const receiver = conversation.userLinks.find((ul) => ul.userId !== user.id);
  if (!receiver) return { success: false, error: "No recipient found" };

  const sender = await prisma.user.findUnique({
    where: { id: user.id },
    select: { roseBalance: true },
  });
  if (!sender || sender.roseBalance < amount) {
    return { success: false, error: "Insufficient roses" };
  }

  await prisma.$transaction([
    prisma.user.update({
      where: { id: user.id },
      data: { roseBalance: { decrement: amount } },
    }),
    prisma.user.update({
      where: { id: receiver.userId },
      data: { roseBalance: { increment: amount } },
    }),
    prisma.roseTransaction.create({
      data: { userId: user.id, amount: -amount, type: "SEND_ROSE" },
    }),
    prisma.roseTransaction.create({
      data: { userId: receiver.userId, amount, type: "RECEIVE_ROSE" },
    }),
    prisma.message.create({
      data: {
        conversationId,
        senderId: user.id,
        content: `sent ${amount} rose${amount > 1 ? "s" : ""}`,
        messageType: "rose",
      },
    }),
    prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() },
    }),
  ]);

  revalidatePath("/chat");
  return { success: true };
}

/**
 * Fetch a single conversation's details.
 */
export async function getConversation(conversationId: string): Promise<{ id: string; name: string; image: string; userId: string } | null> {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    const conv = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        userLinks: {
          include: {
            user: {
              include: { profile: true }
            }
          }
        }
      }
    });

    if (!conv) return null;

    // SECURITY: Verify membership
    const isMember = conv.userLinks.some(ul => ul.userId === userId);
    if (!isMember) return null;

    const otherUser = conv.userLinks.find(ul => ul.userId !== userId)?.user;
    let photos = [];
    try { photos = JSON.parse(otherUser?.profile?.photos || "[]"); } catch {}

    return {
      id: conv.id,
      name: otherUser?.name || "Unknown",
      image: photos[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(otherUser?.name || "U")}&background=random&size=100`,
      userId: otherUser?.id || ""
    };
  } catch (error) {
    console.error("Error fetching conversation details:", error);
    return null;
  }
}

// Helper to format time
function formatRelativeTime(date: Date) {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const mins = Math.floor(diff / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
}

/**
 * Find or create a private conversation with another user.
 */
export async function getOrCreateConversation(otherUserId: string) {
  try {
    const user = await getCurrentUser();
    const userId = user?.id;
    if (!userId) throw new Error("Unauthorized");

    // 1. Find existing conversation with both users
    const existingConv = await prisma.conversation.findFirst({
      where: {
        AND: [
          { userLinks: { some: { userId } } },
          { userLinks: { some: { userId: otherUserId } } }
        ]
      }
    });

    if (existingConv) return existingConv.id;

    // 2. Create new conversation
    const newConv = await prisma.conversation.create({
      data: {
        userLinks: {
          create: [
            { userId },
            { userId: otherUserId }
          ]
        }
      }
    });

    return newConv.id;
  } catch (error) {
    console.error("Error get/create conversation:", error);
    return null;
  }
}

export async function triggerCallSignal(conversationId: string, type: "invite" | "ringing" | "accepted" | "reject" | "hangup", callType: "audio" | "video") {
  const user = await getCurrentUser();
  if (!user?.id) return { success: false };

  // Fetch receiverId from conversation
  const conv = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { userLinks: true }
  });
  
  const receiverLink = conv?.userLinks.find(link => link.userId !== user.id);
  const receiverId = receiverLink?.userId || null;

  const { SignalingService } = await import("@/lib/server/services/SignalingService");
  await SignalingService.publishCallEvent(
    conversationId, 
    user.id, 
    receiverId, 
    type, 
    callType, 
    { name: user.name, image: `https://ui-avatars.com/api/?name=${encodeURIComponent(user.name || "U")}&background=050505&color=FFD700` }
  );
  
  return { success: true };
}

