import { NextRequest, NextResponse } from "next/server";
import { PostRepository } from "../repositories/PostRepository";
import { FeedService } from "../services/FeedService";
import { getCurrentUser } from "@/lib/auth";

export class PostController {
  /**
   * Handles GET /api/posts
   */
  public static async getFeed() {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // const cursor = req.nextUrl.searchParams.get("cursor") || undefined;
    
    // Use FeedService for intelligent ranking
    const posts = await FeedService.getPersonalizedFeed(user.id, 20); // Note: Current FeedService doesn't support cursor yet, will fix

    // Map to API DTO
    const result = posts.map(p => this.mapToPostDTO(p, user.id));

    return NextResponse.json({ 
      posts: result, 
      nextCursor: posts.length === 20 ? posts[posts.length - 1].id : null 
    });
  }

  /**
   * Handles POST /api/posts
   */
  public static async createPost(req: NextRequest) {
    const user = await getCurrentUser();
    if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    try {
      const body = await req.json();
      const post = await PostRepository.createPost({
        userId: user.id,
        content: body.content,
        mediaUrl: body.mediaUrl,
        mediaType: body.mediaType
      });

      return NextResponse.json({ success: true, post }, { status: 201 });
    } catch {
      return NextResponse.json({ error: "Failed to create post" }, { status: 500 });
    }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private static mapToPostDTO(p: Record<string, any>, currentUserId: string) {
    let avatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(p.user.name || "User")}&background=050505&color=FFD700`;
    try {
      const photos = JSON.parse(p.user.profile?.photos || "[]");
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
      likedByMe: p.likes?.some((l: { userId: string }) => l.userId === currentUserId) || false,
      user: {
        id: p.user.id,
        name: p.user.name,
        avatar,
        occupation: p.user.profile?.occupation ?? null,
      },
    };
  }
}
