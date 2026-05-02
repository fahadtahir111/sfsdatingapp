import { ProfileSkeleton } from "../components/Skeleton";

export default function ProfileLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
      <ProfileSkeleton />
    </div>
  );
}
