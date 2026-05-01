"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaCrown, FaArrowRight, FaUser, FaEnvelope, FaLock, FaCheckCircle } from "react-icons/fa";

function SignupContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const referralCode = searchParams.get("ref");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    if (!name || !email || !password) {
      setError("All fields are required for the application.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, referralCode }),
      });

      if (res.ok) {
        window.location.assign("/discover");
        return;
      } else {
        const { message } = await res.json();
        setError(message || "An error occurred during registration.");
        setIsLoading(false);
      }
    } catch (error) {
      setError("Connection error. Please try again.");
      console.error(error);
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-yellow-400/30 overflow-hidden font-sans">
      {/* Background Ambience */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-20%] left-[-10%] w-[70%] h-[70%] bg-yellow-400/5 blur-[160px] rounded-full animate-pulse" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02]" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[500px]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-stone-900 to-black border border-yellow-400/20 rounded-full mb-8 shadow-2xl relative"
            >
              <div className="absolute inset-0 bg-yellow-400/10 blur-xl rounded-full" />
              <FaCrown className="text-3xl text-yellow-400 relative z-10" />
            </motion.div>
            <h1 className="text-5xl font-black tracking-tight mb-4 leading-none">
              Apply for <span className="text-yellow-400 italic">Invite</span>
            </h1>
            <p className="text-stone-500 text-sm font-medium tracking-wide">
              Request exclusive access to the SFS Elite network.
            </p>

            {referralCode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 inline-flex items-center gap-2 px-6 py-2.5 bg-yellow-400/10 border border-yellow-400/20 rounded-full"
              >
                <FaCheckCircle className="text-yellow-400 text-xs" />
                <p className="text-[10px] font-black uppercase tracking-[0.25em] text-yellow-400">
                  Elite Referral Valid: {referralCode}
                </p>
              </motion.div>
            )}
          </div>

          {/* Application Card */}
          <div className="bg-stone-900/40 backdrop-blur-3xl border border-white/5 rounded-[3.5rem] p-12 shadow-2xl relative">
            <div className="absolute top-0 left-0 w-full h-px bg-gradient-to-r from-transparent via-yellow-400/30 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest ml-2">
                  <FaUser className="text-yellow-400/40" />
                  Legal Identity
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 focus:bg-white/10 focus:border-yellow-400/50 transition-all outline-none text-sm font-medium"
                  placeholder="Your Full Name"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest ml-2">
                  <FaEnvelope className="text-yellow-400/40" />
                  Primary Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 focus:bg-white/10 focus:border-yellow-400/50 transition-all outline-none text-sm font-medium"
                  placeholder="executive@network.com"
                />
              </div>
              
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest ml-2">
                  <FaLock className="text-yellow-400/40" />
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 focus:bg-white/10 focus:border-yellow-400/50 transition-all outline-none text-sm font-medium"
                  placeholder="Choose Securely"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-red-500/10 border border-red-500/20 py-3 rounded-2xl">
                    <p className="text-[10px] font-black text-red-400 text-center uppercase tracking-wider">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black h-18 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-2xl hover:bg-stone-100 transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4 h-16"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    Submit Application
                    <FaArrowRight className="text-[10px]" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-stone-500 text-[11px] font-bold tracking-wide">
                Already part of the network?{" "}
                <Link href="/auth/login" className="text-white font-black uppercase tracking-widest ml-2 hover:text-yellow-400 transition-colors underline decoration-white/20 underline-offset-8">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-12 text-center text-stone-700 text-[9px] font-black uppercase tracking-[0.4em]">
            STRICT CONFIDENTIALITY ASSURED • SFS ELITE
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <SignupContent />
    </Suspense>
  );
}
