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
    <div className="flex flex-col min-h-screen bg-background text-white selection:bg-primary/30 overflow-hidden relative">
      {/* Aether Visual Foundation */}
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[440px]"
        >
          {/* Brand Header */}
          <div className="text-center mb-12">
            <motion.div 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="inline-flex items-center justify-center w-24 h-24 bg-white/5 border border-white/10 rounded-[32px] mb-8 shadow-shadow-glow relative group overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/5 group-hover:bg-primary/10 transition-all duration-700"></div>
              <FaFingerprint className="text-4xl text-primary relative z-10 shadow-shadow-glow" />
            </motion.div>
            
            <h1 className="text-6xl font-heading tracking-tight mb-4 leading-none">
              SFS <span className="text-primary">ELITE</span>
            </h1>
            <div className="flex items-center justify-center gap-4">
              <div className="h-px w-12 bg-gradient-to-r from-transparent to-primary/20" />
              <p className="sub-heading text-[10px] text-primary/60 lowercase tracking-widest">private sanctuary</p>
              <div className="h-px w-12 bg-gradient-to-l from-transparent to-primary/20" />
            </div>
          </div>

          {/* Login Card */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/10 rounded-[40px] p-10 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="sub-heading text-[10px] text-white/40 lowercase ml-2 flex items-center gap-2">
                  <FaEnvelope className="text-primary/40" />
                  Credentials
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-5 focus:bg-white/10 focus:border-primary/40 transition-all outline-none text-sm font-medium placeholder-white/20"
                  placeholder="executive@sfs.elite"
                />
              </div>

              <div className="space-y-3">
                <label className="sub-heading text-[10px] text-white/40 lowercase ml-2 flex items-center gap-2">
                  <FaLock className="text-primary/40" />
                  Security Key
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-5 focus:bg-white/10 focus:border-primary/40 transition-all outline-none text-sm font-medium placeholder-white/20"
                  placeholder="••••••••"
                />
              </div>

              <AnimatePresence mode="wait">
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    className="bg-red-500/5 border border-red-500/20 py-4 rounded-2xl px-4"
                  >
                    <p className="sub-heading text-[10px] text-red-400 text-center lowercase">
                      {error}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-aether w-full h-16 flex items-center justify-center gap-3 group disabled:opacity-40"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span className="sub-heading lowercase">verifying...</span>
                  </div>
                ) : (
                  <>
                    <span className="sub-heading lowercase">request access</span>
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-10 border-t border-white/5 text-center">
              <p className="sub-heading text-[10px] text-white/40 lowercase">
                seeking membership?{" "}
                <Link href="/auth/signup" className="text-primary hover:text-white transition-colors underline decoration-primary/20 underline-offset-8 ml-2">
                  apply for invite
                </Link>
              </p>
            </div>
          </div>

          <div className="mt-16 text-center">
            <p className="sub-heading text-[9px] text-white/20 lowercase tracking-[0.5em]">
              sfs elite • established 2026 • aether network
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

