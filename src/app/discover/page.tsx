"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";
import { FaHeart, FaTimes, FaCheckCircle, FaBriefcase, FaSlidersH } from "react-icons/fa";
import Image from "next/image";
import { fetchDiscoverFeed, submitSwipe } from "./actions";
import { useSession } from "next-auth/react";
import LoadingSpinner from "../components/LoadingSpinner";

export default function DiscoverPage() {
  const { data: session } = useSession();
  const [cards, setCards] = useState<Array<{ id: string; name: string; image: string; age: number; role: string; trustScore: number; isVerified: boolean; networkingGoals: string[] }>>([]);
  const [loading, setLoading] = useState(true);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minAge: 18, maxAge: 50 });
  
  const userId = (session?.user as { id: string } | undefined)?.id;

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const matches = await fetchDiscoverFeed(filters);
      setCards(matches);
    } catch (e) {
      console.error("Failed to fetch matches", e);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches]);

  if (loading) {
    return (
      <div className="fixed inset-0 bg-secondary/20 flex items-center justify-center">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="absolute inset-0 bg-secondary/20 flex flex-col pt-16 pb-24 px-4 overflow-hidden">
      <div className="absolute top-4 right-6 z-50">
        <button 
          onClick={() => setShowFilters(true)}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center text-stone-900 border border-stone-100 active:scale-95 transition-transform"
        >
          <FaSlidersH />
        </button>
      </div>

      <div className="flex-1 relative max-w-md w-full mx-auto">
        <AnimatePresence>
          {cards.map((card, index) => {
            const isFront = index === cards.length - 1;
            return (
              <SwipeCard 
                key={card.id} 
                card={card} 
                isFront={isFront} 
                setCards={setCards} 
                cards={cards} 
              />
            );
          })}
        </AnimatePresence>
        
        {cards.length === 0 && (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="w-24 h-24 bg-primary/20 rounded-full flex items-center justify-center mb-6"
            >
              <div className="w-16 h-16 bg-primary rounded-full animate-ping opacity-50" />
            </motion.div>
            <h3 className="text-2xl font-black text-foreground mb-2">Looking for more</h3>
            <p className="text-muted-foreground font-medium max-w-xs mx-auto">
              We&apos;re expanding your radius to find more elite connections.
            </p>
          </div>
        )}
      </div>

      {/* Filter Drawer */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-black/40 z-[60] backdrop-blur-sm"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white rounded-t-[3rem] p-8 z-[70] shadow-2xl pb-12"
            >
              <div className="w-12 h-1.5 bg-stone-100 rounded-full mx-auto mb-8" />
              <h3 className="text-2xl font-black text-stone-900 mb-6">Refine Search</h3>
              
              <div className="space-y-8">
                <div>
                  <div className="flex justify-between items-end mb-4">
                    <label className="text-xs font-black uppercase tracking-widest text-stone-400">Age Range</label>
                    <span className="text-sm font-black text-stone-900">{filters.minAge} — {filters.maxAge}</span>
                  </div>
                  <input 
                    type="range" 
                    min="18" 
                    max="80" 
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                    className="w-full accent-stone-900" 
                  />
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl active:scale-95 transition-transform"
                >
                  Apply Filters
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

const SwipeCard = ({ 
  card, 
  isFront, 
  setCards, 
  cards 
}: { 
  card: { id: string; name: string; image: string; age: number; role: string; trustScore: number; isVerified: boolean; networkingGoals: string[] }, 
  isFront: boolean,
  setCards: React.Dispatch<React.SetStateAction<{ id: string; name: string; image: string; age: number; role: string; trustScore: number; isVerified: boolean; networkingGoals: string[] }[]>>,
  cards: { id: string; name: string; image: string; age: number; role: string; trustScore: number; isVerified: boolean; networkingGoals: string[] }[]
}) => {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-10, 10]);
  const opacityLike = useTransform(x, [0, 100], [0, 1]);
  const opacityPass = useTransform(x, [0, -100], [0, 1]);
  
  const handleSwipe = async (action: "LIKE" | "PASS") => {
    try {
      await submitSwipe(card.id, action);
      setCards(cards.filter(c => c.id !== card.id));
    } catch (e) {
      console.error("Swipe failed", e);
    }
  };

  const handleDragEnd = (_event: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) {
      handleSwipe("LIKE");
    } else if (info.offset.x < -100) {
      handleSwipe("PASS");
    }
  };

  return (
    <motion.div
      className="absolute inset-0 w-full h-full rounded-[3rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.3)] bg-white border border-white/20"
      style={{ x, rotate, zIndex: isFront ? 10 : 0 }}
      drag={isFront ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      dragElastic={0.7}
      onDragEnd={handleDragEnd}
      whileTap={{ cursor: "grabbing" }}
      initial={false}
      animate={{ 
        scale: isFront ? 1 : 0.95, 
        y: isFront ? 0 : 20,
        opacity: isFront ? 1 : 0.8
      }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, scale: 0.5 }}
      transition={{ duration: 0.4, ease: [0.23, 1, 0.32, 1] }}
    >
      <div className="relative w-full h-full">
        <Image 
          src={card.image} 
          alt={card.name} 
          fill 
          className="object-cover pointer-events-none scale-105" 
          unoptimized={card.image?.startsWith("/")}
          priority
        />
        
        {/* Elite Trust Badge */}
        <div className="absolute top-6 left-6 z-20">
          <div className="bg-stone-900/60 backdrop-blur-md border border-white/20 px-3 py-1.5 rounded-full flex items-center gap-2">
            <div className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-pulse" />
            <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">
              {card.trustScore}% ELITE TRUST
            </span>
          </div>
        </div>

        {/* Action Indicators */}
        <motion.div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: opacityLike }}
        >
          <div className="bg-green-500/20 backdrop-blur-xl border-2 border-green-500/50 p-8 rounded-full text-green-400 text-6xl shadow-[0_0_50px_rgba(34,197,94,0.3)]">
            <FaHeart />
          </div>
        </motion.div>
        <motion.div 
          className="absolute inset-0 z-10 flex items-center justify-center pointer-events-none"
          style={{ opacity: opacityPass }}
        >
          <div className="bg-red-500/20 backdrop-blur-xl border-2 border-red-500/50 p-8 rounded-full text-red-400 text-6xl shadow-[0_0_50px_rgba(239,68,68,0.3)]">
            <FaTimes />
          </div>
        </motion.div>

        {/* Profile Details Glass Card */}
        <div className="absolute bottom-4 left-4 right-4 z-30 pointer-events-none">
          <div className="bg-stone-900/40 backdrop-blur-2xl border border-white/10 rounded-[2.5rem] p-6 shadow-2xl overflow-hidden">
            {/* Ambient Background Glow */}
            <div className="absolute -top-10 -right-10 w-32 h-32 bg-yellow-400/20 blur-[50px] rounded-full" />
            
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-3xl font-black text-white tracking-tight">{card.name}, {card.age}</h2>
                {card.isVerified && (
                  <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center shadow-lg shadow-blue-500/30">
                    <FaCheckCircle className="text-white text-[10px]" />
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center border border-white/10">
                  <FaBriefcase className="text-white/60 text-sm" />
                </div>
                <p className="text-xs font-bold text-white/70 uppercase tracking-[0.1em]">{card.role}</p>
              </div>

              {card.networkingGoals && card.networkingGoals.length > 0 && (
                <div className="flex flex-wrap gap-2 pt-2 border-t border-white/5">
                  {card.networkingGoals.slice(0, 3).map((tag: string) => (
                    <span 
                      key={tag} 
                      className="px-3 py-1.5 bg-white/10 backdrop-blur-md rounded-xl text-[9px] font-black text-white uppercase tracking-widest border border-white/5"
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
      
      {/* Refined Action Bar */}
      <div className="absolute bottom-10 left-0 right-0 z-40 flex justify-center items-center gap-6 px-10 pointer-events-none">
        <button 
          onClick={(e) => { e.stopPropagation(); handleSwipe("PASS"); }}
          className="w-14 h-14 bg-stone-900/80 backdrop-blur-xl rounded-full flex items-center justify-center text-white border border-white/10 shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto"
        >
          <FaTimes className="text-xl" />
        </button>
        
        <button 
          onClick={async (e) => {
            e.stopPropagation();
            const { sendFriendRequest } = await import("../friends/actions");
            const res = await sendFriendRequest(card.id);
            if (res.success) {
              alert("Elite invitation sent!");
              setCards(cards.filter(c => c.id !== card.id));
            } else {
              alert(res.error);
            }
          }}
          className="w-20 h-20 bg-yellow-400 rounded-full flex flex-col items-center justify-center text-stone-900 shadow-[0_10px_30px_rgba(250,204,21,0.4)] hover:scale-110 active:scale-95 transition-all pointer-events-auto group"
        >
          <span className="text-3xl mb-0.5 group-hover:scale-125 transition-transform">🤝</span>
          <span className="text-[8px] font-black uppercase tracking-tighter">Connect</span>
        </button>

        <button 
          onClick={(e) => { e.stopPropagation(); handleSwipe("LIKE"); }}
          className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-stone-900 shadow-2xl hover:scale-110 active:scale-95 transition-all pointer-events-auto"
        >
          <FaHeart className="text-xl text-stone-900" />
        </button>
      </div>
    </motion.div>
  );
};

