export const dynamic = "force-dynamic";

import { getProfile } from "./actions";
import { getPendingRequests, getFriends } from "../friends/actions";
import ProfileClient from "./ProfileClient";
import type { ProfileData, PendingRequestData, FriendData } from "./types";
import { getCurrentUser } from "@/lib/auth";
import AuthGateCard from "../components/AuthGateCard";
import Link from "next/link";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <AuthGateCard
        emoji="🔒"
        title="Private Profile"
        description="Sign in to view and manage your elite profile."
      />
    );
  }

  const [profile, pendingRequests, friends] = await Promise.all([
    getProfile(),
    getPendingRequests(),
    getFriends()
  ]);

  if (!profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-stone-50 gap-4 text-center">
        <div className="w-24 h-24 bg-white border border-stone-100 rounded-full flex items-center justify-center shadow-sm">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-xl font-black text-stone-900">Profile Not Found</h2>
        <p className="text-stone-500 max-w-xs">
          We couldn&apos;t retrieve your profile data. Please try logging out and back in.
        </p>
        <Link
          href="/login"
          className="px-8 py-4 bg-stone-900 text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-black tracking-tight">Your Profile</h1>
          <p className="text-stone-500 font-medium">Manage your elite digital identity.</p>
        </div>
        <ProfileClient 
          initialProfile={profile as ProfileData} 
          initialPendingRequests={pendingRequests as PendingRequestData[]} 
          initialFriends={friends as FriendData[]} 
        />
      </div>
    </DashboardLayout>
  );
}
