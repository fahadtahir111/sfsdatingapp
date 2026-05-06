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
  const [callDuration, setCallDuration] = useState(0);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
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

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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
        setCallPhase("connected");
      } else if (type === "reject" || type === "hangup") {
        setCallPhase("idle");
        setIsRinging(false);
        setStreamCall(undefined);
        showToast(`Call ${type === "reject" ? "declined" : "ended"}`, "info");
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
    if (callPhase === "connected") {
      timerRef.current = setInterval(() => {
        setCallDuration((prev) => prev + 1);
      }, 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
      setCallDuration(0);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [callPhase]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const [handledMsgId, setHandledMsgId] = useState<string | null>(null);

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
            className="absolute inset-0 z-[110] bg-black"
          >
            <div className="absolute top-12 left-4 z-50 flex items-center gap-4">
              <button
                type="button"
                aria-label="End call"
                onClick={endCall}
                className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-lg backdrop-blur-xl"
              >
                <FaChevronLeft />
              </button>
              <div className="px-4 py-2 rounded-xl bg-black/40 backdrop-blur-md border border-white/10 text-[10px] font-bold tracking-widest text-primary uppercase shadow-shadow-glow">
                {formatDuration(callDuration)}
              </div>
            </div>
            <StreamCall call={streamCall}>
              <MeetingRoom onLeaveCall={endCall} />
            </StreamCall>
          </motion.div>
        )}

        {callPhase === "outgoing" && (
          <motion.div
            key="outgoing-call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 text-white"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden border-2 border-primary/20 relative shadow-shadow-glow">
                <Image
                  src={conversation?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation?.name || "?")}&background=050505&color=c4ff00`}
                  alt="Contact"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-[40px] animate-ping border border-primary/40 opacity-20" />
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-heading text-white tracking-tight">{conversation?.name}</h2>
              <p className="sub-heading text-primary mt-2 lowercase animate-pulse">
                {isRinging ? "ringing…" : "connecting secure line…"}
              </p>
            </div>
            <button
              type="button"
              aria-label="Cancel call"
              onClick={endCall}
              className="w-16 h-16 rounded-2xl bg-white/5 border border-red-500/30 text-red-500 flex items-center justify-center text-2xl hover:bg-red-500/10 transition-all shadow-lg"
            >
              <FaPhone className="rotate-[135deg]" />
            </button>
          </motion.div>
        )}

        {callPhase === "incoming" && (
          <motion.div
            key="incoming-call"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[100] bg-black/90 backdrop-blur-2xl flex flex-col items-center justify-center gap-8 text-white"
          >
            <div className="relative">
              <div className="w-32 h-32 rounded-[40px] overflow-hidden border-2 border-primary/40 relative shadow-shadow-glow">
                <Image
                  src={conversation?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(conversation?.name || "?")}&background=050505&color=c4ff00`}
                  alt="Caller"
                  fill
                  className="object-cover"
                />
              </div>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-[40px] border border-primary/20 animate-ping opacity-20"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-3xl font-heading text-white tracking-tight">{conversation?.name}</h2>
              <p className="sub-heading text-primary mt-2 lowercase animate-pulse">
                incoming {callType} call
              </p>
            </div>
            <div className="flex gap-8 mt-4">
              <button
                type="button"
                aria-label="Decline call"
                onClick={declineCall}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-red-500/30 text-red-500 flex items-center justify-center text-2xl shadow-lg active:scale-95 transition-all"
              >
                <FaPhone className="rotate-[135deg]" />
              </button>
              <button
                type="button"
                aria-label="Answer call"
                onClick={answerCall}
                className="w-16 h-16 rounded-2xl bg-white/5 border border-primary/30 text-primary flex items-center justify-center text-2xl shadow-shadow-glow active:scale-95 transition-all"
              >
                {callType === "video" ? <FaVideo /> : <FaPhone />}
              </button>
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
            </div>
            <div>
              <h2 className="text-sm font-heading text-white leading-tight">
                {conversation?.name ?? "Loading…"}
              </h2>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="w-1.5 h-1.5 rounded-full bg-primary shadow-shadow-glow" />
                <span className="sub-heading text-[8px] lowercase opacity-60">online</span>
              </div>
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
