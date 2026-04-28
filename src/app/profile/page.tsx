import { getProfile } from "./actions";
import { getPendingRequests, getFriends } from "../friends/actions";
import ProfileClient from "./ProfileClient";
import type { ProfileData, PendingRequestData, FriendData } from "./types";
import { getCurrentUser } from "@/lib/auth";
import AuthGateCard from "../components/AuthGateCard";
import Link from "next/link";

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

  // Fetch all data on the server for maximum reliability and speed
  const [profile, pendingRequests, friends] = await Promise.all([
    getProfile(),
    getPendingRequests(),
    getFriends()
  ]);

  if (!profile) {
    return (
      <div className="page-shell min-h-screen flex flex-col items-center justify-center bg-background gap-4 text-center">
        <div className="w-24 h-24 bg-muted border border-border rounded-full flex items-center justify-center shadow-sm">
          <span className="text-4xl">👤</span>
        </div>
        <h2 className="text-xl font-black text-foreground font-heading">Profile Not Found</h2>
        <p className="text-muted-foreground max-w-xs">
          We couldn&apos;t retrieve your profile data. Please try logging out and back in.
        </p>
        <Link
          href="/auth/login"
          className="px-8 py-4 bg-foreground text-background font-black rounded-[2rem] shadow-xl active:scale-95 transition-all focus-ring"
        >
          Return to Login
        </Link>
      </div>
    );
  }

  return (
    <ProfileClient 
      initialProfile={profile as ProfileData} 
      initialPendingRequests={pendingRequests as PendingRequestData[]} 
      initialFriends={friends as FriendData[]} 
    />
  );
}
