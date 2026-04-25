"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { updateProfile } from "./actions";
import { createSocialContent } from "@/lib/actions/social";
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
  FaTimes,
  FaImage,
  FaSmile
} from "react-icons/fa";
import EmojiPicker from "@/app/components/EmojiPicker";

export interface ProfileData {
  id: string;
  name: string | null;
  email: string | null;
  age: number | null;
  occupation: string | null;
  bio: string;
  photos: string[];
  matchesCount: number;
  reelsCount: number;
  storiesCount: number;
  reels: { id: string; videoUrl: string; caption: string | null; likesCount: number; createdAt: Date | string }[];
  membership: string;
  verificationStatus: string;
  networkingGoals: string[];
}

export interface FriendData {
  id: string;
  friendId: string;
  name: string | null;
  image: string;
}

export interface PendingRequestData {
  id: string;
  senderUser: {
    id: string;
    name: string | null;
    profile?: { photos: string } | null;
  };
}

// ─── Edit Profile Modal ───────────────────────────────────────────────────────
function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: ProfileData;
  onClose: () => void;
  onSaved: (updated: Partial<ProfileData>) => void;
}) {
  const [name, setName] = useState(profile.name || "");
  const [age, setAge] = useState<string>(profile.age ? String(profile.age) : "");
  const [occupation, setOccupation] = useState(profile.occupation || "");
  const [bio, setBio] = useState(profile.bio || "");
  const [photos, setPhotos] = useState<string[]>(profile.photos || []);
  const [networkingGoals, setNetworkingGoals] = useState<string[]>(profile.networkingGoals || []);
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showEmojis, setShowEmojis] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    import("@/app/networking/actions").then(m => m.getNetworkingTags().then(setAvailableTags));
  }, []);

  const toggleTag = (tag: string) => {
    setNetworkingGoals(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const { upload } = await import("@vercel/blob/client");

    setUploading(true);
    setUploadProgress(10);
    try {
      setUploadProgress(40);
      const blob = await upload(file.name, file, {
        access: "public",
        handleUploadUrl: "/api/upload/blob",
        onUploadProgress: (progressEvent) => {
          setUploadProgress(progressEvent.percentage);
        }
      });

      setPhotos((prev) => [blob.url, ...prev.slice(0, 5)]);
      setUploadProgress(100);
    } catch (err) {
      console.error("Upload failed", err);
      alert("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"));
    } finally {
      setTimeout(() => {
        setUploading(false);
        setUploadProgress(0);
      }, 500);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    const result = await updateProfile({
      name: name.trim() || undefined,
      age: age ? parseInt(age) : null,
      occupation: occupation.trim() || undefined,
      bio: bio.trim(),
      photos,
      networkingGoals,
    });
    setSaving(false);
    if (result.success) {
      onSaved({ name, age: age ? parseInt(age) : null, occupation, bio, photos, networkingGoals });
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="mt-auto w-full max-h-[92vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600 hover:bg-stone-200 transition-colors">
            <FaTimes />
          </button>
          <h2 className="text-lg font-black text-stone-900">Edit Profile</h2>
          <button
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-yellow-400 text-yellow-950 font-black rounded-full text-sm shadow-md shadow-yellow-200 disabled:opacity-60 transition-all hover:bg-yellow-300 active:scale-95"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-6">
          <div>
            <p className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Profile Photo</p>
            <div className="flex gap-3 overflow-x-auto pb-2">
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="relative flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-yellow-300 bg-yellow-50 flex flex-col items-center justify-center text-yellow-500 hover:bg-yellow-100 transition-colors"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                    <span className="text-xs font-bold">{uploadProgress}%</span>
                  </div>
                ) : (
                  <>
                    <FaCamera className="text-2xl mb-1" />
                    <span className="text-[10px] font-bold">Add Photo</span>
                  </>
                )}
              </button>
              <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handlePhotoUpload} />

              {photos.map((photo, idx) => (
                <div key={idx} className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-stone-100 ring-2 ring-transparent hover:ring-yellow-400 transition-all">
                  <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" unoptimized={photo.startsWith("/")} />
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 bg-yellow-400 text-yellow-950 text-[9px] font-black px-1.5 py-0.5 rounded-full">MAIN</div>
                  )}
                  <button
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Age</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 28"
                maxLength={2}
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Occupation</label>
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Your role"
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Bio</label>
              <button 
                onClick={() => setShowEmojis(!showEmojis)}
                className="text-stone-400 hover:text-yellow-500 transition-colors"
              >
                <FaSmile className="text-lg" />
              </button>
            </div>
            
            {showEmojis && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
                <EmojiPicker onSelect={(e) => { setBio(prev => prev + e); setShowEmojis(false); }} />
              </motion.div>
            )}

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what makes you extraordinary…"
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
            />
            <div className="flex justify-end">
              <span className="text-xs text-stone-400 font-medium">{bio.length}/300</span>
            </div>
          </div>

          <div className="space-y-3 pb-8">
            <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Professional Goals</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map(tag => {
                const isSelected = networkingGoals.includes(tag);
                return (
                  <button
                    key={tag}
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 ${
                      isSelected 
                        ? "bg-stone-900 border-stone-900 text-white shadow-lg" 
                        : "bg-white border-stone-100 text-stone-400 hover:border-stone-200"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-stone-400 font-medium italic">Signal your intent to the community.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Create Post Modal ────────────────────────────────────────────────────────
function CreatePostModal({
  onClose,
  onPosted,
}: {
  onClose: () => void;
  onPosted: () => void;
}) {
  const [caption, setCaption] = useState("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [uploading, setUploading] = useState(false);
  const [posting, setPosting] = useState(false);
  const [postType, setPostType] = useState<"image" | "video">("image");
  const [showEmojis, setShowEmojis] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (data.success) setMediaUrl(data.url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  };

  const handlePost = async () => {
    if (!mediaUrl) return;
    setPosting(true);
    const result = await createSocialContent(caption, mediaUrl, postType.toUpperCase(), postType === "video");
    setPosting(false);
    if (result.success) {
      onPosted();
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="mt-auto w-full max-h-[85vh] bg-white rounded-t-[32px] overflow-hidden flex flex-col"
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <button onClick={onClose} className="w-10 h-10 flex items-center justify-center rounded-full bg-stone-100 text-stone-600">
            <FaTimes />
          </button>
          <h2 className="text-lg font-black text-stone-900">New Post</h2>
          <button
            onClick={handlePost}
            disabled={!mediaUrl || posting}
            className="px-5 py-2 bg-yellow-400 text-yellow-950 font-black rounded-full text-sm shadow-md shadow-yellow-200 disabled:opacity-40 transition-all hover:bg-yellow-300 active:scale-95"
          >
            {posting ? "Posting…" : "Share"}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-6 py-5 space-y-5">
          <div className="flex gap-2 p-1 bg-stone-100 rounded-2xl">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setPostType(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all ${postType === t ? "bg-white text-stone-900 shadow-sm" : "text-stone-400"}`}
              >
                {t === "image" ? <FaImage /> : <FaVideo />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full aspect-square rounded-3xl overflow-hidden bg-stone-50 border-2 border-dashed border-stone-200 flex flex-col items-center justify-center cursor-pointer hover:bg-stone-100 transition-colors"
          >
            {mediaUrl ? (
              postType === "image" ? (
                <Image src={mediaUrl} alt="Preview" fill className="object-cover" unoptimized={mediaUrl.startsWith("/")} />
              ) : (
                <video src={mediaUrl} className="w-full h-full object-cover" muted loop autoPlay />
              )
            ) : uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-3 border-yellow-400 border-t-transparent rounded-full animate-spin" />
                <p className="text-stone-400 font-medium text-sm">Uploading…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-stone-400">
                {postType === "image" ? <FaImage className="text-5xl text-stone-300" /> : <FaVideo className="text-5xl text-stone-300" />}
                <p className="font-bold">Tap to select {postType}</p>
                <p className="text-xs text-stone-300">Tap to browse your files</p>
              </div>
            )}
            {mediaUrl && (
              <button
                onClick={(e) => { e.stopPropagation(); setMediaUrl(""); }}
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors"
              >
                <FaTimes className="text-xs" />
              </button>
            )}
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept={postType === "image" ? "image/*" : "video/*"}
            className="hidden"
            onChange={handleUpload}
          />

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-stone-400 uppercase tracking-widest">Caption</label>
                <button 
                  onClick={() => setShowEmojis(!showEmojis)}
                  className="text-stone-400 hover:text-yellow-500 transition-colors"
                >
                  <FaSmile className="text-lg" />
                </button>
              </div>
              
              {showEmojis && (
                <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
                  <EmojiPicker onSelect={(e) => { setCaption(prev => prev + e); setShowEmojis(false); }} />
                </motion.div>
              )}

              <textarea
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Write a caption…"
                rows={3}
                maxLength={200}
                className="w-full px-4 py-3.5 bg-stone-50 border border-stone-200 rounded-2xl text-stone-900 font-medium placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:border-transparent transition-all resize-none"
              />
              <div className="flex justify-end">
                <span className="text-xs text-stone-400 font-medium">{caption.length}/200</span>
              </div>
            </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ─── Main Profile Client Component ───────────────────────────────────────────
export default function ProfileClient({ initialProfile, initialPendingRequests, initialFriends }: { 
  initialProfile: ProfileData;
  initialPendingRequests: PendingRequestData[];
  initialFriends: FriendData[];
}) {
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

  const isVerified = profile.verificationStatus === "VERIFIED";

  return (
    <>
      <div className="min-h-screen bg-white pb-28">
        <div className="relative">
          <div className="relative h-64 overflow-hidden rounded-b-[4rem] shadow-2xl">
            <div className="absolute inset-0 bg-stone-900" />
            <motion.div 
              animate={{ x: [0, 50, 0], y: [0, 30, 0] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
              className="absolute -top-20 -left-20 w-80 h-80 bg-yellow-400/20 blur-[100px] rounded-full" 
            />
            <motion.div 
              animate={{ x: [0, -50, 0], y: [0, -30, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-20 -right-20 w-80 h-80 bg-amber-500/10 blur-[100px] rounded-full" 
            />
            
            <div className="absolute inset-x-0 top-0 p-8 flex justify-between items-center z-10">
              <h1 className="text-2xl font-black text-white tracking-tighter">ELITE PROFILE</h1>
              <Link
                href="/settings"
                className="w-12 h-12 flex items-center justify-center rounded-full bg-white/5 backdrop-blur-2xl text-white border border-white/10 hover:bg-white/10 transition-all"
              >
                <FaCog className="text-xl" />
              </Link>
            </div>
          </div>

          <div className="absolute left-1/2 -translate-x-1/2 bottom-0 translate-y-1/2 z-20">
            <div className="relative group">
              <div className="absolute inset-0 rounded-full bg-yellow-400 blur-xl opacity-20 group-hover:opacity-40 transition-opacity" />
              <div className="relative w-40 h-40 rounded-full border-[6px] border-white overflow-hidden bg-stone-100 shadow-[0_20px_50px_rgba(0,0,0,0.15)]">
                <Image
                  src={profile.photos[0] || `https://ui-avatars.com/api/?name=${profile.name}`}
                  alt={profile.name || "Profile"}
                  fill
                  className="object-cover"
                  unoptimized={profile.photos[0]?.startsWith("/")}
                  priority
                />
              </div>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => setShowEditModal(true)}
                className="absolute bottom-2 right-2 w-11 h-11 bg-yellow-400 text-stone-900 rounded-full flex items-center justify-center shadow-2xl border-4 border-white z-30"
              >
                <FaPen className="text-sm" />
              </motion.button>
            </div>
          </div>
        </div>

        <div className="mt-24 px-6">
          <div className="text-center space-y-4">
            <div>
              <div className="flex items-center justify-center gap-2 mb-1">
                <h2 className="text-4xl font-black text-stone-900 tracking-tight">
                  {profile.name || "User"}
                  {profile.age ? <span className="text-stone-400 font-light ml-2">{profile.age}</span> : ""}
                </h2>
                {isVerified && (
                  <div className="w-7 h-7 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/20">
                    <FaCheck className="text-white text-xs" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center justify-center gap-2 text-stone-400 text-sm font-black tracking-widest uppercase">
                <FaBriefcase className="text-xs" />
                <span>{profile.occupation || "Elite Member"}</span>
              </div>
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
              {profile.bio ? (
                <p className="text-stone-600 text-base font-medium leading-relaxed italic">
                  &ldquo;{profile.bio}&rdquo;
                </p>
              ) : (
                <button
                  onClick={() => setShowEditModal(true)}
                  className="text-stone-300 text-sm font-bold uppercase tracking-widest border-b border-stone-200 pb-1"
                >
                  Edit profile to add bio
                </button>
              )}
            </div>

            {profile.networkingGoals && profile.networkingGoals.length > 0 && (
              <div className="flex flex-wrap justify-center gap-2 pt-2">
                {profile.networkingGoals.map(tag => (
                  <span key={tag} className="px-4 py-2 bg-stone-50 border border-stone-100 text-stone-500 rounded-xl text-[10px] font-black uppercase tracking-widest">
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="grid grid-cols-3 gap-4 mt-10">
            {[
              { label: "Connections", value: profile.matchesCount, icon: FaHeart, bg: "bg-stone-50", color: "text-stone-900" },
              { label: "Social", value: profile.storiesCount, icon: FaFire, bg: "bg-orange-50", color: "text-orange-500" },
              { label: "Content", value: profile.reelsCount, icon: FaVideo, bg: "bg-blue-50", color: "text-blue-500" },
            ].map((stat) => (
              <div key={stat.label} className={`${stat.bg} rounded-3xl p-5 flex flex-col items-center gap-1 border border-stone-100 shadow-sm transition-transform active:scale-95`}>
                <stat.icon className={`${stat.color} text-lg mb-1`} />
                <span className="text-2xl font-black text-stone-900 tracking-tighter">{stat.value}</span>
                <span className="text-[9px] font-black text-stone-400 uppercase tracking-tighter">{stat.label}</span>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 gap-4 mt-8">
            <Link href="/referrals">
              <div className="group relative p-6 bg-stone-900 rounded-[2.5rem] overflow-hidden flex items-center gap-5 shadow-2xl transition-all hover:scale-[1.02]">
                <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-2xl group-hover:bg-yellow-400/20 transition-colors" />
                <div className="w-14 h-14 rounded-2xl bg-yellow-400 flex items-center justify-center text-2xl shadow-xl shadow-yellow-400/20">
                  🎁
                </div>
                <div>
                  <h3 className="text-white font-black text-lg tracking-tight">Expand Your Circle</h3>
                  <p className="text-stone-400 text-xs font-bold uppercase tracking-widest">Earn exclusive rewards per referral</p>
                </div>
                <div className="ml-auto w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-white border border-white/10 group-hover:bg-white/10">
                  <FaArrowRight />
                </div>
              </div>
            </Link>

            <button 
              onClick={() => setShowEditModal(true)}
              className="p-5 bg-white border border-stone-200 rounded-[2.5rem] flex items-center gap-4 hover:border-yellow-400 transition-colors"
            >
              <div className="w-12 h-12 rounded-2xl bg-stone-50 flex items-center justify-center text-stone-400">
                <FaPen />
              </div>
              <div className="text-left">
                <h3 className="font-black text-stone-800 tracking-tight">Update Details</h3>
                <p className="text-xs text-stone-400 font-bold uppercase tracking-widest">Optimize for matches</p>
              </div>
            </button>
          </div>

          {!isVerified && (
            <motion.div
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="mt-8 p-4 bg-gradient-to-r from-yellow-400 via-amber-400 to-orange-400 rounded-2xl shadow-lg shadow-yellow-200/60 flex items-center gap-4 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-white/20 flex items-center justify-center text-xl">
                <FaCrown className="text-white" />
              </div>
              <div className="flex-1">
                <h3 className="font-black text-yellow-950">Upgrade to Elite Concierge</h3>
                <p className="text-xs text-yellow-800/80 font-medium mt-0.5">Unlock private matchmaking & priority discovery</p>
              </div>
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center text-white text-sm font-bold">›</div>
            </motion.div>
          )}
        </div>

        <div className="px-5 mt-10">
          <div className="flex gap-2 mb-4 p-1 bg-white rounded-2xl shadow-sm border border-stone-100">
            {(["posts", "reels", "friends"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`flex-1 py-2.5 rounded-xl font-black text-sm transition-all ${activeTab === tab ? "bg-yellow-400 text-yellow-950 shadow-sm" : "text-stone-400 hover:text-stone-600"}`}
              >
                {tab === "posts" ? "📸 Posts" : tab === "reels" ? "🎬 Reels" : "🤝 Friends"}
              </button>
            ))}
          </div>

          <motion.button
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowPostModal(true)}
            className="w-full mb-4 py-3 flex items-center justify-center gap-2 bg-stone-900 text-white rounded-2xl font-black text-sm shadow-lg hover:bg-stone-800 transition-colors"
          >
            <FaCamera />
            New {activeTab === "posts" ? "Post" : "Reel"}
          </motion.button>

          {activeTab === "friends" ? (
            <div className="space-y-4">
              <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">Pending Requests</h3>
              {pendingRequests.length > 0 ? (
                pendingRequests.map((req) => (
                  <div key={req.id} className="p-4 bg-white rounded-2xl border border-stone-100 flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden relative">
                      <Image 
                        src={req.senderUser.profile?.photos ? JSON.parse(req.senderUser.profile.photos)[0] : `https://ui-avatars.com/api/?name=${req.senderUser.name || 'User'}`} 
                        alt={req.senderUser.name || "User"} 
                        fill 
                        className="object-cover" 
                        unoptimized
                      />
                    </div>
                    <div className="flex-1">
                      <p className="font-black text-stone-800 text-sm">{req.senderUser.name || "User"}</p>
                      <p className="text-[10px] text-stone-400 font-bold uppercase">Wants to connect</p>
                    </div>
                    <div className="flex gap-2">
                       <button 
                        onClick={async () => {
                          const { acceptFriendRequest } = await import("../friends/actions");
                          await acceptFriendRequest(req.id);
                          setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                        }}
                        className="px-3 py-1.5 bg-yellow-400 text-yellow-950 font-black text-[10px] rounded-lg shadow-sm"
                       >
                         Accept
                       </button>
                       <button 
                        onClick={async () => {
                          const { rejectFriendRequest } = await import("../friends/actions");
                          await rejectFriendRequest(req.id);
                          setPendingRequests(prev => prev.filter(r => r.id !== req.id));
                        }}
                        className="px-3 py-1.5 bg-stone-100 text-stone-400 font-black text-[10px] rounded-lg"
                       >
                         Ignore
                       </button>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-center py-5 text-stone-400 font-medium text-sm">No pending requests.</p>
              )}

              <div className="pt-4">
                <h3 className="text-xs font-black text-stone-400 uppercase tracking-widest mb-2">My Friends</h3>
                {friends.length > 0 ? (
                  <div className="space-y-3">
                    {friends.map((friend) => (
                      <Link key={friend.id} href={`/profile/${friend.friendId}`}>
                        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-100 flex items-center gap-3 transition-colors hover:border-yellow-400">
                          <div className="w-10 h-10 rounded-full overflow-hidden relative">
                            <Image 
                              src={friend.image} 
                              alt={friend.name || "Friend"} 
                              fill 
                              className="object-cover" 
                              unoptimized={friend.image?.startsWith("https://ui-avatars.com")}
                            />
                          </div>
                          <div className="flex-1">
                            <p className="font-black text-stone-800 text-xs">{friend.name}</p>
                            <p className="text-[9px] text-stone-400 font-bold uppercase">Connected</p>
                          </div>
                          <div className="w-6 h-6 rounded-full bg-white flex items-center justify-center text-stone-300">
                            <FaArrowRight className="text-[8px]" />
                          </div>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-center py-8 text-stone-300 font-medium text-sm italic">No friends yet. Start connecting!</p>
                )}
              </div>
            </div>
          ) : activeTab === "posts" || activeTab === "reels" ? (
            <div className="grid grid-cols-2 gap-3 pb-20">
              {profile.reels.filter(r => activeTab === "posts" ? !r.videoUrl.match(/\.(mp4|mov|webm)$/i) : r.videoUrl.match(/\.(mp4|mov|webm)$/i)).map((reel, idx) => (
                <motion.div
                  key={reel.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: idx * 0.05 }}
                  className="group relative aspect-[3/4] bg-stone-100 rounded-[2rem] overflow-hidden shadow-sm"
                >
                  {reel.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                    <Image src={reel.videoUrl} alt={reel.caption || "Post"} fill className="object-cover" unoptimized={reel.videoUrl.startsWith("/")} />
                  ) : (
                    <video src={reel.videoUrl} className="w-full h-full object-cover" muted />
                  )}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex items-center gap-1 text-white font-bold text-xs">
                      <FaHeart className="text-white" />
                      {reel.likesCount}
                    </div>
                  </div>
                  {!reel.videoUrl.match(/\.(jpg|jpeg|png|gif|webp)$/i) && (
                    <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
                      <FaVideo className="text-white text-[8px]" />
                    </div>
                  )}
                </motion.div>
              ))}
              {profile.reels.filter(r => activeTab === "posts" ? !r.videoUrl.match(/\.(mp4|mov|webm)$/i) : r.videoUrl.match(/\.(mp4|mov|webm)$/i)).length === 0 && (
                <div className="col-span-2 py-16 flex flex-col items-center gap-4 text-center">
                  <div className="w-20 h-20 rounded-3xl bg-stone-100 flex items-center justify-center text-4xl">
                    {activeTab === "posts" ? "📸" : "🎬"}
                  </div>
                  <div>
                    <p className="font-black text-stone-800 text-lg mb-1">No {activeTab} yet</p>
                    <p className="text-stone-400 text-sm font-medium">Share your first {activeTab === "posts" ? "photo or video" : "reel"} to stand out</p>
                  </div>
                  <motion.button
                    whileTap={{ scale: 0.96 }}
                    onClick={() => setShowPostModal(true)}
                    className="px-6 py-3 bg-yellow-400 text-yellow-950 rounded-2xl font-black text-sm shadow-md shadow-yellow-200"
                  >
                    <FaCamera className="inline mr-2" />
                    Create First {activeTab === "posts" ? "Post" : "Reel"}
                  </motion.button>
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      <AnimatePresence>
        {showEditModal && (
          <EditProfileModal
            profile={profile}
            onClose={() => setShowEditModal(false)}
            onSaved={handleProfileSaved}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showPostModal && (
          <CreatePostModal
            onClose={() => setShowPostModal(false)}
            onPosted={fetchProfile}
          />
        )}
      </AnimatePresence>
    </>
  );
}
