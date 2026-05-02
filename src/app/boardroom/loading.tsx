import { Skeleton } from "../components/Skeleton";

export default function BoardroomLoading() {
  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-2">
          <Skeleton className="h-10 w-64 rounded-lg" />
          <Skeleton className="h-4 w-80 rounded-lg" />
        </div>
        <Skeleton className="h-14 w-full md:w-48 rounded-[2rem]" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="bg-card rounded-[2.5rem] p-6 border border-white/5 space-y-6">
            <div className="flex justify-between items-start">
              <div className="space-y-3">
                <Skeleton className="h-6 w-32 rounded-lg" />
                <div className="flex gap-2">
                  <Skeleton className="h-5 w-16 rounded-full" />
                  <Skeleton className="h-5 w-16 rounded-full" />
                </div>
              </div>
              <Skeleton className="w-12 h-12 rounded-2xl" />
            </div>
            
            <div className="space-y-2">
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-5/6" />
            </div>

            <div className="pt-4 border-t border-white/5 flex items-center justify-between">
              <div className="flex -space-x-2">
                {[...Array(3)].map((_, j) => (
                  <Skeleton key={j} className="w-8 h-8 rounded-full border-2 border-background" />
                ))}
              </div>
              <Skeleton className="h-4 w-20" />
            </div>
            
            <Skeleton className="h-12 w-full rounded-2xl" />
          </div>
        ))}
      </div>
    </div>
  );
}
