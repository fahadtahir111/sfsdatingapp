"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaCamera, FaTimes, FaSmile } from "react-icons/fa";
import EmojiPicker from "@/app/components/EmojiPicker";
import { updateProfile } from "../actions";
import { useToast } from "@/app/providers/ToastProvider";
import type { ProfileData } from "../types";

export function EditProfileModal({
  profile,
  onClose,
  onSaved,
}: {
  profile: ProfileData;
  onClose: () => void;
  onSaved: (updated: Partial<ProfileData>) => void;
}) {
  const { showToast } = useToast();
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
    import("@/app/networking/actions").then((m) => m.getNetworkingTags().then(setAvailableTags));
  }, []);

  const toggleTag = (tag: string) => {
    setNetworkingGoals((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]));
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 20 * 1024 * 1024) {
      showToast("Image too large. Max 20MB allowed.", "error");
      return;
    }

    setUploading(true);
    setUploadProgress(10);
    try {
      setUploadProgress(20);
      const sigRes = await fetch("/api/upload/signature");
      const sigData = await sigRes.json();
      if (!sigData.success) throw new Error(sigData.error || "Failed to get upload signature");

      setUploadProgress(40);
      const formData = new FormData();
      formData.append("file", file);
      formData.append("api_key", sigData.apiKey);
      formData.append("timestamp", sigData.timestamp);
      formData.append("signature", sigData.signature);
      formData.append("folder", sigData.folder);

      const res = await fetch(`https://api.cloudinary.com/v1_1/${sigData.cloudName}/auto/upload`, {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error?.message || "Upload failed");

      setPhotos((prev) => [data.secure_url, ...prev.slice(0, 5)]);
      setUploadProgress(100);
    } catch (err) {
      console.error("Upload failed", err);
      showToast("Upload failed: " + (err instanceof Error ? err.message : "Unknown error"), "error");
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
      age: age ? parseInt(age, 10) : null,
      occupation: occupation.trim() || undefined,
      bio: bio.trim(),
      photos,
      networkingGoals,
    });
    setSaving(false);
    if (result.success) {
      onSaved({
        name,
        age: age ? parseInt(age, 10) : null,
        occupation,
        bio,
        photos,
        networkingGoals,
      });
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
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-title"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="mt-auto w-full max-h-[min(92vh,860px)] md:max-w-xl md:mx-auto md:rounded-t-[32px] bg-card rounded-t-[32px] overflow-hidden flex flex-col border border-border shadow-2xl"
      >
        <div className="sticky top-0 z-10 flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-border bg-card/95 backdrop-blur-md">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors focus-ring"
          >
            <FaTimes />
          </button>
          <h2 id="edit-profile-title" className="text-lg font-black text-foreground font-heading">
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={handleSave}
            disabled={saving}
            className="px-5 py-2 bg-primary text-primary-foreground font-black rounded-full text-sm shadow-md disabled:opacity-60 transition-all hover:opacity-95 active:scale-95 focus-ring"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 space-y-6 min-h-0 overscroll-contain">
          <div>
            <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-3">Profile Photo</p>
            <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                aria-label="Upload profile photo"
                className="relative flex-shrink-0 w-24 h-24 rounded-2xl border-2 border-dashed border-primary/40 bg-accent/50 flex flex-col items-center justify-center text-primary hover:bg-accent transition-colors focus-ring"
              >
                {uploading ? (
                  <div className="flex flex-col items-center gap-1">
                    <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
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
                <div
                  key={idx}
                  className="relative flex-shrink-0 w-24 h-24 rounded-2xl overflow-hidden bg-muted ring-2 ring-transparent hover:ring-primary/50 transition-all"
                >
                  <Image src={photo} alt={`Photo ${idx + 1}`} fill className="object-cover" unoptimized={photo.startsWith("/")} />
                  {idx === 0 && (
                    <div className="absolute top-1 left-1 bg-primary text-primary-foreground text-[9px] font-black px-1.5 py-0.5 rounded-full">
                      MAIN
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== idx))}
                    aria-label={`Remove photo ${idx + 1}`}
                    className="absolute top-1 right-1 w-5 h-5 bg-black/60 text-white rounded-full flex items-center justify-center text-[10px] hover:bg-red-500 transition-colors"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Display Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3.5 bg-muted/80 border border-border rounded-2xl text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Age</label>
              <input
                value={age}
                onChange={(e) => setAge(e.target.value.replace(/[^0-9]/g, ""))}
                placeholder="e.g. 28"
                maxLength={2}
                inputMode="numeric"
                className="w-full px-4 py-3.5 bg-muted/80 border border-border rounded-2xl text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Occupation</label>
              <input
                value={occupation}
                onChange={(e) => setOccupation(e.target.value)}
                placeholder="Your role"
                className="w-full px-4 py-3.5 bg-muted/80 border border-border rounded-2xl text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bio</label>
              <button
                type="button"
                onClick={() => setShowEmojis(!showEmojis)}
                aria-label="Toggle emoji picker"
                className="text-muted-foreground hover:text-primary transition-colors focus-ring rounded-lg p-1"
              >
                <FaSmile className="text-lg" />
              </button>
            </div>

            {showEmojis && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-2">
                <EmojiPicker
                  onSelect={(emoji) => {
                    setBio((prev) => prev + emoji);
                    setShowEmojis(false);
                  }}
                />
              </motion.div>
            )}

            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell people what makes you extraordinary…"
              rows={4}
              maxLength={300}
              className="w-full px-4 py-3.5 bg-muted/80 border border-border rounded-2xl text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground font-medium">{bio.length}/300</span>
            </div>
          </div>

          <div className="space-y-3 pb-8">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Professional Goals</label>
            <div className="flex flex-wrap gap-2">
              {availableTags.map((tag) => {
                const isSelected = networkingGoals.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => toggleTag(tag)}
                    className={`px-4 py-2 rounded-xl text-xs font-black transition-all border-2 focus-ring ${
                      isSelected
                        ? "bg-foreground border-foreground text-background shadow-lg"
                        : "bg-card border-border text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {tag}
                  </button>
                );
              })}
            </div>
            <p className="text-[10px] text-muted-foreground font-medium italic">Signal your intent to the community.</p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
