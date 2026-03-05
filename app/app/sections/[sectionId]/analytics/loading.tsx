import { Skeleton } from "@/components/ui/skeleton";

export default function AnalyticsLoading() {
  return (
    <div className="space-y-6">
      <section>
        <Skeleton className="h-9 w-40" stagger={0} />
        <Skeleton className="mt-3 h-4 w-72" stagger={1} />
      </section>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-borderc bg-surface p-5 space-y-3">
            <Skeleton className="h-4 w-20" stagger={i} />
            <Skeleton className="h-8 w-16" stagger={i + 1} />
          </div>
        ))}
      </div>
      <div className="rounded-2xl border border-borderc bg-surface p-5 space-y-4">
        <Skeleton className="h-6 w-36" stagger={0} />
        <Skeleton className="h-48 w-full rounded-lg" stagger={1} />
      </div>
    </div>
  );
}
