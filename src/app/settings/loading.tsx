import { Skeleton } from "../components/Skeleton";

export default function SettingsLoading() {
  return (
    <div className="space-y-8">
      <div className="space-y-2">
        <Skeleton className="h-10 w-48 rounded-lg" />
        <Skeleton className="h-4 w-64 rounded-lg" />
      </div>

      <div className="bg-card rounded-[2.5rem] p-8 border border-white/5 space-y-8">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="flex items-center justify-between py-2">
            <div className="flex items-center gap-4">
              <Skeleton className="w-12 h-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-32 rounded-lg" />
                <Skeleton className="h-3 w-48 rounded-lg" />
              </div>
            </div>
            <Skeleton className="w-14 h-8 rounded-full" />
          </div>
        ))}
      </div>

      <div className="flex gap-4">
        <Skeleton className="h-12 flex-1 rounded-[1.5rem]" />
        <Skeleton className="h-12 flex-1 rounded-[1.5rem]" />
      </div>
    </div>
  );
}
