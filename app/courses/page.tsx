import type { Metadata } from "next";
import Link from "next/link";
import { PublicShell } from "@/components/layout/public-shell";
import { PublicPageHero } from "@/components/public/public-page-hero";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { courses, quizSets } from "@/data/seed";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import { CoursesIndexContent } from "@/features/study/courses-index-page";

export const metadata: Metadata = {
  title: "Courses",
  alternates: {
    canonical: "/courses"
  }
};

export default function PublicCoursesPage() {
  const quizCount = quizSets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
  const examCount = quizSets.filter((set) => resolveQuizSetMode(set) === "exam").length;
  const homeworkCount = quizSets.filter((set) => resolveQuizSetMode(set) === "homework").length;

  return (
    <PublicShell>
      <div className="space-y-8 pb-12 md:space-y-10 md:pb-14">
        <PublicPageHero
          eyebrow="Study library"
          title="Open the course hub that matches the class you are actually taking."
          description="Browse by course, filter by difficulty, and jump into public study materials or your professor-linked section when you are enrolled."
          actions={
            <>
              <Button asChild size="lg">
                <Link href="/signup">Create account</Link>
              </Button>
              <Button asChild variant="secondary" size="lg">
                <Link href="/homework">See homework mode</Link>
              </Button>
            </>
          }
          stats={[
            { label: "Courses", value: String(courses.length), detail: "Core course hubs ready now" },
            { label: "Quiz sets", value: String(quizCount), detail: "Walkthrough and practice banks" },
            { label: "Homework", value: String(homeworkCount), detail: "Step-by-step review mode" }
          ]}
          aside={
            <div className="space-y-4">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-accent">What you can do here</p>
                <p className="mt-1 text-sm text-text-secondary">
                  Use the catalog as the entry point for guided study, timed practice, and section-linked materials.
                </p>
              </div>
              <div className="grid gap-3">
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Start with a course</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    Every course page keeps quizzes, exams, homework, notes, and resources in one place.
                  </p>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Switch by mode</p>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <Badge tone="brand">{quizCount} quizzes</Badge>
                    <Badge tone="warn">{examCount} exams</Badge>
                    <Badge tone="success">{homeworkCount} homework</Badge>
                  </div>
                </div>
                <div className="rounded-[1.15rem] border border-borderc bg-surface/80 p-4">
                  <p className="text-sm font-semibold text-text">Connect to a real class</p>
                  <p className="mt-1 text-xs leading-relaxed text-text-secondary">
                    When you join a section, these same courses can route you straight into your class materials.
                  </p>
                </div>
              </div>
            </div>
          }
        />

        <div className="mx-auto w-full max-w-[1240px] px-0 sm:px-2 md:px-6">
          <CoursesIndexContent routePrefix="" showHeader={false} />
        </div>
      </div>
    </PublicShell>
  );
}
