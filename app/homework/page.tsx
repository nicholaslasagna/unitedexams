import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { quizSets } from "@/data/seed";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import { HomeworkIndexContent } from "@/features/study/homework-index-page";

export const metadata: Metadata = {
  title: "Homework Mode",
  alternates: {
    canonical: "/homework"
  }
};

export default function HomeworkIndexPage() {
  const homeworkSets = quizSets.filter((set) => resolveQuizSetMode(set) === "homework");

  return (
    <PublicShell>
      <div className="space-y-8 pb-12 md:space-y-10 md:pb-14">
        <PublicPageHero
          eyebrow="Homework mode"
          title="Slow the problem down and work it one step at a time."
          description="Homework mode is built for understanding, not speed: hints, worked solutions, and a calmer flow for difficult material."
          actions={
            <>
              <Button asChild size="lg">
                <Link href="/courses">Browse courses</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/signup">Save your progress</Link>
              </Button>
            </>
          }
          stats={[
            { label: "Homework sets", value: String(homeworkSets.length), detail: "Structured review sessions" },
            { label: "Study style", value: "Guided", detail: "Hints and full-solution support" },
            { label: "Best for", value: "Hard classes", detail: "Math-heavy and concept-heavy work" }
          ]}
          aside={
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">Why homework mode matters</p>
                <p className="mt-1 text-sm text-text-secondary">
                  It is the least stressful way to rebuild confidence before you switch into a quiz or timed setting.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Hint-first workflow</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Stay in the problem long enough to learn the method before revealing the full answer.
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Built for review</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="success">Guided pace</Badge>
                    <Badge tone="brand">Deep explanation</Badge>
                    <Badge tone="warn">Exam prep support</Badge>
                  </div>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Good before timed runs</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Use homework mode first, then return to the course hub when you want a faster test-like session.
                  </p>
                </div>
              </div>
            </div>
          }
        />

        <div className="mx-auto w-full max-w-[1240px] px-0 sm:px-2 md:px-6">
          <HomeworkIndexContent routePrefix="" showHeader={false} />
        </div>
      </div>
    </PublicShell>
  );
}
