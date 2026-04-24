"use client";

import { useEffect, useRef, useState } from "react";
import { FaHeart, FaComment, FaShare, FaMusic } from "react-icons/fa";

import { useRealTime } from "@/lib/hooks/useRealTime";
import { getReels, postReelComment, getReelComments } from "./actions";
import { toggleLike } from "@/lib/actions/social";

export default function ReelsPage() {
  const { data: reels, loading } = useRealTime(getReels, 15000); // Pull fresh reels every 15s

  const [isMuted, setIsMuted] = useState(true);

  // Load mute preference
  useEffect(() => {
    const saved = localStorage.getItem("reels_muted");
    if (saved !== null) setIsMuted(saved === "true");
  }, []);

  const toggleMute = () => {
    const newVal = !isMuted;
    setIsMuted(newVal);
    localStorage.setItem("reels_muted", String(newVal));
  };

  if (loading && !reels) {
    return (
      <div className="absolute inset-0 bg-black flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (reels?.length === 0) {
    return (
      <div className="absolute inset-0 bg-black flex flex-col items-center justify-center text-center p-8">
        <FaMusic className="text-6xl text-primary mb-6 animate-pulse" />
        <h2 className="text-3xl font-black text-white mb-2">The Stage is Set</h2>
        <p className="text-white/60 mb-8 max-w-xs">Be the first to share an elite moment with the community.</p>
        <button className="px-8 py-4 bg-primary text-black font-black uppercase tracking-widest rounded-2xl shadow-lg shadow-primary/20">
          Upload Reel
        </button>
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-black overflow-hidden pointer-events-auto snap-y snap-mandatory overflow-y-scroll no-scrollbar pb-safe">
      <div className="max-w-[450px] mx-auto bg-black min-h-screen">
        {reels?.map((reel) => (
          <Reel key={reel.id} reel={reel} isMuted={isMuted} onToggleMute={toggleMute} />
        ))}
      </div>
    </div>
  );
}

interface ReelData {
  id: string;
  url: string;
  user: string;
  caption: string;
  song: string;
  likes: number;
  comments: number;
  isLiked: boolean;
}

const Reel = ({ reel, isMuted, onToggleMute }: { reel: ReelData, isMuted: boolean, onToggleMute: () => void }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLiked, setIsLiked] = useState(reel.isLiked);
  const [likesCount, setLikesCount] = useState(reel.likes);
  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [comments, setComments] = useState<Array<{ id: string; user: string; text: string; time: string }>>([]);

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
    }
  };

  const handlePostComment = async () => {
    if (!commentText.trim()) return;
    try {
      const newComment = await postReelComment(reel.id, commentText);
      setComments([newComment, ...comments]);
      setCommentText("");
    } catch (e) {
      console.error("Comment failed", e);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      videoRef.current?.pause();
      setIsPlaying(false);
    } else {
      videoRef.current?.play().catch(() => {});
      setIsPlaying(true);
    }
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
        alert("Link copied to clipboard!");
      }
    } catch (e) {
      console.log("Error sharing", e);
    }
  };

  return (
    <div className="relative w-full h-[100dvh] snap-center bg-black flex items-center justify-center overflow-hidden">
      {/* Video Element */}
      <video
        ref={videoRef}
        src={reel.url}
        className="w-full h-full object-cover"
        loop
        playsInline
        muted={isMuted}
        onClick={togglePlay}
      />

      {/* Play/Pause Overlay */}
      {!isPlaying && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
          <div className="w-16 h-16 bg-black/40 rounded-full flex items-center justify-center">
            <div className="w-0 h-0 border-t-8 border-t-transparent border-l-[14px] border-l-white border-b-8 border-b-transparent ml-1" />
          </div>
        </div>
      )}

      {/* UI Overlay */}
      <div className="absolute inset-x-0 bottom-0 top-0 pointer-events-none flex flex-col justify-end p-4 pb-20 z-20">
        <div className="flex justify-between items-end">
          
          {/* Left: Info */}
          <div className="flex-1 max-w-[80%] text-white pointer-events-auto">
            <h3 className="font-bold text-lg mb-2">{reel.user}</h3>
            <p className="text-sm mb-3 opacity-90">{reel.caption}</p>
            <div className="flex items-center gap-2 text-sm bg-black/20 rounded-full py-1 px-3 w-fit backdrop-blur-sm">
              <FaMusic className="text-xs animate-spin-slow" />
              <div className="w-32 overflow-hidden whitespace-nowrap">
                <span className="inline-block animate-marquee">{reel.song}</span>
              </div>
            </div>
          </div>

          {/* Right: Actions */}
          <div className="flex flex-col items-center gap-6 text-white pb-2 pointer-events-auto">
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
              <div className="w-12 h-12 rounded-full bg-black/20 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                <FaShare className="text-2xl" />
              </div>
              <span className="text-xs font-semibold">Share</span>
            </button>
            <button onClick={onToggleMute} className="flex flex-col items-center gap-1 group pointer-events-auto">
              <div className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center group-hover:bg-primary/20 transition-colors border border-white/20">
                {isMuted ? <span className="text-lg">🔇</span> : <span className="text-lg animate-pulse">🔊</span>}
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Comments Modal Bottom Sheet */}
      {showComments && (
        <div className="absolute inset-0 z-50 flex flex-col justify-end pointer-events-auto">
          <div className="absolute inset-0 bg-black/50" onClick={() => setShowComments(false)} />
          <div className="bg-white w-full h-[60vh] rounded-t-3xl flex flex-col relative z-10 animate-slide-up">
            <div className="flex justify-center pt-3 pb-1">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full"></div>
            </div>
            <div className="px-4 py-3 border-b border-border text-center font-bold text-foreground relative">
              Comments
              <button onClick={() => setShowComments(false)} className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground p-2">✕</button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {comments.map(c => (
                <div key={c.id} className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-secondary flex-shrink-0"></div>
                  <div>
                    <p className="text-xs font-bold text-foreground">{c.user} <span className="text-muted-foreground font-medium ml-1">{c.time}</span></p>
                    <p className="text-sm text-foreground mt-0.5">{c.text}</p>
                  </div>
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
                placeholder="Add a comment..."
                className="flex-1 bg-secondary px-4 py-2.5 rounded-full text-sm outline-none focus:ring-2 focus:ring-primary"
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
