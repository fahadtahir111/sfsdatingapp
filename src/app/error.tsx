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
    <div className="min-h-screen bg-white flex items-center justify-center p-6 text-center">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md bg-white rounded-[3.5rem] p-12 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.1)] border border-stone-100"
      >
        <div className="w-24 h-24 bg-primary/10 text-primary/90 rounded-[2rem] flex items-center justify-center mx-auto mb-10 border border-primary/20">
           <FaExclamationTriangle className="text-4xl" />
        </div>

        <h1 className="text-3xl font-black text-stone-900 mb-4 tracking-tighter">Something went wrong</h1>
        <p className="text-stone-500 font-medium mb-10 text-sm">
          The SFS concierge is working to resolve this. Please try again or return home.
        </p>

        <div className="space-y-3">
          <button
            onClick={() => reset()}
            className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 active:scale-95 transition-transform"
          >
            <FaRedo className="text-[10px]" /> Try Again
          </button>
          
          <Link 
            href="/"
            className="block w-full py-4 bg-stone-100 text-stone-900 rounded-2xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-transform"
          >
            Return to Society
          </Link>
        </div>

        {error.digest && (
          <p className="mt-8 text-[10px] text-stone-300 font-bold uppercase tracking-widest">
            ID: {error.digest}
          </p>
        )}
      </motion.div>
    </div>
  );
}

