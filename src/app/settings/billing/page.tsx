"use client";

import { useEffect, useState } from "react";
import { FaCreditCard, FaCrown } from "react-icons/fa";
import { getProfile } from "../../profile/actions";

export default function BillingSettings() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(() => {
      setLoading(false);
    });
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-background pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="page-shell pt-10">
      <div className="flex items-center gap-4 mb-10">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl text-primary-foreground shadow-lg shadow-primary/20">
          <FaCreditCard />
        </div>
        <div>
          <h1 className="text-3xl font-black tracking-tight uppercase">Membership</h1>
          <p className="text-muted-foreground font-medium text-sm">Select your tier to unlock the full potential of SFS Elite.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Signature Tier */}
        <div className="surface-card p-10 relative overflow-hidden flex flex-col">
          <div className="absolute top-0 right-0 p-8 opacity-5">
            <FaCrown className="text-8xl" />
          </div>
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4">Signature</h2>
          <div className="text-5xl font-black mb-8">$49<span className="text-lg text-muted-foreground ml-1">/mo</span></div>
          
          <ul className="space-y-4 mb-10 flex-grow">
            <TierFeature text="200 Daily Swipes" />
            <TierFeature text="50 Mile Discovery Range" />
            <TierFeature text="Host 3 Active Boardrooms" />
            <TierFeature text="Signature Badge" />
          </ul>

          <button className="w-full py-5 border border-primary text-primary rounded-2xl font-black uppercase tracking-widest text-xs hover:bg-primary hover:text-primary-foreground transition-all">
            Upgrade to Signature
          </button>
        </div>

        {/* Elite Tier */}
        <div className="surface-card p-10 bg-luxury-mesh border-primary/40 relative overflow-hidden flex flex-col shadow-2xl shadow-primary/10">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <FaCrown className="text-8xl text-primary" />
          </div>
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <FaCrown /> Elite Status
          </h2>
          <div className="text-5xl font-black mb-8">$199<span className="text-lg text-muted-foreground ml-1">/mo</span></div>
          
          <ul className="space-y-4 mb-10 flex-grow">
            <TierFeature text="Unlimited Swipes" />
            <TierFeature text="Global Discovery Network" />
            <TierFeature text="Unlimited Boardrooms" />
            <TierFeature text="25% Algorithm Visibility Boost" />
            <TierFeature text="5 Direct Invite DM's per Day" />
            <TierFeature text="Exclusive Elite Verification" />
          </ul>

          <button className="w-full py-5 bg-primary text-primary-foreground rounded-2xl font-black uppercase tracking-widest text-xs shadow-xl shadow-primary/20 hover:scale-[1.02] transition-transform">
            Go Elite
          </button>
        </div>
      </div>
    </div>
  );
}

function TierFeature({ text }: { text: string }) {
  return (
    <li className="flex items-center gap-3 text-sm font-bold text-foreground">
      <div className="w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(255,215,0,0.5)]" />
      {text}
    </li>
  );
}
