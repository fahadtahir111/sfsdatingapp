import { PostSkeleton, StorySkeleton } from "../components/Skeleton";

export default function FeedLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-10 w-48 bg-white/5 rounded-lg animate-pulse" />
        <div className="h-4 w-64 bg-white/5 rounded-lg animate-pulse" />
      </div>

      <div className="bg-card rounded-[2.5rem] p-4 shadow-xl border border-white/5 flex gap-4 overflow-hidden">
        <StorySkeleton />
        <StorySkeleton />
        <StorySkeleton />
        <StorySkeleton />
        <StorySkeleton />
      </div>

      <div className="bg-card rounded-[2.5rem] p-6 shadow-xl border border-white/5">
        <div className="flex gap-4">
          <div className="w-12 h-12 rounded-full bg-white/5 animate-pulse flex-shrink-0" />
          <div className="flex-1 space-y-4">
            <div className="h-24 w-full bg-white/5 rounded-2xl animate-pulse" />
            <div className="flex justify-between">
              <div className="h-8 w-32 bg-white/5 rounded-full animate-pulse" />
              <div className="h-10 w-24 bg-white/5 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-6">
        <PostSkeleton />
        <PostSkeleton />
      </div>
    </div>
  );
}
