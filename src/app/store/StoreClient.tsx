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
    <div className="min-h-screen bg-background pb-24">
      {/* Hero Header */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/10 via-primary/3 to-transparent pointer-events-none" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[300px] bg-primary/5 blur-[120px] rounded-full pointer-events-none" />

        <div className="relative z-10 text-center pt-14 pb-10 px-6">
          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 3 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="inline-flex w-20 h-20 items-center justify-center bg-card border border-primary/20 rounded-[2rem] mb-6 shadow-2xl shadow-primary/10"
          >
            <FaCrown className="text-primary text-4xl" />
          </motion.div>
          <h1 className="text-4xl font-black text-foreground tracking-tighter uppercase">Elite Access</h1>
          <p className="text-muted-foreground font-black uppercase tracking-widest text-[9px] mt-3">
            Reserved for the top 1% of the community
          </p>
        </div>
      </div>

      <div className="page-shell space-y-8">
        {/* Tab Toggle */}
        <div className="flex bg-secondary border border-border rounded-2xl p-1 gap-1">
          {[
            { id: "elite", label: "Elite Membership" },
            { id: "roses", label: "Buy Roses 🌹" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as "elite" | "roses")}
              className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                activeTab === tab.id
                  ? "bg-primary text-black shadow-lg shadow-primary/20"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "elite" ? (
          <>
            {/* Plan Selector */}
            <div className="grid grid-cols-3 gap-3">
              {PLANS.map((plan) => (
                <button
                  key={plan.id}
                  onClick={() => setSelectedPlan(plan.id)}
                  className={`relative rounded-2xl p-4 text-center border transition-all ${
                    selectedPlan === plan.id
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-border bg-card hover:border-primary/30"
                  }`}
                >
                  {plan.badge && (
                    <div className="absolute -top-2.5 left-1/2 -translate-x-1/2 bg-primary text-black text-[8px] font-black px-2.5 py-1 rounded-full uppercase tracking-widest whitespace-nowrap shadow-lg shadow-primary/20">
                      {plan.badge}
                    </div>
                  )}
                  <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-1">{plan.label}</p>
                  <p className={`text-2xl font-black ${selectedPlan === plan.id ? "text-primary" : "text-foreground"}`}>{plan.price}</p>
                  <p className="text-[9px] text-muted-foreground font-medium">{plan.period}</p>
                  {plan.savings && (
                    <p className="text-[9px] font-black text-green-400 mt-1">{plan.savings}</p>
                  )}
                </button>
              ))}
            </div>

            {/* Main CTA Card */}
            <motion.div
              layout
              className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-card via-card to-primary/5 border border-primary/20 p-8 shadow-2xl shadow-primary/5"
            >
              <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 blur-3xl pointer-events-none" />

              <div className="flex items-center gap-4 mb-8 relative z-10">
                <div className="w-14 h-14 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/30">
                  <FaGem className="text-xl" />
                </div>
                <div>
                  <h2 className="text-2xl font-black text-foreground tracking-tight uppercase">Elite Concierge</h2>
                  <p className="text-[10px] text-primary font-black uppercase tracking-widest">Everything unlocked</p>
                </div>
              </div>

              <ul className="space-y-4 mb-8 relative z-10">
                {FEATURES.map((f, i) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex items-center gap-3 text-foreground"
                  >
                    <div className="w-8 h-8 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center flex-shrink-0">
                      <f.icon className="text-primary text-xs" />
                    </div>
                    <div>
                      <p className="text-xs font-black text-foreground">{f.text}</p>
                      <p className="text-[10px] text-muted-foreground font-medium">{f.desc}</p>
                    </div>
                    <FaCheck className="text-primary text-xs ml-auto flex-shrink-0" />
                  </motion.li>
                ))}
              </ul>

              <button
                onClick={() => handleSubscribe(selectedPlan)}
                disabled={processingPlan === selectedPlan}
                className="w-full py-5 bg-primary text-black text-xs font-black uppercase tracking-widest rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-60 flex items-center justify-center gap-3 relative z-10"
              >
                {processingPlan === selectedPlan ? (
                  <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <FaCrown /> Unlock Elite — {PLANS.find((p) => p.id === selectedPlan)?.price}{PLANS.find((p) => p.id === selectedPlan)?.period}
                  </>
                )}
              </button>
            </motion.div>

            {/* Trust badges */}
            <div className="flex justify-center gap-6 text-center">
              {[
                { emoji: "🔒", label: "Secure Payment" },
                { emoji: "↩️", label: "Cancel Anytime" },
                { emoji: "⚡", label: "Instant Access" },
              ].map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1">
                  <span className="text-xl">{b.emoji}</span>
                  <span className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">{b.label}</span>
                </div>
              ))}
            </div>
          </>
        ) : (
          <>
            {/* Roses Economy */}
            <div className="bg-gradient-to-br from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-3xl p-6 text-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-2xl pointer-events-none" />
              <div className="text-4xl mb-3">🌹</div>
              <h2 className="text-xl font-black text-foreground uppercase tracking-tight mb-1">Rose Economy</h2>
              <p className="text-xs text-muted-foreground font-medium max-w-xs mx-auto">
                Send Roses to stand out. Members who receive roses are 3× more likely to respond.
              </p>
            </div>

            {/* Rose Packs */}
            <div className="grid grid-cols-2 gap-4">
              {ROSE_PACKS.map((pack, i) => (
                <motion.button
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.08 }}
                  onClick={() => handleBuyRoses(pack.roses, pack.price)}
                  disabled={processingPlan === `roses-${pack.roses}`}
                  className={`relative rounded-3xl p-6 text-center border transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-60 ${
                    pack.popular
                      ? "border-primary/30 bg-primary/10 shadow-xl shadow-primary/10"
                      : "border-border bg-card hover:border-primary/20"
                  }`}
                >
                  {pack.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-black text-[8px] font-black px-3 py-1 rounded-full uppercase tracking-widest shadow-lg shadow-primary/20">
                      Most Popular
                    </div>
                  )}
                  <div className="text-3xl mb-2">🌹</div>
                  <div className={`text-3xl font-black mb-1 ${pack.popular ? "text-primary" : "text-foreground"}`}>
                    {pack.roses}
                  </div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-muted-foreground mb-3">Roses</div>
                  <div className="font-black text-foreground text-sm">{pack.price}</div>
                  <div className="text-[9px] text-muted-foreground font-medium">{pack.label} Pack</div>

                  {processingPlan === `roses-${pack.roses}` && (
                    <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-3xl">
                      <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                    </div>
                  )}
                </motion.button>
              ))}
            </div>

            {/* How Roses Work */}
            <div className="bg-card border border-border rounded-3xl p-6">
              <h3 className="text-xs font-black uppercase tracking-widest text-muted-foreground mb-5">How Roses Work</h3>
              <div className="space-y-4">
                {[
                  { step: "1", text: "Send a Rose to someone who catches your eye", icon: "🌹" },
                  { step: "2", text: "They get a priority notification with your name", icon: "🔔" },
                  { step: "3", text: "If they accept, you match instantly", icon: "💘" },
                ].map((item) => (
                  <div key={item.step} className="flex items-center gap-4">
                    <div className="text-2xl">{item.icon}</div>
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-primary mb-0.5">Step {item.step}</p>
                      <p className="text-xs font-medium text-foreground">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <p className="text-center text-[10px] font-black text-muted-foreground uppercase tracking-widest">
              Roses never expire · Fully secure payments
            </p>
          </>
        )}

        {/* Verified Identity CTA */}
        <Link
          href="/verify"
          className="block bg-card border border-border rounded-3xl p-6 hover:border-primary/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-primary/10 border border-primary/20 flex items-center justify-center">
                <FaCheck className="text-primary" />
              </div>
              <div>
                <h4 className="text-sm font-black text-foreground">Get Verified Badge</h4>
                <p className="text-[10px] text-muted-foreground font-medium mt-0.5">Stand out with the blue checkmark</p>
              </div>
            </div>
            <div className="text-muted-foreground text-lg">›</div>
          </div>
        </Link>
      </div>
    </div>
  );
}
