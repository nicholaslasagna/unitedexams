import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ExamTwoPrepCallout({
  courseId,
  routePrefix
}: {
  courseId: string;
  routePrefix: string;
}) {
  if (courseId !== "database-systems") return null;

  return (
    <div className="rounded-[1.25rem] border border-accent/35 bg-accent/10 p-4 sm:p-5">
      <p className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
        <Database className="h-3 w-3" aria-hidden />
        Exam 2 preparation
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-text">MySQL queries and written practice</p>
      <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
        Work through the lectures, class activity and homework, then choose a 70-minute
        written mock with model answers and a self-marking rubric.
      </p>
      <div className="mt-4">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`${routePrefix}/courses/database-systems/exam-2`}>
            Start Exam 2 prep <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
