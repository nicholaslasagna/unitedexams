"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { tokenize, toSpeech, type NotationToken } from "@/lib/relational-algebra/notation";
import { tryParseExpression } from "@/lib/relational-algebra/parser";
import type { RAExpr } from "@/lib/relational-algebra/ast";

/**
 * Relational algebra, rendered the way the course writes it.
 *
 * Deliberately not KaTeX. The outer-join glyphs ⟕ ⟖ ⟗ have no core KaTeX
 * macro, and a macro that does not resolve renders as literal backslash-text
 * in front of someone revising for an exam. Unicode plus a real `<sub>` is
 * more reliable, lighter, and lets the operator carry a tooltip and an
 * accessible name.
 *
 * The visible text is the notation; the accessible name is the spoken form,
 * so a screen reader says "projection of hotelName from …" rather than
 * reading out "Pi hotelName".
 */

function TokenSpan({ token }: { token: NotationToken }) {
  switch (token.kind) {
    case "operator":
      return (
        <span
          className="font-serif text-[1.15em] font-semibold text-accent"
          title={token.title}
        >
          {token.text}
        </span>
      );
    case "subscript":
    case "attributes":
      return (
        <sub className="ml-[1px] text-[0.72em] font-medium leading-none text-text-secondary">
          {token.text}
        </sub>
      );
    case "relation":
      return <span className="font-semibold text-text">{token.text}</span>;
    case "punct":
      return <span className="text-muted">{token.text}</span>;
    case "space":
      return <span> </span>;
  }
}

export function RAExpression({
  expr,
  source,
  className,
  block = false
}: {
  /** A parsed expression… */
  expr?: RAExpr;
  /** …or the text to parse. Unparseable text is shown verbatim. */
  source?: string;
  className?: string;
  /** Renders as a centred block rather than inline. */
  block?: boolean;
}) {
  const resolved = useMemo<RAExpr | null>(() => {
    if (expr) return expr;
    if (!source) return null;
    const parsed = tryParseExpression(source);
    return parsed.ok ? parsed.expr : null;
  }, [expr, source]);

  // Falling back to the raw string keeps a content typo visible as text
  // rather than swallowing the whole expression.
  if (!resolved) {
    return (
      <span className={cn("font-mono text-body-sm text-text-secondary", className)}>
        {source}
      </span>
    );
  }

  const tokens = tokenize(resolved);

  return (
    <span
      className={cn(
        "ra-expression whitespace-nowrap font-mono text-text",
        block && "block overflow-x-auto py-1 text-center",
        className
      )}
      role="math"
      aria-label={toSpeech(resolved)}
    >
      {tokens.map((token, index) => (
        <TokenSpan key={index} token={token} />
      ))}
    </span>
  );
}

/** A single operator glyph with its name — for palettes and the cheat sheet. */
export function RAGlyph({
  glyph,
  label,
  className
}: {
  glyph: string;
  label?: string;
  className?: string;
}) {
  return (
    <span
      className={cn("font-serif text-[1.1em] font-semibold text-accent", className)}
      title={label}
      aria-label={label}
    >
      {glyph}
    </span>
  );
}
