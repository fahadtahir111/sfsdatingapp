"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { FaSearch, FaEllipsisH } from "react-icons/fa";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getConversations } from "./actions";
import { useState } from "react";

interface ConversationData {
  id: string;
  name: string;
  image: string;
  lastMessage: string;
  time: string;
  unread: number;
  presence?: string;
}

export default function ChatClient({ initialConversations }: { initialConversations: ConversationData[] }) {
  const [query, setQuery] = useState("");
  const { data: conversations, loading } = useRealTime(
    getConversations, 
    5000, 
    [], 
    true
  );

  const displayConversations = conversations || initialConversations;
  const normalizedQuery = query.trim().toLowerCase();
  const filteredConversations = normalizedQuery
    ? displayConversations.filter((c) => {
        return (
          c.name.toLowerCase().includes(normalizedQuery) ||
          c.lastMessage.toLowerCase().includes(normalizedQuery)
        );
      })
    : displayConversations;

  // Filter conversations with no messages for the "New Connections" section
  const newConnections = filteredConversations.filter(c => c.lastMessage === "No messages yet" || c.time === "New Match");
  const recentConvs = filteredConversations.filter(c => c.lastMessage !== "No messages yet" && c.time !== "New Match");

  return (
    <div className="page-shell min-h-screen bg-background pt-6 pb-24 section-stack px-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-10">
        <h1 className="text-4xl font-heading text-white tracking-tight">Messages</h1>
        <Link
          href="/settings"
          aria-label="Open settings"
          className="w-12 h-12 flex items-center justify-center rounded-xl bg-white/5 text-muted-foreground hover:text-primary transition-all border border-white/10 shadow-shadow-glow hover:bg-white/10"
        >
          <FaEllipsisH />
        </Link>
      </div>

      {/* Search */}
      <div className="mb-12">
        <div className="relative group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/30 transition-colors group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search connections or messages..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-white/5 text-foreground py-5 pl-14 pr-6 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary/40 transition-all font-bold text-xs border border-white/10 placeholder:text-stone-600"
          />
        </div>
      </div>

      {/* New Connections / Stories */}
      {newConnections.length > 0 && (
        <div className="mb-14">
          <div className="flex justify-between items-center mb-6 px-1">
            <h2 className="sub-heading">New Connections</h2>
            <Link href="/discover" className="sub-heading text-primary lowercase hover:opacity-80">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-6 no-scrollbar pb-4 -mx-2 px-2">
            {newConnections.map((match, i) => (
              <Link href={`/chat/${match.id}`} key={match.id}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className="p-[2px] rounded-[22px] bg-white/5 border border-white/10 group-hover:border-primary/50 group-hover:shadow-shadow-glow transition-all">
                    <div className="w-16 h-16 rounded-[20px] overflow-hidden relative">
                      <Image 
                        src={match.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(match.name || "?")}&background=050505&color=c4ff00`} 
                        alt={match.name} 
                        fill 
                        className="object-cover group-hover:scale-110 transition-transform duration-500" 
                        unoptimized={match.image?.startsWith("/")}
                      />
                      {/* Presence Badge */}
                      <div 
                        className={`absolute bottom-1 right-1 w-2.5 h-2.5 rounded-full border-2 border-[#050505] z-10 ${
                          match.presence === "online" ? "bg-primary shadow-shadow-glow" :
                          match.presence === "away" ? "bg-yellow-500" :
                          match.presence === "dnd" ? "bg-red-500" : "bg-white/20"
                        }`}
                      />
                    </div>
                  </div>
                  <span className="sub-heading text-[10px] text-white lowercase">{match.name.split(' ')[0]}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div>
        <h2 className="sub-heading mb-8 px-1">Active Networking</h2>
        {loading && (
          <div className="py-12 text-center sub-heading text-muted-foreground/50 lowercase">
            Syncing secure channel…
          </div>
        )}
        {!loading && recentConvs.length === 0 && (
          <div className="py-20 text-center bg-white/5 rounded-[32px] border border-white/10 border-dashed">
            <p className="sub-heading text-muted-foreground/60 lowercase">No active networking.</p>
            <Link href="/discover" className="mt-4 inline-block btn-aether py-2 px-6 text-[10px]">Find Connections</Link>
          </div>
        )}
        <div className="flex flex-col gap-8">
          {recentConvs.map((msg, i) => (
            <Link href={`/chat/${msg.id}`} key={msg.id}>
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + (i * 0.05) }}
                className="flex items-center gap-5 group p-1.5 -m-1.5 rounded-2xl hover:bg-white/[0.03] transition-all"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden relative flex-shrink-0 bg-muted border border-white/10 shadow-xl group-hover:border-primary/40 transition-colors">
                    <Image 
                      src={msg.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(msg.name || "?")}&background=050505&color=c4ff00`} 
                      alt={msg.name} 
                      fill 
                      className="object-cover group-hover:scale-105 transition-transform duration-500" 
                      unoptimized={msg.image?.startsWith("/")}
                    />
                    {/* Presence Badge */}
                    <div 
                      className={`absolute bottom-1 right-1 w-3 h-3 rounded-full border-2 border-[#050505] z-10 ${
                        msg.presence === "online" ? "bg-primary shadow-shadow-glow" :
                        msg.presence === "away" ? "bg-yellow-500" :
                        msg.presence === "dnd" ? "bg-red-500" : "bg-white/20"
                      }`}
                    />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1">
                    <h3 className="font-heading text-sm text-white line-clamp-1 group-hover:text-primary transition-colors">{msg.name}</h3>
                    <span className={`sub-heading text-[9px] lowercase ${msg.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </span>
                  </div>
                  <p className={`text-[11px] truncate ${msg.unread > 0 ? 'text-white font-bold' : 'text-muted-foreground font-medium'}`}>
                    {msg.lastMessage}
                  </p>
                </div>
                {msg.unread > 0 && (
                  <div className="w-5 h-5 rounded-lg bg-primary text-black flex items-center justify-center text-[10px] font-black shadow-shadow-glow">
                    {msg.unread}
                  </div>
                )}
              </motion.div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
