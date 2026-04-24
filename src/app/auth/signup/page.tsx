"use client";

import { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaCrown } from "react-icons/fa";

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
    <div className="flex flex-col min-h-screen bg-secondary/30">
      <div className="flex-1 w-full flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-md bg-white rounded-3xl shadow-2xl p-8 border border-border"
        >
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 bg-primary text-black rounded-full mb-4">
              <FaCrown className="text-2xl" />
            </div>
            <h1 className="text-3xl font-black text-foreground tracking-tight">Apply for SFS</h1>
            <p className="text-muted-foreground font-medium text-sm mt-2">
              Join the most exclusive dating community.
            </p>
            {referralCode && (
              <div className="mt-4 px-4 py-2 bg-yellow-400/10 border border-yellow-400/20 rounded-xl">
                <p className="text-[10px] font-black uppercase tracking-widest text-yellow-600">
                  ✨ Elite Invite Active: {referralCode}
                </p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Legal Name</label>
              <input
                type="text"
                required
                className="w-full px-4 py-3 mt-1 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all font-medium text-foreground outline-none"
                placeholder="John Doe"
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Work Email</label>
              <input
                type="email"
                required
                className="w-full px-4 py-3 mt-1 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all font-medium text-foreground outline-none"
                placeholder="executive@company.com"
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            
            <div>
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Password</label>
              <input
                type="password"
                required
                className="w-full px-4 py-3 mt-1 bg-secondary border-2 border-transparent rounded-xl focus:bg-white focus:border-primary focus:ring-0 transition-all font-medium text-foreground outline-none"
                placeholder="••••••••"
                onChange={(e) => setPassword(e.target.value)}
              />
              <p className="text-[10px] text-muted-foreground mt-2 ml-1">Must be at least 8 characters</p>
            </div>

            {error && (
              <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-semibold text-red-500 text-center">
                {error}
              </motion.p>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 mt-6 text-sm font-black uppercase tracking-widest text-white bg-black rounded-xl shadow-lg hover:bg-black/80 active:scale-95 transition-all flex justify-center items-center"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              ) : (
                "Submit Application"
              )}
            </button>
          </form>

          <p className="text-sm text-center font-medium text-muted-foreground mt-8">
            Existing Member?{" "}
            <Link href="/auth/login" className="text-foreground font-black underline decoration-primary underline-offset-4">
              Sign In
            </Link>
          </p>
        </motion.div>
      </div>
    </div>
  );
}

export default function Signup() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-secondary/30 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}
