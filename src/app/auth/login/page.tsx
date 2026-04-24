"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { motion } from "framer-motion";
import { FaLock } from "react-icons/fa";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const res = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (res?.error) {
        setError("Invalid credentials. Please try again.");
        setIsLoading(false);
        return;
      }

      router.replace("/discover"); // Redirect to discover instead of root
    } catch (error) {
      setError("An error occurred during login.");
      setIsLoading(false);
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-white">
      {/* Decorative top shape */}
      <div className="h-64 bg-primary rounded-b-[3rem] shadow-xl w-full flex items-center justify-center p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10 mix-blend-overlay"></div>
        <div className="relative z-10 text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-black text-white rounded-full mb-4 shadow-lg">
            <FaLock className="text-2xl" />
          </div>
          <h1 className="text-4xl font-black text-black tracking-tight">SFS</h1>
          <p className="text-black/80 font-bold uppercase tracking-widest text-sm mt-1">Elite Access</p>
        </div>
      </div>

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex-1 w-full max-w-md mx-auto p-8 -mt-16 bg-white rounded-3xl shadow-2xl relative z-20 mb-8 border border-border"
      >
        <h2 className="text-2xl font-black text-foreground mb-6 text-center">Welcome Back</h2>
        
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider ml-1">Email</label>
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
          </div>

          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-sm font-semibold text-red-500 text-center">
              {error}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 mt-4 text-sm font-black uppercase tracking-widest text-black bg-primary rounded-xl shadow-lg hover:bg-yellow-400 active:scale-95 transition-all flex justify-center items-center"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-border text-center">
          <p className="text-sm font-medium text-muted-foreground">
            Want to join the waitlist?{" "}
            <Link href="/auth/signup" className="text-foreground font-black underline decoration-primary underline-offset-4">
              Apply Here
            </Link>
          </p>
        </div>
      </motion.div>
    </div>
  );
}
