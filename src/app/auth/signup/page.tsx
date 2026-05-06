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
    <div className="flex flex-col min-h-screen bg-background text-white selection:bg-primary/30 overflow-hidden relative">
      {/* Aether Visual Foundation */}
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-50" />
      
      <div className="relative z-10 flex flex-col items-center justify-center flex-1 p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          className="w-full max-w-[500px]"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div 
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center justify-center w-20 h-20 bg-white/5 border border-primary/20 rounded-[32px] mb-8 shadow-shadow-glow relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-primary/10 blur-xl rounded-full" />
              <FaCrown className="text-3xl text-primary relative z-10 shadow-shadow-glow" />
            </motion.div>
            <h1 className="text-6xl font-heading tracking-tight mb-4 leading-none">
              Apply for <span className="text-primary italic">Invite</span>
            </h1>
            <p className="sub-heading text-[11px] text-white/40 lowercase tracking-widest">
              Request exclusive access to the Aether network.
            </p>

            {referralCode && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-8 inline-flex items-center gap-3 px-6 py-3 bg-primary/5 border border-primary/20 rounded-full backdrop-blur-sm shadow-shadow-glow"
              >
                <FaCheckCircle className="text-primary text-[10px]" />
                <p className="sub-heading text-[10px] text-primary lowercase tracking-widest">
                  elite referral valid: {referralCode}
                </p>
              </motion.div>
            )}
          </div>

          {/* Application Card */}
          <div className="bg-white/5 backdrop-blur-3xl border border-white/5 rounded-[48px] p-12 shadow-2xl relative overflow-hidden group">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
            
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="space-y-3">
                <label className="sub-heading text-[10px] text-white/40 lowercase ml-2 flex items-center gap-2">
                  <FaUser className="text-primary/40" />
                  Legal Identity
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-5 focus:bg-white/10 focus:border-primary/40 transition-all outline-none text-sm font-medium placeholder-white/20"
                  placeholder="Your Full Name"
                />
              </div>
              
              <div className="space-y-3">
                <label className="sub-heading text-[10px] text-white/40 lowercase ml-2 flex items-center gap-2">
                  <FaEnvelope className="text-primary/40" />
                  Primary Email
                </label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-5 focus:bg-white/10 focus:border-primary/40 transition-all outline-none text-sm font-medium placeholder-white/20"
                  placeholder="executive@network.com"
                />
              </div>
              
              <div className="space-y-3">
                <label className="sub-heading text-[10px] text-white/40 lowercase ml-2 flex items-center gap-2">
                  <FaLock className="text-primary/40" />
                  Master Password
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-[20px] px-6 py-5 focus:bg-white/10 focus:border-primary/40 transition-all outline-none text-sm font-medium placeholder-white/20"
                  placeholder="Choose Securely"
                />
              </div>

              <AnimatePresence>
                {error && (
                  <motion.div 
                    initial={{ opacity: 0, scale: 0.95 }} 
                    animate={{ opacity: 1, scale: 1 }} 
                    className="bg-red-500/5 border border-red-500/20 py-4 rounded-2xl px-4 text-center"
                  >
                    <p className="sub-heading text-[10px] text-red-400 lowercase">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={isLoading}
                className="btn-aether w-full h-16 flex items-center justify-center gap-3 group disabled:opacity-40"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-black/30 border-t-black rounded-full animate-spin"></div>
                ) : (
                  <>
                    <span className="sub-heading lowercase">submit application</span>
                    <FaArrowRight className="text-[10px] group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-12 pt-10 border-t border-white/5 text-center">
              <p className="sub-heading text-[10px] text-white/40 lowercase">
                already part of the network?{" "}
                <Link href="/auth/login" className="text-white hover:text-primary transition-colors underline decoration-white/20 underline-offset-8 ml-2">
                  sign in
                </Link>
              </p>
            </div>
          </div>

          <p className="mt-16 text-center sub-heading text-[9px] text-white/20 lowercase tracking-[0.5em]">
            strict confidentiality assured • aether network
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

