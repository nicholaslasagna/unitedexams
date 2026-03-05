"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Clock3, FileText, Search } from "lucide-react";
import { getCourse, getCourseContent, getCourseQuizSets } from "@/data/seed";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Tabs } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ProgressRing, ProgressBar } from "@/components/ui/progress";
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

const tabDefs = [
  { id: "quizzes", label: "Quizzes" },
  { id: "exams", label: "Exams" },
  { id: "homework", label: "Homework" },
  { id: "notes", label: "Study Notes" },
  { id: "cheats", label: "Cheat Sheets" },
  { id: "resources", label: "Resources" }
];

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
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
    setSets(getCourseQuizSets(course.id));
    fetchPublishedSetsByCourse(course.id)
      .then((remoteSets) => {
        if (!active) return;
        if (remoteSets.length > 0) {
          setSets(remoteSets);
        }
      })
      .catch(() => {
        if (!active) return;
        setSets(getCourseQuizSets(course.id));
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
    <div className="space-y-6">
      <section className="grid gap-4 xl:grid-cols-[1.45fr_1fr]">
        <Card className="mesh-hero">
          <CardBody className="space-y-4 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">{course.code}</p>
            <h1 className="text-display-lg font-semibold tracking-tight">{course.name}</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted text-text-secondary">{course.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge tone={course.difficulty === "Advanced" ? "warn" : "default"}>{course.difficulty}</Badge>
              {course.tags.map((tag) => (
                <Badge key={tag}>{tag}</Badge>
              ))}
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardBody className="space-y-4 p-6">
            <p className="text-xs uppercase tracking-[0.14em] text-muted text-text-secondary">Your progress snapshot</p>
            <div className="flex items-center justify-between gap-3">
              <ProgressRing value={progress} size={100} stroke={10} label="Mastery" />
              <div className="text-right">
                <p className="font-mono text-3xl font-bold text-text">{attemptCount}</p>
                <p className="text-xs text-muted">Attempts</p>
              </div>
            </div>

            <div className="space-y-2">
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
            </div>
          </CardBody>
        </Card>
      </section>

      <Tabs tabs={tabDefs} value={tab} onChange={setTab} />

      {tab === "quizzes" || tab === "exams" || tab === "homework" ? (
        <section className="space-y-4" id={`panel-${tab}`}>
          <Card>
            <CardBody className="grid gap-3 p-4 md:grid-cols-[1fr_auto_auto] md:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted" />
                <Input
                  className="pl-9"
                  placeholder="Search quiz sets, tags, or concepts"
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
                onClick={() => {
                  setQuery("");
                  setDifficulty("all");
                }}
              >
                Reset
              </Button>
            </CardBody>
          </Card>

          <div className="grid gap-4">
            {filteredSets.length === 0 ? (
              <Card>
                <CardBody className="p-6 text-sm text-muted">
                  No sets match this filter. Try resetting search or switching tabs.
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
                  <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="text-heading font-semibold text-text">{set.title}</h3>
                      <p className="mt-1 text-sm text-muted text-text-secondary">{set.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge tone={setMode === "homework" ? "success" : setMode === "exam" ? "warn" : "brand"}>
                        {modeLabel(setMode)}
                      </Badge>
                      <Badge>{set.difficulty}</Badge>
                      <Badge tone="brand"><span className="font-mono">{questionCount}</span> questions</Badge>
                      {targetCount ? <Badge tone="warn">Target <span className="font-mono">{targetCount}</span></Badge> : null}
                      <Badge tone="success">Best <span className="font-mono">{best}%</span></Badge>
                    </div>
                  </CardHeader>
                  <CardBody className="space-y-4">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                      <span className="inline-flex items-center gap-1 rounded-full border border-borderc px-2 py-1">
                        <Clock3 className="h-3 w-3" />
                        ~{set.estMinutes} min
                      </span>
                      {set.tags.map((tag) => (
                        <span key={tag} className="rounded-full border border-borderc px-2 py-1">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2 text-sm">
                      <span className="text-muted text-text-secondary">Last score</span>
                      <span className="font-mono text-text">{latest ? `${latest.score}%` : "Not attempted"}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {setMode === "homework" ? (
                        <>
                          <Button asChild>
                            <Link href={withPrefix(routePrefix, `/homework/${set.id}`)}>Start Homework</Link>
                          </Button>
                          <Button variant="secondary" asChild>
                            <Link href={withPrefix(routePrefix, `/homework/${set.id}?review=1`)}>
                              Review flagged
                            </Link>
                          </Button>
                        </>
                      ) : setMode === "exam" ? (
                        <>
                          <Button asChild>
                            <Link href={withPrefix(routePrefix, `/quiz/${set.id}?mode=exam`)}>
                              Start Exam Simulation
                            </Link>
                          </Button>
                          <Button variant="secondary" asChild>
                            <Link href={withPrefix(routePrefix, `/quiz/${set.id}`)}>Practice this bank</Link>
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button asChild>
                            <Link href={withPrefix(routePrefix, `/quiz/${set.id}`)}>Start Quiz</Link>
                          </Button>
                          <Button variant="secondary" asChild>
                            <Link href={withPrefix(routePrefix, `/quiz/${set.id}?mode=study`)}>
                              Study Mode
                            </Link>
                          </Button>
                          <Button variant="ghost" asChild>
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
              <h2 className="text-heading font-semibold">Study Notes</h2>
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
              <h2 className="text-heading font-semibold">Cheat Sheets</h2>
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
              <CardBody className="space-y-2">
                <Badge tone="brand">{item.type}</Badge>
                <h3 className="text-lg font-semibold text-text">{item.label}</h3>
                <p className="inline-flex items-center gap-2 text-sm text-muted text-text-secondary">
                  <FileText className="h-4 w-4" />
                  External resource
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
    </div>
  );
}
