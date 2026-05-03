import { NextResponse } from "next/server";
import Ably from "ably";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey || apiKey === "YOUR_ABLY_API_KEY" || apiKey.length < 10) {
    return NextResponse.json({ error: "Ably is not configured on the server." }, { status: 503 });
  }

  const client = new Ably.Rest(apiKey);
  
  try {
    const tokenRequestData = await client.auth.createTokenRequest({ 
      clientId: user.id 
    });
    return NextResponse.json(tokenRequestData);
  } catch {
    return NextResponse.json({ error: "Failed to create token request" }, { status: 500 });
  }
}
