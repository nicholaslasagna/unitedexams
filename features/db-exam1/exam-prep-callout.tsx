"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ArrowRight, CalendarDays, Sigma } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAppData } from "@/lib/app-data-context";
import { DB_EXAM1_COURSE_ID, formatExamDate, readiness } from "./mastery";

/**
 * The Exam 1 entry point, shown on the CS 4354 class page.
 *
 * Renders for that course only. Every other class page is untouched — this
 * experience is built on CS 4354's own lectures and homework, and a generic
 * version of it for Operating Systems would be a promise the content cannot
 * keep.
 */
export function ExamPrepCallout({
  courseId,
  routePrefix
}: {
  courseId: string;
  routePrefix: string;
}) {
  const { attempts } = useAppData();
  const state = useMemo(() => readiness(attempts), [attempts]);

  if (courseId !== DB_EXAM1_COURSE_ID) return null;

  const href = `${routePrefix}/courses/${DB_EXAM1_COURSE_ID}/exam-1`;
  const examLabel = formatExamDate(false);

  return (
    <div className="rounded-[1.25rem] border border-accent/35 bg-accent/10 p-4 sm:p-5">
      <p className="inline-flex items-center gap-1.5 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
        <Sigma className="h-3 w-3" aria-hidden />
        Exam 1 Mastery
      </p>

      <p className="mt-2 font-display text-lg font-semibold text-text">
        Relational algebra, joins and division
      </p>

      <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
        Built from this course&rsquo;s Lectures&nbsp;2&ndash;5 and Homework&nbsp;#1 — an
        interactive table lab, step-by-step query writing and a full mock exam.
      </p>

      <p className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-[12px] text-text-secondary">
        <span className="inline-flex items-center gap-1.5">
          <CalendarDays className="h-3 w-3" aria-hidden />
          Exam 1 · {examLabel}
          {state.daysUntilExam > 0 ? ` · ${state.daysUntilExam} days` : ""}
        </span>
        {state.questionsAnswered > 0 ? (
          <span className="font-mono">{state.percent}% ready</span>
        ) : null}
      </p>

      <div className="mt-4">
        <Button asChild size="lg" className="w-full sm:w-auto">
          <Link href={href}>
            {state.questionsAnswered > 0 ? "Continue Exam 1 prep" : "Start Exam 1 prep"}
            <ArrowRight className="h-4 w-4" aria-hidden />
          </Link>
        </Button>
      </div>
    </div>
  );
}
