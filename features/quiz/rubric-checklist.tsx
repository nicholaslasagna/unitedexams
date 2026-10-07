"use client";

import { Markdown } from "@/components/ui/markdown";
import type { RubricItem } from "@/lib/types";
import { cn } from "@/lib/utils";

/**
 * Grade a written answer against its marking scheme.
 *
 * Partial credit is how a long answer is actually marked: a state graph
 * with one arrow wrong is not worth zero, and it is not worth full marks
 * either. Each criterion is one thing a full answer contains, so ticking it
 * is a yes/no judgement rather than a guess at a number.
 */
export function RubricChecklist({
  rubric,
  ticked,
  onToggle,
  disabled = false
}: {
  rubric: RubricItem[];
  ticked: number[];
  onToggle: (index: number) => void;
  disabled?: boolean;
}) {
  const available = rubric.reduce((sum, item) => sum + item.marks, 0);
  const earned = rubric.reduce((sum, item, index) => (ticked.includes(index) ? sum + item.marks : sum), 0);

  return (
    <fieldset className="space-y-2">
      <legend className="flex w-full items-center justify-between gap-3 text-xs font-semibold uppercase tracking-[0.12em] text-muted">
        <span>Marking scheme</span>
        <span className="font-mono normal-case tracking-normal text-text">
          {earned} / {available} marks
        </span>
      </legend>
      <p className="text-xs text-text-secondary">
        Tick only what your answer actually contains. An unticked criterion earns nothing.
      </p>
      <ul className="space-y-1.5">
        {rubric.map((item, index) => {
          const checked = ticked.includes(index);
          return (
            <li key={item.criterion}>
              <label
                className={cn(
                  "flex items-start gap-3 rounded-lg border px-3 py-2 text-sm transition",
                  checked ? "border-success/40 bg-success/10" : "border-borderc bg-surface",
                  disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer hover:border-border-accent"
                )}
              >
                <input
                  type="checkbox"
                  className="mt-1 h-4 w-4 shrink-0 accent-success"
                  checked={checked}
                  disabled={disabled}
                  onChange={() => onToggle(index)}
                />
                <span className="min-w-0 flex-1 text-text">
                  {/* No paragraph margin, so the text's first line sits level with the checkbox. */}
                  <Markdown content={item.criterion} className="text-sm [&_p]:m-0" />
                </span>
                <span className="mt-0.5 shrink-0 font-mono text-xs text-muted">
                  {item.marks} {item.marks === 1 ? "mark" : "marks"}
                </span>
              </label>
            </li>
          );
        })}
      </ul>
    </fieldset>
  );
}
