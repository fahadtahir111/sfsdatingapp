
import { getCurrentUser } from "@/lib/auth";
import { getReels } from "./actions";
import ReelsClient from "./ReelsClient";
import Link from "next/link";
import { FaMusic } from "react-icons/fa";

export default async function ReelsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white gap-8 p-8">
        <FaMusic className="text-6xl text-primary animate-pulse" />
        <div className="text-center">
          <h2 className="text-3xl font-black mb-2">Elite Content</h2>
          <p className="text-white/60 text-sm max-w-xs mx-auto">Sign in to watch exclusive reels and join the community.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-primary text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const reels = await getReels();

  return <ReelsClient initialReels={reels} />;
}
