"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchDiscoverFeed, submitSwipe } from "./actions";
import LoadingSpinner from "../components/LoadingSpinner";
import { useToast } from "@/app/providers/ToastProvider";
import { SwipeableCardStack, CardData } from "@/components/magic-ui/SwipeableCardStack";
import { FaSlidersH } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";

export default function DiscoverClient({ initialCards }: { initialCards: CardData[] }) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minAge: 18, maxAge: 50 });
  const { showToast } = useToast();

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const matches = await fetchDiscoverFeed(filters);
      setCards(matches);
    } catch (e) {
      console.error("Failed to fetch matches", e);
      showToast("Could not refresh people. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast]);

  useEffect(() => {
    if (filters.minAge !== 18 || filters.maxAge !== 50) {
      loadMatches();
    }
  }, [loadMatches, filters]);

  const handleSwipe = async (card: CardData, direction: "left" | "right") => {
    try {
      await submitSwipe(card.id, direction === "right" ? "LIKE" : "PASS");
      // The SwipeableCardStack handles the local index update
    } catch (e) {
      console.error("Swipe submission failed", e);
      showToast("Action failed. Reconnecting...", "error");
    }
  };

  if (loading && cards.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <LoadingSpinner size="lg" />
        <p className="text-sm font-black text-stone-400 uppercase tracking-widest">Scanning Elite Network...</p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Filter Button */}
      <div className="absolute top-0 right-0 z-10">
        <button 
          onClick={() => setShowFilters(true)}
          className="w-12 h-12 bg-card rounded-2xl border border-border shadow-xl flex items-center justify-center text-foreground hover:border-primary transition-colors"
        >
          <FaSlidersH />
        </button>
      </div>

      <div className="pt-16">
        <SwipeableCardStack cards={cards} onSwipe={handleSwipe} />
      </div>

      {/* Filter Drawer (Magic UI Style) */}
      <AnimatePresence>
        {showFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowFilters(false)}
              className="fixed inset-0 bg-stone-900/20 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card p-10 z-[70] shadow-2xl border-l border-border"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-black tracking-tight">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="text-sm font-black text-stone-400 hover:text-stone-900"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-6">
                    <label className="text-xs font-black uppercase tracking-widest text-stone-400">Age Range</label>
                    <span className="text-xl font-black text-foreground">{filters.minAge} — {filters.maxAge}</span>
                  </div>
                  <input 
                    type="range" 
                    min="18" 
                    max="80" 
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                    className="w-full h-1.5 bg-secondary rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>

                <div className="pt-8 border-t border-stone-100">
                  <h4 className="text-xs font-black uppercase tracking-widest text-stone-400 mb-6">Preferences</h4>
                  <div className="space-y-4">
                    {["Verified Only", "Networking Mode", "Elite Members"].map((pref) => (
                      <label key={pref} className="flex items-center justify-between group cursor-pointer">
                        <span className="font-bold text-stone-400 group-hover:text-foreground transition-colors">{pref}</span>
                        <div className="w-12 h-6 bg-secondary rounded-full relative transition-colors group-hover:bg-secondary/80">
                          <div className="absolute top-1 left-1 w-4 h-4 bg-foreground rounded-full shadow-sm" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="w-full py-5 bg-primary text-primary-foreground rounded-[2rem] font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 hover:scale-[1.02] transition-transform mt-12"
                >
                  Apply & Discover
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
