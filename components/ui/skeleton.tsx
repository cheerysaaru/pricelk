import { cn } from "@/lib/cn";

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("animate-pulse rounded-md bg-zinc-200/70", className)} />;
}

export function SkeletonText({ className }: { className?: string }) {
  return <Skeleton className={cn("h-4", className)} />;
}

export function ProductCardSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-zinc-200 bg-white">
      <Skeleton className="aspect-square w-full rounded-none" />
      <div className="space-y-2.5 p-4">
        <Skeleton className="h-3 w-16" />
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-2/5" />
        <div className="flex items-end justify-between pt-2">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-24 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

export function OfferRowSkeleton() {
  return (
    <div className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white p-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-10 rounded-lg" />
        <div className="space-y-2">
          <Skeleton className="h-4 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>
      <div className="space-y-2 text-right">
        <Skeleton className="ml-auto h-5 w-24" />
        <Skeleton className="ml-auto h-3 w-16" />
      </div>
    </div>
  );
}

export function ChartSkeleton() {
  return (
    <div className="space-y-3">
      <div className="flex gap-4">
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
        <Skeleton className="h-9 w-28" />
      </div>
      <Skeleton className="h-48 w-full" />
    </div>
  );
}