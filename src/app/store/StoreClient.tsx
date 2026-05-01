"use client";

import { motion } from "framer-motion";
import { FaCrown, FaCheck, FaGem } from "react-icons/fa";
import Link from "next/link";

export default function StoreClient() {
  return (
    <div className="min-h-screen bg-background pt-10 px-6 pb-24">
      <div className="text-center mb-16">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-card text-primary rounded-[2.5rem] mb-8 shadow-2xl rotate-3 border border-white/5">
          <FaCrown className="text-4xl" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Elite Access</h1>
        <p className="text-stone-500 font-black uppercase tracking-[0.3em] text-[9px] mt-4">
          Elevate your status in the network
        </p>
      </div>

      <div className="space-y-6">
        {/* Featured Membership */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-8 bg-stone-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-2xl bg-primary flex items-center justify-center text-black shadow-lg shadow-primary/20">
              <FaGem />
            </div>
            <h2 className="text-3xl font-black tracking-tighter uppercase">Elite Concierge</h2>
          </div>

          <ul className="space-y-4 mb-8">
            {["Priority Placement", "Exclusive Networking", "Ghost Browsing", "Unlimited Elite Connections"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-stone-300 text-sm font-medium">
                <FaCheck className="text-yellow-400 text-xs" />
                {f}
              </li>
            ))}
          </ul>

          <Link href="/premium" className="block w-full py-5 bg-primary text-black text-center font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/20 active:scale-95 transition-all hover:bg-yellow-300">
            Upgrade Membership
          </Link>
        </motion.div>

        {/* Info Card */}
        <div className="p-8 border border-white/5 rounded-[2.5rem] bg-card shadow-2xl">
          <h3 className="font-black text-white uppercase tracking-widest text-[10px] mb-3">Verified Identity</h3>
          <p className="text-[10px] text-stone-500 font-medium leading-relaxed uppercase tracking-widest">
            All Elite members undergo a multi-step verification process to ensure the highest quality network.
          </p>
        </div>
      </div>
      
      <p className="text-center text-[10px] font-black text-stone-300 uppercase tracking-widest mt-12">
        Reserved for the top 1% of the community
      </p>
    </div>
  );
}
