"use client";

import { useEffect, useState } from "react";
import { getPublicProfile } from "../actions";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { motion } from "framer-motion";
import {
  FaCrown,
  FaCheck,
  FaBriefcase,
  FaHeart,
  FaStar,
  FaArrowLeft,
  FaCommentDots,
  FaUserPlus,
  FaVideo,
  FaSpinner
} from "react-icons/fa";
import LoadingSpinner from "../../components/LoadingSpinner";
import { getOrCreateConversation } from "../../chat/actions";
import { sendFriendRequest } from "../../friends/actions";

interface PublicProfileData {
  id: string;
  name: string | null;
  age: number | null;
  occupation: string | null;
  bio: string;
  photos: string[];
  matchesCount: number;
  reelsCount: number;
  reels: Array<{ id: string; videoUrl: string }>;
  membership: string;
  tier: string;
  verificationStatus: string;
  networkingGoals: string[];
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      getPublicProfile(id as string).then(data => {
        if (data) setProfile(data as PublicProfileData);
        setLoading(false);
      });
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-[#f8f7f5] flex items-center justify-center">
      <LoadingSpinner size="lg" />
    </div>
  );

  if (!profile) return <div className="min-h-screen bg-[#f8f7f5] flex flex-col items-center justify-center p-6 text-center"><h2 className="text-2xl font-black text-stone-900 mb-2">Member Not Found</h2><button onClick={() => router.back()} className="text-stone-400 font-bold uppercase tracking-widest text-xs">Go Back</button></div>;

  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-white pb-28">
      {/* Hero / Cover */}
      <div className="relative">
        <div className="relative h-64 overflow-hidden rounded-b-[4rem] shadow-2xl">
          <div className="absolute inset-0 bg-stone-900" />
          {/* Ambient Animated Glows */}
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-80 h-80 bg-yellow-400/20 blur-[100px] rounded-full" 
          />
          <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-center z-10">
            <button onClick={() => router.back()} className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-2xl text-white border border-white/10 hover:bg-white/10 transition-all">
              <FaArrowLeft />
            </button>
          </div>
        </div>

        {/* Avatar */}
        <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20">
          <div className="relative group">
            <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-20" />
            <div className="relative w-40 h-40 rounded-full border-[6px] border-white overflow-hidden bg-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
              <Image
                src={profile.photos[0] || `https://ui-avatars.com/api/?name=${profile.name}`}
                alt={profile.name || "Profile"}
                fill
                className="object-cover"
                unoptimized={profile.photos[0]?.startsWith("/")}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Identity */}
      <div className="mt-24 px-6 text-center">
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <h2 className="text-4xl font-black text-stone-900 tracking-tight">
                {profile.name}{profile.age ? <span className="text-stone-400 font-light ml-2">{profile.age}</span> : ""}
              </h2>
              {isVerified && (
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FaCheck className="text-white text-xs" />
                </div>
              )}
            </div>

            {profile.occupation && (
              <div className="flex items-center justify-center gap-2 text-stone-400 text-sm font-black tracking-widest uppercase">
                <FaBriefcase className="text-xs" />
                <span>{profile.occupation}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="px-4 py-2 rounded-2xl bg-stone-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <FaCrown className="text-yellow-400" />
              {profile.membership}
            </div>
            <div className="px-4 py-2 rounded-2xl bg-yellow-400 text-stone-950 font-black text-[10px] uppercase tracking-widest flex items-center gap-2">
              <FaStar />
              Verified Identity
            </div>
          </div>

          <div className="max-w-xs mx-auto py-2">
            <p className="text-stone-600 text-base font-medium leading-relaxed italic">
              &ldquo;{profile.bio || "Crafting an extraordinary legacy."}&rdquo;
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={async () => {
                if (!profile) return;
                setActionLoading(true);
                const res = await sendFriendRequest(profile.id);
                setActionLoading(false);
                if (res.success) alert("Friend request sent!");
                else alert(res.error || "Failed to send request");
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-stone-900 text-white rounded-[2rem] font-black text-sm shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? <FaSpinner className="animate-spin" /> : <FaUserPlus className="text-yellow-400" />} 
              Connect
            </button>
            <button 
              onClick={async () => {
                if (!profile) return;
                setActionLoading(true);
                try {
                  const convId = await getOrCreateConversation(profile.id);
                  if (convId) {
                    router.push(`/chat/${convId}`);
                  } else {
                    alert("Failed to start chat");
                  }
                } catch {
                  alert("Failed to start chat");
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-white border border-stone-200 rounded-[2rem] font-black text-stone-800 text-sm shadow-sm flex items-center justify-center gap-3 transition-all hover:border-yellow-400 active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCommentDots className="text-stone-400" />} 
              Message
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-4 mt-10">
          {[
            { label: "Connections", value: profile.matchesCount, icon: FaHeart, bg: "bg-stone-50", color: "text-stone-900" },
            { label: "Content", value: profile.reelsCount, icon: FaVideo, bg: "bg-blue-50", color: "text-blue-500" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-3xl p-6 flex flex-col items-center gap-1 border border-stone-100 shadow-sm transition-transform active:scale-95`}>
              <stat.icon className={`${stat.color} text-lg mb-1`} />
              <span className="text-2xl font-black text-stone-900 tracking-tighter">{stat.value}</span>
              <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Reels Grid */}
        <div className="px-5">
          <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest text-left mb-4">Reels</h3>
          <div className="grid grid-cols-3 gap-2">
            {profile.reels.map((reel) => (
              <div key={reel.id} className="aspect-[9/16] bg-stone-200 rounded-xl overflow-hidden relative">
                <video src={reel.videoUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {profile.reels.length === 0 && <p className="text-stone-400 text-sm py-8 italic text-center">No reels yet.</p>}
        </div>
      </div>
    </div>
  );
}
