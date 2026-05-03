import { prisma } from "@/lib/prisma";

export class MessagingService {
  /**
   * Sends a message and triggers signaling
   */
  public static async sendMessage(data: {
    senderId: string;
    conversationId: string;
    content: string;
    mediaUrl?: string;
    type?: string;
  }) {
    const message = await prisma.message.create({
      data: {
        senderId: data.senderId,
        conversationId: data.conversationId,
        content: data.content,
        mediaUrl: data.mediaUrl || null,
        messageType: data.type || "text"
      },
      include: { sender: { select: { name: true } } }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: data.conversationId },
      data: { updatedAt: new Date() }
    });

    // 🚀 SIGNALING: Trigger real-time notification
    // In a production app, we use Ably/Pusher/Socket.io here:
    // await pusher.trigger(`chat_${data.conversationId}`, "new_message", message);
    
    return message;
  }

  /**
   * Marks a conversation as read for a user
   */
  public static async markAsRead(conversationId: string, userId: string) {
    return prisma.message.updateMany({
      where: {
        conversationId,
        senderId: { not: userId },
        read: false
      },
      data: { read: true }
    });
  }

  /**
   * Initializes a WebRTC call signaling
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  public static async initiateCall(senderId: string, receiverId: string, type: "audio" | "video") {
    // Logic for creating a temporary call session in Redis or DB
    return {
      sessionId: `call_${Date.now()}_${senderId}`,
      offer: "SDP_PLACEHOLDER"
    };
  }
}
