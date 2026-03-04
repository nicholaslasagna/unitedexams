"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  ChartColumnBig,
  CircleCheckBig,
  Clock3,
  RotateCcw,
  Settings2
} from "lucide-react";
import { getCourse, getQuizSet } from "@/data/seed";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DonutChart } from "@/components/charts/donut-chart";
import { BarChart } from "@/components/charts/bar-chart";
import { Modal } from "@/components/ui/modal";
import { QuestionNavigator } from "@/features/quiz/question-navigator";
import { QuestionCard } from "@/features/quiz/question-card";
import { StatsPanel } from "@/features/quiz/stats-panel";
import { QuizSettingsModal } from "@/features/quiz/quiz-settings-modal";
import { defaultQuizSettings } from "@/features/quiz/defaults";
import { countMissed, gradeQuestion, summarizeAttempt } from "@/features/quiz/engine";
import { fireConfetti } from "@/features/quiz/confetti";
import { bestScoreForQuiz, latestAttemptForQuiz } from "@/features/progress/metrics";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { minutesSeconds, percentile, shuffle } from "@/lib/utils";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Attempt, QuizSet, QuizSettings } from "@/lib/types";

type Stage = "overview" | "quiz" | "results" | "review";
type AttemptMode = "test" | "study" | "timed";

const keyMap = ["a", "b", "c", "d", "e", "f"];

interface QuizSetRow {
  id: string;
  course_id: string;
  title: string;
  description: string;
  difficulty: "intro" | "medium" | "hard";
  est_minutes: number;
  tags: string[];
  is_published: boolean;
}

interface QuestionRow {
  id: string;
  quiz_set_id: string;
  type: "single" | "multi" | "free";
  prompt_md: string;
  options: string[] | null;
  correct: number[] | null;
  explanation_md: string;
  walkthrough_steps: string[] | null;
  references_data: string[] | null;
}

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

function mapDifficulty(value: QuizSetRow["difficulty"]): QuizSet["difficulty"] {
  if (value === "intro") return "Beginner";
  if (value === "medium") return "Intermediate";
  return "Advanced";
}

function toQuizSet(row: QuizSetRow, questions: QuestionRow[]): QuizSet {
  return {
    id: row.id,
    courseId: row.course_id,
    title: row.title,
    description: row.description,
    difficulty: mapDifficulty(row.difficulty),
    estMinutes: row.est_minutes,
    tags: row.tags ?? [],
    timerDefaultMinutes: row.est_minutes,
    questions: questions.map((question) => ({
      id: question.id,
      type: question.type,
      prompt: question.prompt_md,
      options: question.options ?? undefined,
      correct: question.correct ?? undefined,
      explanation: question.explanation_md,
      walkthroughSteps: question.walkthrough_steps ?? undefined,
      references: question.references_data ?? undefined,
      tags: row.tags ?? []
    }))
  };
}

async function fetchPublishedQuizSet(quizId: string): Promise<QuizSet | null> {
  const client = getSupabaseBrowserClient();
  if (!client) return null;

  const { data: quizRow, error: quizError } = await client
    .from("quiz_sets")
    .select("id, course_id, title, description, difficulty, est_minutes, tags, is_published")
    .eq("id", quizId)
    .eq("is_published", true)
    .maybeSingle();

  if (quizError || !quizRow) return null;

  const { data: questionRows, error: questionsError } = await client
    .from("questions")
    .select("id, quiz_set_id, type, prompt_md, options, correct, explanation_md, walkthrough_steps, references_data")
    .eq("quiz_set_id", quizId)
    .order("created_at", { ascending: true });

  if (questionsError || !questionRows || questionRows.length === 0) return null;

  return toQuizSet(quizRow as QuizSetRow, questionRows as QuestionRow[]);
}

export function QuizExperiencePageContent({
  quizId,
  routePrefix
}: {
  quizId: string;
  routePrefix: string;
}) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fallbackQuiz = useMemo(() => getQuizSet(quizId), [quizId]);

  const { attempts, saveAttempt, preferences, isAuthenticated } = useAppData();
  const { push } = useToast();

  const [quiz, setQuiz] = useState<QuizSet | undefined>(fallbackQuiz);
  const [quizLoading, setQuizLoading] = useState(!fallbackQuiz);
  const [stage, setStage] = useState<Stage>("overview");
  const [attemptMode, setAttemptMode] = useState<AttemptMode>("test");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<QuizSettings>(() =>
    defaultQuizSettings(fallbackQuiz?.timerDefaultMinutes ?? 20)
  );

  const [order, setOrder] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, number[]>>({});
  const [responseByQuestion, setResponseByQuestion] = useState<Record<string, string>>({});
  const [selfMarkedByQuestion, setSelfMarkedByQuestion] = useState<Record<string, boolean | undefined>>({});
  const [submittedByQuestion, setSubmittedByQuestion] = useState<Record<string, boolean>>({});
  const [correctByQuestion, setCorrectByQuestion] = useState<Record<string, boolean>>({});
  const [showExplanation, setShowExplanation] = useState<Record<string, boolean>>({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [timeSpent, setTimeSpent] = useState(0);
  const [result, setResult] = useState<Attempt | null>(null);
  const [reviewIndex, setReviewIndex] = useState(0);
  const [guestSaveModalOpen, setGuestSaveModalOpen] = useState(false);
  const finalizingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setQuizLoading(true);

    fetchPublishedQuizSet(quizId)
      .then((remoteQuiz) => {
        if (!active) return;
        setQuiz(remoteQuiz ?? fallbackQuiz);
      })
      .catch(() => {
        if (!active) return;
        setQuiz(fallbackQuiz);
      })
      .finally(() => {
        if (!active) return;
        setQuizLoading(false);
      });

    return () => {
      active = false;
    };
  }, [fallbackQuiz, quizId]);

  useEffect(() => {
    if (!quiz) return;
    setSettings((prev) => {
      if (prev.timerMinutes === quiz.timerDefaultMinutes) return prev;
      return {
        ...prev,
        timerMinutes: quiz.timerDefaultMinutes
      };
    });
  }, [quiz]);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (!quiz) return;

    if (mode === "study") {
      setAttemptMode("study");
      setSettings({
        timed: false,
        timerMinutes: quiz.timerDefaultMinutes,
        randomizeQuestions: false,
        explanationMode: "afterEach",
        questionCount: "all"
      });
    }

    if (mode === "timed") {
      setAttemptMode("timed");
      setSettings({
        timed: true,
        timerMinutes: quiz.timerDefaultMinutes,
        randomizeQuestions: true,
        explanationMode: "end",
        questionCount: "all"
      });
    }
  }, [searchParams, quiz]);

  useEffect(() => {
    if (stage !== "quiz" || !settings.timed) return;
    if (timeLeft <= 0) {
      finalizeAttempt();
      return;
    }

    const timer = window.setInterval(() => {
      setTimeLeft((prev) => prev - 1);
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage, settings.timed, timeLeft]);

  useEffect(() => {
    if (stage !== "quiz" || settings.timed) return;
    const timer = window.setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);

    return () => window.clearInterval(timer);
  }, [stage, settings.timed]);

  const course = quiz ? getCourse(quiz.courseId) : null;

  const latestAttempt = useMemo(() => {
    if (!quiz) return null;
    return latestAttemptForQuiz(attempts, quiz.id);
  }, [attempts, quiz]);

  const bestScore = useMemo(() => {
    if (!quiz) return 0;
    return bestScoreForQuiz(attempts, quiz.id);
  }, [attempts, quiz]);

  const questionsById = useMemo(() => {
    if (!quiz) return new Map();
    return new Map(quiz.questions.map((q) => [q.id, q]));
  }, [quiz]);

  const currentQuestionId = order[currentIndex];
  const currentQuestion = currentQuestionId ? questionsById.get(currentQuestionId) : undefined;

  const answeredSet = useMemo(() => {
    const set = new Set<string>();
    Object.entries(selectedByQuestion).forEach(([id, selected]) => {
      if ((selected?.length ?? 0) > 0) set.add(id);
    });
    Object.entries(responseByQuestion).forEach(([id, response]) => {
      if (response.trim().length > 0) set.add(id);
    });
    return set;
  }, [selectedByQuestion, responseByQuestion]);

  const scorePreview = useMemo(() => {
    if (order.length === 0) return 0;
    const submittedIds = order.filter((id) => submittedByQuestion[id]);
    if (submittedIds.length === 0) return 0;
    const correct = submittedIds.filter((id) => {
      const question = questionsById.get(id);
      if (!question) return false;
      if (question.type === "free") {
        return Boolean(selfMarkedByQuestion[id]);
      }
      return Boolean(correctByQuestion[id]);
    }).length;
    return Math.round((correct / submittedIds.length) * 100);
  }, [order, submittedByQuestion, correctByQuestion, questionsById, selfMarkedByQuestion]);

  const missedQuestionIds = useMemo(() => {
    if (!result) return [];
    return result.perQuestionResults.filter((entry) => !entry.isCorrect).map((entry) => entry.questionId);
  }, [result]);

  const reviewQuestion = missedQuestionIds[reviewIndex]
    ? questionsById.get(missedQuestionIds[reviewIndex])
    : undefined;

  const startQuiz = (override?: Partial<QuizSettings>, mode: AttemptMode = attemptMode) => {
    if (!quiz) return;
    const effective = { ...settings, ...(override ?? {}) };
    const ids = quiz.questions.map((q) => q.id);
    const orderedIds = effective.randomizeQuestions ? shuffle(ids) : ids;
    const maxQuestions = ids.length;
    const requestedCount =
      effective.questionCount === "all"
        ? maxQuestions
        : Math.min(maxQuestions, Math.max(1, Number(effective.questionCount || maxQuestions)));
    const nextOrder = orderedIds.slice(0, requestedCount);

    setOrder(nextOrder);
    setCurrentIndex(0);
    setSelectedByQuestion({});
    setResponseByQuestion({});
    setSelfMarkedByQuestion({});
    setSubmittedByQuestion({});
    setCorrectByQuestion({});
    setShowExplanation({});
    setResult(null);
    setReviewIndex(0);
    finalizingRef.current = false;
    setTimeSpent(0);
    setSettings(effective);
    setAttemptMode(mode);
    setTimeLeft(effective.timerMinutes * 60);
    setStage("quiz");
  };

  const startStudyMode = () => {
    startQuiz(
      {
        timed: false,
        randomizeQuestions: false,
        explanationMode: "afterEach",
        questionCount: settings.questionCount
      },
      "study"
    );
  };

  const startTestMode = () => {
    startQuiz(
      {
        timed: false,
        randomizeQuestions: true,
        explanationMode: "end",
        questionCount: settings.questionCount
      },
      "test"
    );
  };

  const startTimedMode = () => {
    startQuiz(
      {
        timed: true,
        randomizeQuestions: true,
        explanationMode: "end",
        questionCount: settings.questionCount
      },
      "timed"
    );
  };

  const toggleOption = (index: number) => {
    if (!currentQuestion) return;
    if (submittedByQuestion[currentQuestion.id]) return;
    if (currentQuestion.type === "free") return;

    setSelectedByQuestion((prev) => {
      const existing = prev[currentQuestion.id] ?? [];
      if (currentQuestion.type === "single") {
        return { ...prev, [currentQuestion.id]: [index] };
      }

      return {
        ...prev,
        [currentQuestion.id]: existing.includes(index)
          ? existing.filter((value) => value !== index)
          : [...existing, index]
      };
    });
  };

  const updateCurrentFreeResponse = (value: string) => {
    if (!currentQuestion || currentQuestion.type !== "free") return;
    if (submittedByQuestion[currentQuestion.id]) return;
    setResponseByQuestion((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const markCurrentFreeQuestion = (isCorrect: boolean) => {
    if (!currentQuestion || currentQuestion.type !== "free") return;
    if (!submittedByQuestion[currentQuestion.id]) return;

    setSelfMarkedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
    setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
  };

  const submitCurrentQuestion = () => {
    if (!currentQuestion) return;
    if (submittedByQuestion[currentQuestion.id]) return;

    if (currentQuestion.type === "free") {
      const response = responseByQuestion[currentQuestion.id]?.trim() ?? "";
      if (!response) {
        push({ title: "Write your response first", description: "Add your reasoning before submitting." });
        return;
      }
      setSubmittedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: true }));
      if (settings.explanationMode === "afterEach") {
        setShowExplanation((prev) => ({ ...prev, [currentQuestion.id]: true }));
      }
      return;
    }

    const selected = selectedByQuestion[currentQuestion.id] ?? [];
    if (selected.length === 0) {
      push({ title: "Choose an answer first", description: "Select at least one option before submitting." });
      return;
    }

    const correct = gradeQuestion(currentQuestion, selected);

    setSubmittedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: true }));
    setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: correct }));

    if (settings.explanationMode === "afterEach") {
      setShowExplanation((prev) => ({ ...prev, [currentQuestion.id]: true }));
    }
  };

  const gotoNext = () => {
    if (currentIndex < order.length - 1) {
      setCurrentIndex((prev) => prev + 1);
      return;
    }
    finalizeAttempt();
  };

  const gotoPrev = () => {
    setCurrentIndex((prev) => Math.max(0, prev - 1));
  };

  const finalizeAttempt = async () => {
    if (!quiz) return;
    if (finalizingRef.current) return;
    finalizingRef.current = true;

    const finalSubmitted = { ...submittedByQuestion };
    const finalCorrect = { ...correctByQuestion };

    order.forEach((id) => {
      if (!finalSubmitted[id]) {
        const question = questionsById.get(id);
        if (!question) return;
        finalSubmitted[id] = true;
        if (question.type === "free") {
          finalCorrect[id] = Boolean(selfMarkedByQuestion[id]);
        } else {
          const selected = selectedByQuestion[id] ?? [];
          finalCorrect[id] = gradeQuestion(question, selected);
        }
      }
    });

    setSubmittedByQuestion(finalSubmitted);
    setCorrectByQuestion(finalCorrect);

    const attempt = summarizeAttempt({
      quiz,
      selectedByQuestion,
      freeResponseByQuestion: responseByQuestion,
      selfMarkedByQuestion,
      order,
      timeSpentSeconds: timeSpent
    });

    await saveAttempt(attempt);
    setResult(attempt);
    setStage("results");

    const isPersonalBest = attempt.score > bestScore;
    if (isPersonalBest && preferences.confettiEnabled) {
      fireConfetti();
    }

    push({
      title: isPersonalBest ? "New personal best" : "Quiz submitted",
      description: `${attempt.score}% • ${countMissed(attempt)} missed`,
      tone: isPersonalBest ? "success" : "default"
    });
  };

  useEffect(() => {
    if (stage !== "quiz" || !currentQuestion) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isTyping) return;

      const key = event.key.toLowerCase();
      if (currentQuestion.type !== "free") {
        const optionIndex = keyMap.indexOf(key);
        const optionsLength = currentQuestion.options?.length ?? 0;
        if (optionIndex >= 0 && optionIndex < optionsLength) {
          event.preventDefault();
          toggleOption(optionIndex);
          return;
        }
      }

      if (key === "enter") {
        event.preventDefault();
        if (!submittedByQuestion[currentQuestion.id]) {
          submitCurrentQuestion();
        } else {
          if (currentQuestion.type === "free" && selfMarkedByQuestion[currentQuestion.id] === undefined) {
            push({
              title: "Mark your self-check first",
              description: "Choose 'I got this' or 'Need review' before moving on."
            });
            return;
          }
          gotoNext();
        }
      }

      if (key === "arrowright") {
        if (
          currentQuestion.type === "free" &&
          submittedByQuestion[currentQuestion.id] &&
          selfMarkedByQuestion[currentQuestion.id] === undefined
        ) {
          push({
            title: "Self-check required",
            description: "Mark your response before navigating to the next question."
          });
          return;
        }
        event.preventDefault();
        gotoNext();
      }

      if (key === "arrowleft") {
        event.preventDefault();
        gotoPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [stage, currentQuestion, submittedByQuestion, selfMarkedByQuestion, push]);

  useEffect(() => {
    if (stage !== "results" || !result || isAuthenticated) {
      setGuestSaveModalOpen(false);
      return;
    }
    if (result.score >= 85) {
      setGuestSaveModalOpen(true);
    }
  }, [isAuthenticated, result, stage]);

  if (quizLoading && !quiz) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading quiz…</CardBody>
      </Card>
    );
  }

  if (!quiz || !course) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <p className="font-display text-2xl font-semibold">Quiz not found</p>
          <p className="text-sm text-muted">The requested quiz set is unavailable.</p>
          <Button asChild>
            <Link href={withPrefix(routePrefix, "/courses")}>Back to courses</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  const quizPath = withPrefix(routePrefix, `/quiz/${quiz.id}`);
  const coursePath = withPrefix(routePrefix, `/courses/${course.id}`);
  const signInPath = `/login?next=${encodeURIComponent(quizPath)}`;
  const signUpPath = `/signup?next=${encodeURIComponent(quizPath)}`;

  if (stage === "overview") {
    return (
      <div className="space-y-6">
        <Link href={coursePath} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text">
          <ArrowLeft className="h-4 w-4" />
          Back to {course.code}
        </Link>

        <Card className="mesh-hero overflow-hidden">
          <CardBody className="space-y-5 p-7 md:p-9">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>{course.code}</Badge>
              <Badge tone="brand">{quiz.difficulty}</Badge>
              <Badge tone="success">{quiz.questions.length} questions</Badge>
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{quiz.title}</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-muted">{quiz.description}</p>

            {!isAuthenticated ? (
              <div className="rounded-xl border border-brand-2/35 bg-brand-2/10 px-4 py-3 text-sm text-text">
                Create a free account to save your progress, streak, and mastery insights.
                <div className="mt-3">
                  <Button asChild variant="secondary">
                    <Link href={signUpPath}>Save progress</Link>
                  </Button>
                </div>
              </div>
            ) : null}

            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-borderc bg-soft p-4">
                <p className="text-xs text-muted">Estimated time</p>
                <p className="mt-1 font-mono text-2xl font-bold text-text">{quiz.estMinutes}m</p>
              </div>
              <div className="rounded-xl border border-borderc bg-soft p-4">
                <p className="text-xs text-muted">Best score</p>
                <p className="mt-1 font-mono text-2xl font-bold text-text">{bestScore}%</p>
              </div>
              <div className="rounded-xl border border-borderc bg-soft p-4">
                <p className="text-xs text-muted">Last attempt</p>
                <p className="mt-1 font-mono text-xl font-bold text-text">{latestAttempt ? `${latestAttempt.score}%` : "—"}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button onClick={startTestMode}>Start Test Mode</Button>
              <Button variant="secondary" onClick={startStudyMode}>
                Start Study Walkthrough
              </Button>
              <Button variant="ghost" onClick={startTimedMode}>
                Start Timed Exam
              </Button>
              <Button variant="ghost" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="h-4 w-4" />
                Quiz Settings
              </Button>
            </div>

            <div className="grid gap-2 md:grid-cols-3">
              <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-muted">
                <span className="font-semibold text-text">Test Mode:</span> answer-first flow, graded accuracy, and explanations on demand.
              </div>
              <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-muted">
                <span className="font-semibold text-text">Study Walkthrough:</span> guided hints + full step-by-step solution shown after each submit.
              </div>
              <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-muted">
                <span className="font-semibold text-text">Timed Exam:</span> strict clock with randomized order and end-of-quiz review.
              </div>
            </div>

            <p className="text-xs text-muted">
              Current attempt length:{" "}
              {settings.questionCount === "all" ? `All ${quiz.questions.length}` : settings.questionCount} question
              {settings.questionCount === 1 ? "" : "s"}.
            </p>

            <div className="rounded-xl border border-borderc bg-soft p-4 text-xs text-muted">
              {quiz.courseId === "differential-equations"
                ? "Differential Equations mode: open-ended free response with hint-by-hint guidance and walkthrough self-check."
                : "Keyboard shortcuts in quiz: A/B/C/D choose options • Enter submit/next • Arrow keys navigate."}
            </div>
          </CardBody>
        </Card>

        <QuizSettingsModal
          open={settingsOpen}
          onClose={() => setSettingsOpen(false)}
          initial={settings}
          maxQuestions={quiz.questions.length}
          onConfirm={setSettings}
        />
      </div>
    );
  }

  if (stage === "results" && result) {
    const topicBreakdown = Object.entries(result.topicBreakdown)
      .map(([label, stats]) => ({
        label,
        value: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    return (
      <div className="space-y-6">
        <Card>
          <CardBody className="grid gap-6 p-6 md:grid-cols-[1fr_1.2fr] md:p-8">
            <div className="space-y-4">
              <p className="text-xs uppercase tracking-[0.14em] text-muted">Results</p>
              <h1 className="font-display text-4xl font-semibold tracking-tight">{result.score}%</h1>
              <p className="text-sm text-muted">
                {result.correctCount} of {result.totalCount} correct • {Math.round(result.timeSpent / 60)} min • {percentile(result.score)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setStage("review")} disabled={countMissed(result) === 0}>
                  Review Missed
                </Button>
                <Button variant="secondary" onClick={() => startQuiz()}>
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Button>
                <Button variant="ghost" onClick={() => router.push(coursePath)}>
                  Back to Course
                </Button>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-[220px_1fr]">
              <div className="flex items-center justify-center rounded-2xl border border-borderc bg-soft p-4">
                <DonutChart value={result.score} />
              </div>
              <div className="rounded-2xl border border-borderc bg-soft p-4">
                <p className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-text">
                  <ChartColumnBig className="h-4 w-4 text-brand-2" />
                  Topic breakdown
                </p>
                <BarChart data={topicBreakdown} />
              </div>
            </div>
          </CardBody>
        </Card>

        {!isAuthenticated ? (
          <Card>
            <CardBody className="space-y-4 p-6">
              <h2 className="font-display text-2xl font-semibold">Don&apos;t lose this score.</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Save attempts + progress charts</li>
                <li>• Personalized weak-topic recommendations</li>
                <li>• Streak tracking + leaderboard</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={signUpPath}>Create account and save this attempt</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href={signInPath}>Sign in to save</Link>
                </Button>
                <Button variant="ghost" onClick={() => startQuiz()}>
                  Continue as guest
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}

        <Modal open={guestSaveModalOpen && !isAuthenticated} onClose={() => setGuestSaveModalOpen(false)} title="That was great — want to save it?">
          <div className="space-y-4 text-sm text-muted">
            <p>You scored {result.score}%. Create an account to lock this attempt into your long-term progress history.</p>
            <div className="flex flex-wrap gap-2">
              <Button asChild>
                <Link href={signUpPath}>Create account</Link>
              </Button>
              <Button variant="secondary" asChild>
                <Link href={signInPath}>Sign in</Link>
              </Button>
              <Button variant="ghost" onClick={() => setGuestSaveModalOpen(false)}>
                Continue as guest
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    );
  }

  if (stage === "review" && result) {
    if (!reviewQuestion) {
      return (
        <Card>
          <CardBody className="space-y-3 p-8 text-center">
            <CircleCheckBig className="mx-auto h-9 w-9 text-success" />
            <p className="font-display text-2xl font-semibold">No missed questions to review</p>
            <Button onClick={() => setStage("results")}>Back to results</Button>
          </CardBody>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Button variant="ghost" onClick={() => setStage("results")}>
            <ArrowLeft className="h-4 w-4" />
            Back to results
          </Button>
          <p className="text-sm text-muted">
            Missed review {reviewIndex + 1} / {missedQuestionIds.length}
          </p>
        </div>

        <Card>
          <CardBody className="p-6">
            <QuestionCard
              question={reviewQuestion}
              questionNumber={reviewIndex + 1}
              totalQuestions={missedQuestionIds.length}
              selected={selectedByQuestion[reviewQuestion.id] ?? []}
              responseText={responseByQuestion[reviewQuestion.id] ?? ""}
              onToggleOption={() => undefined}
              onResponseChange={() => undefined}
              onSubmitQuestion={() => undefined}
              submitted
              isCorrect={false}
              selfMarked={selfMarkedByQuestion[reviewQuestion.id]}
              onSelfMark={() => undefined}
              lockInteraction
              disableSelfMark
              showExplanation
              onToggleExplanation={() => undefined}
            />
          </CardBody>
        </Card>

        <div className="flex items-center justify-between">
          <Button
            variant="secondary"
            onClick={() => setReviewIndex((prev) => Math.max(0, prev - 1))}
            disabled={reviewIndex === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setReviewIndex((prev) => Math.min(missedQuestionIds.length - 1, prev + 1))}
            disabled={reviewIndex === missedQuestionIds.length - 1}
          >
            Next
          </Button>
        </div>
      </div>
    );
  }

  const answeredCount = answeredSet.size;
  const questionSubmitted = currentQuestion ? submittedByQuestion[currentQuestion.id] : false;
  const pendingSelfMark =
    currentQuestion?.type === "free" && questionSubmitted
      ? selfMarkedByQuestion[currentQuestion.id] === undefined
      : false;
  const canMoveForward =
    currentQuestion?.type === "free"
      ? questionSubmitted && !pendingSelfMark
      : questionSubmitted;

  return (
    <div className="space-y-4">
      {!isAuthenticated ? (
        <div className="rounded-xl border border-brand-2/35 bg-brand-2/10 px-4 py-3 text-xs text-text">
          Guest mode: your run is stored only on this device.{" "}
          <Link href={signUpPath} className="font-semibold text-accent hover:text-white">
            Save progress
          </Link>
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setStage("overview")}>
          <ArrowLeft className="h-4 w-4" />
          Exit quiz
        </Button>
        <div className="inline-flex items-center gap-2 rounded-lg border border-borderc bg-soft px-3 py-2 text-xs text-muted">
          <Clock3 className="h-3.5 w-3.5" />
          {attemptMode === "study"
            ? `Study walkthrough • ${minutesSeconds(timeSpent)} elapsed`
            : settings.timed
              ? `Timed exam • ${minutesSeconds(timeLeft)} left`
              : `Test mode • ${minutesSeconds(timeSpent)} elapsed`}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[210px_1fr_270px]">
        <QuestionNavigator
          total={order.length}
          currentIndex={currentIndex}
          ids={order}
          answered={answeredSet}
          correctness={new Map(Object.entries(correctByQuestion))}
          onJump={setCurrentIndex}
        />

        <div className="space-y-3">
          {currentQuestion ? (
            <QuestionCard
              question={currentQuestion}
              questionNumber={currentIndex + 1}
              totalQuestions={order.length}
              selected={selectedByQuestion[currentQuestion.id] ?? []}
              responseText={responseByQuestion[currentQuestion.id] ?? ""}
              onToggleOption={toggleOption}
              onResponseChange={updateCurrentFreeResponse}
              onSubmitQuestion={submitCurrentQuestion}
              submitted={Boolean(submittedByQuestion[currentQuestion.id])}
              isCorrect={
                submittedByQuestion[currentQuestion.id]
                  ? currentQuestion.type === "free" && selfMarkedByQuestion[currentQuestion.id] === undefined
                    ? null
                    : Boolean(correctByQuestion[currentQuestion.id])
                  : null
              }
              selfMarked={selfMarkedByQuestion[currentQuestion.id]}
              onSelfMark={markCurrentFreeQuestion}
              lockInteraction={Boolean(submittedByQuestion[currentQuestion.id])}
              studyMode={attemptMode === "study"}
              showHintsBeforeSubmit={attemptMode === "study"}
              showExplanation={attemptMode === "study" ? true : Boolean(showExplanation[currentQuestion.id])}
              onToggleExplanation={() =>
                setShowExplanation((prev) => ({
                  ...prev,
                  [currentQuestion.id]: !prev[currentQuestion.id]
                }))
              }
            />
          ) : null}

          <div className="flex items-center justify-between rounded-xl border border-borderc bg-surface px-4 py-3">
            <Button variant="secondary" onClick={gotoPrev} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentIndex === order.length - 1 ? (
              <Button onClick={finalizeAttempt} disabled={!canMoveForward}>
                Finish Quiz
              </Button>
            ) : (
              <Button onClick={gotoNext} disabled={!canMoveForward}>
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        <StatsPanel
          current={currentIndex + 1}
          total={order.length}
          answeredCount={answeredCount}
          timerEnabled={settings.timed}
          timeLeft={timeLeft}
          scorePreview={scorePreview}
        />
      </div>
    </div>
  );
}
