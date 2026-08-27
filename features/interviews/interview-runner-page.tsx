"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, Clock3, KeyRound, Lock, Play, RotateCcw, Trophy, XCircle } from "lucide-react";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ProgressBar } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { getCompanyInterview } from "@/data/seed/interviews";
import { scoreInterview, type CheckedSignals, type TestOutcomes } from "@/lib/interviews/scoring";
import { runCode, type RunResult } from "@/lib/interviews/run-code";
import { useAppData } from "@/lib/app-data-context";
import { useAccess } from "@/lib/hooks/use-access";
import { resolveLock } from "@/lib/access";
import { PremiumUnlockNote } from "@/components/ui/premium-unlock-note";
import { UpgradeButton } from "@/components/billing/upgrade-button";
import type { Attempt, PerQuestionResult } from "@/lib/types";

type Phase = "brief" | "answer" | "review" | "report";

const BAND_COPY = {
  "strong-hire": { label: "Strong hire", tone: "text-success", note: "Above the bar on almost every signal." },
  hire: { label: "Hire", tone: "text-success", note: "You'd likely pass this loop. Tighten the misses below." },
  borderline: { label: "Borderline", tone: "text-warn", note: "Real gaps. The fixes below are the highest-leverage ones." },
  "no-hire": { label: "Not yet", tone: "text-danger", note: "Work the improvements, then retake — that's what this is for." }
} as const;

function formatClock(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2, "0")}`;
}

export function InterviewRunnerContent({ interviewId }: { interviewId: string }) {
  const interview = getCompanyInterview(interviewId);
  const { ready, isAuthenticated, saveAttempt, user } = useAppData();
  const access = useAccess();
  // Premium, institution-covered, professor and admin accounts all sit the
  // complete loop. lib/access.ts already folds those into one decision.
  const hasFullLoop = resolveLock(access, { premiumOrInstitution: true }) === "open";

  const openRounds = useMemo(
    () => (interview ? interview.rounds.filter((round) => hasFullLoop || !round.premium) : []),
    [interview, hasFullLoop]
  );
  const lockedRounds = useMemo(
    () => (interview ? interview.rounds.filter((round) => !hasFullLoop && round.premium) : []),
    [interview, hasFullLoop]
  );
  const questions = useMemo(
    () => openRounds.flatMap((round) => round.questions.map((q) => ({ round, question: q }))),
    [openRounds]
  );
  const openMinutes = openRounds.reduce((sum, round) => sum + round.minutes, 0);

  const [phase, setPhase] = useState<Phase>("brief");
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [checked, setChecked] = useState<CheckedSignals>({});
  const [code, setCode] = useState<Record<string, string>>({});
  const [runs, setRuns] = useState<Record<string, RunResult>>({});
  const [running, setRunning] = useState(false);
  const [showFollowUps, setShowFollowUps] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  // Time on the CURRENT question. The header shows this against the
  // question's budget; `elapsed` is the whole-interview total used for the
  // saved attempt. Showing the total against a per-question budget made a
  // candidate on question 3 look 25 minutes over when they were on time.
  const [questionElapsed, setQuestionElapsed] = useState(0);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveError, setSaveError] = useState<string | null>(null);
  const startedAt = useRef<number | null>(null);
  const questionStartedAt = useRef<number | null>(null);
  // Keyed by user: these run on shared school machines, and an id-only key
  // let the next person resume — and post — someone else's attempt.
  const draftKey = `ue.interview.draft.${user?.id ?? "anon"}.${interviewId}`;
  const restored = useRef(false);

  // A loop can run 90+ minutes. Losing an accidental refresh used to throw
  // away every answer and every line of code, so the in-progress attempt is
  // mirrored to localStorage and restored on mount.
  // ponytail: localStorage is per-device on purpose — a half-finished
  // interview isn't worth a server round-trip. Move it server-side only if
  // people ask to resume on another machine.
  useEffect(() => {
    if (restored.current) return;
    restored.current = true;
    try {
      const raw = window.localStorage.getItem(draftKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as {
        phase?: Phase;
        index?: number;
        answers?: Record<string, string>;
        code?: Record<string, string>;
        checked?: CheckedSignals;
        runs?: Record<string, RunResult>;
        startedAt?: number;
        elapsed?: number;
      };
      if (!draft.phase || draft.phase === "brief") return;
      setAnswers(draft.answers ?? {});
      setCode(draft.code ?? {});
      setChecked(draft.checked ?? {});
      setRuns(draft.runs ?? {});
      setIndex(Math.min(draft.index ?? 0, Math.max(questions.length - 1, 0)));
      startedAt.current = draft.startedAt ?? Date.now();
      questionStartedAt.current = Date.now();
      // The clock only ticks during answer/review, so a reload on the report
      // screen would otherwise show 0:00 and save timeSpent: 0.
      setElapsed(
        draft.startedAt ? Math.floor((Date.now() - draft.startedAt) / 1000) : (draft.elapsed ?? 0)
      );
      setPhase(draft.phase);
    } catch {
      // A corrupt draft must never block starting a fresh interview.
    }
  }, [draftKey, questions.length]);

  useEffect(() => {
    if (phase === "brief") return;
    try {
      window.localStorage.setItem(
        draftKey,
        JSON.stringify({
          phase,
          index,
          answers,
          code,
          checked,
          runs,
          startedAt: startedAt.current,
          elapsed
        })
      );
    } catch {
      // Private mode / quota — the interview still works, just not resumable.
    }
  }, [draftKey, phase, index, answers, code, checked, runs, elapsed]);

  // Elapsed clock, running only while the interview is in progress.
  useEffect(() => {
    if (phase !== "answer" && phase !== "review") return;
    const id = window.setInterval(() => {
      if (startedAt.current) setElapsed(Math.floor((Date.now() - startedAt.current) / 1000));
      // The per-question clock freezes once they hand the answer over.
      if (phase === "answer" && questionStartedAt.current) {
        setQuestionElapsed(Math.floor((Date.now() - questionStartedAt.current) / 1000));
      }
    }, 1000);
    return () => window.clearInterval(id);
  }, [phase]);

  if (!ready) return <Skeleton className="h-96" />;

  if (!interview) {
    return (
      <Card>
        <CardBody className="space-y-3 p-6">
          <p className="font-display text-xl font-semibold text-text">Interview not found.</p>
          <Button asChild>
            <Link href="/app/interviews">Back to interviews</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  // Progress is saved and scored, so this is sign-in only. /app/* is already
  // middleware-gated; this is the defensive second check.
  if (!isAuthenticated) {
    return (
      <Card>
        <CardBody className="space-y-3 p-6">
          <p className="inline-flex items-center gap-2 font-display text-xl font-semibold text-text">
            <Lock className="h-5 w-5 text-accent" /> Sign in to start
          </p>
          <p className="text-[14px] text-text-secondary">
            Interviews save your score, track what to improve, and let you retake to beat it.
          </p>
          <Button asChild>
            <Link href={`/login?next=/app/interviews/${interviewId}`}>Sign in</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  const current = questions[index];
  const testOutcomes: TestOutcomes = Object.fromEntries(
    Object.entries(runs).map(([id, run]) => [id, { passed: run.passed, total: run.total }])
  );
  // Score only the rounds this account actually sat, so a free candidate is
  // never marked down for questions they were never shown.
  const result = scoreInterview(
    interview,
    checked,
    testOutcomes,
    openRounds.map((round) => round.id)
  );
  const bandCopy = BAND_COPY[result.band];

  const beginInterview = () => {
    startedAt.current = Date.now();
    questionStartedAt.current = Date.now();
    setQuestionElapsed(0);
    setPhase("answer");
  };

  const toggleSignal = (questionId: string, signalId: string) => {
    setChecked((prev) => {
      const list = new Set(prev[questionId] ?? []);
      if (list.has(signalId)) list.delete(signalId);
      else list.add(signalId);
      return { ...prev, [questionId]: Array.from(list) };
    });
  };

  const runTests = async () => {
    if (!current?.question.coding) return;
    const workspace = current.question.coding;
    setRunning(true);
    const run = await runCode(
      code[current.question.id] ?? workspace.starterCode,
      workspace.functionName,
      workspace.tests
    );
    setRuns((prev) => ({ ...prev, [current.question.id]: run }));
    setRunning(false);
  };

  const nextQuestion = () => {
    setShowFollowUps(false);
    if (index + 1 < questions.length) {
      setIndex(index + 1);
      questionStartedAt.current = Date.now();
      setQuestionElapsed(0);
      setPhase("answer");
    } else {
      setPhase("report");
    }
  };

  const retake = () => {
    try {
      window.localStorage.removeItem(draftKey);
    } catch {
      // Nothing to do — a stale draft is only read when phase !== "brief".
    }
    setPhase("brief");
    setIndex(0);
    setAnswers({});
    setChecked({});
    setCode({});
    setRuns({});
    setShowFollowUps(false);
    setElapsed(0);
    setQuestionElapsed(0);
    questionStartedAt.current = null;
    setSaveState("idle");
    setSaveError(null);
    startedAt.current = null;
  };

  const publishScore = async () => {
    setSaveState("saving");
    setSaveError(null);
    const perQuestionResults: PerQuestionResult[] = result.perQuestion.map((q) => ({
      questionId: q.questionId,
      questionType: "free",
      isCorrect: q.percent >= 70,
      selected: [],
      correct: [],
      responseText: answers[q.questionId] ?? "",
      selfMarked: true,
      tags: [q.kind]
    }));

    const topicBreakdown: Record<string, { correct: number; total: number }> = {};
    for (const q of result.perQuestion) {
      const bucket = (topicBreakdown[q.kind] ??= { correct: 0, total: 0 });
      bucket.total += 1;
      if (q.percent >= 70) bucket.correct += 1;
    }

    const attempt: Attempt = {
      id: crypto.randomUUID(),
      quizId: interview.id,
      courseId: "interviews",
      mode: "exam",
      date: new Date().toISOString(),
      score: result.percent,
      correctCount: perQuestionResults.filter((r) => r.isCorrect).length,
      totalCount: perQuestionResults.length,
      timeSpent: elapsed,
      perQuestionResults,
      topicBreakdown,
      status: "completed"
    };

    try {
      await saveAttempt(attempt);
      setSaveState("saved");
      try {
        window.localStorage.removeItem(draftKey);
      } catch {
        // Draft is only read while phase !== "brief"; a leftover is harmless.
      }
    } catch (error) {
      setSaveState("error");
      setSaveError((error as Error).message || "Could not save your score.");
    }
  };

  return (
    <div className="space-y-5">
      <Link
        href="/app/interviews"
        className="inline-flex items-center gap-1.5 text-[12px] font-semibold uppercase tracking-[0.18em] text-text-secondary transition-colors hover:text-text"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> All interviews
      </Link>

      {/* ── Brief: what to expect ───────────────────────────── */}
      {phase === "brief" ? (
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4 p-6">
              <div>
                <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-accent">
                  {interview.company} · {interview.level}
                </p>
                <h1 className="mt-2 font-display text-[2rem] font-semibold leading-tight tracking-tight text-text">
                  {interview.role} interview
                </h1>
                <p className="mt-2 max-w-2xl text-[14.5px] leading-relaxed text-text-secondary">
                  {interview.blurb}
                </p>
              </div>
              <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                {openRounds.length} of {interview.rounds.length} rounds
                <span className="mx-2 text-text-secondary/50">·</span>
                {questions.length} questions
                <span className="mx-2 text-text-secondary/50">·</span>
                about {openMinutes} min
              </p>
              <Button size="lg" className="w-full sm:w-auto" onClick={beginInterview}>
                Start interview <ArrowRight className="h-4 w-4" />
              </Button>
            </CardBody>
          </Card>

          <div className="grid gap-4 lg:grid-cols-3">
            <BriefList title="The loop, stage by stage" items={interview.process} numbered />
            <BriefList title="What they reward" items={interview.bar} />
            <BriefList title="How strong people fail it" items={interview.pitfalls} />
          </div>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-text">Rounds</h2>
            </CardHeader>
            <CardBody className="divide-y divide-borderc">
              {interview.rounds.map((round) => {
                const locked = !hasFullLoop && round.premium;
                return (
                  <div key={round.id} className="flex items-baseline justify-between gap-4 py-3">
                    <div className="min-w-0">
                      <p className="flex items-center gap-2 text-[14px] font-semibold text-text">
                        {round.name}
                        {locked ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                            <KeyRound className="h-3 w-3" /> Premium
                          </span>
                        ) : null}
                      </p>
                      <p className="text-[12.5px] text-text-secondary">{round.format}</p>
                    </div>
                    <span className="shrink-0 font-mono text-[12px] text-text-secondary">
                      {round.minutes} min
                    </span>
                  </div>
                );
              })}
            </CardBody>
          </Card>

          {/* The stages around the technical rounds — recruiter screen,
              debrief, offer. This is the part of the loop that actually
              decides offers, so it's the core of the Premium value. */}
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <h2 className="font-display text-lg font-semibold text-text">
                    The rest of the process
                  </h2>
                  <p className="mt-1 text-[13.5px] text-text-secondary">
                    Everything around the technical rounds — where a lot of offers are actually won
                    and lost.
                  </p>
                </div>
                {!hasFullLoop ? (
                  <span className="inline-flex shrink-0 items-center gap-1 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.14em] text-accent">
                    <KeyRound className="h-3 w-3" /> Premium
                  </span>
                ) : null}
              </div>
            </CardHeader>
            <CardBody className="space-y-3">
              {hasFullLoop ? (
                interview.loopStages.map((stage) => (
                  <div key={stage.name} className="rounded-xl border border-borderc bg-soft/50 p-4">
                    <p className="text-[14px] font-semibold text-text">{stage.name}</p>
                    <p className="mt-1 text-[13px] leading-relaxed text-text-secondary">
                      {stage.whatHappens}
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {stage.howToPrepare.map((tip) => (
                        <li key={tip} className="flex gap-2 text-[12.5px] leading-relaxed text-text-secondary">
                          <span className="text-accent">—</span>
                          {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <PremiumUnlockNote
                  title="Included with Premium"
                  description={`The ${interview.company} recruiter screen, how the debrief actually decides your level, and what to do at the offer stage.`}
                  bullets={interview.loopStages.map((stage) => stage.name)}
                  trailing={
                    <UpgradeButton plan="monthly" returnUrl={`/app/interviews/${interviewId}`}>
                      Get the full loop
                    </UpgradeButton>
                  }
                />
              )}
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* ── Answer ─────────────────────────────────────────── */}
      {phase === "answer" && current ? (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
              {current.round.name}
              <span className="mx-2 text-text-secondary/50">·</span>
              Question {index + 1} of {questions.length}
            </p>
            <p className="inline-flex items-center gap-1.5 font-mono text-[12px] text-text-secondary">
              <Clock3 className="h-3.5 w-3.5" />
              <span className={questionElapsed > current.question.minutes * 60 ? "text-warn" : undefined}>
                {formatClock(questionElapsed)}
              </span>
              <span className="text-text-secondary/50">/ ~{current.question.minutes}m</span>
              <span className="text-text-secondary/50">· {formatClock(elapsed)} total</span>
            </p>
          </div>
          <ProgressBar value={Math.round((index / questions.length) * 100)} />

          <Card>
            <CardBody className="space-y-4 p-6">
              <div className="rounded-2xl border border-accent/30 bg-accent/10 p-4">
                <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-accent">
                  Interviewer
                </p>
                <p className="mt-2 text-[15px] leading-relaxed text-text">{current.question.prompt}</p>
              </div>

              {current.question.context ? (
                <p className="text-[13px] leading-relaxed text-text-secondary">
                  <span className="font-semibold text-text">If you ask: </span>
                  {current.question.context}
                </p>
              ) : null}

              {current.question.coding ? (
                <CodingWorkspacePanel
                  workspace={current.question.coding}
                  value={code[current.question.id] ?? current.question.coding.starterCode}
                  onChange={(next) =>
                    setCode((prev) => ({ ...prev, [current.question.id]: next }))
                  }
                  run={runs[current.question.id]}
                  running={running}
                  onRun={runTests}
                />
              ) : null}

              <label className="block space-y-1.5">
                <span className="text-[13px] font-semibold text-text">
                  {current.question.coding
                    ? "Talk track — what you'd be saying out loud while coding"
                    : "Your answer — write it the way you'd say it out loud"}
                </span>
                <textarea
                  value={answers[current.question.id] ?? ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({ ...prev, [current.question.id]: event.target.value }))
                  }
                  rows={current.question.coding ? 6 : 12}
                  placeholder="Approach first, then complexity, then edge cases — the same things you'd say to an interviewer."
                  className="w-full rounded-xl border border-borderc bg-soft p-3 font-mono text-[13px] leading-relaxed text-text outline-none focus:border-accent/50"
                />
              </label>

              {current.question.followUps?.length ? (
                showFollowUps ? (
                  <div className="rounded-xl border border-borderc bg-soft/60 p-4">
                    <p className="text-[10.5px] font-bold uppercase tracking-[0.18em] text-text-secondary">
                      The interviewer pushes further
                    </p>
                    <ul className="mt-2 space-y-1.5">
                      {current.question.followUps.map((f) => (
                        <li key={f} className="text-[13.5px] leading-relaxed text-text">
                          — {f}
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowFollowUps(true)}
                    className="text-[12.5px] font-medium text-text-secondary underline decoration-borderc underline-offset-4 hover:text-text"
                  >
                    Answered? Show the follow-up questions
                  </button>
                )
              ) : null}

              <Button size="lg" className="w-full sm:w-auto" onClick={() => setPhase("review")}>
                Done — score my answer <ArrowRight className="h-4 w-4" />
              </Button>
            </CardBody>
          </Card>
        </div>
      ) : null}

      {/* ── Review: rubric self-scoring ─────────────────────── */}
      {phase === "review" && current ? (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div>
                <h2 className="font-display text-xl font-semibold text-text">
                  What the interviewer was scoring
                </h2>
                <p className="mt-1 text-[13.5px] text-text-secondary">
                  Check every line your answer actually covered. Be honest — the misses become your
                  practice list.
                </p>
              </div>
            </CardHeader>
            <CardBody className="space-y-2">
              {current.question.coding ? (
                <div
                  className={`rounded-xl border p-3 ${
                    runs[current.question.id]?.total &&
                    runs[current.question.id].passed === runs[current.question.id].total
                      ? "border-success/40 bg-success/10"
                      : "border-warn/40 bg-warn/10"
                  }`}
                >
                  <p className="text-[13.5px] font-semibold text-text">
                    Tests: {runs[current.question.id]?.passed ?? 0} of{" "}
                    {current.question.coding.tests.length} passing
                  </p>
                  <p className="mt-1 text-[12.5px] text-text-secondary">
                    This part is scored automatically — it isn&apos;t self-marked.
                  </p>
                </div>
              ) : null}
              {current.question.signals.map((signal) => {
                const isChecked = (checked[current.question.id] ?? []).includes(signal.id);
                return (
                  <label
                    key={signal.id}
                    className={`flex cursor-pointer items-start gap-3 rounded-xl border p-3 transition-colors ${
                      isChecked ? "border-accent/40 bg-accent/10" : "border-borderc bg-soft/50 hover:bg-soft"
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleSignal(current.question.id, signal.id)}
                      className="mt-0.5 h-4 w-4 shrink-0 rounded border-borderc bg-soft accent-[hsl(var(--accent))]"
                    />
                    <span>
                      <span className="block text-[13.5px] font-semibold text-text">{signal.label}</span>
                      {!isChecked ? (
                        <span className="mt-1 block text-[12.5px] leading-relaxed text-text-secondary">
                          {signal.hint}
                        </span>
                      ) : null}
                    </span>
                  </label>
                );
              })}
            </CardBody>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="font-display text-lg font-semibold text-text">What a hire-level answer covers</h2>
            </CardHeader>
            <CardBody>
              <p className="text-[13.5px] leading-relaxed text-text-secondary">
                {current.question.strongAnswer}
              </p>
            </CardBody>
          </Card>

          <Button size="lg" className="w-full sm:w-auto" onClick={nextQuestion}>
            {index + 1 < questions.length ? "Next question" : "See my results"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      ) : null}

      {/* ── Report ─────────────────────────────────────────── */}
      {phase === "report" ? (
        <div className="space-y-4">
          <Card>
            <CardBody className="space-y-4 p-6">
              <div className="flex flex-wrap items-end justify-between gap-4">
                <div>
                  <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-text-secondary">
                    {interview.company} · {interview.role}
                  </p>
                  <p className="mt-2 font-display text-[3rem] font-semibold leading-none text-text">
                    {result.percent}%
                  </p>
                  <p className={`mt-2 text-[15px] font-semibold ${bandCopy.tone}`}>{bandCopy.label}</p>
                  <p className="mt-1 max-w-md text-[13.5px] text-text-secondary">{bandCopy.note}</p>
                </div>
                <p className="text-right font-mono text-[12px] text-text-secondary">
                  {formatClock(elapsed)} spent
                  <span className="mt-1 block">
                    {openRounds.length} of {interview.rounds.length} rounds
                  </span>
                </p>
              </div>

              <div className="space-y-2 border-t border-borderc pt-4">
                {result.perRound.map((round) => (
                  <div key={round.round} className="flex items-center gap-3">
                    <span className="w-56 shrink-0 truncate text-[13px] text-text">{round.round}</span>
                    <ProgressBar value={round.percent} />
                    <span className="w-10 shrink-0 text-right font-mono text-[12px] text-text-secondary">
                      {round.percent}%
                    </span>
                  </div>
                ))}
              </div>

              <div className="flex flex-col gap-2 sm:flex-row">
                {saveState === "saved" ? (
                  <p className="inline-flex items-center gap-2 text-[13.5px] font-semibold text-success">
                    <CheckCircle2 className="h-4 w-4" /> Saved — your score is on the leaderboard.
                  </p>
                ) : (
                  <Button onClick={publishScore} loading={saveState === "saving"} loadingLabel="Saving…">
                    <Trophy className="h-4 w-4" /> Save score &amp; post to leaderboard
                  </Button>
                )}
                <Button variant="secondary" onClick={retake}>
                  <RotateCcw className="h-4 w-4" /> Retake for a higher score
                </Button>
              </div>
              {saveState !== "saved" ? (
                <p className="text-[12px] text-text-secondary">
                  Nothing is posted unless you choose to save it.
                </p>
              ) : null}
              {saveError ? (
                <p className="text-[12.5px] text-danger" role="alert">
                  {saveError}
                </p>
              ) : null}
            </CardBody>
          </Card>

          {lockedRounds.length ? (
            <Card>
              <CardBody className="p-5">
                <PremiumUnlockNote
                  title="You sat the free round — Premium is the full loop"
                  description={`This score covers ${openRounds.length} of ${interview.rounds.length} rounds. The real ${interview.company} loop continues with the rounds below, plus the recruiter screen, debrief and offer stages.`}
                  bullets={lockedRounds.map((round) => `${round.name} · ${round.minutes} min`)}
                  trailing={
                    <UpgradeButton plan="monthly" returnUrl={`/app/interviews/${interviewId}`}>
                      See the rest of the loop
                    </UpgradeButton>
                  }
                />
              </CardBody>
            </Card>
          ) : null}

          {result.improvements.length ? (
            <Card>
              <CardHeader>
                <div>
                  <h2 className="font-display text-lg font-semibold text-text">Work on these first</h2>
                  <p className="mt-1 text-[13.5px] text-text-secondary">
                    Ordered by how much they cost you in a real loop.
                  </p>
                </div>
              </CardHeader>
              <CardBody className="space-y-3">
                {result.improvements.map((item) => (
                  <div key={item.label} className="rounded-xl border border-borderc bg-soft/50 p-3">
                    <p className="text-[13.5px] font-semibold text-text">{item.label}</p>
                    <p className="mt-1 text-[12.5px] leading-relaxed text-text-secondary">{item.hint}</p>
                  </div>
                ))}
              </CardBody>
            </Card>
          ) : null}

          {result.strengths.length ? (
            <Card>
              <CardHeader>
                <h2 className="font-display text-lg font-semibold text-text">What you did well</h2>
              </CardHeader>
              <CardBody>
                <ul className="space-y-1.5">
                  {result.strengths.map((s) => (
                    <li key={s} className="flex items-start gap-2 text-[13.5px] text-text-secondary">
                      <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-success" />
                      {s}
                    </li>
                  ))}
                </ul>
              </CardBody>
            </Card>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

function BriefList({
  title,
  items,
  numbered = false
}: {
  title: string;
  items: string[];
  numbered?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-display text-[1.05rem] font-semibold text-text">{title}</h2>
      </CardHeader>
      <CardBody>
        <ul className="space-y-2">
          {items.map((item, i) => (
            <li key={item} className="flex gap-2.5 text-[13px] leading-relaxed text-text-secondary">
              <span className="shrink-0 font-mono text-[11px] text-accent">
                {numbered ? String(i + 1).padStart(2, "0") : "—"}
              </span>
              {item}
            </li>
          ))}
        </ul>
      </CardBody>
    </Card>
  );
}

function CodingWorkspacePanel({
  workspace,
  value,
  onChange,
  run,
  running,
  onRun
}: {
  workspace: NonNullable<import("@/data/seed/interviews").InterviewQuestion["coding"]>;
  value: string;
  onChange: (next: string) => void;
  run?: RunResult;
  running: boolean;
  onRun: () => void;
}) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-[13px] font-semibold text-text">
          Write your solution — keep the function named{" "}
          <code className="font-mono text-accent">{workspace.functionName}()</code>
        </p>
        <span className="font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
          JavaScript
        </span>
      </div>

      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        aria-label={`Your ${workspace.language} solution for ${workspace.functionName}`}
        spellCheck={false}
        rows={16}
        className="w-full rounded-xl border border-borderc bg-[hsl(var(--bg-inset))] p-3 font-mono text-[12.5px] leading-relaxed text-text outline-none focus:border-accent/50"
      />

      <div className="flex flex-wrap items-center gap-3">
        <Button variant="secondary" onClick={onRun} loading={running} loadingLabel="Running…">
          <Play className="h-4 w-4" /> Run tests
        </Button>
        {run && !run.error ? (
          <span
            className={`font-mono text-[12.5px] font-semibold ${
              run.passed === run.total ? "text-success" : "text-warn"
            }`}
          >
            {run.passed} / {run.total} passing
          </span>
        ) : null}
      </div>

      {run?.error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 p-3 font-mono text-[12.5px] text-danger">
          {run.error}
        </p>
      ) : null}

      {run && !run.error ? (
        <ul className="divide-y divide-borderc overflow-hidden rounded-xl border border-borderc">
          {run.results.map((r) => (
            <li key={r.name} className="flex items-start gap-2.5 bg-soft/40 p-3">
              {r.passed ? (
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-success" />
              ) : (
                <XCircle className="mt-0.5 h-4 w-4 shrink-0 text-danger" />
              )}
              <div className="min-w-0">
                <p className="text-[13px] text-text">{r.name}</p>
                {!r.passed ? (
                  <p className="mt-1 break-words font-mono text-[11.5px] text-text-secondary">
                    {r.error ? `threw: ${r.error}` : `got ${r.actual} · expected ${r.expected}`}
                  </p>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
