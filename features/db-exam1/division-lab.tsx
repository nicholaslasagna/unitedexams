"use client";

import { useMemo, useState } from "react";
import { Check, Shuffle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { RAExpression } from "@/components/ra/ra-expression";
import { RelationTable } from "@/components/ra/relation-table";
import { relationR, relationS } from "@/data/seed/db-exam1/relations";
import { divide, project, select } from "@/lib/relational-algebra/operations";
import { attr, compare, lit, or } from "@/lib/relational-algebra/condition";
import { JOIN_SPECS, generateJoinPair } from "./generators/joins";
import { cn } from "@/lib/utils";

/**
 * The Division Lab.
 *
 * Division is the operator students describe correctly and compute wrongly,
 * because "for all" is easy to say and hard to hold while reading a table.
 * The coverage grid makes the quantifier physical: one column per divisor
 * value, one row per candidate, and a value qualifies only when its row is
 * ticked all the way across. Extra pairings sit outside the grid entirely,
 * which is the visual form of "extra pairings never disqualify a value".
 */
export function DivisionLab({ className }: { className?: string }) {
  const [seed, setSeed] = useState<number | null>(null);
  const [divisorSize, setDivisorSize] = useState(2);
  const [marks, setMarks] = useState<boolean[][]>([]);
  const [qualify, setQualify] = useState<boolean[]>([]);
  const [checked, setChecked] = useState(false);

  const { dividend, divisor, quotient, trace, extras } = useMemo(() => {
    const source =
      seed === null
        ? { left: relationR, right: relationS }
        : (() => {
            const pair = generateJoinPair(seed, JOIN_SPECS.core);
            return { left: pair.left, right: pair.right };
          })();

    const dividendRelation = project(source.left, ["r2", "j"]).relation;

    // Divisor: the first `divisorSize` j values that appear in both, so the
    // exercise always has something to chew on.
    const rightJ = [...new Set(source.right.tuples.map((tuple) => String(tuple[1])))];
    const leftJ = new Set(source.left.tuples.map((tuple) => String(tuple[1])));
    const shared = rightJ.filter((value) => leftJ.has(value)).slice(0, divisorSize);

    const divisorRelation = project(
      select(
        source.right,
        shared.length === 1
          ? compare(attr("j"), "=", lit(shared[0]))
          : shared
              .slice(1)
              .reduce(
                (condition, value) => or(condition, compare(attr("j"), "=", lit(value))),
                compare(attr("j"), "=", lit(shared[0]))
              )
      ).relation,
      ["j"]
    ).relation;

    const { relation, trace: divisionTrace } = divide(dividendRelation, divisorRelation);

    // Pairings each candidate has that are NOT in the divisor — the ones that
    // look disqualifying and are not.
    const divisorValues = new Set(divisorRelation.tuples.map((tuple) => String(tuple[0])));
    const extraByCandidate = divisionTrace.candidates.map((candidate) =>
      dividendRelation.tuples
        .filter((tuple) => String(tuple[0]) === String(candidate[0]))
        .map((tuple) => String(tuple[1]))
        .filter((value) => !divisorValues.has(value))
    );

    return {
      dividend: dividendRelation,
      divisor: divisorRelation,
      quotient: relation,
      trace: divisionTrace,
      extras: extraByCandidate
    };
  }, [seed, divisorSize]);

  const resetGrid = () => {
    setMarks([]);
    setQualify([]);
    setChecked(false);
  };

  return (
    <Card className={className}>
      <CardHeader className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-heading font-semibold text-text">Division Lab</h2>
          <p className="mt-0.5 text-body-sm text-text-secondary">
            Division answers a <span className="font-semibold text-text">for all</span> question.
            Tick every column or you do not qualify.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={() => { resetGrid(); setSeed(null); }} disabled={seed === null}>
            Homework data
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              resetGrid();
              setSeed(Math.floor(Math.random() * 100000));
            }}
          >
            <Shuffle className="h-3.5 w-3.5" aria-hidden />
            New tables
          </Button>
        </div>
      </CardHeader>

      <CardBody className="space-y-5">
        <div className="overflow-x-auto rounded-xl border border-border-accent bg-accent-wash px-4 py-3">
          <RAExpression source="Π_{r2, j}(R) ÷ Π_{j}(S)" block className="text-[1.05rem]" />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <span className="text-caption font-semibold uppercase tracking-[0.08em] text-text-secondary">
            Divisor size
          </span>
          {[1, 2, 3].map((size) => (
            <button
              key={size}
              type="button"
              onClick={() => {
                resetGrid();
                setDivisorSize(size);
              }}
              className={cn(
                "h-8 w-8 rounded-lg border text-body-sm font-semibold transition",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                divisorSize === size
                  ? "border-transparent bg-accent text-accent-fg"
                  : "border-borderc bg-soft text-muted hover:text-text"
              )}
            >
              {size}
            </button>
          ))}
          <span className="text-caption text-faint">
            More values in the divisor means more columns to cover.
          </span>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <RelationTable relation={dividend} caption="Dividend — Π r2, j (R)" />
          <RelationTable relation={divisor} caption="Divisor — Π j (S)" />
        </div>

        {/* The coverage grid — the whole point of the lab. */}
        <div className="overflow-x-auto rounded-xl border border-borderc bg-surface dark:bg-surface-raised">
          <table className="w-full border-collapse text-body-sm">
            <caption className="px-3 pt-3 text-left text-body-sm font-semibold text-text">
              Mark which divisor values each r2 is paired with, then decide who belongs in the
              result. Tick every column or they do not qualify.
            </caption>
            <thead>
              <tr className="border-b border-borderc bg-soft">
                <th scope="col" className="px-3 py-2 text-left font-mono text-[0.78rem] text-text-secondary">
                  r2
                </th>
                {divisor.tuples.map((tuple, index) => (
                  <th
                    key={index}
                    scope="col"
                    className="px-3 py-2 text-center font-mono text-[0.78rem] font-semibold text-accent"
                  >
                    {String(tuple[0])}
                  </th>
                ))}
                <th scope="col" className="px-3 py-2 text-left font-mono text-[0.78rem] text-faint">
                  other pairings
                </th>
                <th scope="col" className="px-3 py-2 text-left text-[0.78rem] text-text-secondary">
                  In result?
                </th>
              </tr>
            </thead>
            <tbody>
              {trace.candidates.map((candidate, rowIndex) => {
                const actualQualifies = trace.qualified[rowIndex];
                const guessedQualifies = qualify[rowIndex] ?? false;
                const coverage = marks[rowIndex] ?? [];
                const coverageCorrect =
                  checked &&
                  coverage.length === trace.coverageByCandidate[rowIndex].length &&
                  coverage.every((mark, columnIndex) => mark === trace.coverageByCandidate[rowIndex][columnIndex]);
                const qualifyCorrect = checked && guessedQualifies === actualQualifies;

                return (
                  <tr
                    key={rowIndex}
                    className={cn(
                      "border-b border-borderc/60 last:border-b-0",
                      checked && actualQualifies ? "bg-success/10" : ""
                    )}
                  >
                    <td className="px-3 py-2 font-mono text-[0.8rem] font-semibold text-text">
                      {String(candidate[0])}
                    </td>
                    {trace.coverageByCandidate[rowIndex].map((covered, columnIndex) => {
                      const marked = coverage[columnIndex] ?? false;
                      return (
                        <td key={columnIndex} className="px-3 py-2 text-center">
                          <button
                            type="button"
                            aria-pressed={marked}
                            aria-label={`${marked ? "Unmark" : "Mark"} ${String(candidate[0])} paired with ${String(divisor.tuples[columnIndex]?.[0])}`}
                            onClick={() => {
                              setChecked(false);
                              setMarks((current) => {
                                const next = current.map((row) => [...row]);
                                if (!next[rowIndex]) return current;
                                next[rowIndex][columnIndex] = !next[rowIndex][columnIndex];
                                return next;
                              });
                            }}
                            className={cn(
                              "inline-flex h-8 w-8 items-center justify-center rounded-lg border transition",
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                              marked ? "border-accent bg-accent/15 text-accent" : "border-borderc text-faint",
                              checked && marked === covered && "border-success/60 bg-success/10 text-success",
                              checked && marked !== covered && "border-danger/60 bg-danger/10 text-danger"
                            )}
                          >
                            {marked ? <Check className="h-4 w-4" /> : <span className="text-caption">·</span>}
                          </button>
                        </td>
                      );
                    })}
                    <td className="px-3 py-2 font-mono text-[0.75rem] text-faint">
                      {extras[rowIndex].length > 0 ? extras[rowIndex].join(", ") : "—"}
                    </td>
                    <td className="px-3 py-2">
                      <button
                        type="button"
                        aria-pressed={guessedQualifies}
                        onClick={() => {
                          setChecked(false);
                          setQualify((current) => {
                            const next = [...current];
                            next[rowIndex] = !next[rowIndex];
                            return next;
                          });
                        }}
                        className={cn(
                          "rounded-lg border px-2 py-1 text-[0.8rem] font-semibold transition",
                          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-2/60",
                          guessedQualifies ? "border-accent bg-accent/15 text-accent" : "border-borderc text-muted",
                          checked && qualifyCorrect && "border-success/60 text-success",
                          checked && !qualifyCorrect && "border-danger/60 text-danger"
                        )}
                      >
                        {guessedQualifies ? "Yes" : "No"}
                      </button>
                      {checked && !coverageCorrect ? (
                        <span className="ml-2 text-caption text-danger">coverage</span>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => setChecked(true)}>Check my coverage</Button>
          <Button
            variant="ghost"
            onClick={resetGrid}
          >
            Clear marks
          </Button>
        </div>

        {checked ? (
          <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-body-sm leading-relaxed text-text">
            {qualify.every((guess, index) => guess === trace.qualified[index]) &&
            marks.every((row, rowIndex) =>
              row.every((mark, columnIndex) => mark === trace.coverageByCandidate[rowIndex][columnIndex])
            ) ? (
              <p>
                Coverage and the quotient both match. A value needs every divisor column ticked —
                extra pairings in the unused column never cost a place.
              </p>
            ) : (
              <p>
                Compare your ticks with the highlighted cells. The usual miss is treating division
                as &ldquo;paired with any of them&rdquo;: a row with one tick looks promising and
                still does not qualify. Another is striking a candidate because of extra pairings
                outside the divisor — those are ignored.
              </p>
            )}
          </div>
        ) : null}

        <div className="rounded-xl border border-borderc bg-soft px-4 py-3 text-body-sm leading-relaxed text-text-secondary">
          <p>
            A value needs a tick in <span className="font-semibold text-text">every</span> divisor
            column. The &ldquo;other pairings&rdquo; column exists to be ignored — those values are
            outside the divisor, and having them never costs a candidate its place. Treating
            division as &ldquo;paired with any of them&rdquo; is the mistake this lab exists to fix.
          </p>
        </div>

        <RelationTable
          relation={quotient}
          caption={checked ? "Result" : "Result (revealed after you check)"}
          emptyLabel="Nothing covers every divisor value, so the quotient is empty — a legitimate answer."
          className={checked ? undefined : "pointer-events-none opacity-40"}
        />
      </CardBody>
    </Card>
  );
}
