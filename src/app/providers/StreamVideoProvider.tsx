"use client";

import { useEffect, useState } from "react";
import {
  StreamVideoClient,
  StreamVideo,
  User,
} from "@stream-io/video-react-sdk";


const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function StreamVideoProvider({ 
  children,
  user
}: { 
  children: React.ReactNode,
  user: { id: string, name?: string | null, image?: string | null }
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [streamReady, setStreamReady] = useState(false);

  useEffect(() => {
    if (!user || !apiKey) {
      // Do not block the app when Stream is not configured.
      setStreamReady(true);
      return;
    }

    let mounted = true;
    let clientRef: StreamVideoClient | null = null;

    const init = async () => {
      try {
        const response = await fetch("/api/stream/token");
        if (!response.ok) throw new Error("Failed to fetch Stream token");
        const { token } = await response.json();
        if (!token) throw new Error("Missing Stream token");
        
        const streamUser: User = {
          id: user.id,
          name: user.name || user.id,
          image: user.image || undefined,
        };

        const client = new StreamVideoClient({
          apiKey,
          user: streamUser,
          token,
        });

        clientRef = client;
        if (mounted) setVideoClient(client);
      } catch (error) {
        console.error("Stream init error:", error);
      } finally {
        if (mounted) setStreamReady(true);
      }
    };

    init();

    return () => {
      mounted = false;
      if (clientRef) {
        clientRef.disconnectUser();
      }
      setVideoClient(null);
    };
  }, [user, user.id]); // Re-init if user identity changes

  // Fail-open: never blank the app if video provider is unavailable.
  if (!apiKey || !streamReady || !videoClient) return <>{children}</>;

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
}
