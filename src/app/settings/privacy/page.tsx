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
      <div className="min-h-screen bg-white pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  const isElite = tier === "Elite";

  return (
    <div className="min-h-screen bg-white pt-8 px-6 pb-24">
      <h1 className="text-3xl font-black mb-8 text-foreground">Privacy & Security</h1>

      <div className={`border p-6 rounded-3xl mb-8 relative overflow-hidden transition-all ${
        isElite ? 'bg-secondary/20 border-border' : 'bg-stone-50 border-stone-200 opacity-80'
      }`}>
        {/* Background Accent */}
        <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/10 rounded-full blur-2xl pointer-events-none"></div>

        <div className="flex items-center gap-4 mb-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-xl ${
             isElite ? 'bg-black text-white' : 'bg-stone-200 text-stone-500'
          }`}>
            <FaUserSecret />
          </div>
          <div>
            <h2 className="text-lg font-bold text-foreground">Ghost Mode</h2>
            <p className="text-sm font-semibold text-primary uppercase tracking-wide">Elite Only</p>
          </div>
        </div>

        <p className="text-muted-foreground font-medium mb-6 text-sm leading-relaxed">
          When active, your profile is hidden from the public Discover feed. You will only be visible to members you have explicitly swiped right on.
        </p>

        {!isElite && (
          <div className="mb-6 p-4 bg-white rounded-2xl border border-primary/20 flex items-center justify-between">
            <span className="text-xs font-black text-stone-600">Upgrade to Elite to unlock</span>
            <Link href="/premium" className="text-xs font-black text-primary underline">View Tiers</Link>
          </div>
        )}

        <div className="flex items-center justify-between">
          <span className={`font-bold ${isElite ? 'text-foreground' : 'text-stone-400'}`}>Enable Ghost Mode</span>
          
          <button 
            onClick={handleToggle}
            disabled={!isElite}
            className={`w-14 h-8 rounded-full p-1 transition-colors duration-300 relative ${
              !isElite ? 'bg-stone-200 cursor-not-allowed' : 
              incognito ? 'bg-primary' : 'bg-stone-300'
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
        <button className="w-full flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <FaEyeSlash className="text-muted-foreground" />
            <span className="font-bold text-foreground">Hidden Contacts</span>
          </div>
          <span className="text-sm font-bold bg-secondary text-foreground px-3 py-1 rounded-full">Secure</span>
        </button>

        <button className="w-full flex items-center justify-between p-4 bg-secondary/10 rounded-2xl border border-border">
          <div className="flex items-center gap-3">
            <FaShieldAlt className="text-muted-foreground" />
            <span className="font-bold text-foreground">Data & Privacy Center</span>
          </div>
        </button>
      </div>

    </div>
  );
}
