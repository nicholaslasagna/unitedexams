"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, BookOpen, Clock3, Timer } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { getCourse } from "@/data/seed";
import { SOURCE_QUESTIONS } from "@/data/seed/db-exam1/source-questions";
import { useAppData } from "@/lib/app-data-context";
import { useAccess } from "@/lib/hooks/use-access";
import { cn } from "@/lib/utils";
import { AlgebraStudio } from "./algebra-studio";
import { CheatSheet } from "./cheat-sheet";
import { ConceptMap } from "./concept-map";
import { DivisionLab } from "./division-lab";
import { ExamDashboard, type ExamView } from "./exam-dashboard";
import { KeyLab } from "./key-lab";
import { DB_EXAM1_COURSE_ID } from "./mastery";
import { buildCramSet, buildMockExam, buildPracticeSet, MOCK_EXAM_LENGTH } from "./practice";
import { PracticeSession } from "./practice-session";
import type { LabQuestion } from "./question-model";
import { SourceMaterials } from "./source-materials";
import { TableLab } from "./table-lab";
import type { TopicId } from "./topics";

/**
 * The Exam 1 experience.
 *
 * One route with internal views rather than eight routes, because the views
 * share state that matters — readiness, the current topic, a run in progress —
 * and a page reload between the dashboard and the lab would throw away the
 * thing that makes the dashboard worth looking at. The active view is mirrored
 * into the URL so a view is still linkable and the back button still works.
 */

const VIEW_TABS: { id: ExamView; label: string }[] = [
  { id: "dashboard", label: "Overview" },
  { id: "path", label: "Learning path" },
  { id: "table-lab", label: "Table Lab" },
  { id: "division-lab", label: "Division" },
  { id: "key-lab", label: "Keys" },
  { id: "algebra", label: "Algebra" },
  { id: "study-guide", label: "Study guide" },
  { id: "sources", label: "Sources" },
  { id: "mock-exam", label: "Mock exam" },
  { id: "cram", label: "Final review" },
  { id: "cheat-sheet", label: "Notation" }
];

const VALID_VIEWS = new Set(VIEW_TABS.map((tab) => tab.id));

interface RunConfig {
  questions: LabQuestion[];
  mode: Parameters<typeof PracticeSession>[0]["mode"];
  title: string;
  subtitle?: string;
  timed?: boolean;
  timeLimitMinutes?: number;
}

export function ExamOnePage({ routePrefix }: { routePrefix: string }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { attempts } = useAppData();
  const access = useAccess();
  const course = getCourse(DB_EXAM1_COURSE_ID);

  const viewParam = searchParams.get("view");
  const view: ExamView =
    viewParam && VALID_VIEWS.has(viewParam as ExamView) ? (viewParam as ExamView) : "dashboard";

  const [run, setRun] = useState<RunConfig | null>(null);
  const seedRef = useRef(0);
  const nextSeed = useCallback(() => {
    if (seedRef.current === 0) {
      seedRef.current = Math.floor(Math.random() * 1_000_000) + 1;
    } else {
      seedRef.current += 1;
    }
    return seedRef.current;
  }, []);

  useEffect(() => {
    if (run) return;
    document.querySelector("h1")?.focus({ preventScroll: true });
  }, [view, run]);

  const navigate = useCallback(
    (next: ExamView) => {
      setRun(null);
      const params = new URLSearchParams(searchParams.toString());
      if (next === "dashboard") params.delete("view");
      else params.set("view", next);
      const query = params.toString();
      router.replace(query ? `?${query}` : "?", { scroll: false });
    },
    [router, searchParams]
  );

  // Starting a run scrolls to the top: the session replaces the page content,
  // and staying scrolled halfway down it is disorienting.
  useEffect(() => {
    if (run) window.scrollTo({ top: 0, behavior: "smooth" });
  }, [run]);

  const startPractice = useCallback(
    ({ topic, label }: { topic?: TopicId; label: string }) => {
      const questions = buildPracticeSet({
        attempts,
        topic,
        count: 8,
        seed: nextSeed() + attempts.length,
        difficulty: "core"
      });
      setRun({
        questions,
        mode: topic ? "learn" : "drill",
        title: topic ? label : "Weak areas",
        subtitle: topic
          ? "Course material first, then generated variants."
          : "Built from the misconceptions your answers keep showing."
      });
    },
    [attempts, nextSeed]
  );

  const studyGuideQuestions = useMemo(
    () =>
      SOURCE_QUESTIONS.filter(
        (question) => question.source === "professor" || question.source === "study-guide"
      ),
    []
  );

  if (!course) return null;

  const backHref = `${routePrefix}/courses/${DB_EXAM1_COURSE_ID}`;

  return (
    <div className="mx-auto w-full max-w-5xl space-y-5 px-4 py-6 sm:px-6 lg:px-8">
      <header className="space-y-3">
        <Link
          href={backHref}
          className="inline-flex items-center gap-1.5 text-body-sm text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden />
          {course.code} {course.name}
        </Link>

        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 tabIndex={-1} className="font-display text-display-md text-text">Exam 1 Mastery</h1>
            <p className="mt-1 text-body text-text-secondary">
              The relational model, relational algebra, joins and division — built from this
              course&rsquo;s own lectures and Homework&nbsp;#1.
            </p>
          </div>
          {access.isGuest ? (
            <span suppressHydrationWarning>
              <Badge tone="warn" size="sm">
                Progress saves locally until you sign in
              </Badge>
            </span>
          ) : null}
        </div>
      </header>

      {!run ? (
        <nav
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          aria-label="Exam 1 sections"
        >
          {VIEW_TABS.map((tab) => (
            <button
              key={tab.id}
              type="button"
              aria-current={tab.id === view ? "page" : undefined}
              onClick={() => navigate(tab.id)}
              className={cn(
                "shrink-0 rounded-xl px-4 py-2.5 text-body-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                tab.id === view
                  ? "bg-brand-gradient text-brand-fg shadow-soft"
                  : "border border-borderc bg-soft text-muted hover:text-text"
              )}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      ) : null}

      {run ? (
        <PracticeSession
          questions={run.questions}
          mode={run.mode}
          title={run.title}
          subtitle={run.subtitle}
          timed={run.timed}
          timeLimitMinutes={run.timeLimitMinutes}
          onExit={() => setRun(null)}
          onPracticeMissed={(missed) =>
            setRun({
              questions: missed,
              mode: "drill",
              title: "Missed questions",
              subtitle: "The ones from the run you just finished, with feedback this time."
            })
          }
        />
      ) : (
        <>
          {view === "dashboard" ? (
            <ExamDashboard
              attempts={attempts}
              onStartPractice={startPractice}
              onNavigate={navigate}
            />
          ) : null}

          {view === "path" ? (
            <ConceptMap attempts={attempts} onStartPractice={startPractice} />
          ) : null}

          {view === "table-lab" ? <TableLab /> : null}

          {view === "division-lab" ? <DivisionLab /> : null}

          {view === "key-lab" ? (
            <KeyLab
              onDrill={(topic) =>
                startPractice({
                  topic,
                  label: topic === "keys" ? "Keys" : "Integrity"
                })
              }
            />
          ) : null}

          {view === "algebra" ? (
            <AlgebraStudio onStartPractice={startPractice} />
          ) : null}

          {view === "cheat-sheet" ? <CheatSheet /> : null}

          {view === "sources" ? (
            <SourceMaterials
              onStartPractice={startPractice}
              onOpenQuestions={(questionIds, title) => {
                const questions = SOURCE_QUESTIONS.filter((question) =>
                  questionIds.includes(question.id)
                );
                setRun({
                  questions,
                  mode: "study-guide",
                  title,
                  subtitle: "Course material, in the order the assignment set it."
                });
              }}
            />
          ) : null}

          {view === "study-guide" ? (
            <Card>
              <CardHeader>
                <h2 className="text-heading font-semibold text-text">Study guide</h2>
                <p className="mt-0.5 text-body-sm text-text-secondary">
                  Every question the course itself set — Homework&nbsp;#1 in full, plus the
                  concepts Lectures&nbsp;2–5 define. {studyGuideQuestions.length} questions.
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="rounded-xl border border-border-accent bg-accent-wash px-4 py-3">
                  <p className="text-body-sm leading-relaxed text-text">
                    These are the professor&rsquo;s own questions, not variants of them. Work
                    through the set once, then use the generated variants elsewhere in this
                    section so you are practising the method rather than recalling the answers.
                  </p>
                </div>
                <Button
                  onClick={() =>
                    setRun({
                      questions: studyGuideQuestions,
                      mode: "study-guide",
                      title: "Study guide",
                      subtitle: "Homework #1 and the Lecture 2–5 material, in order."
                    })
                  }
                >
                  <BookOpen className="h-4 w-4" aria-hidden />
                  Work through all {studyGuideQuestions.length}
                </Button>

                <ul className="divide-y divide-borderc rounded-xl border border-borderc">
                  {studyGuideQuestions.map((question) => (
                    <li
                      key={question.id}
                      className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                    >
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-body-sm text-text">{question.prompt}</p>
                        {question.sourceNote ? (
                          <p className="text-caption text-faint">{question.sourceNote}</p>
                        ) : null}
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          setRun({
                            questions: [question],
                            mode: "study-guide",
                            title: question.sourceNote ?? "Study guide",
                            subtitle: "One question from the course material."
                          })
                        }
                      >
                        Open
                      </Button>
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}

          {view === "mock-exam" ? (
            <Card>
              <CardHeader>
                <h2 className="text-heading font-semibold text-text">Mock exam</h2>
                <p className="mt-0.5 text-body-sm text-text-secondary">
                  {MOCK_EXAM_LENGTH} questions across every topic Exam&nbsp;1 covers, weighted the
                  way the course weights them.
                </p>
              </CardHeader>
              <CardBody className="space-y-4">
                <div className="rounded-xl border border-borderc bg-soft px-4 py-3">
                  <p className="text-body-sm leading-relaxed text-text-secondary">
                    Course questions first, then generated variants — so a second sitting is never
                    the same paper. You get a score, a topic breakdown and the misconceptions to
                    fix at the end.
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() =>
                      setRun({
                        questions: buildMockExam(nextSeed(), attempts),
                        mode: "mock-exam",
                        title: "Mock exam",
                        subtitle: "Untimed. Work at your own pace."
                      })
                    }
                  >
                    <BookOpen className="h-4 w-4" aria-hidden />
                    Untimed practice exam
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={() =>
                      setRun({
                        questions: buildMockExam(nextSeed(), attempts),
                        mode: "mock-exam",
                        title: "Mock exam — timed",
                        subtitle: "50 minutes, the way the real thing runs.",
                        timed: true,
                        timeLimitMinutes: 50
                      })
                    }
                  >
                    <Timer className="h-4 w-4" aria-hidden />
                    Timed exam · 50 min
                  </Button>
                </div>
              </CardBody>
            </Card>
          ) : null}

          {view === "cram" ? (
            <div className="space-y-5">
              <Card>
                <CardHeader>
                  <h2 className="text-heading font-semibold text-text">Final review</h2>
                  <p className="mt-0.5 text-body-sm text-text-secondary">
                    High-yield only: what you keep getting wrong, then what the exam weights most.
                  </p>
                </CardHeader>
                <CardBody className="space-y-4">
                  <div className="rounded-xl border border-warn/30 bg-warn/10 px-4 py-3">
                    <p className="flex items-start gap-2 text-body-sm leading-relaxed text-text">
                      <Clock3 className="mt-0.5 h-4 w-4 shrink-0 text-warn" aria-hidden />
                      <span>
                        This is a last pass, not a substitute for the earlier work. Twelve
                        questions, chosen from your own mistake history.
                      </span>
                    </p>
                  </div>
                  <Button
                    onClick={() =>
                      setRun({
                        questions: buildCramSet(attempts, nextSeed(), 12),
                        mode: "cram",
                        title: "Final review",
                        subtitle: "Your weak spots and the heaviest topics."
                      })
                    }
                  >
                    Start final review
                  </Button>
                </CardBody>
              </Card>

              <CheatSheet />
            </div>
          ) : null}
        </>
      )}
    </div>
  );
}
