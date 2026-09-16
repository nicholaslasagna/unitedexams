"use client";

import { useMemo, useState } from "react";
import { RefreshCw, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RAExpression } from "@/components/ra/ra-expression";
import { RelationTable, type RowState } from "@/components/ra/relation-table";
import { attr, compare } from "@/lib/relational-algebra/condition";
import {
  divide,
  naturalJoin,
  outerJoin,
  product,
  semijoin,
  thetaJoin,
  type JoinTrace
} from "@/lib/relational-algebra/operations";
import { project } from "@/lib/relational-algebra/operations";
import type { Relation } from "@/lib/relational-algebra/relation";
import { relationR, relationS } from "@/data/seed/db-exam1/relations";
import { JOIN_SPECS, generateJoinPair } from "./generators/joins";
import { cn } from "@/lib/utils";

/**
 * The Table Lab.
 *
 * Every highlight comes from the evaluator's trace, not from a hand-authored
 * animation — so what is shown matching is what actually matched. The point
 * is not motion for its own sake; it is to make three normally invisible
 * things visible: which values are compared, which tuples find partners, and
 * where the NULLs in an outer join come from.
 */

type Operation =
  | "product"
  | "equijoin"
  | "natural"
  | "left-outer"
  | "right-outer"
  | "full-outer"
  | "semijoin"
  | "semijoin-right"
  | "division";

const OPERATIONS: { id: Operation; glyph: string; label: string; expression: string }[] = [
  { id: "product", glyph: "X", label: "Cartesian product", expression: "R X S" },
  { id: "equijoin", glyph: "⋈", label: "Equijoin", expression: "R ⋈_{R.j = S.j} S" },
  { id: "natural", glyph: "⋈", label: "Natural join", expression: "R ⋈ S" },
  { id: "left-outer", glyph: "⟕", label: "Left outer", expression: "R ⟕_{R.j = S.j} S" },
  { id: "right-outer", glyph: "⟖", label: "Right outer", expression: "R ⟖_{R.j = S.j} S" },
  { id: "full-outer", glyph: "⟗", label: "Full outer", expression: "R ⟗_{R.j = S.j} S" },
  { id: "semijoin", glyph: "▷", label: "Semijoin R ▷ S", expression: "R ▷_{R.j = S.j} S" },
  { id: "semijoin-right", glyph: "▷", label: "Semijoin S ▷ R", expression: "S ▷_{S.j = R.j} R" },
  { id: "division", glyph: "÷", label: "Division", expression: "Π_{r2, j}(R) ÷ Π_{j}(S)" }
];

const J = compare(attr("R.j"), "=", attr("S.j"));
const J_REVERSED = compare(attr("S.j"), "=", attr("R.j"));

interface LabResult {
  relation: Relation;
  trace: JoinTrace | null;
  /** Rows of the left source table, by state. */
  leftStates: RowState[];
  rightStates: RowState[];
  resultStates: RowState[];
  /** What the operation does, and why the result looks like it does. */
  explanation: string;
  /** The single sentence worth remembering. */
  takeaway: string;
  strikeAttributes?: string[];
}

function statesFromMatches(matches: number[][], count: number): RowState[] {
  return Array.from({ length: count }, (_, index) =>
    matches[index] && matches[index].length > 0 ? "match" : "unmatched"
  );
}

function buildResult(left: Relation, right: Relation, operation: Operation): LabResult {
  const blank = (relation: Relation): RowState[] => relation.tuples.map(() => "normal");

  switch (operation) {
    case "product": {
      const { relation, trace } = product(left, right);
      return {
        relation,
        trace,
        leftStates: blank(left),
        rightStates: blank(right),
        resultStates: relation.tuples.map(() => "normal"),
        explanation:
          `Every tuple of R is concatenated with every tuple of S — no condition is applied, so ` +
          `nothing is dimmed and nothing is dropped. ${left.tuples.length} × ${right.tuples.length} = ` +
          `${relation.tuples.length} tuples, and ${left.attributes.length} + ${right.attributes.length} = ` +
          `${relation.attributes.length} attributes.`,
        takeaway: "Cardinality multiplies. Degree adds."
      };
    }

    case "equijoin": {
      const { relation, trace } = thetaJoin(left, right, J);
      return {
        relation,
        trace,
        leftStates: statesFromMatches(trace.matchesByLeft, left.tuples.length),
        rightStates: statesFromMatches(trace.matchesByRight, right.tuples.length),
        resultStates: relation.tuples.map(() => "match"),
        explanation:
          `Only the pairs whose j values are equal survive. A tuple that matches two tuples on ` +
          `the other side produces two result rows — that fan-out is why the result has ` +
          `${relation.tuples.length} tuples rather than one per row. Dimmed tuples found no ` +
          `partner and contribute nothing.`,
        takeaway: "Both copies of the joining attribute stay — degree is still the sum."
      };
    }

    case "natural": {
      const { relation, trace, commonAttributes } = naturalJoin(left, right);
      return {
        relation,
        trace,
        leftStates: statesFromMatches(trace.matchesByLeft, left.tuples.length),
        rightStates: statesFromMatches(trace.matchesByRight, right.tuples.length),
        resultStates: relation.tuples.map(() => "match"),
        explanation:
          `The common attribute ${commonAttributes.join(", ")} is matched automatically — there is ` +
          `no condition to write. The same tuples as the equijoin come through, but S's copy of ` +
          `${commonAttributes.join(", ")} is struck out and removed, so the degree drops by one to ` +
          `${relation.attributes.length}.`,
        takeaway: "Same rows as the equijoin, one column narrower.",
        strikeAttributes: commonAttributes
      };
    }

    case "left-outer":
    case "right-outer":
    case "full-outer": {
      const side = operation === "left-outer" ? "left" : operation === "right-outer" ? "right" : "full";
      const { relation, trace } = outerJoin(left, right, side, J);
      const keepsLeft = side === "left" || side === "full";
      const keepsRight = side === "right" || side === "full";

      const unmatchedLeftCount = trace.unmatchedLeft.length;
      const unmatchedRightCount = trace.unmatchedRight.length;

      return {
        relation,
        trace,
        leftStates: left.tuples.map((_, index) =>
          trace.matchesByLeft[index]?.length > 0 ? "match" : keepsLeft ? "padded" : "unmatched"
        ),
        rightStates: right.tuples.map((_, index) =>
          trace.matchesByRight[index]?.length > 0 ? "match" : keepsRight ? "padded" : "unmatched"
        ),
        resultStates: trace.rows.map((row) => (row.padded ? "padded" : "match")),
        explanation:
          `Start from the matching pairs, then keep the unmatched tuples from the ` +
          `${side === "full" ? "BOTH relations" : `${side.toUpperCase()} relation`}. ` +
          (keepsLeft && unmatchedLeftCount > 0
            ? `${unmatchedLeftCount} tuple${unmatchedLeftCount === 1 ? "" : "s"} of R had no partner, so ` +
              `every attribute that would have come from S is filled with NULL — there is no value to put there. `
            : "") +
          (keepsRight && unmatchedRightCount > 0
            ? `${unmatchedRightCount} tuple${unmatchedRightCount === 1 ? "" : "s"} of S had no partner and ` +
              `are padded on R's side. `
            : "") +
          (!keepsLeft && unmatchedLeftCount > 0
            ? `The ${unmatchedLeftCount} unmatched tuple${unmatchedLeftCount === 1 ? "" : "s"} of R ` +
              `${unmatchedLeftCount === 1 ? "is" : "are"} dropped — this side is not preserved. `
            : "") +
          (!keepsRight && unmatchedRightCount > 0
            ? `The ${unmatchedRightCount} unmatched tuple${unmatchedRightCount === 1 ? "" : "s"} of S ` +
              `${unmatchedRightCount === 1 ? "is" : "are"} dropped. `
            : "") +
          `Note that the result has ${relation.tuples.length} tuples, not ` +
          `${left.tuples.length * right.tuples.length} — an outer join still only pairs tuples that match.`,
        takeaway:
          side === "full"
            ? "Nothing is lost from either side — but this is still not a Cartesian product."
            : `The side named is the side preserved: ${side} outer join keeps every tuple of the ${side} relation.`
      };
    }

    case "semijoin":
    case "semijoin-right": {
      const isLeft = operation === "semijoin";
      const [keep, decide] = isLeft ? [left, right] : [right, left];
      const { relation, trace } = semijoin(keep, decide, isLeft ? J : J_REVERSED);

      const keepStates = keep.tuples.map<RowState>((_, index) =>
        trace.matchesByLeft[index]?.length > 0 ? "match" : "removed"
      );
      const decideStates = decide.tuples.map<RowState>(() => "normal");

      return {
        relation,
        trace,
        leftStates: isLeft ? keepStates : decideStates,
        rightStates: isLeft ? decideStates : keepStates,
        resultStates: relation.tuples.map(() => "match"),
        explanation:
          `${decide.name} decides which tuples of ${keep.name} qualify, then disappears entirely. ` +
          `${relation.tuples.length} of ${keep.name}'s ${keep.tuples.length} tuples have at least one ` +
          `match. The result has ${keep.name}'s ${relation.attributes.length} attributes and none of ` +
          `${decide.name}'s — and each qualifying tuple appears exactly once, however many matches it had.`,
        takeaway: `${keep.name} ▷ ${decide.name} returns ${keep.name}'s attributes only. The operator is directional.`
      };
    }

    case "division": {
      const dividend = project(left, ["r2", "j"]).relation;
      const divisor = project(right, ["j"]).relation;
      const { relation } = divide(dividend, divisor);
      return {
        relation,
        trace: null,
        leftStates: blank(left),
        rightStates: blank(right),
        resultStates: relation.tuples.map(() => "match"),
        explanation:
          `Π r2, j (R) is divided by Π j (S). An r2 value qualifies only if it is paired with ` +
          `EVERY j in the divisor — ${divisor.tuples.length} of them here. Extra pairings are ` +
          `ignored and never disqualify a value. ${
            relation.tuples.length === 0
              ? "Nothing covers every divisor value, so the result is empty — a legitimate answer."
              : `${relation.tuples.map((t) => t[0]).join(", ")} qualif${relation.tuples.length === 1 ? "ies" : "y"}.`
          }`,
        takeaway: "Division means for all, never for some."
      };
    }
  }
}

export function TableLab({ className }: { className?: string }) {
  const [operation, setOperation] = useState<Operation>("equijoin");
  const [seed, setSeed] = useState<number | null>(null);
  const [hoveredLeft, setHoveredLeft] = useState<number | null>(null);

  const { left, right } = useMemo(() => {
    if (seed === null) return { left: relationR, right: relationS };
    const pair = generateJoinPair(seed, JOIN_SPECS.core);
    return { left: pair.left, right: pair.right };
  }, [seed]);

  const result = useMemo(() => buildResult(left, right, operation), [left, right, operation]);
  const active = OPERATIONS.find((entry) => entry.id === operation)!;

  // Hovering a tuple on the left focuses the tuples it matches on the right,
  // which is how you see a one-to-many fan-out rather than being told about it.
  const focusedRight = useMemo(() => {
    if (hoveredLeft === null || !result.trace) return null;
    return new Set(result.trace.matchesByLeft[hoveredLeft] ?? []);
  }, [hoveredLeft, result.trace]);

  const rightStates = useMemo<RowState[]>(() => {
    if (!focusedRight) return result.rightStates;
    return right.tuples.map((_, index) => (focusedRight.has(index) ? "match" : "unmatched"));
  }, [focusedRight, result.rightStates, right.tuples]);

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading font-semibold text-text">Table Lab</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            Run an operation over two relations and watch what it does.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setSeed(null)}
            disabled={seed === null}
          >
            <RefreshCw className="h-3.5 w-3.5" aria-hidden />
            Homework data
          </Button>
          <Button variant="secondary" size="sm" onClick={() => setSeed(Math.floor(Math.random() * 100000))}>
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            New tables
          </Button>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        <div
          className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
          role="tablist"
          aria-label="Operation"
        >
          {OPERATIONS.map((entry) => (
            <button
              key={entry.id}
              type="button"
              role="tab"
              aria-selected={entry.id === operation}
              onClick={() => setOperation(entry.id)}
              className={cn(
                "shrink-0 rounded-xl border px-3 py-2 text-body-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                entry.id === operation
                  ? "border-transparent bg-brand-gradient text-brand-fg shadow-soft"
                  : "border-borderc bg-soft text-muted hover:text-text"
              )}
            >
              <span className="mr-1.5 font-serif text-[1.05em]">{entry.glyph}</span>
              {entry.label}
            </button>
          ))}
        </div>

        <div className="rounded-xl border border-border-accent bg-accent-wash px-4 py-3">
          <RAExpression source={active.expression} block className="text-[1.05rem]" />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <div
            onMouseLeave={() => setHoveredLeft(null)}
            onBlur={() => setHoveredLeft(null)}
          >
            <RelationTable
              relation={left}
              caption={left.name}
              rowStates={result.leftStates}
              highlightAttributes={operation === "product" ? [] : ["j"]}
              onRowFocus={(index) => setHoveredLeft(index)}
            />
            {hoveredLeft !== null && result.trace ? (
              <p className="mt-2 text-body-sm text-text">
                {`${String(left.tuples[hoveredLeft]?.[0])} matches ${
                  result.trace.matchesByLeft[hoveredLeft]?.length
                    ? result.trace.matchesByLeft[hoveredLeft]
                        .map((index) => String(right.tuples[index]?.[0]))
                        .join(", ")
                    : "nothing"
                }${
                  operation !== "product" && operation !== "division"
                    ? ` on j = ${String(left.tuples[hoveredLeft]?.[1])}`
                    : ""
                }.`}
              </p>
            ) : null}
            {/* Hover targets sit on the rendered rows via a sibling overlay is
                fragile; a simple row list keeps the interaction accessible. */}
            <div className="mt-2 flex flex-wrap gap-1.5">
              {left.tuples.map((tuple, index) => (
                <button
                  key={index}
                  type="button"
                  onMouseEnter={() => setHoveredLeft(index)}
                  onFocus={() => setHoveredLeft(index)}
                  onClick={() => setHoveredLeft(hoveredLeft === index ? null : index)}
                  className={cn(
                    "rounded-lg border px-2 py-1 font-mono text-[0.72rem] transition",
                    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                    hoveredLeft === index
                      ? "border-border-accent bg-accent/15 text-accent"
                      : "border-borderc bg-soft text-muted hover:text-text"
                  )}
                  aria-label={`Focus matches for ${String(tuple[0])}`}
                >
                  {String(tuple[0])}
                  {result.trace ? (
                    <span className="ml-1 text-faint">
                      ·{result.trace.matchesByLeft[index]?.length ?? 0}
                    </span>
                  ) : null}
                </button>
              ))}
            </div>
          </div>

          <RelationTable
            relation={right}
            caption={right.name}
            rowStates={rightStates}
            highlightAttributes={operation === "product" ? [] : ["j"]}
          />
        </div>

        <div className="rounded-xl border border-borderc bg-soft px-4 py-3">
          <p className="text-body-sm leading-relaxed text-text-secondary">{result.explanation}</p>
          <p className="mt-2 flex items-start gap-2 text-body-sm font-semibold text-text">
            <span aria-hidden className="mt-[0.35em] h-1.5 w-1.5 shrink-0 rounded-full bg-accent" />
            {result.takeaway}
          </p>
        </div>

        <RelationTable
          relation={result.relation}
          caption="Result"
          rowStates={result.resultStates}
          strikeAttributes={result.strikeAttributes}
          highlightAttributes={
            operation === "product" || operation === "division" ? [] : ["j"]
          }
          emptyLabel="No tuples qualify — an empty relation is a valid result."
        />
      </CardBody>
    </Card>
  );
}
