"use client";

import { useEffect } from "react";
import { motion } from "framer-motion";
import { FaExclamationTriangle, FaRedo } from "react-icons/fa";
import Link from "next/link";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 text-center relative overflow-hidden">
      <div className="aether-mesh absolute inset-0 opacity-20 pointer-events-none" />
      <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white/5 backdrop-blur-3xl rounded-[48px] p-12 shadow-2xl border border-white/10 relative z-10 overflow-hidden group"
      >
        <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-1000" />
        <div className="w-28 h-28 bg-primary/10 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-10 border border-primary/20 shadow-shadow-glow group-hover:scale-110 transition-transform duration-700">
           <FaExclamationTriangle className="text-4xl" />
        </div>

        <h1 className="text-4xl font-heading text-white mb-4 tracking-tight">System Anomaly</h1>
        <p className="sub-heading text-[11px] text-white/30 lowercase mb-12 max-w-[280px] mx-auto leading-relaxed tracking-wide">
          the aether protocols encountered a temporary instability. the concierge is synchronizing the network.
        </p>

        <div className="space-y-4">
          <button
            onClick={() => reset()}
            className="btn-aether w-full py-5 flex items-center justify-center gap-3 active:scale-95 transition-all"
          >
            <FaRedo className="text-xs" /> 
            <span className="sub-heading lowercase">Re-authenticate Protocol</span>
          </button>
          
          <Link 
            href="/"
            className="block w-full py-5 bg-white/5 text-white/40 border border-white/5 rounded-2xl sub-heading text-[10px] lowercase tracking-widest hover:bg-white/10 hover:text-white transition-all active:scale-95"
          >
            return to aether core
          </Link>
        </div>

        {error.digest && (
          <p className="mt-10 sub-heading text-[8px] text-white/10 lowercase tracking-[0.3em]">
            sync_id: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}

