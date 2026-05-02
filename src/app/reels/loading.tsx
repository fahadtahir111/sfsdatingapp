import { Skeleton } from "../components/Skeleton";

export default function ReelsLoading() {
  return (
    <div className="h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] w-full bg-black relative overflow-hidden rounded-[3rem]">
      {/* Video Content Skeleton */}
      <Skeleton className="w-full h-full rounded-none" />
      
      {/* Overlay Skeletons */}
      <div className="absolute right-4 bottom-24 flex flex-col items-center gap-6 z-20">
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-14 h-14 rounded-full border-2 border-white/10" />
          <Skeleton className="h-2 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-14 h-14 rounded-full border-2 border-white/10" />
          <Skeleton className="h-2 w-8" />
        </div>
        <div className="flex flex-col items-center gap-1">
          <Skeleton className="w-14 h-14 rounded-full border-2 border-white/10" />
          <Skeleton className="h-2 w-8" />
        </div>
      </div>

      <div className="absolute left-6 bottom-8 space-y-3 z-20 max-w-[70%]">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <Skeleton className="h-5 w-32 rounded-lg" />
        </div>
        <Skeleton className="h-4 w-full rounded-lg" />
        <Skeleton className="h-3 w-3/4 rounded-lg" />
      </div>
    </div>
  );
}
