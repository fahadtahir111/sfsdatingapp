"use client";

import { useState, useEffect, useCallback } from "react";
import { fetchDiscoverFeed, submitSwipe } from "./actions";
import DiscoverLoading from "./loading";
import { useToast } from "@/app/providers/ToastProvider";
import { SwipeableCardStack, CardData } from "@/components/magic-ui/SwipeableCardStack";
import { FaSlidersH } from "react-icons/fa";
import { AnimatePresence, motion } from "framer-motion";
import { ExpandingSearchDock } from "@/components/magic-ui/ExpandingSearchDock";
import { useDebounce } from "@/lib/hooks/use-debounce"; // I'll check if this exists or create it

export default function DiscoverClient({ initialCards }: { initialCards: CardData[] }) {
  const [cards, setCards] = useState<CardData[]>(initialCards);
  const [loading, setLoading] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({ minAge: 18, maxAge: 50, searchQuery: "" });
  const debouncedSearch = useDebounce(filters.searchQuery, 500);
  const { showToast } = useToast();

  const loadMatches = useCallback(async () => {
    try {
      setLoading(true);
      const matches = await fetchDiscoverFeed({
        ...filters,
        searchQuery: debouncedSearch
      });
      setCards(matches);
    } catch (e) {
      console.error("Failed to fetch matches", e);
      showToast("Could not refresh people. Try again.", "error");
    } finally {
      setLoading(false);
    }
  }, [filters, showToast, debouncedSearch]);

  useEffect(() => {
    loadMatches();
  }, [loadMatches, filters.minAge, filters.maxAge, debouncedSearch]);

  const handleSwipe = async (card: CardData, direction: "left" | "right") => {
    try {
      await submitSwipe(card.id, direction === "right" ? "LIKE" : "PASS");
      if (direction === "right") {
        showToast(`Friend request sent to ${card.name}! ✨`, "success");
      }
      // The SwipeableCardStack handles the local index update
    } catch (e) {
      console.error("Swipe submission failed", e);
      showToast("Action failed. Reconnecting...", "error");
    }
  };

  if (loading && cards.length === 0) {
    return <DiscoverLoading />;
  }

  return (
    <div className="relative">
      {/* Header Actions */}
      <div className="absolute top-0 right-0 z-10 flex items-center gap-3">
        <ExpandingSearchDock 
          className="bg-card/80 border-border" 
          onChange={(val) => setFilters(prev => ({ ...prev, searchQuery: val }))}
        />
        <button 
          onClick={() => setShowFilters(true)}
          className="w-12 h-12 bg-card rounded-xl border border-border shadow-xl flex items-center justify-center text-foreground hover:border-primary transition-all hover:scale-110 active:scale-95"
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
              className="fixed inset-0 bg-background/60 backdrop-blur-md z-[60]"
            />
            <motion.div 
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 30, stiffness: 300 }}
              className="fixed top-0 right-0 h-full w-full max-w-md bg-card p-10 z-[70] shadow-2xl border-l border-border backdrop-blur-xl"
            >
              <div className="flex items-center justify-between mb-12">
                <h3 className="text-3xl font-heading tracking-tight">Filters</h3>
                <button 
                  onClick={() => setShowFilters(false)}
                  className="sub-heading text-muted-foreground hover:text-foreground transition-colors"
                >
                  Close
                </button>
              </div>
              
              <div className="space-y-12">
                <div>
                  <div className="flex justify-between items-end mb-6">
                    <label className="sub-heading text-muted-foreground">Age Range</label>
                    <span className="text-xl font-black text-primary font-heading">{filters.minAge} — {filters.maxAge}</span>
                  </div>
                  <input 
                    type="range" 
                    min="18" 
                    max="80" 
                    value={filters.maxAge}
                    onChange={(e) => setFilters(prev => ({ ...prev, maxAge: parseInt(e.target.value) }))}
                    className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-primary" 
                  />
                </div>

                <div className="pt-8 border-t border-border">
                  <h4 className="sub-heading text-muted-foreground mb-6">Preferences</h4>
                  <div className="space-y-4">
                    {["Verified Only", "Networking Mode", "Elite Members"].map((pref) => (
                      <label key={pref} className="flex items-center justify-between group cursor-pointer">
                        <span className="font-bold text-muted-foreground group-hover:text-foreground transition-colors">{pref}</span>
                        <div className="w-12 h-6 bg-white/5 border border-border rounded-full relative transition-colors group-hover:bg-white/10">
                          <div className="absolute top-1 left-1 w-4 h-4 bg-primary rounded-full shadow-shadow-glow" />
                        </div>
                      </label>
                    ))}
                  </div>
                </div>

                <button 
                  onClick={() => setShowFilters(false)}
                  className="btn-aether w-full py-5 text-xs shadow-shadow-glow mt-12"
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
