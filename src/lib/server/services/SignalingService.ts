import Ably from "ably";

const getAblyClient = () => {
  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey || apiKey === "YOUR_ABLY_API_KEY" || apiKey.length < 10) return null;
  return new Ably.Rest(apiKey);
};

export class SignalingService {
  /**
   * Publishes an instant message event to a specific conversation channel
   */
  public static async publishMessage(conversationId: string, message: Record<string, unknown>) {
    const ably = getAblyClient();
    if (!ably) return;
    const channel = ably.channels.get(`conversation:${conversationId}`);
    try {
      await channel.publish("new_message", message);
    } catch (error) {
      console.error("Ably Publish Error:", error);
    }
  }

  /**
   * Publishes a "Typing" status
   */
  public static async publishTypingStatus(conversationId: string, userId: string, isTyping: boolean) {
    const ably = getAblyClient();
    if (!ably) return;
    const channel = ably.channels.get(`conversation:${conversationId}`);
    await channel.publish("typing", { userId, isTyping });
  }

  /**
   * Publishes a WebRTC call event (invite, ringing, accepted, reject, hangup)
   */
  public static async publishCallEvent(conversationId: string, senderId: string, receiverId: string | null, type: "invite" | "ringing" | "accepted" | "reject" | "hangup", callType: "audio" | "video", senderData?: Record<string, unknown>) {
    const ably = getAblyClient();
    if (!ably) return;
    // 1. Publish to conversation channel for those already in chat
    const channel = ably.channels.get(`conversation:${conversationId}`);
    await channel.publish("call_event", { userId: senderId, type, callType });

    // 2. If it's an invite, also publish to receiver's private channel for global alert
    if (type === "invite" && receiverId) {
      // Real-time signal
      const userChannel = ably.channels.get(`user:${receiverId}:calls`);
      await userChannel.publish("incoming_call", { 
        id: conversationId, 
        name: senderData?.name || "Member",
        image: senderData?.image || "",
        lastMessageType: `${callType}_call`
      });

      // Persistent Notification
      const { NotificationService } = await import("./NotificationService");
      await NotificationService.createNotification({
        userId: receiverId,
        type: "CALL",
        title: "Incoming Call",
        message: `${senderData?.name || "Someone"} is calling you...`,
        payload: { conversationId, callType }
      });
    }
  }

  /**
   * Real-time notification for matches
   */
  public static async notifyMatch(userId: string, matchData: Record<string, unknown>) {
    const ably = getAblyClient();
    if (!ably) return;
    const channel = ably.channels.get(`user:${userId}`);
    await channel.publish("match_created", matchData);

    // Persistent Notification
    const { NotificationService } = await import("./NotificationService");
    await NotificationService.createNotification({
      userId,
      type: "MATCH",
      title: "It's a Match!",
      message: "You have a new connection. Start chatting!",
      payload: matchData
    });
  }

}
