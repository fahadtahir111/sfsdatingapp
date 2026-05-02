import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

// GET /api/posts/[id]/like — toggle like on a post
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const me = await getCurrentUser();
  if (!me) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id: postId } = await params;

  const existing = await prisma.postLike.findUnique({
    where: { userId_postId: { userId: me.id, postId } },
  });

  if (existing) {
    // Unlike
    await prisma.postLike.delete({ where: { id: existing.id } });
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { decrement: 1 } },
    });
    return NextResponse.json({ liked: false });
  } else {
    // Like
    await prisma.postLike.create({ data: { userId: me.id, postId } });
    await prisma.post.update({
      where: { id: postId },
      data: { likesCount: { increment: 1 } },
    });
    return NextResponse.json({ liked: true });
  }
}
