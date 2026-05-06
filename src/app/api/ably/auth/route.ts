import { NextResponse } from "next/server";
import Ably from "ably";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  const user = await getCurrentUser();
  
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const apiKey = process.env.ABLY_API_KEY;
  if (!apiKey || apiKey === "YOUR_ABLY_API_KEY" || !apiKey.includes(":")) {
    return NextResponse.json({ error: "Ably is not properly configured. API Key must follow accountID.appID:key format." }, { status: 503 });
  }

  const client = new Ably.Rest(apiKey);
  
  try {
    const tokenRequestData = await client.auth.createTokenRequest({ 
      clientId: user.id 
    });
    return NextResponse.json(tokenRequestData);
  } catch (error) {
    console.error("Ably Token Request Error:", error);
    return NextResponse.json({ error: "Failed to create token request" }, { status: 500 });
  }
}
