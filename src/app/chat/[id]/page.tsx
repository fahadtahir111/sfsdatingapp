"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaChevronLeft, FaVideo, FaPhone, FaPaperPlane, FaPlay, FaMicrophone, FaStop, FaImage, FaSmile } from "react-icons/fa";
import { useAuth } from "@/app/providers/AuthProvider";

import { useRealTime } from "@/lib/hooks/useRealTime";
import { getMessages, sendMessage, getConversation } from "@/app/chat/actions";
import { useParams } from "next/navigation";
import EmojiPicker from "../../components/EmojiPicker";
import { useCallback, useRef } from "react";

interface ConversationData {
  id: string;
  name: string;
  image: string;
  userId: string;
}

export default function ChatRoomPage() {
  const { id: conversationId } = useParams() as { id: string };
  const { user, loading } = useAuth();
  const isAuthenticated = !!user && !loading;
  const [inputText, setInputText] = useState("");
  const [isRecording, setIsRecording] = useState(false);
  const [callActive, setCallActive] = useState<"video" | "audio" | null>(null);
  const [conversation, setConversation] = useState<ConversationData | null>(null);
  const [showEmojis, setShowEmojis] = useState(false);

  // Fetch conversation details once
  useEffect(() => {
    if (!isAuthenticated) return;
    async function loadConv() {
      const data = await getConversation(conversationId);
      if (data) setConversation(data as ConversationData);
    }
    loadConv();
  }, [conversationId, isAuthenticated]);

  const scrollRef = useRef<HTMLDivElement>(null);

  // Memoize polling action to avoid recreation on every render
  const fetchMessagesAction = useCallback(() => getMessages(conversationId), [conversationId]);

  // Real-time message polling
  const { data: messages = [], setData: setMessages, refresh } = useRealTime(
    fetchMessagesAction,
    2000,
    [conversationId, user, loading],
    isAuthenticated
  );

  // Auto-scroll to bottom
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  // Check for incoming call signals in the message stream
  useEffect(() => {
    if (messages && messages.length > 0) {
      const latestMsg = messages[messages.length - 1];
      const isIncomingCall = latestMsg.senderId !== user?.id && 
                            (latestMsg.messageType === "video_call" || latestMsg.messageType === "audio_call");
      
      // If there's a very recent call request, show the overlay
      const isRecent = new Date().getTime() - new Date(latestMsg.createdAt).getTime() < 10000;
      if (isIncomingCall && isRecent && !callActive) {
        setCallActive(latestMsg.messageType === "video_call" ? "video" : "audio");
      }
    }
  }, [messages, user, callActive]);

  const handleSend = async () => {
    if (!inputText.trim()) return;
    const text = inputText;
    setInputText("");
    
    try {
      const newMsg = await sendMessage(conversationId, text);
      setMessages([...(messages || []), newMsg]);
      refresh(); // Trigger immediate poll refresh
    } catch (e) {
      console.error("Failed to send", e);
    }
  };

  const startCall = async (type: "video" | "audio") => {
    setCallActive(type);
    try {
      await sendMessage(conversationId, `Calling...`, type === "video" ? "video_call" : "audio_call");
    } catch (e) {
      console.error("Failed to start call", e);
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      try {
        await sendMessage(conversationId, "Audio Note (0:04)", "audio");
      } catch (e) {
        console.error("Failed to send audio", e);
      }
    } else {
      setIsRecording(true);
    }
  };

  if (!conversation && !messages) return null;

  return (
    <div className="absolute inset-0 bg-white flex flex-col z-[60]">
      {/* Call Overlay (Signaling Logic) */}
      <AnimatePresence>
        {callActive && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="absolute inset-0 z-50 bg-black text-white flex flex-col"
          >
            <div className="flex-1 flex flex-col items-center justify-center relative">
              {callActive === "video" ? (
                <div className="absolute inset-0 bg-gray-900 flex items-center justify-center">
                  <div className="w-16 h-16 border-4 border-t-primary rounded-full animate-spin"></div>
                  <p className="absolute mt-24 text-white/70 font-semibold tracking-wider animate-pulse">Connecting Video...</p>
                </div>
              ) : (
                <div className="text-center">
                  <div className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <div className="w-20 h-20 bg-primary/40 rounded-full flex items-center justify-center animate-ping"></div>
                  </div>
                  <h2 className="text-3xl font-black text-white tracking-tight">{conversation?.name}</h2>
                  <p className="text-primary mt-2 font-medium">Ringing...</p>
                </div>
              )}
            </div>
            
            <div className="p-8 pb-16 flex justify-center gap-8 bg-gradient-to-t from-black to-transparent">
              <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center text-xl">
                <FaMicrophone />
              </button>
              <button onClick={() => setCallActive(null)} className="w-16 h-16 rounded-full bg-red-500 text-white flex items-center justify-center text-2xl shadow-lg shadow-red-500/50">
                <FaPhone className="rotate-[135deg]" />
              </button>
              <button className="w-16 h-16 rounded-full bg-white/20 backdrop-blur text-white flex items-center justify-center text-xl">
                <FaVideo />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-border bg-white/80 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link href="/chat" className="w-10 h-10 flex items-center justify-center -ml-2 text-foreground">
            <FaChevronLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden relative bg-secondary">
              <Image src={conversation?.image || "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=200"} alt="Avatar" fill className="object-cover" />
            </div>
            <div>
              <h2 className="text-base font-bold text-foreground">{conversation?.name}</h2>
              <p className="text-xs text-green-500 font-semibold animate-pulse">● Online</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-5 text-black">
          <button onClick={() => startCall("audio")} className="hover:text-primary transition-colors"><FaPhone className="text-xl" /></button>
          <button onClick={() => startCall("video")} className="hover:text-primary transition-colors"><FaVideo className="text-xl" /></button>
        </div>
      </div>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto p-4 flex flex-col gap-4 bg-secondary/30"
      >
        <div className="text-center text-[10px] text-muted-foreground font-black uppercase tracking-widest my-4">
          End-to-End Encrypted
        </div>
        
        <AnimatePresence>
          {(messages || []).map((msg) => {
            const isMe = msg.senderId === user?.id;
            const time = new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            return (
              <motion.div 
                initial={{ opacity: 0, y: 10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                key={msg.id} 
                className={`flex ${isMe ? 'justify-end' : 'justify-start'}`}
              >
                <div className={`max-w-[75%] rounded-2xl p-4 shadow-sm ${
                  isMe 
                    ? 'bg-primary text-black rounded-br-sm' 
                    : 'bg-white text-foreground rounded-bl-sm border border-border'
                }`}>
                  {msg.messageType === "audio" ? (
                    <div className="flex items-center gap-3 w-48">
                      <button className={`w-8 h-8 rounded-full flex items-center justify-center ${isMe ? 'bg-black text-primary' : 'bg-primary text-black'}`}>
                        <FaPlay className="text-[10px] ml-0.5" />
                      </button>
                      <div className="flex-1 h-1 bg-black/20 rounded-full overflow-hidden">
                        <div className="w-1/3 h-full bg-black"></div>
                      </div>
                      <span className="text-xs font-bold">0:04</span>
                    </div>
                  ) : msg.messageType === "video_call" || msg.messageType === "audio_call" ? (
                    <div className="flex items-center gap-2 italic text-xs font-black">
                      <FaPhone className={msg.messageType === "video_call" ? "hidden" : ""} />
                      <FaVideo className={msg.messageType === "audio_call" ? "hidden" : ""} />
                      {isMe ? "Sent call request" : "Incoming call..."}
                    </div>
                  ) : (
                    <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                  )}
                  
                  <span className={`text-[10px] mt-2 block font-bold ${isMe ? 'text-black/60' : 'text-muted-foreground'} text-right`}>
                    {time}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-border pb-safe">
        <div className="flex items-center gap-3">
          <button className="w-10 h-10 rounded-full bg-secondary text-foreground flex items-center justify-center flex-shrink-0 hover:bg-secondary/80">
            <FaImage />
          </button>
          <div className="flex-1 relative">
            <input 
              type="text" 
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend()}
              placeholder={isRecording ? "Recording audio..." : "Type a message..."}
              disabled={isRecording}
              className={`w-full bg-secondary/50 text-foreground py-3 px-4 pr-10 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary font-medium transition-all ${isRecording ? 'opacity-50 !bg-red-50 text-red-500' : ''}`}
            />
            {!isRecording && (
              <button 
                onClick={() => setShowEmojis(!showEmojis)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-yellow-500 transition-colors"
              >
                <FaSmile className="text-lg" />
              </button>
            )}
            {isRecording && (
              <div className="absolute right-4 top-1/2 -translate-y-1/2 w-2 h-2 bg-red-500 rounded-full animate-ping"></div>
            )}
            
            {showEmojis && (
              <div className="absolute bottom-full right-0 mb-4 z-50">
                <EmojiPicker onSelect={(e) => { setInputText(prev => prev + e); setShowEmojis(false); }} />
              </div>
            )}
          </div>

          <button 
            onClick={inputText.trim() ? handleSend : toggleRecording}
            className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 transition-all shadow-md ${
              inputText.trim() 
                ? 'bg-black text-white hover:bg-black/80' 
                : isRecording 
                  ? 'bg-red-500 text-white animate-pulse' 
                  : 'bg-primary text-black hover:bg-primary/90'
            }`}
          >
            {inputText.trim() ? (
              <FaPaperPlane className="-ml-1 text-sm" />
            ) : isRecording ? (
              <FaStop />
            ) : (
              <FaMicrophone />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
