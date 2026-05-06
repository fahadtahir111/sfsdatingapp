"use client";

import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getConversations } from "@/app/chat/actions";
import { getPendingRequestsCount } from "@/app/friends/actions";
import { AnimatePresence, motion } from "framer-motion";
import { FaVideo, FaTimes, FaComment, FaPhone } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import Ably from "ably";
import { updateUserPresence } from "@/app/actions/presence";

/**
 * GlobalSignaling component monitors for:
 * 1. New Messages
 * 2. Incoming Call Signals (Message type video_call/audio_call)
 * 3. Recent Matches
 */
interface ConversationSummary {
  id: string;
  name: string;
  image: string;
  lastMessage: string;
  lastMessageType?: string;
  lastMessageAt: Date | string;
  time: string;
  unread: number;
  userId?: string;
}

export default function GlobalSignaling() {
  const { user, loading } = useAuth();
  const isAuthenticated = !!user && !loading;

  const [activeCall, setActiveCall] = useState<ConversationSummary | null>(null);
  const [newMatch, setNewMatch] = useState<ConversationSummary | null>(null);
  const [newRequest, setNewRequest] = useState<boolean>(false);

  // Poll for conversation updates globally every 5 seconds
  useRealTime(
    getConversations,
    5000,
    [user, loading],
    isAuthenticated
  );

  // Poll for friend requests count
  const { data: requestCount } = useRealTime(
    getPendingRequestsCount,
    8000,
    [user, loading],
    isAuthenticated
  );

  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (requestCount !== null && requestCount > prevCount) {
      setNewRequest(true);
      setTimeout(() => setNewRequest(false), 8000);
    }
    setPrevCount(requestCount || 0);
  }, [requestCount, prevCount]);

  // Presence & Heartbeat
  useEffect(() => {
    if (!isAuthenticated) return;

    const setOnline = () => updateUserPresence("online");
    const setOffline = () => updateUserPresence("offline");

    setOnline();

    const interval = setInterval(setOnline, 30000); // Heartbeat every 30s

    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        setOnline();
      } else {
        setOnline(); // Stay online for a bit
      }
    };

    window.addEventListener("visibilitychange", handleVisibilityChange);
    window.addEventListener("beforeunload", setOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener("visibilitychange", handleVisibilityChange);
      window.removeEventListener("beforeunload", setOffline);
      setOffline();
    };
  }, [isAuthenticated]);

  const activeCallRef = useRef(activeCall);
  useEffect(() => {
    activeCallRef.current = activeCall;
  }, [activeCall]);

  // ── Ably Global Listeners ──────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;

    const ably = new Ably.Realtime({ authUrl: "/api/ably/auth" });
    
    // Subscribe to personal user channel for matches and global events
    const userChannel = ably.channels.get(`user:${user.id}`);
    
    userChannel.subscribe("match_created", (event) => {
      setNewMatch({
        id: event.data.conversationId,
        name: event.data.targetName || "New Match",
        image: event.data.targetImage || "",
        lastMessage: "You matched!",
        lastMessageAt: new Date(),
        time: "Just Now",
        unread: 0
      });
      setTimeout(() => setNewMatch(null), 10000);
    });

    const callChannel = ably.channels.get(`user:${user.id}:calls`);
    callChannel.subscribe("incoming_call", async (event) => {
      // Check if already in a call or DND
      if (activeCallRef.current) {
        const { triggerCallSignal } = await import("@/app/chat/actions");
        await triggerCallSignal(event.data.id, "reject", "video");
        return;
      }

      const { getUserPresence } = await import("@/app/actions/presence");
      const presenceData = await getUserPresence(user.id);
      
      if (presenceData?.presence === "dnd") {
        console.log("Suppressed incoming call due to DND");
        return;
      }
      
      setActiveCall(event.data);
    });

    callChannel.subscribe("call_event", (event) => {
      if (event.data.type === "hangup" || event.data.type === "timeout" || event.data.type === "reject") {
        setActiveCall(null);
      }
    });

    return () => {
      try {
        ably.close();
      } catch (e) {
        console.warn("Ably signaling cleanup error:", e);
      }
    };
  }, [isAuthenticated, user?.id]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none p-3">
      <AnimatePresence>

        {/* ── Incoming Call Notification ── */}
        {activeCall && (
          <motion.div
            key="incoming-call-toast"
            initial={{ y: -100, opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: -100, opacity: 0, scale: 0.9 }}
            transition={{ type: "spring", stiffness: 400, damping: 32 }}
            className="max-w-sm mx-auto pointer-events-auto"
          >
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)] backdrop-blur-3xl">
              {/* Animated glow line at top */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/60 to-transparent" />

              {/* Background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-transparent pointer-events-none" />

              <div className="relative flex items-center gap-4 p-4">
                {/* Avatar with pulse */}
                <div className="relative flex-shrink-0">
                  <div className="w-14 h-14 rounded-2xl overflow-hidden relative border border-white/10">
                    <Image
                      src={activeCall.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(activeCall.name || "?")}&background=050505&color=c4ff00`}
                      alt="Caller"
                      fill
                      className="object-cover"
                    />
                  </div>
                  {/* Ringing indicator */}
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-lg bg-primary flex items-center justify-center shadow-[0_0_10px_rgba(196,255,0,0.5)] border-2 border-[#0a0a0a]">
                    <FaVideo className="text-black text-[7px]" />
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/70 mb-0.5">
                    Incoming call
                  </p>
                  <h3 className="font-heading font-black text-white text-base tracking-tight truncate">
                    {activeCall.name}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div className="w-1 h-1 rounded-full bg-primary animate-pulse" />
                    <p className="text-[9px] font-bold text-white/40 uppercase tracking-widest">
                      Video call · secure channel
                    </p>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-2 flex-shrink-0">
                  {/* Decline */}
                  <button
                    onClick={() => setActiveCall(null)}
                    aria-label="Decline call"
                    className="w-11 h-11 rounded-2xl bg-red-500/15 border border-red-500/20 text-red-400 flex items-center justify-center transition-all active:scale-95 hover:bg-red-500/25"
                  >
                    <FaPhone className="rotate-[135deg] text-sm" />
                  </button>
                  {/* Answer */}
                  <Link
                    href={`/chat/${activeCall.id}`}
                    onClick={() => setActiveCall(null)}
                    aria-label="Answer call"
                    className="w-11 h-11 rounded-2xl bg-primary text-black flex items-center justify-center transition-all active:scale-95 hover:brightness-110 shadow-[0_0_20px_rgba(196,255,0,0.3)]"
                  >
                    <FaVideo className="text-sm" />
                  </Link>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── New Match Notification ── */}
        {newMatch && (
          <motion.div
            key="new-match-toast"
            initial={{ scale: 0.8, opacity: 0, y: -20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.8, opacity: 0, y: -20 }}
            transition={{ type: "spring", stiffness: 400, damping: 30 }}
            className="mt-3 max-w-sm mx-auto pointer-events-auto"
          >
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/50 to-transparent" />

              <div className="relative flex items-center gap-4 p-4">
                {/* Icon */}
                <div className="w-12 h-12 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-primary text-lg flex-shrink-0 shadow-[0_0_20px_rgba(196,255,0,0.1)]">
                  <FaComment />
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.4em] text-primary/70 mb-0.5">
                    It&apos;s a match!
                  </p>
                  <h3 className="font-heading font-black text-white text-sm tracking-tight">
                    {newMatch.name} is waiting…
                  </h3>
                </div>

                <Link
                  href={`/chat/${newMatch.id}`}
                  onClick={() => setNewMatch(null)}
                  className="px-4 py-2 bg-primary text-black rounded-xl text-[9px] font-black uppercase tracking-widest flex-shrink-0 shadow-[0_0_15px_rgba(196,255,0,0.3)] hover:brightness-110 transition-all active:scale-95"
                >
                  Chat
                </Link>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── New Friend Request Notification ── */}
        {newRequest && (
          <motion.div
            key="friend-request-toast"
            initial={{ x: 320, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 320, opacity: 0 }}
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="mt-3 max-w-xs ml-auto pointer-events-auto"
          >
            <div className="relative overflow-hidden rounded-3xl bg-[#0a0a0a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.9)]">
              {/* Top highlight */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

              <div className="relative flex items-center gap-3 p-4">
                <div className="w-11 h-11 rounded-2xl bg-primary/15 border border-primary/20 flex items-center justify-center text-xl flex-shrink-0">
                  🤝
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[9px] font-black uppercase tracking-[0.35em] text-primary/70 mb-0.5">
                    New connection
                  </p>
                  <p className="text-xs font-bold text-white/70 truncate">
                    Someone wants to connect
                  </p>
                </div>

                <Link
                  href="/profile?tab=friends"
                  onClick={() => setNewRequest(false)}
                  className="px-3 py-2 bg-primary text-black rounded-xl text-[9px] font-black uppercase tracking-widest flex-shrink-0 hover:brightness-110 transition-all active:scale-95"
                >
                  View
                </Link>

                <button
                  onClick={() => setNewRequest(false)}
                  className="w-7 h-7 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-white/30 hover:text-white/60 transition-colors flex-shrink-0"
                  aria-label="Dismiss"
                >
                  <FaTimes className="text-[9px]" />
                </button>
              </div>
            </div>
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
