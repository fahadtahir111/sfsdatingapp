"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShareAlt, FaCopy, FaAward, FaCheck, FaStar } from "react-icons/fa";
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
    getReferralData().then((res) => {
      if (res.success) setData(res);
      setLoading(false);
    });
  }, []);

  const copyToClipboard = () => {
    if (!data?.referralCode) return;
    navigator.clipboard.writeText(data.referralCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const shareLink = () => {
    if (!data?.referralCode) return;
    const url = `${window.location.origin}/auth/signup?ref=${data.referralCode}`;
    if (navigator.share) {
      navigator.share({ title: "Join SFS Elite", text: "I'm inviting you to join the world's most exclusive social circle.", url });
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex flex-col items-center justify-center gap-4">
        <div className="w-12 h-12 border-4 border-primary/20 border-t-primary rounded-full animate-spin" />
        <p className="text-xs font-black text-muted-foreground uppercase tracking-widest">Loading referral dashboard…</p>
      </div>
    );
  }

  const level = Math.floor((data?.referrals?.length || 0) / 3) + 1;
  const nextLevelAt = level * 3;
  const progress = ((data?.referrals?.length || 0) % 3) / 3 * 100;

  return (
    <div className="min-h-screen bg-background pb-32">
      {/* Header */}
      <div className="sticky top-0 z-50 bg-background/90 backdrop-blur-2xl border-b border-border px-6 py-5">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-black text-foreground tracking-tight uppercase">Elite Circle</h1>
            <p className="text-[10px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
              Grow the community. Earn rewards.
            </p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center shadow-lg shadow-primary/10">
            <FaAward className="text-primary text-xl" />
          </div>
        </div>
      </div>

      <div className="page-shell py-6 space-y-6">
        {/* Referral Code Card */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-primary/20 via-primary/5 to-card border border-primary/20 p-8 shadow-2xl shadow-primary/5"
        >
          <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-32 h-32 bg-primary/5 rounded-full -ml-16 -mb-16 blur-2xl pointer-events-none" />

          <div className="relative z-10 text-center">
            <div className="inline-flex items-center gap-2 bg-primary/20 text-primary px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest mb-6 border border-primary/30">
              <FaAward className="text-[10px]" /> Referral Engine
            </div>

            <p className="text-muted-foreground text-[10px] font-black uppercase tracking-widest mb-3">
              Your Private Access Code
            </p>

            <button
              onClick={copyToClipboard}
              className="group relative text-4xl font-black tracking-widest text-foreground mb-8 cursor-pointer hover:text-primary transition-colors flex items-center justify-center gap-3 mx-auto"
            >
              <span>{data?.referralCode || "••••••"}</span>
              <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                {copied ? (
                  <FaCheck className="text-primary text-xs" />
                ) : (
                  <FaCopy className="text-primary/70 text-xs" />
                )}
              </div>
            </button>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Recruits</p>
                <p className="text-3xl font-black text-foreground">{data?.referrals?.length || 0}</p>
              </div>
              <div className="bg-black/30 rounded-2xl p-4 border border-white/10 text-center">
                <p className="text-[10px] text-muted-foreground font-black uppercase tracking-widest mb-1">Circle Level</p>
                <p className="text-3xl font-black text-primary">Level {level}</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Level Progress */}
        <div className="bg-card border border-border rounded-3xl p-6">
          <div className="flex justify-between items-center mb-3">
            <span className="text-xs font-black uppercase tracking-widest text-muted-foreground">Progress to Level {level + 1}</span>
            <span className="text-xs font-black text-primary">{data?.referrals?.length || 0} / {nextLevelAt}</span>
          </div>
          <div className="h-2 bg-secondary rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
              className="h-full rounded-full bg-gradient-to-r from-primary to-pink-400"
            />
          </div>
          <p className="text-[10px] text-muted-foreground font-medium mt-3">
            {nextLevelAt - (data?.referrals?.length || 0)} more recruits to unlock Level {level + 1} perks
          </p>
        </div>

        {/* Rewards Tiers */}
        <div>
          <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground mb-3 px-1">Reward Tiers</h3>
          <div className="space-y-3">
            {[
              { emoji: "👤", label: "New Recruit Joins", desc: "They sign up with your code", badge: "+1 Point", color: "bg-secondary border-border text-muted-foreground" },
              { emoji: "💎", label: "Vetted Member", desc: "Recruit completes verification", badge: "Bonus Roses", color: "bg-primary/10 border-primary/20 text-primary" },
              { emoji: "👑", label: "Elite Upgrade", desc: "Recruit subscribes to Elite", badge: "50 Roses", color: "bg-amber-400/10 border-amber-400/20 text-amber-400" },
            ].map((tier, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="bg-card border border-border rounded-2xl p-4 flex items-center gap-4"
              >
                <div className="w-10 h-10 rounded-xl bg-secondary border border-border flex items-center justify-center text-lg flex-shrink-0">
                  {tier.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-black text-foreground">{tier.label}</p>
                  <p className="text-[10px] text-muted-foreground font-medium mt-0.5">{tier.desc}</p>
                </div>
                <div className={`px-3 py-1.5 rounded-xl border text-[10px] font-black uppercase tracking-widest whitespace-nowrap ${tier.color}`}>
                  {tier.badge}
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div>
          <div className="flex items-center justify-between mb-3 px-1">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-muted-foreground">Recent Recruits</h3>
            <span className="text-[10px] font-black text-primary">{data?.referrals?.length || 0} Total</span>
          </div>

          <div className="space-y-2">
            {!data?.referrals || data.referrals.length === 0 ? (
              <div className="bg-card border border-dashed border-border rounded-3xl p-12 text-center">
                <div className="text-3xl mb-4 opacity-30">📭</div>
                <p className="text-sm font-black text-foreground">No recruits yet</p>
                <p className="text-xs text-muted-foreground font-medium mt-1">Share your code to start building your circle</p>
              </div>
            ) : (
              data.referrals.map((ref, i) => (
                <motion.div
                  key={ref.id}
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="bg-card border border-border rounded-2xl p-4 flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center text-sm font-black text-primary">
                      {ref.name?.[0] || "?"}
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">{ref.name}</p>
                      <p className="text-[9px] text-muted-foreground font-bold uppercase tracking-widest mt-0.5">
                        {new Date(ref.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 text-[10px] font-black text-primary/80 bg-primary/10 px-2.5 py-1 rounded-lg border border-primary/20">
                    <FaStar className="text-[9px]" /> Joined
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Floating Share Button */}
      <div className="fixed bottom-24 left-4 right-4 max-w-md mx-auto flex gap-3 z-40">
        <button
          onClick={copyToClipboard}
          className="w-12 h-14 bg-secondary border border-border rounded-2xl font-black flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all shadow-xl"
        >
          {copied ? <FaCheck className="text-primary" /> : <FaCopy />}
        </button>
        <button
          onClick={shareLink}
          className="flex-1 bg-primary text-black h-14 rounded-2xl font-black uppercase tracking-widest text-xs shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-95 transition-all"
        >
          <FaShareAlt /> Share Private Access
        </button>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {copied && (
          <motion.div
            initial={{ y: 60, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 60, opacity: 0 }}
            className="fixed bottom-44 left-1/2 -translate-x-1/2 bg-primary text-black px-6 py-3 rounded-full text-xs font-black uppercase tracking-widest shadow-2xl z-50 whitespace-nowrap"
          >
            <FaCheck className="inline mr-2" />Code Copied to Clipboard
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
