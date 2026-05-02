import { Skeleton } from "../components/Skeleton";

export default function DiscoverLoading() {
  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full bg-background relative overflow-hidden rounded-[3rem] p-4 flex flex-col items-center justify-center gap-8">
      {/* Tinder-style Card Skeleton */}
      <div className="relative w-full max-w-sm aspect-[3/4] bg-card rounded-[3rem] border border-white/10 overflow-hidden shadow-2xl">
        <Skeleton className="w-full h-full rounded-none" />
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black/80 to-transparent space-y-3">
          <div className="flex items-center gap-3">
            <Skeleton className="h-8 w-48 rounded-lg" />
            <Skeleton className="w-6 h-6 rounded-full" />
          </div>
          <Skeleton className="h-4 w-full rounded-lg" />
          <Skeleton className="h-3 w-2/3 rounded-lg" />
        </div>
      </div>

      {/* Action Buttons Skeleton */}
      <div className="flex items-center gap-6">
        <Skeleton className="w-16 h-16 rounded-full shadow-lg" />
        <Skeleton className="w-20 h-20 rounded-full shadow-primary/20 shadow-xl" />
        <Skeleton className="w-16 h-16 rounded-full shadow-lg" />
      </div>
    </div>
  );
}
