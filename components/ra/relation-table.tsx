"use client";

import { cn } from "@/lib/utils";
import { unqualify, type RAValue, type Relation } from "@/lib/relational-algebra/relation";

/**
 * A relation, printed as a table.
 *
 * Highlighting is the teaching surface here, so it is driven by explicit
 * per-row and per-column state rather than by anything the component infers.
 * The Table Lab passes state straight from the evaluator's trace, which keeps
 * what a learner sees highlighted identical to what the evaluator actually
 * did — a separately-authored animation would eventually disagree with the
 * answer, and disagreeing confidently is the worst thing a study tool can do.
 *
 * Density is kept close to an exam's: small type, tight cells, readable at a
 * glance without scrolling for short relations.
 */

export type RowState = "normal" | "match" | "unmatched" | "padded" | "removed" | "new";

export interface RelationTableProps {
  relation: Relation;
  /** Per-row visual state, indexed like `relation.tuples`. */
  rowStates?: RowState[];
  /** Attribute names to emphasise — the joining attributes, typically. */
  highlightAttributes?: string[];
  /** Columns shown struck through, e.g. the copy a natural join collapses. */
  strikeAttributes?: string[];
  caption?: string;
  /** Prints "degree n · cardinality m" under the table. */
  showShape?: boolean;
  /** Row checkboxes for "which tuples are in the result?" questions. */
  selectable?: boolean;
  selected?: number[];
  onToggleRow?: (index: number) => void;
  /** Fires when a row is hovered or focused, so the Table Lab can show its matches. */
  onRowFocus?: (index: number | null) => void;
  /** Marks correct/incorrect after a selectable question is graded. */
  verdicts?: ("correct" | "missed" | "wrong" | null)[];
  className?: string;
  emptyLabel?: string;
}

function CellValue({ value }: { value: RAValue }) {
  if (value === null) {
    return (
      <span className="rounded bg-warn/15 px-1.5 py-0.5 font-mono text-[0.72rem] font-semibold uppercase tracking-wide text-warn">
        null
      </span>
    );
  }
  return <span className="tabular-nums">{String(value)}</span>;
}

const ROW_CLASS: Record<RowState, string> = {
  normal: "",
  match: "bg-success/10",
  // Dimmed rather than hidden: the learner still has to see what did not
  // match in order to understand why.
  unmatched: "opacity-40",
  padded: "bg-warn/10",
  removed: "opacity-35 line-through decoration-danger/50",
  new: "bg-accent/10"
};

export function RelationTable({
  relation,
  rowStates,
  highlightAttributes = [],
  strikeAttributes = [],
  caption,
  showShape = true,
  selectable = false,
  selected = [],
  onToggleRow,
  onRowFocus,
  verdicts,
  className,
  emptyLabel = "No tuples — the result is empty."
}: RelationTableProps) {
  const highlight = new Set(highlightAttributes.map((a) => unqualify(a).toLowerCase()));
  const strike = new Set(strikeAttributes.map((a) => unqualify(a).toLowerCase()));
  const selectedSet = new Set(selected);

  return (
    <figure className={cn("min-w-0", className)}>
      {caption ? (
        <figcaption className="mb-1.5 flex items-baseline gap-2">
          <span className="font-mono text-body-sm font-semibold text-text">{caption}</span>
          {showShape ? (
            <span className="text-caption uppercase tracking-[0.08em] text-faint">
              degree {relation.attributes.length} · cardinality {relation.tuples.length}
            </span>
          ) : null}
        </figcaption>
      ) : null}

      {/* Tables are the one thing allowed to scroll sideways — squeezing an
          eight-column join into 375px would make it unreadable. */}
      <div className="overflow-x-auto rounded-xl border border-borderc bg-surface dark:bg-surface-raised">
        <table className="w-full border-collapse text-body-sm">
          <thead>
            <tr className="border-b border-borderc bg-soft">
              {selectable ? <th scope="col" className="w-10 px-2 py-2" aria-label="Select" /> : null}
              {relation.attributes.map((attribute) => {
                const base = unqualify(attribute).toLowerCase();
                return (
                  <th
                    key={attribute}
                    scope="col"
                    className={cn(
                      "whitespace-nowrap px-3 py-2 text-left font-mono text-[0.78rem] font-semibold",
                      highlight.has(base) ? "bg-accent/15 text-accent" : "text-text-secondary",
                      strike.has(base) && "line-through decoration-danger/60"
                    )}
                  >
                    {attribute}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {relation.tuples.length === 0 ? (
              <tr>
                <td
                  colSpan={relation.attributes.length + (selectable ? 1 : 0)}
                  className="px-3 py-6 text-center text-body-sm text-muted"
                >
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              relation.tuples.map((tuple, rowIndex) => {
                const state = rowStates?.[rowIndex] ?? "normal";
                const verdict = verdicts?.[rowIndex] ?? null;
                const isSelected = selectedSet.has(rowIndex);

                return (
                  <tr
                    key={rowIndex}
                    tabIndex={selectable || onRowFocus ? 0 : undefined}
                    className={cn(
                      "border-b border-borderc/60 last:border-b-0 transition-colors",
                      ROW_CLASS[state],
                      selectable && "cursor-pointer hover:bg-soft",
                      onRowFocus && "cursor-pointer hover:bg-soft",
                      isSelected && !verdict && "bg-accent/10",
                      verdict === "correct" && "bg-success/15",
                      verdict === "missed" && "bg-warn/15",
                      verdict === "wrong" && "bg-danger/15"
                    )}
                    onClick={selectable ? () => onToggleRow?.(rowIndex) : undefined}
                    onMouseEnter={onRowFocus ? () => onRowFocus(rowIndex) : undefined}
                    onFocus={onRowFocus ? () => onRowFocus(rowIndex) : undefined}
                    onKeyDown={
                      selectable
                        ? (event) => {
                            if (event.key === " " || event.key === "Enter") {
                              event.preventDefault();
                              event.stopPropagation();
                              onToggleRow?.(rowIndex);
                            }
                          }
                        : undefined
                    }
                  >
                    {selectable ? (
                      <td className="px-2 py-2">
                        <input
                          type="checkbox"
                          className="h-4 w-4 cursor-pointer accent-[hsl(var(--accent))]"
                          checked={isSelected}
                          onChange={() => onToggleRow?.(rowIndex)}
                          onClick={(event) => event.stopPropagation()}
                          aria-label={`Tuple ${rowIndex + 1}: ${tuple
                            .map((value) => (value === null ? "null" : String(value)))
                            .join(", ")}`}
                        />
                      </td>
                    ) : null}
                    {tuple.map((value, columnIndex) => {
                      const attribute = relation.attributes[columnIndex] ?? "";
                      const base = unqualify(attribute).toLowerCase();
                      return (
                        <td
                          key={columnIndex}
                          className={cn(
                            "whitespace-nowrap px-3 py-2 font-mono text-[0.8rem] text-text",
                            highlight.has(base) && "bg-accent/10 font-semibold text-accent",
                            strike.has(base) && "line-through decoration-danger/60 opacity-60"
                          )}
                        >
                          <CellValue value={value} />
                        </td>
                      );
                    })}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {!caption && showShape ? (
        <p className="mt-1.5 text-caption uppercase tracking-[0.08em] text-faint">
          degree {relation.attributes.length} · cardinality {relation.tuples.length}
        </p>
      ) : null}
    </figure>
  );
}

/**
 * The same table, built from a bare row list rather than a Relation.
 * Used by "which of these tuples belong?" questions, where the candidate rows
 * are deliberately a mix of correct and incorrect.
 */
export function CandidateTable({
  attributes,
  rows,
  selected,
  onToggleRow,
  verdicts,
  disabled = false,
  className
}: {
  attributes: string[];
  rows: RAValue[][];
  selected: number[];
  onToggleRow: (index: number) => void;
  verdicts?: ("correct" | "missed" | "wrong" | null)[];
  disabled?: boolean;
  className?: string;
}) {
  return (
    <RelationTable
      relation={{ name: "result", attributes, tuples: rows }}
      selectable={!disabled}
      selected={selected}
      onToggleRow={onToggleRow}
      verdicts={verdicts}
      showShape={false}
      className={className}
    />
  );
}
