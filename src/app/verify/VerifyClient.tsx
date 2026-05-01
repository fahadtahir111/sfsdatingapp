"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaCamera, FaIdCard, FaCheckCircle, FaArrowRight, FaRedoAlt } from "react-icons/fa";
import {
  submitVerification,
  simulateVerifyUser,
  getOnboardingStatus,
  saveOnboardingStep,
  startOnboarding,
} from "./actions";
import type { OnboardingApiResult } from "@/lib/onboarding";
import { useRouter } from "next/navigation";
import { useToast } from "@/app/providers/ToastProvider";

type InitialStatus = OnboardingApiResult | null;

const IS_DEV = process.env.NODE_ENV !== "production";

export default function VerifyClient({ initialStatus }: { initialStatus?: InitialStatus }) {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isBootstrapping, setIsBootstrapping] = useState(!initialStatus);
  const [loadError, setLoadError] = useState<string | null>(null);
  const router = useRouter();
  const { showToast } = useToast();
  const totalSteps = 4;

  const applyStatus = useCallback((res: OnboardingApiResult) => {
    if (!res.success) {
      setLoadError(res.message);
      return;
    }
    setLoadError(null);
    if (res.verificationStatus === "VERIFIED") {
      setStep(5);
      return;
    }
    if (res.step >= 4 && res.verificationStatus === "PENDING") {
      setStep(4);
      return;
    }
    setStep(Math.max(1, res.step || 1));
  }, []);

  useEffect(() => {
    if (initialStatus) {
      applyStatus(initialStatus);
      setIsBootstrapping(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setIsBootstrapping(true);
      setLoadError(null);
      const res = await getOnboardingStatus();
      if (cancelled) return;
      applyStatus(res);
      setIsBootstrapping(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialStatus, applyStatus]);

  const handleNext = async () => {
    const next = step + 1;
    if (next <= 3) {
      setIsSubmitting(true);
      const r = await saveOnboardingStep(next);
      setIsSubmitting(false);
      if (!r.success) {
        showToast(r.message, "error");
        return;
      }
      setStep(next);
    }
  };

  const handleStart = async () => {
    setIsSubmitting(true);
    await startOnboarding();
    const r = await saveOnboardingStep(1);
    setIsSubmitting(false);
    if (!r.success) {
      showToast(r.message, "error");
      return;
    }
    setStep(2);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      const result = await submitVerification();
      if (result.success) {
        setStep(4);
      } else {
        showToast(result.message, "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSimulateVerify = async () => {
    if (!IS_DEV) return;
    setIsSubmitting(true);
    try {
      const result = await simulateVerifyUser();
      if (result.success) {
        router.push("/profile");
      } else {
        showToast(result.error || "Unavailable", "error");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isBootstrapping) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-4 bg-background text-white">
        <div
          className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin shadow-lg shadow-primary/20"
          aria-label="Loading"
        />
        <p className="text-[10px] font-black uppercase tracking-widest text-stone-500">Securing environment…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-8 text-center bg-background p-10">
        <p className="text-stone-500 font-black uppercase tracking-widest text-[10px] max-w-sm leading-relaxed">{loadError}</p>
        <button
          type="button"
          onClick={async () => {
            setIsBootstrapping(true);
            const res = await getOnboardingStatus();
            applyStatus(res);
            setIsBootstrapping(false);
          }}
          className="inline-flex items-center gap-3 px-10 py-5 rounded-2xl bg-white/5 text-white font-black text-[10px] uppercase tracking-widest border border-white/10 shadow-2xl transition-all active:scale-95 hover:bg-white/10"
        >
          <FaRedoAlt /> Re-Initiate
        </button>
      </div>
    );
  }

  /* Already verified */
  if (step === 5) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-8 pt-10 bg-background">
        <div className="w-24 h-24 bg-green-500 rounded-[2rem] flex items-center justify-center text-white text-4xl shadow-2xl shadow-green-500/20">
          <FaCheckCircle />
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter mb-2">Verified Elite</h1>
          <p className="text-stone-500 text-[10px] uppercase tracking-widest font-black max-w-xs leading-relaxed">
            Your profile shows the verified badge across SFS Elite.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full max-w-xs py-5 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/20 transition-all hover:scale-105"
        >
          Back to Identity
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen bg-background pt-8 pb-28 overflow-hidden max-w-lg mx-auto px-6">
      <div className="mb-8 flex items-center justify-between text-[10px] font-black uppercase tracking-[0.2em] text-stone-500">
        <span>Verification Progress</span>
        <span className="text-white">Step {Math.min(step, totalSteps)}/{totalSteps}</span>
      </div>
      <div className="mb-10 h-1.5 rounded-full bg-white/5 overflow-hidden shadow-inner" aria-hidden>
        <div
          className="h-full bg-primary transition-all duration-500 shadow-lg shadow-primary/40"
          style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
        />
      </div>
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-card rounded-[2rem] flex items-center justify-center border border-white/5 mb-10 mt-4 shadow-2xl">
              <FaShieldAlt className="text-4xl text-primary" />
            </div>

            <h1 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">Secure Identity</h1>
            <p className="text-stone-500 font-black uppercase tracking-[0.2em] text-[10px] mb-12 max-w-xs leading-relaxed">
              SFS Elite ensures all members are authentic. Complete verification to boost your profile and access Elite Connections.
            </p>

            <div className="space-y-4 w-full mb-12 text-left">
              <div className="p-6 border border-white/5 rounded-3xl flex items-center gap-5 bg-card shadow-xl group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-primary flex items-center justify-center text-xl shadow-inner border border-white/5 transition-colors group-hover:bg-primary group-hover:text-black">
                  <FaIdCard />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Scan Government ID</h3>
                  <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-1">Passport or Driver&apos;s License</p>
                </div>
              </div>

              <div className="p-6 border border-white/5 rounded-3xl flex items-center gap-5 bg-card shadow-xl group hover:border-primary/20 transition-all">
                <div className="w-12 h-12 rounded-2xl bg-white/5 text-stone-500 flex items-center justify-center text-xl shadow-inner border border-white/5 transition-colors group-hover:bg-primary group-hover:text-black">
                  <FaCamera />
                </div>
                <div className="flex-1">
                  <h3 className="font-black text-[10px] text-white uppercase tracking-widest">Visual Analysis</h3>
                  <p className="text-[10px] text-stone-600 font-bold uppercase tracking-widest mt-1">Capture a short live video</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleStart}
              className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {isSubmitting ? "Initiating…" : "Secure Identity"} <FaArrowRight className="text-lg" />
            </button>

            {IS_DEV && (
              <button
                type="button"
                onClick={handleSimulateVerify}
                disabled={isSubmitting}
                className="mt-4 text-xs font-bold text-primary hover:underline disabled:opacity-50"
              >
                Debug: Instant Verified (Simulate)
              </button>
            )}
          </motion.div>
        )}

        {step === 2 && (
          <motion.div
            key="step2"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-full aspect-[3/2] bg-card rounded-[2.5rem] border border-dashed border-white/10 mb-10 flex flex-col items-center justify-center p-12 shadow-2xl shadow-black/40">
              <FaIdCard className="text-6xl text-white/10 mb-6" />
              <p className="text-[10px] font-black text-stone-600 uppercase tracking-widest">Position ID within frame</p>
            </div>

            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">Scanning Identity…</h2>
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-12 max-w-xs leading-relaxed">
              Ensure high visibility and remove all protective cases.
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 disabled:opacity-60 transition-all hover:bg-yellow-300 active:scale-95"
            >
              {isSubmitting ? "Processing…" : "Secure Capture"}
            </button>
          </motion.div>
        )}

        {step === 3 && (
          <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-72 h-72 bg-card rounded-full border border-dashed border-white/10 mb-10 flex flex-col items-center justify-center overflow-hidden shadow-2xl shadow-black/40 relative">
              <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent pointer-events-none" />
              <FaCamera className="text-6xl text-white/10" />
            </div>

            <h2 className="text-3xl font-black mb-4 text-white uppercase tracking-tighter">Live Verification</h2>
            <p className="text-[10px] text-stone-500 font-black uppercase tracking-widest mb-12 max-w-xs leading-relaxed">
              Focus on the lens and maintain a neutral expression for 3 seconds.
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full py-5 bg-primary text-black font-black uppercase tracking-[0.2em] text-[10px] rounded-2xl shadow-2xl shadow-primary/20 flex items-center justify-center gap-3 disabled:opacity-60 hover:bg-yellow-300 active:scale-95"
            >
              {isSubmitting ? "Securing…" : "Finalize Verification"}
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center pt-12 sm:pt-20"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-28 h-28 bg-green-500 rounded-[2.5rem] flex items-center justify-center text-white text-5xl mb-10 shadow-2xl shadow-green-500/20"
            >
              <FaCheckCircle />
            </motion.div>

            <h1 className="text-4xl font-black mb-4 text-white uppercase tracking-tighter">Submission Secured</h1>
            <p className="text-stone-500 font-black uppercase tracking-widest text-[10px] mb-12 max-w-xs leading-relaxed">
              Your verification is being processed by the SFS Concierge team. This usually takes less than 2 hours.
            </p>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="w-full max-w-xs py-5 bg-primary text-black font-black uppercase tracking-widest text-xs rounded-2xl shadow-2xl shadow-primary/20 hover:scale-105 transition-all"
            >
              Back to Identity
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-[10px] text-stone-700 font-black uppercase tracking-[0.2em] mt-12 px-8 leading-relaxed">
        Your data is fully encrypted. We do not store sensitive identity documents permanently on our infrastructure.
      </p>
    </div>
  );
}

