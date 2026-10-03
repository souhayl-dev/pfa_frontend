import { cn } from "../../lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-xl bg-neutral-200", className)} />;
}

export function ListingCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-2xl border border-neutral-200">
      <Skeleton className="aspect-4/3 w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-4 w-1/3" />
      </div>
    </div>
  );
}
