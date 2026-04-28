"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaHeart, FaLock, FaSpinner } from "react-icons/fa";
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
    fetchWhoLikedMe().then(res => {
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
      <div className="min-h-screen bg-white flex items-center justify-center p-6 pb-24">
        <div className="w-10 h-10 border-4 border-stone-200 border-t-stone-900 rounded-full animate-spin" />
      </div>
    );
  }

  if (isLocked) {
    return (
      <div className="min-h-screen bg-stone-900 text-white flex flex-col items-center justify-center p-8 pb-24 text-center">
        <div className="w-20 h-20 bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 border border-primary/30">
          <FaLock className="text-3xl" />
        </div>
        <h1 className="text-3xl font-black mb-4">Elite Access Required</h1>
        <p className="text-stone-400 mb-8 max-w-xs mx-auto">
          See exactly who swiped right on you and match instantly with Elite Concierge.
        </p>
        <Link 
          href="/premium"
          className="w-full max-w-xs py-4 bg-primary text-primary-foreground font-black rounded-2xl shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform flex items-center justify-center gap-3"
        >
          <FaCrown /> Upgrade to Elite
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#f8f7f5] p-6 pb-24">
      <header className="mb-8 flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-black text-stone-900 tracking-tight mb-1">Interest</h1>
          <p className="text-stone-500 font-medium text-xs">Members who admired your profile.</p>
        </div>
        <div className="bg-stone-900 text-white px-4 py-2 rounded-2xl text-xs font-black flex items-center gap-2">
          {likes.length} New
        </div>
      </header>

      {likes.length === 0 ? (
        <div className="bg-white rounded-[2rem] p-12 text-center border border-dashed border-stone-200 flex flex-col items-center">
          <div className="w-16 h-16 bg-stone-50 rounded-full flex items-center justify-center text-stone-300 mb-4">
             <FaHeart className="text-2xl" />
          </div>
          <p className="text-sm text-stone-400 font-bold uppercase tracking-widest">No New Interests</p>
          <p className="text-xs text-stone-400 mt-2">Keep swiping to get noticed!</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {likes.map((like, i) => (
            <motion.div 
              key={like.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="relative aspect-[3/4] rounded-3xl overflow-hidden shadow-xl shadow-stone-200 group"
            >
              <Image 
                src={like.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(like.name || "User")}&background=random&size=400`} 
                alt={like.name || "User"}
                fill
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                unoptimized={like.image?.startsWith("/")}
              />
              
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
              
              <div className="absolute bottom-4 left-4 right-4">
                <div className="flex items-center gap-1.5 mb-1">
                </div>
                <h3 className="text-white font-black text-sm">{like.name || "User"}</h3>
                <p className="text-white/60 text-[10px] font-medium">{new Date(like.date).toLocaleDateString()}</p>
              </div>

              <div 
                onClick={async (e) => {
                  e.stopPropagation();
                  setActionLoading(like.id);
                  try {
                    const res = await submitSwipe(like.id, "LIKE");
                    if (res.matched) {
                      router.push(`/chat/${res.conversationId}`);
                    } else {
                      setLikes(prev => prev.filter(l => l.id !== like.id));
                    }
                  } catch {
                    showToast("Failed to match", "error");
                  } finally {
                    setActionLoading(null);
                  }
                }}
                className="absolute inset-0 bg-primary/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center cursor-pointer"
              >
                 <div className="bg-white text-stone-900 px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest shadow-2xl flex items-center gap-2">
                    {actionLoading === like.id ? <FaSpinner className="animate-spin" /> : "Match Now"}
                 </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Upgrade CTA for Free users if they can see limited info */}
      <div className="mt-8 bg-stone-900 rounded-[2rem] p-6 text-white text-center relative overflow-hidden">
         <div className="absolute top-0 right-0 w-24 h-24 bg-primary/10 rounded-full -mr-12 -mt-12 blur-2xl" />
         <h4 className="text-sm font-black mb-2 relative z-10">Want more visibility?</h4>
         <p className="text-[10px] text-stone-400 font-medium mb-4 relative z-10">Upgrade to Elite to prioritize your profile in the Discover feed.</p>
         <Link href="/premium" className="inline-block px-6 py-2.5 bg-primary text-primary-foreground text-[10px] font-black uppercase tracking-widest rounded-xl relative z-10 active:scale-95 transition-transform">
            Go Elite
         </Link>
      </div>
    </div>
  );
}
