"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { BookOpenText, Clock3, FileText, Search, Sparkles } from "lucide-react";
import { getCourse, getCourseContent, getCourseQuizSets } from "@/data/seed";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Markdown } from "@/components/ui/markdown";
import { useAppData } from "@/lib/app-data-context";
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
  { id: "notes", label: "Study Notes" },
  { id: "cheats", label: "Cheat Sheets" },
  { id: "resources", label: "Resources" }
];

const tabMeta: Record<string, { title: string; description: string }> = {
  quizzes: {
    title: "Quiz practice",
    description: "Work through mastery-focused practice sets with clear review loops and study-mode variants."
  },
  exams: {
    title: "Exam simulations",
    description: "Use higher-pressure sets and timed practice to simulate the actual testing environment."
  },
  homework: {
    title: "Homework lane",
    description: "Open assignment-style sets built for longer-form work, checking, and flagged review."
  },
  notes: {
    title: "Study notes",
    description: "Read the course walkthrough, concept summaries, and anchored explanations in one place."
  },
  cheats: {
    title: "Cheat sheets",
    description: "Use a compressed reference sheet for formulas, patterns, and fast recall."
  },
  resources: {
    title: "External resources",
    description: "Jump into the supporting references linked to this course lane."
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

  const { attempts } = useAppData();
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
  const attemptCount = course ? attemptsForCourse(attempts, course.id).length : 0;
  const mastery = course ? topicMasteryForCourse(attempts, course.id).slice(0, 8) : [];

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

  const activeTabMeta = tabMeta[tab] ?? tabMeta.quizzes;

  if (!course || !content) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <p className="text-heading font-semibold text-text">Course not found</p>
          <p className="text-sm text-muted text-text-secondary">This course page is unavailable.</p>
          <Button asChild>
            <Link href={withPrefix(routePrefix, "/courses")}>Back to courses</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-6 md:space-y-8">
      <section className="mesh-hero overflow-hidden rounded-[2rem] border border-borderc/80 bg-surface/65 shadow-[0_24px_80px_hsl(var(--bg)/0.4)] backdrop-blur-xl">
        <div className="grid gap-6 p-5 sm:p-6 xl:grid-cols-[1.12fr_0.88fr] xl:p-8">
          <div className="space-y-5">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex rounded-full border border-brand-2/35 bg-brand-2/10 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-brand-2">
                {course.code}
              </span>
              <Badge>{course.difficulty}</Badge>
              <Badge tone="success">{progress}% mastery</Badge>
            </div>

            <div className="space-y-3">
              <h1 className="max-w-[12ch] text-4xl font-display font-semibold leading-[0.96] tracking-tight text-text sm:text-5xl">
                {course.name}
              </h1>
              <p className="max-w-2xl text-sm leading-relaxed text-text-secondary sm:text-base">{course.description}</p>
            </div>

            <div className="flex flex-wrap gap-2">
              {course.tags.map((tag) => (
                <span key={tag} className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${visual.chipClass}`}>
                  {tag}
                </span>
              ))}
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Attempts</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{attemptCount}</p>
                <p className="mt-1 text-xs text-text-secondary">Completed study sessions in this course.</p>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Study lanes</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{quizModeCount + examModeCount + homeworkModeCount}</p>
                <p className="mt-1 text-xs text-text-secondary">Quiz, exam, and homework sets currently available.</p>
              </div>
              <div className="rounded-[1.25rem] border border-borderc bg-surface/70 p-4">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-text-secondary">Reference stack</p>
                <p className="mt-2 font-mono text-3xl font-bold text-text">{content.resources.length}</p>
                <p className="mt-1 text-xs text-text-secondary">Linked resources plus notes and course-specific reference sheets.</p>
              </div>
            </div>
          </div>

          <Card className={`overflow-hidden border-borderc/80 bg-[linear-gradient(180deg,hsl(var(--surface)/0.92),hsl(var(--surface-raised)/0.82))] ${visual.glowClass}`}>
            <CardBody className="space-y-5 p-5 sm:p-6">
              <div className="overflow-hidden rounded-[1.3rem] border border-borderc bg-surface/70">
                <div className={`relative h-52 bg-gradient-to-br ${visual.surfaceClass}`}>
                  <Image
                    src={visual.artworkSrc}
                    alt={`${course.name} artwork`}
                    fill
                    className="object-cover opacity-95"
                  />
                </div>
              </div>

              <div className="grid gap-3 text-sm text-text-secondary">
                <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">What lives here</p>
                  <p className="mt-2 leading-relaxed">Public study materials, course notes, and the full practice bank for this course lane.</p>
                </div>
                <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Notes stack</p>
                  <p className="mt-2 leading-relaxed">One course note, one cheat sheet, and {content.resources.length} linked external references.</p>
                </div>
                <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Topic signals</p>
                  <p className="mt-2 leading-relaxed">{mastery.length > 0 ? `${mastery.length} tracked topic signals visible below.` : "Start one quiz to unlock topic-level mastery signals."}</p>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {[
          {
            id: "quizzes",
            title: "Quiz practice",
            count: quizModeCount,
            detail: "Mastery-focused practice with study and timed variants."
          },
          {
            id: "exams",
            title: "Exam simulations",
            count: examModeCount,
            detail: "Higher-pressure sets intended to mirror test conditions."
          },
          {
            id: "homework",
            title: "Homework lane",
            count: homeworkModeCount,
            detail: "Assignment-style work with review and flagged follow-up."
          }
        ].map((lane) => {
          const active = tab === lane.id;
          return (
            <button
              key={lane.id}
              type="button"
              onClick={() => setTab(lane.id)}
              className={`rounded-[1.35rem] border p-5 text-left transition-all duration-200 ease-out-expo ${
                active
                  ? "border-brand-2/45 bg-brand-2/10 shadow-card-hover"
                  : "border-borderc bg-surface hover:border-border-accent hover:shadow-card-hover"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Study lane</p>
                  <p className="mt-2 text-xl font-semibold text-text">{lane.title}</p>
                </div>
                <span className="font-mono text-3xl font-bold text-text">{lane.count}</span>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-text-secondary">{lane.detail}</p>
            </button>
          );
        })}
      </section>

      <div className="space-y-4">
        <div className="space-y-2">
          <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Mode switcher</p>
          <Tabs tabs={tabDefs} value={tab} onChange={setTab} />
        </div>

        <Card>
          <CardBody className="flex flex-col gap-3 p-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xl font-semibold text-text">{activeTabMeta.title}</p>
              <p className="mt-1 max-w-3xl text-sm text-text-secondary">{activeTabMeta.description}</p>
            </div>
            {(tab === "quizzes" || tab === "exams" || tab === "homework") && (
              <div className="grid gap-3 sm:grid-cols-[1fr_auto_auto] lg:min-w-[38rem]">
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
            )}
          </CardBody>
        </Card>
      </div>

      {tab === "quizzes" || tab === "exams" || tab === "homework" ? (
        <section className="space-y-4" id={`panel-${tab}`}>
          <div className="grid gap-4">
            {filteredSets.length === 0 ? (
              <Card>
                <CardBody className="p-6 text-sm text-muted">
                  No sets match this filter. Try resetting search or switching lanes.
                </CardBody>
              </Card>
            ) : null}
            {filteredSets.map((set, idx) => {
              const setMode = resolveQuizSetMode(set);
              const targetCount = resolveQuestionCountTarget(set);
              const questionCount = set.questions.length || targetCount || 0;
              const latest = latestAttemptForQuiz(attempts, set.id);
              const best = bestScoreForQuiz(attempts, set.id);
              return (
                <Card key={set.id} className={`overflow-hidden transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-${(idx % 6) + 1}`}>
                  <div className={`h-1.5 bg-gradient-to-r ${visual.surfaceClass}`} />
                  <CardHeader className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-start">
                    <div>
                      <div className="flex flex-wrap gap-2">
                        <Badge tone={setMode === "homework" ? "success" : setMode === "exam" ? "warn" : "brand"}>
                          {modeLabel(setMode)}
                        </Badge>
                        <Badge>{set.difficulty}</Badge>
                        <Badge tone="brand">{questionCount} questions</Badge>
                      </div>
                      <h3 className="mt-3 text-heading font-semibold text-text">{set.title}</h3>
                      <p className="mt-1 text-sm text-text-secondary">{set.description}</p>
                    </div>
                    <div className="grid min-w-[12rem] gap-2 sm:text-right">
                      <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Best score</p>
                        <p className="mt-2 font-mono text-2xl font-bold text-text">{best}%</p>
                      </div>
                      <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-3">
                        <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Last score</p>
                        <p className="mt-2 font-mono text-sm font-bold text-text">{latest ? `${latest.score}%` : "Not attempted"}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4 p-5 sm:p-6">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1 rounded-full border border-borderc px-2 py-1">
                        <Clock3 className="h-3 w-3" />
                        ~{set.estMinutes} min
                      </span>
                      {targetCount ? <span className="rounded-full border border-borderc px-2 py-1">Target {targetCount}</span> : null}
                      {set.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-borderc px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm text-text-secondary">
                      {setMode === "homework"
                        ? "Homework sets are built for longer-form work, review, and flagged follow-up."
                        : setMode === "exam"
                          ? "Exam simulations raise the pressure and are better suited for timing practice."
                          : "Quiz practice is best for frequent repetition, topic review, and momentum building."}
                    </div>

                    <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                      {setMode === "homework" ? (
                        <>
                          <Button asChild className="w-full sm:w-auto">
                            <Link href={withPrefix(routePrefix, `/homework/${set.id}`)}>Start Homework</Link>
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
                              Study Mode
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
        </section>
      ) : null}

      {tab === "notes" ? (
        <section id="panel-notes">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
                  <BookOpenText className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-heading font-semibold">Study Notes</h2>
                  <p className="mt-1 text-sm text-text-secondary">Course walkthroughs, concept framing, and structured written guidance.</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Markdown content={content.notes} />
              {routePrefix === "/app" ? (
                <Button asChild variant="ghost" className="mt-4">
                  <Link href={withPrefix(routePrefix, `/notes/${course.id}`)}>Open dedicated notes viewer</Link>
                </Button>
              ) : null}
            </CardBody>
          </Card>
        </section>
      ) : null}

      {tab === "cheats" ? (
        <section id="panel-cheats">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
                  <Sparkles className="h-4 w-4" />
                </span>
                <div>
                  <h2 className="text-heading font-semibold">Cheat Sheets</h2>
                  <p className="mt-1 text-sm text-text-secondary">Fast-reference formulas, patterns, and condensed reminders for this course.</p>
                </div>
              </div>
            </CardHeader>
            <CardBody>
              <Markdown content={content.cheatSheet} />
            </CardBody>
          </Card>
        </section>
      ) : null}

      {tab === "resources" ? (
        <section id="panel-resources" className="grid gap-3 md:grid-cols-2">
          {content.resources.map((item, idx) => (
            <Card key={item.href} className={`transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-${(idx % 6) + 1}`}>
              <CardBody className="space-y-3 p-5">
                <div className="flex items-center gap-3">
                  <span className="inline-flex h-11 w-11 items-center justify-center rounded-2xl border border-brand-2/35 bg-brand-2/10 text-brand-2">
                    <FileText className="h-4 w-4" />
                  </span>
                  <div>
                    <Badge tone="brand">{item.type}</Badge>
                    <h3 className="mt-2 text-lg font-semibold text-text">{item.label}</h3>
                  </div>
                </div>
                <p className="text-sm text-text-secondary">External resource curated for this course lane.</p>
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

      <section className="grid gap-4 xl:grid-cols-[0.95fr_1.05fr]">
        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold">Topic mastery</h2>
          </CardHeader>
          <CardBody className="space-y-3">
            {mastery.length === 0 ? (
              <p className="rounded-lg border border-dashed border-borderc bg-soft p-3 text-xs text-muted">
                No topic data yet. Start a quiz to unlock mastery bars.
              </p>
            ) : (
              mastery.map((item) => (
                <div key={item.topic}>
                  <div className="mb-1 flex items-center justify-between text-xs text-muted">
                    <span>{item.topic}</span>
                    <span className="font-mono text-text">{item.score}%</span>
                  </div>
                  <ProgressBar value={item.score} />
                </div>
              ))
            )}
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="text-heading font-semibold">Preview the lane</h2>
          </CardHeader>
          <CardBody className="grid gap-3 md:grid-cols-3">
            <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Quiz lane</p>
              <p className="mt-2 text-sm text-text-secondary">Frequent practice, low friction, best for topic repetition and cadence.</p>
            </div>
            <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Exam lane</p>
              <p className="mt-2 text-sm text-text-secondary">Pressure-tested reps with stronger timing focus and fewer recovery cues.</p>
            </div>
            <div className="rounded-[1rem] border border-borderc bg-soft px-4 py-4">
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-faint">Homework lane</p>
              <p className="mt-2 text-sm text-text-secondary">Longer-form work with review patterns that feel closer to an assignment desk.</p>
            </div>
          </CardBody>
        </Card>
      </section>
    </div>
  );
}
