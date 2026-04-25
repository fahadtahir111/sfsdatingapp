import { getProfile } from "./actions";
import { getPendingRequests, getFriends } from "../friends/actions";
import ProfileClient, { ProfileData, PendingRequestData, FriendData } from "./ProfileClient";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth";

export default async function ProfilePage() {
  const user = await getCurrentUser();
  
  if (!user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4">
        <div className="text-6xl">🔒</div>
        <h2 className="text-xl font-black text-stone-800">Sign in to view your profile</h2>
        <Link href="/auth/login" className="px-8 py-4 bg-stone-900 text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all">
          Sign In
        </Link>
      </div>
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-white gap-4 text-center px-6">
        <div className="text-6xl">👤</div>
        <h2 className="text-xl font-black text-stone-800">Profile Not Found</h2>
        <p className="text-stone-500 max-w-xs">We couldn&apos;t retrieve your profile data. Please try logging out and back in.</p>
        <Link href="/auth/login" className="px-8 py-4 bg-stone-900 text-white font-black rounded-[2rem] shadow-xl active:scale-95 transition-all">
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
