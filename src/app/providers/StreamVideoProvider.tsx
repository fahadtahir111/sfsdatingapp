"use client";

import { useEffect, useState, useRef } from "react";
import { StreamVideoClient, StreamVideo, User } from "@stream-io/video-react-sdk";

const apiKey = process.env.NEXT_PUBLIC_STREAM_API_KEY;

export default function StreamVideoProvider({
  children,
  user,
}: {
  children: React.ReactNode;
  user: { id: string; name?: string | null; image?: string | null };
}) {
  const [videoClient, setVideoClient] = useState<StreamVideoClient | null>(null);
  const [ready, setReady] = useState(false);
  const clientRef = useRef<StreamVideoClient | null>(null);

  useEffect(() => {
    // If Stream is not configured, skip — children still render normally
    if (!apiKey || !user?.id) {
      if (!apiKey) console.error("[StreamVideoProvider] Missing NEXT_PUBLIC_STREAM_API_KEY. Did you restart the dev server?");
      if (!user?.id) console.error("[StreamVideoProvider] Missing user ID.");
      setReady(true);
      return;
    }

    let mounted = true;

    const init = async () => {
      try {
        const res = await fetch("/api/stream/token");
        if (!res.ok) throw new Error(`Stream token fetch failed: ${res.status}`);
        const { token } = await res.json();
        if (!token) throw new Error("Empty Stream token");

        const streamUser: User = {
          id: user.id,
          name: user.name ?? user.id,
          image: user.image ?? undefined,
        };

        const client = new StreamVideoClient({ apiKey, user: streamUser, token });
        clientRef.current = client;

        if (mounted) {
          setVideoClient(client);
        }
      } catch (err) {
        // Non-fatal — app still works without video
        console.warn("[StreamVideoProvider] Could not initialise:", err);
      } finally {
        if (mounted) setReady(true);
      }
    };

    init();

    return () => {
      mounted = false;
      if (clientRef.current) {
        clientRef.current.disconnectUser().catch(() => {});
        clientRef.current = null;
      }
      setVideoClient(null);
      setReady(false);
    };
  }, [user.id, user.name, user.image]); // re-init if user identity changes

  // Always render children. Wrap in StreamVideo only when the client is ready.
  if (!ready) {
    // Children still mount — they just won't have Stream context yet.
    // This prevents the app from flickering while Stream initialises.
    return <>{children}</>;
  }

  if (!videoClient) {
    // Stream unavailable (no key or token error) — fail open gracefully.
    return <>{children}</>;
  }

  return <StreamVideo client={videoClient}>{children}</StreamVideo>;
}
