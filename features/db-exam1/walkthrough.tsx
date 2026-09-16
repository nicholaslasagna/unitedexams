"use client";

import { useState } from "react";
import { ChevronDown, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { RAExpression } from "@/components/ra/ra-expression";
import { cn } from "@/lib/utils";
import type { WalkthroughStep } from "./question-model";

/**
 * The step-by-step mode.
 *
 * The expression is never the first thing shown. A learner who is handed
 * `Π hotelName (Hotel ⋈ … )` can follow it and still have no idea how to
 * produce the next one, because the hard part was deciding that hotelName is
 * in Hotel and price is in Room and that therefore a join is unavoidable.
 *
 * So each step asks a question first, waits, and only then answers it. The
 * questions are the same five every time — output, conditions, which relation
 * holds what, whether a join is needed, what connects them — because the goal
 * is a procedure the learner can run themselves in the exam, not a solution
 * to this particular problem.
 */
export function Walkthrough({
  steps,
  onClose,
  className
}: {
  steps: WalkthroughStep[];
  onClose?: () => void;
  className?: string;
}) {
  const [revealed, setRevealed] = useState(0);
  const finished = revealed >= steps.length;

  return (
    <section
      className={cn(
        "rounded-xl border border-border-accent bg-accent-wash px-4 py-4",
        className
      )}
      aria-label="Step-by-step walkthrough"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div>
          <h3 className="text-body-sm font-semibold text-text">Work through it</h3>
          <p className="mt-0.5 text-caption text-text-secondary">
            Same five questions every time. Answer each one before revealing it.
          </p>
        </div>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close walkthrough"
            className="rounded-lg p-1 text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
          >
            <X className="h-4 w-4" aria-hidden />
          </button>
        ) : null}
      </div>

      <ol className="space-y-2">
        {steps.map((step, index) => {
          const isRevealed = index < revealed;
          const isNext = index === revealed;
          const isLast = index === steps.length - 1;

          return (
            <li
              key={index}
              className={cn(
                "rounded-lg border px-3.5 py-3 transition",
                isRevealed
                  ? "border-borderc bg-surface dark:bg-surface-raised"
                  : isNext
                    ? "border-border-accent bg-surface dark:bg-surface-raised"
                    : "border-borderc/60 bg-transparent opacity-50"
              )}
            >
              <p className="flex items-start gap-2.5 text-body-sm font-semibold text-text">
                <span
                  className={cn(
                    "mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[0.7rem] font-bold",
                    isRevealed ? "bg-accent text-accent-fg" : "bg-soft text-faint"
                  )}
                  aria-hidden
                >
                  {index + 1}
                </span>
                <span>{step.ask}</span>
              </p>

              {isRevealed ? (
                <div className="ml-7 mt-2 space-y-1.5 pl-0.5">
                  {/* The final step is the expression itself, so it renders in
                      notation rather than as a sentence. */}
                  {isLast ? (
                    <div className="overflow-x-auto rounded-lg border border-borderc bg-soft px-3 py-2">
                      <RAExpression source={step.answer} />
                    </div>
                  ) : (
                    <p className="text-body-sm text-text">{step.answer}</p>
                  )}
                  {step.why ? (
                    <p className="text-body-sm text-text-secondary">{step.why}</p>
                  ) : null}
                </div>
              ) : null}
            </li>
          );
        })}
      </ol>

      {!finished ? (
        <Button
          variant="secondary"
          size="sm"
          className="mt-3"
          onClick={() => setRevealed((current) => current + 1)}
        >
          <ChevronDown className="h-3.5 w-3.5" aria-hidden />
          {revealed === 0 ? "Reveal step 1" : `Reveal step ${revealed + 1}`}
        </Button>
      ) : (
        <p className="mt-3 text-body-sm text-text-secondary">
          That is the whole procedure. Ask yourself the same questions on the next one.
        </p>
      )}
    </section>
  );
}
