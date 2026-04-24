import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { fetchDiscoverFeed } from "./actions";
import DiscoverClient from "./DiscoverClient";
import Link from "next/link";

export default async function DiscoverPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#0a0a0a] text-white gap-6">
        <div className="w-24 h-24 bg-stone-900 border border-primary/30 rounded-full flex items-center justify-center shadow-[0_0_30px_rgba(250,204,21,0.1)]">
          <span className="text-4xl">🔒</span>
        </div>
        <div className="text-center">
          <h2 className="text-2xl font-black mb-2">Exclusive Access Only</h2>
          <p className="text-stone-400 text-sm max-w-xs mx-auto">Please sign in to explore the SFS Elite network.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-primary text-black font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  const initialCards = await fetchDiscoverFeed();

  return <DiscoverClient initialCards={initialCards} />;
}
