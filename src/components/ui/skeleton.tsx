import { cn } from "@/lib/utils";

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} {...props} />;
}

// Specialized skeleton components
export const MatchRowSkeleton = () => {
  return (
    <div className="grid grid-cols-[1fr_repeat(3,120px)] bg-[#1a1a1a] border-b border-gray-800 p-4">
      <div className="flex flex-col gap-2">
        <Skeleton className="h-4 w-48" />
        <Skeleton className="h-3 w-32" />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton className="h-10 w-20" />
      </div>
      <div className="flex items-center justify-center">
        <Skeleton className="h-10 w-20" />
      </div>
    </div>
  );
};

export const SidebarSportSkeleton = () => {
  return (
    <div className="border-b border-border/30 p-4 space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Skeleton className="h-3 w-3" />
          <Skeleton className="h-4 w-24" />
        </div>
        <Skeleton className="h-4 w-8" />
      </div>
    </div>
  );
};

export { Skeleton };
