import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/notifications — get notification-like data for the user
export async function GET() {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  // Aggregate notification-worthy events
  const [
    pendingRequests,
    recentLikes,
    recentMatches,
    unreadMessages,
  ] = await Promise.all([
    // Friend requests
    prisma.friendRequest.findMany({
      where: { receiverId: me.id, status: "PENDING" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        senderUser: {
          select: {
            id: true,
            name: true,
            profile: { select: { photos: true } },
          },
        },
      },
    }),

    // Swipes / likes received
    prisma.swipe.findMany({
      where: { toUserId: me.id, action: "LIKE" },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        fromUser: {
          select: {
            id: true,
            name: true,
            profile: { select: { photos: true } },
          },
        },
      },
    }),

    // New matches
    prisma.match.findMany({
      where: { OR: [{ user1Id: me.id }, { user2Id: me.id }] },
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        user1: { select: { id: true, name: true, profile: { select: { photos: true } } } },
        user2: { select: { id: true, name: true, profile: { select: { photos: true } } } },
      },
    }),

    // Unread messages count
    prisma.message.count({
      where: {
        read: false,
        conversation: {
          userLinks: { some: { userId: me.id } },
        },
        senderId: { not: me.id },
      },
    }),
  ]);

  const getAvatar = (profile: { photos?: string } | null, name: string | null) => {
    try {
      const photos = JSON.parse(profile?.photos || "[]");
      if (photos[0]) return photos[0];
    } catch {}
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "User")}&background=1a1a1a&color=FF1493`;
  };

  const notifications = [
    ...pendingRequests.map((r) => ({
      id: r.id,
      type: "friend_request" as const,
      title: `${r.senderUser.name || "Someone"} wants to connect`,
      subtitle: "Accept to expand your circle",
      avatar: getAvatar(r.senderUser.profile as { photos?: string } | null, r.senderUser.name),
      link: "/friends",
      createdAt: r.createdAt,
    })),
    ...recentLikes.map((s) => ({
      id: s.id,
      type: "like" as const,
      title: `${s.fromUser.name || "Someone"} liked your profile`,
      subtitle: "See who's interested",
      avatar: getAvatar(s.fromUser.profile as { photos?: string } | null, s.fromUser.name),
      link: "/likes",
      createdAt: s.createdAt,
    })),
    ...recentMatches.map((m) => {
      const other = m.user1Id === me.id ? m.user2 : m.user1;
      return {
        id: m.id,
        type: "match" as const,
        title: `You matched with ${other.name || "someone"}!`,
        subtitle: "Start a conversation",
        avatar: getAvatar(other.profile as { photos?: string } | null, other.name),
        link: "/chat",
        createdAt: m.createdAt,
      };
    }),
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return NextResponse.json({
    notifications: notifications.slice(0, 20),
    unreadMessages,
    totalCount: notifications.length,
  });
}
