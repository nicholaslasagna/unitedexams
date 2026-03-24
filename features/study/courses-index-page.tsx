"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Filter, Search } from "lucide-react";
import { courses, quizSets } from "@/data/seed";
import { Card, CardBody } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

export function CoursesIndexContent({
  routePrefix,
  title = "Course Catalog",
  subtitle = "Structured quiz sets, notes, cheat sheets, and resources across your core classes.",
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
  const [studentSectionsByCourseId, setStudentSectionsByCourseId] = useState<Record<string, JoinedSectionSummary[]>>({});
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

  const filtered = useMemo(() => {
    return courses.filter((course) => {
      const searchMatch =
        search.trim().length === 0 ||
        `${course.name} ${course.code} ${course.topics.join(" ")}`.toLowerCase().includes(search.toLowerCase());
      const diffMatch = difficulty === "all" || course.difficulty === difficulty;
      return searchMatch && diffMatch;
    });
  }, [search, difficulty]);

  return (
    <div className="space-y-5 sm:space-y-6">
      {showHeader ? (
        <section>
          <h1 className="text-3xl font-semibold tracking-tight sm:text-display-lg">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-muted text-text-secondary sm:text-base">{subtitle}</p>
        </section>
      ) : null}

      <Card>
        <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
            <Input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              className="pl-9"
              placeholder="Search by course, code, or topic"
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

          <Button
            variant="ghost"
            className="w-full md:w-auto"
            onClick={() => {
              setSearch("");
              setDifficulty("all");
            }}
          >
            Reset filters
          </Button>
        </CardBody>
      </Card>

      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((course, idx) => {
          const progress = courseProgress(attempts, course.id);
          const courseSets = quizSets.filter((quiz) => quiz.courseId === course.id);
          const quizCount = courseSets.filter((set) => resolveQuizSetMode(set) === "quiz").length;
          const examCount = courseSets.filter((set) => resolveQuizSetMode(set) === "exam").length;
          const homeworkCount = courseSets.filter((set) => resolveQuizSetMode(set) === "homework").length;
          const courseSections = isStudent ? (studentSectionsByCourseId[course.id] ?? []) : [];
          const selectedSectionId = selectedSectionByCourseId[course.id] ?? courseSections[0]?.sectionId;
          const hasCourseSections = courseSections.length > 0 && Boolean(selectedSectionId);
          const primaryHref = hasCourseSections
            ? `/app/sections/${selectedSectionId}/materials`
            : withPrefix(routePrefix, `/courses/${course.id}`);
          const primaryLabel = hasCourseSections ? "Open class materials" : "Study materials";
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
          const artworkSrc = courseArtworkById[course.id] ?? "/images/courses/default-course.svg";
          const openPrimary = () => {
            router.push(primaryHref);
          };
          return (
            <Card
              key={course.id}
              className={`group cursor-pointer overflow-hidden transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent focus-within:border-border-accent focus-within:shadow-card-hover stagger-${(idx % 6) + 1}`}
              onClick={openPrimary}
            >
              <CardBody
                className="space-y-5 p-5 sm:p-6"
                role="link"
                tabIndex={0}
                aria-label={`${primaryLabel} for ${course.name}`}
                onKeyDown={(event) => {
                  if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openPrimary();
                  }
                }}
              >
                <div className="space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-xs uppercase tracking-[0.14em] text-muted">{course.code}</p>
                      <h2 className="text-heading font-semibold text-text">{course.name}</h2>
                    </div>
                    <div className="hidden shrink-0 sm:block">
                      <Image
                        src={artworkSrc}
                        alt={`${course.name} course artwork`}
                        width={88}
                        height={56}
                        className="h-12 w-[5.5rem] rounded-lg border border-borderc object-cover"
                      />
                    </div>
                  </div>

                  <div className="overflow-hidden rounded-[1.1rem] border border-borderc sm:hidden">
                    <Image
                      src={artworkSrc}
                      alt={`${course.name} course artwork`}
                      width={640}
                      height={240}
                      className="h-28 w-full object-cover"
                    />
                  </div>

                  <p className="text-sm leading-relaxed text-muted text-text-secondary">{course.description}</p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>{course.difficulty}</Badge>
                  <Badge tone="brand">
                    {quizCount} quiz • {examCount} exam • {homeworkCount} hw
                  </Badge>
                  <Badge tone="success"><span className="font-mono">{progress}%</span> mastery</Badge>
                  {isStudent ? (
                    gradeSummary?.average !== null && gradeSummary?.average !== undefined ? (
                      <Badge tone={gradeSummary.average >= 90 ? "success" : gradeSummary.average >= 75 ? "brand" : gradeSummary.average >= 60 ? "warn" : "danger"}>
                        {gradeSummary.average}% overall
                      </Badge>
                    ) : (
                      <Badge tone="default">No grade yet</Badge>
                    )
                  ) : null}
                </div>

                {isStudent ? (
                  <div className="rounded-[1rem] border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary">
                    {gradeSummary ? (
                      <>
                        <span className="font-semibold text-text">{gradeSummary.gradedCount}</span> graded
                        {gradeSummary.pendingCount > 0 ? (
                          <>
                            {" · "}
                            <span className="font-semibold text-text">{gradeSummary.pendingCount}</span> pending
                          </>
                        ) : null}
                        <span className="block pt-1 text-[11px] uppercase tracking-[0.12em] text-faint">
                          {gradeSummary.policyLabel}
                        </span>
                      </>
                    ) : hasCourseSections ? (
                      "Joined section, but no graded work has posted yet."
                    ) : (
                      "No joined section yet."
                    )}
                  </div>
                ) : null}

                <div className="flex flex-wrap gap-2">
                  {course.tags.map((tag) => (
                    <span key={tag} className="rounded-full border border-borderc px-2 py-1 text-[11px] text-muted">
                      {tag}
                    </span>
                  ))}
                </div>

                {hasCourseSections ? (
                  <div
                    className="space-y-2 rounded-[1.2rem] border border-brand-2/30 bg-brand-2/10 p-3"
                    onClick={(event) => event.stopPropagation()}
                  >
                    <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-2">
                      Your class sections
                    </p>
                    <div className="flex flex-col gap-2">
                      <select
                        value={selectedSectionId}
                        onChange={(event) =>
                          setSelectedSectionByCourseId((prev) => ({
                            ...prev,
                            [course.id]: event.target.value
                          }))
                        }
                        className="min-w-0 flex-1 rounded-xl border border-borderc bg-surface px-3 py-3 text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
                        aria-label={`${course.name} sections`}
                      >
                        {courseSections.map((section) => (
                          <option key={section.sectionId} value={section.sectionId}>
                            {section.term ? `${section.sectionName} (${section.term})` : section.sectionName}
                          </option>
                        ))}
                      </select>
                      <Button variant="secondary" asChild className="w-full">
                        <Link href={sectionMaterialHref}>Open selected section</Link>
                      </Button>
                    </div>
                    <p className="text-xs text-text-secondary">
                      Selected: <span className="font-semibold text-text">{selectedSectionLabel}</span>
                    </p>
                  </div>
                ) : null}

                <Button
                  className="w-full justify-between transition-all duration-200 ease-out-expo"
                  asChild
                >
                  <Link href={primaryHref} onClick={(event) => event.stopPropagation()}>
                    {primaryLabel}
                    <span aria-hidden>→</span>
                  </Link>
                </Button>
              </CardBody>
            </Card>
          );
        })}
      </section>
    </div>
  );
}
