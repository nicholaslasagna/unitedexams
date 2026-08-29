"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  Filter,
  Search
} from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { AccessBadge } from "@/components/ui/access-badge";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppData } from "@/lib/app-data-context";
import { useAccess } from "@/lib/hooks/use-access";
import { courseProgress } from "@/features/progress/metrics";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import { listJoinedSections } from "@/features/professor/api";
import { listStudentCourseGrades, type StudentCourseGradeSummary } from "@/features/grades/api";
import type { JoinedSectionSummary } from "@/features/professor/api";

const courseArtworkById: Record<string, string> = {
  "software-engineering": "/images/courses/software-engineering.svg",
  "differential-equations": "/images/courses/differential-equations.svg",
  "computer-architecture": "/images/courses/computer-architecture.svg",
  "theory-of-automata": "/images/courses/theory-of-automata.svg"
};

type SortBy = "default" | "name" | "mastery" | "shortest" | "longest";

const sortOptions: { value: SortBy; label: string }[] = [
  { value: "default", label: "Recommended" },
  { value: "name", label: "Course (A→Z)" },
  { value: "mastery", label: "Highest mastery" },
  { value: "shortest", label: "Quickest first" },
  { value: "longest", label: "Most material" }
];

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

export function CoursesIndexContent({
  routePrefix,
  title,
  subtitle = "Quizzes, practice exams, notes, and extra help, filed under the class they belong to.",
  showHeader = true
}: {
  routePrefix: string;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const { attempts, isAuthenticated, supabase, user, profile } = useAppData();
  // "Your courses" is only true once someone is signed in; a visitor
  // browsing the public catalog owns none of it yet.
  const heading = title ?? (isAuthenticated ? "Your courses" : "Courses");
  // Sorting by mastery is meaningless without a signed-in history, and
  // the mastery bars are hidden in that case anyway.
  const availableSortOptions = isAuthenticated
    ? sortOptions
    : sortOptions.filter((opt) => opt.value !== "mastery");
  // Centralized access — drives the AccessBadge variant per card.
  const access = useAccess();
  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState<string>("all");
  const [sortBy, setSortBy] = useState<SortBy>("default");
  const [studentSectionsByCourseId, setStudentSectionsByCourseId] = useState<
    Record<string, JoinedSectionSummary[]>
  >({});
  const [selectedSectionByCourseId, setSelectedSectionByCourseId] = useState<Record<string, string>>({});
  const [courseGradesById, setCourseGradesById] = useState<Record<string, StudentCourseGradeSummary>>({});

  const isStudent = profile.role === "student";

  useEffect(() => {
    if (!isAuthenticated || !supabase || !user || !isStudent) {
      setStudentSectionsByCourseId({});
      setSelectedSectionByCourseId({});
      setCourseGradesById({});
      return;
    }

    let active = true;
    Promise.all([listJoinedSections(supabase, user.id), listStudentCourseGrades(supabase, user.id)])
      .then(([rows, gradeRows]) => {
        if (!active) return;

        const nextByCourse: Record<string, JoinedSectionSummary[]> = {};
        for (const row of rows) {
          if (row.role !== "student") continue;
          if (row.isOwner) continue;
          nextByCourse[row.courseId] = [...(nextByCourse[row.courseId] ?? []), row];
        }

        const nextGrades: Record<string, StudentCourseGradeSummary> = {};
        for (const gradeRow of gradeRows) {
          nextGrades[gradeRow.courseId] = gradeRow;
        }

        setStudentSectionsByCourseId(nextByCourse);
        setCourseGradesById(nextGrades);
        setSelectedSectionByCourseId((prev) => {
          const nextSelected: Record<string, string> = {};
          for (const [courseId, sections] of Object.entries(nextByCourse)) {
            const stillValid = prev[courseId] && sections.some((section) => section.sectionId === prev[courseId]);
            nextSelected[courseId] = stillValid ? prev[courseId] : sections[0]?.sectionId ?? "";
          }
          return nextSelected;
        });
      })
      .catch(() => {
        if (!active) return;
        setStudentSectionsByCourseId({});
        setSelectedSectionByCourseId({});
        setCourseGradesById({});
      });

    return () => {
      active = false;
    };
  }, [isAuthenticated, isStudent, supabase, user]);

  const decorated = useMemo(() => {
    return courses.map((course) => {
      const courseSets = quizSets.filter((q) => q.courseId === course.id);
      const quizCount = courseSets.filter((s) => resolveQuizSetMode(s) === "quiz").length;
      const examCount = courseSets.filter((s) => resolveQuizSetMode(s) === "exam").length;
      const homeworkCount = courseSets.filter((s) => resolveQuizSetMode(s) === "homework").length;
      const estimatedMinutes = courseSets.reduce((sum, s) => sum + s.estMinutes, 0);
      const questionCount = courseSets.reduce((sum, s) => sum + s.questions.length, 0);
      const mastery = courseProgress(attempts, course.id);
      return {
        ...course,
        artwork: courseArtworkById[course.id] ?? "/images/courses/default-course.svg",
        quizCount,
        examCount,
        homeworkCount,
        estimatedMinutes,
        questionCount,
        mastery,
        totalLanes: quizCount + examCount + homeworkCount
      };
    });
  }, [attempts]);

  const filtered = useMemo(() => {
    let next = decorated.filter((course) => {
      const searchMatch =
        search.trim().length === 0 ||
        `${course.name} ${course.code} ${course.topics.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const diffMatch = difficulty === "all" || course.difficulty === difficulty;
      return searchMatch && diffMatch;
    });

    switch (sortBy) {
      case "name":
        next = [...next].sort((a, b) => a.name.localeCompare(b.name));
        break;
      case "mastery":
        next = [...next].sort((a, b) => b.mastery - a.mastery);
        break;
      case "shortest":
        next = [...next].sort((a, b) => a.estimatedMinutes - b.estimatedMinutes);
        break;
      case "longest":
        next = [...next].sort((a, b) => b.estimatedMinutes - a.estimatedMinutes);
        break;
      default:
        next = [...next].sort((a, b) => b.totalLanes - a.totalLanes);
    }

    return next;
  }, [decorated, search, difficulty, sortBy]);

  const totalQuestions = decorated.reduce((sum, c) => sum + c.questionCount, 0);
  const totalMinutes = decorated.reduce((sum, c) => sum + c.estimatedMinutes, 0);

  return (
    <div className="space-y-7">
      {showHeader ? (
        /* Calmer header — no eyebrow tag, headline carries the moment.
           Stats become a small mono context line on the right (matches
           the editorial homepage's section-meta pattern). */
        <header className="flex flex-col gap-3 border-b border-borderc/70 pb-5 md:flex-row md:items-end md:justify-between">
          <div className="max-w-2xl space-y-2">
            <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-text sm:text-[2.4rem]">
              {heading}
            </h1>
            <p className="text-[14px] leading-relaxed text-text-secondary">{subtitle}</p>
          </div>
          <p className="font-mono text-[10.5px] uppercase tracking-[0.22em] text-text-secondary">
            <span className="text-text">{decorated.length}</span> courses
            <span className="mx-2 text-text-secondary/50">·</span>
            <span className="text-text">{totalQuestions}</span> questions
            <span className="mx-2 text-text-secondary/50">·</span>
            <span className="text-text">{totalMinutes}m</span> practice
          </p>
        </header>
      ) : null}

      {/* Filter row — tighter pills, all aligned on a single hairline
          row. The search input is the focal point; the two selects are
          quiet siblings; "Reset" is a ghost link. */}
      <Card>
        <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-secondary" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search course, code, or topic"
              aria-label="Search courses"
            />
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-borderc bg-soft px-3 py-2">
            <Filter className="h-4 w-4 text-text-secondary" aria-hidden />
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="bg-transparent text-[13.5px] text-text outline-none"
              aria-label="Filter by difficulty"
            >
              <option value="all">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-borderc bg-soft px-3 py-2">
            <ArrowUpDown className="h-4 w-4 text-text-secondary" aria-hidden />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="bg-transparent text-[13.5px] text-text outline-none"
              aria-label="Sort courses"
            >
              {availableSortOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          <Button
            variant="ghost"
            className="w-full md:w-auto"
            onClick={() => {
              setSearch("");
              setDifficulty("all");
              setSortBy("default");
            }}
          >
            Reset
          </Button>
        </CardBody>
      </Card>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Search className="h-6 w-6" />}
          title="No courses match those filters"
          description="Try resetting your search or exploring a different difficulty level."
          action={
            <Button
              onClick={() => {
                setSearch("");
                setDifficulty("all");
                setSortBy("default");
              }}
            >
              Reset filters
            </Button>
          }
        />
      ) : (
        <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((course, idx) => {
            const courseSections = isStudent ? studentSectionsByCourseId[course.id] ?? [] : [];
            const selectedSectionId = selectedSectionByCourseId[course.id] ?? courseSections[0]?.sectionId;
            const hasCourseSections = courseSections.length > 0 && Boolean(selectedSectionId);
            const primaryHref = hasCourseSections
              ? `/app/sections/${selectedSectionId}/materials`
              : withPrefix(routePrefix, `/courses/${course.id}`);
            const primaryLabel = hasCourseSections ? "Open my class" : "Open course";
            const selectedSection = courseSections.find((section) => section.sectionId === selectedSectionId);
            const gradeSummary = courseGradesById[course.id];
            const selectedSectionLabel = selectedSection
              ? selectedSection.term
                ? `${selectedSection.sectionName} (${selectedSection.term})`
                : selectedSection.sectionName
              : "Select a section";
            const sectionMaterialHref = selectedSectionId
              ? `/app/sections/${selectedSectionId}/materials`
              : withPrefix(routePrefix, `/courses/${course.id}`);
            // Per-card access tier indicator. Section-joined > institution
            // > premium > free. Hidden for guests (no badge clutter).
            const accessVariant: "institution" | "premium" | "free" | null = hasCourseSections
              ? "institution"
              : access.isInstitutionCovered
                ? "institution"
                : access.isPremium
                  ? "premium"
                  : access.isGuest
                    ? null
                    : "free";
            const openPrimary = () => router.push(primaryHref);

            return (
              <article
                key={course.id}
                className={`group relative flex flex-col overflow-hidden rounded-2xl border border-borderc bg-surface dark:bg-surface-raised shadow-[0_1px_0_hsl(var(--surface-raised)/0.06)_inset,0_18px_44px_-24px_hsl(var(--text)/0.28),0_6px_16px_-10px_hsl(var(--text)/0.16)] dark:shadow-[0_1px_0_hsl(var(--text)/0.04)_inset,0_18px_44px_-22px_rgba(0,0,0,0.55)] transition-all duration-200 ease-out-expo hover:-translate-y-px hover:border-border-accent stagger-${(idx % 6) + 1}`}
              >
                {/* Hero artwork — calmer chrome (single accent pill on
                    top-left, optional access badge top-right, no
                    overlaid title — the title sits in the body where
                    it's typographically anchored). */}
                <button
                  type="button"
                  onClick={openPrimary}
                  className="relative h-40 w-full overflow-hidden border-b border-borderc bg-soft text-left"
                  aria-label={`${primaryLabel} for ${course.name}`}
                >
                  <Image
                    src={course.artwork}
                    alt={`${course.name} artwork`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/35 via-transparent to-transparent" />
                  <div className="absolute left-3 top-3">
                    <Badge tone="accent">{course.code}</Badge>
                  </div>
                  {accessVariant ? (
                    <div className="absolute right-3 top-3">
                      <AccessBadge variant={accessVariant} />
                    </div>
                  ) : null}
                </button>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <div>
                    <h2 className="font-display text-[1.2rem] font-semibold leading-tight tracking-tight text-text">
                      {course.name}
                    </h2>
                    <p className="mt-1.5 line-clamp-2 text-[13px] leading-relaxed text-text-secondary">
                      {course.description}
                    </p>
                  </div>

                  {/* Mastery — moved up so the progress signal lands
                      before the metadata. Signed-out visitors have no
                      progress to show, so the bar would just read 0%
                      everywhere and look broken; hide it for them. */}
                  {isAuthenticated ? (
                  <div>
                    <div className="mb-1.5 flex items-baseline justify-between text-[11px]">
                      <span className="font-bold uppercase tracking-[0.18em] text-text-secondary">
                        Mastery
                      </span>
                      <span className="font-mono font-semibold text-text">{course.mastery}%</span>
                    </div>
                    <ProgressBar value={course.mastery} glow />
                  </div>
                  ) : null}

                  {/* Mode counts as a single mono context line —
                      replaces the previous 3-column sub-card grid. */}
                  <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                    <span className="text-text">{course.quizCount}</span> quiz
                    <span className="mx-2 text-text-secondary/50">·</span>
                    <span className="text-text">{course.examCount}</span> exam
                    <span className="mx-2 text-text-secondary/50">·</span>
                    <span className="text-text">{course.homeworkCount}</span> hw
                    <span className="mx-2 text-text-secondary/50">·</span>
                    {course.difficulty}
                  </p>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {course.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-full border border-borderc bg-soft px-2 py-0.5 text-[10.5px] text-text-secondary"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  {/* Optional grade summary */}
                  {isStudent && gradeSummary ? (
                    <div className="rounded-[0.9rem] border border-borderc bg-soft px-3 py-2 text-[12px] text-text-secondary">
                      <span className="font-mono font-bold text-text">{gradeSummary.gradedCount}</span> graded
                      {gradeSummary.pendingCount > 0 ? (
                        <>
                          {" · "}
                          <span className="font-mono font-bold text-text">
                            {gradeSummary.pendingCount}
                          </span>{" "}
                          pending
                        </>
                      ) : null}
                      {typeof gradeSummary.average === "number" ? (
                        <>
                          {" · "}
                          <span className="font-mono font-bold text-text">{gradeSummary.average}%</span>{" "}
                          overall
                        </>
                      ) : null}
                    </div>
                  ) : null}

                  {/* Section selector */}
                  {hasCourseSections ? (
                    <div className="space-y-2 rounded-[1rem] border border-success/30 bg-success/10 p-3">
                      <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-success">
                        Your class section
                      </p>
                      <select
                        value={selectedSectionId}
                        onChange={(event) =>
                          setSelectedSectionByCourseId((prev) => ({
                            ...prev,
                            [course.id]: event.target.value
                          }))
                        }
                        className="min-w-0 flex-1 rounded-lg border border-borderc bg-surface px-2.5 py-2 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-success/55"
                        aria-label={`${course.name} sections`}
                      >
                        {courseSections.map((section) => (
                          <option key={section.sectionId} value={section.sectionId}>
                            {section.term ? `${section.sectionName} (${section.term})` : section.sectionName}
                          </option>
                        ))}
                      </select>
                      <p className="text-[11.5px] text-text-secondary">
                        Selected: <span className="font-semibold text-text">{selectedSectionLabel}</span>
                      </p>
                    </div>
                  ) : null}

                  {/* Actions — one primary button. When the student is in a
                      class section, the public version is still reachable via a
                      small text link so the card has just one obvious button. */}
                  <div className="mt-auto flex flex-col gap-2">
                    <Button asChild size="lg" className="w-full justify-between">
                      <Link href={primaryHref}>
                        {primaryLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {hasCourseSections ? (
                      <Link
                        href={withPrefix(routePrefix, `/courses/${course.id}`)}
                        className="text-center text-[12.5px] font-medium text-text-secondary underline decoration-borderc underline-offset-4 hover:text-text"
                      >
                        Or open the public course
                      </Link>
                    ) : null}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}

      {/* Footer hint */}
      <div className="rounded-[1.25rem] border border-borderc bg-surface/85 px-5 py-4 text-[13px] text-text-secondary">
        <p className="font-display text-[15px] font-semibold text-text">Don&apos;t see your class?</p>
        <p className="mt-1">
          Ask us to set it up for you.{" "}
          <Link
            href="/contact?intent=implementation"
            className="font-semibold text-accent transition-colors hover:text-text"
          >
            Send a request
          </Link>{" "}
          and we&apos;ll work directly with the instructor or department.
        </p>
      </div>
    </div>
  );
}
