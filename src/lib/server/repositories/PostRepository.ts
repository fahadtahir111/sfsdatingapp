import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export class PostRepository {
  /**
   * Fetches posts with full engagement metadata and optimized profile data
   */
  public static async getFeedPool(where: Prisma.PostWhereInput, limit = 100, cursor?: string) {
    return prisma.post.findMany({
      where,
      take: limit,
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
        likes: { select: { userId: true } },
        _count: { select: { comments: true, likes: true } },
      },
    });
  }

  public static async createPost(data: { userId: string; content?: string; mediaUrl?: string; mediaType?: string }) {
    return prisma.post.create({
      data: {
        userId: data.userId,
        content: data.content || null,
        mediaUrl: data.mediaUrl || null,
        mediaType: data.mediaType || null,
      },
    });
  }

  public static async toggleLike(postId: string, userId: string) {
    const existing = await prisma.postLike.findUnique({
      where: { userId_postId: { userId, postId } }
    });

    if (existing) {
      await prisma.postLike.delete({ where: { id: existing.id } });
      return { liked: false };
    } else {
      await prisma.postLike.create({ data: { userId, postId } });
      return { liked: true };
    }
  }
}
