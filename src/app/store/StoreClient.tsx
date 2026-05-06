"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { FaCrown, FaCheck, FaGem, FaRocket, FaHeart, FaFire, FaBolt, FaInfinity } from "react-icons/fa";
import Link from "next/link";

const PLANS = [
  {
    id: "monthly",
    label: "Monthly",
    price: "$49",
    period: "/mo",
    badge: null,
    savings: null,
  },
  {
    id: "quarterly",
    label: "Quarterly",
    price: "$39",
    period: "/mo",
    badge: "Popular",
    savings: "Save 20%",
  },
  {
    id: "annual",
    label: "Annual",
    price: "$29",
    period: "/mo",
    badge: "Best Value",
    savings: "Save 41%",
  },
];

const FEATURES = [
  { icon: FaInfinity, text: "Unlimited Elite Connections", desc: "No daily swipe limits" },
  { icon: FaCrown, text: "Priority Placement", desc: "Always first in Discover" },
  { icon: FaGem, text: "Ghost Browsing", desc: "View profiles anonymously" },
  { icon: FaRocket, text: "Profile Boost Included", desc: "2× monthly boosts" },
  { icon: FaHeart, text: "See Who Liked You", desc: "Full access to Interests" },
  { icon: FaFire, text: "Super Likes", desc: "5 per day guaranteed" },
  { icon: FaBolt, text: "Instant Matching", desc: "Skip the queue" },
];

const ROSE_PACKS = [
  { roses: 10, price: "$4.99", label: "Starter", popular: false },
  { roses: 30, price: "$12.99", label: "Popular", popular: true },
  { roses: 100, price: "$34.99", label: "Elite", popular: false },
  { roses: 500, price: "$149.99", label: "Whale", popular: false },
];

export default function StoreClient() {
  const [selectedPlan, setSelectedPlan] = useState("quarterly");
  const [activeTab, setActiveTab] = useState<"elite" | "roses">("elite");
  const [processingPlan, setProcessingPlan] = useState<string | null>(null);

  const handleSubscribe = async (planId: string) => {
    setProcessingPlan(planId);
    // Route to billing/checkout
    window.location.href = `/settings/billing?plan=${planId}`;
  };

  const handleBuyRoses = async (amount: number, price: string) => {
    setProcessingPlan(`roses-${amount}`);
    window.location.href = `/settings/billing?roses=${amount}&price=${encodeURIComponent(price)}`;
  };

  return (
    <div className="min-h-screen bg-background pb-28 relative">
      {/* Aether Visual Foundation */}
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-40" />

      {/* Hero Header */}
      <div className="relative overflow-hidden z-10">
        <div className="relative z-10 text-center pt-20 pb-12 px-6">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 200, damping: 15 }}
            className="inline-flex w-24 h-24 items-center justify-center bg-white/5 border border-primary/20 rounded-[32px] mb-8 shadow-shadow-glow relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-all duration-700" />
            <FaCrown className="text-primary text-5xl relative z-10 shadow-shadow-glow" />
          </motion.div>
          <h1 className="text-6xl font-heading text-white tracking-tight leading-none">Elite Access</h1>
          <p className="sub-heading text-[11px] lowercase text-primary/60 mt-4 tracking-widest">
            reserved for the aether network
          </p>
        </div>
      </div>

      <div className="page-shell space-y-10 relative z-10">
        {/* Tab Toggle */}
        <div className="flex bg-white/5 backdrop-blur-md border border-white/10 rounded-[20px] p-1.5 gap-1.5">
          {[
            { id: "elite", label: "elite membership" },
            { id: "roses", label: "rose packs 🌹" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "elite" | "roses")}
              className={`flex-1 py-3.5 rounded-[14px] sub-heading text-[10px] lowercase transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-black shadow-shadow-glow"
                  : "text-white/40 hover:text-white"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "elite" ? (
          <>
            {/* Plan Selector */}
            <div className="grid grid-cols-3 gap-3.5">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-[28px] p-5 text-center border transition-all duration-500 group ${
                    selectedPlan === plan.id
                      ? "border-primary/40 bg-primary/5 shadow-shadow-glow"
                      : "border-white/5 bg-white/5 hover:border-white/10"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black sub-heading text-[8px] px-3 py-1 rounded-full lowercase tracking-widest whitespace-nowrap shadow-shadow-glow z-10">
                      {plan.badge}
                    </div>
                  )}
                  <p className="sub-heading text-[9px] lowercase text-white/30 mb-2">{plan.label}</p>
                  <p className={`text-3xl font-heading leading-none mb-1 ${selectedPlan === plan.id ? "text-primary" : "text-white"}`}>{plan.price}</p>
                  <p className="sub-heading text-[8px] text-white/20 lowercase">{plan.period}</p>
                  {plan.savings && (
                    <p className="sub-heading text-[8px] text-primary mt-2 lowercase">{plan.savings}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Main CTA Card */}
            <motion.div
              layout
              className="relative rounded-[40px] overflow-hidden bg-white/5 backdrop-blur-2xl border border-white/10 p-10 shadow-2xl group"
            >
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -mr-32 -mt-32 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />

              <div className="flex items-center gap-5 mb-10 relative z-10">
                <div className="w-16 h-16 rounded-[24px] bg-primary flex items-center justify-center text-black shadow-shadow-glow">
                  <FaGem className="text-2xl" />
                </div>
                <div>
                  <h2 className="text-3xl font-heading text-white tracking-tight">Elite Concierge</h2>
                  <p className="sub-heading text-[10px] text-primary lowercase mt-1">everything unlocked</p>
                </div>
              </div>

              <ul className="space-y-5 mb-10 relative z-10">
                {FEATURES.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-4 group/item"
                  >
                    <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 group-hover/item:border-primary/30 transition-all">
                      <f.icon className="text-primary text-[10px]" />
                    </div>
                    <div className="flex-1">
                      <p className="font-heading text-xs text-white tracking-tight group-hover/item:text-primary transition-colors">{f.text}</p>
                      <p className="sub-heading text-[9px] text-white/30 lowercase mt-0.5">{f.desc}</p>
                    </div>
                    <FaCheck className="text-primary/40 text-[10px] ml-auto flex-shrink-0" />
                  </motion.li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={processingPlan === selectedPlan}
                className="btn-aether w-full py-5 flex items-center justify-center gap-3 relative z-10 disabled:opacity-40"
              >
                {processingPlan === selectedPlan ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaCrown className="text-sm" /> 
                    <span className="sub-heading lowercase">Unlock Elite — {PLANS.find((p) => p.id === selectedPlan)?.price}{PLANS.find((p) => p.id === selectedPlan)?.period}</span>
                  </>
                )}
              </button>
            </motion.div>

            {/* Trust badges */}
            <div className="flex justify-center gap-10 text-center px-4">
              {[
                { emoji: "🔒", label: "secure payment" },
                { emoji: "↩️", label: "cancel anytime" },
                { emoji: "⚡", label: "instant access" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-2 group cursor-default">
                  <span className="text-2xl group-hover:scale-110 transition-transform duration-500">{b.emoji}</span>
                  <span className="sub-heading text-[8px] lowercase text-white/20 group-hover:text-white/40 transition-colors">{b.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Roses Economy */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[40px] p-8 text-center relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none group-hover:bg-primary/10 transition-all duration-1000" />
              <div className="text-5xl mb-5 group-hover:scale-110 transition-transform duration-700">🌹</div>
              <h2 className="text-3xl font-heading text-white tracking-tight leading-none mb-3">Rose Economy</h2>
              <p className="sub-heading text-[11px] text-white/40 lowercase max-w-xs mx-auto leading-relaxed">
                send roses to stand out. members who receive roses are 3× more likely to respond within the aether.
              </p>
            </div>

            {/* Rose Packs */}
            <div className="grid grid-cols-2 gap-5">
              {ROSE_PACKS.map((pack, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: i * 0.08 }}
                  onClick={() => handleBuyRoses(pack.roses, pack.price)}
                  disabled={processingPlan === `roses-${pack.roses}`}
                  className={`relative rounded-[36px] p-8 text-center border transition-all duration-500 group overflow-hidden ${
                    pack.popular
                      ? "border-primary/30 bg-primary/5 shadow-shadow-glow"
                      : "border-white/5 bg-white/5 hover:border-white/10"
                  }`}
                >
                  <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                  
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black sub-heading text-[8px] px-4 py-1.5 rounded-full lowercase tracking-widest shadow-shadow-glow z-10">
                      most popular
                    </div>
                  )}
                  <div className="text-4xl mb-4 group-hover:scale-110 transition-transform duration-700 relative z-10">🌹</div>
                  <div className={`text-5xl font-heading leading-none mb-2 relative z-10 ${pack.popular ? "text-primary shadow-shadow-glow" : "text-white"}`}>
                    {pack.roses}
                  </div>
                  <div className="sub-heading text-[10px] lowercase text-white/20 mb-6 relative z-10">roses</div>
                  <div className="font-heading text-lg text-white mb-1 relative z-10">{pack.price}</div>
                  <div className="sub-heading text-[9px] text-white/40 lowercase relative z-10">{pack.label} pack</div>

                  {processingPlan === `roses-${pack.roses}` && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-[36px] z-20">
                      <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin shadow-shadow-glow" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* How Roses Work */}
            <div className="bg-white/5 backdrop-blur-md border border-white/5 rounded-[40px] p-10 space-y-8">
              <h3 className="sub-heading text-[10px] lowercase text-white/20 tracking-widest">protocol operations</h3>
              <div className="space-y-6">
                {[
                  { step: "01", text: "Send a Rose to someone who catches your eye", icon: "🌹" },
                  { step: "02", text: "They get a priority notification with your name", icon: "🔔" },
                  { step: "03", text: "If they accept, you match instantly", icon: "💘" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-5 group">
                    <div className="text-3xl grayscale group-hover:grayscale-0 transition-all duration-500">{item.icon}</div>
                    <div>
                      <p className="sub-heading text-[9px] text-primary lowercase tracking-widest mb-1">phase {item.step}</p>
                      <p className="text-xs font-medium text-white/60 lowercase">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center sub-heading text-[9px] text-white/20 lowercase tracking-[0.5em] pb-4">
              roses never expire • aether security assured
            </p>
          </>
        )}

        {/* Verified Identity CTA */}
        <Link
          href="/verify"
          className="block bg-white/5 backdrop-blur-md border border-white/5 rounded-[32px] p-6 hover:bg-white/10 hover:border-primary/30 transition-all group overflow-hidden relative"
        >
          <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
          <div className="flex items-center justify-between relative z-10">
            <div className="flex items-center gap-5">
              <div className="w-14 h-14 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center group-hover:border-primary/40 transition-all shadow-xl">
                <FaCheck className="text-primary shadow-shadow-glow" />
              </div>
              <div>
                <h4 className="font-heading text-sm text-white tracking-tight">Identity Verification</h4>
                <p className="sub-heading text-[9px] text-white/30 lowercase mt-1">Stand out with the elite badge</p>
              </div>
            </div>
            <div className="text-white/20 group-hover:text-primary transition-all text-xl group-hover:translate-x-1 duration-300">›</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
