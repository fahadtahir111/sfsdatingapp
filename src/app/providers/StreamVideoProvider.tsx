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

  useEffect(() => {
    if (!user || !apiKey) return;

    const init = async () => {
      try {
        const response = await fetch("/api/stream/token");
        const { token } = await response.json();
        
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

        setVideoClient(client);
      } catch (error) {
        console.error("Stream init error:", error);
      }
    };

    init();

    return () => {
      if (videoClient) {
        videoClient.disconnectUser();
        setVideoClient(null);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user.id]); // Re-init only if user changes

  if (!videoClient) return null; // Or a minimal loading state

  return (
    <StreamVideo client={videoClient}>
      {children}
    </StreamVideo>
  );
}
