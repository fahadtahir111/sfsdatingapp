import { cn } from "@/lib/utils";

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn("animate-pulse rounded-md bg-white/5", className)}
      {...props}
    />
  );
}

export function PostSkeleton() {
  return (
    <div className="bg-card rounded-[2.5rem] p-6 shadow-xl border border-white/5 space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="w-12 h-12 rounded-full" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-3 w-16" />
        </div>
      </div>
      <Skeleton className="h-32 w-full rounded-2xl" />
      <div className="flex gap-4 pt-2">
        <Skeleton className="h-8 w-16 rounded-full" />
        <Skeleton className="h-8 w-16 rounded-full" />
      </div>
    </div>
  );
}

export function StorySkeleton() {
  return (
    <div className="flex flex-col items-center gap-2">
      <Skeleton className="w-16 h-16 rounded-full border-2 border-white/5" />
      <Skeleton className="h-2 w-12" />
    </div>
  );
}

export function ProfileSkeleton() {
  return (
    <div className="space-y-8">
      <div className="relative h-64 bg-card rounded-b-[4rem] overflow-hidden">
        <Skeleton className="w-full h-full" />
      </div>
      <div className="flex flex-col items-center -mt-20 px-6 gap-4">
        <Skeleton className="w-40 h-40 rounded-full border-[6px] border-background" />
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-32" />
        <div className="flex gap-3 w-full max-w-sm mt-4">
          <Skeleton className="h-14 flex-1 rounded-[2rem]" />
          <Skeleton className="h-14 flex-1 rounded-[2rem]" />
        </div>
      </div>
    </div>
  );
}
