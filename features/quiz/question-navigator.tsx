"use client";

import { cn } from "@/lib/utils";

interface QuestionNavigatorProps {
  total: number;
  currentIndex: number;
  onJump: (idx: number) => void;
  answered: Set<string>;
  ids: string[];
  correctness?: Map<string, boolean>;
}

export function QuestionNavigator({
  total,
  currentIndex,
  onJump,
  answered,
  ids,
  correctness
}: QuestionNavigatorProps) {
  return (
    <aside className="rounded-2xl border border-borderc bg-surface p-4">
      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.14em] text-muted">Navigator</p>
      <div className="grid grid-cols-5 gap-2">
        {Array.from({ length: total }).map((_, idx) => {
          const id = ids[idx];
          const isCurrent = idx === currentIndex;
          const isAnswered = answered.has(id);
          const correctnessValue = correctness?.get(id);
          return (
            <button
              key={id}
              type="button"
              onClick={() => onJump(idx)}
              aria-label={`Go to question ${idx + 1}`}
              className={cn(
                "h-9 rounded-lg border text-xs font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/70",
                isCurrent && "border-brand-2 bg-brand-2/15 text-text",
                !isCurrent && !isAnswered && "border-borderc bg-soft text-muted hover:text-text",
                isAnswered && !isCurrent && "border-brand-2/40 bg-brand-2/10 text-text",
                correctnessValue === true && "border-success/40 bg-success/15 text-success",
                correctnessValue === false && "border-danger/40 bg-danger/15 text-danger"
              )}
            >
              {idx + 1}
            </button>
          );
        })}
      </div>
    </aside>
  );
}
