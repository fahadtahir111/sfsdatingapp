import { StreamClient } from "@stream-io/node-sdk";
import { getCurrentUser } from "@/lib/auth";
import { NextResponse } from "next/server";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const secret = process.env.STREAM_SECRET_KEY!;

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const client = new StreamClient(apiKey, secret);
  
  const token = client.generateUserToken({
    user_id: user.id,
    validity_in_seconds: 3600,
  });

  return NextResponse.json({ token });
}
