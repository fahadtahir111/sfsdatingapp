
import { getCurrentUser } from "@/lib/auth";
import StoreClient from "./StoreClient";
import Link from "next/link";
import { FaCrown } from "react-icons/fa";

export default async function StorePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-8 p-8">
        <FaCrown className="text-6xl text-stone-200 animate-pulse" />
        <div className="text-center">
          <h2 className="text-3xl font-black text-stone-900 mb-2">Elite Store</h2>
          <p className="text-stone-500 text-sm max-w-xs mx-auto">Sign in to browse exclusive memberships and community elevation tools.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-stone-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return <StoreClient />;
}
