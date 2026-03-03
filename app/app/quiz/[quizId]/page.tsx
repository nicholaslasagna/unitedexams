"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
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
import type { Attempt, QuizSettings } from "@/lib/types";

type Stage = "overview" | "quiz" | "results" | "review";

const keyMap = ["a", "b", "c", "d", "e", "f"];

export default function QuizPage() {
  const params = useParams<{ quizId: string }>();
  const searchParams = useSearchParams();
  const router = useRouter();

  const quiz = getQuizSet(params.quizId);
  const course = quiz ? getCourse(quiz.courseId) : null;

  const { attempts, saveAttempt, preferences } = useAppData();
  const { push } = useToast();

  const [stage, setStage] = useState<Stage>("overview");
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [settings, setSettings] = useState<QuizSettings>(() =>
    defaultQuizSettings(quiz?.timerDefaultMinutes ?? 20)
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
  const finalizingRef = useRef(false);

  useEffect(() => {
    const mode = searchParams.get("mode");
    if (!quiz) return;

    if (mode === "study") {
      setSettings({
        timed: false,
        timerMinutes: quiz.timerDefaultMinutes,
        randomizeQuestions: false,
        explanationMode: "afterEach"
      });
    }

    if (mode === "timed") {
      setSettings({
        timed: true,
        timerMinutes: quiz.timerDefaultMinutes,
        randomizeQuestions: true,
        explanationMode: "end"
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

  const startQuiz = (override?: Partial<QuizSettings>) => {
    if (!quiz) return;
    const effective = { ...settings, ...(override ?? {}) };
    const ids = quiz.questions.map((q) => q.id);
    const nextOrder = effective.randomizeQuestions ? shuffle(ids) : ids;

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
    setTimeLeft(effective.timerMinutes * 60);
    setStage("quiz");
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
        if (currentQuestion.type === "free" && submittedByQuestion[currentQuestion.id] && selfMarkedByQuestion[currentQuestion.id] === undefined) {
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

  if (!quiz || !course) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <p className="font-display text-2xl font-semibold">Quiz not found</p>
          <p className="text-sm text-muted">The requested quiz set is unavailable.</p>
          <Button asChild>
            <Link href="/app/courses">Back to courses</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  if (stage === "overview") {
    return (
      <div className="space-y-6">
        <Link href={`/app/courses/${course.id}`} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text">
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
              <Button onClick={startQuiz}>Start Quiz</Button>
              <Button
                variant="secondary"
                onClick={() => {
                  startQuiz({ timed: false, explanationMode: "afterEach", randomizeQuestions: false });
                }}
              >
                Study Mode
              </Button>
              <Button
                variant="ghost"
                onClick={() => {
                  startQuiz({ timed: true, explanationMode: "end", randomizeQuestions: true });
                }}
              >
                Timed Mode
              </Button>
              <Button variant="ghost" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="h-4 w-4" />
                Quiz Settings
              </Button>
            </div>

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
                <Button variant="secondary" onClick={startQuiz}>
                  <RotateCcw className="h-4 w-4" />
                  Retake Quiz
                </Button>
                <Button variant="ghost" onClick={() => router.push(`/app/courses/${course.id}`)}>
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
          <Button variant="secondary" onClick={() => setReviewIndex((prev) => Math.max(0, prev - 1))} disabled={reviewIndex === 0}>
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
  const pendingSelfMark = currentQuestion?.type === "free" && questionSubmitted
    ? selfMarkedByQuestion[currentQuestion.id] === undefined
    : false;
  const canMoveForward =
    settings.explanationMode === "end"
      ? currentQuestion?.type === "free"
        ? questionSubmitted && !pendingSelfMark
        : true
      : questionSubmitted && !pendingSelfMark;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-2">
        <Button variant="ghost" onClick={() => setStage("overview")}>
          <ArrowLeft className="h-4 w-4" />
          Exit quiz
        </Button>
        <div className="inline-flex items-center gap-2 rounded-lg border border-borderc bg-soft px-3 py-2 text-xs text-muted">
          <Clock3 className="h-3.5 w-3.5" />
          {settings.timed ? `Timed • ${minutesSeconds(timeLeft)} left` : `${minutesSeconds(timeSpent)} elapsed`}
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
              showExplanation={Boolean(showExplanation[currentQuestion.id]) || settings.explanationMode === "end"}
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
