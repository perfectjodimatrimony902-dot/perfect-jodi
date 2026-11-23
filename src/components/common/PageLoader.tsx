import { Skeleton } from "@/components/ui/skeleton";

export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="container-page py-10" role="status" aria-live="polite">
      <span className="sr-only">{label}</span>
      <Skeleton className="mb-6 h-8 w-64" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-40 rounded-xl" />
        ))}
      </div>
    </div>
  );
}

export function CardsSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div
      className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3"
      role="status"
      aria-label="Loading profiles"
    >
      {Array.from({ length: count }).map((_, i) => (
        <Skeleton key={i} className="h-72 rounded-xl" />
      ))}
    </div>
  );
}
