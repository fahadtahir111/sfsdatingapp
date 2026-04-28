"use client";

import { useState } from "react";
import { FaCrown, FaCheck } from "react-icons/fa";
import { upgradeSubscription } from "./actions";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/providers/ToastProvider";

export default function PremiumClient() {
  const [loading, setLoading] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();

  const handleUpgrade = async (tier: "Signature" | "Elite") => {
    setLoading(tier);
    const result = await upgradeSubscription(tier);
    if (result.success) {
      showToast(`Welcome to ${tier} Level! Your access has been elevated.`, "success");
      router.push("/profile");
    } else {
      showToast(result.error || "Upgrade failed", "error");
    }
    setLoading(null);
  };

  return (
    <div className="min-h-screen bg-black text-white pt-10 px-6 pb-24 overflow-y-auto">
      <div className="text-center mb-10">
        <h1 className="text-4xl font-black mb-2 text-primary">SFS Elite</h1>
        <p className="text-white/70 font-medium">Elevate your access.</p>
      </div>

      <div className="space-y-6">
        <div className="p-1 rounded-3xl bg-gradient-to-br from-primary via-accent to-primary">
          <div className="bg-black p-6 rounded-[22px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-black flex items-center gap-2">
                <FaCrown className="text-primary" /> Elite Concierge
              </h2>
              <span className="bg-primary/20 text-primary px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">Most Exclusive</span>
            </div>
            
            <p className="text-3xl font-black mb-1">$99<span className="text-sm text-white/50 font-medium">/month</span></p>
            <p className="text-sm text-white/70 mb-6">Full suite of privacy tools and priority matching.</p>

            <ul className="space-y-3 mb-8">
              {['Ghost Mode Browsing', 'See exactly who liked you', 'Prioritized Discover placement', 'Direct Concierge Access', 'SFS Private Mixer Invites'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-primary flex-shrink-0">
                    <FaCheck className="text-[10px]" />
                  </div>
                  <span className="text-sm font-medium">{feature}</span>
                </li>
              ))}
            </ul>

            <button 
              onClick={() => handleUpgrade("Elite")}
              disabled={!!loading}
              className="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl shadow-lg shadow-primary/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
            >
              {loading === "Elite" ? "Processing..." : "Join Elite Concierge"}
            </button>
          </div>
        </div>

        <div className="border border-white/20 p-6 rounded-3xl bg-white/5">
          <h2 className="text-xl font-bold mb-2">Signature Level</h2>
          <p className="text-2xl font-black mb-1">$29<span className="text-sm text-white/50 font-medium">/month</span></p>
          <p className="text-sm text-white/70 mb-6">Enhanced experience and unlimited swipes.</p>
          
          <ul className="space-y-3 mb-8">
              {['Unlimited Swipes', 'Advanced Filters (Height, Vices)', 'Read Receipts in Chat'].map((feature, i) => (
                <li key={i} className="flex items-start gap-3">
                  <div className="mt-1 w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-white/70 flex-shrink-0">
                    <FaCheck className="text-[10px]" />
                  </div>
                  <span className="text-sm font-medium text-white/80">{feature}</span>
                </li>
              ))}
            </ul>

          <button 
            onClick={() => handleUpgrade("Signature")}
            disabled={!!loading}
            className="w-full py-4 bg-white/10 text-white font-bold rounded-xl hover:bg-white/20 transition-colors border border-white/20 disabled:opacity-50"
          >
            {loading === "Signature" ? "Processing..." : "Upgrade to Signature"}
          </button>
        </div>
      </div>
    </div>
  );
}
