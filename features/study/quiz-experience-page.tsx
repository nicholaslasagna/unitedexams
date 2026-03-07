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
import { fetchPublishedStudySet } from "@/features/study/study-set-source";
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
import {
  countMissed,
  gradeQuestion,
  isOpenResponseQuestion,
  requiresSelfMark,
  summarizeAttempt
} from "@/features/quiz/engine";
import { fireConfetti } from "@/features/quiz/confetti";
import { bestScoreForQuiz, latestAttemptForQuiz } from "@/features/progress/metrics";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { resolveQuestionCountTarget, resolveQuizSetMode } from "@/lib/study/set-mode";
import { minutesSeconds, percentile, shuffle } from "@/lib/utils";
import type { Attempt, QuizSet, QuizSettings } from "@/lib/types";

type Stage = "overview" | "quiz" | "submitted" | "results" | "review";
type AttemptMode = "test" | "study" | "timed" | "exam";

interface SectionAssignmentPolicy {
  assignmentId: string;
  assignmentTitle: string;
  gradingMode: "auto" | "manual" | "mixed";
  dueAt: string | null;
}

const keyMap = ["a", "b", "c", "d", "e", "f"];

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
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
  const sectionParam = searchParams.get("section")?.trim() || "";

  const { attempts, saveAttempt, preferences, isAuthenticated, supabase } = useAppData();
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
  const [sectionAssignmentPolicy, setSectionAssignmentPolicy] = useState<SectionAssignmentPolicy | null>(null);
  const [submissionMeta, setSubmissionMeta] = useState<{
    resultsAvailable: boolean;
    message: string;
  }>({
    resultsAvailable: true,
    message: ""
  });
  const [reviewIndex, setReviewIndex] = useState(0);
  const [guestSaveModalOpen, setGuestSaveModalOpen] = useState(false);
  const finalizingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setQuizLoading(true);
    const sectionId = sectionParam || undefined;

    fetchPublishedStudySet(quizId, { sectionId })
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
  }, [fallbackQuiz, quizId, sectionParam]);

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
    if (!supabase || !isAuthenticated || !sectionParam || !quiz?.id) {
      setSectionAssignmentPolicy(null);
      return;
    }

    let active = true;
    void (async () => {
      try {
        const { data, error } = await supabase
          .from("assignments")
          .select("id, title, grading_mode, due_at")
          .eq("section_id", sectionParam)
          .eq("quiz_set_id", quiz.id)
          .order("created_at", { ascending: false })
          .limit(1)
          .maybeSingle();

        if (!active) return;
        if (error || !data) {
          setSectionAssignmentPolicy(null);
          return;
        }
        setSectionAssignmentPolicy({
          assignmentId: String(data.id),
          assignmentTitle: (data.title || "Assignment").toString(),
          gradingMode: (data.grading_mode as "auto" | "manual" | "mixed") ?? "auto",
          dueAt: (data.due_at as string | null) ?? null
        });
      } catch {
        if (!active) return;
        setSectionAssignmentPolicy(null);
      }
    })();

    return () => {
      active = false;
    };
  }, [isAuthenticated, quiz?.id, sectionParam, supabase]);

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
        questionCount: "all",
        includeFreeResponse: true
      });
    }

    if (mode === "timed") {
      setAttemptMode("timed");
      setSettings({
        timed: true,
        timerMinutes: quiz.timerDefaultMinutes,
        randomizeQuestions: true,
        explanationMode: "end",
        questionCount: "all",
        includeFreeResponse: true
      });
    }

    if (mode === "exam") {
      setAttemptMode("exam");
      setSettings({
        timed: true,
        timerMinutes: quiz.timerDefaultMinutes,
        randomizeQuestions: true,
        explanationMode: "end",
        questionCount: "all",
        includeFreeResponse: true
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
  const setMode = quiz ? resolveQuizSetMode(quiz) : "quiz";
  const examQuestionTarget = quiz ? resolveQuestionCountTarget(quiz) : null;

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
      if (isOpenResponseQuestion(question)) {
        if (requiresSelfMark(question)) {
          return Boolean(selfMarkedByQuestion[id]);
        }
        return Boolean(correctByQuestion[id]);
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
    const includeFreeResponse = effective.includeFreeResponse !== false;

    let selectedQuestionIds = quiz.questions
      .filter((question) => includeFreeResponse || !isOpenResponseQuestion(question))
      .map((question) => question.id);

    // Exam simulations and custom banks can be entirely open-response.
    // If a filter would empty the run, fall back to the full set instead.
    if (selectedQuestionIds.length === 0) {
      selectedQuestionIds = quiz.questions.map((question) => question.id);
    }

    if (setMode === "exam") {
      const targetCount = Math.min(
        selectedQuestionIds.length,
        Math.max(1, examQuestionTarget ?? selectedQuestionIds.length)
      );
      const professorPriority = quiz.questions
        .filter((question) => question.fromProfessor)
        .map((question) => question.id)
        .filter((id) => selectedQuestionIds.includes(id));

      const uniquePriority = [...new Set(professorPriority)];
      const remainingPool = selectedQuestionIds.filter((id) => !uniquePriority.includes(id));
      const sampledRest = shuffle(remainingPool).slice(0, Math.max(0, targetCount - uniquePriority.length));
      selectedQuestionIds = [...uniquePriority, ...sampledRest].slice(0, targetCount);

      if (effective.randomizeQuestions) {
        selectedQuestionIds = shuffle(selectedQuestionIds);
      }
    } else {
      const orderedIds = effective.randomizeQuestions ? shuffle(selectedQuestionIds) : selectedQuestionIds;
      const maxQuestions = orderedIds.length;
      const requestedCount =
        effective.questionCount === "all"
          ? maxQuestions
          : Math.min(maxQuestions, Math.max(1, Number(effective.questionCount || maxQuestions)));
      selectedQuestionIds = orderedIds.slice(0, requestedCount);
    }

    setOrder(selectedQuestionIds);
    setCurrentIndex(0);
    setSelectedByQuestion({});
    setResponseByQuestion({});
    setSelfMarkedByQuestion({});
    setSubmittedByQuestion({});
    setCorrectByQuestion({});
    setShowExplanation({});
    setResult(null);
    setSubmissionMeta({
      resultsAvailable: true,
      message: ""
    });
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
        questionCount: settings.questionCount,
        includeFreeResponse: true
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
        questionCount: settings.questionCount,
        includeFreeResponse: true
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
        questionCount: settings.questionCount,
        includeFreeResponse: true
      },
      "timed"
    );
  };

  const startExamMode = () => {
    startQuiz(
      {
        timed: true,
        timerMinutes: quiz?.timerDefaultMinutes ?? settings.timerMinutes,
        randomizeQuestions: true,
        explanationMode: "end",
        questionCount: "all",
        includeFreeResponse: true
      },
      "exam"
    );
  };

  const toggleOption = (index: number) => {
    if (!currentQuestion) return;
    if (submittedByQuestion[currentQuestion.id]) return;
    if (isOpenResponseQuestion(currentQuestion)) return;

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
    if (!currentQuestion || !isOpenResponseQuestion(currentQuestion)) return;
    if (submittedByQuestion[currentQuestion.id]) return;
    setResponseByQuestion((prev) => ({ ...prev, [currentQuestion.id]: value }));
  };

  const markCurrentFreeQuestion = (isCorrect: boolean) => {
    if (!currentQuestion || !requiresSelfMark(currentQuestion)) return;
    if (!submittedByQuestion[currentQuestion.id]) return;

    setSelfMarkedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
    setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
  };

  const submitCurrentQuestion = () => {
    if (!currentQuestion) return;
    if (submittedByQuestion[currentQuestion.id]) return;

    if (isOpenResponseQuestion(currentQuestion)) {
      const response = responseByQuestion[currentQuestion.id]?.trim() ?? "";
      if (!response) {
        push({ title: "Write your response first", description: "Add your reasoning before submitting." });
        return;
      }
      setSubmittedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: true }));
      if (!requiresSelfMark(currentQuestion)) {
        const correct = gradeQuestion(currentQuestion, [], response);
        setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: correct }));
      }
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
    try {
      const finalSubmitted = { ...submittedByQuestion };
      const finalCorrect = { ...correctByQuestion };

      order.forEach((id) => {
        if (!finalSubmitted[id]) {
          const question = questionsById.get(id);
          if (!question) return;
          finalSubmitted[id] = true;
          if (isOpenResponseQuestion(question)) {
            if (requiresSelfMark(question)) {
              finalCorrect[id] = Boolean(selfMarkedByQuestion[id]);
            } else {
              const response = responseByQuestion[id]?.trim() ?? "";
              finalCorrect[id] = gradeQuestion(question, [], response);
            }
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
      attempt.mode = setMode === "exam" ? "exam" : "quiz";
      attempt.status = "completed";

      let saveWarning: string | null = null;
      try {
        await saveAttempt(attempt);
      } catch (error) {
        saveWarning = (error as Error).message || "We could not sync your attempt yet.";
      }

      if (!saveWarning && isAuthenticated && supabase && sectionAssignmentPolicy) {
        const { error: assignmentSubmitError } = await supabase.rpc("submit_assignment", {
          assignment_id_input: sectionAssignmentPolicy.assignmentId,
          attempt_id_input: null
        });
        if (assignmentSubmitError) {
          saveWarning = assignmentSubmitError.message;
        }
      }

      const resultsAvailableNow =
        !sectionAssignmentPolicy || sectionAssignmentPolicy.gradingMode === "auto";
      let submissionMessage = sectionAssignmentPolicy
        ? resultsAvailableNow
          ? `Thanks for submitting ${sectionAssignmentPolicy.assignmentTitle}. Your instructor allows immediate results.`
          : `Thanks for submitting ${sectionAssignmentPolicy.assignmentTitle}. Your instructor will release results after review.`
        : "Thanks for submitting your quiz.";

      if (saveWarning) {
        submissionMessage = `${submissionMessage} We could not fully sync this submission yet: ${saveWarning}`;
      }

      setResult(attempt);
      setSubmissionMeta({
        resultsAvailable: resultsAvailableNow,
        message: submissionMessage
      });
      setStage("submitted");

      const isPersonalBest = attempt.score > bestScore;
      if (isPersonalBest && preferences.confettiEnabled) {
        fireConfetti();
      }

      push({
        title: saveWarning
          ? "Quiz submitted with sync warning"
          : isPersonalBest
            ? "New personal best"
            : "Quiz submitted",
        description: resultsAvailableNow
          ? `${attempt.score}% • ${countMissed(attempt)} missed`
          : "Submission received. Results are pending instructor release.",
        tone: saveWarning ? "default" : isPersonalBest ? "success" : "default"
      });
    } finally {
      finalizingRef.current = false;
    }
  };

  useEffect(() => {
    if (stage !== "quiz" || !currentQuestion) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isTyping) return;

      const key = event.key.toLowerCase();
      if (!isOpenResponseQuestion(currentQuestion)) {
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
          if (
            attemptMode !== "exam" &&
            requiresSelfMark(currentQuestion) &&
            selfMarkedByQuestion[currentQuestion.id] === undefined
          ) {
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
          attemptMode !== "exam" &&
          requiresSelfMark(currentQuestion) &&
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
  }, [stage, currentQuestion, submittedByQuestion, selfMarkedByQuestion, push, attemptMode]);

  useEffect(() => {
    if (stage !== "results" || !result || isAuthenticated) {
      setGuestSaveModalOpen(false);
      return;
    }
    if (result.score >= 85) {
      const key = "ue.guest.high-score-modal.last-shown-at";
      const now = Date.now();
      const lastShown = Number(window.localStorage.getItem(key) ?? "0");
      const oneDayMs = 24 * 60 * 60 * 1000;
      if (!lastShown || now - lastShown >= oneDayMs) {
        setGuestSaveModalOpen(true);
        window.localStorage.setItem(key, String(now));
      }
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
          <p className="text-heading font-semibold">Quiz not found</p>
          <p className="text-sm text-text-secondary">The requested quiz set is unavailable.</p>
          <Button asChild>
            <Link href={withPrefix(routePrefix, "/courses")}>Back to courses</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  const quizPath = withPrefix(routePrefix, `/quiz/${quiz.id}`);
  const coursePath = withPrefix(routePrefix, `/courses/${course.id}`);
  const sectionPath = sectionParam ? `/app/sections/${sectionParam}` : null;
  const signInPath = `/login?next=${encodeURIComponent(quizPath)}`;
  const signUpPath = `/signup?next=${encodeURIComponent(quizPath)}`;

  if (stage === "overview") {
    return (
      <div className="space-y-6">
        <Link href={coursePath} className="inline-flex items-center gap-2 text-sm font-semibold text-muted transition-all duration-200 ease-out-expo hover:text-text">
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
            <h1 className="text-display-lg font-semibold tracking-tight">{quiz.title}</h1>
            <p className="max-w-3xl text-sm leading-relaxed text-text-secondary">{quiz.description}</p>

            <div className="flex flex-wrap gap-2">
              <Badge tone={setMode === "exam" ? "warn" : setMode === "homework" ? "success" : "brand"}>
                {setMode === "exam" ? "Exam Simulation" : setMode === "homework" ? "Homework" : "Practice Quiz"}
              </Badge>
              {examQuestionTarget ? <Badge tone="warn">Target {examQuestionTarget} questions</Badge> : null}
            </div>

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
              <div className="rounded-xl border border-borderc bg-soft p-4 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-1">
                <p className="text-xs text-text-secondary">Estimated time</p>
                <p className="mt-1 font-mono text-heading font-bold text-text">{quiz.estMinutes}m</p>
              </div>
              <div className="rounded-xl border border-borderc bg-soft p-4 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-2">
                <p className="text-xs text-text-secondary">Best score</p>
                <p className="mt-1 font-mono text-heading font-bold text-text">{bestScore}%</p>
              </div>
              <div className="rounded-xl border border-borderc bg-soft p-4 transition-all duration-200 ease-out-expo hover:shadow-card-hover hover:border-border-accent stagger-3">
                <p className="text-xs text-text-secondary">Last attempt</p>
                <p className="mt-1 font-mono text-heading font-bold text-text">{latestAttempt ? `${latestAttempt.score}%` : "—"}</p>
              </div>
            </div>

            {setMode === "homework" ? (
              <div className="rounded-xl border border-success/30 bg-success/10 p-4 text-sm text-text">
                This set is configured for one-by-one Homework Mode.
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild>
                    <Link href={withPrefix(routePrefix, `/homework/${quiz.id}`)}>Open Homework Mode</Link>
                  </Button>
                  <Button variant="ghost" asChild>
                    <Link href={withPrefix(routePrefix, `/homework/${quiz.id}?review=1`)}>
                      Resume flagged review
                    </Link>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {setMode === "exam" ? (
                  <>
                    <Button onClick={startExamMode}>Start Exam Simulation</Button>
                    <Button variant="secondary" onClick={startTestMode}>
                      Practice This Bank
                    </Button>
                  </>
                ) : (
                  <>
                    <Button onClick={startTestMode}>Start Test Mode</Button>
                    <Button variant="secondary" onClick={startStudyMode}>
                      Start Study Walkthrough
                    </Button>
                    <Button variant="ghost" onClick={startTimedMode}>
                      Start Timed Exam
                    </Button>
                  </>
                )}
                <Button variant="ghost" onClick={() => setSettingsOpen(true)}>
                  <Settings2 className="h-4 w-4" />
                  Quiz Settings
                </Button>
              </div>
            )}

            {setMode === "exam" ? (
              <div className="grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary stagger-1">
                  <span className="font-semibold text-text">Rule 1:</span> one question at a time with exam pacing.
                </div>
                <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary stagger-2">
                  <span className="font-semibold text-text">Rule 2:</span> explanations default to end-of-exam review.
                </div>
                <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary stagger-3">
                  <span className="font-semibold text-text">Rule 3:</span> professor-priority items are always included.
                </div>
              </div>
            ) : (
              <div className="grid gap-2 md:grid-cols-3">
                <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary stagger-1">
                  <span className="font-semibold text-text">Test Mode:</span> answer-first flow, graded accuracy, and explanations on demand.
                </div>
                <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary stagger-2">
                  <span className="font-semibold text-text">Study Walkthrough:</span> guided hints + full step-by-step solution shown after each submit.
                </div>
                <div className="rounded-xl border border-borderc bg-soft px-3 py-2 text-xs text-text-secondary stagger-3">
                  <span className="font-semibold text-text">Timed Exam:</span> strict clock with randomized order and end-of-quiz review.
                </div>
              </div>
            )}

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
          setMode={setMode}
          onConfirm={setSettings}
        />
      </div>
    );
  }

  if (stage === "submitted" && result) {
    return (
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-5 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.14em] text-text-secondary">Submission received</p>
            <h1 className="text-display-lg font-semibold tracking-tight">Thanks for submitting</h1>
            <p className="text-sm text-text-secondary">{submissionMeta.message}</p>

            <div
              className={`rounded-xl border px-4 py-3 text-sm ${
                submissionMeta.resultsAvailable
                  ? "border-success/35 bg-success/10 text-text"
                  : "border-warn/35 bg-warn/10 text-text"
              }`}
            >
              {submissionMeta.resultsAvailable
                ? "Your results are available now."
                : "Results are currently hidden by instructor policy and will appear when released."}
            </div>

            <div className="flex flex-wrap gap-2">
              {submissionMeta.resultsAvailable ? (
                <Button onClick={() => setStage("results")}>View results</Button>
              ) : null}
              <Button variant="secondary" onClick={() => startQuiz()}>
                <RotateCcw className="h-4 w-4" />
                {setMode === "exam" ? "Retake Exam" : "Retake Quiz"}
              </Button>
              {sectionPath ? (
                <Button variant="ghost" asChild>
                  <Link href={sectionPath}>Back to section</Link>
                </Button>
              ) : (
                <Button variant="ghost" onClick={() => router.push(coursePath)}>
                  Back to course
                </Button>
              )}
            </div>
          </CardBody>
        </Card>
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
              <p className="text-xs uppercase tracking-[0.14em] text-text-secondary">Results</p>
              <h1 className="text-display-lg font-semibold tracking-tight"><span className="font-mono">{result.score}%</span></h1>
              <p className="text-sm text-text-secondary">
                {result.correctCount} of {result.totalCount} correct • {Math.round(result.timeSpent / 60)} min • {percentile(result.score)}
              </p>
              <div className="flex flex-wrap gap-2">
                <Button onClick={() => setStage("review")} disabled={countMissed(result) === 0}>
                  Review Missed
                </Button>
                <Button variant="secondary" onClick={() => startQuiz()}>
                  <RotateCcw className="h-4 w-4" />
                  {setMode === "exam" ? "Retake Exam" : "Retake Quiz"}
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
              <h2 className="text-heading font-semibold">Don&apos;t lose this score.</h2>
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
            <p className="text-heading font-semibold">No missed questions to review</p>
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
          <p className="text-sm text-text-secondary">
            Missed review <span className="font-mono">{reviewIndex + 1} / {missedQuestionIds.length}</span>
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
    currentQuestion && requiresSelfMark(currentQuestion) && questionSubmitted
      ? attemptMode !== "exam" && selfMarkedByQuestion[currentQuestion.id] === undefined
      : false;
  const canMoveForward =
    currentQuestion && requiresSelfMark(currentQuestion)
      ? questionSubmitted && !pendingSelfMark
      : questionSubmitted;

  return (
    <div className="space-y-4">
      {!isAuthenticated ? (
        <div className="rounded-xl border border-brand-2/35 bg-brand-2/10 px-4 py-3 text-xs text-text">
          Guest mode: your run is stored only on this device.{" "}
          <Link href={signUpPath} className="font-semibold text-accent hover:text-text">
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
            : attemptMode === "exam"
              ? settings.timed
                ? `Exam simulation • ${minutesSeconds(timeLeft)} left`
                : `Exam simulation • ${minutesSeconds(timeSpent)} elapsed`
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
          correctness={attemptMode === "exam" ? new Map() : new Map(Object.entries(correctByQuestion))}
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
                  ? requiresSelfMark(currentQuestion) && selfMarkedByQuestion[currentQuestion.id] === undefined
                    ? null
                    : Boolean(correctByQuestion[currentQuestion.id])
                  : null
              }
              selfMarked={selfMarkedByQuestion[currentQuestion.id]}
              onSelfMark={markCurrentFreeQuestion}
              lockInteraction={Boolean(submittedByQuestion[currentQuestion.id])}
              disableSelfMark={attemptMode === "exam"}
              studyMode={attemptMode === "study"}
              showHintsBeforeSubmit={attemptMode === "study"}
              showExplanation={attemptMode === "study" ? true : Boolean(showExplanation[currentQuestion.id])}
              revealCorrectness={attemptMode !== "exam"}
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
          scorePreview={attemptMode === "exam" ? undefined : scorePreview}
        />
      </div>
    </div>
  );
}
