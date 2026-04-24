"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaShieldAlt, FaCamera, FaIdCard, FaCheckCircle, FaArrowRight } from "react-icons/fa";
import { submitVerification, simulateVerifyUser } from "./actions";
import { useRouter } from "next/navigation";

export default function VerifyClient() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const handleNext = () => setStep(s => s + 1);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await submitVerification();
    if (result.success) {
      setStep(4);
    }
    setIsSubmitting(false);
  };

  const handleSimulateVerify = async () => {
    await simulateVerifyUser();
    router.push("/profile");
  };

  return (
    <div className="min-h-screen bg-white pt-10 px-6 pb-24 overflow-hidden">
      <AnimatePresence mode="wait">
        {step === 1 && (
          <motion.div 
            key="step1"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="flex flex-col items-center text-center"
          >
            <div className="w-24 h-24 bg-primary/10 rounded-full flex items-center justify-center border-4 border-primary/20 mb-8 mt-4">
              <FaShieldAlt className="text-4xl text-primary" />
            </div>

            <h1 className="text-3xl font-black mb-3 text-foreground">Get Verified</h1>
            <p className="text-muted-foreground font-medium mb-10 max-w-xs">
              SFS Elite ensures all members are authentic. Complete verification to boost your profile and access higher quality matches.
            </p>

            <div className="space-y-4 w-full mb-10 text-left">
              <div className="p-5 border border-border rounded-2xl flex items-center gap-4 bg-secondary/20">
                <div className="w-10 h-10 rounded-full bg-white text-primary flex items-center justify-center text-lg shadow-sm border border-border">
                  <FaIdCard />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-foreground">Scan Government ID</h3>
                  <p className="text-xs text-muted-foreground font-medium">Passport or Driver&apos;s License</p>
                </div>
              </div>

              <div className="p-5 border border-border rounded-2xl flex items-center gap-4 bg-secondary/20">
                <div className="w-10 h-10 rounded-full bg-white text-muted-foreground flex items-center justify-center text-lg shadow-sm border border-border">
                  <FaCamera />
                </div>
                <div className="flex-1">
                  <h3 className="font-bold text-sm text-foreground">Video Selfie</h3>
                  <p className="text-xs text-muted-foreground font-medium">Capture a short live video</p>
                </div>
              </div>
            </div>

            <button 
              onClick={handleNext}
              className="w-full py-4 bg-foreground text-background font-black rounded-xl shadow-xl hover:scale-[1.02] transition-transform flex items-center justify-center gap-2"
            >
              Start Verification <FaArrowRight className="text-sm" />
            </button>
            
            <button 
              onClick={handleSimulateVerify}
              className="mt-4 text-xs font-bold text-primary hover:underline"
            >
              Debug: Instant Verified (Simulate)
            </button>
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
             <div className="w-full aspect-[3/2] bg-stone-100 rounded-3xl border-2 border-dashed border-stone-300 mb-8 flex flex-col items-center justify-center p-8">
                <FaIdCard className="text-5xl text-stone-300 mb-4" />
                <p className="text-sm font-bold text-stone-400">Position your ID within the frame</p>
             </div>

             <h2 className="text-2xl font-black mb-3">Scanning ID...</h2>
             <p className="text-sm text-muted-foreground font-medium mb-12">Make sure all details are clearly visible and there is no glare on the surface.</p>

             <button 
              onClick={handleNext}
              className="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl shadow-lg"
            >
              Capture ID
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
             <div className="w-64 h-64 bg-stone-100 rounded-full border-4 border-dashed border-stone-300 mb-8 flex flex-col items-center justify-center overflow-hidden">
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-b from-transparent to-stone-200">
                   <FaCamera className="text-5xl text-stone-300" />
                </div>
             </div>

             <h2 className="text-2xl font-black mb-3">Live Selfie</h2>
             <p className="text-sm text-muted-foreground font-medium mb-12">Look straight into the camera and follow the light for 3 seconds.</p>

             <button 
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full py-4 bg-foreground text-background font-black rounded-xl shadow-xl flex items-center justify-center gap-2"
            >
              {isSubmitting ? "Uploading Documents..." : "Finalize & Submit"}
            </button>
          </motion.div>
        )}

        {step === 4 && (
          <motion.div 
            key="step4"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="flex flex-col items-center text-center pt-20"
          >
            <motion.div 
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", damping: 12 }}
              className="w-24 h-24 bg-green-500 rounded-full flex items-center justify-center text-white text-5xl mb-8 shadow-lg shadow-green-200"
            >
              <FaCheckCircle />
            </motion.div>

            <h1 className="text-3xl font-black mb-3">Submitted</h1>
            <p className="text-muted-foreground font-medium mb-10 max-w-xs">
              Your verification is being processed by the SFS Concierge team. This usually takes less than 2 hours.
            </p>

            <button 
              onClick={() => router.push("/profile")}
              className="w-full py-4 bg-primary text-primary-foreground font-black rounded-xl shadow-xl"
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
