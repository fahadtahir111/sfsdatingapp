"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaLock, FaChevronRight } from "react-icons/fa";

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
        // Force navigation in production to avoid rare client-router stalls.
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
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-luxury-mesh z-0 opacity-50"></div>
      <div className="fixed top-[-10%] right-[-10%] w-[50%] h-[50%] bg-primary/5 blur-[120px] rounded-full z-0"></div>
      <div className="fixed bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-primary/3 blur-[120px] rounded-full z-0"></div>

      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="w-full max-w-[420px]"
        >
          {/* Logo/Header Area */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-stone-900 border border-primary/20 rounded-2xl mb-6 shadow-2xl relative group"
            >
              <div className="absolute inset-0 bg-primary/10 rounded-2xl blur-xl group-hover:bg-primary/20 transition-all"></div>
              <FaLock className="text-3xl text-primary relative z-10" />
            </motion.div>
            <h1 className="text-5xl font-black tracking-tighter mb-2">
              <span className="text-white">SFS</span>
              <span className="text-primary italic">.</span>
              <span className="text-gold">ELITE</span>
            </h1>
            <p className="text-stone-400 font-medium tracking-[0.2em] uppercase text-[10px]">Private Membership Entrance</p>
          </div>

          {/* Login Card */}
          <div className="bg-stone-900/40 backdrop-blur-3xl border border-white/5 rounded-[2.5rem] p-10 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-primary/30 to-transparent"></div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-1.5">
                <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">Verified Email</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium"
                  placeholder="executive@sfs.elite"
                />
              </div>

              <div className="space-y-1.5">
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest">Security Code</label>
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium"
                  placeholder="••••••••"
                />
              </div>

              {error && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-red-500/10 border border-red-500/20 py-3 rounded-xl"
                >
                  <p className="text-[10px] font-black text-red-400 text-center uppercase tracking-wider">
                    {error}
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-primary text-black h-16 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-[0_0_30px_rgba(250,204,21,0.2)] hover:shadow-[0_0_40px_rgba(250,204,21,0.3)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-3 group disabled:opacity-50 disabled:grayscale"
              >
                {isLoading ? (
                  <div className="flex items-center gap-3">
                    <div className="w-4 h-4 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                    <span className="animate-pulse">Authorizing...</span>
                  </div>
                ) : (
                  <>
                    Enter Club
                    <FaChevronRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-10 pt-8 border-t border-white/5 text-center">
              <p className="text-stone-500 text-[11px] font-medium tracking-wide">
                Seeking Membership?{" "}
                <Link href="/auth/signup" className="text-primary font-black uppercase tracking-widest ml-1 hover:text-white transition-colors underline-offset-4 underline decoration-primary/30">
                  Apply Now
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-stone-600 text-[10px] font-medium uppercase tracking-[0.25em]">
            © 2026 SFS Elite Society
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Login() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <LoginForm />
    </Suspense>
  );
}
