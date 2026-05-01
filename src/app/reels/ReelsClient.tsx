"use client";

import { useEffect, useRef, useState } from "react";
import { FaHeart, FaComment, FaShare, FaMusic } from "react-icons/fa";
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
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center p-8">
        <FaMusic className="text-6xl text-primary mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-white mb-2">
          {feedMode === "following" ? "No Following Reels Yet" : "The Stage is Set"}
        </h2>
        <p className="text-white/60 mb-8 max-w-xs">
          {feedMode === "following"
            ? "Follow more people to build your following reel stream."
            : "Be the first to share an elite moment with the community."}
        </p>
        <button className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
          Upload Reel
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden pointer-events-auto snap-y snap-mandatory overflow-y-scroll no-scrollbar pb-safe">
      {/* Persistent Global Header */}
      <div className="fixed top-0 left-0 right-0 z-[100] flex justify-center items-center pt-10 pb-10 px-6 bg-gradient-to-b from-black/80 via-black/40 to-transparent pointer-events-none">
        <div className="flex items-center gap-8 pointer-events-auto">
          <button
            type="button"
            onClick={() => setFeedMode("discover")}
            className={`text-lg uppercase pb-1 drop-shadow-lg transition-colors ${
              feedMode === "discover"
                ? "text-white font-black tracking-widest border-b-2 border-yellow-400"
                : "text-white/50 font-bold tracking-widest hover:text-white"
            }`}
          >
            Discover
          </button>
          <button
            type="button"
            onClick={() => setFeedMode("following")}
            className={`text-lg uppercase pb-1 drop-shadow-lg transition-colors ${
              feedMode === "following"
                ? "text-white font-black tracking-widest border-b-2 border-yellow-400"
                : "text-white/50 font-bold tracking-widest hover:text-white"
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
          title: 'SFS Elite Reel',
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
    <div className="relative w-full h-[100dvh] snap-center bg-black flex items-center justify-center overflow-hidden group">

      <video
        ref={videoRef}
        src={optimizedUrl}
        className="w-full h-full object-contain"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {!isPlaying && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.5 }}
          animate={{ opacity: 1, scale: 1 }}
          className="absolute inset-0 flex items-center justify-center pointer-events-none z-10"
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
            <FaHeart className="text-yellow-400 text-8xl drop-shadow-[0_0_20px_rgba(255,215,0,0.5)]" />
          </motion.div>
        )}
      </AnimatePresence>

      <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none flex flex-col justify-end p-4 pb-20 z-20">
        <div className="flex justify-between items-end">
          <div className="flex-1 max-w-[80%] text-white pointer-events-auto drop-shadow-md">
            <Link href={`/profile/${reel.userId}`} onClick={(e) => e.stopPropagation()}>
              <h3 className="font-black text-lg mb-1 tracking-tight hover:underline cursor-pointer inline-block">{reel.user}</h3>
            </Link>
            <p className="text-sm mb-4 opacity-90 line-clamp-2">{reel.caption}</p>
            <div className="flex items-center gap-2 text-[10px] bg-white/10 rounded-full py-1.5 px-4 w-fit backdrop-blur-md border border-white/10 font-black uppercase tracking-widest">
              <FaMusic className="animate-spin-slow text-yellow-400" />
              <div className="w-24 overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-marquee">{reel.song}</span>
              </div>
            </div>
          </div>

          <div className="flex flex-col items-center gap-6 text-white pb-2 pointer-events-auto">
            {reel.canDelete && (
              <button onClick={handleDeleteReel} className="text-[10px] font-black uppercase tracking-widest text-red-300 hover:text-red-200">
                Delete
              </button>
            )}
            <button onClick={handleLike} className="flex flex-col items-center gap-1 group">
              <div className={`w-12 h-12 rounded-full backdrop-blur-sm flex items-center justify-center transition-colors ${isLiked ? 'bg-primary text-black' : 'bg-black/20 group-hover:bg-primary/20'}`}>
                <FaHeart className="text-2xl" />
              </div>
              <span className="text-xs font-semibold">{likesCount >= 1000 ? (likesCount/1000).toFixed(1)+'K' : likesCount}</span>
            </button>
            <button onClick={() => setShowComments(true)} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FaComment className="text-2xl" />
              </div>
              <span className="text-xs font-semibold">{reel.comments}</span>
            </button>
            <button onClick={handleShare} className="flex flex-col items-center gap-1 group">
              <div className="w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center group-hover:bg-yellow-400/20 transition-all border border-white/10">
                <FaShare className="text-xl" />
              </div>
              <span className="text-[10px] font-black uppercase tracking-tighter">Share</span>
            </button>
            <button onClick={onToggleMute} className="flex flex-col items-center gap-1 group pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-white/20">
                {isMuted ? <span className="text-lg">🔇</span> : <span className="text-lg animate-pulse">🔊</span>}
              </div>
            </button>
          </div>
        </div>
      </div>

      {showComments && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowComments(false)} />
          <div className="bg-[#0a0a0a] border-t border-white/10 w-full h-[60vh] rounded-t-[2.5rem] flex flex-col relative z-10 animate-slide-up shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            <div className="px-4 py-4 border-b border-white/10 text-center font-black uppercase tracking-widest text-xs text-white relative">
              Comments
              <button onClick={() => setShowComments(false)} className="absolute right-6 top-1/2 -translate-y-1/2 text-stone-500 hover:text-white transition-colors">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0 overflow-hidden relative">
                    <Image
                      src={c.userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.user || "User")}`}
                      alt={c.user}
                      fill
                      sizes="32px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-xs font-black text-white">{c.user} <span className="text-stone-500 font-bold ml-1">{c.time}</span></p>
                    <p className="text-sm text-stone-300 mt-1 font-medium">{c.text}</p>
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
                className="flex-1 bg-white/5 border border-white/10 px-4 py-3 rounded-2xl text-sm text-white outline-none focus:ring-1 focus:ring-primary/50 transition-all placeholder:text-stone-600"
              />
              <button 
                onClick={handlePostComment}
                disabled={!commentText.trim()}
                className="font-bold text-primary disabled:opacity-50"
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
