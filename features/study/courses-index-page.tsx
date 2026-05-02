"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  ArrowRight,
  ArrowUpDown,
  BookOpenCheck,
  Clock3,
  Filter,
  Search,
  Sparkles
} from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { AccessBadge } from "@/components/ui/access-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { useAppData } from "@/lib/app-data-context";
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
  { value: "shortest", label: "Shortest runway" },
  { value: "longest", label: "Most material" }
];

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

export function CoursesIndexContent({
  routePrefix,
  title = "Course Catalog",
  subtitle = "Structured quiz sets, exam simulations, walkthroughs, notes, and resources across your real classes.",
  showHeader = true
}: {
  routePrefix: string;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}) {
  const router = useRouter();
  const { attempts, isAuthenticated, supabase, user, profile } = useAppData();
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
    <div className="space-y-8">
      {showHeader ? (
        <SectionHeading
          eyebrow="Course atlas"
          title={title}
          description={subtitle}
          trailing={
            <div className="hidden flex-wrap gap-2 md:flex">
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderc bg-surface/80 px-3 py-1.5 text-xs text-text-secondary">
                <BookOpenCheck className="h-3.5 w-3.5 text-accent" />
                <span className="font-mono font-bold text-text">{decorated.length}</span> courses
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderc bg-surface/80 px-3 py-1.5 text-xs text-text-secondary">
                <Sparkles className="h-3.5 w-3.5 text-accent" />
                <span className="font-mono font-bold text-text">{totalQuestions}</span> questions
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-borderc bg-surface/80 px-3 py-1.5 text-xs text-text-secondary">
                <Clock3 className="h-3.5 w-3.5 text-accent" />
                <span className="font-mono font-bold text-text">{totalMinutes}m</span>
              </span>
            </div>
          }
        />
      ) : null}

      {/* Filter row */}
      <Card className="overflow-hidden">
        <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search course, code, or topic"
              aria-label="Search courses"
            />
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-borderc bg-soft px-3 py-2">
            <Filter className="h-4 w-4 text-muted" />
            <select
              value={difficulty}
              onChange={(event) => setDifficulty(event.target.value)}
              className="bg-transparent text-sm text-text outline-none"
              aria-label="Filter by difficulty"
            >
              <option value="all">All levels</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          <div className="flex items-center gap-2 rounded-xl border border-borderc bg-soft px-3 py-2">
            <ArrowUpDown className="h-4 w-4 text-muted" />
            <select
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value as SortBy)}
              className="bg-transparent text-sm text-text outline-none"
              aria-label="Sort courses"
            >
              {sortOptions.map((opt) => (
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
            const primaryLabel = hasCourseSections ? "Open class section" : "Open course hub";
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
            const accessVariant = hasCourseSections ? "institution" : "free";
            const openPrimary = () => router.push(primaryHref);

            return (
              <article
                key={course.id}
                className={`group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-borderc bg-surface shadow-subtle transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:border-border-accent hover:shadow-card-hover focus-within:border-border-accent stagger-${(idx % 6) + 1}`}
              >
                {/* Hero artwork */}
                <button
                  type="button"
                  onClick={openPrimary}
                  className="relative h-44 w-full overflow-hidden border-b border-borderc bg-soft text-left"
                  aria-label={`${primaryLabel} for ${course.name}`}
                >
                  <Image
                    src={course.artwork}
                    alt={`${course.name} artwork`}
                    fill
                    className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-bg/85 via-bg/15 to-transparent" />
                  <div className="absolute left-3 top-3 flex flex-wrap gap-2">
                    <Badge tone="accent">{course.code}</Badge>
                    <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>
                      {course.difficulty}
                    </Badge>
                  </div>
                  <div className="absolute right-3 top-3">
                    <AccessBadge variant={accessVariant} />
                  </div>
                  <div className="absolute bottom-3 left-3 right-3">
                    <p className="font-display text-xl font-semibold leading-tight text-text">
                      {course.name}
                    </p>
                  </div>
                </button>

                {/* Body */}
                <div className="flex flex-1 flex-col gap-4 p-5">
                  <p className="line-clamp-2 text-[13.5px] leading-snug text-text-secondary">
                    {course.description}
                  </p>

                  {/* Stats row */}
                  <div className="grid grid-cols-3 gap-2 text-center">
                    {[
                      { label: "Quiz", value: course.quizCount },
                      { label: "Exam", value: course.examCount },
                      { label: "HW", value: course.homeworkCount }
                    ].map((stat) => (
                      <div
                        key={stat.label}
                        className="rounded-[0.85rem] border border-borderc bg-soft px-2 py-2"
                      >
                        <p className="font-mono text-base font-bold leading-none text-text">{stat.value}</p>
                        <p className="mt-1 text-[10px] uppercase tracking-[0.16em] text-text-secondary">
                          {stat.label}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Mastery */}
                  <div>
                    <div className="mb-1.5 flex items-center justify-between text-[11.5px]">
                      <span className="font-bold uppercase tracking-[0.16em] text-text-secondary">
                        Mastery
                      </span>
                      <span className="font-mono font-bold text-text">{course.mastery}%</span>
                    </div>
                    <ProgressBar value={course.mastery} glow />
                  </div>

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

                  {/* Actions */}
                  <div className="mt-auto flex flex-col gap-2">
                    <Button asChild className="w-full justify-between">
                      <Link href={primaryHref}>
                        {primaryLabel}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    {hasCourseSections ? (
                      <Button asChild variant="ghost" className="w-full justify-between">
                        <Link href={withPrefix(routePrefix, `/courses/${course.id}`)}>
                          Open public hub
                          <ArrowRight className="h-4 w-4" />
                        </Link>
                      </Button>
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
          Ask us to spin up a hub for it.{" "}
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
