import Link from "next/link";
import { ArrowRight, Flag } from "lucide-react";
import { Button } from "@/components/ui/button";

export function AlgorithmsExamPrepCallout({
  courseId,
  routePrefix
}: {
  courseId: string;
  routePrefix: string;
}) {
  if (courseId !== "analysis-of-algorithms") return null;

  return (
    <div className="rounded-[1.25rem] border border-accent/35 bg-accent/10 p-4 sm:p-5">
      <p className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
        <Flag className="h-3 w-3" aria-hidden />
        Algorithms Exam 1 preparation
      </p>
      <p className="mt-2 font-display text-lg font-semibold text-text">Homework and projected review first</p>
      <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
        Follow the professor&apos;s stated study targets: Homework 1 and 2 and the photographed
        edit-distance review (esteban to stephen). Keep LCS and the broader lecture bank as
        related practice.
      </p>
      <div className="mt-4">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={`${routePrefix}/courses/analysis-of-algorithms/exam-1`}>
            Start Algorithms prep <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
