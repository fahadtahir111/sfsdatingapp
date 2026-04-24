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
      <div className="min-h-screen bg-white pt-24 items-center flex justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pt-10 px-6 pb-24">
      <div className="flex items-center gap-4 mb-8 text-black">
        <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center text-xl">
          <FaCreditCard />
        </div>
        <h1 className="text-3xl font-black tracking-tight">Billing</h1>
      </div>

      <div className="space-y-6">
        {/* Current Plan */}
        <div className="p-6 border-2 border-black rounded-3xl bg-black text-white relative overflow-hidden">
          <div className="absolute -top-10 -right-10 w-32 h-32 bg-primary/20 blur-3xl rounded-full" />
          <h2 className="text-lg font-bold text-primary flex items-center gap-2">
            <FaCrown /> {profile?.membership || "SFS Elite Member"}
          </h2>
          <p className="text-sm font-medium mt-1 opacity-80">
            {profile?.membership === "Signature Member" ? "Active Subscription" : "Standard Account"}
          </p>
          <div className="mt-6 flex justify-between items-center">
            <span className="text-3xl font-black">
              {profile?.membership === "Signature Member" ? "$499" : "$0"}
              <span className="text-sm">/mo</span>
            </span>
            <button className="bg-white text-black px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider">
              Manage
            </button>
          </div>
        </div>

        {/* Support Card */}
        <div className="p-6 border border-stone-100 rounded-3xl bg-stone-50 flex justify-between items-center">
          <div>
            <h3 className="font-bold text-stone-800">Billing Support</h3>
            <p className="text-xs text-stone-400 font-medium mt-1">
              Need help with your subscription?
            </p>
          </div>
          <button className="bg-white border border-stone-200 text-stone-900 px-4 py-3 rounded-xl text-xs font-bold uppercase tracking-wider shadow-sm transition-transform active:scale-95">
            Contact
          </button>
        </div>
      </div>
    </div>
  );
}
