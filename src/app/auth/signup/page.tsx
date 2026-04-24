"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCrown, FaArrowRight } from "react-icons/fa";

function SignupContent() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
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
        router.push("/auth/login?registered=true");
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
    <div className="flex flex-col min-h-screen bg-[#0a0a0a] text-white selection:bg-primary/30">
      {/* Background Effects */}
      <div className="fixed inset-0 bg-luxury-mesh z-0 opacity-40"></div>
      <div className="fixed top-[-10%] left-[-10%] w-[60%] h-[60%] bg-primary/5 blur-[120px] rounded-full z-0"></div>
      
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-[480px]"
        >
          {/* Header */}
          <div className="text-center mb-10">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              className="inline-flex items-center justify-center w-16 h-16 bg-stone-900 border border-primary/30 rounded-full mb-6 shadow-[0_0_20px_rgba(250,204,21,0.15)]"
            >
              <FaCrown className="text-2xl text-primary" />
            </motion.div>
            <h1 className="text-4xl font-black tracking-tight mb-3">
              Membership <span className="text-gold">Application</span>
            </h1>
            <p className="text-stone-400 text-sm font-medium">
              Request exclusive access to the SFS Elite network.
            </p>

            {referralCode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-6 inline-block px-4 py-2 bg-primary/10 border border-primary/20 rounded-full"
              >
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-primary">
                  ✨ Elite Invite Applied: {referralCode}
                </p>
              </motion.div>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-stone-900/40 backdrop-blur-3xl border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid grid-cols-1 gap-5">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">Legal Name</label>
                  <input
                    type="text"
                    required
                    onChange={(e) => setName(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium"
                    placeholder="John Doe"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">Work Email</label>
                  <input
                    type="email"
                    required
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium"
                    placeholder="executive@company.com"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-black text-stone-500 uppercase tracking-widest ml-1">Private Password</label>
                  <input
                    type="password"
                    required
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 focus:bg-white/10 focus:border-primary/50 transition-all outline-none text-sm font-medium"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              {error && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-red-500/10 border border-red-500/20 py-3 rounded-xl">
                  <p className="text-[10px] font-black text-red-400 text-center uppercase tracking-wider">{error}</p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-white text-black h-16 rounded-2xl font-black uppercase tracking-[0.15em] text-xs shadow-xl hover:bg-stone-200 active:scale-[0.98] transition-all flex items-center justify-center gap-3 disabled:opacity-50 mt-4"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    Submit Application
                    <FaArrowRight className="text-[10px]" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-white/5 text-center">
              <p className="text-stone-500 text-[11px] font-medium tracking-wide">
                Already an Elite Member?{" "}
                <Link href="/auth/login" className="text-white font-black uppercase tracking-widest ml-1 hover:text-primary transition-colors">
                  Sign In
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-8 text-center text-stone-600 text-[10px] font-medium uppercase tracking-[0.25em]">
            Strict Confidentiality Assured
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-black" />}>
      <SignupContent />
    </Suspense>
  );
}
