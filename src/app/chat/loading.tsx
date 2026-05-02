import { Skeleton } from "../components/Skeleton";

export default function ChatLoading() {
  return (
    <div className="flex flex-col h-[calc(100vh-140px)] md:h-[calc(100vh-100px)] bg-background">
      {/* Chat Header Skeleton */}
      <div className="p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="w-10 h-10 rounded-full" />
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        </div>
        <div className="flex gap-2">
          <Skeleton className="w-8 h-8 rounded-full" />
          <Skeleton className="w-8 h-8 rounded-full" />
        </div>
      </div>

      {/* Chat Messages Skeleton */}
      <div className="flex-1 p-4 space-y-6 overflow-hidden">
        {[...Array(6)].map((_, i) => (
          <div key={i} className={`flex ${i % 2 === 0 ? 'justify-start' : 'justify-end'}`}>
            <div className={`flex gap-3 max-w-[70%] ${i % 2 === 0 ? '' : 'flex-row-reverse'}`}>
              <Skeleton className="w-8 h-8 rounded-full flex-shrink-0" />
              <div className="space-y-1">
                <Skeleton className={`h-10 w-48 rounded-2xl ${i % 2 === 0 ? 'rounded-tl-none' : 'rounded-tr-none'}`} />
                <Skeleton className="h-2 w-10 mx-2" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Chat Input Skeleton */}
      <div className="p-4 border-t border-white/5">
        <div className="flex gap-2 items-center">
          <Skeleton className="w-10 h-10 rounded-xl" />
          <Skeleton className="flex-1 h-12 rounded-2xl" />
          <Skeleton className="w-12 h-12 rounded-xl" />
        </div>
      </div>
    </div>
  );
}
