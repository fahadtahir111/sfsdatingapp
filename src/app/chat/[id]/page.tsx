"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaChevronLeft,
  FaVideo,
  FaPhone,
  FaPaperPlane,
  FaPlay,
  FaMicrophone,
  FaStop,
  FaSmile,
  FaGift,
  FaLock,
} from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";
import { useRealTime } from "@/lib/hooks/useRealTime";
import {
  getMessages,
  sendMessage,
  getConversation,
  getRoseBalance,
  sendRose,
} from "@/app/chat/actions";
import { useParams } from "next/navigation";
import EmojiPicker from "../../components/EmojiPicker";
import { useStreamVideoClient, Call, StreamCall } from "@stream-io/video-react-sdk";
import MeetingRoom from "@/app/components/Calls/MeetingRoom";
import { useToast } from "@/app/providers/ToastProvider";
import { triggerCallSignal } from "@/app/chat/actions";
import Ably from "ably";

const CALL_TIMEOUT_MS = 45000;

interface ConversationData {
  id: string;
  name: string;
  image: string;
  userId: string;
}

// ─── Audio message player ──────────────────────────────────────────────────
const AudioMessagePlayer = ({ url, isMe }: { url: string; isMe: boolean }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    audioRef.current = new Audio(url);
    audioRef.current.onended = () => setIsPlaying(false);
    return () => {
      audioRef.current?.pause();
    };
  }, [url]);

  const togglePlay = () => {
    if (isPlaying) {
      audioRef.current?.pause();
      setIsPlaying(false);
    } else {
      audioRef.current
        ?.play()
        .catch((e: unknown) => console.error("Play failed", e));
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 w-44">
      <button
        type="button"
        aria-label={isPlaying ? "Stop voice message" : "Play voice message"}
        onClick={togglePlay}
        className={`w-9 h-9 flex-shrink-0 rounded-xl flex items-center justify-center transition-all ${
          isMe ? "bg-black/40 text-primary border border-primary/20 shadow-shadow-glow" : "bg-primary text-black"
        }`}
      >
        {isPlaying ? (
          <FaStop className="text-[10px]" />
        ) : (
          <FaPlay className="text-[10px] ml-0.5" />
        )}
      </button>
      <div className="flex-1 h-1 bg-white/10 rounded-full overflow-hidden relative">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${
            isMe ? "bg-primary/60" : "bg-black"
          } ${
            isPlaying
              ? "w-full transition-all duration-[3000ms] ease-linear"
              : "w-0"
          }`}
        />
      </div>
      <span className="sub-heading text-[8px] opacity-60 lowercase">
        Voice
      </span>
    </div>
  );
};

// ─── Main Chat Room ────────────────────────────────────────────────────────
export default function ChatRoomPage() {
  const { id: conversationId } = useParams() as { id: string };
  const { user, loading } = useAuth();
  const isAuthenticated = !!user && !loading;
  const { showToast } = useToast();

  const [inputText, setInputText] = useState("");
  const [showEmojis, setShowEmojis] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [roseBalance, setRoseBalance] = useState(0);
  const [sendingRose, setSendingRose] = useState(false);

  // ── Call state ──────────────────────────────────────────────────────────
  type CallPhase = "idle" | "outgoing" | "incoming" | "connected";
  const [callPhase, setCallPhase] = useState<CallPhase>("idle");
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [streamCall, setStreamCall] = useState<Call | undefined>(undefined);
  const [isRinging, setIsRinging] = useState(false);

  const ringingAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    ringingAudioRef.current = new Audio("https://assets.mixkit.co/active_storage/sfx/2358/2358-preview.mp3");
    ringingAudioRef.current.loop = true;
    return () => {
      ringingAudioRef.current?.pause();
    };
  }, []);

  useEffect(() => {
    if (callPhase === "outgoing") {
      ringingAudioRef.current?.play().catch(() => {});
    } else {
      ringingAudioRef.current?.pause();
      if (ringingAudioRef.current) ringingAudioRef.current.currentTime = 0;
    }
  }, [callPhase]);


  const client = useStreamVideoClient();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const data = await getConversation(conversationId);
      if (data) setConversation(data as ConversationData);
      const rose = await getRoseBalance();
      if (rose.success) setRoseBalance(rose.balance);
    })();
  }, [conversationId, isAuthenticated]);

  const fetchMessages = useCallback(
    () => getMessages(conversationId),
    [conversationId]
  );

  const {
    data: messages = [],
    setData: setMessages,
    refresh,
  } = useRealTime(fetchMessages, 5000, [conversationId, user, loading], isAuthenticated);

  useEffect(() => {
    if (!isAuthenticated || !conversationId) return;
    const ably = new Ably.Realtime({ authUrl: "/api/ably/auth" });
    const channel = ably.channels.get(`conversation:${conversationId}`);

    channel.subscribe("new_message", (message: Ably.Message) => {
      setMessages((prev) => {
        if (!prev) return [message.data];
        if (prev.find(m => m.id === message.data.id)) return prev;
        return [...prev, message.data];
      });
    });

    channel.subscribe("call_event", (event: Ably.Message) => {
      const { userId, type, callType: eventCallType } = event.data;
      if (userId === user?.id) return;

      if (type === "invite") {
        setCallType(eventCallType);
        setCallPhase("incoming");
        triggerCallSignal(conversationId, "ringing", eventCallType);
      } else if (type === "ringing") {
        setIsRinging(true);
      } else if (type === "accepted") {
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
        }
        setCallPhase("connected");
      } else if (type === "reject" || type === "hangup" || type === "timeout") {
        if (callTimeoutRef.current) {
          clearTimeout(callTimeoutRef.current);
          callTimeoutRef.current = null;
        }
        setCallPhase("idle");
        setIsRinging(false);
        setStreamCall(undefined);
        if (type !== "timeout") {
          showToast(`Call ${type === "reject" ? "declined" : "ended"}`, "info");
        } else if (userId !== user?.id) {
          showToast("Missed call", "info");
        }
      }
    });

    return () => {
      try {
        channel.unsubscribe();
        ably.close();
      } catch (e) {
        console.warn("Ably cleanup error:", e);
      }
    };
  }, [conversationId, isAuthenticated, user?.id, setMessages, showToast]);


  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [handledMsgId, setHandledMsgId] = useState<string | null>(null);
  const [otherPresence, setOtherPresence] = useState<string | null>(null);
  const callTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { data: presenceInfo } = useRealTime(
    async () => {
      if (!conversation?.userId) return null;
      const { getUserPresence } = await import("@/app/actions/presence");
      return await getUserPresence(conversation.userId);
    },
    10000,
    [conversation?.userId],
    !!conversation?.userId
  );

  useEffect(() => {
    if (presenceInfo?.presence) {
      setOtherPresence(presenceInfo.presence);
    }
  }, [presenceInfo]);

  useEffect(() => {
    if (!messages || messages.length === 0) return;
    const latest = messages[messages.length - 1];

    if (
      latest.id !== handledMsgId &&
      latest.senderId !== user?.id &&
      (latest.messageType === "video_call" ||
        latest.messageType === "audio_call")
    ) {
      const ageMs = Date.now() - new Date(latest.createdAt).getTime();
      if (ageMs < 20_000 && callPhase === "idle") {
        setCallType(latest.messageType === "video_call" ? "video" : "audio");
        setCallPhase("incoming");
        setHandledMsgId(latest.id);
      }
    }
  }, [messages, user?.id, callPhase, handledMsgId]);

  const handleSend = async () => {
    const text = inputText.trim();
    if (!text) return;
    setInputText("");
    try {
      const newMsg = await sendMessage(conversationId, text);
      setMessages([...(messages ?? []), newMsg]);
    } catch {
      showToast("Failed to send message", "error");
    }
  };

  const startCall = async (type: "video" | "audio") => {
    if (!client) {
      showToast("Video calling is not available.", "error");
      return;
    }
    setCallType(type);
    setCallPhase("outgoing");
    try {
      await triggerCallSignal(conversationId, "invite", type);
      await sendMessage(
        conversationId,
        `Started ${type} call`,
        type === "video" ? "video_call" : "audio_call"
      );

      const call = client.call("default", conversationId);
      await call.join({ create: true });
      
      if (type === "audio") {
        await call.camera.disable();
      } else {
        await call.camera.enable();
      }
      await call.microphone.enable();

      setStreamCall(call);
      setCallPhase("connected");

      // Set timeout for acceptance
      callTimeoutRef.current = setTimeout(() => {
        setCallPhase((currentPhase) => {
          if (currentPhase !== "connected") {
            endCall();
            showToast("No answer from user.", "info");
            triggerCallSignal(conversationId, "timeout", type);
          }
          return currentPhase;
        });
      }, CALL_TIMEOUT_MS);
    } catch (e: unknown) {
      console.error("Failed to start call:", e);
      showToast("Could not start the call.", "error");
      setCallPhase("idle");
    }
  };

  const answerCall = async () => {
    if (!client) return;
    try {
      await triggerCallSignal(conversationId, "accepted", callType);
      const call = client.call("default", conversationId);
      await call.join({ create: true });
      if (callType === "audio") {
        await call.camera.disable();
        try { await call.microphone.enable(); } catch {}
      } else {
        try { await call.camera.enable(); } catch {}
        try { await call.microphone.enable(); } catch {}
      }
      setStreamCall(call);
      setCallPhase("connected");
    } catch (e: unknown) {
      console.error("Failed to answer call:", e);
      showToast("Could not connect to the call.", "error");
      setCallPhase("idle");
    }
  };

  const endCall = async () => {
    try {
      await triggerCallSignal(conversationId, "hangup", callType);
      await streamCall?.leave();
      if (callPhase === "connected") {
        await sendMessage(conversationId, "Call ended", "info");
      }
    } catch {}
    setStreamCall(undefined);
    setCallPhase("idle");
    setHandledMsgId(null);
  };

  const declineCall = async () => {
    try {
      await triggerCallSignal(conversationId, "reject", callType);
    } catch {}
    setCallPhase("idle");
  };

  const handleSendRose = async () => {
    if (sendingRose) return;
    setSendingRose(true);
    try {
      const res = await sendRose(conversationId, 1);
      if (!res.success) {
        showToast(res.error ?? "Failed to send rose", "error");
        return;
      }
      setRoseBalance((prev) => Math.max(0, prev - 1));
      showToast("🌹 Rose sent!", "success");
      refresh();
    } finally {
      setSendingRose(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e: BlobEvent) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const blob = new Blob(audioChunksRef.current, { type: "audio/webm" });
        const form = new FormData();
        form.append("file", blob, "audio.webm");
        try {
          const res = await fetch("/api/upload", { method: "POST", body: form });
          const data = await res.json();
          if (data.success) {
            const msg = await sendMessage(conversationId, data.url, "audio");
            setMessages((prev) => [...(prev ?? []), msg]);
          } else {
            showToast("Audio upload failed", "error");
          }
        } catch {
          showToast("Could not upload audio", "error");
        }
        stream.getTracks().forEach((t) => t.stop());
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      showToast("Microphone access is required to record.", "error");
    }
  };

  const stopRecording = () => {
    if (
      mediaRecorderRef.current &&
      mediaRecorderRef.current.state === "recording"
    ) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#050505] flex flex-col z-[60]">
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-40" />

      {/* ════════════════════ CALL OVERLAYS ════════════════════ */}
      <AnimatePresence>
        {callPhase === "connected" && streamCall && (
          <motion.div
            key="stream-call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-[#050505]"
          >
            <StreamCall call={streamCall}>
              <MeetingRoom onLeaveCall={endCall} conversationName={conversation?.name} conversationImage={conversation?.image} />
            </StreamCall>
          </motion.div>
        )}

        {callPhase === "outgoing" && (
          <motion.div
            key="outgoing-call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden"
          >
            {/* Layered gradient background */}
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-transparent to-black/60" />
            <div className="bg-aether-mesh absolute inset-0 opacity-40" />

            {/* Animated ring stack */}
            <div className="relative flex items-center justify-center mb-10">
              {[160, 200, 240, 280].map((size, i) => (
                <div
                  key={size}
                  className="absolute rounded-full border border-primary/10 animate-ping opacity-20"
                  style={{
                    width: size,
                    height: size,
                    animationDelay: `${i * 0.4}s`,
                    animationDuration: "2.5s",
                  }}
                />
              ))}

              {/* Avatar */}
              <div className="relative w-32 h-32 rounded-[40px] overflow-hidden border-2 border-primary/30 shadow-[0_0_60px_rgba(196,255,0,0.2)] z-10">
                <Image
                  src={conversation?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation?.name || "?")}&background=050505&color=c4ff00`}
                  alt="Contact"
                  fill
                  className="object-cover"
                />
                {/* Live status overlay */}
                <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-black/60 to-transparent" />
              </div>

              {/* Call type badge */}
              <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/20 border border-primary/30 backdrop-blur-xl z-20">
                <FaVideo className="text-primary text-[9px]" />
                <span className="text-[9px] font-black uppercase tracking-widest text-primary">
                  {callType}
                </span>
              </div>
            </div>

            {/* Name + status */}
            <div className="text-center z-10 mb-10">
              <h2 className="text-4xl font-heading text-white tracking-tight mb-3">
                {conversation?.name}
              </h2>
              <div className="flex items-center justify-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(196,255,0,0.8)]" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80">
                  {isRinging ? "ringing…" : "connecting…"}
                </p>
              </div>
            </div>

            {/* Encrypted session label */}
            <div className="flex items-center gap-2 mb-12 px-4 py-2 rounded-full bg-white/5 border border-white/10 z-10">
              <FaLock className="text-white/30 text-[9px]" />
              <span className="text-[9px] font-bold uppercase tracking-widest text-white/30">
                End-to-end encrypted
              </span>
            </div>

            {/* End button */}
            <button
              type="button"
              aria-label="Cancel call"
              onClick={endCall}
              className="w-18 h-18 w-20 h-20 rounded-3xl bg-red-500/90 text-white flex items-center justify-center text-3xl shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:bg-red-500 active:scale-95 transition-all border border-red-400/30 z-10"
            >
              <FaPhone className="rotate-[135deg]" />
            </button>
            <p className="mt-4 text-[9px] text-white/30 uppercase tracking-widest font-bold z-10">Cancel</p>
          </motion.div>
        )}

        {callPhase === "incoming" && (
          <motion.div
            key="incoming-call"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="absolute inset-0 z-[100] flex flex-col items-center justify-center text-white overflow-hidden"
          >
            {/* Layered gradient background */}
            <div className="absolute inset-0 bg-[#050505]" />
            <div className="absolute inset-0 bg-gradient-to-b from-primary/8 via-transparent to-black/70" />
            <div className="bg-aether-mesh absolute inset-0 opacity-40" />

            {/* Pulsing ring stack */}
            <div className="relative flex items-center justify-center mb-10">
              {[160, 210, 260, 310].map((size, i) => (
                <div
                  key={size}
                  className="absolute rounded-full border border-primary/15 animate-ping"
                  style={{
                    width: size,
                    height: size,
                    animationDelay: `${i * 0.35}s`,
                    animationDuration: "2s",
                    opacity: 0.15 + i * 0.05,
                  }}
                />
              ))}

              {/* Avatar */}
              <div className="relative w-36 h-36 rounded-[44px] overflow-hidden border-2 border-primary/40 shadow-[0_0_80px_rgba(196,255,0,0.25)] z-10">
                <Image
                  src={conversation?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation?.name || "?")}&background=050505&color=c4ff00`}
                  alt="Caller"
                  fill
                  className="object-cover"
                />
              </div>

              {/* Call type badge */}
              <div className="absolute -bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-primary text-black z-20 shadow-[0_0_20px_rgba(196,255,0,0.4)]">
                {callType === "video" ? (
                  <FaVideo className="text-[10px]" />
                ) : (
                  <FaPhone className="text-[10px]" />
                )}
                <span className="text-[9px] font-black uppercase tracking-widest">
                  {callType} call
                </span>
              </div>
            </div>

            {/* Name + incoming label */}
            <div className="text-center z-10 mb-12">
              <h2 className="text-4xl font-heading text-white tracking-tight mb-3">
                {conversation?.name}
              </h2>
              <div className="flex items-center justify-center gap-2 mb-2">
                <div className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse shadow-[0_0_6px_rgba(196,255,0,0.8)]" />
                <p className="text-[11px] font-black uppercase tracking-[0.4em] text-primary/80 animate-pulse">
                  Incoming {callType} call
                </p>
              </div>
              <p className="text-[9px] text-white/30 uppercase tracking-widest font-bold">
                End-to-end encrypted
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex items-center gap-10 z-10">
              {/* Decline */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  aria-label="Decline call"
                  onClick={declineCall}
                  className="w-20 h-20 rounded-3xl bg-red-500/90 text-white flex items-center justify-center text-2xl shadow-[0_0_40px_rgba(239,68,68,0.4)] hover:bg-red-600 active:scale-95 transition-all border border-red-400/20"
                >
                  <FaPhone className="rotate-[135deg]" />
                </button>
                <span className="text-[9px] text-white/30 uppercase tracking-widest font-black">Decline</span>
              </div>

              {/* Answer */}
              <div className="flex flex-col items-center gap-3">
                <button
                  type="button"
                  aria-label="Answer call"
                  onClick={answerCall}
                  className="w-20 h-20 rounded-3xl bg-primary text-black flex items-center justify-center text-2xl shadow-[0_0_50px_rgba(196,255,0,0.4)] hover:brightness-110 active:scale-95 transition-all border border-primary/30"
                >
                  {callType === "video" ? <FaVideo /> : <FaPhone />}
                </button>
                <span className="text-[9px] text-primary/70 uppercase tracking-widest font-black">Answer</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ CHAT HEADER ════════════════════ */}
      <div className="flex items-center justify-between px-4 py-4 bg-[#050505]/80 backdrop-blur-2xl border-b border-white/5 shadow-sm flex-shrink-0 z-10">
        <div className="flex items-center gap-4">
          <Link
            href="/chat"
            className="w-10 h-10 flex items-center justify-center text-muted-foreground rounded-xl hover:bg-white/5 transition-colors border border-white/5"
            aria-label="Back to chats"
          >
            <FaChevronLeft className="text-lg" />
          </Link>
          <Link href={conversation?.userId ? `/profile/${conversation.userId}` : "#"} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-[14px] overflow-hidden relative bg-white/5 border border-white/10 flex-shrink-0">
              <Image
                src={
                  conversation?.image ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation?.name || "?")}&background=050505&color=c4ff00`
                }
                alt="Avatar"
                fill
                className="object-cover"
              />
              {/* Presence Indicator */}
              <div 
                className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-[#050505] z-10 ${
                  otherPresence === "online" ? "bg-primary shadow-shadow-glow" :
                  otherPresence === "away" ? "bg-yellow-500" :
                  otherPresence === "dnd" ? "bg-red-500" : "bg-white/20"
                }`}
              />
            </div>
            <div>
              <h1 className="text-sm font-black text-white uppercase tracking-wider">{conversation?.name}</h1>
              <p className={`text-[10px] font-black uppercase tracking-widest ${
                otherPresence === "online" ? "text-primary animate-pulse" : "text-white/30"
              }`}>
                {otherPresence || "offline"}
              </p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label="Start audio call"
            onClick={() => startCall("audio")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-white/5 transition-colors border border-white/5"
          >
            <FaPhone className="text-sm" />
          </button>
          <button
            type="button"
            aria-label="Start video call"
            onClick={() => startCall("video")}
            className="w-10 h-10 rounded-xl flex items-center justify-center text-foreground hover:bg-white/5 transition-colors border border-white/5"
          >
            <FaVideo className="text-sm" />
          </button>
        </div>
      </div>

      {/* ════════════════════ MESSAGES AREA ════════════════════ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-8 flex flex-col gap-6 bg-transparent relative no-scrollbar"
      >
        <div className="flex justify-center mb-4">
          <span className="sub-heading text-[8px] text-muted-foreground/40 lowercase px-4 py-1.5 rounded-full border border-white/5 bg-white/[0.02]">
            encrypted quantum channel active
          </span>
        </div>

        <AnimatePresence initial={false}>
          {(messages ?? []).map((msg) => {
            const isMe = msg.senderId === user?.id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            });

            return (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, x: isMe ? 10 : -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2, delay: 0.05 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-xl relative group transition-all ${
                    isMe
                      ? "bg-primary text-black rounded-tr-[2px] shadow-shadow-glow"
                      : "bg-white/5 text-white rounded-tl-[2px] border border-white/10 backdrop-blur-md"
                  }`}
                >
                  {msg.messageType === "audio" ? (
                    <AudioMessagePlayer url={msg.content} isMe={isMe} />
                  ) : msg.messageType === "video_call" ||
                    msg.messageType === "audio_call" ? (
                    <div className="flex items-center gap-3 text-xs font-bold italic">
                      {msg.messageType === "video_call" ? (
                        <FaVideo className="text-[10px]" />
                      ) : (
                        <FaPhone className="text-[10px]" />
                      )}
                      <span className="lowercase sub-heading text-[10px]">
                        {isMe ? "outgoing call" : "incoming call"}
                      </span>
                    </div>
                  ) : msg.messageType === "rose" ? (
                    <div className="flex items-center gap-3 text-[11px] font-bold">
                      <span className="text-lg">🌹</span>
                      <span className="sub-heading text-[10px] lowercase">{isMe ? "gift sent" : "gift received"}</span>
                    </div>
                  ) : (
                    <p className="text-[13px] leading-relaxed font-medium">
                      {msg.content}
                    </p>
                  )}

                  <div
                    className={`text-[9px] mt-2 flex items-center justify-end gap-1 font-bold ${
                      isMe ? "text-black/40" : "text-muted-foreground/40"
                    }`}
                  >
                    <span className="lowercase">{time}</span>
                    {isMe && (
                      <span className="text-black/60">✓</span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ════════════════════ INPUT AREA ════════════════════ */}
      <div className="px-4 py-4 pb-safe bg-[#050505]/95 backdrop-blur-2xl border-t border-white/5 flex-shrink-0 z-10">
        <AnimatePresence>
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-24 right-4 z-50 shadow-2xl border border-white/10 rounded-2xl overflow-hidden"
            >
              <EmojiPicker
                onSelect={(emoji: string) => {
                  setInputText((prev) => prev + emoji);
                  setShowEmojis(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-3">
          <button
            type="button"
            aria-label="Send rose"
            disabled={roseBalance < 1 || sendingRose}
            onClick={handleSendRose}
            className="w-11 h-11 flex-shrink-0 rounded-xl bg-white/5 text-rose-500 border border-white/10 flex items-center justify-center hover:bg-rose-500/10 disabled:opacity-20 transition-all"
          >
            <FaGift className="text-sm" />
          </button>

          <div className="flex-1 relative flex items-center">
            <input
              id="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isRecording ? "Listening…" : "Type something…"}
              disabled={isRecording}
              className={`w-full bg-white/5 text-foreground py-3.5 pl-5 pr-12 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/30 font-medium text-sm transition-all border border-white/10 placeholder:text-stone-700 ${
                isRecording ? "opacity-30 border-red-500/30" : ""
              }`}
            />
            <button
              type="button"
              aria-label="Emoji picker"
              onClick={() => setShowEmojis((v) => !v)}
              className="absolute right-3 w-8 h-8 flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
            >
              <FaSmile className="text-lg" />
            </button>
          </div>

          <button
            type="button"
            aria-label={inputText.trim() ? "Send" : isRecording ? "Stop" : "Record"}
            onClick={inputText.trim() ? handleSend : isRecording ? stopRecording : startRecording}
            className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95 border ${
              inputText.trim()
                ? "bg-primary text-black border-primary shadow-shadow-glow"
                : isRecording
                ? "bg-red-500 text-white border-red-500 animate-pulse shadow-shadow-glow"
                : "bg-white/5 text-muted-foreground border-white/10 hover:bg-white/10"
            }`}
          >
            {inputText.trim() ? (
              <FaPaperPlane className="text-sm" />
            ) : isRecording ? (
              <FaStop className="text-sm" />
            ) : (
              <FaMicrophone className="text-sm" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
