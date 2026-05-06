"use client";

import React, { useState } from "react";
import { motion, AnimatePresence, useMotionValue, useTransform } from "framer-motion";
import { Heart, Star, ShieldCheck, MapPin } from "lucide-react";
import Image from "next/image";
import { cn } from "@/lib/utils";

export interface CardData {
  id: string;
  name: string;
  image: string;
  age: number;
  role: string;
  trustScore: number;
  isVerified: boolean;
  networkingGoals: string[];
}

export function SwipeableCardStack({ 
  cards, 
  onSwipe 
}: { 
  cards: CardData[];
  onSwipe: (card: CardData, direction: "left" | "right") => void;
}) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const currentCard = cards[currentIndex];

  const handleSwipe = (direction: "left" | "right") => {
    if (currentCard) {
      onSwipe(currentCard, direction);
      setCurrentIndex(prev => prev + 1);
    }
  };

  if (currentIndex >= cards.length) {
    return (
      <div className="h-[600px] w-full max-w-md mx-auto bg-white/5 backdrop-blur-2xl rounded-[48px] border border-white/5 flex flex-col items-center justify-center p-12 text-center text-white shadow-2xl relative overflow-hidden group">
        <div className="aether-mesh absolute inset-0 opacity-20 pointer-events-none" />
        <div className="w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] flex items-center justify-center mb-8 group-hover:scale-110 transition-transform duration-700 shadow-shadow-glow relative z-10">
          <Star className="w-10 h-10 text-primary opacity-40 shadow-shadow-glow" />
        </div>
        <h4 className="text-3xl font-heading mb-3 tracking-tight relative z-10">Network Depleted</h4>
        <p className="sub-heading text-[11px] text-white/30 lowercase max-w-[200px] mx-auto leading-relaxed relative z-10">check back later or expand your protocol parameters to meet more elite members.</p>
      </div>
    );
  }

  return (
    <div className="relative h-[650px] w-full max-w-md mx-auto perspective-1000">
      <AnimatePresence>
        {cards.slice(currentIndex, currentIndex + 2).reverse().map((card, idx) => {
          const isTop = idx === 1 || cards.length - currentIndex === 1;
          return (
            <ProfileCard 
              key={card.id}
              card={card}
              isTop={isTop}
              onSwipe={handleSwipe}
            />
          );
        })}
      </AnimatePresence>
    </div>
  );
}

function ProfileCard({ 
  card, 
  isTop, 
  onSwipe 
}: { 
  card: CardData; 
  isTop: boolean;
  onSwipe: (direction: "left" | "right") => void;
}) {
  const x = useMotionValue(0);
  const rotate = useTransform(x, [-200, 200], [-25, 25]);
  const opacity = useTransform(x, [-200, -150, 0, 150, 200], [0, 1, 1, 1, 0]);
  const likeOpacity = useTransform(x, [50, 150], [0, 1]);
  const nopeOpacity = useTransform(x, [-50, -150], [0, 1]);

  const handleDragEnd = (_: unknown, info: { offset: { x: number } }) => {
    if (info.offset.x > 100) onSwipe("right");
    else if (info.offset.x < -100) onSwipe("left");
  };

  return (
    <motion.div
      style={{ x, rotate, opacity }}
      drag={isTop ? "x" : false}
      dragConstraints={{ left: 0, right: 0 }}
      onDragEnd={handleDragEnd}
      className={cn(
        "absolute inset-0 bg-background/80 backdrop-blur-3xl rounded-[40px] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10",
        !isTop && "scale-[0.92] translate-y-8 opacity-40 pointer-events-none grayscale"
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.4, ease: "circIn" } }}
    >
      {/* Media */}
      <div className="relative h-full w-full group/card">
        <Image
          src={card.image}
          alt={card.name}
          fill
          className="object-cover grayscale group-hover/card:grayscale-0 transition-all duration-1000"
          priority={isTop}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-transparent to-transparent opacity-90" />
        <div className="aether-mesh absolute inset-0 opacity-10 pointer-events-none" />
        
        {/* Swipe Indicators */}
        {isTop && (
          <>
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-12 left-12 border-2 border-primary rounded-2xl px-6 py-2.5 rotate-[-12deg] bg-black/40 backdrop-blur-md shadow-shadow-glow">
              <span className="sub-heading text-lg text-primary lowercase tracking-[0.2em]">protocol:like</span>
            </motion.div>
            <motion.div style={{ opacity: nopeOpacity }} className="absolute top-12 right-12 border-2 border-white/20 rounded-2xl px-6 py-2.5 rotate-[12deg] bg-black/40 backdrop-blur-md">
              <span className="sub-heading text-lg text-white/40 lowercase tracking-[0.2em]">protocol:skip</span>
            </motion.div>
          </>
        )}

        {/* Info */}
        <div className="absolute bottom-0 w-full p-10 text-white z-10">
          <div className="flex items-center gap-3 mb-3">
            <h3 className="text-4xl font-heading tracking-tight leading-none group-hover/card:text-primary transition-colors">{card.name}, {card.age}</h3>
            {card.isVerified && (
              <ShieldCheck className="w-6 h-6 text-primary shadow-shadow-glow" />
            )}
          </div>
          
          <p className="sub-heading text-[10px] text-white/40 lowercase mb-6 flex items-center gap-2 tracking-widest">
            <MapPin className="w-3.5 h-3.5 text-primary/60" />
            {card.role}
          </p>

          <div className="flex flex-wrap gap-2.5 mb-10">
            {card.networkingGoals.slice(0, 3).map((goal, i) => (
              <span key={i} className="px-5 py-2.5 bg-white/5 backdrop-blur-xl rounded-[18px] sub-heading text-[9px] lowercase tracking-widest border border-white/10 text-white/60">
                {goal}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-8 border-t border-white/5">
            <div className="flex flex-col">
              <span className="sub-heading text-[9px] lowercase tracking-[0.2em] text-white/20 mb-2">trust index</span>
              <span className="text-2xl font-heading text-primary shadow-shadow-glow">{card.trustScore}%</span>
            </div>
            <button 
              onClick={() => onSwipe("right")}
              className="w-16 h-16 bg-primary text-black rounded-[24px] flex items-center justify-center shadow-shadow-glow hover:scale-110 transition-all active:scale-95 group/btn"
            >
              <Heart className="w-7 h-7 fill-current group-hover:scale-110 transition-transform" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

