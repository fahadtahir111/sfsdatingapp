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
          className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
        >
          <motion.div 
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            className="w-full max-w-sm bg-white/5 backdrop-blur-2xl rounded-[48px] p-10 text-center shadow-2xl relative overflow-hidden border border-white/10"
          >
            <div className="aether-mesh absolute inset-0 opacity-20 pointer-events-none" />
            <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl" />
            
            <div className="w-24 h-24 bg-primary/10 border border-primary/20 text-primary rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-shadow-glow group">
               {claimed ? <FaCheckCircle className="text-4xl group-hover:scale-110 transition-transform" /> : <FaGift className="text-4xl group-hover:scale-110 transition-transform" />}
            </div>

            <h2 className="text-3xl font-heading text-white tracking-tight mb-3">
              {claimed ? "Boost Synced" : "Daily Protocol"}
            </h2>
            <p className="sub-heading text-[11px] text-white/40 lowercase mb-10 leading-relaxed max-w-[240px] mx-auto">
              {claimed ? "your profile visibility is now prioritized within the aether network." : "check in daily to maintain your status and ignite visibility protocols."}
            </p>

            {!claimed ? (
              <button 
                onClick={handleClaim}
                disabled={loading}
                className="btn-aether w-full py-5 flex items-center justify-center gap-3 active:scale-95 transition-all"
              >
                {loading ? <span className="sub-heading lowercase">Processing…</span> : (
                  <>
                    <FaFire className="text-sm" /> 
                    <span className="sub-heading lowercase">Activate Boost</span>
                  </>
                )}
              </button>
            ) : (
              <div className="sub-heading text-[10px] text-primary lowercase tracking-[0.2em] shadow-shadow-glow">
                Priority Visibility Enabled
              </div>
            )}

            <button 
              onClick={() => setShow(false)}
              className="mt-8 sub-heading text-[9px] text-white/20 hover:text-white transition-colors lowercase tracking-widest"
            >
              Maybe Later
            </button>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

