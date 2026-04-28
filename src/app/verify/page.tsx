import { getCurrentUser } from "@/lib/auth";
import VerifyClient from "./VerifyClient";
import Link from "next/link";
import { FaShieldAlt } from "react-icons/fa";
import { getOnboardingStatus } from "./actions";

export default async function VerifyPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8 p-8">
        <FaShieldAlt className="text-6xl text-primary animate-pulse" />
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">Member Verification</h2>
          <p className="text-muted-foreground text-sm max-w-xs mx-auto">Sign in to complete your identity verification and join the elite network.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-stone-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const initialStatus = await getOnboardingStatus();

  return <VerifyClient initialStatus={initialStatus} />;
}
