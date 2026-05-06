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
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-6 bg-background text-white">
        <div className="aether-mesh absolute inset-0 pointer-events-none opacity-40" />
        <div
          className="h-14 w-14 rounded-2xl border border-primary/20 border-t-primary animate-spin shadow-shadow-glow"
          aria-label="Loading"
        />
        <p className="sub-heading text-[10px] lowercase text-primary animate-pulse">securing environment…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-8 text-center bg-background p-10">
        <div className="aether-mesh absolute inset-0 pointer-events-none opacity-40" />
        <p className="sub-heading text-[11px] max-w-sm lowercase opacity-60 leading-relaxed">{loadError}</p>
        <button
          type="button"
          onClick={async () => {
            setIsBootstrapping(true);
            const res = await getOnboardingStatus();
            applyStatus(res);
            setIsBootstrapping(false);
          }}
          className="btn-aether py-4 px-10"
        >
          <FaRedoAlt className="mr-2" /> re-initiate
        </button>
      </div>
    );
  }

  /* Already verified */
  if (step === 5) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-10 pt-10 bg-background px-6">
        <div className="aether-mesh absolute inset-0 pointer-events-none opacity-40" />
        <div className="w-24 h-24 bg-white/5 border border-primary/40 rounded-[32px] flex items-center justify-center text-primary text-4xl shadow-shadow-glow relative overflow-hidden">
          <div className="absolute inset-0 bg-primary/10 animate-pulse" />
          <FaCheckCircle className="relative z-10" />
        </div>
        <div className="text-center relative z-10">
          <h1 className="text-4xl font-heading text-white tracking-tight mb-3">Verified Elite</h1>
          <p className="sub-heading text-[11px] lowercase opacity-60 max-w-xs mx-auto leading-relaxed">
            Your profile shows the verified badge across the Aether ecosystem.
          </p>
        </div>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="btn-aether w-full max-w-xs py-5"
        >
          Return to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen bg-background pt-8 pb-28 overflow-hidden max-w-lg mx-auto px-6 relative">
      <div className="aether-mesh absolute inset-0 pointer-events-none opacity-40" />
      
      <div className="relative z-10">
        <div className="mb-6 flex items-center justify-between">
          <span className="sub-heading text-[10px] lowercase opacity-50">Verification Progress</span>
          <span className="sub-heading text-[10px] text-primary lowercase">Step {Math.min(step, totalSteps)}/{totalSteps}</span>
        </div>
        <div className="mb-12 h-1 rounded-full bg-white/5 overflow-hidden border border-white/5" aria-hidden>
          <div
            className="h-full bg-primary transition-all duration-700 shadow-shadow-glow"
            style={{ width: `${(Math.min(step, totalSteps) / totalSteps) * 100}%` }}
          />
        </div>

        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center text-center"
            >
              <div className="w-24 h-24 bg-white/5 rounded-[32px] flex items-center justify-center border border-white/10 mb-10 shadow-xl relative group">
                <div className="absolute inset-0 bg-primary/5 rounded-[32px] group-hover:bg-primary/10 transition-all" />
                <FaShieldAlt className="text-4xl text-primary relative z-10 shadow-shadow-glow" />
              </div>

              <h1 className="text-5xl font-heading mb-4 text-white tracking-tight">Secure Identity</h1>
              <p className="sub-heading text-[11px] lowercase opacity-60 mb-12 max-w-xs leading-relaxed">
                Aether ensures all members are authentic. Complete verification to unlock premium elite features.
              </p>

              <div className="space-y-4 w-full mb-12 text-left">
                <div className="p-6 border border-white/10 rounded-[28px] flex items-center gap-5 bg-white/5 backdrop-blur-md shadow-xl group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 text-primary flex items-center justify-center text-xl border border-white/10 transition-all group-hover:bg-primary group-hover:text-black shadow-shadow-glow">
                    <FaIdCard />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xs text-white tracking-tight">Scan Government ID</h3>
                    <p className="sub-heading text-[9px] lowercase opacity-40 mt-1">Passport or Driver&apos;s License</p>
                  </div>
                </div>

                <div className="p-6 border border-white/10 rounded-[28px] flex items-center gap-5 bg-white/5 backdrop-blur-md shadow-xl group hover:border-primary/30 transition-all">
                  <div className="w-12 h-12 rounded-xl bg-white/5 text-muted-foreground flex items-center justify-center text-xl border border-white/10 transition-all group-hover:bg-primary group-hover:text-black">
                    <FaCamera />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-xs text-white tracking-tight">Visual Analysis</h3>
                    <p className="sub-heading text-[9px] lowercase opacity-40 mt-1">Capture a short live video</p>
                  </div>
                </div>
              </div>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleStart}
                className="btn-aether w-full py-5 flex items-center justify-center gap-3 disabled:opacity-40"
              >
                {isSubmitting ? "Initiating…" : "Secure Identity"} <FaArrowRight className="text-sm" />
              </button>

              {IS_DEV && (
                <button
                  type="button"
                  onClick={handleSimulateVerify}
                  disabled={isSubmitting}
                  className="mt-6 sub-heading text-[9px] text-primary lowercase hover:opacity-70 disabled:opacity-30"
                >
                  debug: Instant Verified (Simulate)
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
              <div className="w-full aspect-[16/10] bg-white/5 rounded-[40px] border border-dashed border-white/10 mb-10 flex flex-col items-center justify-center p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute inset-0 bg-primary/5 opacity-0 group-hover:opacity-100 transition-all duration-700" />
                <FaIdCard className="text-7xl text-white/10 mb-6 group-hover:text-primary/20 transition-all duration-700 group-hover:scale-110" />
                <p className="sub-heading text-[10px] lowercase opacity-40">position identity within frame</p>
              </div>

              <h2 className="text-4xl font-heading mb-3 text-white tracking-tight">Scanning Identity…</h2>
              <p className="sub-heading text-[11px] lowercase opacity-60 mb-12 max-w-xs leading-relaxed mx-auto">
                Ensure high visibility and remove all protective cases.
              </p>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleNext}
                className="btn-aether w-full py-5 disabled:opacity-40"
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
              <div className="w-72 h-72 bg-white/5 rounded-[60px] border border-dashed border-white/10 mb-10 flex flex-col items-center justify-center overflow-hidden shadow-2xl relative group">
                <div className="absolute inset-0 bg-gradient-to-b from-primary/10 to-transparent pointer-events-none group-hover:opacity-100 transition-all" />
                <FaCamera className="text-7xl text-white/10 group-hover:text-primary/20 transition-all duration-700 group-hover:scale-110" />
                <div className="absolute bottom-6 left-0 right-0">
                  <div className="h-1 w-24 bg-white/10 rounded-full mx-auto relative overflow-hidden">
                    <div className="absolute inset-0 bg-primary animate-[shimmer_2s_infinite]" />
                  </div>
                </div>
              </div>

              <h2 className="text-4xl font-heading mb-3 text-white tracking-tight">Live Verification</h2>
              <p className="sub-heading text-[11px] lowercase opacity-60 mb-12 max-w-xs leading-relaxed mx-auto">
                Focus on the lens and maintain a neutral expression for 3 seconds.
              </p>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={handleSubmit}
                className="btn-aether w-full py-5 flex items-center justify-center gap-3 disabled:opacity-40"
              >
                {isSubmitting ? "Securing…" : "Finalize Verification"}
              </button>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center text-center pt-12"
            >
              <motion.div
                initial={{ scale: 0, rotate: -20 }}
                animate={{ scale: 1, rotate: 0 }}
                transition={{ type: "spring", damping: 15, stiffness: 100 }}
                className="w-28 h-28 bg-white/5 border border-primary/30 rounded-[40px] flex items-center justify-center text-primary text-5xl mb-10 shadow-shadow-glow relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-primary/10 animate-pulse" />
                <FaCheckCircle className="relative z-10" />
              </motion.div>

              <h1 className="text-5xl font-heading mb-4 text-white tracking-tight">Submission Secured</h1>
              <p className="sub-heading text-[11px] lowercase opacity-60 mb-12 max-w-xs leading-relaxed mx-auto">
                Your verification is being processed by the SFS Concierge team. Expected completion within 2 hours.
              </p>

              <button
                type="button"
                onClick={() => router.push("/profile")}
                className="btn-aether w-full max-w-xs py-5"
              >
                Back to Profile
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        <p className="text-center sub-heading text-[9px] text-muted-foreground/30 lowercase mt-16 px-8 leading-relaxed">
          Your data is fully encrypted. We do not store sensitive identity documents permanently on our infrastructure.
        </p>
      </div>
    </div>
  );
}

