import { NextRequest } from "next/server";
import { PostController } from "@/lib/server/controllers/PostController";

export const dynamic = "force-dynamic";

export async function GET() {
  return PostController.getFeed();
}

export async function POST(req: NextRequest) {
  return PostController.createPost(req);
}
