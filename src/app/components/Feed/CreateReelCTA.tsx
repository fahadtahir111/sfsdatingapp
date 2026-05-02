"use client";

import { motion } from "framer-motion";
import { FaVideo } from "react-icons/fa";
import Link from "next/link";

interface CreateReelCTAProps {
  className?: string;
  variant?: "full" | "sidebar";
}

export default function CreateReelCTA({ className = "", variant = "full" }: CreateReelCTAProps) {
  if (variant === "sidebar") {
    return (
      <Link 
        href="/create"
        className={`w-full flex items-center justify-center gap-3 py-4 px-6 bg-primary hover:opacity-90 text-white rounded-[2rem] transition-all group shadow-lg shadow-primary/10 ${className}`}
      >
        <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded flex items-center justify-center transition-transform group-hover:scale-110">
          <FaVideo className="text-white text-[10px]" />
        </div>
        <span className="font-black uppercase tracking-[0.15em] text-[10px]">Create Reel</span>
      </Link>
    );
  }

  return (
    <Link href="/create" className={className}>
      <motion.div 
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.98 }}
        className="bg-primary hover:opacity-90 p-5 rounded-[2rem] flex items-center justify-center gap-4 shadow-xl shadow-primary/20 cursor-pointer"
      >
        <div className="w-6 h-6 bg-white/20 backdrop-blur-md rounded flex items-center justify-center">
          <FaVideo className="text-white text-[10px]" />
        </div>
        <span className="text-white font-black uppercase tracking-[0.2em] text-[10px]">Create Reel</span>
      </motion.div>
    </Link>
  );
}

