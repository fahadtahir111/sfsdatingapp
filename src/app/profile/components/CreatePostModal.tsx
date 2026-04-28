"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { motion } from "framer-motion";
import { FaTimes, FaVideo, FaImage, FaSmile } from "react-icons/fa";
import EmojiPicker from "@/app/components/EmojiPicker";
import { createSocialContent } from "@/lib/actions/social";
import { useToast } from "@/app/providers/ToastProvider";

export function CreatePostModal({ onClose, onPosted }: { onClose: () => void; onPosted: () => void }) {
  const { showToast } = useToast();
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

    if (file.size > 20 * 1024 * 1024) {
      showToast("File too large. Max 20MB allowed.", "error");
      return;
    }

    if (file.type.startsWith("video")) {
      const video = document.createElement("video");
      video.preload = "metadata";
      video.onloadedmetadata = () => {
        window.URL.revokeObjectURL(video.src);
        if (video.duration > 60) {
          showToast("Video too long. Max 1 minute allowed.", "error");
          return;
        }
        performPostUpload(file);
      };
      video.src = URL.createObjectURL(file);
    } else {
      performPostUpload(file);
    }
  };

  const performPostUpload = async (file: File) => {
    setUploading(true);
    try {
      const sigRes = await fetch("/api/upload/signature");
      const sigData = await sigRes.json();
      if (!sigData.success) throw new Error(sigData.error || "Failed to get upload signature");

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
      if (res.ok) {
        setMediaUrl(data.secure_url);
      } else {
        showToast(data.error?.message || "Upload failed", "error");
      }
    } catch (err) {
      console.error("Upload failed", err);
      showToast("Upload failed", "error");
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
      role="dialog"
      aria-modal="true"
    >
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 28, stiffness: 300 }}
        className="mt-auto w-full max-h-[min(85vh,900px)] md:max-w-xl md:mx-auto md:rounded-t-[32px] bg-card rounded-t-[32px] overflow-hidden flex flex-col border border-border shadow-2xl"
      >
        <div className="flex items-center justify-between px-4 sm:px-6 pt-5 pb-4 border-b border-border">
          <button
            type="button"
            onClick={onClose}
            aria-label="Close create post"
            className="w-10 h-10 flex items-center justify-center rounded-full bg-muted text-foreground focus-ring"
          >
            <FaTimes />
          </button>
          <h2 className="text-lg font-black text-foreground font-heading">New Post</h2>
          <button
            type="button"
            onClick={handlePost}
            disabled={!mediaUrl || posting}
            className="px-5 py-2 bg-primary text-primary-foreground font-black rounded-full text-sm shadow-md disabled:opacity-40 transition-all hover:opacity-95 active:scale-95 focus-ring"
          >
            {posting ? "Posting…" : "Share"}
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-4 sm:px-6 py-5 space-y-5 min-h-0">
          <div className="flex gap-2 p-1 bg-muted rounded-2xl">
            {(["image", "video"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setPostType(t)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl font-bold text-sm transition-all focus-ring ${
                  postType === t ? "bg-card text-foreground shadow-sm border border-border" : "text-muted-foreground"
                }`}
              >
                {t === "image" ? <FaImage /> : <FaVideo />}
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            ))}
          </div>

          <div
            role="button"
            tabIndex={0}
            aria-label="Select media file"
            onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && fileInputRef.current?.click()}
            onClick={() => fileInputRef.current?.click()}
            className="relative w-full aspect-square max-h-[min(70vw,420px)] mx-auto rounded-3xl overflow-hidden bg-muted border-2 border-dashed border-border flex flex-col items-center justify-center cursor-pointer hover:bg-muted/80 transition-colors"
          >
            {mediaUrl ? (
              postType === "image" ? (
                <Image src={mediaUrl} alt="Preview" fill className="object-cover" unoptimized={mediaUrl.startsWith("/")} />
              ) : (
                <video src={mediaUrl} className="w-full h-full object-cover" muted loop autoPlay playsInline />
              )
            ) : uploading ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-10 h-10 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-muted-foreground font-medium text-sm">Uploading…</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-muted-foreground">
                {postType === "image" ? (
                  <FaImage className="text-5xl text-muted-foreground/50" />
                ) : (
                  <FaVideo className="text-5xl text-muted-foreground/50" />
                )}
                <p className="font-bold">Tap to select {postType}</p>
                <p className="text-xs text-muted-foreground/70">Browse your files</p>
              </div>
            )}
            {mediaUrl && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setMediaUrl("");
                }}
                aria-label="Remove selected media"
                className="absolute top-3 right-3 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-red-500 transition-colors z-10"
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
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Caption</label>
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
                    setCaption((prev) => prev + emoji);
                    setShowEmojis(false);
                  }}
                />
              </motion.div>
            )}

            <textarea
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              placeholder="Write a caption…"
              rows={3}
              maxLength={200}
              className="w-full px-4 py-3.5 bg-muted/80 border border-border rounded-2xl text-foreground font-medium placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent transition-all resize-none"
            />
            <div className="flex justify-end">
              <span className="text-xs text-muted-foreground font-medium">{caption.length}/200</span>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
