import { Skeleton } from "@/components/ui/skeleton";

export default function SectionGradebookLoading() {
  return (
    <div className="space-y-6">
      <section className="flex items-center justify-between">
        <div>
          <Skeleton className="h-9 w-40" stagger={0} />
          <Skeleton className="mt-3 h-4 w-64" stagger={1} />
        </div>
      </section>
      <div className="rounded-2xl border border-borderc bg-surface p-5 space-y-4">
        <div className="flex gap-3">
          <Skeleton className="h-8 w-24 rounded-lg" stagger={0} />
          <Skeleton className="h-8 w-24 rounded-lg" stagger={1} />
        </div>
        <div className="space-y-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" stagger={i + 2} />
          ))}
        </div>
      </div>
    </div>
  );
}
