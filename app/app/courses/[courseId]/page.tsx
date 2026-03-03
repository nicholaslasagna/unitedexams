"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useParams } from "next/navigation";
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
import {
  attemptsForCourse,
  bestScoreForQuiz,
  courseProgress,
  latestAttemptForQuiz,
  topicMasteryForCourse
} from "@/features/progress/metrics";

const tabDefs = [
  { id: "quiz", label: "Quiz Sets" },
  { id: "notes", label: "Study Notes" },
  { id: "cheats", label: "Cheat Sheets" },
  { id: "resources", label: "Resources" }
];

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const course = getCourse(courseId);
  const content = getCourseContent(courseId);

  const { attempts } = useAppData();
  const [tab, setTab] = useState("quiz");
  const [query, setQuery] = useState("");
  const [difficulty, setDifficulty] = useState("all");

  const sets = useMemo(() => (course ? getCourseQuizSets(course.id) : []), [course]);
  const progress = course ? courseProgress(attempts, course.id) : 0;
  const attemptCount = course ? attemptsForCourse(attempts, course.id).length : 0;
  const mastery = course ? topicMasteryForCourse(attempts, course.id).slice(0, 8) : [];

  const filteredSets = useMemo(() => {
    return sets.filter((set) => {
      const q = query.toLowerCase();
      const searchMatch =
        q.length === 0 ||
        `${set.title} ${set.description} ${set.tags.join(" ")}`.toLowerCase().includes(q);
      const diffMatch = difficulty === "all" || set.difficulty === difficulty;
      return searchMatch && diffMatch;
    });
  }, [sets, query, difficulty]);

  if (!course || !content) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <p className="font-display text-2xl font-semibold text-text">Course not found</p>
          <p className="text-sm text-muted">This course page is unavailable.</p>
          <Button asChild>
            <Link href="/app/courses">Back to courses</Link>
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
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{course.name}</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">{course.description}</p>

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
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Your progress snapshot</p>
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

      {tab === "quiz" ? (
        <section className="space-y-4" id="panel-quiz">
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
              <Button variant="ghost" onClick={() => { setQuery(""); setDifficulty("all"); }}>
                Reset
              </Button>
            </CardBody>
          </Card>

          <div className="grid gap-4">
            {filteredSets.map((set) => {
              const latest = latestAttemptForQuiz(attempts, set.id);
              const best = bestScoreForQuiz(attempts, set.id);
              return (
                <Card key={set.id} className="overflow-hidden">
                  <CardHeader className="flex flex-wrap items-center justify-between gap-3">
                    <div>
                      <h3 className="font-display text-2xl font-semibold text-text">{set.title}</h3>
                      <p className="mt-1 text-sm text-muted">{set.description}</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Badge>{set.difficulty}</Badge>
                      <Badge tone="brand">{set.questions.length} questions</Badge>
                      <Badge tone="success">Best {best}%</Badge>
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
                      <span className="text-muted">Last score</span>
                      <span className="font-mono text-text">{latest ? `${latest.score}%` : "Not attempted"}</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <Button asChild>
                        <Link href={`/app/quiz/${set.id}`}>Start Quiz</Link>
                      </Button>
                      <Button asChild variant="secondary">
                        <Link href={`/app/quiz/${set.id}?mode=study`}>Study Mode</Link>
                      </Button>
                      <Button asChild variant="ghost">
                        <Link href={`/app/quiz/${set.id}?mode=timed`}>Timed Mode</Link>
                      </Button>
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
              <h2 className="font-display text-2xl font-semibold">Study Notes</h2>
            </CardHeader>
            <CardBody>
              <Markdown content={content.notes} />
              <Button asChild variant="ghost" className="mt-4">
                <Link href={`/app/notes/${course.id}`}>Open dedicated notes viewer</Link>
              </Button>
            </CardBody>
          </Card>
        </section>
      ) : null}

      {tab === "cheats" ? (
        <section id="panel-cheats">
          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl font-semibold">Cheat Sheets</h2>
            </CardHeader>
            <CardBody>
              <Markdown content={content.cheatSheet} />
            </CardBody>
          </Card>
        </section>
      ) : null}

      {tab === "resources" ? (
        <section id="panel-resources" className="grid gap-3 md:grid-cols-2">
          {content.resources.map((item) => (
            <Card key={item.href}>
              <CardBody className="space-y-2">
                <Badge tone="brand">{item.type}</Badge>
                <h3 className="text-lg font-semibold text-text">{item.label}</h3>
                <p className="inline-flex items-center gap-2 text-sm text-muted">
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
