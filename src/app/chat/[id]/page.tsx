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
  FaSpinner,
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
        .catch((e) => console.error("Play failed", e));
      setIsPlaying(true);
    }
  };

  return (
    <div className="flex items-center gap-3 w-44">
      <button
        type="button"
        aria-label={isPlaying ? "Stop voice message" : "Play voice message"}
        onClick={togglePlay}
        className={`w-8 h-8 flex-shrink-0 rounded-full flex items-center justify-center ${
          isMe ? "bg-black/20 text-white" : "bg-primary text-black"
        }`}
      >
        {isPlaying ? (
          <FaStop className="text-[10px]" />
        ) : (
          <FaPlay className="text-[10px] ml-0.5" />
        )}
      </button>
      <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden relative">
        <div
          className={`absolute left-0 top-0 h-full rounded-full ${
            isMe ? "bg-white/60" : "bg-primary"
          } ${
            isPlaying
              ? "w-full transition-all duration-[3000ms] ease-linear"
              : "w-0"
          }`}
        />
      </div>
      <span className="text-[9px] font-black uppercase opacity-60 tracking-wider">
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
  // "idle"         — no call active
  // "outgoing"     — we started a call, waiting for stream join
  // "incoming"     — we received a call signal, showing accept/decline overlay
  // "connected"    — StreamCall is live
  type CallPhase = "idle" | "outgoing" | "incoming" | "connected";
  const [callPhase, setCallPhase] = useState<CallPhase>("idle");
  const [callType, setCallType] = useState<"video" | "audio">("video");
  const [streamCall, setStreamCall] = useState<Call | null>(null);

  const client = useStreamVideoClient();
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  // ── Load conversation details ───────────────────────────────────────────
  useEffect(() => {
    if (!isAuthenticated) return;
    (async () => {
      const data = await getConversation(conversationId);
      if (data) setConversation(data as ConversationData);
      const rose = await getRoseBalance();
      if (rose.success) setRoseBalance(rose.balance);
    })();
  }, [conversationId, isAuthenticated]);

  // ── Real-time message polling ──────────────────────────────────────────
  const fetchMessages = useCallback(
    () => getMessages(conversationId),
    [conversationId]
  );

  const {
    data: messages = [],
    setData: setMessages,
    refresh,
  } = useRealTime(fetchMessages, 2000, [conversationId, user, loading], isAuthenticated);

  // ── Auto-scroll to latest message ─────────────────────────────────────
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // ── Detect incoming call signals in the message stream ─────────────────
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

  // ── Send text message ──────────────────────────────────────────────────
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

  // ── Start outgoing call ───────────────────────────────────────────────
  const startCall = async (type: "video" | "audio") => {
    if (!client) {
      showToast("Video calling is not available.", "error");
      return;
    }
    setCallType(type);
    setCallPhase("outgoing");
    try {
      await sendMessage(
        conversationId,
        "Calling…",
        type === "video" ? "video_call" : "audio_call"
      );
      const call = client.call("default", conversationId);
      await call.join({ create: true });
      if (type === "audio") {
        await call.camera.disable();
        try { await call.microphone.enable(); } catch {}
      } else {
        try { await call.camera.enable(); } catch {}
        try { await call.microphone.enable(); } catch {}
      }
      setStreamCall(call);
      setCallPhase("connected");
    } catch (e) {
      console.error("Failed to start call:", e);
      showToast("Could not start the call.", "error");
      setCallPhase("idle");
    }
  };

  // ── Answer incoming call ──────────────────────────────────────────────
  const answerCall = async () => {
    if (!client) return;
    try {
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
    } catch (e) {
      console.error("Failed to answer call:", e);
      showToast("Could not connect to the call.", "error");
      setCallPhase("idle");
    }
  };

  // ── End / decline call ────────────────────────────────────────────────
  const endCall = async () => {
    try {
      await streamCall?.leave();
      await sendMessage(conversationId, "Call ended", "info");
    } catch {}
    setStreamCall(null);
    setCallPhase("idle");
    setHandledMsgId(null);
  };

  // ── Rose gift ─────────────────────────────────────────────────────────
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

  // ── Voice recording ──────────────────────────────────────────────────
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (e) => {
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
    <div className="fixed inset-0 bg-[#f5f3f0] flex flex-col z-[60]">
      {/* ════════════════════ CALL OVERLAYS ════════════════════ */}
      <AnimatePresence>
        {/* — Connected call (Stream video/audio) — */}
        {callPhase === "connected" && streamCall && (
          <motion.div
            key="stream-call"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 z-[110] bg-stone-950"
          >
            <button
              type="button"
              aria-label="End call"
              onClick={endCall}
              className="absolute top-12 left-4 z-50 w-10 h-10 rounded-full bg-red-500 text-white flex items-center justify-center shadow-lg"
            >
              <FaChevronLeft />
            </button>
            <StreamCall call={streamCall}>
              <MeetingRoom onLeaveCall={endCall} />
            </StreamCall>
          </motion.div>
        )}

        {/* — Outgoing call (waiting for stream to join) — */}
        {callPhase === "outgoing" && (
          <motion.div
            key="outgoing-call"
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            className="absolute inset-0 z-[100] bg-stone-950 flex flex-col items-center justify-center gap-6 text-white"
          >
            {/* Avatar */}
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-white/10 relative">
                <Image
                  src={conversation?.image ?? "https://ui-avatars.com/api/?name=?"}
                  alt="Contact"
                  fill
                  className="object-cover"
                />
              </div>
              <div className="absolute inset-0 rounded-full animate-ping border-4 border-white/10" />
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black">{conversation?.name}</h2>
              <p className="text-stone-400 mt-1 text-sm font-medium animate-pulse">
                {callType === "video" ? "Video calling…" : "Audio calling…"}
              </p>
            </div>
            <FaSpinner className="text-primary text-2xl animate-spin opacity-60" />
            <button
              type="button"
              aria-label="Cancel call"
              onClick={endCall}
              className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl shadow-2xl shadow-red-500/40"
            >
              <FaPhone className="rotate-[135deg]" />
            </button>
          </motion.div>
        )}

        {/* — Incoming call — */}
        {callPhase === "incoming" && (
          <motion.div
            key="incoming-call"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-[100] bg-stone-950 flex flex-col items-center justify-center gap-6 text-white"
          >
            <div className="relative">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-primary/40 relative shadow-2xl shadow-primary/20">
                <Image
                  src={conversation?.image ?? "https://ui-avatars.com/api/?name=?"}
                  alt="Caller"
                  fill
                  className="object-cover"
                />
              </div>
              {/* Ripple */}
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="absolute inset-0 rounded-full border-2 border-primary/20 animate-ping"
                  style={{ animationDelay: `${i * 0.3}s` }}
                />
              ))}
            </div>
            <div className="text-center">
              <h2 className="text-2xl font-black">{conversation?.name}</h2>
              <p className="text-primary mt-1 text-sm font-black uppercase tracking-widest animate-pulse">
                Incoming {callType === "video" ? "Video" : "Audio"} Call
              </p>
            </div>
            <div className="flex gap-8 mt-4">
              <button
                type="button"
                aria-label="Decline call"
                onClick={endCall}
                className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-red-500/40 active:scale-90 transition-transform"
              >
                <FaPhone className="rotate-[135deg]" />
              </button>
              <button
                type="button"
                aria-label="Answer call"
                onClick={answerCall}
                className="w-16 h-16 rounded-full bg-green-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-green-500/40 active:scale-90 transition-transform"
              >
                {callType === "video" ? <FaVideo /> : <FaPhone />}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ════════════════════ CHAT HEADER ════════════════════ */}
      <div className="flex items-center justify-between px-4 py-3 bg-white border-b border-border shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <Link
            href="/chat"
            className="w-9 h-9 flex items-center justify-center -ml-1 text-foreground rounded-full hover:bg-secondary transition-colors"
            aria-label="Back to chats"
          >
            <FaChevronLeft className="text-lg" />
          </Link>
          <Link href={conversation?.userId ? `/profile/${conversation.userId}` : "#"} className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full overflow-hidden relative bg-secondary flex-shrink-0">
              <Image
                src={
                  conversation?.image ??
                  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"
                }
                alt="Avatar"
                fill
                className="object-cover"
              />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground leading-tight">
                {conversation?.name ?? "Loading…"}
              </h2>
              <p className="text-[10px] text-green-500 font-semibold">● Online</p>
            </div>
          </Link>
        </div>

        <div className="flex items-center gap-3">
          {/* Rose balance badge */}
          <div className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest">
            🌹 {roseBalance}
          </div>
          <button
            type="button"
            aria-label="Start audio call"
            onClick={() => startCall("audio")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
          >
            <FaPhone />
          </button>
          <button
            type="button"
            aria-label="Start video call"
            onClick={() => startCall("video")}
            className="w-9 h-9 rounded-full flex items-center justify-center text-foreground hover:bg-secondary transition-colors"
          >
            <FaVideo />
          </button>
        </div>
      </div>

      {/* ════════════════════ MESSAGES AREA ════════════════════ */}
      <div
        ref={scrollRef}
        className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3"
        style={{ backgroundColor: "#f0ece4" }}
      >
        {/* E2E label */}
        <div className="flex justify-center">
          <span className="bg-black/10 text-stone-600 text-[9px] font-black uppercase tracking-widest px-3 py-1 rounded-full">
            End-to-End Encrypted
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
                initial={{ opacity: 0, y: 8, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.15 }}
                className={`flex ${isMe ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[78%] rounded-2xl px-4 py-3 shadow-sm ${
                    isMe
                      ? "bg-[#DCF8C6] text-stone-900 rounded-br-[4px]"
                      : "bg-white text-foreground rounded-bl-[4px] border border-border"
                  }`}
                >
                  {msg.messageType === "audio" ? (
                    <AudioMessagePlayer url={msg.content} isMe={isMe} />
                  ) : msg.messageType === "video_call" ||
                    msg.messageType === "audio_call" ? (
                    <div className="flex items-center gap-2 text-xs font-bold italic opacity-70">
                      {msg.messageType === "video_call" ? (
                        <FaVideo className="text-[10px]" />
                      ) : (
                        <FaPhone className="text-[10px]" />
                      )}
                      {isMe ? "You initiated a call" : "Incoming call…"}
                    </div>
                  ) : msg.messageType === "rose" ? (
                    <div className="flex items-center gap-2 text-xs font-bold text-rose-600">
                      <span className="text-base">🌹</span>
                      <span>{isMe ? "You sent a rose" : "Sent you a rose"}</span>
                    </div>
                  ) : (
                    <p className="text-sm leading-relaxed font-medium">
                      {msg.content}
                    </p>
                  )}

                  <span
                    className={`text-[10px] mt-1.5 block font-semibold text-right ${
                      isMe ? "text-stone-500" : "text-muted-foreground"
                    }`}
                  >
                    {time}
                    {isMe && (
                      <span className="ml-1 text-blue-400">✓✓</span>
                    )}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* ════════════════════ INPUT AREA ════════════════════ */}
      <div className="px-3 py-2 pb-safe bg-white border-t border-border flex-shrink-0">
        {/* Emoji picker */}
        <AnimatePresence>
          {showEmojis && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className="absolute bottom-20 right-3 z-50"
            >
              <EmojiPicker
                onSelect={(e) => {
                  setInputText((prev) => prev + e);
                  setShowEmojis(false);
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <div className="flex items-center gap-2">
          {/* Rose */}
          <button
            type="button"
            aria-label="Send rose"
            disabled={roseBalance < 1 || sendingRose}
            onClick={handleSendRose}
            className="w-9 h-9 flex-shrink-0 rounded-full bg-rose-50 text-rose-500 flex items-center justify-center hover:bg-rose-100 disabled:opacity-40 transition-colors"
          >
            <FaGift className="text-sm" />
          </button>

          {/* Emoji */}
          <button
            type="button"
            aria-label="Emoji picker"
            onClick={() => setShowEmojis((v) => !v)}
            className="w-9 h-9 flex-shrink-0 rounded-full bg-secondary text-muted-foreground flex items-center justify-center hover:bg-secondary/80 transition-colors"
          >
            <FaSmile className="text-sm" />
          </button>

          {/* Text input */}
          <div className="flex-1 relative">
            <input
              id="chat-input"
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
              placeholder={isRecording ? "Recording…" : "Type a message…"}
              disabled={isRecording}
              className={`w-full bg-secondary/50 text-foreground py-2.5 px-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/40 font-medium text-sm transition-all ${
                isRecording ? "opacity-50 bg-red-50 placeholder:text-red-400" : ""
              }`}
            />
            {isRecording && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping" />
            )}
          </div>

          {/* Send / Voice */}
          <button
            type="button"
            aria-label={
              inputText.trim()
                ? "Send message"
                : isRecording
                ? "Stop recording"
                : "Record voice message"
            }
            onClick={
              inputText.trim()
                ? handleSend
                : isRecording
                ? stopRecording
                : startRecording
            }
            className={`w-11 h-11 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-sm active:scale-90 ${
              inputText.trim()
                ? "bg-green-500 text-white hover:bg-green-600"
                : isRecording
                ? "bg-red-500 text-white animate-pulse"
                : "bg-secondary text-muted-foreground hover:bg-secondary/80"
            }`}
          >
            {inputText.trim() ? (
              <FaPaperPlane className="text-sm -ml-0.5" />
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
