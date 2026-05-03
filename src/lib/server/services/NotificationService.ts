import { prisma } from "@/lib/prisma";

export class NotificationService {
  /**
   * Creates a persistent notification in the database
   */
  public static async createNotification(data: {
    userId: string;
    type: "MATCH" | "MESSAGE" | "CALL" | "FRIEND_REQUEST" | "ROSE";
    title: string;
    message: string;
    payload?: Record<string, unknown>;
  }) {
    // Use dynamic access to bypass temporary Prisma generation issues while dev server is running
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await (prisma as any).notification.create({
      data: {
        userId: data.userId,
        type: data.type,
        title: data.title,
        message: data.message,
        data: data.payload ? JSON.stringify(data.payload) : null
      }
    });
  }

  /**
   * Fetches unread notifications for a user
   */
  public static async getNotifications(userId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" }
    });
  }

  /**
   * Marks a notification as read
   */
  public static async markAsRead(notificationId: string) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (prisma as any).notification.update({
      where: { id: notificationId },
      data: { read: true }
    });
  }
}
