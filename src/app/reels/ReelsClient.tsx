"use client";

import { useEffect, useRef, useState } from "react";
import { FaHeart, FaComment, FaShare, FaMusic, FaVolumeMute, FaVolumeUp } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import { useRealTime } from "@/lib/hooks/useRealTime";
import { getReels, postReelComment, getReelComments, deleteReel, deleteReelComment } from "./actions";
import { toggleLike } from "@/lib/actions/social";
import Link from "next/link";
import { useToast } from "@/app/providers/ToastProvider";
import Image from "next/image";

interface ReelData {
  id: string;
  url: string;
  userId: string;
  canDelete?: boolean;
  user: string;
  userAvatar?: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

export default function ReelsClient({ initialReels }: { initialReels: ReelData[] }) {
  const [feedMode, setFeedMode] = useState<"discover" | "following">("discover");
  const { data: reels, loading } = useRealTime(() => getReels(feedMode), 15000, [feedMode]); 
  const { showToast } = useToast();

  const [isMuted, setIsMuted] = useState(true);

  useEffect(() => {
    const saved = localStorage.getItem("reels_muted");
    if (saved !== null) setIsMuted(saved === "true");
  }, []);

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem("reels_muted", String(newVal));
  };

  const displayReels = reels ?? (feedMode === "discover" ? initialReels : []);

  if (displayReels.length === 0 && !loading) {
    return (
      <div className="absolute inset-0 bg-background flex flex-col items-center justify-center text-center p-8">
        <FaMusic className="text-6xl text-primary mb-6 animate-pulse" />
        <h2 className="text-3xl font-heading text-foreground mb-2">
          {feedMode === "following" ? "No Following Reels Yet" : "The Stage is Set"}
        </h2>
        <p className="text-muted-foreground mb-8 max-w-xs font-medium">
          {feedMode === "following"
            ? "Follow more people to build your following reel stream."
            : "Be the first to share an elite moment with the community."}
        </p>
        <button className="btn-aether">
          Upload Reel
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-background overflow-hidden pointer-events-auto snap-y snap-mandatory overflow-y-scroll no-scrollbar pb-safe">
      {/* Persistent Global Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-center pt-10 pb-10 px-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <button
            type="button"
            onClick={() => setFeedMode("discover")}
            className={`text-lg uppercase pb-1 drop-shadow-lg transition-all ${
              feedMode === "discover"
                ? "text-primary font-black tracking-[0.2em] border-b-2 border-primary"
                : "text-white/50 font-bold tracking-[0.2em] hover:text-white"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            onClick={() => setFeedMode("following")}
            className={`text-lg uppercase pb-1 drop-shadow-lg transition-all ${
              feedMode === "following"
                ? "text-primary font-black tracking-[0.2em] border-b-2 border-primary"
                : "text-white/50 font-bold tracking-[0.2em] hover:text-white"
            }`}
          >
            Following
          </button>
        </div>
      </div>

      <div className="max-w-[450px] mx-auto bg-black min-h-screen">
        {displayReels.map((reel: ReelData) => (
          <Reel key={reel.id} reel={reel} isMuted={isMuted} onToggleMute={toggleMute} onDeleted={() => showToast("Reel deleted", "success")} />
        ))}
      </div>
    </div>
  );
}

const Reel = ({ reel, isMuted, onToggleMute, onDeleted }: { reel: ReelData, isMuted: boolean, onToggleMute: () => void, onDeleted: () => void }) => {
  // If the URL is a Cloudinary URL, we can ensure it's using auto quality and format
  const optimizedUrl = reel.url.includes('cloudinary.com') 
    ? reel.url.replace('/upload/', '/upload/f_auto,q_auto/') 
    : reel.url;

  const videoRef = useRef<HTMLVideoElement>(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; user: string; userId: string; userAvatar?: string; text: string; time: string; canDelete?: boolean }>>([]);
  const [showHeart, setShowHeart] = useState(false);
  const lastTap = useRef<number>(0);
  const [isDeleted, setIsDeleted] = useState(false);
  const { showToast } = useToast();

  useEffect(() => {
    if (showComments) {
      getReelComments(reel.id).then(setComments);
    }
  }, [showComments, reel.id]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          videoRef.current?.play().catch(() => {});
          setIsPlaying(true);
        } else {
          videoRef.current?.pause();
          setIsPlaying(false);
        }
      },
      { threshold: 0.6 }
    );

    if (videoRef.current) {
      observer.observe(videoRef.current);
    }

    return () => observer.disconnect();
  }, []);

  const handleLike = async () => {
    try {
      const result = await toggleLike(reel.id, "REEL");
      if (result && 'liked' in result) {
        setIsLiked(!!result.liked);
        setLikesCount((prev: number) => result.liked ? prev + 1 : prev - 1);
      }
    } catch (e) {
      console.error("Like failed", e);
      showToast("Failed to like reel", "error");
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await postReelComment(reel.id, commentText);
      setComments([newComment, ...comments]);
      setCommentText("");
      showToast("Comment posted", "success");
    } catch (e) {
      console.error("Comment failed", e);
      showToast("Failed to post comment", "error");
    }
  };

  const togglePlay = () => {
    const now = Date.now();
    const DOUBLE_TAP_DELAY = 300;

    if (now - lastTap.current < DOUBLE_TAP_DELAY) {
      // Double tap detected
      if (!isLiked) {
        handleLike();
      }
      setShowHeart(true);
      setTimeout(() => setShowHeart(false), 1000);
    } else {
      // Single tap
      if (isPlaying) {
        videoRef.current?.pause();
        setIsPlaying(false);
      } else {
        videoRef.current?.play().catch(() => {});
        setIsPlaying(true);
      }
    }
    lastTap.current = now;
  };

  const handleShare = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: 'Aether Elite Reel',
          text: `Check out this reel by ${reel.user}`,
          url: window.location.href,
        });
      } else {
        await navigator.clipboard.writeText(window.location.href);
        showToast("Link copied to clipboard", "success");
      }
    } catch (e) {
      console.log("Error sharing", e);
    }
  };

  const handleDeleteReel = async () => {
    if (!reel.canDelete) return;
    if (!window.confirm("Delete this reel?")) return;
    const res = await deleteReel(reel.id);
    if (res.success) {
      setIsDeleted(true);
      onDeleted();
    } else {
      showToast(res.error || "Failed to delete reel", "error");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await deleteReelComment(commentId);
    if (res.success) {
      setComments((prev) => prev.filter((c) => c.id !== commentId));
      showToast("Comment deleted", "success");
      return;
    }
    showToast(res.error || "Failed to delete comment", "error");
  };

  if (isDeleted) return null;

  return (
    <div className="relative w-full h-[100dvh] snap-center bg-background flex items-center justify-center overflow-hidden group">

      {/* Blurred Background */}
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
        <video
          src={optimizedUrl}
          className="w-full h-full object-cover blur-3xl opacity-20 scale-110"
          loop
          playsInline
          muted
          autoPlay
        />
        <div className="absolute inset-0 bg-background/40" />
      </div>

      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.7}
        onDragEnd={(e, info) => {
          if (info.offset.x > 100) {
            // Swiped right - trigger match
            showToast(`Swiped Right on ${reel.user}! ✨`, "success");
            if (!isLiked) handleLike();
          } else if (info.offset.x < -100) {
            // Swiped left - pass
            showToast(`Passed on ${reel.user}`, "info");
          }
        }}
        className="absolute inset-0 z-10"
      >
        <video
          ref={videoRef}
          src={optimizedUrl}
          className="w-full h-full object-contain pointer-events-auto"
          loop
          playsInline
          muted={isMuted}
          onClick={togglePlay}
        />
      </motion.div>

      {!isPlaying && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-20"
        >
          <div className="w-16 h-16 bg-black/40 backdrop-blur-md rounded-full flex items-center justify-center border border-white/20">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
          </div>
        </motion.div>
      )}

      {/* Double Tap Heart Animation */}
      <AnimatePresence>
        {showHeart && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1.5, opacity: 1 }}
            exit={{ scale: 2, opacity: 0 }}
            className="absolute inset-0 flex items-center justify-center z-50 pointer-events-none"
          >
            <FaHeart className="text-primary text-8xl shadow-shadow-glow" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none flex flex-col justify-end p-4 pb-20 z-30">
        <div className="flex justify-between items-end">
          {/* Bottom Left: Info */}
          <div className="flex-1 max-w-[75%] text-white pointer-events-auto drop-shadow-md">
            <Link href={`/profile/${reel.userId}`} onClick={(e) => e.stopPropagation()}>
              <h3 className="font-heading text-lg mb-1 tracking-tight hover:underline cursor-pointer inline-block drop-shadow-[0_2px_4px_rgba(0,0,0,0.8)]">{reel.user}</h3>
            </Link>
            <p className="text-sm mb-4 text-white/90 font-medium line-clamp-3 drop-shadow-[0_1px_2px_rgba(0,0,0,0.8)] leading-relaxed">{reel.caption}</p>
            <div className="flex items-center gap-2 text-[10px] bg-black/40 rounded-full py-1.5 px-4 w-fit backdrop-blur-md border border-white/10 font-black uppercase tracking-[0.2em] shadow-lg">
              <FaMusic className="animate-spin-slow text-primary" />
              <div className="w-32 overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-marquee">{reel.song}</span>
              </div>
            </div>
            
            {/* Swipe hint */}
            <div className="mt-4 flex items-center gap-2 text-primary/80 text-[10px] font-black uppercase tracking-widest animate-pulse drop-shadow-md bg-black/40 w-fit px-4 py-1.5 rounded-full backdrop-blur-sm border border-primary/20">
              <span>👉 Swipe right to Match</span>
            </div>
          </div>

          {/* Bottom Right: Action Bar */}
          <div className="flex flex-col items-center gap-5 text-white pb-2 pointer-events-auto">
            {/* Avatar with Match Button */}
            <div className="relative group mb-2">
              <Link href={`/profile/${reel.userId}`}>
                <div className="w-12 h-12 rounded-full border-2 border-white/20 overflow-hidden bg-muted shadow-lg transition-transform hover:scale-105">
                  <Image 
                    src={reel.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(reel.user)}`}
                    alt={reel.user}
                    fill
                    sizes="48px"
                    className="object-cover"
                  />
                </div>
              </Link>
              <button 
                className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-7 h-7 bg-primary text-black rounded-full flex items-center justify-center border-[2.5px] border-background hover:scale-110 transition-transform shadow-shadow-glow"
                onClick={(e) => {
                  e.stopPropagation();
                  showToast("Matched! ✨", "success");
                  if (!isLiked) handleLike();
                }}
              >
                <FaHeart className="text-[12px]" />
              </button>
            </div>

            <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center transition-all drop-shadow-lg group-hover:scale-110 ${isLiked ? 'text-primary' : 'text-white hover:text-white/80'}`}>
                <FaHeart className="text-[32px]" />
              </div>
              <span className="text-xs font-bold drop-shadow-md">{likesCount >= 1000 ? (likesCount/1000).toFixed(1)+'K' : likesCount}</span>
            </button>

            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all group-hover:scale-110 drop-shadow-lg">
                <FaComment className="text-[32px]" />
              </div>
              <span className="text-xs font-bold drop-shadow-md">{reel.comments}</span>
            </button>

            <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all group-hover:scale-110 drop-shadow-lg">
                <FaShare className="text-[28px]" />
              </div>
              <span className="text-xs font-bold drop-shadow-md">Share</span>
            </button>

            <button onClick={(e) => { e.stopPropagation(); onToggleMute(); }} className="flex flex-col items-center gap-1 group">
              <div className="w-10 h-10 rounded-full flex items-center justify-center text-white hover:text-white/80 transition-all group-hover:scale-110 drop-shadow-lg">
                {isMuted ? <FaVolumeMute className="text-[24px]" /> : <FaVolumeUp className="text-[24px]" />}
              </div>
            </button>

            {reel.canDelete && (
              <button onClick={handleDeleteReel} className="text-[10px] mt-2 font-black uppercase tracking-widest text-red-400 hover:text-red-300 drop-shadow-md">
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {showComments && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowComments(false)} />
          <div className="surface-card bg-card w-full h-[60vh] rounded-t-[2.5rem] flex flex-col relative z-10 animate-slide-up shadow-lg">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1 bg-white/10 rounded-full"></div>
            </div>
            <div className="px-4 py-4 border-b border-border text-center sub-heading text-xs text-white relative">
              Comments
              <button onClick={() => setShowComments(false)} className="absolute right-6 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-muted flex-shrink-0 overflow-hidden relative border border-white/10">
                    <Image
                      src={c.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user || "User")}`}
                      alt={c.user}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white">{c.user} <span className="text-muted-foreground font-bold ml-1">{c.time}</span></p>
                    <p className="text-sm text-muted-foreground mt-1 font-medium leading-relaxed">{c.text}</p>
                  </div>
                  {c.canDelete && (
                    <button
                      type="button"
                      onClick={() => handleDeleteComment(c.id)}
                      className="text-[11px] font-bold text-red-500 hover:text-red-600"
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
              {comments.length === 0 && (
                <div className="text-center py-10 text-muted-foreground font-medium">No comments yet. Start the conversation!</div>
              )}
            </div>

            <div className="p-4 border-t border-border flex gap-3 items-center">
              <input 
                type="text" 
                value={commentText}
                onChange={e => setCommentText(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handlePostComment()}
                placeholder="Add an elite comment..."
                className="flex-1 bg-white/5 border border-border px-4 py-3 rounded-2xl text-sm text-white outline-none focus:ring-1 focus:ring-primary/30 transition-all placeholder:text-muted-foreground/40"
              />
              <button 
                onClick={handlePostComment}
                disabled={!commentText.trim()}
                className="font-black uppercase tracking-widest text-[10px] text-primary disabled:opacity-50"
              >
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

