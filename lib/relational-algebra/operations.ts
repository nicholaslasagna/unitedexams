/**
 * The relational-algebra operators taught in CS 4354 (Lectures 3–5).
 *
 * Every operator returns the result relation *and* a trace describing how it
 * got there — which tuples matched, which were left unmatched, which output
 * rows were padded with NULL. The Table Lab renders straight from that trace,
 * so what a learner sees highlighted is literally what the evaluator did,
 * not a separately-authored animation that can drift out of agreement with
 * the answer.
 */

import {
  evaluateCondition,
  isEqualityOnly,
  type Condition
} from "./condition";
import {
  ATTRIBUTE_AMBIGUOUS,
  ATTRIBUTE_NOT_FOUND,
  combineAttributes,
  dedupeTuples,
  resolveAttributeIndex,
  sourcesOf,
  tupleKey,
  unqualify,
  type RAValue,
  type Relation,
  type Tuple
} from "./relation";

export class OperationError extends Error {}

/** Where each output row came from, for the visualiser. */
export interface RowOrigin {
  left: number | null;
  right: number | null;
  /** True when the row was completed with NULLs by an outer join. */
  padded: boolean;
}

export interface JoinTrace {
  /** Indices of right tuples each left tuple matched. */
  matchesByLeft: number[][];
  /** Indices of left tuples each right tuple matched. */
  matchesByRight: number[][];
  unmatchedLeft: number[];
  unmatchedRight: number[];
  rows: RowOrigin[];
}

export interface SelectTrace {
  kept: number[];
  removed: number[];
}

export interface ProjectTrace {
  /** Source attribute index for each kept column. */
  keptColumns: number[];
  droppedColumns: number[];
  /** Input rows that collapsed into an earlier identical row. */
  duplicatesRemoved: number[];
  /** Output row index each input row landed in, or null when removed. */
  rowDestination: Array<number | null>;
}

export interface DivisionTrace {
  /** Distinct quotient-candidate values, in first-seen order. */
  candidates: Tuple[];
  /** For each candidate, which divisor tuples it is paired with. */
  coverageByCandidate: boolean[][];
  /** Divisor tuples, in order, for the coverage grid's columns. */
  divisorTuples: Tuple[];
  qualified: boolean[];
}

// ── Selection ─────────────────────────────────────────────────────────────

/** σ_predicate(R) — slices horizontally. Attributes are untouched. */
export function select(
  relation: Relation,
  condition: Condition
): { relation: Relation; trace: SelectTrace } {
  const kept: number[] = [];
  const removed: number[] = [];
  const tuples: Tuple[] = [];

  relation.tuples.forEach((tuple, index) => {
    if (evaluateCondition(condition, relation, tuple)) {
      kept.push(index);
      tuples.push(tuple);
    } else {
      removed.push(index);
    }
  });

  return {
    relation: {
      name: relation.name,
      attributes: relation.attributes,
      sources: relation.sources,
      tuples
    },
    trace: { kept, removed }
  };
}

// ── Projection ────────────────────────────────────────────────────────────

/**
 * Π_{a,…}(R) — slices vertically *and eliminates duplicates*, because the
 * result is a relation and a relation is a set. Forgetting that second half
 * is the single most common projection error, so the trace records exactly
 * which rows collapsed.
 */
export function project(
  relation: Relation,
  attributes: string[]
): { relation: Relation; trace: ProjectTrace } {
  const keptColumns = attributes.map((name) => {
    const index = resolveAttributeIndex(relation, name);
    if (index === ATTRIBUTE_NOT_FOUND) {
      throw new OperationError(`${relation.name} has no attribute named ${name}.`);
    }
    if (index === ATTRIBUTE_AMBIGUOUS) {
      throw new OperationError(`${name} is ambiguous — qualify it with its relation.`);
    }
    return index;
  });

  const droppedColumns = relation.attributes
    .map((_, index) => index)
    .filter((index) => !keptColumns.includes(index));

  const seen = new Map<string, number>();
  const tuples: Tuple[] = [];
  const duplicatesRemoved: number[] = [];
  const rowDestination: Array<number | null> = [];

  relation.tuples.forEach((tuple, rowIndex) => {
    const projected = keptColumns.map((column) => tuple[column]);
    const key = tupleKey(projected);
    const existing = seen.get(key);
    if (existing !== undefined) {
      duplicatesRemoved.push(rowIndex);
      rowDestination.push(existing);
      return;
    }
    seen.set(key, tuples.length);
    rowDestination.push(tuples.length);
    tuples.push(projected);
  });

  return {
    relation: {
      name: relation.name,
      attributes: keptColumns.map((index) => relation.attributes[index]),
      sources: keptColumns.map((index) => sourcesOf(relation)[index]),
      tuples
    },
    trace: { keptColumns, droppedColumns, duplicatesRemoved, rowDestination }
  };
}

// ── Cartesian product ─────────────────────────────────────────────────────

/**
 * R X S — every tuple of R concatenated with every tuple of S.
 * cardinality multiplies, degree adds (Lecture 4).
 */
export function product(
  left: Relation,
  right: Relation,
  name = `${left.name}×${right.name}`
): { relation: Relation; trace: JoinTrace } {
  const { attributes, sources } = combineAttributes(left, right);
  const tuples: Tuple[] = [];
  const rows: RowOrigin[] = [];

  left.tuples.forEach((leftTuple, leftIndex) => {
    right.tuples.forEach((rightTuple, rightIndex) => {
      tuples.push([...leftTuple, ...rightTuple]);
      rows.push({ left: leftIndex, right: rightIndex, padded: false });
    });
  });

  return {
    relation: { name, attributes, sources, tuples },
    trace: {
      matchesByLeft: left.tuples.map(() => right.tuples.map((_, i) => i)),
      matchesByRight: right.tuples.map(() => left.tuples.map((_, i) => i)),
      unmatchedLeft: [],
      unmatchedRight: [],
      rows
    }
  };
}

// ── Match discovery, shared by every join ─────────────────────────────────

function findMatches(
  left: Relation,
  right: Relation,
  condition: Condition
): { matchesByLeft: number[][]; matchesByRight: number[][] } {
  const { attributes, sources } = combineAttributes(left, right);
  const combined: Relation = { name: "join", attributes, sources, tuples: [] };

  const matchesByLeft: number[][] = left.tuples.map(() => []);
  const matchesByRight: number[][] = right.tuples.map(() => []);

  left.tuples.forEach((leftTuple, leftIndex) => {
    right.tuples.forEach((rightTuple, rightIndex) => {
      const joined = [...leftTuple, ...rightTuple];
      if (evaluateCondition(condition, combined, joined)) {
        matchesByLeft[leftIndex].push(rightIndex);
        matchesByRight[rightIndex].push(leftIndex);
      }
    });
  });

  return { matchesByLeft, matchesByRight };
}

// ── Theta join / equijoin ─────────────────────────────────────────────────

/**
 * R ⋈_F S = σ_F(R X S) — identical result, and the lab shows both routes.
 * When F uses only `=` the course calls it an equijoin; both copies of the
 * joining attribute are retained (Lecture 4, Example - Equijoin).
 */
export function thetaJoin(
  left: Relation,
  right: Relation,
  condition: Condition,
  name = `${left.name}⋈${right.name}`
): { relation: Relation; trace: JoinTrace } {
  const { attributes, sources } = combineAttributes(left, right);
  const { matchesByLeft, matchesByRight } = findMatches(left, right, condition);

  const tuples: Tuple[] = [];
  const rows: RowOrigin[] = [];

  left.tuples.forEach((leftTuple, leftIndex) => {
    matchesByLeft[leftIndex].forEach((rightIndex) => {
      tuples.push([...leftTuple, ...right.tuples[rightIndex]]);
      rows.push({ left: leftIndex, right: rightIndex, padded: false });
    });
  });

  return {
    relation: { name, attributes, sources, tuples },
    trace: {
      matchesByLeft,
      matchesByRight,
      unmatchedLeft: matchesByLeft
        .map((m, i) => (m.length === 0 ? i : -1))
        .filter((i) => i >= 0),
      unmatchedRight: matchesByRight
        .map((m, i) => (m.length === 0 ? i : -1))
        .filter((i) => i >= 0),
      rows
    }
  };
}

export function isEquijoin(condition: Condition): boolean {
  return isEqualityOnly(condition);
}

// ── Natural join ──────────────────────────────────────────────────────────

/**
 * R ⋈ S — an equijoin over *all* common attributes with one copy of each
 * common attribute eliminated (Lecture 5). The collapsed column is the whole
 * difference from an equijoin, so the trace names it.
 */
export function naturalJoin(
  left: Relation,
  right: Relation,
  name = `${left.name}⋈${right.name}`
): { relation: Relation; trace: JoinTrace; commonAttributes: string[] } {
  const leftBases = left.attributes.map(unqualify);
  const rightBases = right.attributes.map(unqualify);
  const common = leftBases.filter((base) =>
    rightBases.some((other) => other.toLowerCase() === base.toLowerCase())
  );

  // No shared attribute: the natural join degenerates to a Cartesian product.
  if (common.length === 0) {
    const { relation, trace } = product(left, right, name);
    return { relation, trace, commonAttributes: [] };
  }

  const leftCommonIndexes = common.map((base) =>
    leftBases.findIndex((candidate) => candidate.toLowerCase() === base.toLowerCase())
  );
  const rightCommonIndexes = common.map((base) =>
    rightBases.findIndex((candidate) => candidate.toLowerCase() === base.toLowerCase())
  );
  const rightKeptIndexes = right.attributes
    .map((_, index) => index)
    .filter((index) => !rightCommonIndexes.includes(index));

  // The kept common column takes its plain name back — `j`, not `R.j`.
  const attributes = [
    ...left.attributes.map((attribute, index) =>
      leftCommonIndexes.includes(index) ? unqualify(attribute) : attribute
    ),
    ...rightKeptIndexes.map((index) => right.attributes[index])
  ];
  const sources = [
    ...sourcesOf(left),
    ...rightKeptIndexes.map((index) => sourcesOf(right)[index])
  ];

  const matchesByLeft: number[][] = left.tuples.map(() => []);
  const matchesByRight: number[][] = right.tuples.map(() => []);
  const tuples: Tuple[] = [];
  const rows: RowOrigin[] = [];

  left.tuples.forEach((leftTuple, leftIndex) => {
    right.tuples.forEach((rightTuple, rightIndex) => {
      const agrees = common.every((_, k) => {
        const a = leftTuple[leftCommonIndexes[k]];
        const b = rightTuple[rightCommonIndexes[k]];
        if (a === null || b === null) return false;
        return String(a).toLowerCase() === String(b).toLowerCase();
      });
      if (!agrees) return;
      matchesByLeft[leftIndex].push(rightIndex);
      matchesByRight[rightIndex].push(leftIndex);
      tuples.push([...leftTuple, ...rightKeptIndexes.map((index) => rightTuple[index])]);
      rows.push({ left: leftIndex, right: rightIndex, padded: false });
    });
  });

  return {
    relation: { name, attributes, sources, tuples },
    trace: {
      matchesByLeft,
      matchesByRight,
      unmatchedLeft: matchesByLeft
        .map((m, i) => (m.length === 0 ? i : -1))
        .filter((i) => i >= 0),
      unmatchedRight: matchesByRight
        .map((m, i) => (m.length === 0 ? i : -1))
        .filter((i) => i >= 0),
      rows
    },
    commonAttributes: common
  };
}

// ── Outer joins ───────────────────────────────────────────────────────────

export type OuterSide = "left" | "right" | "full";

/**
 * R ⟕ S, R ⟖ S, R ⟗ S — matching tuples plus every unmatched tuple from the
 * preserved side, padded with NULLs (Lecture 5). Pass a condition for the
 * theta-style form, or omit it for the natural-join-style form.
 */
export function outerJoin(
  left: Relation,
  right: Relation,
  side: OuterSide,
  condition?: Condition,
  name = `${left.name}⟗${right.name}`
): { relation: Relation; trace: JoinTrace } {
  const base = condition
    ? thetaJoin(left, right, condition, name)
    : naturalJoin(left, right, name);

  const width = base.relation.attributes.length;
  const leftWidth = left.attributes.length;

  const tuples = [...base.relation.tuples];
  const rows = [...base.trace.rows];

  if (side === "left" || side === "full") {
    base.trace.unmatchedLeft.forEach((leftIndex) => {
      const tuple: Tuple = new Array(width).fill(null);
      left.tuples[leftIndex].forEach((value, i) => {
        tuple[i] = value;
      });
      tuples.push(tuple);
      rows.push({ left: leftIndex, right: null, padded: true });
    });
  }

  if (side === "right" || side === "full") {
    base.trace.unmatchedRight.forEach((rightIndex) => {
      const tuple: Tuple = new Array(width).fill(null);
      if (condition) {
        // Theta form keeps both operands' columns side by side.
        right.tuples[rightIndex].forEach((value, i) => {
          tuple[leftWidth + i] = value;
        });
      } else {
        // Natural form collapsed the common columns; put the right tuple's
        // values back under whichever output column they belong to.
        const rightBases = right.attributes.map(unqualify);
        base.relation.attributes.forEach((attribute, outIndex) => {
          const source = rightBases.findIndex(
            (candidate) => candidate.toLowerCase() === unqualify(attribute).toLowerCase()
          );
          if (source !== -1) tuple[outIndex] = right.tuples[rightIndex][source];
        });
      }
      tuples.push(tuple);
      rows.push({ left: null, right: rightIndex, padded: true });
    });
  }

  return {
    relation: {
      name,
      attributes: base.relation.attributes,
      sources: base.relation.sources,
      tuples
    },
    trace: { ...base.trace, rows }
  };
}

// ── Semijoin ──────────────────────────────────────────────────────────────

/**
 * R ▷_F S = Π_{attrs(R)}(R ⋈_F S) (Lecture 5). The professor writes it ▷;
 * ⋉ is the same operator.
 *
 * The result carries *only R's attributes*, keeping R's own unqualified
 * names — S decides which tuples of R qualify and then disappears. Returning
 * S's rows instead is the classic semijoin error, and the direction is the
 * other half of it.
 */
export function semijoin(
  left: Relation,
  right: Relation,
  condition?: Condition,
  name = left.name
): { relation: Relation; trace: JoinTrace } {
  const base = condition
    ? thetaJoin(left, right, condition, name)
    : naturalJoin(left, right, name);

  const keptLeft = left.tuples
    .map((_, index) => index)
    .filter((index) => base.trace.matchesByLeft[index].length > 0);

  return {
    relation: {
      name,
      attributes: [...left.attributes],
      sources: [...sourcesOf(left)],
      tuples: dedupeTuples(keptLeft.map((index) => left.tuples[index]))
    },
    trace: {
      ...base.trace,
      rows: keptLeft.map((index) => ({ left: index, right: null, padded: false }))
    }
  };
}

// ── Division ──────────────────────────────────────────────────────────────

/**
 * R ÷ S (Lecture 5). R is over attribute set A, S over B ⊆ A, and the result
 * is over C = A − B: the C-values that appear in R paired with *every* tuple
 * of S. Division answers "for all" questions, and the coverage grid in the
 * trace is what makes that visible — a candidate needs a tick in every
 * column, and extra pairings beyond S never disqualify it.
 */
export function divide(
  left: Relation,
  right: Relation,
  name = `${left.name}÷${right.name}`
): { relation: Relation; trace: DivisionTrace } {
  const leftBases = left.attributes.map(unqualify);
  const rightBases = right.attributes.map(unqualify);

  const divisorIndexes = rightBases.map((base) => {
    const index = leftBases.findIndex(
      (candidate) => candidate.toLowerCase() === base.toLowerCase()
    );
    if (index === -1) {
      throw new OperationError(
        `${left.name} has no attribute ${base}, so it cannot be divided by ${right.name}. ` +
          `Division needs the divisor's attributes to be a subset of the dividend's.`
      );
    }
    return index;
  });

  const quotientIndexes = left.attributes
    .map((_, index) => index)
    .filter((index) => !divisorIndexes.includes(index));

  if (quotientIndexes.length === 0) {
    throw new OperationError(
      `Dividing ${left.name} by ${right.name} would leave no attributes in the result.`
    );
  }

  // Candidate C-values, and the set of B-values each one is paired with.
  const candidateOrder: string[] = [];
  const candidateTuple = new Map<string, Tuple>();
  const pairedKeys = new Map<string, Set<string>>();

  left.tuples.forEach((tuple) => {
    const candidate = quotientIndexes.map((index) => tuple[index]);
    const key = tupleKey(candidate);
    if (!candidateTuple.has(key)) {
      candidateTuple.set(key, candidate);
      pairedKeys.set(key, new Set());
      candidateOrder.push(key);
    }
    pairedKeys.get(key)!.add(tupleKey(divisorIndexes.map((index) => tuple[index])));
  });

  const divisorKeys = right.tuples.map(tupleKey);

  const coverageByCandidate: boolean[][] = [];
  const qualified: boolean[] = [];
  const tuples: Tuple[] = [];

  candidateOrder.forEach((key) => {
    const paired = pairedKeys.get(key)!;
    const coverage = divisorKeys.map((divisorKey) => paired.has(divisorKey));
    coverageByCandidate.push(coverage);
    const isQualified = coverage.every(Boolean);
    qualified.push(isQualified);
    if (isQualified) tuples.push(candidateTuple.get(key)!);
  });

  return {
    relation: {
      name,
      attributes: quotientIndexes.map((index) => left.attributes[index]),
      sources: quotientIndexes.map((index) => sourcesOf(left)[index]),
      tuples
    },
    trace: {
      candidates: candidateOrder.map((key) => candidateTuple.get(key)!),
      coverageByCandidate,
      divisorTuples: right.tuples,
      qualified
    }
  };
}

// ── Set operations ────────────────────────────────────────────────────────

function assertUnionCompatible(left: Relation, right: Relation) {
  if (left.attributes.length !== right.attributes.length) {
    throw new OperationError(
      `${left.name} and ${right.name} are not union-compatible: ` +
        `degree ${left.attributes.length} vs ${right.attributes.length}.`
    );
  }
}

export function union(left: Relation, right: Relation, name = `${left.name}∪${right.name}`): Relation {
  assertUnionCompatible(left, right);
  return {
    name,
    attributes: left.attributes,
    sources: left.sources,
    tuples: dedupeTuples([...left.tuples, ...right.tuples])
  };
}

export function intersect(
  left: Relation,
  right: Relation,
  name = `${left.name}∩${right.name}`
): Relation {
  assertUnionCompatible(left, right);
  const rightKeys = new Set(right.tuples.map(tupleKey));
  return {
    name,
    attributes: left.attributes,
    sources: left.sources,
    tuples: left.tuples.filter((tuple) => rightKeys.has(tupleKey(tuple)))
  };
}

export function difference(
  left: Relation,
  right: Relation,
  name = `${left.name}−${right.name}`
): Relation {
  assertUnionCompatible(left, right);
  const rightKeys = new Set(right.tuples.map(tupleKey));
  return {
    name,
    attributes: left.attributes,
    sources: left.sources,
    tuples: left.tuples.filter((tuple) => !rightKeys.has(tupleKey(tuple)))
  };
}

/** Cartesian-product arithmetic, stated as the slides state it. */
export function productShape(left: Relation, right: Relation) {
  return {
    degree: left.attributes.length + right.attributes.length,
    cardinality: left.tuples.length * right.tuples.length
  };
}

export type { RAValue, Relation, Tuple };
