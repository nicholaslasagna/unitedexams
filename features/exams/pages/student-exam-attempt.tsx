"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, ArrowLeft, ArrowRight, Clock3, ShieldCheck } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Markdown } from "@/components/ui/markdown";
import { AssessmentChoiceRow } from "@/components/ui/assessment-choice-row";
import { choiceMarkerForIndex } from "@/lib/utils";
import { TurnstileWidget } from "@/components/auth/turnstile-widget";
import { useToast } from "@/lib/hooks/use-toast";
import { useAppData } from "@/lib/app-data-context";
import { shuffle } from "@/lib/utils";
import { getStudySetWithFallback } from "@/features/study/study-set-source";
import type { Question, QuizSet } from "@/lib/types";
import {
  getExamStartConfig,
  heartbeatExamSession,
  logExamRuntimeEvent,
  startExamSession,
  submitExamSession,
  type ExamStartConfig,
  type SubmitExamResponse
} from "@/features/exams/api";

type Stage = "intro" | "running" | "submitted";

function secondsToClock(seconds: number) {
  const safe = Math.max(0, seconds);
  const mins = Math.floor(safe / 60);
  const secs = safe % 60;
  return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
}

function normalizeQuestionOrder(quiz: QuizSet, shouldShuffle: boolean) {
  const ids = quiz.questions.map((question) => question.id);
  return shouldShuffle ? shuffle(ids) : ids;
}

function normalizeOptionOrder(questions: Question[], shouldShuffle: boolean) {
  return questions.reduce<Record<string, number[]>>((acc, question) => {
    const optionCount = question.options?.length ?? 0;
    const base = Array.from({ length: optionCount }, (_, index) => index);
    acc[question.id] = shouldShuffle ? shuffle(base) : base;
    return acc;
  }, {});
}

function gradeLocal(question: Question, selected: number[]) {
  if (!question.correct || question.correct.length === 0) return false;
  const a = [...selected].sort((x, y) => x - y);
  const b = [...question.correct]
    .filter((value): value is number => typeof value === "number")
    .sort((x, y) => x - y);
  if (a.length !== b.length) return false;
  return a.every((value, index) => value === b[index]);
}

export function StudentExamAttemptPage({ examId }: { examId: string }) {
  const { supabase, preferences } = useAppData();
  const { push } = useToast();

  const [loading, setLoading] = useState(true);
  const [config, setConfig] = useState<ExamStartConfig | null>(null);
  const [quiz, setQuiz] = useState<QuizSet | null>(null);
  const [stage, setStage] = useState<Stage>("intro");
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [proctorCode, setProctorCode] = useState("");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [starting, setStarting] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [order, setOrder] = useState<string[]>([]);
  const [optionOrderByQuestion, setOptionOrderByQuestion] = useState<Record<string, number[]>>({});
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number[]>>({});

  const [timeRemaining, setTimeRemaining] = useState(0);
  const [expiresAtIso, setExpiresAtIso] = useState<string | null>(null);
  const [activeSessions, setActiveSessions] = useState(1);
  const [statusText, setStatusText] = useState("created");
  const [submittedResult, setSubmittedResult] = useState<SubmitExamResponse | null>(null);
  const [localScored, setLocalScored] = useState<Record<string, boolean>>({});
  const [windowFocused, setWindowFocused] = useState(true);
  const [documentVisible, setDocumentVisible] = useState(true);
  const lastCursorLeaveEventRef = useRef(0);

  const examSessionIdRef = useRef(
    `exam-session-${Math.random().toString(16).slice(2)}-${Date.now().toString(36)}`
  );
  const lastDevtoolsEventRef = useRef(0);

  const currentQuestionId = order[currentIndex];
  const currentQuestion = useMemo(
    () => quiz?.questions.find((question) => question.id === currentQuestionId),
    [quiz, currentQuestionId]
  );
  const strictIntegrityMode = Boolean(config?.lockdown_mode && !config?.open_notes_allowed);
  const interactionBlocked =
    stage === "running" &&
    strictIntegrityMode &&
    (!windowFocused || !documentVisible || activeSessions > 1);

  useEffect(() => {
    if (stage !== "running") return;
    setWindowFocused(document.hasFocus());
    setDocumentVisible(document.visibilityState === "visible");
  }, [stage]);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    Promise.all([getExamStartConfig(supabase, examId)])
      .then(async ([nextConfig]) => {
        if (!active) return;
        if (!nextConfig) {
          setConfig(null);
          setQuiz(null);
          return;
        }
        setConfig(nextConfig);
        if (!nextConfig.quiz_set_id) {
          setQuiz(null);
          return;
        }
        const set = await getStudySetWithFallback(nextConfig.quiz_set_id);
        if (!active) return;
        setQuiz(set ?? null);
      })
      .catch(() => {
        if (!active) return;
        setConfig(null);
        setQuiz(null);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [supabase, examId]);

  useEffect(() => {
    if (!attemptId || stage !== "running") return;

    const log = (eventType: string, payload?: Record<string, unknown>) => {
      void logExamRuntimeEvent({
        attemptId,
        eventType,
        payload
      }).catch(() => undefined);
    };

    const onBlur = () => {
      setWindowFocused(false);
      if (strictIntegrityMode) {
        log("tab_blur");
      }
    };
    const onFocus = () => {
      setWindowFocused(true);
      if (strictIntegrityMode) {
        log("tab_focus");
      }
    };
    const onVisibility = () => {
      const visible = document.visibilityState === "visible";
      setDocumentVisible(visible);
      if (strictIntegrityMode) {
        log(visible ? "tab_focus" : "visibility_hidden", {
          visibility: document.visibilityState
        });
      }
    };
    const onCopy = () => {
      if (strictIntegrityMode) {
        log("copy");
      }
    };
    const onPaste = () => {
      if (strictIntegrityMode) {
        log("paste");
      }
    };
    const onOnline = () => {
      log("reconnect", { source: "online" });
    };
    const onDevtoolsProbe = () => {
      if (!strictIntegrityMode) return;
      const widthGap = Math.abs(window.outerWidth - window.innerWidth);
      const heightGap = Math.abs(window.outerHeight - window.innerHeight);
      const looksOpen = widthGap > 180 || heightGap > 180;
      if (!looksOpen) return;

      const now = Date.now();
      if (now - lastDevtoolsEventRef.current < 60_000) return;
      lastDevtoolsEventRef.current = now;

      log("devtools_suspected", { widthGap, heightGap });
    };
    const onMouseLeave = (event: MouseEvent) => {
      if (!strictIntegrityMode) return;
      if (event.relatedTarget) return;
      const now = Date.now();
      if (now - lastCursorLeaveEventRef.current < 5000) return;
      lastCursorLeaveEventRef.current = now;
      log("cursor_left_window");
    };
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      log("navigation_attempt", { type: "beforeunload" });
      event.preventDefault();
      event.returnValue = "";
    };

    window.addEventListener("blur", onBlur);
    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    document.addEventListener("copy", onCopy);
    document.addEventListener("paste", onPaste);
    window.addEventListener("online", onOnline);
    window.addEventListener("mouseout", onMouseLeave);
    window.addEventListener("beforeunload", onBeforeUnload);
    const devtoolsTimer = window.setInterval(onDevtoolsProbe, 6000);
    if (strictIntegrityMode) {
      onDevtoolsProbe();
    }

    return () => {
      window.removeEventListener("blur", onBlur);
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      document.removeEventListener("copy", onCopy);
      document.removeEventListener("paste", onPaste);
      window.removeEventListener("online", onOnline);
      window.removeEventListener("mouseout", onMouseLeave);
      window.removeEventListener("beforeunload", onBeforeUnload);
      window.clearInterval(devtoolsTimer);
    };
  }, [attemptId, stage, strictIntegrityMode]);

  useEffect(() => {
    if (!attemptId || stage !== "running") return;
    const tick = window.setInterval(() => {
      heartbeatExamSession({
        attemptId,
        sessionId: examSessionIdRef.current,
        visibilityState: strictIntegrityMode ? document.visibilityState : undefined
      })
        .then((heartbeat) => {
          setTimeRemaining(heartbeat.timeRemainingSeconds);
          setActiveSessions(heartbeat.activeSessions);
          setStatusText(heartbeat.status);
          if (heartbeat.expiresAt) {
            setExpiresAtIso(heartbeat.expiresAt);
          }
        })
        .catch(() => undefined);
    }, 12000);
    return () => window.clearInterval(tick);
  }, [attemptId, stage, strictIntegrityMode]);

  useEffect(() => {
    if (stage !== "running" || !expiresAtIso) return;
    const timer = window.setInterval(() => {
      const remaining = Math.max(0, Math.floor((new Date(expiresAtIso).getTime() - Date.now()) / 1000));
      setTimeRemaining(remaining);
      if (remaining <= 0) {
        void onSubmitExam();
      }
    }, 1000);
    return () => window.clearInterval(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage, expiresAtIso]);

  const onStartExam = async () => {
    if (!config || !quiz) return;
    setStarting(true);
    try {
      if (config.require_proctor_code && !proctorCode.trim()) {
        throw new Error("Proctor code is required to begin this exam.");
      }
      const started = await startExamSession({
        examId: config.exam_id,
        proctorCode: proctorCode.trim() || undefined,
        turnstileToken: turnstileToken ?? undefined
      });
      setAttemptId(started.attemptId);
      setExpiresAtIso(started.expiresAt);
      setStatusText(started.status);
      setTimeRemaining(Math.max(0, Math.floor((new Date(started.expiresAt).getTime() - Date.now()) / 1000)));
      const questionOrder = normalizeQuestionOrder(quiz, config.shuffle_questions);
      setOrder(questionOrder);
      setOptionOrderByQuestion(normalizeOptionOrder(quiz.questions, config.shuffle_options));
      setCurrentIndex(0);
      setAnswers({});
      setLocalScored({});
      setSubmittedResult(null);
      setStage("running");
      push({ title: "Exam started", tone: "success" });
    } catch (error) {
      push({ title: "Unable to start exam", description: (error as Error).message, tone: "error" });
    } finally {
      setStarting(false);
    }
  };

  const onToggleOption = (optionIndex: number) => {
    if (!currentQuestion) return;
    if (interactionBlocked) return;
    if (currentQuestion.type === "free") return;
    setAnswers((prev) => {
      const existing = prev[currentQuestion.id] ?? [];
      if (currentQuestion.type === "single") {
        return { ...prev, [currentQuestion.id]: [optionIndex] };
      }
      return {
        ...prev,
        [currentQuestion.id]: existing.includes(optionIndex)
          ? existing.filter((item) => item !== optionIndex)
          : [...existing, optionIndex]
      };
    });
  };

  const onSubmitExam = async () => {
    if (!attemptId || submitting || interactionBlocked) return;
    setSubmitting(true);
    try {
      const result = await submitExamSession({
        attemptId,
        answers
      });
      setSubmittedResult(result);
      setStatusText(result.status);
      setStage("submitted");

      if (quiz) {
        const local = quiz.questions.reduce<Record<string, boolean>>((acc, question) => {
          if (question.type === "free") {
            acc[question.id] = false;
            return acc;
          }
          acc[question.id] = gradeLocal(question, answers[question.id] ?? []);
          return acc;
        }, {});
        setLocalScored(local);
      }

      await logExamRuntimeEvent({
        attemptId,
        eventType: "submit_click",
        payload: { answerCount: Object.keys(answers).length }
      }).catch(() => undefined);
    } catch (error) {
      push({ title: "Unable to submit exam", description: (error as Error).message, tone: "error" });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardBody className="p-8 text-sm text-muted">Loading exam…</CardBody>
      </Card>
    );
  }

  if (!config || !quiz) {
    return (
      <Card>
        <CardBody className="space-y-3 p-8 text-center">
          <p className="font-display text-2xl font-semibold">Exam unavailable</p>
          <p className="text-sm text-muted">
            This exam is not accessible for your account, or its question bank is missing.
          </p>
        </CardBody>
      </Card>
    );
  }

  if (stage === "intro") {
    return (
      <div className="space-y-6">
        <section className="flex items-center justify-between gap-2">
          <Button variant="ghost" asChild>
            <Link href="/app/sections">
              <ArrowLeft className="h-4 w-4" />
              Back to sections
            </Link>
          </Button>
          <Badge tone={config.mode === "timed" ? "warn" : "brand"}>{config.mode}</Badge>
        </section>

        <Card className="mesh-hero">
          <CardBody className="space-y-4 p-7">
            <h1 className="font-display text-4xl font-semibold tracking-tight">{config.title}</h1>
            <p className="text-sm text-muted">{config.description || "Professor-hosted assessment."}</p>
            <div className="grid gap-3 md:grid-cols-3">
              <div className="rounded-xl border border-borderc bg-soft p-4">
                <p className="text-xs text-muted">Window</p>
                <p className="mt-1 text-sm font-semibold text-text">
                  {new Date(config.starts_at).toLocaleString()} → {new Date(config.ends_at).toLocaleString()}
                </p>
              </div>
              <div className="rounded-xl border border-borderc bg-soft p-4">
                <p className="text-xs text-muted">Duration</p>
                <p className="mt-1 text-2xl font-bold text-text">{config.duration_minutes}m</p>
              </div>
              <div className="rounded-xl border border-borderc bg-soft p-4">
                <p className="text-xs text-muted">Attempt limit</p>
                <p className="mt-1 text-2xl font-bold text-text">{config.attempt_limit}</p>
              </div>
            </div>

            {config.lockdown_mode ? (
              <div className="rounded-xl border border-warn/35 bg-warn/10 px-4 py-3 text-sm text-text">
                {config.open_notes_allowed
                  ? "Open-notes integrity mode enabled. Activity is monitored, but notes are allowed for this exam."
                  : "Strict lockdown mode enabled. Keep this tab focused and avoid duplicate exam tabs to continue."}
              </div>
            ) : null}

            {config.require_proctor_code ? (
              <div className="space-y-1.5">
                <label className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">Proctor code</label>
                <Input value={proctorCode} onChange={(event) => setProctorCode(event.target.value)} placeholder="Enter exam code provided by your professor" />
              </div>
            ) : null}

            <TurnstileWidget action="exam-start" onToken={setTurnstileToken} theme={preferences.theme === "light" ? "light" : "dark"} />

            <Button loading={starting} onClick={onStartExam}>
              <ShieldCheck className="h-4 w-4" />
              Start exam
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  if (stage === "submitted" && submittedResult) {
    return (
      <div className="space-y-6">
        <Card>
          <CardBody className="space-y-4 p-7">
            <h1 className="font-display text-4xl font-semibold tracking-tight">Exam submitted</h1>
            <p className="text-sm text-muted">
              Status: <span className="font-semibold text-text">{submittedResult.status}</span>
            </p>

            {submittedResult.resultsAvailable ? (
              <div className="space-y-2 rounded-xl border border-borderc bg-soft p-4">
                <p className="text-sm text-muted">
                  Score: <span className="font-semibold text-text">{submittedResult.score}%</span> (
                  {submittedResult.correctCount}/{submittedResult.totalCount})
                </p>
                <p className="text-xs text-muted">Review answers below.</p>
              </div>
            ) : (
              <div className="rounded-xl border border-borderc bg-soft p-4 text-sm text-muted">
                Results are hidden until <span className="font-semibold text-text">{submittedResult.showResultsAfter}</span>.
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Button variant="secondary" asChild>
                <Link href="/app/sections">Back to sections</Link>
              </Button>
            </div>
          </CardBody>
        </Card>

        {submittedResult.resultsAvailable ? (
          <Card>
            <CardHeader>
              <h2 className="font-display text-2xl font-semibold">Answer review</h2>
            </CardHeader>
            <CardBody className="space-y-3">
              {quiz.questions.map((question, index) => {
                const selected = answers[question.id] ?? [];
                const mappedOptions = optionOrderByQuestion[question.id] ?? [];
                const correct = localScored[question.id];

                return (
                  <article key={question.id} className="rounded-xl border border-borderc bg-soft p-4">
                    <p className="text-xs uppercase tracking-[0.14em] text-muted">
                      Question {index + 1} {correct ? "· Correct" : "· Review"}
                    </p>
                    <p className="mt-2 text-sm text-text">{question.prompt}</p>
                    {question.options && question.options.length > 0 ? (
                      <ul className="mt-2 space-y-1.5">
                        {mappedOptions.map((optionIndex) => {
                          const optionLabel = question.options?.[optionIndex] ?? "";
                          const isSelected = selected.includes(optionIndex);
                          const isCorrect = (question.correct ?? [])
                            .filter((value): value is number => typeof value === "number")
                            .includes(optionIndex);
                          return (
                            <li key={`${question.id}:${optionIndex}`} className="rounded-lg border border-borderc bg-surface px-3 py-2 text-xs text-muted">
                              <span className="font-semibold text-text">{optionLabel}</span>
                              <span className="ml-2">
                                {isSelected ? "• selected " : ""}
                                {isCorrect ? "• correct" : ""}
                              </span>
                            </li>
                          );
                        })}
                      </ul>
                    ) : null}
                  </article>
                );
              })}
            </CardBody>
          </Card>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div
        className="rounded-xl border border-borderc bg-soft px-4 py-3 text-sm text-text"
        role="status"
        aria-live="polite"
      >
        <div className="flex flex-wrap items-center gap-3">
          <span className="inline-flex items-center gap-2 font-semibold">
            <Clock3 className="h-4 w-4" />
            Time remaining: {secondsToClock(timeRemaining)}
          </span>
          <span className="text-xs text-muted">Status: {statusText}</span>
          {activeSessions > 1 ? (
            <span className="inline-flex items-center gap-1 text-warn">
              <AlertTriangle className="h-3.5 w-3.5" />
              Multiple sessions detected
            </span>
          ) : null}
        </div>
        <p className="mt-2 text-xs text-muted">Integrity monitoring is active.</p>
      </div>

      {interactionBlocked ? (
        <div className="rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-sm text-text">
          {activeSessions > 1
            ? "Close other open exam tabs for this attempt, then continue here."
            : "Return to this exam tab and keep it focused to continue."}
        </div>
      ) : null}

      <Card>
        <CardBody className={`space-y-5 p-6 ${interactionBlocked ? "opacity-80" : ""}`}>
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-[0.14em] text-muted">
              Question {currentIndex + 1} of {order.length}
            </p>
            <Badge>{currentQuestion?.type || "single"}</Badge>
          </div>

          <div className="rounded-xl border border-borderc bg-soft p-4">
            {currentQuestion ? (
              <Markdown content={currentQuestion.prompt} className="quiz-question-prompt" promoteMathInInlineCode />
            ) : null}
          </div>

          {currentQuestion?.options ? (
            <div className="space-y-2" role={currentQuestion.type === "single" ? "radiogroup" : "group"} aria-label="Exam options">
              {(optionOrderByQuestion[currentQuestion.id] ?? []).map((optionIndex) => {
                const selected = (answers[currentQuestion.id] ?? []).includes(optionIndex);
                const optionText = currentQuestion.options?.[optionIndex] ?? "";
                return (
                  <AssessmentChoiceRow
                    key={`${currentQuestion.id}:${optionIndex}`}
                    kind={currentQuestion.type === "single" ? "single" : "multi"}
                    marker={choiceMarkerForIndex(optionIndex)}
                    content={optionText}
                    checked={selected}
                    state={selected ? "selected" : "default"}
                    role={currentQuestion.type === "single" ? "radio" : "checkbox"}
                    onClick={() => onToggleOption(optionIndex)}
                    disabled={interactionBlocked}
                  />
                );
              })}
            </div>
          ) : (
            <p className="text-sm text-muted">This question type is not auto-graded in v1.</p>
          )}

          <div className="flex flex-wrap items-center justify-between gap-2">
            <Button
              variant="secondary"
              onClick={() => setCurrentIndex((prev) => Math.max(0, prev - 1))}
              disabled={currentIndex === 0 || interactionBlocked}
            >
              <ArrowLeft className="h-4 w-4" />
              Previous
            </Button>
            <div className="flex gap-2">
              {currentIndex < order.length - 1 ? (
                <Button
                  onClick={() => setCurrentIndex((prev) => Math.min(order.length - 1, prev + 1))}
                  disabled={interactionBlocked}
                >
                  Next
                  <ArrowRight className="h-4 w-4" />
                </Button>
              ) : (
                <Button loading={submitting} onClick={onSubmitExam} disabled={interactionBlocked}>
                  Submit exam
                </Button>
              )}
            </div>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
