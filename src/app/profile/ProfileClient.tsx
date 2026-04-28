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
      showToast(result.error || "Failed to boost profile", "error");
    }
  };

  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <>
      <div className="page-shell min-h-screen bg-background pb-28 md:pb-12">
        {/* Hero */}
        <div className="relative -mx-[var(--page-gutter)] px-[var(--page-gutter)] mb-8 md:mb-0 md:mx-0 md:px-0 md:rounded-3xl overflow-hidden shadow-premium border border-border/60">
          <div className="relative h-[min(52vw,280px)] sm:h-72 lg:h-80 bg-gradient-to-br from-zinc-900 via-zinc-800 to-primary/25">
            <motion.div
              animate={{ x: [0, 40, 0], y: [0, 24, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -top-24 -left-24 w-72 h-72 bg-primary/15 blur-[100px] rounded-full"
            />
            <motion.div
              animate={{ x: [0, -36, 0], y: [0, -20, 0] }}
              transition={{ duration: 14, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-28 -right-28 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full"
            />

            <div className="absolute inset-x-0 top-0 p-5 sm:p-8 flex justify-between items-start z-10">
              <div>
                <p className="text-[10px] sm:text-xs font-black uppercase tracking-[0.35em] text-primary/90">Elite</p>
                <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight font-heading">Your profile</h1>
              </div>
              <div className="flex items-center gap-2 sm:gap-3">
                <div className="px-3 py-2 sm:px-4 sm:py-2 bg-primary text-primary-foreground rounded-2xl flex items-center gap-2 shadow-lg text-xs sm:text-sm font-black">
                  <span>{profile.tokens}</span>
                  <span aria-hidden>💎</span>
                </div>
                <Link
                  href="/settings"
                  className="w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-white/10 backdrop-blur-xl text-white border border-white/15 hover:bg-white/15 transition-colors focus-ring"
                >
                  <FaCog className="text-lg sm:text-xl" />
                </Link>
              </div>
            </div>
          </div>

          <div className="relative mx-auto max-w-6xl px-4 sm:px-6 -mt-16 sm:-mt-20 pb-6">
            <div className="flex flex-col md:flex-row md:items-end gap-6 md:gap-10">
              <div className="relative group mx-auto md:mx-0 shrink-0">
                <div className="absolute inset-0 rounded-full bg-primary/25 blur-2xl opacity-40 group-hover:opacity-60 transition-opacity" />
                <div className="relative w-36 h-36 sm:w-40 sm:h-40 rounded-full border-[5px] border-background overflow-hidden bg-muted shadow-xl">
                  <Image
                    src={profile.photos[0] || `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.name || "User")}`}
                    alt={profile.name || "Profile"}
                    fill
                    className="object-cover"
                    unoptimized={profile.photos[0]?.startsWith("/")}
                    priority
                  />
                </div>
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.94 }}
                  type="button"
                  onClick={() => setShowEditModal(true)}
                  className="absolute bottom-1 right-1 w-11 h-11 bg-primary text-primary-foreground rounded-full flex items-center justify-center shadow-lg border-4 border-background z-30 focus-ring"
                >
                  <FaPen className="text-sm" />
                </motion.button>
              </div>

              <div className="flex-1 text-center md:text-left space-y-3 pt-2 md:pb-2">
                <div className="flex flex-col md:flex-row md:items-center md:flex-wrap gap-2 md:gap-3 justify-center md:justify-start">
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                    <h2 className="text-3xl sm:text-4xl font-black text-foreground tracking-tight font-heading">
                      {profile.name || "User"}
                      {profile.age ? (
                        <span className="text-muted-foreground font-medium ml-2 text-2xl sm:text-3xl">{profile.age}</span>
                      ) : null}
                    </h2>
                    {isVerified && (
                      <span className="inline-flex w-8 h-8 bg-blue-600 rounded-full items-center justify-center shadow-md text-white">
                        <FaCheck className="text-xs" />
                      </span>
                    )}
                  </div>
                  <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground text-xs sm:text-sm font-bold uppercase tracking-widest">
                    <FaBriefcase className="text-[10px] shrink-0" />
                    <span>{profile.occupation || "Elite Member"}</span>
                  </div>
                </div>

                <div className="flex flex-wrap justify-center md:justify-start gap-2">
                  <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-foreground text-background text-[10px] font-black uppercase tracking-widest shadow-md">
                    <FaCrown className="text-primary" />
                    {profile.membership}
                  </span>
                  {profile.verificationStatus === "VERIFIED" && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest">
                      <FaStar className="text-xs" />
                      Verified Identity
                    </span>
                  )}
                  {initialProfile.professionalVerified && (
                    <span className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest shadow-md">
                      <FaBriefcase />
                      Founder Verified
                    </span>
                  )}
                </div>

                <div className="max-w-xl mx-auto md:mx-0">
                  {profile.bio ? (
                    <p className="text-foreground/85 text-sm sm:text-base font-medium leading-relaxed italic border-l-2 border-primary/40 pl-4">
                      &ldquo;{profile.bio}&rdquo;
                    </p>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowEditModal(true)}
                      className="text-muted-foreground text-sm font-bold uppercase tracking-widest border-b border-border pb-1 hover:text-primary transition-colors"
                    >
                      Add a bio
                    </button>
                  )}
                </div>

                {profile.networkingGoals && profile.networkingGoals.length > 0 && (
                  <div className="flex flex-wrap justify-center md:justify-start gap-2 pt-1">
                    {profile.networkingGoals.map((tag) => (
                      <span
                        key={tag}
                        className="px-3 py-1.5 bg-muted border border-border text-muted-foreground rounded-xl text-[10px] font-black uppercase tracking-widest"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 xl:gap-10">
          <div className="xl:col-span-8 space-y-8">
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              {[
                { label: "Connections", value: profile.matchesCount, icon: FaHeart, accent: "text-rose-500" },
                { label: "Social", value: profile.storiesCount, icon: FaFire, accent: "text-orange-500" },
                { label: "Content", value: profile.reelsCount, icon: FaVideo, accent: "text-sky-500" },
              ].map((stat) => (
                <div
                  key={stat.label}
                  className="surface-card surface-elevated rounded-2xl sm:rounded-3xl p-4 sm:p-5 flex flex-col items-center gap-1 transition-transform active:scale-[0.98]"
                >
                  <stat.icon className={`${stat.accent} text-lg mb-1`} />
                  <span className="text-xl sm:text-2xl font-black text-foreground tracking-tighter">{stat.value}</span>
                  <span className="text-[8px] sm:text-[9px] font-black text-muted-foreground uppercase tracking-tighter text-center leading-tight">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>

            <div className="surface-card surface-elevated rounded-[1.75rem] sm:rounded-[2rem] p-6 bg-gradient-to-br from-zinc-900 to-zinc-800 text-white border-zinc-700/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-6 opacity-[0.08] pointer-events-none">
                <FaCrown className="text-7xl text-primary" />
              </div>
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 bg-primary rounded-2xl flex items-center justify-center text-lg shadow-lg text-primary-foreground">
                    ⚡
                  </div>
                  <h3 className="font-black text-lg font-heading">SFS Economy</h3>
                </div>
                <p className="text-zinc-400 text-xs font-bold uppercase tracking-[0.12em] mb-4">
                  You have {profile.tokens} tokens available
                </p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={handleBoost}
                    className="bg-white/10 hover:bg-white/15 border border-white/15 text-white py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-colors focus-ring"
                  >
                    Boost Profile
                  </button>
                  <button
                    type="button"
                    onClick={handleClaimBonus}
                    className="bg-primary hover:opacity-95 text-primary-foreground py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg transition-opacity focus-ring"
                  >
                    Claim Bonus
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
              className="w-full group relative p-5 sm:p-6 bg-card border border-border rounded-[1.75rem] overflow-hidden flex items-center gap-4 shadow-sm hover:border-primary/30 transition-colors text-left focus-ring"
            >
              <div
                className={`w-12 h-12 rounded-2xl flex items-center justify-center text-xl shrink-0 ${
                  profile.incognito ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                }`}
              >
                <FaEyeSlash />
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="font-black text-foreground text-base tracking-tight">Ghost Mode</h4>
                <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest truncate">
                  {profile.incognito ? "Browsing invisible" : "Visible in viewers"}
                </p>
              </div>
              <div
                className={`w-3 h-3 rounded-full shrink-0 ${profile.incognito ? "bg-primary shadow-[0_0_12px_var(--primary)]" : "bg-muted-foreground/40"}`}
              />
            </button>

            <Link href="/referrals" className="block group">
              <div className="relative p-5 sm:p-6 bg-card border border-border rounded-[1.75rem] overflow-hidden flex items-center gap-4 shadow-sm hover:border-primary/30 transition-colors">
                <div className="absolute top-0 right-0 w-28 h-28 bg-primary/5 rounded-full -mr-14 -mt-14 blur-2xl group-hover:bg-primary/10" />
                <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-xl shadow-lg text-primary-foreground shrink-0">
                  🎁
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-black text-foreground text-base tracking-tight">Expand your circle</h3>
                  <p className="text-muted-foreground text-[10px] font-bold uppercase tracking-widest">Referral rewards</p>
                </div>
                <FaArrowRight className="text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
              </div>
            </Link>

            <button
              type="button"
              onClick={() => setShowEditModal(true)}
              className="w-full p-5 bg-card border border-border rounded-[1.75rem] flex items-center gap-4 hover:border-primary/35 transition-colors text-left focus-ring"
            >
              <div className="w-12 h-12 rounded-2xl bg-muted flex items-center justify-center text-muted-foreground shrink-0">
                <FaPen />
              </div>
              <div>
                <h3 className="font-black text-foreground tracking-tight">Edit profile</h3>
                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Photos & details</p>
              </div>
            </button>

            {!isVerified && (
              <Link href="/verify" className="block">
                <motion.div
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  className="p-5 bg-gradient-to-r from-primary via-amber-400 to-amber-500 rounded-2xl shadow-lg flex items-center gap-4 cursor-pointer border border-primary/20"
                >
                  <div className="w-11 h-11 rounded-xl bg-white/25 flex items-center justify-center text-xl shrink-0">
                    <FaCrown className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-black text-primary-foreground text-sm sm:text-base">Verify your identity</h3>
                    <p className="text-xs text-primary-foreground/85 font-medium mt-0.5">
                      Unlock trust & discovery — usually under 2 hours
                    </p>
                  </div>
                  <span className="text-white text-xl font-black shrink-0">›</span>
                </motion.div>
              </Link>
            )}
          </aside>
        </div>

        {/* Tabs & content */}
        <div className="mt-10 space-y-4">
          <div className="flex gap-2 p-1 bg-muted rounded-2xl border border-border max-w-xl mx-auto xl:mx-0 xl:max-w-none">
            {(["posts", "reels", "friends"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl font-black text-xs sm:text-sm transition-all focus-ring ${
                  activeTab === tab ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab === "posts" ? "📸 Posts" : tab === "reels" ? "🎬 Reels" : "🤝 Friends"}
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.98 }}
            type="button"
            onClick={() => setShowPostModal(true)}
            className="w-full max-w-xl mx-auto xl:mx-0 xl:max-w-md py-3 flex items-center justify-center gap-2 bg-foreground text-background rounded-2xl font-black text-sm shadow-lg hover:opacity-95 transition-opacity focus-ring"
          >
            <FaCamera />
            New {activeTab === "posts" ? "Post" : "Reel"}
          </motion.button>

          {activeTab === "friends" ? (
            <div className="space-y-6 max-w-3xl mx-auto xl:mx-0">
              <div>
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">Pending requests</h3>
                {pendingRequests.length > 0 ? (
                  <ul className="space-y-3">
                    {pendingRequests.map((req) => (
                      <li
                        key={req.id}
                        className="surface-card p-4 flex flex-col sm:flex-row sm:items-center gap-4"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div className="w-12 h-12 rounded-full overflow-hidden relative shrink-0 bg-muted">
                            <Image
                              src={
                                req.senderUser.profile?.photos
                                  ? JSON.parse(req.senderUser.profile.photos)[0]
                                  : `https://ui-avatars.com/api/?name=${encodeURIComponent(req.senderUser.name || "User")}`
                              }
                              alt={req.senderUser.name || "User"}
                              fill
                              className="object-cover"
                              unoptimized
                            />
                          </div>
                          <div className="min-w-0">
                            <p className="font-black text-foreground text-sm truncate">{req.senderUser.name || "User"}</p>
                            <p className="text-[10px] text-muted-foreground font-bold uppercase">Wants to connect</p>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0 justify-end sm:justify-start">
                          <button
                            type="button"
                            onClick={async () => {
                              const { acceptFriendRequest } = await import("../friends/actions");
                              const r = await acceptFriendRequest(req.id);
                              if (r.success) setPendingRequests((prev) => prev.filter((x) => x.id !== req.id));
                              else showToast(r.error || "Could not accept", "error");
                            }}
                            className="px-4 py-2 bg-primary text-primary-foreground font-black text-xs rounded-xl shadow-sm focus-ring"
                          >
                            Accept
                          </button>
                          <button
                            type="button"
                            onClick={async () => {
                              const { rejectFriendRequest } = await import("../friends/actions");
                              await rejectFriendRequest(req.id);
                              setPendingRequests((prev) => prev.filter((r) => r.id !== req.id));
                            }}
                            className="px-4 py-2 bg-muted text-muted-foreground font-black text-xs rounded-xl focus-ring"
                          >
                            Ignore
                          </button>
                        </div>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-8 text-muted-foreground text-sm rounded-2xl border border-dashed border-border bg-muted/30">
                    No pending requests.
                  </p>
                )}
              </div>

              <div>
                <h3 className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-3">My friends</h3>
                {friends.length > 0 ? (
                  <ul className="space-y-2">
                    {friends.map((friend) => (
                      <li key={friend.id}>
                        <Link href={`/profile/${friend.friendId}`}>
                          <div className="surface-card p-4 flex items-center gap-3 hover:border-primary/35 transition-colors">
                            <div className="w-10 h-10 rounded-full overflow-hidden relative shrink-0 bg-muted">
                              <Image
                                src={friend.image}
                                alt={friend.name || "Friend"}
                                fill
                                className="object-cover"
                                unoptimized={friend.image?.startsWith("https://ui-avatars.com")}
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-black text-foreground text-sm truncate">{friend.name}</p>
                              <p className="text-[9px] text-muted-foreground font-bold uppercase">Connected</p>
                            </div>
                            <FaArrowRight className="text-muted-foreground text-xs shrink-0" />
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center py-10 text-muted-foreground text-sm italic rounded-2xl border border-dashed border-border">
                    No friends yet — start connecting in Discover.
                  </p>
                )}
              </div>
            </div>
          ) : activeTab === "posts" || activeTab === "reels" ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 pb-12">
              {profile.reels
                .filter((r) =>
                  activeTab === "posts" ? !r.videoUrl.match(/\.(mp4|mov|webm)$/i) : r.videoUrl.match(/\.(mp4|mov|webm)$/i)
                )
                .map((reel, idx) => (
                  <motion.div
                    key={reel.id}
                    initial={{ opacity: 0, scale: 0.96 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: idx * 0.04 }}
                    className="group relative aspect-[3/4] bg-muted rounded-3xl overflow-hidden border border-border shadow-sm"
                  >
                    {reel.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                      <Image
                        src={reel.videoUrl}
                        alt={reel.caption || "Post"}
                        fill
                        className="object-cover"
                        unoptimized={reel.videoUrl.startsWith("/")}
                      />
                    ) : (
                      <video src={reel.videoUrl} className="w-full h-full object-cover" muted playsInline />
                    )}
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/45 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                      <div className="flex items-center gap-1 text-white font-bold text-xs">
                        <FaHeart /> {reel.likesCount}
                      </div>
                    </div>
                    {!reel.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                      <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                        <FaVideo className="text-white text-[8px]" />
                      </div>
                    )}
                  </motion.div>
                ))}
              {profile.reels.filter((r) =>
                activeTab === "posts" ? !r.videoUrl.match(/\.(mp4|mov|webm)$/i) : r.videoUrl.match(/\.(mp4|mov|webm)$/i)
              ).length === 0 && (
                <div className="col-span-full py-16 flex flex-col items-center gap-4 text-center rounded-3xl border border-dashed border-border bg-muted/20 px-4">
                  <div className="text-5xl">{activeTab === "posts" ? "📸" : "🎬"}</div>
                  <div>
                    <p className="font-black text-foreground text-lg mb-1">No {activeTab} yet</p>
                    <p className="text-muted-foreground text-sm">
                      Share your first {activeTab === "posts" ? "photo or video" : "reel"} to stand out
                    </p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    type="button"
                    onClick={() => setShowPostModal(true)}
                    className="px-6 py-3 bg-primary text-primary-foreground rounded-2xl font-black text-sm shadow-md focus-ring"
                  >
                    <FaCamera className="inline mr-2" />
                    Create first {activeTab === "posts" ? "post" : "reel"}
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
