"use client";

import { useEffect, useState } from "react";
import { FaUserSecret, FaEyeSlash, FaShieldAlt } from "react-icons/fa";
import { motion } from "framer-motion";
import Link from "next/link";
import { getProfile, updatePrivacy } from "../../profile/actions";

export default function PrivacySettingsPage() {
  const [incognito, setIncognito] = useState(false);
  const [tier, setTier] = useState("Free");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(data => {
      setIncognito(!!data?.incognito);
      setTier(data?.tier || "Free");
      setLoading(false);
    });
  }, []);

  const handleToggle = async () => {
    if (tier !== "Elite") return; // Gated

    const newVal = !incognito;
    setIncognito(newVal);
    try {
      await updatePrivacy(newVal);
    } catch (e) {
      console.error("Failed to update privacy:", e);
      setIncognito(!newVal); // Rollback
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isElite = tier === "Elite";

  return (
    <div className="min-h-screen bg-background pt-8 px-6 pb-24">
      <h1 className="text-3xl font-black mb-10 text-foreground uppercase tracking-tighter">Privacy & Security</h1>

      <div className={`border p-8 rounded-[2.5rem] mb-10 relative overflow-hidden transition-all shadow-2xl ${
        isElite ? 'bg-card border-white/10' : 'bg-white/5 border-white/5 opacity-80'
      }`}>
        {/* Background Accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-6">
          <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-xl shadow-inner ${
             isElite ? 'bg-primary text-white shadow-lg shadow-primary/20' : 'bg-white/10 text-muted-foreground'
          }`}>
            <FaUserSecret />
          </div>
          <div>
            <h2 className="text-xl font-black text-white uppercase tracking-widest">Ghost Mode</h2>
            <p className="text-[10px] font-black text-primary uppercase tracking-[0.2em]">Elite Membership Only</p>
          </div>
        </div>

        <p className="text-muted-foreground font-medium mb-8 text-sm leading-relaxed uppercase tracking-widest text-[10px]">
          When active, your profile is hidden from the public Discover feed. You will only be visible to members you have explicitly swiped right on.
        </p>

        {!isElite && (
          <div className="mb-8 p-5 bg-black/40 rounded-2xl border border-white/5 flex items-center justify-between">
            <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">Upgrade to Elite to unlock</span>
            <Link href="/premium" className="text-[10px] font-black text-primary underline uppercase tracking-widest">View Tiers</Link>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`text-[10px] font-black uppercase tracking-widest ${isElite ? 'text-white' : 'text-muted-foreground/20'}`}>Enable Ghost Mode</span>
          
          <button 
            onClick={handleToggle}
            disabled={!isElite}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${
              !isElite ? 'bg-white/5 cursor-not-allowed' : 
              incognito ? 'bg-primary' : 'bg-white/10'
            }`}
          >
            <motion.div 
              layout
              className="w-6 h-6 bg-white rounded-full shadow-sm"
              animate={{ x: isElite && incognito ? 24 : 0 }}
            />
          </button>
        </div>
      </div>

      <div className="space-y-4">
        <button className="w-full flex items-center justify-between p-6 bg-card rounded-[1.75rem] border border-white/5 shadow-xl group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
              <FaEyeSlash />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Hidden Contacts</span>
          </div>
          <span className="text-[9px] font-black bg-white/5 text-muted-foreground/60 px-4 py-2 rounded-xl uppercase tracking-widest border border-white/5">Secured</span>
        </button>

        <button className="w-full flex items-center justify-between p-6 bg-card rounded-[1.75rem] border border-white/5 shadow-xl group">
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-muted-foreground group-hover:text-primary transition-colors">
              <FaShieldAlt />
            </div>
            <span className="text-[10px] font-black text-white uppercase tracking-widest">Data & Privacy Center</span>
          </div>
        </button>
      </div>

    </div>
  );
}
