import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function SectionDetailLoading() {
  return (
    <div className="space-y-6">
      <section>
        <Skeleton className="h-9 w-56" stagger={0} />
        <Skeleton className="mt-3 h-4 w-64" stagger={1} />
      </section>
      <div className="grid gap-4 sm:grid-cols-2">
        <SkeletonCard />
        <SkeletonCard />
      </div>
    </div>
  );
}
