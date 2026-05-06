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
    <div className="min-h-screen bg-background pb-24 relative overflow-hidden">
      {/* Aether Mesh background */}
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-20" />

      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-background/80 backdrop-blur-3xl border-b border-white/5 px-6 py-6">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-4xl font-heading text-white tracking-tight">Network</h1>
            <p className="sub-heading text-[10px] lowercase text-primary/60 mt-1">your elite circle</p>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center shadow-2xl relative group">
            <div className="absolute inset-0 bg-primary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity" />
            <FaUserFriends className="text-primary text-xl relative z-10 shadow-shadow-glow" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-white/5 backdrop-blur-md rounded-[20px] border border-white/5 gap-1.5">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3.5 rounded-[14px] sub-heading text-[10px] lowercase transition-all ${
              activeTab === "friends"
                ? "bg-primary text-black shadow-shadow-glow"
                : "text-white/40 hover:text-white"
            }`}
          >
            my circle ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3.5 rounded-[14px] sub-heading text-[10px] lowercase transition-all relative ${
              activeTab === "requests"
                ? "bg-primary text-black shadow-shadow-glow"
                : "text-white/40 hover:text-white"
            }`}
          >
            requests
            {requests.length > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-black text-[9px] font-heading rounded-full flex items-center justify-center border-2 border-background shadow-shadow-glow"
              >
                {requests.length > 9 ? "9+" : requests.length}
              </motion.span>
            )}
          </button>
        </div>
      </header>

      <main className="page-shell py-8 relative z-10">
        <AnimatePresence mode="wait">
          {loading ? (
            <FriendsLoading />
          ) : activeTab === "friends" ? (
            <motion.div
              key="friends-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-4 px-1"
            >
              {friends.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 text-center bg-white/5 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group"
                >
                   <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition-transform duration-700 relative z-10">
                    👥
                  </div>
                  <h3 className="text-2xl font-heading text-white tracking-tight relative z-10">Your circle is empty</h3>
                  <p className="sub-heading text-[11px] text-white/30 lowercase mt-2 max-w-xs mx-auto leading-relaxed relative z-10">
                    start connecting with elite members to build your network within the aether.
                  </p>
                  <Link
                    href="/discover"
                    className="mt-8 inline-flex items-center gap-3 px-10 py-4 bg-primary text-black rounded-2xl sub-heading text-[10px] lowercase shadow-shadow-glow hover:scale-105 transition-all active:scale-95 relative z-10"
                  >
                    <FaUserPlus className="text-xs" /> grow network
                  </Link>
                </motion.div>
              ) : (
                friends.map((friend, i) => (
                  <motion.div
                    key={friend.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="p-5 bg-white/5 backdrop-blur-xl rounded-[28px] border border-white/5 flex items-center gap-5 hover:bg-white/10 hover:border-primary/20 transition-all active:scale-[0.98] shadow-xl group"
                  >
                    <div className="relative w-16 h-16 rounded-[20px] overflow-hidden bg-white/5 flex-shrink-0 border border-white/10 shadow-2xl">
                      <Image src={friend.image} alt={friend.name || "Friend"} fill className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700" />
                      <div className="absolute bottom-1 right-1 w-3.5 h-3.5 bg-primary rounded-full border-2 border-[#0a0a0a] shadow-shadow-glow" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h4 className="font-heading text-base text-white tracking-tight truncate">{friend.name}</h4>
                      <p className="sub-heading text-[9px] text-primary lowercase tracking-widest mt-1 opacity-60">connected</p>
                    </div>
                    <div className="flex gap-2.5">
                      <Link
                        href={`/chat/${friend.friendId}`}
                        className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 text-white flex items-center justify-center hover:bg-primary hover:text-black hover:border-primary hover:shadow-shadow-glow transition-all"
                      >
                        <FaComment className="text-sm" />
                      </Link>
                      <button className="w-12 h-12 rounded-[18px] bg-white/5 border border-white/10 text-white/30 flex items-center justify-center hover:text-white transition-colors">
                        <FaEllipsisV className="text-xs" />
                      </button>
                    </div>
                  </motion.div>
                ))
              )}
            </motion.div>
          ) : (
            <motion.div
              key="requests-list"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="space-y-6 px-1"
            >
              {requests.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.98 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="py-24 text-center bg-white/5 rounded-[40px] border border-white/5 shadow-2xl relative overflow-hidden group"
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
                  <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 text-4xl group-hover:scale-110 transition-transform duration-700 relative z-10">
                    📬
                  </div>
                  <h3 className="text-2xl font-heading text-white tracking-tight relative z-10">Inbox Clear</h3>
                  <p className="sub-heading text-[11px] text-white/30 lowercase mt-2 relative z-10 leading-relaxed max-w-[200px] mx-auto">no pending invitations at the moment.</p>
                </motion.div>
              ) : (
                requests.map((request, i) => (
                  <motion.div
                    key={request.id}
                    initial={{ opacity: 0, y: 15 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="p-6 bg-white/5 backdrop-blur-xl rounded-[32px] border border-white/5 hover:border-primary/20 transition-all shadow-xl group"
                  >
                    <div className="flex items-center gap-5 mb-6">
                      <div className="w-20 h-20 rounded-[24px] overflow-hidden relative bg-white/5 flex-shrink-0 border border-white/10 shadow-2xl">
                        <Image
                          src={
                            request.senderUser.profile?.photos
                              ? JSON.parse(request.senderUser.profile.photos)[0]
                              : `https://ui-avatars.com/api/?name=${request.senderUser.name}&background=c4ff00&color=000`
                          }
                          alt={request.senderUser.name || "Member"}
                          fill
                          className="object-cover grayscale group-hover:grayscale-0 transition-all duration-700"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-heading text-xl text-white tracking-tight leading-none truncate">{request.senderUser.name}</h4>
                        <p className="sub-heading text-[10px] text-white/40 lowercase mt-2 tracking-widest">wants to connect</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleAccept(request.id)}
                        className="py-4 bg-primary text-black rounded-[18px] sub-heading text-[9px] lowercase flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-shadow-glow"
                      >
                        <FaCheck className="text-[10px]" /> accept
                      </button>
                      <button
                        onClick={() => handleReject(request.id)}
                        className="py-4 bg-white/5 border border-white/10 text-white/30 rounded-[18px] sub-heading text-[9px] lowercase flex items-center justify-center gap-2 hover:border-white/20 hover:text-white transition-all"
                      >
                        <FaTimes className="text-[10px]" /> decline
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
