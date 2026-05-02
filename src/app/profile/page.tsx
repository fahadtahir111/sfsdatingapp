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
      <div className="min-h-screen flex flex-col items-center justify-center bg-background gap-4 text-center p-6">
        <div className="w-24 h-24 bg-card border border-white/5 rounded-full flex items-center justify-center shadow-2xl">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-2xl font-black text-white font-heading uppercase tracking-tighter">Profile Not Found</h2>
        <p className="text-muted-foreground max-w-xs text-sm">
          We couldn&apos;t retrieve your elite profile data. Please try logging in again.
        </p>
        <Link
          href="/login"
          className="px-10 py-4 bg-primary text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all text-xs uppercase tracking-widest"
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
          <h1 className="text-3xl font-black tracking-tight font-heading uppercase text-foreground">Your Profile</h1>
          <p className="text-muted-foreground font-medium uppercase text-[10px] tracking-[0.2em]">Manage your elite digital identity.</p>
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
