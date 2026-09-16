"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react";
import { RAExpression } from "@/components/ra/ra-expression";
import { RelationTable } from "@/components/ra/relation-table";
import { courseDatabase } from "@/data/seed/db-exam1/relations";
import { evaluate } from "@/lib/relational-algebra/ast";
import { BUILDER_PALETTE } from "@/lib/relational-algebra/notation";
import { tryParseExpression } from "@/lib/relational-algebra/parser";
import type { Relation } from "@/lib/relational-algebra/relation";
import { cn } from "@/lib/utils";

/**
 * The expression builder.
 *
 * Typing σ, Π, ⋈ and ⟕ on a laptop keyboard is not possible, so the palette
 * is not a convenience — without it the typed mode is unusable. Clicking a
 * glyph inserts it at the caret along with the `_{}` its subscript needs and
 * puts the caret inside the braces, because the alternative is a learner
 * fighting the syntax instead of thinking about the query.
 *
 * The live preview is the other half. Relational algebra is a language whose
 * whole meaning is the relation it produces, so showing that relation as the
 * expression is typed turns a guess into an experiment — and a parse error
 * arrives with a position and a sentence rather than "invalid input".
 */

export function ExpressionInput({
  value,
  onChange,
  available,
  disabled = false,
  placeholder = "Π_{…}(…)",
  onSubmit,
  autoFocus = false
}: {
  value: string;
  onChange: (value: string) => void;
  /** Relation names this question allows. */
  available: string[];
  disabled?: boolean;
  placeholder?: string;
  onSubmit?: () => void;
  autoFocus?: boolean;
}) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [showPreview, setShowPreview] = useState(true);

  useEffect(() => {
    if (autoFocus) textareaRef.current?.focus();
  }, [autoFocus]);

  const parsed = useMemo(() => {
    if (!value.trim()) return null;
    return tryParseExpression(value);
  }, [value]);

  const preview = useMemo<{ relation: Relation | null; error: string | null }>(() => {
    if (!parsed || !parsed.ok) return { relation: null, error: null };
    try {
      return { relation: evaluate(parsed.expr, courseDatabase).relation, error: null };
    } catch (error) {
      return {
        relation: null,
        error: error instanceof Error ? error.message : "That expression could not be evaluated."
      };
    }
  }, [parsed]);

  /** Insert at the caret, leaving it inside the braces when there are any. */
  const insert = (snippet: string) => {
    const textarea = textareaRef.current;
    if (!textarea) {
      onChange(value + snippet);
      return;
    }
    const start = textarea.selectionStart ?? value.length;
    const end = textarea.selectionEnd ?? value.length;
    const next = value.slice(0, start) + snippet + value.slice(end);
    onChange(next);

    const brace = snippet.indexOf("{");
    const caret = brace >= 0 ? start + brace + 1 : start + snippet.length;
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(caret, caret);
    });
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap gap-1.5">
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
              "disabled:opacity-40"
            )}
          >
            {entry.glyph}
          </button>
        ))}
      </div>

      {available.length > 0 ? (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-caption uppercase tracking-[0.08em] text-faint">Relations</span>
          {available.map((name) => (
            <button
              key={name}
              type="button"
              disabled={disabled}
              onClick={() => insert(name)}
              className={cn(
                "rounded-lg border border-borderc bg-soft px-2 py-1 font-mono text-[0.75rem] font-semibold text-text transition",
                "hover:border-border-accent hover:bg-accent/10",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                "disabled:opacity-40"
              )}
            >
              {name}
            </button>
          ))}
        </div>
      ) : null}

      <textarea
        ref={textareaRef}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={disabled}
        rows={3}
        spellCheck={false}
        placeholder={placeholder}
        aria-label="Your relational algebra expression"
        aria-invalid={parsed ? !parsed.ok : undefined}
        onKeyDown={(event) => {
          // Enter submits; Shift+Enter is a newline, for long nested answers.
          if (event.key === "Enter" && !event.shiftKey && onSubmit) {
            event.preventDefault();
            onSubmit();
          }
        }}
        className={cn(
          "w-full resize-y rounded-xl border bg-surface px-3 py-2.5 font-mono text-body-sm text-text",
          "placeholder:text-faint focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
          "dark:bg-surface-raised",
          parsed && !parsed.ok ? "border-danger/50" : "border-borderc"
        )}
      />

      {parsed && !parsed.ok ? (
        <p className="flex items-start gap-2 text-body-sm text-danger">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
          <span>{parsed.message}</span>
        </p>
      ) : null}

      {parsed?.ok ? (
        <div className="space-y-2">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="flex items-center gap-2 text-body-sm text-success">
              <CheckCircle2 className="h-4 w-4 shrink-0" aria-hidden />
              <span className="text-text-secondary">Reads as</span>
              <RAExpression expr={parsed.expr} />
            </p>
            <button
              type="button"
              onClick={() => setShowPreview((current) => !current)}
              className="inline-flex items-center gap-1.5 rounded-lg px-2 py-1 text-caption font-semibold uppercase tracking-[0.08em] text-muted transition hover:text-text focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60"
            >
              {showPreview ? (
                <EyeOff className="h-3.5 w-3.5" aria-hidden />
              ) : (
                <Eye className="h-3.5 w-3.5" aria-hidden />
              )}
              {showPreview ? "Hide result" : "Show result"}
            </button>
          </div>

          {showPreview ? (
            preview.error ? (
              <p className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-body-sm text-danger">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
                <span>{preview.error}</span>
              </p>
            ) : preview.relation ? (
              <RelationTable
                relation={preview.relation}
                caption="Your expression returns"
                emptyLabel="Your expression returns no tuples. That is usually a sign a condition is too strict."
              />
            ) : null
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
