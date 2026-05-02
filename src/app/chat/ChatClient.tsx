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
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Messages</h1>
        <Link
          href="/profile"
          aria-label="Open profile"
          className="w-12 h-12 flex items-center justify-center rounded-[1rem] bg-card text-muted-foreground hover:text-primary transition-all border border-border shadow-2xl"
        >
          <FaEllipsisH />
        </Link>
      </div>

      {/* Search */}
      <div className="mb-10">
        <div className="relative group">
          <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-muted-foreground/50 transition-colors group-focus-within:text-primary" />
          <input 
            type="text" 
            placeholder="Search connections or messages..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-card text-white py-4 pl-14 pr-6 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/20 transition-all font-black text-[10px] uppercase tracking-widest border border-white/5 shadow-inner"
          />
        </div>
      </div>

      {/* New Connections / Stories */}
      {newConnections.length > 0 && (
        <div className="mb-12">
          <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em]">New Connections</h2>
            <Link href="/discover" className="text-primary text-[10px] font-black uppercase tracking-widest hover:underline">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-5 no-scrollbar pb-4">
            {newConnections.map((match, i) => (
              <Link href={`/chat/${match.id}`} key={match.id}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-3 cursor-pointer group"
                >
                  <div className="p-[2px] rounded-[1.8rem] bg-gradient-to-tr from-primary to-primary/20 shadow-2xl group-hover:scale-105 transition-transform">
                    <div className="w-16 h-16 rounded-[1.7rem] overflow-hidden relative border-2 border-background">
                      <Image 
                        src={match.image} 
                        alt={match.name} 
                        fill 
                        className="object-cover" 
                        unoptimized={match.image?.startsWith("/")}
                      />
                    </div>
                  </div>
                  <span className="text-[10px] font-black text-white uppercase tracking-widest">{match.name.split(' ')[0]}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div>
        <h2 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.3em] mb-8 px-2">Active Networking</h2>
        {loading && (
          <div className="py-12 text-center text-muted-foreground font-black uppercase tracking-widest text-[10px]">
            Refreshing secure channel…
          </div>
        )}
        {!loading && recentConvs.length === 0 && (
          <div className="py-20 text-center bg-card rounded-[2.5rem] border border-white/5 border-dashed">
            <p className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">No active conversations yet.</p>
            <Link href="/discover" className="mt-4 inline-block text-primary font-black uppercase tracking-widest text-[10px] hover:underline">Start Connecting</Link>
          </div>
        )}
        <div className="flex flex-col gap-6">
          {recentConvs.map((msg, i) => (
            <Link href={`/chat/${msg.id}`} key={msg.id}>
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + (i * 0.05) }}
                className="flex items-center gap-5 group p-2 -m-2 rounded-[2rem] hover:bg-white/5 transition-all"
              >
                <div className="w-16 h-16 rounded-[1.5rem] overflow-hidden relative flex-shrink-0 bg-card border border-white/5 shadow-2xl group-hover:border-primary/30 transition-colors">
                    <Image 
                      src={msg.image} 
                      alt={msg.name} 
                      fill 
                      className="object-cover" 
                      unoptimized={msg.image?.startsWith("/")}
                    />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-1.5">
                    <h3 className="text-[12px] font-black text-white uppercase tracking-tighter line-clamp-1">{msg.name}</h3>
                    <span className={`text-[9px] font-black uppercase tracking-widest ${msg.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </span>
                  </div>
                  <p className={`text-[10px] uppercase tracking-widest truncate ${msg.unread > 0 ? 'text-white font-black' : 'text-muted-foreground font-bold'}`}>
                    {msg.lastMessage}
                  </p>
                </div>
                {msg.unread > 0 && (
                  <div className="w-6 h-6 rounded-[0.5rem] bg-primary text-black flex items-center justify-center text-[9px] font-black shadow-lg shadow-primary/20">
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
