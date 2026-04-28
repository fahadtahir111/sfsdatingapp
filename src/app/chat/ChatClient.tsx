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

  // Filter conversations with no messages for the "New Matches" section
  const newMatches = filteredConversations.filter(c => c.lastMessage === "No messages yet" || c.time === "New Match");
  const recentConvs = filteredConversations.filter(c => c.lastMessage !== "No messages yet" && c.time !== "New Match");

  return (
    <div className="page-shell min-h-screen bg-background pt-6 pb-24 section-stack">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-black text-foreground">Messages</h1>
        <Link
          href="/profile"
          aria-label="Open profile"
          className="w-10 h-10 flex items-center justify-center rounded-full bg-secondary text-foreground hover:bg-secondary/80 transition-colors focus-ring"
        >
          <FaEllipsisH />
        </Link>
      </div>

      {/* Search */}
      <div>
        <div className="relative">
          <FaSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search matches or messages..." 
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-secondary/50 text-foreground py-3 pl-12 pr-4 rounded-2xl focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all font-medium"
          />
        </div>
      </div>

      {/* New Matches / Stories */}
      {newMatches.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-sm font-bold text-foreground uppercase tracking-wider">New Matches</h2>
            <Link href="/discover" className="text-primary text-sm font-bold hover:underline">See all</Link>
          </div>
          <div className="flex overflow-x-auto gap-4 no-scrollbar pb-2">
            {newMatches.map((match, i) => (
              <Link href={`/chat/${match.id}`} key={match.id}>
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: i * 0.1 }}
                  className="flex flex-col items-center gap-2 cursor-pointer"
                >
                  <div className="p-[3px] rounded-full bg-gradient-to-tr from-primary to-accent">
                    <div className="w-16 h-16 rounded-full overflow-hidden relative border-2 border-white shadow-sm">
                      <Image 
                        src={match.image} 
                        alt={match.name} 
                        fill 
                        className="object-cover" 
                        unoptimized={match.image?.startsWith("/")}
                      />
                    </div>
                  </div>
                  <span className="text-xs font-bold text-foreground">{match.name}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Conversations */}
      <div>
        <h2 className="text-sm font-bold text-foreground uppercase tracking-wider mb-4">Conversations</h2>
        {loading && (
          <div className="py-8 text-center text-muted-foreground font-medium">
            Refreshing conversations…
          </div>
        )}
        {recentConvs.length === 0 && !loading && !normalizedQuery && (
          <div className="py-12 text-center text-muted-foreground font-medium">
            No active conversations yet. Start swiping!
          </div>
        )}
        {recentConvs.length === 0 && !loading && normalizedQuery && (
          <div className="py-12 text-center text-muted-foreground font-medium">
            No conversations found for &quot;{query}&quot;.
          </div>
        )}
        <div className="flex flex-col gap-5">
          {recentConvs.map((msg, i) => (
            <Link href={`/chat/${msg.id}`} key={msg.id}>
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + (i * 0.1) }}
                className="flex items-center gap-4 group"
              >
                <div className="w-14 h-14 rounded-full overflow-hidden relative flex-shrink-0 bg-stone-100 border border-stone-100 shadow-sm">
                    <Image 
                      src={msg.image} 
                      alt={msg.name} 
                      fill 
                      className="object-cover" 
                      unoptimized={msg.image?.startsWith("/")}
                    />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-end mb-1">
                    <h3 className="text-base font-bold text-foreground line-clamp-1">{msg.name}</h3>
                    <span className={`text-xs font-semibold ${msg.unread > 0 ? 'text-primary' : 'text-muted-foreground'}`}>
                      {msg.time}
                    </span>
                  </div>
                  <p className={`text-sm truncate ${msg.unread > 0 ? 'text-foreground font-bold' : 'text-muted-foreground font-medium'}`}>
                    {msg.lastMessage}
                  </p>
                </div>
                {msg.unread > 0 && (
                  <div className="w-6 h-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center text-xs font-bold">
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
