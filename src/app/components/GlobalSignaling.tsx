"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getConversations } from "@/app/chat/actions";
import { getPendingRequestsCount } from "@/app/friends/actions";
import { AnimatePresence, motion } from "framer-motion";
import { FaVideo, FaTimes, FaComment } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

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
  lastMessageAt: Date | string;
  time: string;
  unread: number;
  userId?: string;
}

export default function GlobalSignaling() {
  const { status } = useSession();
  const [activeCall, setActiveCall] = useState<ConversationSummary | null>(null);
  const [newMatch, setNewMatch] = useState<ConversationSummary | null>(null);
  const [newRequest, setNewRequest] = useState<boolean>(false);

  // Poll for conversation updates globally every 5 seconds
  const { data: conversations } = useRealTime(
    getConversations,
    5000,
    [status],
    status === "authenticated"
  );

  // Poll for friend requests count
  const { data: requestCount } = useRealTime(
    getPendingRequestsCount,
    8000,
    [status],
    status === "authenticated"
  );

  const [prevCount, setPrevCount] = useState(0);

  useEffect(() => {
    if (requestCount !== null && requestCount > prevCount) {
      setNewRequest(true);
      setTimeout(() => setNewRequest(false), 8000);
    }
    setPrevCount(requestCount || 0);
  }, [requestCount, prevCount]);

  const [lastChecked, setLastChecked] = useState<Date>(new Date());
  const [sessionStartTime] = useState<number>(Date.now());

  useEffect(() => {
    if (!conversations) return;

    // Filter for events that happened AFTER our last check
    // and ideally after the session started to avoid stale notifications
    const newEvents = conversations.filter(c => {
      const eventTime = new Date(c.lastMessageAt).getTime();
      return eventTime > lastChecked.getTime() && eventTime > sessionStartTime;
    });

    if (newEvents.length === 0) return;

    // 1. Check for incoming calls in new events
    const incomingCallMsg = newEvents.find(c => 
      c.lastMessage === "Incoming Video Call..." || c.lastMessage === "Incoming Audio Call..."
    );

    if (incomingCallMsg && !activeCall) {
      setActiveCall(incomingCallMsg);
      setTimeout(() => setActiveCall(null), 30000);
    }

    // 2. Check for brand new matches (no messages yet)
    const freshMatch = newEvents.find(c => c.lastMessage === "No messages yet");
    if (freshMatch && !newMatch) {
      setNewMatch(freshMatch);
      setTimeout(() => setNewMatch(null), 10000);
    }

    // Update the watermark
    setLastChecked(new Date());

  }, [conversations, activeCall, newMatch, lastChecked, sessionStartTime]);

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] pointer-events-none p-4">
      <AnimatePresence>
        {/* Incoming Call Notification */}
        {activeCall && (
          <motion.div 
            initial={{ y: -100, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -100, opacity: 0 }}
            className="max-w-md mx-auto bg-black text-white rounded-3xl p-4 shadow-2xl flex items-center gap-4 border border-primary/30 pointer-events-auto"
          >
            <div className="w-12 h-12 rounded-full overflow-hidden relative border-2 border-primary">
              <Image 
                src={activeCall.image || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"} 
                alt="Caller" 
                fill 
                className="object-cover" 
              />
            </div>
            <div className="flex-1">
              <h3 className="font-bold text-sm">{activeCall.name}</h3>
              <p className="text-xs text-primary font-black animate-pulse uppercase tracking-widest">Incoming Call</p>
            </div>
            <div className="flex gap-3">
              <button 
                onClick={() => setActiveCall(null)}
                className="w-10 h-10 rounded-full bg-red-500 flex items-center justify-center"
              >
                <FaTimes />
              </button>
              <Link 
                href={`/chat/${activeCall.id}`}
                onClick={() => setActiveCall(null)}
                className="w-10 h-10 rounded-full bg-green-500 flex items-center justify-center"
              >
                <FaVideo />
              </Link>
            </div>
          </motion.div>
        )}

        {/* New Match Notification */}
        {newMatch && (
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            className="mt-4 max-w-sm mx-auto bg-white border border-border p-4 rounded-3xl shadow-xl flex items-center gap-4 pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center text-primary text-xl">
              <FaComment />
            </div>
            <div className="flex-1">
              <h3 className="font-black text-xs text-foreground uppercase tracking-wider">It&apos;s a Match!</h3>
              <p className="text-sm font-medium text-muted-foreground">{newMatch.name} is waiting...</p>
            </div>
            <Link 
              href={`/chat/${newMatch.id}`}
              onClick={() => setNewMatch(null)}
              className="px-4 py-2 bg-black text-white rounded-xl text-xs font-black uppercase tracking-widest"
            >
              Chat
            </Link>
          </motion.div>
        )}

        {/* New Friend Request Notification */}
        {newRequest && (
          <motion.div 
            initial={{ x: 300, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 300, opacity: 0 }}
            className="mt-4 max-w-sm ml-auto bg-stone-900 text-white border border-yellow-400/30 p-4 rounded-3xl shadow-xl flex items-center gap-4 pointer-events-auto"
          >
            <div className="w-10 h-10 rounded-full bg-yellow-400 flex items-center justify-center text-yellow-950 text-xl font-bold">
              🤝
            </div>
            <div className="flex-1">
              <h3 className="font-black text-xs text-yellow-400 uppercase tracking-wider">New Connection!</h3>
              <p className="text-sm font-medium opacity-90">Someone wants to be your friend.</p>
            </div>
            <Link 
              href="/profile?tab=friends"
              onClick={() => setNewRequest(false)}
              className="px-4 py-2 bg-yellow-400 text-yellow-950 rounded-xl text-xs font-black uppercase tracking-widest"
            >
              View
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
