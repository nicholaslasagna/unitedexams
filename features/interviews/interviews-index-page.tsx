"use client";

import Link from "next/link";
import { ArrowRight, KeyRound, Lock } from "lucide-react";
import { Card, CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { companyInterviews } from "@/data/seed/interviews";
import { useAppData } from "@/lib/app-data-context";
import { useAccess } from "@/lib/hooks/use-access";
import { resolveLock } from "@/lib/access";
import { bestScoreForQuiz } from "@/features/progress/metrics";
import { distinctAttemptsBeforeRepeat } from "@/lib/interviews/select-questions";

export function InterviewsIndexContent() {
  const { ready, isAuthenticated, attempts } = useAppData();
  const access = useAccess();
  const hasFullLoop = resolveLock(access, { premiumOrInstitution: true }) === "open";

  if (!ready) return <Skeleton className="h-96" />;

  if (!isAuthenticated) {
    return (
      <Card>
        <CardBody className="space-y-3 p-6">
          <p className="inline-flex items-center gap-2 font-display text-xl font-semibold text-text">
            <Lock className="h-5 w-5 text-accent" /> Sign in to practice interviews
          </p>
          <p className="max-w-lg text-[14px] leading-relaxed text-text-secondary">
            Every interview is scored and saved, so you can see what to improve, retake it, and beat your
            own score.
          </p>
          <Button asChild>
            <Link href="/login?next=/app/interviews">Sign in</Link>
          </Button>
        </CardBody>
      </Card>
    );
  }

  return (
    <div className="space-y-5">
      <section className="space-y-1.5">
        <h1 className="font-display text-[2rem] font-semibold leading-tight tracking-tight text-text sm:text-[2.4rem]">
          Interview practice
        </h1>
        <p className="max-w-2xl text-[14px] leading-relaxed text-text-secondary">
          Real interview loops, run the way the company actually runs them — same rounds, same rubric,
          same follow-up questions. You get scored, told exactly what to fix, and can retake it.
          {hasFullLoop
            ? " You have the complete loop, including the recruiter screen, debrief and offer stages."
            : " Every company includes a full coding round free — Premium opens the rest of the loop."}
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="font-display text-[1.4rem] font-semibold tracking-tight text-text">
          Big tech
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {companyInterviews.map((interview) => {
            const best = bestScoreForQuiz(attempts, interview.id);
            const lockedRoundCount = hasFullLoop
              ? 0
              : interview.rounds.filter((round) => round.premium).length;
            const openRoundCount = interview.rounds.length - lockedRoundCount;
            // Only count minutes for rounds this account actually sits, so a
            // free candidate isn't promised a 130-minute loop they can't take.
            const openMinutes = interview.rounds
              .filter((round) => hasFullLoop || !round.premium)
              .reduce((sum, round) => sum + round.minutes, 0);
            // Rounds draw from a bank, so the card should say how much
            // material is actually behind the loop rather than implying the
            // same questions every time.
            const openBankSize = interview.rounds
              .filter((round) => hasFullLoop || !round.premium)
              .reduce((sum, round) => sum + round.questions.length, 0);
            const freshSittings = distinctAttemptsBeforeRepeat(interview);
            return (
              <Link
                key={interview.id}
                href={`/app/interviews/${interview.id}`}
                className="group flex flex-col overflow-hidden rounded-2xl border border-borderc bg-surface p-5 shadow-[0_1px_0_hsl(var(--surface-raised)/0.06)_inset,0_18px_44px_-24px_hsl(var(--text)/0.28)] transition-all duration-200 ease-out-expo hover:-translate-y-px hover:border-border-accent dark:bg-surface-raised"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="font-display text-[1.25rem] font-semibold leading-tight text-text">
                      {interview.company}
                    </p>
                    <p className="mt-0.5 text-[13px] text-text-secondary">
                      {interview.role} · {interview.level}
                    </p>
                  </div>
                  {best > 0 ? (
                    <span className="shrink-0 rounded-full border border-accent/30 bg-accent/10 px-2.5 py-1 font-mono text-[11px] font-semibold text-accent">
                      best {best}%
                    </span>
                  ) : null}
                </div>

                <p className="mt-3 line-clamp-3 text-[13px] leading-relaxed text-text-secondary">
                  {interview.blurb}
                </p>

                <p className="mt-4 font-mono text-[11px] uppercase tracking-[0.18em] text-text-secondary">
                  {openRoundCount} of {interview.rounds.length} rounds
                  <span className="mx-2 text-text-secondary/50">·</span>
                  ~{openMinutes} min
                  <span className="mx-2 text-text-secondary/50">·</span>
                  {openBankSize} q bank
                </p>
                {lockedRoundCount > 0 ? (
                  <p className="mt-2 inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-accent">
                    <KeyRound className="h-3 w-3" />
                    {lockedRoundCount} more {lockedRoundCount === 1 ? "round" : "rounds"} with Premium
                  </p>
                ) : null}

                {freshSittings > 1 ? (
                  <p className="mt-2 text-[11.5px] text-text-secondary">
                    Different questions each sitting — {freshSittings} before any repeat.
                  </p>
                ) : null}

                <span className="mt-4 flex items-center justify-between border-t border-borderc pt-3 text-[12.5px] font-semibold text-text-secondary transition-colors group-hover:text-text">
                  {best > 0 ? "Retake with new questions" : "Start interview"}
                  <ArrowRight className="h-4 w-4 transition-transform duration-200 ease-out-expo group-hover:translate-x-1" />
                </span>
              </Link>
            );
          })}
        </div>
        {/* ponytail: more tracks (startups, new grad, non-technical) get added
            to this same list — no scaffolding until the content exists. */}
        <p className="text-[12.5px] text-text-secondary">
          More interview types are coming. Big tech first.
        </p>
      </section>
    </div>
  );
}
