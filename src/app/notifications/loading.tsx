import { Skeleton } from "../components/Skeleton";

export default function NotificationsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>

      <div className="bg-card rounded-[2.5rem] border border-white/5 divide-y divide-white/5 overflow-hidden">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="p-6 flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-full max-w-md rounded-lg" />
              <Skeleton className="h-3 w-24 rounded-lg" />
            </div>
            <Skeleton className="w-2 h-2 rounded-full bg-primary/20" />
          </div>
        ))}
      </div>
    </div>
  );
}
