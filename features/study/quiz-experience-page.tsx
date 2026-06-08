"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenCheck,
  ChartColumnBig,
  CircleCheckBig,
  Clock3,
  Notebook,
  RotateCcw,
  Settings2,
  Sparkles,
  Timer,
  TimerReset
} from "lucide-react";
import { AccessBadge } from "@/components/ui/access-badge";
import { FeatureStat } from "@/components/ui/feature-stat";
import { InstitutionAccessNote } from "@/components/ui/institution-access-note";
import { PremiumUnlockNote } from "@/components/ui/premium-unlock-note";
import { useAccess } from "@/lib/hooks/use-access";
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
  allowLate: boolean;
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

  const { attempts, saveAttempt, preferences, isAuthenticated, supabase, profile } = useAppData();
  const { push } = useToast();
  // Centralized access decision — `inInstitutionFlow` is true when the
  // quiz was launched inside a section, which unconditionally hides
  // upgrade prompts (institution-managed grading flow).
  const access = useAccess({ inInstitutionFlow: Boolean(sectionParam) });

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

  /*
   * Ref bag for the keyboard handler — see the keydown effect below
   * for the full explanation. Updated on every render so the handler
   * always reads current state without re-binding the listener.
   */
  const quizKeyHandlersRef = useRef<{
    currentQuestion: typeof currentQuestion;
    submittedByQuestion: typeof submittedByQuestion;
    selfMarkedByQuestion: typeof selfMarkedByQuestion;
    assignmentSubmissionLocked: boolean;
    hideLiveExamFeedback: boolean;
    currentIndex: number;
    orderLength: number;
    toggleOption: (index: number) => void;
    submitCurrentQuestion: () => void;
    gotoNext: () => void;
    gotoPrev: () => void;
    setStageOverview: () => void;
    push: typeof push;
  } | null>(null);

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
          .select("id, title, grading_mode, due_at, allow_late")
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
          dueAt: (data.due_at as string | null) ?? null,
          allowLate: Boolean(data.allow_late)
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
        explanationMode: quiz.isExamSimulation ? "afterEach" : "end",
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
  const supportsGuidedExamReview = Boolean(quiz?.isExamSimulation);
  const guidedExamSimulation = attemptMode === "exam" && supportsGuidedExamReview;
  const immediateReviewMode = attemptMode === "study" || guidedExamSimulation;
  const hideLiveExamFeedback = attemptMode === "exam" && !guidedExamSimulation;

  const latestAttempt = useMemo(() => {
    if (!quiz) return null;
    return latestAttemptForQuiz(attempts, quiz.id);
  }, [attempts, quiz]);

  const assignmentSubmissionLocked = useMemo(() => {
    if (!sectionAssignmentPolicy?.dueAt) return false;
    if (sectionAssignmentPolicy.allowLate) return false;
    const dueTime = new Date(sectionAssignmentPolicy.dueAt).getTime();
    return Number.isFinite(dueTime) && Date.now() > dueTime;
  }, [sectionAssignmentPolicy]);

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
        explanationMode: quiz?.isExamSimulation ? "afterEach" : "end",
        questionCount: "all",
        includeFreeResponse: true
      },
      "exam"
    );
  };

  const startReadOnlyAssignmentView = () => {
    startQuiz(
      {
        timed: false,
        randomizeQuestions: false,
        explanationMode: "end",
        questionCount: "all",
        includeFreeResponse: true
      },
      setMode === "exam" ? "exam" : "study"
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
    if (assignmentSubmissionLocked) {
      push({
        title: "Assignment is closed",
        description: "The due date has passed. You can still view the assignment, but you cannot submit work."
      });
      return;
    }
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
    if (assignmentSubmissionLocked) {
      setStage("overview");
      push({
        title: "Assignment is closed",
        description: "The due date has passed. This assignment is now view-only."
      });
      return;
    }
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

      const directResultsForPublicStudySet = !sectionAssignmentPolicy;

      setResult(attempt);
      setSubmissionMeta({
        resultsAvailable: resultsAvailableNow,
        message: submissionMessage
      });
      setStage(directResultsForPublicStudySet && resultsAvailableNow ? "results" : "submitted");

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

  /*
   * Keep the ref bag fresh on every render. The keyboard listener
   * (below) reads everything through this ref so it always sees
   * current state — no stale closures, no rebinding on every state
   * change. This must run on every render, not gated by deps.
   */
  quizKeyHandlersRef.current = {
    currentQuestion,
    submittedByQuestion,
    selfMarkedByQuestion,
    assignmentSubmissionLocked,
    hideLiveExamFeedback,
    currentIndex,
    orderLength: order.length,
    toggleOption,
    submitCurrentQuestion,
    gotoNext,
    gotoPrev,
    setStageOverview: () => setStage("overview"),
    push
  };

  useEffect(() => {
    if (stage !== "quiz" || !currentQuestion) return;

    /*
     * The keyboard handler used to read state directly from this
     * effect's closure. The deps array only re-bound the handler when
     * `submittedByQuestion` / `selfMarkedByQuestion` changed — so
     * after pressing A/B/C/D to select an option (which updates
     * `selectedByQuestion`, NOT in the deps), the Enter handler still
     * called the stale `submitCurrentQuestion` from the previous
     * render — which read the OLD empty `selectedByQuestion` and
     * fired "Choose an answer first" even though the user had
     * already selected.
     *
     * Fix: read every dynamic dependency through `latestRef.current`
     * so the handler always sees current state. The listener itself
     * stays mounted for the whole quiz stage; no rebinding noise.
     */
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement;
      const isTyping = ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isTyping) return;

      const r = quizKeyHandlersRef.current;
      if (!r) return;

      const cq = r.currentQuestion;
      if (!cq) return;

      const key = event.key.toLowerCase();
      if (!isOpenResponseQuestion(cq)) {
        const optionIndex = keyMap.indexOf(key);
        const optionsLength = cq.options?.length ?? 0;
        if (optionIndex >= 0 && optionIndex < optionsLength) {
          event.preventDefault();
          r.toggleOption(optionIndex);
          return;
        }
      }

      if (key === "enter") {
        event.preventDefault();
        if (r.assignmentSubmissionLocked) {
          if (r.currentIndex < r.orderLength - 1) {
            r.gotoNext();
          } else {
            r.setStageOverview();
          }
          return;
        }
        if (!r.submittedByQuestion[cq.id]) {
          r.submitCurrentQuestion();
        } else {
          if (
            !r.hideLiveExamFeedback &&
            requiresSelfMark(cq) &&
            r.selfMarkedByQuestion[cq.id] === undefined
          ) {
            r.push({
              title: "Mark your self-check first",
              description: "Choose 'I got this' or 'Need review' before moving on."
            });
            return;
          }
          r.gotoNext();
        }
      }

      if (key === "arrowright") {
        if (r.assignmentSubmissionLocked) {
          event.preventDefault();
          if (r.currentIndex < r.orderLength - 1) {
            r.gotoNext();
          } else {
            r.setStageOverview();
          }
          return;
        }
        if (
          !r.hideLiveExamFeedback &&
          requiresSelfMark(cq) &&
          r.submittedByQuestion[cq.id] &&
          r.selfMarkedByQuestion[cq.id] === undefined
        ) {
          r.push({
            title: "Self-check required",
            description: "Mark your response before navigating to the next question."
          });
          return;
        }
        event.preventDefault();
        r.gotoNext();
      }

      if (key === "arrowleft") {
        event.preventDefault();
        r.gotoPrev();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
    // The handler reads everything through `quizKeyHandlersRef`, so
    // we only need to re-bind when the *stage* itself changes (entering
    // or leaving the quiz). All in-quiz state updates flow through
    // the ref without causing listener churn.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

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
    const lengthLabel =
      settings.questionCount === "all" ? `All ${quiz.questions.length}` : settings.questionCount;

    return (
      <div className="space-y-7">
        <Link
          href={coursePath}
          className="inline-flex items-center gap-2 text-sm font-semibold text-text-secondary transition-colors hover:text-text"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to {course.code}
        </Link>

        {/* Hero panel */}
        <section className="relative">
          <div className="aurora absolute inset-0 -z-10 rounded-[2rem] opacity-90" aria-hidden />
          <div className="premium-card glow-border overflow-hidden p-5 sm:p-7 md:p-8">
            <div className="grid gap-7 lg:grid-cols-[1.15fr_0.85fr]">
              <div className="space-y-5">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone="accent">{course.code}</Badge>
                  <Badge>{quiz.difficulty}</Badge>
                  <Badge
                    tone={setMode === "exam" ? "warn" : setMode === "homework" ? "success" : "brand"}
                  >
                    {setMode === "exam"
                      ? "Exam Simulation"
                      : setMode === "homework"
                        ? "Homework"
                        : "Practice Quiz"}
                  </Badge>
                  {examQuestionTarget ? (
                    <Badge tone="warn">Target {examQuestionTarget} q</Badge>
                  ) : null}
                  {access.isInstitutionCovered ? (
                    <AccessBadge variant="institution" label="Institution access" />
                  ) : access.isPremium ? (
                    <AccessBadge variant="premium" label="Premium active" />
                  ) : (
                    <AccessBadge variant="free" label="Public bank" />
                  )}
                </div>

                <h1 className="font-display text-[2.2rem] font-semibold leading-[1.05] tracking-tight text-text sm:text-[2.75rem]">
                  {quiz.title}
                </h1>
                <p className="max-w-2xl text-[14.5px] leading-relaxed text-text-secondary">
                  {quiz.description}
                </p>

                {access.messaging.showInstitutionNote ? (
                  <InstitutionAccessNote variant="block" schoolName={profile?.school ?? null} />
                ) : access.messaging.showGuestSavePrompt ? (
                  <div className="rounded-[1.1rem] border border-accent/35 bg-accent/10 px-4 py-3 text-[13.5px] text-text">
                    <span className="inline-flex items-center gap-1.5 font-semibold">
                      <Sparkles className="h-3.5 w-3.5 text-accent" />
                      Create an account to save your progress
                    </span>
                    <p className="mt-1 text-[12.5px] text-text-secondary">
                      Attempts, mastery, and streaks sync to your account once you sign in.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Button asChild variant="secondary" size="sm">
                        <Link href={signUpPath}>Create free account</Link>
                      </Button>
                      <Button asChild variant="ghost" size="sm">
                        <Link href={signInPath}>Sign in</Link>
                      </Button>
                    </div>
                  </div>
                ) : null}

                <div className="grid gap-2.5 sm:grid-cols-3">
                  <FeatureStat
                    label="Estimated time"
                    value={`${quiz.estMinutes}m`}
                    icon={<Clock3 className="h-3.5 w-3.5" />}
                  />
                  <FeatureStat
                    label="Best score"
                    value={`${bestScore}%`}
                    icon={<Sparkles className="h-3.5 w-3.5" />}
                    tone={bestScore >= 80 ? "success" : bestScore > 0 ? "warn" : "default"}
                  />
                  <FeatureStat
                    label="Last attempt"
                    value={latestAttempt ? `${latestAttempt.score}%` : "—"}
                    icon={<Timer className="h-3.5 w-3.5" />}
                  />
                </div>
              </div>

              {/* Quick info panel */}
              <div className="space-y-3">
                <div className="rounded-[1.25rem] border border-borderc bg-surface/85 p-4">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-accent">
                    Attempt length
                  </p>
                  <p className="mt-2 font-display text-2xl font-semibold text-text">
                    {lengthLabel} q
                  </p>
                  <p className="mt-1 text-[12.5px] text-text-secondary">
                    Adjust in Quiz Settings if you want a shorter run.
                  </p>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="mt-3 w-full justify-between"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <Settings2 className="h-4 w-4" />
                    Quiz settings
                  </Button>
                </div>

                <div className="rounded-[1.25rem] border border-borderc bg-soft px-4 py-3 text-[12.5px] text-text-secondary">
                  <p className="text-[10.5px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Keyboard shortcuts
                  </p>
                  <p className="mt-2">
                    <span className="font-mono font-bold text-text">A/B/C/D</span> select •{" "}
                    <span className="font-mono font-bold text-text">Enter</span> submit/next •{" "}
                    <span className="font-mono font-bold text-text">←/→</span> navigate
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Past-due notice */}
        {assignmentSubmissionLocked ? (
          <Card className="border-danger/35 bg-danger/5">
            <CardBody className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-display text-lg font-semibold text-text">This assignment is past due.</p>
                  <p className="mt-1 text-[13px] text-text-secondary">
                    You can still open it in read-only mode, but you cannot submit answers for grading.
                  </p>
                </div>
                <Badge tone="danger">Closed</Badge>
              </div>
              <div className="flex flex-wrap gap-2">
                <Button onClick={startReadOnlyAssignmentView}>Open read-only view</Button>
                {sectionPath ? (
                  <Button variant="secondary" asChild>
                    <Link href={sectionPath}>Back to section</Link>
                  </Button>
                ) : null}
              </div>
            </CardBody>
          </Card>
        ) : setMode === "homework" ? (
          <Card>
            <CardBody className="space-y-3 p-5">
              <Badge tone="success">Homework</Badge>
              <p className="font-display text-lg font-semibold text-text">
                This one is set up as homework.
              </p>
              <p className="text-[13px] text-text-secondary">
                Work through it one problem at a time, with hints and full answers whenever you need them.
              </p>
              <div className="flex flex-wrap gap-2">
                <Button asChild size="lg">
                  <Link href={withPrefix(routePrefix, `/homework/${quiz.id}`)}>
                    <Notebook className="h-4 w-4" />
                    Start homework
                  </Link>
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : (
          // One clear "Start" + a quieter "other ways to practice" row.
          // Replaces the old 3–4 equal mode cards that gave a first-timer
          // no sense of where to begin.
          <section className="space-y-4">
            <div className="flex items-end justify-between gap-3">
              <div>
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  Ready to start?
                </p>
                <p className="mt-1 font-display text-xl font-semibold text-text">
                  Practice this quiz your way.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSettingsOpen(true)}>
                <Settings2 className="h-4 w-4" />
                Settings
              </Button>
            </div>

            {setMode === "exam" ? (
              <div className="space-y-3">
                {/* Recommended: take the exam */}
                <div className="rounded-[1.4rem] border border-accent/35 bg-accent/10 p-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-surface/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    Recommended
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold text-text">Take the exam</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    A timed, test-style run — the closest thing to the real exam.
                  </p>
                  <Button onClick={startExamMode} size="lg" className="mt-4 w-full sm:w-auto">
                    <TimerReset className="h-4 w-4" />
                    Start exam
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Gentler option */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Not ready for the timer?
                  </p>
                  <Button onClick={startTestMode} variant="secondary" className="w-full sm:w-auto">
                    Practice first — no timer
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Recommended: practice quiz */}
                <div className="rounded-[1.4rem] border border-accent/35 bg-accent/10 p-5">
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-surface/70 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.18em] text-accent">
                    Recommended
                  </span>
                  <p className="mt-3 font-display text-lg font-semibold text-text">Practice quiz</p>
                  <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                    Answer each question, then check if you got it. No timer — go at your own pace.
                  </p>
                  <Button onClick={startTestMode} size="lg" className="mt-4 w-full sm:w-auto">
                    Start practicing
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Other ways to practice */}
                <div className="space-y-2">
                  <p className="text-[11px] font-bold uppercase tracking-[0.16em] text-text-secondary">
                    Other ways to practice
                  </p>
                  <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
                    <Button onClick={startStudyMode} variant="secondary" className="w-full sm:w-auto">
                      <BookOpenCheck className="h-4 w-4" />
                      Step-by-step with hints
                    </Button>
                    <Button onClick={startTimedMode} variant="secondary" className="w-full sm:w-auto">
                      <Timer className="h-4 w-4" />
                      Timed quiz
                    </Button>
                  </div>
                </div>
              </div>
            )}

            <p className="text-[12px] text-text-secondary">
              This quiz has <span className="font-mono font-bold text-text">{lengthLabel}</span>{" "}
              question{settings.questionCount === 1 ? "" : "s"}.
            </p>
          </section>
        )}

        {/* Helpful note */}
        <div className="rounded-[1.1rem] border border-borderc bg-soft px-4 py-3 text-[12.5px] text-text-secondary">
          {quiz.courseId === "differential-equations"
            ? "Heads up: these are write-it-out questions, with step-by-step hints and a self-check."
            : "Tip: you can switch how you study anytime — your settings carry over."}
        </div>

        {/*
         * Premium soft-lock — driven by the centralized access model.
         * Hidden when:
         *   - the user is on a section-managed flow (institution grading)
         *   - the user is premium / institution-covered / a professor
         *   - this is a homework set (homework has its own flow)
         */}
        {!access.messaging.hidePremiumPrompts && setMode !== "homework" ? (
          <PremiumUnlockNote
            description="A few extras that make studying easier. If your school covers access, you get all of this automatically."
            bullets={[
              "Remembers the questions you miss",
              "Tells you what to study next",
              "Shows your progress and an exam-ready score",
              "Extra hints and step-by-step answers"
            ]}
            ctaHref="/contact?intent=implementation"
            ctaLabel="Talk to us about your class"
          />
        ) : null}

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
              /*
               * Default: explanation visible (the whole point of the
               * review screen is to read the answer). But we read from
               * the same `showExplanation` map the main quiz uses, so
               * the user can toggle it off if they want to test
               * themselves on the question first.
               *
               * Previously this prop was hardcoded to `true` and the
               * onToggle handler was a no-op — clicking "Hide
               * explanation" did nothing. Now it's a real flip-flop.
               */
              showExplanation={showExplanation[reviewQuestion.id] !== false}
              onToggleExplanation={() =>
                setShowExplanation((prev) => ({
                  ...prev,
                  // First click sets to false (hide); second click
                  // flips back to true. Default-undefined → true.
                  [reviewQuestion.id]: prev[reviewQuestion.id] === false ? true : false
                }))
              }
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
      ? !hideLiveExamFeedback && selfMarkedByQuestion[currentQuestion.id] === undefined
      : false;
  const canMoveForward =
    assignmentSubmissionLocked
      ? true
      : currentQuestion && requiresSelfMark(currentQuestion)
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

      {assignmentSubmissionLocked ? (
        <div className="rounded-xl border border-danger/35 bg-danger/10 px-4 py-3 text-sm text-text">
          This assignment is past due. You are in read-only mode and cannot submit answers or finish this attempt for grading.
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
            ? `Step-by-step • ${minutesSeconds(timeSpent)} elapsed`
            : attemptMode === "exam"
              ? guidedExamSimulation
                ? settings.timed
                  ? `Guided exam • ${minutesSeconds(timeLeft)} left`
                  : `Guided exam • ${minutesSeconds(timeSpent)} elapsed`
                : settings.timed
                  ? `Practice exam • ${minutesSeconds(timeLeft)} left`
                  : `Practice exam • ${minutesSeconds(timeSpent)} elapsed`
              : settings.timed
              ? `Timed quiz • ${minutesSeconds(timeLeft)} left`
              : `Practice quiz • ${minutesSeconds(timeSpent)} elapsed`}
        </div>
      </div>

      <div className="grid gap-4 xl:grid-cols-[210px_1fr_270px]">
        <QuestionNavigator
          total={order.length}
          currentIndex={currentIndex}
          ids={order}
          answered={answeredSet}
          correctness={hideLiveExamFeedback ? new Map() : new Map(Object.entries(correctByQuestion))}
          onJump={setCurrentIndex}
        />

        <div className="space-y-3">
          {currentQuestion ? (() => {
            /*
             * Compute the explanation visibility ONCE so the rendered
             * value and the toggle handler agree.
             *
             * Previously this read `immediateReviewMode ? true : Boolean(...)`
             * which hardcoded `true` in study/walkthrough mode, ignoring
             * the toggle state entirely. The user clicking "Hide
             * explanation" updated the state map but the next render
             * forced it back to true. Result: the button felt dead.
             *
             * Now: in study mode the default is "visible" (key === undefined
             * means visible), but a user-set `false` is respected. In other
             * modes the default is "hidden" (must explicitly show first).
             * The toggle flips relative to what's CURRENTLY visible, so
             * clicking always changes the displayed state.
             */
            const explanationVisible = immediateReviewMode
              ? showExplanation[currentQuestion.id] !== false
              : Boolean(showExplanation[currentQuestion.id]);

            return (
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
                lockInteraction={assignmentSubmissionLocked || Boolean(submittedByQuestion[currentQuestion.id])}
                disableSelfMark={hideLiveExamFeedback}
                studyMode={immediateReviewMode}
                showHintsBeforeSubmit={immediateReviewMode}
                showExplanation={explanationVisible}
                revealCorrectness={!hideLiveExamFeedback}
                interactionNotice={
                  assignmentSubmissionLocked
                    ? "This assignment is past due. Review the question content, but submissions are locked."
                    : undefined
                }
                onToggleExplanation={() =>
                  setShowExplanation((prev) => ({
                    ...prev,
                    // Flip relative to what's currently visible — not from
                    // the raw map value, which may be undefined while the
                    // visible default is true.
                    [currentQuestion.id]: !explanationVisible
                  }))
                }
              />
            );
          })() : null}

          <div className="flex items-center justify-between rounded-xl border border-borderc bg-surface px-4 py-3">
            <Button variant="secondary" onClick={gotoPrev} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {currentIndex === order.length - 1 ? (
              assignmentSubmissionLocked ? (
                <Button onClick={() => setStage("overview")}>Back to assignment overview</Button>
              ) : (
                <Button onClick={finalizeAttempt} disabled={!canMoveForward}>
                  Finish Quiz
                </Button>
              )
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
          scorePreview={hideLiveExamFeedback ? undefined : scorePreview}
        />
      </div>
    </div>
  );
}
