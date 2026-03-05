"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, Flag, Lightbulb, RotateCcw } from "lucide-react";
import { getCourse, getQuizSet } from "@/data/seed";
import { fetchPublishedStudySet } from "@/features/study/study-set-source";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import {
  countMissed,
  gradeQuestion,
  isOpenResponseQuestion,
  requiresSelfMark,
  summarizeAttempt
} from "@/features/quiz/engine";
import { useAppData } from "@/lib/app-data-context";
import { useToast } from "@/lib/hooks/use-toast";
import { resolveQuizSetMode } from "@/lib/study/set-mode";
import { cn, percentile } from "@/lib/utils";
import type { Attempt, QuizSet } from "@/lib/types";

interface HomeworkProgressSnapshot {
  order: string[];
  currentIndex: number;
  selectedByQuestion: Record<string, number[]>;
  responseByQuestion: Record<string, string>;
  stepInputByQuestion: Record<string, string[]>;
  stepDraftByQuestion: Record<string, string>;
  selfMarkedByQuestion: Record<string, boolean | undefined>;
  submittedByQuestion: Record<string, boolean>;
  correctByQuestion: Record<string, boolean>;
  flaggedIds: string[];
  revealedHintCount: Record<string, number>;
  revealedWalkthroughCount: Record<string, number>;
  showFullSolutionByQuestion: Record<string, boolean>;
  timeSpent: number;
  startedAt: string;
}

interface DraftAttemptRow {
  id: string;
  settings: Record<string, unknown> | null;
  time_spent_seconds: number;
}

const GUEST_HOMEWORK_KEY = "ue.homework.progress.v1";

function withPrefix(routePrefix: string, path: string) {
  return `${routePrefix}${path}`;
}

function readGuestProgress(setId: string): HomeworkProgressSnapshot | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(GUEST_HOMEWORK_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as Record<string, HomeworkProgressSnapshot>;
    return parsed[setId] ?? null;
  } catch {
    return null;
  }
}

function writeGuestProgress(setId: string, snapshot: HomeworkProgressSnapshot) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(GUEST_HOMEWORK_KEY);
    const parsed = raw ? (JSON.parse(raw) as Record<string, HomeworkProgressSnapshot>) : {};
    parsed[setId] = snapshot;
    window.localStorage.setItem(GUEST_HOMEWORK_KEY, JSON.stringify(parsed));
  } catch {
    // noop
  }
}

function clearGuestProgress(setId: string) {
  if (typeof window === "undefined") return;
  try {
    const raw = window.localStorage.getItem(GUEST_HOMEWORK_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as Record<string, HomeworkProgressSnapshot>;
    delete parsed[setId];
    window.localStorage.setItem(GUEST_HOMEWORK_KEY, JSON.stringify(parsed));
  } catch {
    // noop
  }
}

async function loadHomeworkDraft({
  supabase,
  userId,
  setId
}: {
  supabase: NonNullable<ReturnType<typeof useAppData>["supabase"]>;
  userId: string;
  setId: string;
}) {
  const { data, error } = await supabase
    .from("attempts")
    .select("id, settings, time_spent_seconds")
    .eq("user_id", userId)
    .eq("quiz_set_id", setId)
    .is("completed_at", null)
    .eq("settings->>mode", "homework")
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !data) return null;
  return data as DraftAttemptRow;
}

async function upsertHomeworkDraft({
  supabase,
  userId,
  setId,
  courseId,
  totalCount,
  draftAttemptId,
  snapshot
}: {
  supabase: NonNullable<ReturnType<typeof useAppData>["supabase"]>;
  userId: string;
  setId: string;
  courseId: string;
  totalCount: number;
  draftAttemptId: string | null;
  snapshot: HomeworkProgressSnapshot;
}) {
  const settings = {
    mode: "homework",
    course_id: courseId,
    homework_progress: {
      current_index: snapshot.currentIndex,
      answered_ids: Object.keys(snapshot.submittedByQuestion).filter((id) => snapshot.submittedByQuestion[id]),
      flagged_ids: snapshot.flaggedIds
    },
    homework_state: snapshot
  };

  if (draftAttemptId) {
    const { error } = await supabase
      .from("attempts")
      .update({
        settings,
        time_spent_seconds: snapshot.timeSpent
      })
      .eq("id", draftAttemptId)
      .eq("user_id", userId);

    if (!error) return draftAttemptId;
  }

  const { data, error } = await supabase
    .from("attempts")
    .insert({
      user_id: userId,
      quiz_set_id: setId,
      started_at: snapshot.startedAt,
      completed_at: null,
      score: 0,
      correct_count: 0,
      total_count: totalCount,
      time_spent_seconds: snapshot.timeSpent,
      settings
    })
    .select("id")
    .single();

  if (error || !data) return null;
  return data.id as string;
}

async function clearHomeworkDraft({
  supabase,
  userId,
  draftAttemptId
}: {
  supabase: NonNullable<ReturnType<typeof useAppData>["supabase"]>;
  userId: string;
  draftAttemptId: string;
}) {
  await supabase.from("attempts").delete().eq("id", draftAttemptId).eq("user_id", userId);
}

function summarizeWeakTopics(attempt: Attempt) {
  return Object.entries(attempt.topicBreakdown)
    .map(([tag, stats]) => ({
      tag,
      score: stats.total > 0 ? Math.round((stats.correct / stats.total) * 100) : 0
    }))
    .sort((a, b) => a.score - b.score)
    .slice(0, 5);
}

const STEP_STOP_WORDS = new Set([
  "the",
  "and",
  "for",
  "with",
  "that",
  "this",
  "then",
  "from",
  "into",
  "using",
  "have",
  "has",
  "where",
  "when",
  "after",
  "before",
  "there",
  "their",
  "your",
  "you",
  "are",
  "was",
  "were",
  "but",
  "all",
  "any",
  "let",
  "set",
  "get",
  "our",
  "out",
  "one",
  "two",
  "three"
]);

function getStepKeywords(value: string) {
  const tokens = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .split(" ")
    .map((token) => token.trim())
    .filter((token) => token.length >= 3 && !STEP_STOP_WORDS.has(token));
  return [...new Set(tokens)].slice(0, 8);
}

function evaluateStepMatch(studentStep: string, expectedStep: string | undefined) {
  if (!expectedStep) {
    return {
      status: "extra" as const,
      matchedCount: 0,
      neededCount: 0
    };
  }

  const expectedKeywords = getStepKeywords(expectedStep);
  if (expectedKeywords.length === 0) {
    return {
      status: "on-track" as const,
      matchedCount: 0,
      neededCount: 0
    };
  }

  const studentKeywords = new Set(getStepKeywords(studentStep));
  const matchedCount = expectedKeywords.filter((keyword) => studentKeywords.has(keyword)).length;
  const neededCount = Math.min(2, expectedKeywords.length);

  return {
    status: matchedCount >= neededCount ? ("on-track" as const) : ("review" as const),
    matchedCount,
    neededCount
  };
}

export function HomeworkExperiencePageContent({
  setId,
  routePrefix
}: {
  setId: string;
  routePrefix: string;
}) {
  const searchParams = useSearchParams();
  const sectionParam = searchParams.get("section")?.trim() || "";
  const { attempts, saveAttempt, isAuthenticated, user, supabase } = useAppData();
  const { push } = useToast();

  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [loading, setLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedByQuestion, setSelectedByQuestion] = useState<Record<string, number[]>>({});
  const [responseByQuestion, setResponseByQuestion] = useState<Record<string, string>>({});
  const [stepInputByQuestion, setStepInputByQuestion] = useState<Record<string, string[]>>({});
  const [stepDraftByQuestion, setStepDraftByQuestion] = useState<Record<string, string>>({});
  const [selfMarkedByQuestion, setSelfMarkedByQuestion] = useState<Record<string, boolean | undefined>>({});
  const [submittedByQuestion, setSubmittedByQuestion] = useState<Record<string, boolean>>({});
  const [correctByQuestion, setCorrectByQuestion] = useState<Record<string, boolean>>({});
  const [flaggedIds, setFlaggedIds] = useState<string[]>([]);
  const [revealedHintCount, setRevealedHintCount] = useState<Record<string, number>>({});
  const [revealedWalkthroughCount, setRevealedWalkthroughCount] = useState<Record<string, number>>({});
  const [showFullSolutionByQuestion, setShowFullSolutionByQuestion] = useState<Record<string, boolean>>({});
  const [timeSpent, setTimeSpent] = useState(0);
  const [startedAt, setStartedAt] = useState(() => new Date().toISOString());
  const [result, setResult] = useState<Attempt | null>(null);
  const [draftAttemptId, setDraftAttemptId] = useState<string | null>(null);
  const hydratedRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoading(true);
    const sectionId = sectionParam || undefined;

    fetchPublishedStudySet(setId, { sectionId })
      .then((found) => {
        if (!active) return;
        setQuiz(found ?? getQuizSet(setId) ?? null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [sectionParam, setId]);

  const course = quiz ? getCourse(quiz.courseId) : null;
  const setMode = quiz ? resolveQuizSetMode(quiz) : "homework";
  const order = useMemo(() => (quiz ? quiz.questions.map((question) => question.id) : []), [quiz]);
  const questionMap = useMemo(
    () => new Map((quiz?.questions ?? []).map((question) => [question.id, question])),
    [quiz]
  );
  const currentQuestionId = order[currentIndex];
  const currentQuestion = currentQuestionId ? questionMap.get(currentQuestionId) : undefined;
  const completedCount = useMemo(
    () => Object.values(submittedByQuestion).filter(Boolean).length,
    [submittedByQuestion]
  );
  const flaggedSet = useMemo(() => new Set(flaggedIds), [flaggedIds]);

  useEffect(() => {
    if (loading) return;
    if (!quiz) return;
    if (hydratedRef.current) return;
    hydratedRef.current = true;

    const hydrate = async () => {
      if (isAuthenticated && supabase && user) {
        const draft = await loadHomeworkDraft({ supabase, userId: user.id, setId });
        if (draft?.settings && typeof draft.settings === "object") {
          const settings = draft.settings as Record<string, unknown>;
          const state = settings.homework_state as HomeworkProgressSnapshot | undefined;
          if (state) {
            setCurrentIndex(Math.min(state.currentIndex ?? 0, Math.max(order.length - 1, 0)));
            setSelectedByQuestion(state.selectedByQuestion ?? {});
            setResponseByQuestion(state.responseByQuestion ?? {});
            setStepInputByQuestion(state.stepInputByQuestion ?? {});
            setStepDraftByQuestion(state.stepDraftByQuestion ?? {});
            setSelfMarkedByQuestion(state.selfMarkedByQuestion ?? {});
            setSubmittedByQuestion(state.submittedByQuestion ?? {});
            setCorrectByQuestion(state.correctByQuestion ?? {});
            setFlaggedIds(state.flaggedIds ?? []);
            setRevealedHintCount(state.revealedHintCount ?? {});
            setRevealedWalkthroughCount(state.revealedWalkthroughCount ?? {});
            setShowFullSolutionByQuestion(state.showFullSolutionByQuestion ?? {});
            setTimeSpent(Number(state.timeSpent ?? draft.time_spent_seconds ?? 0));
            setStartedAt(state.startedAt ?? new Date().toISOString());
            setDraftAttemptId(draft.id);
            return;
          }
        }
      }

      const guestState = readGuestProgress(setId);
      if (guestState) {
        setCurrentIndex(Math.min(guestState.currentIndex ?? 0, Math.max(order.length - 1, 0)));
        setSelectedByQuestion(guestState.selectedByQuestion ?? {});
        setResponseByQuestion(guestState.responseByQuestion ?? {});
        setStepInputByQuestion(guestState.stepInputByQuestion ?? {});
        setStepDraftByQuestion(guestState.stepDraftByQuestion ?? {});
        setSelfMarkedByQuestion(guestState.selfMarkedByQuestion ?? {});
        setSubmittedByQuestion(guestState.submittedByQuestion ?? {});
        setCorrectByQuestion(guestState.correctByQuestion ?? {});
        setFlaggedIds(guestState.flaggedIds ?? []);
        setRevealedHintCount(guestState.revealedHintCount ?? {});
        setRevealedWalkthroughCount(guestState.revealedWalkthroughCount ?? {});
        setShowFullSolutionByQuestion(guestState.showFullSolutionByQuestion ?? {});
        setTimeSpent(guestState.timeSpent ?? 0);
        setStartedAt(guestState.startedAt ?? new Date().toISOString());
      }
    };

    hydrate().catch(() => {
      // noop
    });
  }, [isAuthenticated, loading, order.length, quiz, setId, supabase, user]);

  useEffect(() => {
    if (result) return;
    const timer = window.setInterval(() => {
      setTimeSpent((prev) => prev + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, [result]);

  useEffect(() => {
    if (!quiz || result) return;

    const snapshot: HomeworkProgressSnapshot = {
      order,
      currentIndex,
      selectedByQuestion,
      responseByQuestion,
      stepInputByQuestion,
      stepDraftByQuestion,
      selfMarkedByQuestion,
      submittedByQuestion,
      correctByQuestion,
      flaggedIds,
      revealedHintCount,
      revealedWalkthroughCount,
      showFullSolutionByQuestion,
      timeSpent,
      startedAt
    };

    if (!isAuthenticated || !supabase || !user) {
      writeGuestProgress(setId, snapshot);
      return;
    }

    const timeout = window.setTimeout(async () => {
      const nextDraftId = await upsertHomeworkDraft({
        supabase,
        userId: user.id,
        setId,
        courseId: quiz.courseId,
        totalCount: order.length,
        draftAttemptId,
        snapshot
      });
      setDraftAttemptId(nextDraftId);
    }, 350);

    return () => window.clearTimeout(timeout);
  }, [
    correctByQuestion,
    currentIndex,
    draftAttemptId,
    flaggedIds,
    isAuthenticated,
    order,
    quiz,
    responseByQuestion,
    stepDraftByQuestion,
    stepInputByQuestion,
    result,
    revealedHintCount,
    revealedWalkthroughCount,
    selectedByQuestion,
    selfMarkedByQuestion,
    setId,
    showFullSolutionByQuestion,
    startedAt,
    submittedByQuestion,
    supabase,
    timeSpent,
    user
  ]);

  const latestAttempt = useMemo(() => {
    if (!quiz) return null;
    return attempts
      .filter((attempt) => attempt.quizId === quiz.id)
      .sort((a, b) => +new Date(b.date) - +new Date(a.date))[0] ?? null;
  }, [attempts, quiz]);

  const toggleOption = (optionIndex: number) => {
    if (!currentQuestion || isOpenResponseQuestion(currentQuestion)) return;
    if (submittedByQuestion[currentQuestion.id]) return;

    setSelectedByQuestion((prev) => {
      const existing = prev[currentQuestion.id] ?? [];
      if (currentQuestion.type === "single") {
        return { ...prev, [currentQuestion.id]: [optionIndex] };
      }
      return {
        ...prev,
        [currentQuestion.id]: existing.includes(optionIndex)
          ? existing.filter((value) => value !== optionIndex)
          : [...existing, optionIndex]
      };
    });
  };

  const submitCurrent = () => {
    if (!currentQuestion) return;
    if (submittedByQuestion[currentQuestion.id]) return;

    if (isOpenResponseQuestion(currentQuestion)) {
      const response = (responseByQuestion[currentQuestion.id] ?? "").trim();
      if (!response) {
        push({ title: "Write your solution first", description: "Show your work before submitting." });
        return;
      }
      setSubmittedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: true }));
      if (!requiresSelfMark(currentQuestion)) {
        const isCorrect = gradeQuestion(currentQuestion, [], response);
        setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
      }
      setShowFullSolutionByQuestion((prev) => ({ ...prev, [currentQuestion.id]: true }));
      return;
    }

    const selected = selectedByQuestion[currentQuestion.id] ?? [];
    if (selected.length === 0) {
      push({ title: "Select an answer first", description: "Choose at least one option." });
      return;
    }

    const isCorrect = gradeQuestion(currentQuestion, selected);
    setSubmittedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: true }));
    setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: isCorrect }));
  };

  const revealHint = () => {
    if (!currentQuestion) return;
    const hints = currentQuestion.hintSteps ?? currentQuestion.walkthroughSteps ?? [];
    if (hints.length === 0) return;
    setRevealedHintCount((prev) => ({
      ...prev,
      [currentQuestion.id]: Math.min(hints.length, (prev[currentQuestion.id] ?? 0) + 1)
    }));
  };

  const hideHint = () => {
    if (!currentQuestion) return;
    setRevealedHintCount((prev) => ({
      ...prev,
      [currentQuestion.id]: Math.max(0, (prev[currentQuestion.id] ?? 0) - 1)
    }));
  };

  const hideAllHints = () => {
    if (!currentQuestion) return;
    setRevealedHintCount((prev) => ({
      ...prev,
      [currentQuestion.id]: 0
    }));
  };

  const revealWalkthroughStep = () => {
    if (!currentQuestion) return;
    const steps = currentQuestion.walkthroughSteps ?? [];
    if (steps.length === 0) return;
    setRevealedWalkthroughCount((prev) => ({
      ...prev,
      [currentQuestion.id]: Math.min(steps.length, (prev[currentQuestion.id] ?? 0) + 1)
    }));
  };

  const hideWalkthroughStep = () => {
    if (!currentQuestion) return;
    setRevealedWalkthroughCount((prev) => ({
      ...prev,
      [currentQuestion.id]: Math.max(0, (prev[currentQuestion.id] ?? 0) - 1)
    }));
  };

  const hideAllWalkthroughSteps = () => {
    if (!currentQuestion) return;
    setRevealedWalkthroughCount((prev) => ({
      ...prev,
      [currentQuestion.id]: 0
    }));
  };

  const addStudyStep = () => {
    if (!currentQuestion) return;
    const nextValue = (stepDraftByQuestion[currentQuestion.id] ?? "").trim();
    if (!nextValue) return;

    setStepInputByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: [...(prev[currentQuestion.id] ?? []), nextValue]
    }));
    setStepDraftByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: ""
    }));
  };

  const removeStudyStep = (stepIndex: number) => {
    if (!currentQuestion) return;
    setStepInputByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: (prev[currentQuestion.id] ?? []).filter((_, idx) => idx !== stepIndex)
    }));
  };

  const clearStudySteps = () => {
    if (!currentQuestion) return;
    setStepInputByQuestion((prev) => ({
      ...prev,
      [currentQuestion.id]: []
    }));
  };

  const toggleFlag = () => {
    if (!currentQuestion) return;
    setFlaggedIds((prev) =>
      prev.includes(currentQuestion.id)
        ? prev.filter((id) => id !== currentQuestion.id)
        : [...prev, currentQuestion.id]
    );
  };

  const resetCurrent = () => {
    if (!currentQuestion) return;
    setSubmittedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: false }));
    setCorrectByQuestion((prev) => ({ ...prev, [currentQuestion.id]: false }));
    setSelfMarkedByQuestion((prev) => ({ ...prev, [currentQuestion.id]: undefined }));
  };

  const finishHomework = async () => {
    if (!quiz) return;
    const attempt = summarizeAttempt({
      quiz,
      selectedByQuestion,
      freeResponseByQuestion: responseByQuestion,
      selfMarkedByQuestion,
      order,
      timeSpentSeconds: timeSpent
    });
    attempt.mode = "homework";
    attempt.status = "completed";
    await saveAttempt(attempt);
    setResult(attempt);

    if (isAuthenticated && supabase && user && draftAttemptId) {
      await clearHomeworkDraft({ supabase, userId: user.id, draftAttemptId });
    } else {
      clearGuestProgress(setId);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading homework set…</CardBody>
      </Card>
    );
  }

  if (!quiz || !course || setMode !== "homework") {
    return (
      <Card>
        <CardBody className="space-y-4 p-8 text-center">
          <p className="font-display text-2xl font-semibold text-text">Homework set unavailable</p>
          <p className="text-sm text-muted">This set is not configured for Homework Mode.</p>
          <Button asChild>
            <Link href={withPrefix(routePrefix, "/courses")}>Back to courses</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  const coursePath = withPrefix(routePrefix, `/courses/${course.id}`);
  const quizPath = withPrefix(routePrefix, `/homework/${quiz.id}`);
  const signInPath = `/login?next=${encodeURIComponent(quizPath)}`;
  const signUpPath = `/signup?next=${encodeURIComponent(quizPath)}`;

  if (result) {
    const weakTopics = summarizeWeakTopics(result);
    return (
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-4 p-6 md:p-8">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Homework complete</p>
            <h1 className="font-display text-4xl font-semibold">{result.score}%</h1>
            <p className="text-sm text-muted">
              {result.correctCount} of {result.totalCount} marked correct • {Math.round(result.timeSpent / 60)} min •{" "}
              {percentile(result.score)}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => {
                setResult(null);
                setCurrentIndex(0);
                setSelectedByQuestion({});
                setResponseByQuestion({});
                setStepInputByQuestion({});
                setStepDraftByQuestion({});
                setSelfMarkedByQuestion({});
                setSubmittedByQuestion({});
                setCorrectByQuestion({});
                setFlaggedIds([]);
                setRevealedHintCount({});
                setRevealedWalkthroughCount({});
                setShowFullSolutionByQuestion({});
                setTimeSpent(0);
                setStartedAt(new Date().toISOString());
                setDraftAttemptId(null);
              }}>
                <RotateCcw className="h-4 w-4" />
                Restart Homework
              </Button>
              <Button variant="secondary" asChild>
                <Link href={coursePath}>Back to Course</Link>
              </Button>
            </div>
          </CardBody>
        </Card>

        <Card>
          <CardHeader>
            <h2 className="font-display text-xl font-semibold">Weak topics to revisit</h2>
          </CardHeader>
          <CardBody className="space-y-2">
            {weakTopics.length === 0 ? (
              <p className="text-sm text-muted">No weak-topic signal yet. Great consistency.</p>
            ) : (
              weakTopics.map((item) => (
                <div key={item.tag} className="flex items-center justify-between rounded-xl border border-borderc bg-soft px-3 py-2">
                  <span className="text-sm text-text">{item.tag}</span>
                  <span className="font-mono text-sm text-muted">{item.score}%</span>
                </div>
              ))
            )}
          </CardBody>
        </Card>

        {!isAuthenticated ? (
          <Card>
            <CardBody className="space-y-4 p-6">
              <h2 className="font-display text-2xl font-semibold">Don&apos;t lose this homework run.</h2>
              <ul className="space-y-2 text-sm text-muted">
                <li>• Save progress and resume across devices</li>
                <li>• Track mastery and weak topics over time</li>
                <li>• Keep streaks and leaderboard points</li>
              </ul>
              <div className="flex flex-wrap gap-2">
                <Button asChild>
                  <Link href={signUpPath}>Create account & save this attempt</Link>
                </Button>
                <Button variant="secondary" asChild>
                  <Link href={signInPath}>Sign in to save</Link>
                </Button>
                <Button variant="ghost" asChild>
                  <Link href={coursePath}>Continue as guest</Link>
                </Button>
              </div>
            </CardBody>
          </Card>
        ) : null}
      </div>
    );
  }

  const hints = currentQuestion?.hintSteps ?? currentQuestion?.walkthroughSteps ?? [];
  const shownHints = currentQuestion ? (revealedHintCount[currentQuestion.id] ?? 0) : 0;
  const displayedHints = hints.slice(0, shownHints);
  const walkthroughSteps = currentQuestion?.walkthroughSteps ?? [];
  const shownWalkthroughSteps = currentQuestion ? (revealedWalkthroughCount[currentQuestion.id] ?? 0) : 0;
  const displayedWalkthroughSteps = walkthroughSteps.slice(0, shownWalkthroughSteps);
  const showFullSolution = currentQuestion ? Boolean(showFullSolutionByQuestion[currentQuestion.id]) : false;
  const questionSubmitted = currentQuestion ? Boolean(submittedByQuestion[currentQuestion.id]) : false;
  const pendingSelfMark =
    currentQuestion && requiresSelfMark(currentQuestion) && questionSubmitted
      ? selfMarkedByQuestion[currentQuestion.id] === undefined
      : false;

  const canAdvance = currentQuestion
    ? requiresSelfMark(currentQuestion)
      ? questionSubmitted && !pendingSelfMark
      : questionSubmitted
    : false;

  const isLast = currentIndex === order.length - 1;
  const isDifferentialEquations = quiz.courseId === "differential-equations";
  const studentStepDraft = currentQuestion ? (stepDraftByQuestion[currentQuestion.id] ?? "") : "";
  const studentSteps = currentQuestion ? (stepInputByQuestion[currentQuestion.id] ?? []) : [];
  const stepChecks = studentSteps.map((step, index) => ({
    step,
    review: evaluateStepMatch(step, walkthroughSteps[index]),
    expected: walkthroughSteps[index]
  }));

  return (
    <div className="space-y-5">
      <Link href={coursePath} className="inline-flex items-center gap-2 text-sm font-semibold text-muted hover:text-text">
        <ArrowLeft className="h-4 w-4" />
        Back to {course.code}
      </Link>

      {!isAuthenticated ? (
        <div className="rounded-xl border border-brand-2/35 bg-brand-2/10 px-4 py-3 text-sm text-text">
          Guest mode: homework progress is saved only on this device.
          <span className="ml-2 inline-flex gap-2">
            <Link href={signUpPath} className="font-semibold text-accent hover:text-text">
              Create account
            </Link>
            <span className="text-muted">to sync progress.</span>
          </span>
        </div>
      ) : (
        <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-xs text-muted">
          Draft auto-save is enabled for resume from dashboard.
        </div>
      )}

      <div className="grid gap-4 xl:grid-cols-[220px_1fr]">
        <Card>
          <CardBody className="space-y-4 p-4">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">Progress</p>
            <p className="font-display text-2xl font-semibold text-text">
              {currentIndex + 1} of {order.length}
            </p>
            <p className="text-xs text-muted">
              Submitted {completedCount}/{order.length} • Flagged {flaggedIds.length}
            </p>
            <div className="grid grid-cols-5 gap-2">
              {order.map((id, idx) => {
                const submitted = Boolean(submittedByQuestion[id]);
                const flagged = flaggedSet.has(id);
                return (
                  <button
                    key={id}
                    type="button"
                    onClick={() => setCurrentIndex(idx)}
                    className={cn(
                      "h-9 rounded-lg border text-xs font-semibold transition",
                      idx === currentIndex && "border-brand-2/60 bg-brand-2/15 text-brand-2",
                      idx !== currentIndex && "border-borderc bg-surface text-muted hover:border-brand-2/40",
                      submitted && "border-success/50 text-success",
                      flagged && "border-warn/60 text-warn"
                    )}
                  >
                    {idx + 1}
                  </button>
                );
              })}
            </div>
            {latestAttempt ? (
              <div className="rounded-xl border border-borderc bg-surface p-3 text-xs text-muted">
                Last score: <span className="font-mono text-text">{latestAttempt.score}%</span>
              </div>
            ) : null}
          </CardBody>
        </Card>

        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-5 p-6">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <Badge tone="success">Homework</Badge>
                <button
                  type="button"
                  onClick={toggleFlag}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-lg border px-2.5 py-1 text-xs",
                    flaggedSet.has(currentQuestionId)
                      ? "border-warn/60 bg-warn/10 text-warn"
                      : "border-borderc bg-soft text-muted"
                  )}
                >
                  <Flag className="h-3.5 w-3.5" />
                  {flaggedSet.has(currentQuestionId) ? "Flagged" : "Flag"}
                </button>
              </div>

              {currentQuestion ? (
                <>
                  <div className="space-y-3">
                    <Markdown content={currentQuestion.prompt} className="quiz-question-prompt" promoteMathInInlineCode />
                    {isOpenResponseQuestion(currentQuestion) ? (
                      <textarea
                        value={responseByQuestion[currentQuestion.id] ?? ""}
                        onChange={(event) =>
                          setResponseByQuestion((prev) => ({
                            ...prev,
                            [currentQuestion.id]: event.target.value
                          }))
                        }
                        placeholder={
                          currentQuestion.type === "fill"
                            ? "Enter a short response."
                            : "Show your full work, not just the final answer."
                        }
                        disabled={questionSubmitted}
                        className={cn(
                          "w-full rounded-xl border border-borderc bg-soft p-4 font-mono text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                          currentQuestion.type === "fill" ? "min-h-24" : "min-h-40"
                        )}
                      />
                    ) : (
                      <div className="space-y-2">
                        {(currentQuestion.options ?? []).map((option, optionIndex) => {
                          const selected = (selectedByQuestion[currentQuestion.id] ?? []).includes(optionIndex);
                          const isCorrect = (currentQuestion.correct ?? []).includes(optionIndex);
                          const optionState = questionSubmitted
                            ? selected && isCorrect
                              ? "ok"
                              : selected && !isCorrect
                                ? "bad"
                                : !selected && isCorrect
                                  ? "missed"
                                  : "default"
                            : selected
                              ? "selected"
                              : "default";

                          return (
                            <button
                              key={`${currentQuestion.id}-${optionIndex}`}
                              type="button"
                              onClick={() => toggleOption(optionIndex)}
                              disabled={questionSubmitted}
                              className={cn(
                                "w-full rounded-xl border px-3 py-2 text-left text-sm",
                                optionState === "selected" && "border-brand-2/50 bg-brand-2/10 text-text",
                                optionState === "ok" && "border-success/45 bg-success/15 text-text",
                                optionState === "bad" && "border-danger/45 bg-danger/15 text-text",
                                optionState === "missed" && "border-warn/45 bg-warn/15 text-text",
                                optionState === "default" && "border-borderc bg-soft text-text"
                              )}
                            >
                              <Markdown content={option} promoteMathInInlineCode />
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {isDifferentialEquations && isOpenResponseQuestion(currentQuestion) ? (
                    <div className="space-y-3 rounded-xl border border-brand-2/30 bg-brand-2/10 p-4">
                      <div className="space-y-1">
                        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-2">
                          Step-by-step check (optional)
                        </p>
                        <p className="text-xs text-text-secondary">
                          Add one step at a time and we&apos;ll compare it with the official walkthrough sequence.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <textarea
                          value={studentStepDraft}
                          onChange={(event) =>
                            setStepDraftByQuestion((prev) => ({
                              ...prev,
                              [currentQuestion.id]: event.target.value
                            }))
                          }
                          placeholder="Example: Characteristic equation r^2 + r - 2 = 0 gives roots r=1,-2."
                          className="min-h-20 w-full rounded-lg border border-borderc bg-surface p-3 font-mono text-sm text-text outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
                        />
                        <div className="flex flex-wrap gap-2">
                          <Button variant="secondary" onClick={addStudyStep} disabled={studentStepDraft.trim().length === 0}>
                            Add step
                          </Button>
                          <Button variant="ghost" onClick={clearStudySteps} disabled={studentSteps.length === 0}>
                            Clear steps
                          </Button>
                        </div>
                      </div>

                      {stepChecks.length > 0 ? (
                        <ol className="space-y-2">
                          {stepChecks.map((entry, idx) => (
                            <li key={`${currentQuestion.id}-typed-step-${idx}`} className="rounded-lg border border-borderc bg-surface p-3">
                              <div className="flex flex-wrap items-center justify-between gap-2">
                                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                                  Your step {idx + 1}
                                </p>
                                {entry.review.status === "on-track" ? (
                                  <span className="rounded-full border border-success/50 bg-success/10 px-2 py-0.5 text-[11px] font-semibold text-success">
                                    On track
                                  </span>
                                ) : entry.review.status === "review" ? (
                                  <span className="rounded-full border border-warn/50 bg-warn/10 px-2 py-0.5 text-[11px] font-semibold text-warn">
                                    Review this step
                                  </span>
                                ) : (
                                  <span className="rounded-full border border-brand-2/50 bg-brand-2/10 px-2 py-0.5 text-[11px] font-semibold text-brand-2">
                                    Extra practice step
                                  </span>
                                )}
                              </div>
                              <div className="mt-2 text-sm text-text">
                                <Markdown content={entry.step} promoteMathInInlineCode />
                              </div>
                              {entry.review.status === "review" && entry.expected ? (
                                <p className="mt-2 text-xs text-text-secondary">
                                  Expected focus for step {idx + 1}: {entry.expected}
                                </p>
                              ) : null}
                              <div className="mt-2 flex justify-end">
                                <Button variant="ghost" onClick={() => removeStudyStep(idx)}>
                                  Remove
                                </Button>
                              </div>
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  ) : null}

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={revealHint} disabled={shownHints >= hints.length || hints.length === 0}>
                      <Lightbulb className="h-4 w-4" />
                      {hints.length === 0 ? "No hints" : shownHints >= hints.length ? "All hints shown" : "Show hint"}
                    </Button>
                    <Button variant="ghost" onClick={hideHint} disabled={shownHints <= 0}>
                      Hide hint
                    </Button>
                    <Button variant="ghost" onClick={hideAllHints} disabled={shownHints <= 0}>
                      Hide all hints
                    </Button>
                    <Button
                      variant="secondary"
                      onClick={revealWalkthroughStep}
                      disabled={shownWalkthroughSteps >= walkthroughSteps.length || walkthroughSteps.length === 0}
                    >
                      {walkthroughSteps.length === 0
                        ? "No walkthrough"
                        : shownWalkthroughSteps >= walkthroughSteps.length
                          ? "All steps shown"
                          : "Show walkthrough step"}
                    </Button>
                    <Button variant="ghost" onClick={hideWalkthroughStep} disabled={shownWalkthroughSteps <= 0}>
                      Hide step
                    </Button>
                    <Button variant="ghost" onClick={hideAllWalkthroughSteps} disabled={shownWalkthroughSteps <= 0}>
                      Hide all steps
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={() =>
                        setShowFullSolutionByQuestion((prev) => ({
                          ...prev,
                          [currentQuestion.id]: true
                        }))
                      }
                    >
                      Show full solution
                    </Button>
                    {!questionSubmitted ? (
                      <Button onClick={submitCurrent}>Submit answer</Button>
                    ) : null}
                    {questionSubmitted && !isOpenResponseQuestion(currentQuestion) && !correctByQuestion[currentQuestion.id] ? (
                      <Button variant="ghost" onClick={resetCurrent}>
                        Try again
                      </Button>
                    ) : null}
                  </div>

                  {displayedHints.length > 0 ? (
                    <div className="space-y-2 rounded-xl border border-brand-2/30 bg-brand-2/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-2">Hints</p>
                      <ol className="space-y-2">
                        {displayedHints.map((hint, idx) => (
                          <li key={`${currentQuestion.id}-hint-${idx}`} className="text-sm text-text">
                            <Markdown content={hint} promoteMathInInlineCode />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  {displayedWalkthroughSteps.length > 0 ? (
                    <div className="space-y-2 rounded-xl border border-borderc bg-soft p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">
                        Walkthrough steps ({shownWalkthroughSteps}/{walkthroughSteps.length})
                      </p>
                      <ol className="space-y-2">
                        {displayedWalkthroughSteps.map((step, idx) => (
                          <li key={`${currentQuestion.id}-walk-${idx}`} className="text-sm text-text">
                            <Markdown content={step} promoteMathInInlineCode />
                          </li>
                        ))}
                      </ol>
                    </div>
                  ) : null}

                  {questionSubmitted ? (
                    <div className="space-y-3 rounded-xl border border-borderc bg-soft p-4">
                      <p className="text-sm font-semibold text-text">
                        {currentQuestion.type === "free"
                          ? "Submitted. Compare your work with the solution and mark understanding."
                          : correctByQuestion[currentQuestion.id]
                            ? "Correct."
                            : "Needs review."}
                      </p>
                      {requiresSelfMark(currentQuestion) ? (
                        <div className="flex flex-wrap gap-2">
                          <Button
                            variant={selfMarkedByQuestion[currentQuestion.id] === true ? "primary" : "secondary"}
                            onClick={() =>
                              setSelfMarkedByQuestion((prev) => ({
                                ...prev,
                                [currentQuestion.id]: true
                              }))
                            }
                          >
                            I understand this
                          </Button>
                          <Button
                            variant={selfMarkedByQuestion[currentQuestion.id] === false ? "primary" : "ghost"}
                            onClick={() =>
                              setSelfMarkedByQuestion((prev) => ({
                                ...prev,
                                [currentQuestion.id]: false
                              }))
                            }
                          >
                            Still confused
                          </Button>
                        </div>
                      ) : null}

                      <div className="space-y-2">
                        <p className="text-xs uppercase tracking-[0.14em] text-muted">Explanation</p>
                        <Markdown content={currentQuestion.explanation} promoteMathInInlineCode />
                      </div>
                    </div>
                  ) : null}

                  {showFullSolution ? (
                    <div className="space-y-3 rounded-xl border border-success/30 bg-success/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-success">Solution</p>
                      {currentQuestion.solutionMd || currentQuestion.sampleAnswer ? (
                        <Markdown
                          content={currentQuestion.solutionMd ?? currentQuestion.sampleAnswer ?? ""}
                          promoteMathInInlineCode
                        />
                      ) : null}
                      {(currentQuestion.walkthroughSteps ?? []).length > 0 ? (
                        <ol className="space-y-2">
                          {(currentQuestion.walkthroughSteps ?? []).map((step, idx) => (
                            <li key={`${currentQuestion.id}-step-${idx}`}>
                              <Markdown content={step} promoteMathInInlineCode />
                            </li>
                          ))}
                        </ol>
                      ) : null}
                    </div>
                  ) : null}
                </>
              ) : null}
            </CardBody>
          </Card>

          <div className="flex items-center justify-between rounded-xl border border-borderc bg-surface px-4 py-3">
            <Button variant="secondary" onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))} disabled={currentIndex === 0}>
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>

            {isLast ? (
              <Button onClick={finishHomework} disabled={!canAdvance}>
                Finish Homework
              </Button>
            ) : (
              <Button
                onClick={() => setCurrentIndex((prev) => Math.min(order.length - 1, prev + 1))}
                disabled={!canAdvance}
              >
                Next
                <ArrowRight className="h-4 w-4" />
              </Button>
            )}
          </div>

          {pendingSelfMark ? (
            <p className="text-xs text-warn">
              Mark your understanding before moving to the next free-response question.
            </p>
          ) : null}
        </div>
      </div>

      <Card>
        <CardBody className="flex flex-wrap items-center justify-between gap-2 p-4 text-xs text-muted">
          <span>
            Homework progress: {completedCount}/{order.length} submitted • {countMissed(
              summarizeAttempt({
                quiz,
                selectedByQuestion,
                freeResponseByQuestion: responseByQuestion,
                selfMarkedByQuestion,
                order,
                timeSpentSeconds: timeSpent
              })
            )} currently missed
          </span>
          <span>Elapsed: {Math.round(timeSpent / 60)} min</span>
        </CardBody>
      </Card>
    </div>
  );
}
