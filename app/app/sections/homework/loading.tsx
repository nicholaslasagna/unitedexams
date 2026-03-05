import { Skeleton } from "@/components/ui/skeleton";

export default function HomeworkLoading() {
  return (
    <div className="space-y-6">
      <section>
        <Skeleton className="h-9 w-40" stagger={0} />
        <Skeleton className="mt-3 h-4 w-80" stagger={1} />
      </section>
      <div className="rounded-2xl border border-borderc bg-surface p-5 space-y-4">
        <Skeleton className="h-6 w-36" stagger={0} />
        <div className="space-y-2">
          <Skeleton className="h-10 w-full rounded-lg" stagger={1} />
          <Skeleton className="h-10 w-full rounded-lg" stagger={2} />
          <Skeleton className="h-10 w-3/4 rounded-lg" stagger={3} />
        </div>
      </div>
    </div>
  );
}
