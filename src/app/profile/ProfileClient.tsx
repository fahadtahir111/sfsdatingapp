"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  FaCog,
  FaPen,
  FaCrown,
  FaCheck,
  FaBriefcase,
  FaHeart,
  FaFire,
  FaStar,
  FaArrowRight,
  FaVideo,
  FaCamera,
  FaEyeSlash,
} from "react-icons/fa";
import { claimDailyBonus, boostProfile } from "./economy-actions";
import { toggleGhostMode } from "./actions";
import { updateUserPresence } from "@/app/actions/presence";
import { useToast } from "@/app/providers/ToastProvider";
import type { ProfileData, FriendData, PendingRequestData } from "./types";
import { EditProfileModal } from "./components/EditProfileModal";
import { CreatePostModal } from "./components/CreatePostModal";

export type { ProfileData, FriendData, PendingRequestData } from "./types";

export default function ProfileClient({
  initialProfile,
  initialPendingRequests,
  initialFriends,
}: {
  initialProfile: ProfileData;
  initialPendingRequests: PendingRequestData[];
  initialFriends: FriendData[];
}) {
  const { showToast } = useToast();
  const [profile, setProfile] = useState<ProfileData>(initialProfile);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [activeTab, setActiveTab] = useState<"posts" | "reels" | "friends">("posts");
  const [pendingRequests, setPendingRequests] = useState<PendingRequestData[]>(initialPendingRequests);
  const [friends] = useState<FriendData[]>(initialFriends);
  const [presence, setPresence] = useState<string>(initialProfile.presence || "online");

  const fetchProfile = useCallback(async () => {
    const { getProfile } = await import("./actions");
    const data = await getProfile();
    if (data) setProfile(data as ProfileData);
  }, []);

  const handleProfileSaved = (updated: Partial<ProfileData>) => {
    setProfile((prev) => ({ ...prev, ...updated }));
  };

  const handleClaimBonus = async () => {
    const result = await claimDailyBonus();
    if (result.success && "amount" in result) {
      setProfile((prev) => ({ ...prev, tokens: prev.tokens + (result.amount || 0) }));
      showToast(`Claimed ${result.amount} tokens!`, "success");
    } else {
      const errorMsg =
        "message" in result ? result.message : "error" in result ? result.error : "Failed to claim bonus";
      showToast(errorMsg || "Failed to claim bonus", "error");
    }
  };

  const handleBoost = async () => {
    if (profile.tokens < 300) {
      showToast("Insufficient tokens. Post more content or refer friends!", "error");
      return;
    }
    const result = await boostProfile();
    if (result.success) {
      setProfile((prev) => ({ ...prev, tokens: prev.tokens - 300 }));
      showToast("Profile boosted for 24 hours!", "success");
    } else {
    }
  };

  const handlePresenceChange = async (newPresence: string) => {
    setPresence(newPresence);
    const result = await updateUserPresence(newPresence);
    if (result.success) {
      showToast(`Status updated to ${newPresence}`, "success");
    } else {
      showToast("Failed to update status", "error");
    }
  };

  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <>
      <div className="page-shell min-h-screen bg-background pb-28 md:pb-12">
        {/* Hero */}
        <div className="relative -mx-[var(--page-gutter)] px-[var(--page-gutter)] mb-8 md:mb-0 md:mx-0 md:px-0 md:rounded-[40px] overflow-hidden shadow-premium border border-white/5 bg-aether-mesh">
          <div className="relative h-[min(52vw,280px)] sm:h-72 lg:h-80 overflow-hidden">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -top-24 -left-24 w-72 h-72 bg-primary/20 blur-[100px] rounded-full"
            />
            <motion.div
              animate={{ x: [0, -36, 0], y: [0, -20, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-28 -right-28 w-80 h-80 bg-cobalt/15 blur-[100px] rounded-full"
            />

            <div className="absolute inset-x-0 top-0 p-5 sm:p-8 flex justify-between items-start z-10">
              <div>
                <p className="sub-heading text-primary/90">Elite</p>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">Your profile</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-4 py-2 bg-white/5 backdrop-blur-xl border border-white/10 text-primary rounded-xl flex items-center gap-2 shadow-shadow-glow text-xs sm:text-sm font-black">
                  <span>{profile.tokens}</span>
                  <span aria-hidden>💎</span>
                </div>
                <div className="hidden sm:flex items-center gap-1 p-1 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl">
                  {["online", "away", "dnd"].map((p) => (
                    <button
                      key={p}
                      onClick={() => handlePresenceChange(p)}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${
                        presence === p 
                          ? "bg-primary text-black shadow-shadow-glow" 
                          : "text-white/40 hover:text-white/70"
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
                <Link
                  href="/settings"
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl bg-white/10 backdrop-blur-xl text-white border border-white/10 hover:bg-white/20 transition-all focus-ring active:scale-90"
                >
                  <FaCog className="text-lg sm:text-xl" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 -mt-16 sm:-mt-20 pb-8">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
              <div className="relative group mx-auto md:mx-0 shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-4 border-background overflow-hidden bg-muted shadow-shadow-glow">
                  <Image
                    src={profile.photos[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}&background=050505&color=c4ff00`}
                    alt={profile.name || "Profile"}
                    fill
                    className="object-cover"
                    unoptimized={profile.photos[0]?.startsWith("/")}
                    priority
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.1, rotate: 10 }}
                  whileTap={{ scale: 0.9 }}
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-1 right-1 w-11 h-11 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-shadow-glow border-2 border-background z-30 focus-ring"
                >
                  <FaPen className="text-sm" />
                </motion.button>
              </div>

              <div className="flex-1 text-center md:text-left space-y-4 pt-2 md:pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h2 className="text-3xl sm:text-4xl font-heading text-white tracking-tight">
                      {profile.name || "User"}
                      {profile.age ? (
                        <span className="text-muted-foreground font-medium ml-2 text-2xl sm:text-3xl">{profile.age}</span>
                      ) : null}
                    </h2>
                    {isVerified && (
                      <span className="inline-flex w-7 h-7 bg-primary rounded-full items-center justify-center shadow-shadow-glow text-primary-foreground">
                        <FaCheck className="text-[10px]" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-[10px] font-bold uppercase tracking-[0.2em]">
                    <FaBriefcase className="text-[8px] shrink-0" />
                    <span>{profile.occupation || "Elite Member"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-primary text-[10px] font-black uppercase tracking-widest">
                    <FaCrown className="text-primary" />
                    {profile.membership}
                  </span>
                  {profile.verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-cobalt text-white text-[10px] font-black uppercase tracking-widest shadow-shadow-glow">
                      <FaStar className="text-xs" />
                      Verified Identity
                    </span>
                  )}
                </div>

                <div className="max-w-xl mx-auto md:mx-0">
                  {profile.bio ? (
                    <p className="text-foreground/80 text-sm sm:text-base font-medium leading-relaxed italic border-l-2 border-primary/30 pl-4">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="sub-heading text-primary/70 hover:text-primary transition-colors"
                    >
                      + Add your bio
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10 mt-8">
          <div className="xl:col-span-8 space-y-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: "Connections", value: profile.matchesCount, icon: FaHeart, accent: "text-primary" },
                { label: "Social", value: profile.storiesCount, icon: FaFire, accent: "text-cobalt" },
                { label: "Content", value: profile.reelsCount, icon: FaVideo, accent: "text-stone-400" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="surface-card rounded-2xl sm:rounded-3xl p-5 flex flex-col items-center gap-1 transition-all active:scale-[0.98] border-white/5 hover:border-primary/20"
                >
                  <stat.icon className={`${stat.accent} text-lg mb-1`} />
                  <span className="text-xl sm:text-2xl font-heading text-white tracking-tighter">{stat.value}</span>
                  <span className="sub-heading text-[8px] text-muted-foreground lowercase text-center leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="surface-card rounded-[2rem] p-8 bg-aether-mesh text-white border-white/5 relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-8 opacity-[0.05] pointer-events-none group-hover:scale-110 transition-transform">
                <FaCrown className="text-8xl text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl flex items-center justify-center text-xl shadow-shadow-glow text-primary">
                    ⚡
                  </div>
                  <h3 className="font-heading text-xl">Aether Credits</h3>
                </div>
                <p className="sub-heading text-muted-foreground lowercase mb-6">
                  {profile.tokens} credits remaining in vault
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <button
                    type="button"
                    onClick={handleBoost}
                    className="py-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border border-white/10 hover:bg-white/5 active:scale-95"
                  >
                    Boost Visibility
                  </button>
                  <button
                    type="button"
                    onClick={handleClaimBonus}
                    className="btn-aether py-4 shadow-shadow-glow"
                  >
                    Claim Rewards
                  </button>
                </div>
              </div>
            </div>
          </div>

          <aside className="xl:col-span-4 space-y-4">
            <button
              type="button"
              onClick={async () => {
                const newStatus = !profile.incognito;
                const result = await toggleGhostMode(newStatus);
                if (result.success) {
                  setProfile((prev) => ({ ...prev, incognito: newStatus }));
                } else {
                  showToast("Failed to update Ghost Mode", "error");
                }
              }}
              className="w-full group relative p-6 bg-card border border-white/5 rounded-2xl overflow-hidden flex items-center gap-4 shadow-sm hover:border-primary/30 transition-all focus-ring active:scale-[0.98]"
            >
              <div
                className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0 transition-colors ${
                  profile.incognito ? "bg-primary text-primary-foreground shadow-shadow-glow" : "bg-white/5 text-muted-foreground border border-white/10"
                }`}
              >
                <FaEyeSlash />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-heading text-white text-base tracking-tight">Ghost Mode</h4>
                <p className="sub-heading text-[9px] text-muted-foreground lowercase truncate">
                  {profile.incognito ? "invisible browsing active" : "visible to others"}
                </p>
              </div>
              <div
                className={`w-2.5 h-2.5 rounded-full shrink-0 transition-all ${profile.incognito ? "bg-primary shadow-shadow-glow" : "bg-white/10"}`}
              />
            </button>

            <Link href="/referrals" className="block group">
              <div className="relative p-6 bg-card border border-white/5 rounded-2xl overflow-hidden flex items-center gap-4 shadow-sm hover:border-primary/30 transition-all active:scale-[0.98]">
                <div className="w-12 h-12 rounded-xl bg-cobalt/10 border border-cobalt/20 flex items-center justify-center text-xl shadow-lg text-cobalt shrink-0">
                  🎁
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-heading text-white text-base tracking-tight">Expand Circle</h3>
                  <p className="sub-heading text-[9px] text-muted-foreground lowercase">Referral rewards</p>
                </div>
                <FaArrowRight className="text-muted-foreground group-hover:text-primary transition-all shrink-0 group-hover:translate-x-1" />
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="w-full p-6 bg-card border border-white/5 rounded-2xl flex items-center gap-4 hover:border-primary/35 transition-all text-left focus-ring active:scale-[0.98]"
            >
              <div className="w-12 h-12 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-muted-foreground shrink-0">
                <FaPen className="text-sm" />
              </div>
              <div>
                <h3 className="font-heading text-white tracking-tight">Edit Identity</h3>
                <p className="sub-heading text-[9px] text-muted-foreground lowercase">modify photos & info</p>
              </div>
            </button>

            {!isVerified && (
              <Link href="/verify" className="block">
                <motion.div
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="p-6 bg-primary rounded-2xl shadow-shadow-glow flex items-center gap-4 cursor-pointer border border-white/10"
                >
                  <div className="w-11 h-11 rounded-xl bg-primary-foreground/10 flex items-center justify-center text-xl shrink-0">
                    <FaCrown className="text-primary-foreground" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-primary-foreground text-base">Verify Identity</h3>
                    <p className="text-[10px] text-primary-foreground/80 font-bold uppercase tracking-widest mt-0.5">
                      Unlock elite features
                    </p>
                  </div>
                  <span className="text-primary-foreground text-xl font-black shrink-0">›</span>
                </motion.div>
              </Link>
            )}
          </aside>
        </div>

        {/* Tabs & content */}
        <div className="mt-12 space-y-6">
          <div className="flex gap-2 p-1.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl max-w-xl mx-auto xl:mx-0 xl:max-w-none shadow-xl">
            {(["posts", "reels", "friends"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-3 rounded-xl sub-heading transition-all focus-ring active:scale-95 ${
                  activeTab === tab ? "bg-primary text-primary-foreground shadow-shadow-glow" : "text-muted-foreground hover:text-white"
                }`}
              >
                {tab === "posts" ? "Posts" : tab === "reels" ? "Reels" : "Friends"}
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowPostModal(true)}
            className="w-full max-w-xl mx-auto xl:mx-0 xl:max-w-xs py-4 flex items-center justify-center gap-3 bg-white text-black rounded-xl font-black text-xs uppercase tracking-widest shadow-xl hover:bg-stone-200 transition-colors focus-ring"
          >
            <FaCamera className="text-sm" />
            New {activeTab === "posts" ? "Capture" : "Motion"}
          </motion.button>

          {activeTab === "friends" ? (
            <div className="space-y-8 max-w-3xl mx-auto xl:mx-0">
              <div>
                <h3 className="sub-heading text-muted-foreground mb-4">Pending Authorization</h3>
                {pendingRequests.length > 0 ? (
                  <ul className="space-y-4">
                    {pendingRequests.map((req) => (
                      <li
                        key={req.id}
                        className="surface-card p-5 flex flex-col sm:flex-row sm:items-center gap-4 border-white/5"
                      >
                        <div className="flex items-center gap-4 flex-1 min-w-0">
                          <div className="w-14 h-14 rounded-xl overflow-hidden relative shrink-0 bg-muted shadow-lg border border-white/5">
                            <Image
                              src={
                                req.senderUser.profile?.photos
                                  ? JSON.parse(req.senderUser.profile.photos)[0]
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.senderUser.name || "User")}&background=050505&color=c4ff00`
                              }
                              alt={req.senderUser.name || "User"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-heading text-white text-base truncate">{req.senderUser.name || "User"}</p>
                            <p className="sub-heading text-primary lowercase text-[10px]">Authorization Request</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 justify-end sm:justify-start">
                          <button
                            type="button"
                            onClick={async () => {
                              const { acceptFriendRequest } = await import("../friends/actions");
                              const r = await acceptFriendRequest(req.id);
                              if (r.success) {
                                setPendingRequests((prev) => prev.filter((x) => x.id !== req.id));
                                showToast("Connection established!", "success");
                              } else showToast(r.error || "Could not accept", "error");
                            }}
                            className="btn-aether px-6 py-2.5 text-[10px] shadow-shadow-glow"
                          >
                            Approve
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const { rejectFriendRequest } = await import("../friends/actions");
                              await rejectFriendRequest(req.id);
                              setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
                            }}
                            className="px-6 py-2.5 bg-white/5 border border-white/10 text-muted-foreground font-black text-[10px] uppercase tracking-widest rounded-xl hover:bg-white/10 transition-colors"
                          >
                            Decline
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-12 text-muted-foreground text-sm rounded-2xl border border-dashed border-white/10 bg-white/5">
                    No pending authorizations.
                  </p>
                )}
              </div>

              <div>
                <h3 className="sub-heading text-muted-foreground mb-4">Elite Network</h3>
                {friends.length > 0 ? (
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {friends.map((friend) => (
                      <li key={friend.id}>
                        <Link href={`/profile/${friend.friendId}`}>
                          <div className="surface-card p-4 flex items-center gap-4 hover:border-primary/40 transition-all border-white/5 bg-white/[0.02] group">
                            <div className="w-12 h-12 rounded-xl overflow-hidden relative shrink-0 bg-muted shadow-md border border-white/10 group-hover:shadow-shadow-glow transition-all">
                              <Image
                                src={friend.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(friend.name || "User")}&background=050505&color=c4ff00`}
                                alt={friend.name || "Friend"}
                                fill
                                className="object-cover group-hover:scale-110 transition-transform"
                                unoptimized={friend.image?.startsWith("https://ui-avatars.com")}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-heading text-white text-sm truncate group-hover:text-primary transition-colors">{friend.name}</p>
                              <p className="sub-heading text-[9px] text-muted-foreground lowercase">Active Connection</p>
                            </div>
                            <FaArrowRight className="text-muted-foreground text-xs shrink-0 group-hover:text-primary group-hover:translate-x-1 transition-all" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-16 text-muted-foreground text-sm italic rounded-2xl border border-dashed border-white/10">
                    Your network is waiting. Expand in Discover.
                  </p>
                )}
              </div>
            </div>
          ) : activeTab === "posts" || activeTab === "reels" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 pb-12">
              {profile.reels
                .filter((r) =>
                  activeTab === "posts" ? !r.videoUrl.match(/\.(mp4|mov|webm)$/i) : r.videoUrl.match(/\.(mp4|mov|webm)$/i)
                )
                .map((reel, idx) => (
                  <motion.div
                    key={reel.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="group relative aspect-[3/4] bg-muted rounded-2xl overflow-hidden border border-white/5 shadow-xl hover:border-primary/40 transition-all"
                  >
                    {reel.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <Image
                        src={reel.videoUrl}
                        alt={reel.caption || "Post"}
                        fill
                        className="object-cover transition-transform group-hover:scale-105 duration-500"
                        unoptimized={reel.videoUrl.startsWith("/")}
                      />
                    ) : (
                      <video src={reel.videoUrl} className="w-full h-full object-cover" muted playsInline />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-primary/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100 backdrop-blur-[2px]">
                      <div className="flex items-center gap-2 text-white font-black text-sm bg-black/40 px-4 py-2 rounded-full border border-white/20 shadow-shadow-glow">
                        <FaHeart className="text-primary" /> {reel.likesCount}
                      </div>
                    </div>
                    {!reel.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <div className="absolute top-3 right-3 bg-primary text-primary-foreground rounded-lg p-1.5 shadow-shadow-glow">
                        <FaVideo className="text-[10px]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              {profile.reels.filter((r) =>
                activeTab === "posts" ? !r.videoUrl.match(/\.(mp4|mov|webm)$/i) : r.videoUrl.match(/\.(mp4|mov|webm)$/i)
              ).length === 0 && (
                <div className="col-span-full py-24 flex flex-col items-center gap-6 text-center rounded-[2.5rem] border border-dashed border-white/10 bg-white/[0.02] px-4 backdrop-blur-sm">
                  <div className="text-6xl filter drop-shadow-shadow-glow">{activeTab === "posts" ? "📸" : "🎬"}</div>
                  <div className="max-w-sm">
                    <p className="font-heading text-white text-2xl mb-2">No {activeTab} yet</p>
                    <p className="text-muted-foreground text-sm font-medium leading-relaxed">
                      Stand out in the community. Share your first {activeTab === "posts" ? "photo or video" : "reel"} to inspire others.
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setShowPostModal(true)}
                    className="btn-aether px-10 py-4 shadow-shadow-glow"
                  >
                    <FaCamera className="inline mr-3 text-sm" />
                    Share First {activeTab === "posts" ? "Moment" : "Reel"}
                  </motion.button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal profile={profile} onClose={() => setShowEditModal(false)} onSaved={handleProfileSaved} />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPostModal && (
          <CreatePostModal onClose={() => setShowPostModal(false)} onPosted={fetchProfile} />
        )}
      </AnimatePresence>
    </>
  );
}
