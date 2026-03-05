import { Skeleton } from "@/components/ui/skeleton";

export default function SectionMaterialsLoading() {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40" stagger={0} />
          <Skeleton className="mt-3 h-4 w-64" stagger={1} />
        </div>
        <Skeleton className="h-9 w-28 rounded-lg" stagger={2} />
      </section>
      <div className="space-y-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="rounded-2xl border border-borderc bg-surface p-4 flex items-center gap-4">
            <Skeleton className="h-10 w-10 rounded-lg shrink-0" stagger={i} />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" stagger={i + 1} />
              <Skeleton className="h-3 w-32" stagger={i + 2} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
