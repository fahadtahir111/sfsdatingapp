"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaHeart, FaLock, FaSpinner, FaFire } from "react-icons/fa";
import { fetchWhoLikedMe } from "./actions";
import { submitSwipe } from "../discover/actions";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useToast } from "@/app/providers/ToastProvider";

interface LikeData {
  id: string;
  name: string | null;
  image: string | null | undefined;
  action: string;
  date: Date | string;
}

export default function LikesPage() {
  const [likes, setLikes] = useState<LikeData[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLocked, setIsLocked] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  useEffect(() => {
    fetchWhoLikedMe().then((res) => {
      if (res.success && res.data) {
        setLikes(res.data);
      } else if (res.locked) {
        setIsLocked(true);
      }
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-6 relative overflow-hidden">
        <div className="aether-mesh absolute inset-0 opacity-20" />
        <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-2xl animate-spin shadow-shadow-glow" />
        <p className="sub-heading text-[10px] text-primary/60 lowercase tracking-[0.3em]">synchronizing aether network…</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 pb-32 text-center relative overflow-hidden">
        <div className="aether-mesh absolute inset-0 opacity-30" />
        
        <motion.div
          initial={{ scale: 0, rotate: -15 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="relative w-28 h-28 bg-white/5 border border-primary/20 rounded-[32px] flex items-center justify-center mb-10 shadow-shadow-glow group overflow-hidden"
        >
          <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-all duration-700" />
          <FaLock className="text-primary text-4xl relative z-10 shadow-shadow-glow" />
        </motion.div>
        
        <h1 className="text-5xl font-heading text-white tracking-tight leading-none mb-4">Elite Protocol</h1>
        <p className="sub-heading text-[11px] text-white/40 lowercase mb-12 max-w-[280px] mx-auto leading-relaxed tracking-wide">
          unveil who admired your profile within the aether. matching protocol requires elite authentication.
        </p>
        <Link
          href="/store"
          className="btn-aether w-full max-w-xs py-5 flex items-center justify-center gap-3"
        >
          <FaCrown className="text-sm" /> 
          <span className="sub-heading lowercase">Upgrade to Elite</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-28 relative overflow-hidden">
      <div className="aether-mesh absolute inset-0 opacity-20 pointer-events-none" />

      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/80 backdrop-blur-3xl border-b border-white/5 px-6 py-6">
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-4xl font-heading text-white tracking-tight">Interests</h1>
            <p className="sub-heading text-[10px] text-primary/60 lowercase mt-1 tracking-widest">admirers in your network</p>
          </div>
          <div className="flex items-center gap-2 mb-1">
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-xl sub-heading text-[9px] text-primary flex items-center gap-2 lowercase shadow-shadow-glow">
              <FaHeart className="text-[9px]" />
              {likes.length} new
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell py-8 relative z-10">
        {likes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-24 text-center bg-white/5 rounded-[40px] border border-white/5 shadow-2xl group overflow-hidden relative"
          >
            <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
            <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mx-auto mb-6 relative z-10 group-hover:scale-110 transition-transform duration-700">
              <FaHeart className="text-white/20 text-4xl" />
            </div>
            <h3 className="text-2xl font-heading text-white tracking-tight relative z-10">Silence in the Aether</h3>
            <p className="sub-heading text-[11px] text-white/30 lowercase mt-2 max-w-[200px] mx-auto leading-relaxed relative z-10">keep discoveries active to ignite new interests.</p>
            <Link
              href="/discover"
              className="mt-8 inline-flex items-center gap-3 px-10 py-4 bg-primary text-black rounded-2xl sub-heading text-[10px] lowercase shadow-shadow-glow hover:scale-105 transition-all relative z-10"
            >
              <FaFire className="text-xs" /> start discovering
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-5 px-1">
            {likes.map((like, i) => (
              <motion.div
                key={like.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={async () => {
                  setActionLoading(like.id);
                  try {
                    const res = await submitSwipe(like.id, "LIKE");
                    if (res.matched) {
                      router.push(`/chat/${res.conversationId}`);
                    } else {
                      setLikes((prev) => prev.filter((l) => l.id !== like.id));
                      showToast("Liked back!", "success");
                    }
                  } catch {
                    showToast("Failed to match", "error");
                  } finally {
                    setActionLoading(null);
                  }
                }}
                className="relative aspect-[3/4.5] rounded-[32px] overflow-hidden shadow-2xl group cursor-pointer border border-white/10"
              >
                <Image
                  src={
                    like.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(like.name || "User")}&background=c4ff00&color=000&size=400`
                  }
                  alt={like.name || "User"}
                  fill
                  className="object-cover transition-transform duration-1000 group-hover:scale-110 grayscale group-hover:grayscale-0"
                  unoptimized={!like.image || like.image.startsWith("https://ui-avatars")}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-80" />

                {/* Info */}
                <div className="absolute bottom-5 left-5 right-5 z-10">
                  <h3 className="text-white font-heading text-base leading-tight truncate group-hover:text-primary transition-colors">{like.name || "User"}</h3>
                  <p className="sub-heading text-[8px] text-white/40 lowercase mt-1.5 tracking-widest">
                    {new Date(like.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Hover action overlay */}
                <div className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-all duration-500 backdrop-blur-[2px] flex items-center justify-center">
                  <div className="bg-primary text-black px-6 py-3 rounded-full sub-heading text-[9px] lowercase shadow-shadow-glow flex items-center gap-2 group-hover:scale-110 transition-transform">
                    {actionLoading === like.id ? <FaSpinner className="animate-spin" /> : <><FaHeart className="text-[8px]" /> match now</>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="mt-10 bg-white/5 backdrop-blur-xl border border-white/5 rounded-[40px] p-8 text-center relative overflow-hidden group">
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
          <div className="relative z-10">
            <FaCrown className="text-primary text-3xl mx-auto mb-4 shadow-shadow-glow group-hover:scale-110 transition-transform duration-700" />
            <h4 className="text-2xl font-heading text-white tracking-tight mb-2">Maximum Visibility</h4>
            <p className="sub-heading text-[10px] text-white/30 lowercase mb-8 max-w-[200px] mx-auto leading-relaxed">
              upgrade to elite to prioritize your profile within the discover protocol.
            </p>
            <Link
              href="/store"
              className="inline-block px-10 py-4 bg-primary text-black sub-heading text-[10px] lowercase rounded-[18px] hover:scale-105 active:scale-95 transition-all shadow-shadow-glow"
            >
              go elite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
