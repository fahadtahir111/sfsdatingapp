import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import SettingsClient from "./SettingsClient";
import Link from "next/link";
import { FaCog } from "react-icons/fa";

export default async function SettingsHub() {
  const session = await getServerSession(authOptions);

  if (!session) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-6 p-8">
        <FaCog className="text-6xl text-stone-200 animate-spin-slow" />
        <div className="text-center">
          <h2 className="text-2xl font-black text-stone-900 mb-2">Member Settings</h2>
          <p className="text-stone-500 text-sm max-w-xs mx-auto">Sign in to manage your elite profile and account preferences.</p>
        </div>
        <Link href="/auth/login" className="px-10 py-4 bg-stone-900 text-white font-black rounded-2xl shadow-xl active:scale-95 transition-all uppercase tracking-widest text-xs">
          Sign In
        </Link>
      </div>
    );
  }

  return <SettingsClient />;
}
