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
import { ProfileSkeleton } from "../../components/Skeleton";
import { getOrCreateConversation } from "../../chat/actions";
import { sendFriendRequest } from "../../friends/actions";
import { vouchForUser } from "@/lib/actions/social";
import { FaUserShield } from "react-icons/fa";
import { useToast } from "@/app/providers/ToastProvider";

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
  vouchesCount: number;
  trustScore: number;
}

export default function PublicProfilePage() {
  const { id } = useParams();
  const [profile, setProfile] = useState<PublicProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    const resolvedId = Array.isArray(id) ? id[0] : id;
    if (resolvedId) {
      getPublicProfile(decodeURIComponent(resolvedId)).then(data => {
        if (data) setProfile(data as PublicProfileData);
        setLoading(false);
      });
    } else {
      setLoading(false);
    }
  }, [id]);

  if (loading) return (
    <div className="min-h-screen bg-background p-6">
      <ProfileSkeleton />
    </div>
  );

  if (!profile) return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-2xl font-black text-white mb-2 font-heading uppercase tracking-tighter">Member Not Found</h2>
      <button onClick={() => router.back()} className="text-muted-foreground font-black uppercase tracking-widest text-[10px]">Go Back</button>
    </div>
  );

  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <div className="min-h-screen bg-background pb-28">
      {/* Hero / Cover */}
      <div className="relative">
        <div className="relative h-64 overflow-hidden rounded-b-[4rem] shadow-2xl">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-3xl" />
          {/* Ambient Animated Glows */}
          <motion.div 
            animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
            transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            className="absolute -top-20 -left-20 w-80 h-80 bg-primary/20 blur-[100px] rounded-full" 
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
            <div className="absolute inset-0 rounded-full bg-primary blur-xl opacity-20" />
            <div className="relative w-40 h-40 rounded-full border-[6px] border-background overflow-hidden bg-card shadow-[0_20px_50px_rgba(0,0,0,0.4)]">
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
              <h2 className="text-4xl font-black text-white tracking-tight font-heading uppercase">
                {profile.name}{profile.age ? <span className="text-muted-foreground/60 font-light ml-2">{profile.age}</span> : ""}
              </h2>
              {isVerified && (
                <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                  <FaCheck className="text-white text-[10px]" />
                </div>
              )}
            </div>

            {profile.occupation && (
              <div className="flex items-center justify-center gap-2 text-muted-foreground text-[10px] font-black tracking-widest uppercase">
                <FaBriefcase className="text-[10px] text-primary/60" />
                <span>{profile.occupation}</span>
              </div>
            )}
          </div>

          <div className="flex flex-wrap justify-center gap-2">
            <div className="px-4 py-2 rounded-2xl bg-card border border-white/5 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-xl">
              <FaCrown className="text-primary" />
              {profile.membership}
            </div>
            <div className="px-4 py-2 rounded-2xl bg-primary text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-primary/20">
              <FaStar />
              Verified Identity
            </div>
          </div>

          <div className="max-w-xs mx-auto py-2">
            <p className="text-muted-foreground text-base font-medium leading-relaxed italic">
              &ldquo;{profile.bio || "Crafting an extraordinary legacy."}&rdquo;
            </p>
          </div>

          {/* AI Compatibility Score */}
          <div className="flex justify-center pt-2">
            <div className="relative group cursor-help">
              <div className="absolute inset-0 bg-primary blur-lg opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative bg-card border border-primary/30 px-4 py-2 rounded-2xl flex items-center gap-3">
                <div className="flex flex-col items-start">
                  <span className="text-[8px] font-black text-muted-foreground uppercase tracking-[0.2em]">AI Match Score</span>
                  <span className="text-lg font-black text-white tracking-tighter">88% <span className="text-[10px] text-emerald-400 ml-1">High Compatibility</span></span>
                </div>
                <div className="w-8 h-8 rounded-full border border-white/10 bg-white/5 flex items-center justify-center text-xs font-black text-primary/90">
                  ⚡
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button 
              onClick={async () => {
                if (!profile) return;
                setActionLoading(true);
                const res = await sendFriendRequest(profile.id);
                setActionLoading(false);
                if (res.success) showToast("Friend request sent!", "success");
                else showToast(res.error || "Failed to send request", "error");
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-primary text-white rounded-[2rem] font-black text-xs uppercase tracking-widest shadow-2xl flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 shadow-primary/20"
            >
              {actionLoading ? <FaSpinner className="animate-spin" /> : <FaUserPlus className="text-white" />} 
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
                    showToast("Failed to start chat", "error");
                  }
                } catch {
                  showToast("Failed to start chat", "error");
                } finally {
                  setActionLoading(false);
                }
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-card border border-white/10 rounded-[2rem] font-black text-white text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 transition-all hover:border-primary active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? <FaSpinner className="animate-spin" /> : <FaCommentDots className="text-muted-foreground" />} 
              Message
            </button>
            <button 
              onClick={async () => {
                if (!profile) return;
                setActionLoading(true);
                const res = await vouchForUser(profile.id);
                setActionLoading(false);
                if (res.success) {
                  showToast("You have vouched for this member!", "success");
                  setProfile(prev => prev ? { ...prev, vouchesCount: prev.vouchesCount + 1 } : null);
                } else {
                  showToast(res.error || "Failed to vouch", "error");
                }
              }}
              disabled={actionLoading}
              className="flex-1 py-4 bg-white/5 border border-white/5 rounded-[2rem] font-black text-muted-foreground text-xs uppercase tracking-widest shadow-sm flex items-center justify-center gap-3 transition-all hover:border-primary active:scale-95 disabled:opacity-50"
            >
              {actionLoading ? <FaSpinner className="animate-spin" /> : <FaUserShield className="text-muted-foreground" />} 
              Vouch
            </button>
            <button 
              onClick={() => {
                showToast("Starting professional video call...", "info");
              }}
              className="w-16 py-4 bg-primary text-white rounded-[2rem] font-black text-sm shadow-2xl flex items-center justify-center transition-all hover:scale-[1.05] active:scale-95 shadow-primary/20"
            >
              <FaVideo />
            </button>
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-3 gap-3 mt-10 px-5">
          {[
            { label: "Connections", value: profile.matchesCount, icon: FaHeart, bg: "bg-white/5", color: "text-red-400" },
            { label: "Vouches", value: profile.vouchesCount, icon: FaCheck, bg: "bg-white/5", color: "text-primary" },
            { label: "Content", value: profile.reelsCount, icon: FaVideo, bg: "bg-white/5", color: "text-blue-400" },
          ].map((stat) => (
            <div key={stat.label} className={`${stat.bg} rounded-3xl p-5 flex flex-col items-center gap-1 border border-white/5 shadow-xl transition-transform active:scale-95`}>
              <stat.icon className={`${stat.color} text-lg mb-1`} />
              <span className="text-xl font-black text-white tracking-tighter">{stat.value}</span>
              <span className="text-[8px] font-black text-muted-foreground uppercase tracking-tighter">{stat.label}</span>
            </div>
          ))}
        </div>

        {/* Reels Grid */}
        <div className="px-5 mt-10">
          <h3 className="text-[10px] font-black text-muted-foreground uppercase tracking-[0.2em] text-left mb-6 ml-2">Legacy Content</h3>
          <div className="grid grid-cols-3 gap-2">
            {profile.reels.map((reel) => (
              <div key={reel.id} className="aspect-[9/16] bg-card border border-white/5 rounded-2xl overflow-hidden relative shadow-2xl">
                <video src={reel.videoUrl} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
          {profile.reels.length === 0 && (
            <div className="py-12 border border-dashed border-white/5 rounded-[2.5rem] bg-white/5">
              <p className="text-muted-foreground/40 text-[10px] font-black uppercase tracking-widest italic text-center">No reels published</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
