"use client";

import { motion } from "framer-motion";
import { FaCrown, FaCheck, FaGem } from "react-icons/fa";
import Link from "next/link";

export default function StoreClient() {
  return (
    <div className="min-h-screen bg-white pt-10 px-6 pb-24">
      <div className="text-center mb-12">
        <div className="inline-flex items-center justify-center w-24 h-24 bg-stone-900 text-yellow-400 rounded-[2.5rem] mb-6 shadow-2xl rotate-3">
          <FaCrown className="text-4xl" />
        </div>
        <h1 className="text-4xl font-black text-stone-900 tracking-tighter">ELITE ACCESS</h1>
        <p className="text-stone-400 font-bold uppercase tracking-widest text-[10px] mt-2">
          Elevate your status in the community
        </p>
      </div>

      <div className="space-y-6">
        {/* Featured Membership */}
        <motion.div 
          whileHover={{ scale: 1.02 }}
          className="p-8 bg-stone-900 rounded-[3rem] text-white relative overflow-hidden shadow-2xl"
        >
          <div className="absolute top-0 right-0 w-40 h-40 bg-yellow-400/10 rounded-full -mr-20 -mt-20 blur-3xl" />
          
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-yellow-400 flex items-center justify-center text-stone-900">
              <FaGem />
            </div>
            <h2 className="text-2xl font-black tracking-tight">Elite Concierge</h2>
          </div>

          <ul className="space-y-4 mb-8">
            {["Priority Placement", "Exclusive Networking", "Ghost Browsing", "Unlimited Matches"].map((f) => (
              <li key={f} className="flex items-center gap-3 text-stone-300 text-sm font-medium">
                <FaCheck className="text-yellow-400 text-xs" />
                {f}
              </li>
            ))}
          </ul>

          <Link href="/premium" className="block w-full py-4 bg-yellow-400 text-stone-950 text-center font-black rounded-2xl shadow-xl shadow-yellow-400/20 active:scale-95 transition-all">
            Upgrade Now
          </Link>
        </motion.div>

        {/* Info Card */}
        <div className="p-6 border-2 border-stone-100 rounded-[2.5rem] bg-stone-50/50">
          <h3 className="font-black text-stone-800 mb-2">Verified Identity</h3>
          <p className="text-xs text-stone-400 font-medium leading-relaxed">
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
