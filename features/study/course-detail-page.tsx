"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ArrowRight,
  BookOpenText,
  Brain,
  ChevronRight,
  Clock3,
  FileText,
  Flame,
  Search,
  Sparkles,
  TimerReset,
  TrendingUp,
  Trophy
} from "lucide-react";
import { getCourse, getCourseContent, getCourseQuizSets } from "@/data/seed";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { MasteryRing } from "@/components/ui/mastery-ring";
import { AccessBadge } from "@/components/ui/access-badge";
import { SectionHeading } from "@/components/ui/section-heading";
import { EmptyState } from "@/components/ui/empty-state";
import { Markdown } from "@/components/ui/markdown";
import { InstitutionAccessNote } from "@/components/ui/institution-access-note";
import { PremiumUnlockNote } from "@/components/ui/premium-unlock-note";
import { useAppData } from "@/lib/app-data-context";
import { useAccess } from "@/lib/hooks/use-access";
import { modeLabel, resolveQuestionCountTarget, resolveQuizSetMode } from "@/lib/study/set-mode";
import { fetchPublishedSetsByCourse } from "@/features/study/study-set-source";
import {
  attemptsForCourse,
  bestScoreForQuiz,
  courseProgress,
  latestAttemptForQuiz,
  topicMasteryForCourse
} from "@/features/progress/metrics";
import type { QuizSet } from "@/lib/types";
import { getCourseVisual } from "@/features/study/course-branding";

const tabDefs = [
  { id: "quizzes", label: "Quizzes" },
  { id: "exams", label: "Exams" },
  { id: "homework", label: "Homework" },
  { id: "notes", label: "Notes" },
  { id: "cheats", label: "Cheat sheets" },
  { id: "resources", label: "Resources" }
];

const tabMeta: Record<string, { title: string; description: string }> = {
  quizzes: {
    title: "Quiz practice",
    description:
      "Mastery-focused practice with study and timed variants. Best for momentum and topic repetition."
  },
  exams: {
    title: "Exam simulations",
    description: "Higher-pressure sets that mirror the actual testing window."
  },
  homework: {
    title: "Homework lane",
    description: "Assignment-style work with hints, flagged review, and longer problems."
  },
  notes: {
    title: "Study notes",
    description: "Course walkthrough, concept framing, and structured written guidance."
  },
  cheats: {
    title: "Cheat sheets",
    description: "Compressed reference for formulas, patterns, and fast recall."
  },
  resources: {
    title: "External resources",
    description: "Curated supporting references linked to this course lane."
  }
};

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

function mergeCourseSets(localSets: QuizSet[], remoteSets: QuizSet[]) {
  const merged = new Map(localSets.map((set) => [set.id, set] as const));
  for (const remoteSet of remoteSets) {
    const existing = merged.get(remoteSet.id);
    merged.set(remoteSet.id, {
      ...(existing ?? {}),
      ...remoteSet,
      questions: remoteSet.questions.length > 0 ? remoteSet.questions : existing?.questions ?? []
    });
  }
  return Array.from(merged.values());
}

export function CourseDetailContent({
  courseId,
  routePrefix
}: {
  courseId: string;
  routePrefix: string;
}) {
  const course = getCourse(courseId);
  const content = getCourseContent(courseId);
  const visual = getCourseVisual(courseId);

  const { attempts, profile } = useAppData();
  const access = useAccess();
  const [tab, setTab] = useState("quizzes");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");
  const [sets, setSets] = useState<QuizSet[]>(() => (course ? getCourseQuizSets(course.id) : []));

  useEffect(() => {
    if (!course) {
      setSets([]);
      return;
    }

    let active = true;
    const localSets = getCourseQuizSets(course.id);
    setSets(localSets);
    fetchPublishedSetsByCourse(course.id)
      .then((remoteSets) => {
        if (!active) return;
        setSets(mergeCourseSets(localSets, remoteSets));
      })
      .catch(() => {
        if (!active) return;
        setSets(localSets);
      });

    return () => {
      active = false;
    };
  }, [course]);

  const progress = course ? courseProgress(attempts, course.id) : 0;
  const courseAttempts = course ? attemptsForCourse(attempts, course.id) : [];
  const attemptCount = courseAttempts.length;
  const mastery = course ? topicMasteryForCourse(attempts, course.id).slice(0, 8) : [];
  const weakTopics = useMemo(() => [...mastery].sort((a, b) => a.score - b.score).slice(0, 3), [mastery]);

  const filteredSets = useMemo(() => {
    const activeMode =
      tab === "exams" ? "exam" : tab === "homework" ? "homework" : tab === "quizzes" ? "quiz" : null;

    return sets.filter((set) => {
      if (activeMode && resolveQuizSetMode(set) !== activeMode) {
        return false;
      }
      const q = query.toLowerCase();
      const searchMatch =
        q.length === 0 ||
        `${set.title} ${set.description} ${set.tags.join(" ")}`.toLowerCase().includes(q);
      const diffMatch = difficulty === "all" || set.difficulty === difficulty;
      return searchMatch && diffMatch;
    });
  }, [sets, query, difficulty, tab]);

  const quizModeCount = useMemo(
    () => sets.filter((set) => resolveQuizSetMode(set) === "quiz").length,
    [sets]
  );
  const examModeCount = useMemo(
    () => sets.filter((set) => resolveQuizSetMode(set) === "exam").length,
    [sets]
  );
  const homeworkModeCount = useMemo(
    () => sets.filter((set) => resolveQuizSetMode(set) === "homework").length,
    [sets]
  );

  const totalQuestions = useMemo(
    () => sets.reduce((sum, s) => sum + s.questions.length, 0),
    [sets]
  );
  const totalEstimatedMinutes = useMemo(
    () => sets.reduce((sum, s) => sum + s.estMinutes, 0),
    [sets]
  );

  const recommendedSet = useMemo(() => {
    if (sets.length === 0) return null;
    if (courseAttempts.length === 0) {
      // Pick the easiest quiz as the entry point
      return (
        sets
          .filter((s) => resolveQuizSetMode(s) === "quiz")
          .sort((a, b) => a.estMinutes - b.estMinutes)[0] ?? sets[0]
      );
    }
    // Recommend the set with the lowest best score (most room to improve)
    return [...sets].sort((a, b) => bestScoreForQuiz(attempts, a.id) - bestScoreForQuiz(attempts, b.id))[0];
  }, [sets, courseAttempts.length, attempts]);

  const recommendedMode = recommendedSet ? resolveQuizSetMode(recommendedSet) : "quiz";
  const recommendedHref = recommendedSet
    ? recommendedMode === "homework"
      ? withPrefix(routePrefix, `/homework/${recommendedSet.id}`)
      : withPrefix(routePrefix, `/quiz/${recommendedSet.id}${recommendedMode === "exam" ? "?mode=exam" : "?mode=study"}`)
    : "#";

  const activeTabMeta = tabMeta[tab] ?? tabMeta.quizzes;

  if (!course || !content) {
    return (
      <EmptyState
        icon={<Search className="h-6 w-6" />}
        title="Course not found"
        description="This course page is unavailable."
        action={
          <Button asChild>
            <Link href={withPrefix(routePrefix, "/courses")}>Back to courses</Link>
          </Button>
        }
      />
    );
  }

  return (
    <div className="space-y-8">
      {/* ─── COURSE HERO ─────────────────────────────────── */}
      <section className="relative">
        <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-90" aria-hidden />
        <div className="premium-card glow-border overflow-hidden">
          <div className="grid gap-6 p-5 sm:p-6 lg:grid-cols-[1.18fr_0.82fr] lg:p-8">
            <div className="space-y-5">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="accent">{course.code}</Badge>
                <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>
                  {course.difficulty}
                </Badge>
                {access.isInstitutionCovered ? (
                  <AccessBadge variant="institution" label="Institution access" />
                ) : access.isPremium ? (
                  <AccessBadge variant="premium" label="Premium active" />
                ) : (
                  <AccessBadge variant="free" label="Public hub" />
                )}
              </div>

              <div>
                <h1 className="font-display text-[2.4rem] font-semibold leading-[1.02] tracking-tight text-text sm:text-[3.25rem]">
                  {course.name}
                </h1>
                <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-text-secondary">
                  {course.description}
                </p>
              </div>

              <div className="flex flex-wrap gap-2">
                {course.tags.map((tag) => (
                  <span
                    key={tag}
                    className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${visual.chipClass}`}
                  >
                    {tag}
                  </span>
                ))}
              </div>

              {/* Recommended next */}
              {recommendedSet ? (
                <div className="rounded-[1.25rem] border border-accent/35 bg-accent/10 p-4 sm:p-5">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-surface/70 px-2.5 py-1 text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                        <Sparkles className="h-3 w-3" />
                        Recommended next
                      </span>
                      <Badge
                        tone={
                          recommendedMode === "exam" ? "warn" : recommendedMode === "homework" ? "success" : "brand"
                        }
                      >
                        {modeLabel(recommendedMode)}
                      </Badge>
                    </div>
                    <span className="text-[12px] text-text-secondary">
                      ~{recommendedSet.estMinutes} min · {recommendedSet.questions.length} q
                    </span>
                  </div>

                  <p className="mt-3 font-display text-lg font-semibold text-text">
                    {recommendedSet.title}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    {courseAttempts.length === 0
                      ? "Start here. The easiest entry into this course."
                      : "Lowest best score so far — the highest-leverage place to improve."}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    <Button asChild>
                      <Link href={recommendedHref}>
                        {recommendedMode === "exam"
                          ? "Open exam simulation"
                          : recommendedMode === "homework"
                            ? "Open homework"
                            : "Open study walkthrough"}
                        <ArrowRight className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button asChild variant="ghost">
                      <Link
                        href={
                          recommendedMode === "homework"
                            ? withPrefix(routePrefix, `/homework/${recommendedSet.id}?review=1`)
                            : withPrefix(routePrefix, `/quiz/${recommendedSet.id}`)
                        }
                      >
                        Try test mode instead
                      </Link>
                    </Button>
                  </div>
                </div>
              ) : null}

              {/* Stats */}
              <div className="grid gap-3 sm:grid-cols-4">
                <CourseStat
                  icon={<Brain className="h-3.5 w-3.5" />}
                  label="Lanes"
                  value={quizModeCount + examModeCount + homeworkModeCount}
                />
                <CourseStat
                  icon={<Sparkles className="h-3.5 w-3.5" />}
                  label="Questions"
                  value={totalQuestions}
                />
                <CourseStat
                  icon={<Clock3 className="h-3.5 w-3.5" />}
                  label="Runway"
                  value={`${totalEstimatedMinutes}m`}
                />
                <CourseStat
                  icon={<Trophy className="h-3.5 w-3.5" />}
                  label="Attempts"
                  value={attemptCount}
                />
              </div>
            </div>

            {/* Right: mastery + course visual */}
            <div className="space-y-4">
              <div className="relative overflow-hidden rounded-[1.4rem] border border-borderc bg-soft/70">
                <div className={`relative h-44 bg-gradient-to-br ${visual.surfaceClass}`}>
                  <Image
                    src={visual.artworkSrc}
                    alt={`${course.name} artwork`}
                    fill
                    className="object-cover opacity-95"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-surface/85 via-transparent to-transparent" />
                </div>
              </div>

              <div className="flex items-center gap-4 rounded-[1.25rem] border border-borderc bg-surface/85 p-4">
                <MasteryRing
                  value={progress}
                  size={108}
                  stroke={11}
                  label="Mastery"
                  tone={progress >= 80 ? "success" : progress >= 50 ? "brand" : "warn"}
                />
                <div className="flex-1 space-y-1.5">
                  <p className="font-display text-base font-semibold text-text">
                    {attemptCount === 0 ? "Ready when you are" : "Course readiness"}
                  </p>
                  <p className="text-[12.5px] leading-snug text-text-secondary">
                    {attemptCount === 0
                      ? "Start a quiz to begin tracking mastery and topic-level signals."
                      : `Across ${attemptCount} attempt${attemptCount === 1 ? "" : "s"} on this course.`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-[1rem] border border-borderc bg-surface/85 px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Notes stack
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-text">
                    Notes + cheat sheet
                  </p>
                  <p className="mt-1 text-[11.5px] text-text-secondary">
                    Plus {content.resources.length} curated references.
                  </p>
                </div>
                <div className="rounded-[1rem] border border-borderc bg-surface/85 px-3 py-3">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Topic signals
                  </p>
                  <p className="mt-1 font-display text-base font-semibold text-text">
                    {mastery.length > 0 ? `${mastery.length} tracked` : "Unlock by attempting"}
                  </p>
                  <p className="mt-1 text-[11.5px] text-text-secondary">
                    {mastery.length > 0 ? "See the breakdown below." : "First attempt seeds the data."}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── STUDY LANES ─────────────────────────────────── */}
      <section>
        <div className="grid gap-4 lg:grid-cols-3">
          {[
            {
              id: "quizzes",
              title: "Quiz practice",
              count: quizModeCount,
              detail: "Mastery-focused practice with study and timed variants.",
              tone: "from-cyan-500/12 to-blue-500/10",
              border: "border-cyan-400/25"
            },
            {
              id: "exams",
              title: "Exam simulations",
              count: examModeCount,
              detail: "Higher-pressure sets intended to mirror test conditions.",
              tone: "from-amber-500/12 to-rose-500/10",
              border: "border-amber-400/25"
            },
            {
              id: "homework",
              title: "Homework desk",
              count: homeworkModeCount,
              detail: "Assignment-style work with review and flagged follow-up.",
              tone: "from-emerald-500/12 to-teal-500/10",
              border: "border-emerald-400/25"
            }
          ].map((lane) => {
            const active = tab === lane.id;
            return (
              <button
                key={lane.id}
                type="button"
                onClick={() => setTab(lane.id)}
                className={`group relative flex flex-col overflow-hidden rounded-[1.4rem] border bg-gradient-to-br ${lane.tone} p-5 text-left transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover ${
                  active ? `${lane.border} shadow-card-hover` : "border-borderc"
                }`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                      Study lane
                    </p>
                    <p className="mt-2 font-display text-xl font-semibold text-text">{lane.title}</p>
                  </div>
                  <span className="font-mono text-3xl font-bold text-text">{lane.count}</span>
                </div>
                <p className="mt-3 text-[13.5px] leading-relaxed text-text-secondary">{lane.detail}</p>
                <span
                  className={`mt-4 inline-flex items-center gap-1 text-[12.5px] font-semibold ${active ? "text-accent" : "text-text-secondary"}`}
                >
                  {active ? "Active lane" : "Open lane"}
                  <ChevronRight className="h-3.5 w-3.5" />
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* ─── TAB SWITCHER ────────────────────────────────── */}
      <div className="space-y-4">
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
            Course workspace
          </span>
          <Tabs tabs={tabDefs} value={tab} onChange={setTab} />
        </div>

        <Card>
          <CardBody className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="font-display text-xl font-semibold text-text">{activeTabMeta.title}</p>
              <p className="mt-1 max-w-3xl text-[13.5px] text-text-secondary">{activeTabMeta.description}</p>
            </div>
            {tab === "quizzes" || tab === "exams" || tab === "homework" ? (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] lg:min-w-[34rem]">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                  <Input
                    className="pl-9"
                    placeholder="Search sets, tags, or concepts"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    aria-label="Search quiz sets"
                  />
                </div>
                <select
                  value={difficulty}
                  onChange={(event) => setDifficulty(event.target.value)}
                  className="h-11 rounded-xl border border-borderc bg-soft px-3 text-sm text-text"
                  aria-label="Filter difficulty"
                >
                  <option value="all">All difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
                <Button
                  variant="ghost"
                  className="w-full lg:w-auto"
                  onClick={() => {
                    setQuery("");
                    setDifficulty("all");
                  }}
                >
                  Reset
                </Button>
              </div>
            ) : null}
          </CardBody>
        </Card>
      </div>

      {/* ─── SET LIST ────────────────────────────────────── */}
      {tab === "quizzes" || tab === "exams" || tab === "homework" ? (
        <section className="space-y-4" id={`panel-${tab}`}>
          {filteredSets.length === 0 ? (
            <EmptyState
              icon={<Search className="h-6 w-6" />}
              title="Nothing matches yet"
              description="Try resetting the search or switching lanes — there&apos;s usually a quiet entry point hidden in another lane."
              action={
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setDifficulty("all");
                  }}
                >
                  Reset filter
                </Button>
              }
            />
          ) : (
            <div className="grid gap-4">
              {filteredSets.map((set, idx) => {
                const setMode = resolveQuizSetMode(set);
                const targetCount = resolveQuestionCountTarget(set);
                const questionCount = set.questions.length || targetCount || 0;
                const latest = latestAttemptForQuiz(attempts, set.id);
                const best = bestScoreForQuiz(attempts, set.id);
                return (
                  <Card
                    key={set.id}
                    className={`overflow-hidden transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover hover:border-border-accent stagger-${(idx % 6) + 1}`}
                  >
                    <div className={`h-1.5 bg-gradient-to-r ${visual.surfaceClass}`} />
                    <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
                      <div>
                        <div className="flex flex-wrap gap-2">
                          <Badge
                            tone={setMode === "homework" ? "success" : setMode === "exam" ? "warn" : "brand"}
                          >
                            {modeLabel(setMode)}
                          </Badge>
                          <Badge>{set.difficulty}</Badge>
                          <Badge tone="brand">{questionCount} questions</Badge>
                        </div>
                        <h3 className="mt-3 font-display text-xl font-semibold text-text">{set.title}</h3>
                        <p className="mt-1 text-[13.5px] leading-relaxed text-text-secondary">
                          {set.description}
                        </p>
                      </div>
                      <div className="grid min-w-[14rem] gap-2 sm:text-right">
                        <div className="rounded-[0.95rem] border border-borderc bg-soft px-3.5 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                            Best score
                          </p>
                          <p className="mt-1 font-mono text-xl font-bold text-text">{best}%</p>
                        </div>
                        <div className="rounded-[0.95rem] border border-borderc bg-soft px-3.5 py-2.5">
                          <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                            Last
                          </p>
                          <p className="mt-1 font-mono text-sm font-bold text-text">
                            {latest ? `${latest.score}%` : "—"}
                          </p>
                        </div>
                      </div>
                    </CardHeader>
                    <CardBody className="space-y-4 p-5 sm:p-6">
                      <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1 rounded-full border border-borderc bg-soft px-2 py-1 text-text-secondary">
                          <Clock3 className="h-3 w-3" />
                          ~{set.estMinutes} min
                        </span>
                        {targetCount ? (
                          <span className="rounded-full border border-borderc bg-soft px-2 py-1 text-text-secondary">
                            Target {targetCount}
                          </span>
                        ) : null}
                        {set.tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full border border-borderc bg-soft px-2 py-1 text-text-secondary"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>

                      <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-[13px] text-text-secondary">
                        {setMode === "homework"
                          ? "Homework sets are built for longer-form work, review, and flagged follow-up."
                          : setMode === "exam"
                            ? "Exam simulations raise the pressure and are best for timing practice."
                            : "Quiz practice is best for frequent repetition, topic review, and momentum building."}
                      </div>

                      <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                        {setMode === "homework" ? (
                          <>
                            <Button asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/homework/${set.id}`)}>
                                Start Homework
                              </Link>
                            </Button>
                            <Button variant="secondary" asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/homework/${set.id}?review=1`)}>
                                Review flagged
                              </Link>
                            </Button>
                          </>
                        ) : setMode === "exam" ? (
                          <>
                            <Button asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/quiz/${set.id}?mode=exam`)}>
                                <TimerReset className="h-4 w-4" />
                                Start Exam Simulation
                              </Link>
                            </Button>
                            <Button variant="secondary" asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/quiz/${set.id}`)}>Practice this bank</Link>
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/quiz/${set.id}`)}>Start Quiz</Link>
                            </Button>
                            <Button variant="secondary" asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/quiz/${set.id}?mode=study`)}>
                                Study Walkthrough
                              </Link>
                            </Button>
                            <Button variant="ghost" asChild className="w-full sm:w-auto">
                              <Link href={withPrefix(routePrefix, `/quiz/${set.id}?mode=timed`)}>
                                Timed Mode
                              </Link>
                            </Button>
                          </>
                        )}
                      </div>
                    </CardBody>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      ) : null}

      {/* ─── NOTES TAB ───────────────────────────────────── */}
      {tab === "notes" ? (
        <section id="panel-notes">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                  <BookOpenText className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Study Notes</h2>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    Course walkthrough, concept framing, and structured written guidance.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Markdown content={content.notes} />
              {routePrefix === "/app" ? (
                <Button asChild variant="ghost" className="mt-4">
                  <Link href={withPrefix(routePrefix, `/notes/${course.id}`)}>
                    Open dedicated notes viewer
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              ) : null}
            </CardBody>
          </Card>
        </section>
      ) : null}

      {/* ─── CHEAT SHEET TAB ─────────────────────────────── */}
      {tab === "cheats" ? (
        <section id="panel-cheats">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="font-display text-xl font-semibold">Cheat Sheets</h2>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    Fast-reference formulas, patterns, and condensed reminders for this course.
                  </p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Markdown content={content.cheatSheet} />
            </CardBody>
          </Card>
        </section>
      ) : null}

      {/* ─── RESOURCES TAB ───────────────────────────────── */}
      {tab === "resources" ? (
        <section id="panel-resources" className="grid gap-3 md:grid-cols-2">
          {content.resources.map((item, idx) => (
            <Card
              key={item.href}
              className={`overflow-hidden transition-all duration-200 ease-out-expo hover:-translate-y-0.5 hover:shadow-card-hover hover:border-border-accent stagger-${(idx % 6) + 1}`}
            >
              <CardBody className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-accent/30 bg-accent/10 text-accent">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <Badge tone="brand">{item.type}</Badge>
                    <h3 className="mt-2 font-display text-lg font-semibold text-text">{item.label}</h3>
                  </div>
                </div>
                <p className="text-[13px] text-text-secondary">
                  External resource curated for this course lane.
                </p>
                <Button asChild variant="secondary" className="w-full justify-between">
                  <a href={item.href} target="_blank" rel="noreferrer">
                    Open resource
                    <span aria-hidden>↗</span>
                  </a>
                </Button>
              </CardBody>
            </Card>
          ))}
        </section>
      ) : null}

      {/* ─── MASTERY + WEAK TOPICS ───────────────────────── */}
      <section className="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
        <Card>
          <CardHeader>
            <SectionHeading
              eyebrow="Topic mastery"
              title="What you've practiced — and where to push next."
            />
          </CardHeader>
          <CardBody className="space-y-3">
            {mastery.length === 0 ? (
              <EmptyState
                icon={<Brain className="h-6 w-6" />}
                title="No mastery data yet"
                description="Start any quiz to seed topic-level signals. Mastery bars fill in automatically."
              />
            ) : (
              mastery.map((item) => (
                <div key={item.topic}>
                  <div className="mb-1 flex items-center justify-between text-[12px] text-text-secondary">
                    <span className="font-medium text-text">{item.topic}</span>
                    <span className="font-mono text-text">{item.score}%</span>
                  </div>
                  <ProgressBar value={item.score} glow={item.score === 100} />
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <SectionHeading
              eyebrow="Highest-leverage study"
              title="Weak topics to revisit."
            />
          </CardHeader>
          <CardBody className="space-y-3">
            {weakTopics.length === 0 ? (
              <EmptyState
                icon={<Flame className="h-6 w-6" />}
                title="Nothing flagged yet"
                description="Once a few attempts land, the weakest topics surface here automatically."
              />
            ) : (
              <ul className="space-y-2">
                {weakTopics.map((topic) => (
                  <li
                    key={topic.topic}
                    className="flex items-center justify-between gap-3 rounded-[0.95rem] border border-borderc bg-soft px-3 py-2.5"
                  >
                    <div>
                      <p className="text-[14px] font-semibold text-text">{topic.topic}</p>
                      <p className="text-[12px] text-text-secondary">
                        {topic.correct} / {topic.total} correct
                      </p>
                    </div>
                    <span
                      className={`rounded-full border px-2 py-1 font-mono text-xs font-bold ${
                        topic.score >= 70
                          ? "border-success/40 bg-success/10 text-success"
                          : topic.score >= 40
                            ? "border-warn/40 bg-warn/10 text-warn"
                            : "border-danger/40 bg-danger/10 text-danger"
                      }`}
                    >
                      {topic.score}%
                    </span>
                  </li>
                ))}
              </ul>
            )}

            <div className="rounded-[0.95rem] border border-borderc bg-soft px-3 py-2.5 text-[12px] text-text-secondary">
              <span className="inline-flex items-center gap-1.5 font-semibold text-text">
                <TrendingUp className="h-3.5 w-3.5 text-success" />
                Tip
              </span>{" "}
              Weak topics get prioritized in the recommended-next card when you return.
            </div>

            {/*
             * Access-aware footer:
             *   - institution-covered users see a warm note
             *   - non-premium signed-in students see a tasteful Premium hint
             *   - guests / premium users / professors see nothing
             */}
            {access.messaging.showInstitutionNote ? (
              <InstitutionAccessNote variant="inline" schoolName={profile?.school ?? null} />
            ) : !access.messaging.hidePremiumPrompts && !access.isGuest ? (
              <PremiumUnlockNote
                title="Available in full access"
                description="Mistake history and smart review plans use these signals to recommend the highest-leverage next step."
              />
            ) : null}
          </CardBody>
        </Card>
      </section>
    </div>
  );
}

function CourseStat({
  icon,
  label,
  value
}: {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="rounded-[1rem] border border-borderc bg-surface/85 p-3.5">
      <p className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.16em] text-text-secondary">
        {label}
        <span className="text-accent/80">{icon}</span>
      </p>
      <p className="mt-1.5 font-mono text-[1.55rem] font-bold leading-none text-text">{value}</p>
    </div>
  );
}
