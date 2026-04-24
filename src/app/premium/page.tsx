import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import PremiumClient from "./PremiumClient";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";

export default async function PremiumPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-8 p-8">
        <FaCrown className="text-6xl text-primary animate-pulse" />
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">Signature Access</h2>
          <p className="text-white/60 text-sm max-w-xs mx-auto">Sign in to elevate your membership and unlock premium features.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-primary text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return <PremiumClient />;
}
