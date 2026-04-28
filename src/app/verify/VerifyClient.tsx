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
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-4">
        <div
          className="h-12 w-12 rounded-full border-2 border-primary border-t-transparent animate-spin"
          aria-label="Loading"
        />
        <p className="text-sm font-semibold text-muted-foreground">Loading verification…</p>
      </div>
    );
  }

  if (loadError) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-6 text-center">
        <p className="text-muted-foreground max-w-sm">{loadError}</p>
        <button
          type="button"
          onClick={async () => {
            setIsBootstrapping(true);
            const res = await getOnboardingStatus();
            applyStatus(res);
            setIsBootstrapping(false);
          }}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm shadow-md"
        >
          <FaRedoAlt /> Try again
        </button>
      </div>
    );
  }

  /* Already verified */
  if (step === 5) {
    return (
      <div className="page-shell min-h-[80vh] flex flex-col items-center justify-center gap-6 pt-10">
        <div className="w-20 h-20 bg-green-500 rounded-full flex items-center justify-center text-white text-4xl shadow-lg">
          <FaCheckCircle />
        </div>
        <h1 className="text-2xl font-black text-foreground">You&apos;re verified</h1>
        <p className="text-muted-foreground text-sm max-w-xs text-center">
          Your profile shows the verified badge across SFS Elite.
        </p>
        <button
          type="button"
          onClick={() => router.push("/profile")}
          className="w-full max-w-sm py-4 bg-primary text-primary-foreground font-black rounded-xl shadow-lg"
        >
          Back to Profile
        </button>
      </div>
    );
  }

  return (
    <div className="page-shell min-h-screen pt-6 pb-28 overflow-hidden max-w-lg mx-auto">
      <div className="mb-6 flex items-center justify-between text-xs font-bold uppercase tracking-widest text-muted-foreground">
        <span>Verification progress</span>
        <span>Step {Math.min(step, totalSteps)}/{totalSteps}</span>
      </div>
      <div className="mb-6 h-2 rounded-full bg-muted overflow-hidden" aria-hidden>
        <div
          className="h-full bg-primary transition-all duration-300"
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
            <div className="w-24 h-24 bg-primary/15 rounded-full flex items-center justify-center border-4 border-primary/25 mb-8 mt-4">
              <FaShieldAlt className="text-4xl text-primary" />
            </div>

            <h1 className="text-3xl font-black mb-3 text-foreground font-heading">Get Verified</h1>
            <p className="text-muted-foreground font-medium mb-10 max-w-xs">
              SFS Elite ensures all members are authentic. Complete verification to boost your profile and access higher
              quality matches.
            </p>

            <div className="space-y-4 w-full mb-10 text-left">
              <div className="p-5 border border-border rounded-2xl flex items-center gap-4 bg-card surface-elevated">
                <div className="w-10 h-10 rounded-full bg-background text-primary flex items-center justify-center text-lg shadow-sm border border-border">
                  <FaIdCard />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-foreground">Scan Government ID</h3>
                  <p className="text-xs text-muted-foreground font-medium">Passport or Driver&apos;s License</p>
                </div>
              </div>

              <div className="p-5 border border-border rounded-2xl flex items-center gap-4 bg-card">
                <div className="w-10 h-10 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-lg shadow-sm border border-border">
                  <FaCamera />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-foreground">Video Selfie</h3>
                  <p className="text-xs text-muted-foreground font-medium">Capture a short live video</p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleStart}
              className="w-full py-4 bg-foreground text-background font-black rounded-xl shadow-xl hover:opacity-95 transition-opacity flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? "Starting…" : "Start Verification"} <FaArrowRight className="text-sm" />
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
            <div className="w-full aspect-[3/2] bg-muted rounded-3xl border-2 border-dashed border-border mb-8 flex flex-col items-center justify-center p-8">
              <FaIdCard className="text-5xl text-muted-foreground mb-4" />
              <p className="text-sm font-bold text-muted-foreground">Position your ID within the frame</p>
            </div>

            <h2 className="text-2xl font-black mb-3 text-foreground">Scanning ID…</h2>
            <p className="text-sm text-muted-foreground font-medium mb-12">
              Make sure all details are clearly visible and there is no glare on the surface.
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleNext}
              className="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl shadow-lg disabled:opacity-60"
            >
              {isSubmitting ? "Saving…" : "Capture ID"}
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
            <div className="w-64 h-64 bg-muted rounded-full border-4 border-dashed border-border mb-8 flex flex-col items-center justify-center overflow-hidden">
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-transparent to-muted">
                <FaCamera className="text-5xl text-muted-foreground" />
              </div>
            </div>

            <h2 className="text-2xl font-black mb-3 text-foreground">Live Selfie</h2>
            <p className="text-sm text-muted-foreground font-medium mb-12">
              Look straight into the camera and follow the light for 3 seconds.
            </p>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleSubmit}
              className="w-full py-4 bg-foreground text-background font-black rounded-xl shadow-xl flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isSubmitting ? "Uploading…" : "Finalize & Submit"}
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
              className="w-24 h-24 bg-green-600 rounded-full flex items-center justify-center text-white text-5xl mb-8 shadow-lg"
            >
              <FaCheckCircle />
            </motion.div>

            <h1 className="text-3xl font-black mb-3 text-foreground">Submitted</h1>
            <p className="text-muted-foreground font-medium mb-10 max-w-xs">
              Your verification is being processed by the SFS Concierge team. This usually takes less than 2 hours.
            </p>

            <button
              type="button"
              onClick={() => router.push("/profile")}
              className="w-full max-w-sm py-4 bg-primary text-primary-foreground font-black rounded-xl shadow-xl"
            >
              Back to Profile
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <p className="text-center text-xs text-muted-foreground font-semibold mt-10 px-4">
        Your data is encrypted. We do not store your government ID permanently.
      </p>
    </div>
  );
}
