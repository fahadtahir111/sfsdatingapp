"use client";

import { useEffect, useState } from "react";
import { FaCreditCard, FaCrown } from "react-icons/fa";
import { getProfile } from "../../profile/actions";

export default function BillingSettings() {
  const [profile, setProfile] = useState<{ membership?: string } | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProfile().then(data => {
      setProfile(data);
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
    <div className="min-h-screen bg-background pt-10 px-6 pb-24">
      <div className="flex items-center gap-4 mb-10 text-white">
        <div className="w-12 h-12 bg-primary rounded-2xl flex items-center justify-center text-xl text-black shadow-lg shadow-primary/20">
          <FaCreditCard />
        </div>
        <h1 className="text-3xl font-black tracking-tight uppercase tracking-tighter">Billing</h1>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="p-10 border border-white/5 rounded-[2.5rem] bg-card text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 right-0 p-12 opacity-5 pointer-events-none">
            <FaCrown className="text-[12rem]" />
          </div>
          
          <h2 className="text-xs font-black text-primary uppercase tracking-[0.3em] mb-4 flex items-center gap-2">
            <FaCrown /> {profile?.membership || "SFS Elite Member"}
          </h2>
          <p className="text-3xl font-black tracking-tighter mt-1">
            {profile?.membership === "Signature Member" ? "Active Subscription" : "Standard Tier"}
          </p>
          <div className="mt-10 flex justify-between items-end">
            <span className="text-5xl font-black">
              {profile?.membership === "Signature Member" ? "$499" : "$0"}
              <span className="text-sm font-bold text-stone-500 ml-1">/MO</span>
            </span>
            <button className="bg-primary text-black px-8 py-4 rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-primary/20 hover:scale-105 transition-transform">
              Manage
            </button>
          </div>
        </div>

        {/* Support Card */}
        <div className="p-8 border border-white/5 rounded-[2.5rem] bg-secondary flex justify-between items-center shadow-xl">
          <div>
            <h3 className="font-black text-white uppercase tracking-widest text-[10px]">Billing Support</h3>
            <p className="text-[10px] text-stone-500 font-medium mt-1 uppercase tracking-widest">
              Dedicated assistance for elite members.
            </p>
          </div>
          <button className="bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all shadow-xl">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
