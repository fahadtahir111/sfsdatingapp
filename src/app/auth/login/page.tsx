"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { FaLock, FaChevronRight, FaEnvelope, FaFingerprint } from "react-icons/fa";

function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/discover";

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        window.location.assign(callbackUrl);
        return;
      } else {
        setError(data.message || "Invalid access credentials.");
        setIsLoading(false);
      }
    } catch (error) {
      setError("An error occurred during authentication.");
      setIsLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#050505] text-white selection:bg-primary/30 overflow-hidden font-sans">
      {/* Dynamic Luxury Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute top-[-10%] right-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full animate-pulse" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[140px] rounded-full" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.03] mix-blend-overlay" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Brand Header */}
          <div className="text-center mb-10">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-stone-900 to-black border border-white/10 rounded-3xl mb-8 shadow-2xl relative group"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-3xl blur-2xl group-hover:bg-primary/20 transition-all duration-500"></div>
              <FaFingerprint className="text-4xl text-primary relative z-10" />
            </motion.div>
            
            <h1 className="text-5xl font-black tracking-tighter mb-3 leading-none">
              SFS <span className="text-primary">ELITE</span>
            </h1>
            <div className="flex items-center justify-center gap-2">
              <div className="h-px w-8 bg-gradient-to-r from-transparent to-stone-700" />
              <p className="text-stone-500 font-bold tracking-[0.3em] uppercase text-[9px]">Private Sanctuary</p>
              <div className="h-px w-8 bg-gradient-to-l from-transparent to-stone-700" />
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-stone-900/30 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-10 shadow-2xl relative">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-1 bg-gradient-to-r from-transparent via-yellow-400/40 to-transparent rounded-full" />
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest ml-2">
                  <FaEnvelope className="text-primary/50" />
                  Credentials
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium placeholder-stone-600"
                  placeholder="executive@sfs.elite"
                />
              </div>

              <div className="space-y-2">
                <label className="flex items-center gap-2 text-[10px] font-black text-stone-500 uppercase tracking-widest ml-2">
                  <FaLock className="text-primary/50" />
                  Security Key
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-6 py-4.5 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium placeholder-stone-600"
                  placeholder="••••••••"
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="bg-red-500/10 border border-red-500/20 py-3 rounded-xl px-4">
                      <p className="text-[10px] font-black text-red-400 text-center uppercase tracking-wider">
                        {error}
                      </p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.99 }}
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black h-16 rounded-2xl font-black uppercase tracking-[0.2em] text-[11px] shadow-[0_10px_30px_rgba(250,204,21,0.2)] hover:shadow-[0_15px_40px_rgba(250,204,21,0.3)] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span className="animate-pulse">Verifying...</span>
                  </div>
                ) : (
                  <>
                    Request Access
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </motion.button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-stone-500 text-[11px] font-bold tracking-wide">
                Seeking Membership?{" "}
                <Link href="/auth/signup" className="text-primary font-black uppercase tracking-widest ml-2 hover:text-white transition-colors underline decoration-yellow-400/20 underline-offset-8">
                  Apply for Invite
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-stone-700 text-[9px] font-black uppercase tracking-[0.4em]">
              SFS ELITE • EST. 2026 • GLOBAL SOCIETY
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-[#050505]" />}>
      <LoginForm />
    </Suspense>
  );
}

