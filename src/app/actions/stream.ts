"use server";

import { StreamClient } from "@stream-io/node-sdk";
import { getCurrentUser } from "@/lib/auth";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY!;
const secret = process.env.STREAM_SECRET_KEY!;

export async function getStreamToken() {
  const user = await getCurrentUser();
  if (!user) throw new Error("Unauthorized");

  const client = new StreamClient(apiKey, secret);
  
  const token = client.generateUserToken({
    user_id: user.id,
    validity_in_seconds: 3600,
  });

  return token;
}
