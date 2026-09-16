"use client";

import { useLayoutEffect, useRef, type RefObject } from "react";
import { BUILDER_PALETTE } from "@/lib/relational-algebra/notation";
import { cn } from "@/lib/utils";

/**
 * The relational-algebra symbols, as clickable buttons.
 *
 * σ, Π, ⋈, ⟕, ▷ and ÷ are not on a keyboard. Without this, a question that
 * asks for an expression can be read but not answered — which is how the
 * Exam 1 paper shipped: four of its questions ask for algebra and the runner
 * gave a plain textarea.
 *
 * Insertion goes at the caret rather than the end, and lands inside the
 * braces when the snippet has any, so the next thing typed is the subscript.
 * Appending to the end instead would mean retyping the whole expression
 * around every symbol.
 */

type TextField = HTMLInputElement | HTMLTextAreaElement;

/**
 * Topics whose written answers are relational algebra.
 *
 * Driven by the tags a question already carries, so no content has to be
 * re-authored — and a Theory of Automata free-response does not get handed a
 * palette of database operators.
 */
const ALGEBRA_TAGS = new Set([
  "relational-algebra",
  "selection",
  "projection",
  "cartesian-product",
  "equijoin",
  "natural-join",
  "outer-join-left",
  "outer-join-right",
  "outer-join-full",
  "semijoin",
  "division",
  "reading-expressions",
  "writing-expressions",
  "multi-table"
]);

export function needsAlgebraSymbols(tags: string[]): boolean {
  return tags.some((tag) => ALGEBRA_TAGS.has(tag));
}

/**
 * Where the caret belongs after `snippet` is inserted at `start`.
 *
 * Inside the braces when the snippet has any — σ_{} and ⋈_{} are useless
 * without a subscript, so that is where the next keystroke goes — and after
 * the snippet otherwise.
 */
export function caretAfterInsert(snippet: string, start: number): number {
  const brace = snippet.indexOf("{");
  return brace >= 0 ? start + brace + 1 : start + snippet.length;
}

/**
 * Insert at the caret, then put the caret where the next keystroke belongs.
 *
 * The caret has to be restored *after* React writes the new value, because
 * assigning `value` on a field moves the caret to the end. A layout effect is
 * the only place that is reliably true: `requestAnimationFrame` is paused
 * while the document is hidden, which leaves the field focused with the caret
 * at the end until a frame is eventually serviced.
 */
export function useCaretInsert(
  targetRef: RefObject<TextField | null>,
  value: string,
  onChange: (next: string) => void
) {
  const pendingCaret = useRef<number | null>(null);

  useLayoutEffect(() => {
    const caret = pendingCaret.current;
    if (caret === null) return;
    pendingCaret.current = null;
    const field = targetRef.current;
    if (!field) return;
    field.focus();
    field.setSelectionRange(caret, caret);
  });

  return (snippet: string) => {
    const field = targetRef.current;
    if (!field) {
      onChange(value + snippet);
      return;
    }
    const start = field.selectionStart ?? value.length;
    const end = field.selectionEnd ?? value.length;
    pendingCaret.current = caretAfterInsert(snippet, start);
    onChange(value.slice(0, start) + snippet + value.slice(end));
  };
}

export function SymbolPalette({
  targetRef,
  value,
  onChange,
  disabled = false,
  label = "Symbols",
  className
}: {
  /** The field to insert into. */
  targetRef: RefObject<TextField | null>;
  value: string;
  onChange: (next: string) => void;
  disabled?: boolean;
  label?: string;
  className?: string;
}) {
  const insert = useCaretInsert(targetRef, value, onChange);

  return (
    <div className={cn("space-y-1.5", className)}>
      {label ? (
        <p className="text-xs font-semibold uppercase tracking-[0.14em] text-muted">{label}</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5" role="group" aria-label="Insert a relational algebra symbol">
        {BUILDER_PALETTE.map((entry) => (
          <button
            key={`${entry.glyph}-${entry.label}`}
            type="button"
            disabled={disabled}
            onClick={() => insert(entry.insert)}
            title={entry.label}
            aria-label={`Insert ${entry.label}`}
            className={cn(
              "h-9 min-w-9 rounded-lg border border-borderc bg-soft px-2 font-serif text-[1.05rem] font-semibold text-accent transition",
              "hover:border-border-accent hover:bg-accent/10",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
              "disabled:cursor-not-allowed disabled:opacity-40"
            )}
          >
            {entry.glyph}
          </button>
        ))}
      </div>
    </div>
  );
}
