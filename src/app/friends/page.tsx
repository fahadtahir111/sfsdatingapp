"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaCheck, FaTimes, FaComment, FaEllipsisV, FaUserPlus } from "react-icons/fa";
import { getFriends, getPendingRequests, acceptFriendRequest, rejectFriendRequest } from "./actions";
import Image from "next/image";
import Link from "next/link";
import FriendsLoading from "./loading";

interface FriendData {
  id: string;
  friendId: string;
  name: string | null;
  image: string;
}

interface RequestData {
  id: string;
  senderUser: {
    id: string;
    name: string | null;
    profile?: {
      photos: string;
    } | null;
  };
}

export default function FriendsHub() {
  const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");
  const [friends, setFriends] = useState<FriendData[]>([]);
  const [requests, setRequests] = useState<RequestData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    const [fetchedFriends, fetchedRequests] = await Promise.all([
      getFriends(),
      getPendingRequests()
    ]);
    setFriends(fetchedFriends);
    setRequests(fetchedRequests);
    setLoading(false);
  };

  const handleAccept = async (id: string) => {
    const result = await acceptFriendRequest(id);
    if (result.success) loadData();
  };

  const handleReject = async (id: string) => {
    const result = await rejectFriendRequest(id);
    if (result.success) loadData();
  };

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-border px-6 py-5">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Network</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Your elite circle</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <FaUserFriends className="text-primary text-lg" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1 bg-secondary rounded-2xl border border-border">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
              activeTab === "friends"
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            My Circle ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all relative ${
              activeTab === "requests"
                ? "bg-primary text-black shadow-lg shadow-primary/20"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Requests
            {requests.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-primary text-black text-[9px] font-black rounded-full flex items-center justify-center border-2 border-background shadow-lg"
              >
                {requests.length > 9 ? "9+" : requests.length}
              </motion.span>
            )}
          </button>
        </div>
      </header>

      <main className="page-shell py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <FriendsLoading />
          ) : activeTab === "friends" ? (
            <motion.div
              key="friends-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-3"
            >
              {friends.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-20 h-20 bg-secondary border border-border rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                    👥
                  </div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Your circle is empty</h3>
                  <p className="text-muted-foreground text-sm font-medium mt-2 max-w-xs mx-auto">
                    Start connecting with Elite members to build your network.
                  </p>
                  <Link
                    href="/discover"
                    className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
                  >
                    <FaUserPlus /> Grow Network
                  </Link>
                </motion.div>
              ) : (
                friends.map((friend, i) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-4 bg-card rounded-3xl border border-border flex items-center gap-4 hover:border-primary/30 hover:bg-card/80 transition-all active:scale-[0.98] shadow-sm"
                  >
                    <div className="relative w-14 h-14 rounded-2xl overflow-hidden bg-secondary flex-shrink-0 border border-border">
                      <Image src={friend.image} alt={friend.name || "Friend"} fill className="object-cover" />
                      <div className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-card" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-black text-foreground truncate">{friend.name}</h4>
                      <p className="text-[10px] text-primary font-bold uppercase tracking-widest mt-0.5">Connected</p>
                    </div>
                    <div className="flex gap-2">
                      <Link
                        href={`/chat/${friend.friendId}`}
                        className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center hover:bg-primary hover:text-black transition-all"
                      >
                        <FaComment className="text-sm" />
                      </Link>
                      <button className="w-10 h-10 rounded-xl bg-secondary border border-border text-muted-foreground flex items-center justify-center hover:text-foreground transition-colors">
                        <FaEllipsisV className="text-sm" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="requests-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {requests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-20 text-center"
                >
                  <div className="w-20 h-20 bg-secondary border border-border rounded-full flex items-center justify-center mx-auto mb-5 text-3xl">
                    📬
                  </div>
                  <h3 className="text-lg font-black text-foreground tracking-tight">Inbox Clear</h3>
                  <p className="text-muted-foreground text-sm font-medium mt-2">No pending invitations at the moment.</p>
                </motion.div>
              ) : (
                requests.map((request, i) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-5 bg-card rounded-3xl border border-border hover:border-primary/20 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden relative bg-secondary flex-shrink-0 border border-border">
                        <Image
                          src={
                            request.senderUser.profile?.photos
                              ? JSON.parse(request.senderUser.profile.photos)[0]
                              : `https://ui-avatars.com/api/?name=${request.senderUser.name}&background=1a1a1a&color=FF1493`
                          }
                          alt={request.senderUser.name || "Member"}
                          fill
                          className="object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black text-foreground text-lg leading-tight truncate">{request.senderUser.name}</h4>
                        <p className="text-sm text-muted-foreground font-medium mt-0.5">wants to connect</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="py-3.5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg shadow-primary/20"
                      >
                        <FaCheck /> Accept
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="py-3.5 bg-secondary border border-border text-muted-foreground rounded-2xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 hover:border-destructive/50 hover:text-destructive-foreground transition-all"
                      >
                        <FaTimes /> Decline
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
