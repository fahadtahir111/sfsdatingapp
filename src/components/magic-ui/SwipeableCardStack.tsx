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
      <div className="h-[600px] w-full max-w-md mx-auto bg-card rounded-[3rem] border-2 border-dashed border-white/10 flex flex-col items-center justify-center p-12 text-center text-white shadow-2xl">
        <div className="w-20 h-20 bg-stone-900 rounded-full flex items-center justify-center mb-6">
          <Star className="w-10 h-10 text-stone-600" />
        </div>
        <h4 className="text-xl font-black mb-2">That&apos;s everyone!</h4>
        <p className="text-stone-400 font-medium">Check back later or expand your filters to meet more elite members.</p>
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
        "absolute inset-0 bg-stone-950 rounded-[2.5rem] shadow-2xl overflow-hidden cursor-grab active:cursor-grabbing border border-white/10",
        !isTop && "scale-95 translate-y-4 opacity-50 pointer-events-none"
      )}
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      exit={{ x: x.get() > 0 ? 500 : -500, opacity: 0, transition: { duration: 0.3 } }}
    >
      {/* Media */}
      <div className="relative h-full w-full">
        <Image
          src={card.image}
          alt={card.name}
          fill
          className="object-cover"
          priority={isTop}
        />
        
        {/* Overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        
        {/* Swipe Indicators */}
        {isTop && (
          <>
            <motion.div style={{ opacity: likeOpacity }} className="absolute top-10 left-10 border-4 border-primary rounded-xl px-4 py-2 rotate-[-15deg]">
              <span className="text-4xl font-black text-primary uppercase">LIKE</span>
            </motion.div>
            <motion.div style={{ opacity: nopeOpacity }} className="absolute top-10 right-10 border-4 border-stone-500 rounded-xl px-4 py-2 rotate-[15deg]">
              <span className="text-4xl font-black text-stone-500 uppercase">NOPE</span>
            </motion.div>
          </>
        )}

        {/* Info */}
        <div className="absolute bottom-0 w-full p-8 text-white">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-3xl font-black tracking-tight">{card.name}, {card.age}</h3>
            {card.isVerified && (
              <ShieldCheck className="w-6 h-6 text-blue-400 fill-blue-400/20" />
            )}
          </div>
          
          <p className="text-stone-300 font-bold mb-4 flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            {card.role}
          </p>

          <div className="flex flex-wrap gap-2 mb-6">
            {card.networkingGoals.slice(0, 3).map((goal, i) => (
              <span key={i} className="px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-[10px] font-black uppercase tracking-widest border border-white/10">
                {goal}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between pt-4 border-t border-white/10">
            <div className="flex flex-col">
              <span className="text-[10px] font-black uppercase tracking-widest text-stone-400">Trust Score</span>
              <span className="text-xl font-black text-primary">{card.trustScore}%</span>
            </div>
            <button 
              onClick={() => onSwipe("right")}
              className="w-12 h-12 bg-black/50 border border-white/20 rounded-full flex items-center justify-center text-primary shadow-xl hover:scale-110 transition-transform active:scale-95"
            >
              <Heart className="w-6 h-6 fill-current" />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

