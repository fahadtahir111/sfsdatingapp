"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserFriends, FaCheck, FaTimes, FaComment, FaEllipsisV } from "react-icons/fa";
import { getFriends, getPendingRequests, acceptFriendRequest, rejectFriendRequest } from "./actions";
import Image from "next/image";
import Link from "next/link";
import LoadingSpinner from "../components/LoadingSpinner";

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
    <div className="min-h-screen bg-white pb-24">
      {/* ── Sticky Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-2xl border-b border-stone-100 px-6 py-6">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-stone-900 tracking-tight">Network</h1>
          <div className="w-12 h-12 rounded-2xl bg-stone-900 flex items-center justify-center text-yellow-400 shadow-xl shadow-stone-200">
             <FaUserFriends className="text-xl" />
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex p-1.5 bg-stone-100 rounded-[2rem]">
          <button
            onClick={() => setActiveTab("friends")}
            className={`flex-1 py-3.5 rounded-[1.5rem] text-sm font-black transition-all ${
              activeTab === "friends" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
            }`}
          >
            My Circle ({friends.length})
          </button>
          <button
            onClick={() => setActiveTab("requests")}
            className={`flex-1 py-3.5 rounded-[1.5rem] text-sm font-black transition-all relative ${
              activeTab === "requests" ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"
            }`}
          >
            Requests
            {requests.length > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-yellow-400 text-stone-950 text-[11px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-lg">
                {requests.length}
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="px-6 py-6">
        <AnimatePresence mode="wait">
          {loading ? (
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              className="flex justify-center py-20"
            >
              <LoadingSpinner size="md" />
            </motion.div>
          ) : activeTab === "friends" ? (
            <motion.div
              key="friends-list"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-4"
            >
              {friends.length === 0 ? (
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl grayscale opacity-50">👥</div>
                  <h3 className="text-lg font-black text-stone-800">Your circle is small</h3>
                  <p className="text-stone-400 text-sm font-medium mt-1">Start connecting with Elite members to build your network.</p>
                  <Link href="/discover" className="mt-6 inline-block px-8 py-3 bg-stone-900 text-white rounded-2xl font-black text-sm">Grow Network</Link>
                </div>
              ) : (
                friends.map((friend) => (
                  <div 
                    key={friend.id}
                    className="p-4 bg-white rounded-3xl border border-stone-100 shadow-sm flex items-center gap-4 hover:shadow-md transition-all active:scale-[0.98]"
                  >
                    <div className="w-14 h-14 rounded-2xl overflow-hidden relative bg-stone-100">
                      <Image src={friend.image} alt={friend.name || "Friend"} fill className="object-cover" />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-black text-stone-900">{friend.name}</h4>
                      <p className="text-xs text-stone-400 font-bold uppercase tracking-widest mt-0.5">Connected</p>
                    </div>
                    <div className="flex gap-2">
                       <Link href={`/chat/${friend.friendId}`} className="w-10 h-10 rounded-xl bg-stone-50 text-stone-900 flex items-center justify-center hover:bg-stone-900 hover:text-white transition-all">
                          <FaComment className="text-sm" />
                       </Link>
                       <button className="w-10 h-10 rounded-xl bg-stone-50 text-stone-400 flex items-center justify-center">
                          <FaEllipsisV className="text-sm" />
                       </button>
                    </div>
                  </div>
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
                <div className="py-20 text-center">
                  <div className="w-20 h-20 bg-stone-50 rounded-full flex items-center justify-center mx-auto mb-4 text-4xl grayscale opacity-50">📬</div>
                  <h3 className="text-lg font-black text-stone-800">Inbox Clear</h3>
                  <p className="text-stone-400 text-sm font-medium mt-1">No pending invitations at the moment.</p>
                </div>
              ) : (
                requests.map((request) => (
                  <div 
                    key={request.id}
                    className="p-5 bg-white rounded-3xl border border-stone-100 shadow-sm"
                  >
                    <div className="flex items-center gap-4 mb-5">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden relative bg-stone-100">
                        <Image 
                          src={request.senderUser.profile?.photos ? JSON.parse(request.senderUser.profile.photos)[0] : `https://ui-avatars.com/api/?name=${request.senderUser.name}`} 
                          alt={request.senderUser.name || "Member"} 
                          fill 
                          className="object-cover" 
                        />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-black text-stone-900 text-lg leading-tight">{request.senderUser.name}</h4>
                        <p className="text-sm text-stone-400 font-medium">wants to connect</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3">
                       <button 
                        onClick={() => handleAccept(request.id)}
                        className="py-3 bg-stone-900 text-white rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-stone-800 transition-all active:scale-95"
                       >
                          <FaCheck /> Accept
                       </button>
                       <button 
                        onClick={() => handleReject(request.id)}
                        className="py-3 bg-stone-100 text-stone-400 rounded-2xl font-black text-sm flex items-center justify-center gap-2 hover:bg-stone-200 transition-all active:scale-95"
                       >
                          <FaTimes /> Decline
                       </button>
                    </div>
                  </div>
                ))
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
}
