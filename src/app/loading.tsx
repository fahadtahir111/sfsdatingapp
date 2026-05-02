import { PostSkeleton } from "./components/Skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background p-6 md:p-8 space-y-8 max-w-6xl mx-auto">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
      </div>
      
      <div className="space-y-6">
        <PostSkeleton />
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}
