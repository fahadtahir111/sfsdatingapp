"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShareAlt, FaCopy, FaAward } from "react-icons/fa";
import { getReferralData } from "./actions";

export default function ReferralsPage() {
  const [data, setData] = useState<{
    success: boolean;
    referralCode?: string | null;
    referrals?: Array<{ id: string; name: string; date: Date | string; reward?: number; status?: string }>;
    totalEarned?: number;
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    getReferralData().then(res => {
      if (res.success) {
        setData(res);
      }
      setLoading(false);
    });
  }, []);

  const copyToClipboard = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="page-shell min-h-screen bg-background flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 border-4 border-muted border-t-foreground rounded-full animate-spin" />
        <p className="text-sm font-semibold text-muted-foreground">Loading referral dashboard…</p>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen bg-background py-6 pb-24">
      {/* Header */}
      <header className="mb-8">
        <h1 className="text-3xl font-black text-stone-900 tracking-tight leading-none mb-2">Elite Circle</h1>
        <p className="text-stone-500 font-medium text-sm">Grow the community and earn premium rewards.</p>
      </header>

      {/* Referral Card */}
      <motion.div 
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="bg-stone-900 rounded-[2rem] p-8 text-white mb-8 relative overflow-hidden shadow-2xl shadow-stone-200"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full -mr-16 -mt-16 blur-3xl" />
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center gap-2 bg-yellow-400/20 text-yellow-400 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.2em] mb-6 border border-yellow-400/30">
            <FaAward /> Referral Engine
          </div>
          
          <h2 className="text-stone-400 text-xs font-black uppercase tracking-widest mb-4">Your Private Access Code</h2>
          <div 
            onClick={copyToClipboard}
            className="text-4xl font-black tracking-tighter mb-8 cursor-pointer hover:scale-105 transition-transform active:scale-95 flex items-center justify-center gap-3"
          >
            {data?.referralCode}
            <FaCopy className={`text-sm transition-colors ${copied ? 'text-green-400' : 'text-stone-500'}`} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1">Elite Recruits</p>
              <p className="text-2xl font-black">{data?.referrals?.length || 0}</p>
            </div>
            <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
              <p className="text-[10px] text-stone-400 font-black uppercase tracking-widest mb-1">Circle Status</p>
              <p className="text-2xl font-black text-yellow-400">Level {Math.floor((data?.referrals?.length || 0) / 3) + 1}</p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Rewards Info */}
      <section className="mb-8">
        <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest mb-4 px-2">Circle Growth</h3>
        <div className="space-y-3">
          <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-stone-100 group hover:border-stone-200 transition-colors">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-stone-50 flex items-center justify-center text-stone-400 border border-stone-100">
                👤
              </div>
              <div>
                <p className="text-sm font-black text-stone-900">New Recruit</p>
                <p className="text-[10px] text-stone-400 font-bold">Expands your networking reach</p>
              </div>
            </div>
            <div className="bg-stone-900 text-white px-3 py-1 rounded-full text-[10px] font-black">+1 Point</div>
          </div>

          <div className="bg-white p-4 rounded-2xl flex items-center justify-between border border-stone-100 border-l-4 border-l-yellow-400">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-yellow-50 flex items-center justify-center text-yellow-600 border border-yellow-100">
                💎
              </div>
              <div>
                <p className="text-sm font-black text-stone-900">Vetted Member</p>
                <p className="text-[10px] text-stone-400 font-bold">Unlocks premium group access</p>
              </div>
            </div>
            <div className="bg-yellow-400 text-stone-900 px-3 py-1 rounded-full text-[10px] font-black">Verified</div>
          </div>
        </div>
      </section>

      {/* Recent Activity */}
      <section>
        <div className="flex items-center justify-between mb-4 px-2">
          <h3 className="text-sm font-black text-stone-900 uppercase tracking-widest">Recent Activity</h3>
          <span className="text-[10px] font-black text-stone-400 uppercase tracking-widest">{data?.referrals?.length || 0} Total</span>
        </div>

        <div className="space-y-2">
          {(!data?.referrals || data.referrals.length === 0) ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-dashed border-stone-200">
              <div className="text-3xl mb-4 opacity-20">📭</div>
              <p className="text-sm text-stone-400 font-medium">Your circle is awaiting its first recruit.</p>
            </div>
          ) : (
            data.referrals?.map((ref) => (
              <div key={ref.id} className="bg-white p-4 rounded-2xl flex items-center justify-between border border-stone-100">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-stone-50 flex items-center justify-center text-xs font-black text-stone-300">
                    {ref.name[0]}
                  </div>
                  <div>
                    <p className="text-xs font-black text-stone-900">{ref.name}</p>
                    <p className="text-[9px] text-stone-400 font-bold uppercase tracking-tighter">{new Date(ref.date).toLocaleDateString()}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1.5 text-[10px] font-black text-yellow-600">
                  <FaAward className="text-[10px] text-yellow-400" />
                  EXPANDED
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      <div className="fixed bottom-24 left-6 right-6 md:left-[max(1.5rem,calc((100vw-var(--page-max))/2+1.5rem))] md:right-[max(1.5rem,calc((100vw-var(--page-max))/2+1.5rem))] flex gap-3 pointer-events-none">
         <button 
           onClick={copyToClipboard}
           className="flex-1 bg-stone-900 text-white h-14 rounded-2xl font-black uppercase tracking-[0.2em] text-[10px] shadow-2xl flex items-center justify-center gap-3 pointer-events-auto active:scale-95 transition-transform"
         >
           <FaShareAlt /> Share Private Access
         </button>
      </div>

      <AnimatePresence>
        {copied && (
          <motion.div 
            initial={{ y: 50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            className="fixed bottom-40 left-1/2 -translate-x-1/2 bg-stone-900 text-white px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl z-50 whitespace-nowrap border border-white/10"
          >
            Access Code Copied
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
