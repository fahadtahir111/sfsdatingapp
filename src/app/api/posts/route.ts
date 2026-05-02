import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/posts — fetch feed posts
export async function GET(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const cursor = req.nextUrl.searchParams.get("cursor");
  const limit = 20;

  const posts = await prisma.post.findMany({
    take: limit + 1,
    ...(cursor ? { cursor: { id: cursor }, skip: 1 } : {}),
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: {
          id: true,
          name: true,
          profile: { select: { photos: true, occupation: true } },
        },
      },
      likes: { where: { userId: me.id }, select: { id: true } },
      _count: { select: { comments: true, likes: true } },
    },
  });

  const hasMore = posts.length > limit;
  const items = hasMore ? posts.slice(0, limit) : posts;
  const nextCursor = hasMore ? items[items.length - 1].id : null;

  const result = items.map((p) => {
    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name || "User")}&background=1a1a1a&color=FF1493`;
    try {
      const photos = JSON.parse((p.user.profile as { photos?: string })?.photos || "[]");
      if (photos[0]) avatar = photos[0];
    } catch {}

    return {
      id: p.id,
      content: p.content,
      mediaUrl: p.mediaUrl,
      mediaType: p.mediaType,
      createdAt: p.createdAt,
      likesCount: p._count.likes,
      commentsCount: p._count.comments,
      likedByMe: p.likes.length > 0,
      user: {
        id: p.user.id,
        name: p.user.name,
        avatar,
        occupation: (p.user.profile as { occupation?: string | null })?.occupation ?? null,
      },
    };
  });

  return NextResponse.json({ posts: result, nextCursor });
}

// POST /api/posts — create a new post
export async function POST(req: NextRequest) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json();
  const { content, mediaUrl, mediaType } = body;

  if (!content && !mediaUrl) {
    return NextResponse.json({ error: "Post must have content or media" }, { status: 400 });
  }

  const post = await prisma.post.create({
    data: {
      userId: me.id,
      content: content || null,
      mediaUrl: mediaUrl || null,
      mediaType: mediaType || null,
    },
  });

  return NextResponse.json({ success: true, post }, { status: 201 });
}
