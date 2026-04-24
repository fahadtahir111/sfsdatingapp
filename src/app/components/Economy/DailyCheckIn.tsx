"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaFire, FaCheckCircle, FaGift } from "react-icons/fa";
import { claimDailyBonus } from "../../../lib/economy-client";

export default function DailyCheckIn({ userId }: { userId: string }) {
  const [show, setShow] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Check local storage to avoid unnecessary API calls if already claimed
    const lastClaim = localStorage.getItem(`last_claim_${userId}`);
    const today = new Date().toDateString();
    if (lastClaim !== today) {
      setShow(true);
    }
  }, [userId]);

  const handleClaim = async () => {
    setLoading(true);
    const res = await claimDailyBonus();
    if (res.success) {
      setClaimed(true);
      localStorage.setItem(`last_claim_${userId}`, new Date().toDateString());
      setTimeout(() => setShow(false), 3000);
    } else {
      setShow(false); // Probably already claimed
    }
    setLoading(false);
  };

  return (
    <AnimatePresence>
      {show && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-md"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm bg-white rounded-[3rem] p-8 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full -mr-16 -mt-16 blur-3xl" />
            
            <div className="w-20 h-20 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
               {claimed ? <FaCheckCircle className="text-4xl" /> : <FaGift className="text-4xl" />}
            </div>

            <h2 className="text-2xl font-black text-stone-900 mb-2">
              {claimed ? "Boost Active!" : "Daily Status"}
            </h2>
            <p className="text-stone-500 text-sm font-medium mb-8">
              {claimed ? "Your profile visibility is now prioritized." : "Check in daily to maintain your Elite status and visibility."}
            </p>

            {!claimed ? (
              <button 
                onClick={handleClaim}
                disabled={loading}
                className="w-full py-4 bg-stone-900 text-white rounded-2xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                {loading ? "Processing..." : (
                  <>
                    <FaFire className="text-yellow-400" /> Activate Boost
                  </>
                )}
              </button>
            ) : (
              <div className="text-green-500 font-black text-xs uppercase tracking-widest">
                Priority Visibility Enabled
              </div>
            )}

            <button 
              onClick={() => setShow(false)}
              className="mt-6 text-stone-400 text-[10px] font-black uppercase tracking-widest hover:text-stone-900 transition-colors"
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
