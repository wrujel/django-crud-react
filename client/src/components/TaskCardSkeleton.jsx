import { Skeleton } from "./ui/Skeleton";

export function TaskCardSkeleton() {
  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-line bg-surface/60 p-4">
      <div className="flex items-start gap-3">
        <Skeleton className="size-6 rounded-md" />
        <div className="flex-1 space-y-2">
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </div>
      </div>
      <div className="flex items-center justify-between pl-9">
        <Skeleton className="h-5 w-16 rounded-full" />
        <Skeleton className="h-3 w-12" />
      </div>
    </div>
  );
}
