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
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Loading interests…</p>
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 pb-24 text-center">
        {/* Glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />
        
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200 }}
          className="relative w-24 h-24 bg-primary/10 border border-primary/20 rounded-full flex items-center justify-center mb-8 shadow-2xl shadow-primary/10"
        >
          <FaLock className="text-primary text-3xl" />
        </motion.div>
        
        <h1 className="text-4xl font-black mb-4 tracking-tight uppercase">Elite Access Required</h1>
        <p className="text-muted-foreground mb-10 max-w-xs mx-auto font-medium leading-relaxed">
          See exactly who swiped right on you and match instantly with Elite Concierge.
        </p>
        <Link
          href="/premium"
          className="w-full max-w-xs py-5 bg-primary text-black font-black rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 uppercase tracking-widest text-xs"
        >
          <FaCrown /> Upgrade to Elite
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-24">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-border px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Interests</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">Members who admired your profile</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="px-4 py-2 bg-primary/10 border border-primary/20 rounded-2xl text-xs font-black text-primary flex items-center gap-2">
              <FaHeart className="text-[10px]" />
              {likes.length} New
            </div>
          </div>
        </div>
      </div>

      <div className="page-shell py-6">
        {likes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="py-20 text-center"
          >
            <div className="w-20 h-20 bg-secondary border border-border rounded-full flex items-center justify-center mx-auto mb-5">
              <FaHeart className="text-muted-foreground text-2xl" />
            </div>
            <h3 className="text-lg font-black text-foreground tracking-tight">No New Interests</h3>
            <p className="text-muted-foreground text-sm font-medium mt-2 max-w-xs mx-auto">Keep swiping to get noticed by elite members!</p>
            <Link
              href="/discover"
              className="mt-6 inline-flex items-center gap-2 px-8 py-3.5 bg-primary text-black rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-primary/20 hover:scale-105 transition-transform"
            >
              <FaFire /> Start Discovering
            </Link>
          </motion.div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {likes.map((like, i) => (
              <motion.div
                key={like.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl group cursor-pointer border border-border"
              >
                <Image
                  src={
                    like.image ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(like.name || "User")}&background=1a1a1a&color=FF1493&size=400`
                  }
                  alt={like.name || "User"}
                  fill
                  className="object-cover transition-transform duration-700 group-hover:scale-110"
                  unoptimized={!like.image || like.image.startsWith("https://ui-avatars")}
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                {/* Info */}
                <div className="absolute bottom-4 left-4 right-4">
                  <h3 className="text-white font-black text-sm truncate">{like.name || "User"}</h3>
                  <p className="text-white/50 text-[10px] font-medium mt-0.5">
                    {new Date(like.date).toLocaleDateString()}
                  </p>
                </div>

                {/* Hover action */}
                <div
                  onClick={async (e) => {
                    e.stopPropagation();
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
                  className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-center pb-16"
                >
                  <div className="bg-primary text-black px-5 py-2.5 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                    {actionLoading === like.id ? <FaSpinner className="animate-spin" /> : <><FaHeart /> Match Now</>}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Upgrade CTA */}
        <div className="mt-8 bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 rounded-3xl p-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
          <div className="relative z-10">
            <FaCrown className="text-primary text-2xl mx-auto mb-3" />
            <h4 className="text-sm font-black text-foreground mb-2">Want more visibility?</h4>
            <p className="text-[10px] text-muted-foreground font-medium mb-5">
              Upgrade to Elite to prioritize your profile in the Discover feed.
            </p>
            <Link
              href="/premium"
              className="inline-block px-8 py-3 bg-primary text-black text-[10px] font-black uppercase tracking-widest rounded-xl active:scale-95 transition-transform shadow-lg shadow-primary/20"
            >
              Go Elite
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
