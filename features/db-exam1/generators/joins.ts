/**
 * Join-table variants in the professor's own style.
 *
 * Homework #1 Question 1 sets the pattern precisely: two relations sharing a
 * joining attribute `j`, with at least two matching values, at least one
 * left-only value and at least one right-only value, then compute the
 * equijoin, natural join, all three outer joins, the semijoin and a division.
 *
 * These generators reproduce that shape with different data, so a learner
 * cannot pass by remembering the homework's answers. Results always come from
 * the evaluator — nothing here hand-writes a result table, because a
 * hand-written answer that disagrees with the engine teaches the wrong thing
 * with total confidence.
 */

import {
  divide,
  naturalJoin,
  outerJoin,
  product,
  project,
  semijoin,
  thetaJoin
} from "@/lib/relational-algebra/operations";
import { attr, compare } from "@/lib/relational-algebra/condition";
import type { RAValue, Relation, Tuple } from "@/lib/relational-algebra/relation";
import type { MistakeTag } from "../mistakes";
import type { LabQuestion, RowCandidate } from "../question-model";
import { intBetween, makeRng, pick, sample, shuffle, type Rng } from "./random";

export interface JoinPairSpec {
  /** How many `j` values appear in both relations. */
  matching: number;
  /** How many `j` values appear only in the left relation. */
  leftOnly: number;
  /** How many `j` values appear only in the right relation. */
  rightOnly: number;
  /**
   * How many extra tuples repeat an already-used matching `j`, on each side.
   * This is what creates the one-to-many and many-to-many fan-out that makes
   * counting the result rows a real exercise.
   */
  leftRepeats: number;
  rightRepeats: number;
}

export const JOIN_SPECS: Record<"intro" | "core" | "stretch", JoinPairSpec> = {
  // One-to-one plus a stray on each side: enough to see the idea.
  intro: { matching: 2, leftOnly: 1, rightOnly: 1, leftRepeats: 0, rightRepeats: 0 },
  // The homework's own shape — repeats on both sides.
  core: { matching: 3, leftOnly: 1, rightOnly: 1, leftRepeats: 2, rightRepeats: 2 },
  // Many-to-many on two different values.
  stretch: { matching: 3, leftOnly: 2, rightOnly: 1, leftRepeats: 3, rightRepeats: 3 }
};

const LEFT_CODES = ["A", "B", "C", "D", "E", "F", "G", "H"];
const RIGHT_WORDS = ["Red", "Blue", "Green", "Amber", "Violet", "Teal", "Slate", "Rose"];

export interface GeneratedPair {
  left: Relation;
  right: Relation;
  /** `j` values present in both. */
  matchingValues: string[];
  leftOnlyValues: string[];
  rightOnlyValues: string[];
}

/**
 * Build an R/S pair to the given spec.
 *
 * `j` values are drawn from a pool and partitioned, so "which values match"
 * is never inferable from position — the left-only value is not always last.
 */
export function generateJoinPair(seed: number, spec: JoinPairSpec): GeneratedPair {
  const rng = makeRng(seed);

  const pool = Array.from({ length: 9 }, (_, i) => `J${i + 1}`);
  const chosen = sample(rng, pool, spec.matching + spec.leftOnly + spec.rightOnly);
  const matchingValues = chosen.slice(0, spec.matching);
  const leftOnlyValues = chosen.slice(spec.matching, spec.matching + spec.leftOnly);
  const rightOnlyValues = chosen.slice(spec.matching + spec.leftOnly);

  const leftJ = [
    ...matchingValues,
    ...leftOnlyValues,
    ...Array.from({ length: spec.leftRepeats }, () => pick(rng, matchingValues))
  ];
  const rightJ = [
    ...matchingValues,
    ...rightOnlyValues,
    ...Array.from({ length: spec.rightRepeats }, () => pick(rng, matchingValues))
  ];

  const leftCodes = shuffle(rng, LEFT_CODES);
  const rightWords = shuffle(rng, RIGHT_WORDS);

  const left: Relation = {
    name: "R",
    attributes: ["r_id", "j", "r2", "r3"],
    tuples: shuffle(rng, leftJ).map((j, index) => [
      `R${101 + index}`,
      j,
      leftCodes[index % leftCodes.length],
      intBetween(rng, 10, 99)
    ]) as Tuple[]
  };

  const right: Relation = {
    name: "S",
    attributes: ["s_id", "j", "s2", "s3"],
    tuples: shuffle(rng, rightJ).map((j, index) => [
      `S${201 + index}`,
      j,
      rightWords[index % rightWords.length],
      intBetween(rng, 10, 99)
    ]) as Tuple[]
  };

  return { left, right, matchingValues, leftOnlyValues, rightOnlyValues };
}

const J_CONDITION = compare(attr("R.j"), "=", attr("S.j"));

export type JoinVariant =
  | "equijoin"
  | "natural"
  | "left-outer"
  | "right-outer"
  | "full-outer"
  | "semijoin";

export const JOIN_VARIANT_LABEL: Record<JoinVariant, string> = {
  equijoin: "R ⋈ R.j = S.j S",
  natural: "R ⋈ S",
  "left-outer": "R ⟕ R.j = S.j S",
  "right-outer": "R ⟖ R.j = S.j S",
  "full-outer": "R ⟗ R.j = S.j S",
  semijoin: "R ▷ R.j = S.j S"
};

const VARIANT_TOPIC = {
  equijoin: "equijoin",
  natural: "natural-join",
  "left-outer": "outer-join-left",
  "right-outer": "outer-join-right",
  "full-outer": "outer-join-full",
  semijoin: "semijoin"
} as const;

/** Evaluate one variant over a generated pair. */
export function evaluateVariant(pair: GeneratedPair, variant: JoinVariant): Relation {
  const { left, right } = pair;
  switch (variant) {
    case "equijoin":
      return thetaJoin(left, right, J_CONDITION).relation;
    case "natural":
      return naturalJoin(left, right).relation;
    case "left-outer":
      return outerJoin(left, right, "left", J_CONDITION).relation;
    case "right-outer":
      return outerJoin(left, right, "right", J_CONDITION).relation;
    case "full-outer":
      return outerJoin(left, right, "full", J_CONDITION).relation;
    case "semijoin":
      return semijoin(left, right, J_CONDITION).relation;
  }
}

function nullsFor(width: number): RAValue[] {
  return Array.from({ length: width }, () => null);
}

/**
 * Distractor rows, each chosen to expose one specific misconception.
 *
 * A wrong option that nobody would ever pick teaches nothing. These are the
 * rows a learner genuinely produces: the pair that "looks" related, the
 * NULL-padded row in an inner join, the row that kept both copies of `j`.
 */
function distractorsFor(
  pair: GeneratedPair,
  variant: JoinVariant,
  result: Relation,
  rng: Rng
): RowCandidate[] {
  const { left, right } = pair;
  const out: RowCandidate[] = [];
  const width = result.attributes.length;

  const nonMatchingPairs = product(left, right).relation.tuples.filter(
    (tuple) => String(tuple[1]).toLowerCase() !== String(tuple[5]).toLowerCase()
  );

  if (variant !== "semijoin") {
    // A pair whose j values differ — matched on how the ids look, not on j.
    const mismatched = sample(rng, nonMatchingPairs, 1)[0];
    if (mismatched) {
      const values =
        variant === "natural"
          ? [...mismatched.slice(0, 4), ...mismatched.slice(5)]
          : mismatched;
      out.push({
        values: values.slice(0, width),
        inResult: false,
        mistake: "wrong-join-attributes",
        note:
          `${mismatched[0]} and ${mismatched[4]} never pair up — their j values are ` +
          `${mismatched[1]} and ${mismatched[5]}. Tuples join on the value of the joining ` +
          `attribute, not on the order the rows happen to sit in.`
      });
    }
  }

  const unmatchedLeft = left.tuples.filter((tuple) =>
    pair.leftOnlyValues.includes(String(tuple[1]))
  );
  const unmatchedRight = right.tuples.filter((tuple) =>
    pair.rightOnlyValues.includes(String(tuple[1]))
  );

  // A NULL-padded left row: belongs in left/full outer, nowhere else.
  if (unmatchedLeft[0] && variant !== "semijoin") {
    const padded = [...unmatchedLeft[0], ...nullsFor(width - left.attributes.length)];
    const belongs = variant === "left-outer" || variant === "full-outer";
    if (!belongs) {
      out.push({
        values: padded.slice(0, width),
        inResult: false,
        mistake: variant === "right-outer" ? "outer-join-side" : "inner-join-pads-unmatched",
        note:
          variant === "right-outer"
            ? `${unmatchedLeft[0][0]} has no match, and a RIGHT outer join preserves the right relation — so it does not appear. A left outer join is what would keep it.`
            : `${unmatchedLeft[0][0]} has no matching tuple in S, and ${JOIN_VARIANT_LABEL[variant]} returns nothing for an unmatched tuple. Only an outer join pads with NULL.`
      });
    }
  }

  // A NULL-padded right row: belongs in right/full outer only.
  if (unmatchedRight[0] && variant !== "semijoin") {
    const leftWidth = variant === "natural" ? left.attributes.length - 1 : left.attributes.length;
    const padded = [...nullsFor(leftWidth), ...unmatchedRight[0]];
    const belongs = variant === "right-outer" || variant === "full-outer";
    if (!belongs) {
      out.push({
        values: padded.slice(0, width),
        inResult: false,
        mistake: variant === "left-outer" ? "outer-join-side" : "inner-join-pads-unmatched",
        note:
          variant === "left-outer"
            ? `${unmatchedRight[0][0]} is unmatched on the RIGHT, and a left outer join only preserves the left relation. It takes a right or full outer join to keep this tuple.`
            : `${unmatchedRight[0][0]} has no matching tuple in R, so ${JOIN_VARIANT_LABEL[variant]} returns nothing for it.`
      });
    }
  }

  if (variant === "semijoin") {
    // Tuples of S — the wrong relation entirely.
    const fromS = sample(rng, right.tuples, 2);
    fromS.forEach((tuple) => {
      out.push({
        values: tuple,
        inResult: false,
        mistake: "semijoin-wrong-relation",
        note:
          "This is a tuple of S. R ▷ S returns only R's attributes — S decides which tuples of R qualify and then disappears."
      });
    });
    // An unmatched R tuple.
    if (unmatchedLeft[0]) {
      out.push({
        values: unmatchedLeft[0],
        inResult: false,
        mistake: "semijoin-direction",
        note: `${unmatchedLeft[0][0]} has no matching tuple in S, so it does not qualify.`
      });
    }
  }

  return out;
}

/**
 * "Which tuples are in the result?" — the question the study guide asks.
 *
 * Correct rows come from the evaluator. Rows that repeat because a tuple
 * matched more than one tuple on the other side are tagged, so leaving one
 * out is reported as the specific error it is rather than a generic miss.
 */
export function generateJoinResultQuestion(
  seed: number,
  variant: JoinVariant,
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const rng = makeRng(seed ^ 0x5bf03635);
  const pair = generateJoinPair(seed, JOIN_SPECS[difficulty]);
  const result = evaluateVariant(pair, variant);

  // Which left ids appear more than once — those rows are the fan-out.
  const idCounts = new Map<string, number>();
  result.tuples.forEach((tuple) => {
    const id = String(tuple[0]);
    idCounts.set(id, (idCounts.get(id) ?? 0) + 1);
  });

  const correct: RowCandidate[] = result.tuples.map((values) => {
    const id = String(values[0]);
    const repeated = (idCounts.get(id) ?? 0) > 1;
    return {
      values,
      inResult: true,
      mistake: repeated ? ("missed-multiple-matches" as MistakeTag) : undefined,
      note: repeated
        ? `${id} matches more than one tuple on the other side, so it produces one result row per match. Count the matches before you count the rows.`
        : undefined
    };
  });

  // A candidate whose width differs from the result's cannot be rendered in
  // the result's table, so it is dropped rather than shown with a ragged
  // cell. The schema difference between an equijoin and a natural join is
  // taught by `generateSchemaContrastQuestion` instead, where it belongs.
  const distractors = distractorsFor(pair, variant, result, rng).filter(
    (candidate) => candidate.values.length === result.attributes.length
  );

  const candidates = shuffle(rng, [...correct, ...distractors]);

  return {
    id: `gen-join-${variant}-${seed}`,
    topic: VARIANT_TOPIC[variant],
    source: "study-guide",
    sourceNote: "Study-guide style — generated variant of Homework #1, Question 1",
    difficulty,
    kind: "rows",
    prompt: `Select every tuple that appears in ${JOIN_VARIANT_LABEL[variant]}.`,
    context: { relations: [pair.left, pair.right] },
    attributes: result.attributes,
    candidates,
    explanation: buildExplanation(pair, variant, result),
    hints: buildHints(variant)
  };
}

function buildExplanation(
  pair: GeneratedPair,
  variant: JoinVariant,
  result: Relation
): string {
  const matched = pair.matchingValues.join(", ");
  const base =
    `The j values shared by both relations are ${matched}. ` +
    `${pair.leftOnlyValues.join(", ")} appears only in R and ` +
    `${pair.rightOnlyValues.join(", ")} only in S.`;

  const rule: Record<JoinVariant, string> = {
    equijoin:
      "An equijoin returns one row per matching pair and keeps both copies of j. Unmatched tuples are dropped.",
    natural:
      "A natural join matches on every common attribute and keeps one copy of j. Same rows as the equijoin, one column narrower.",
    "left-outer":
      "A left outer join adds every unmatched tuple of R, padding S's attributes with NULL.",
    "right-outer":
      "A right outer join adds every unmatched tuple of S, padding R's attributes with NULL. Unmatched R tuples are gone.",
    "full-outer":
      "A full outer join keeps the unmatched tuples of both relations, each padded with NULL.",
    semijoin:
      "A semijoin returns the tuples of R that have at least one match, with only R's attributes."
  };

  return `${base} ${rule[variant]} The result has degree ${result.attributes.length} and cardinality ${result.tuples.length}.`;
}

function buildHints(variant: JoinVariant): string[] {
  const shared = [
    "Start by listing which j values appear in both relations.",
    "For each of those values, count how many tuples carry it on the left and how many on the right — a value with 2 on the left and 2 on the right produces 4 rows."
  ];
  const specific: Record<JoinVariant, string> = {
    equijoin: "Unmatched tuples contribute nothing. Both copies of j stay in the result.",
    natural: "Same rows as the equijoin — then remove one copy of the common attribute.",
    "left-outer": "After the matches, add every R tuple with no match and fill S's columns with NULL.",
    "right-outer": "After the matches, add every S tuple with no match. R tuples with no match do not appear.",
    "full-outer": "After the matches, add the unmatched tuples from both sides.",
    semijoin: "Do the join, then keep only R's columns — and only one row per qualifying R tuple."
  };
  return [...shared, specific[variant]];
}

/**
 * "What are the degree and cardinality of the result?" — the arithmetic that
 * is easy to state and easy to get backwards under time pressure.
 */
export function generateShapeQuestion(
  seed: number,
  variant: JoinVariant | "product",
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const pair = generateJoinPair(seed, JOIN_SPECS[difficulty]);
  const result =
    variant === "product"
      ? product(pair.left, pair.right).relation
      : evaluateVariant(pair, variant);

  const subject = variant === "product" ? "R X S" : JOIN_VARIANT_LABEL[variant];

  const explanation =
    variant === "product"
      ? `R has ${pair.left.tuples.length} tuples and ${pair.left.attributes.length} attributes; ` +
        `S has ${pair.right.tuples.length} and ${pair.right.attributes.length}. ` +
        `The Cartesian product multiplies the tuple counts (${pair.left.tuples.length} × ` +
        `${pair.right.tuples.length} = ${result.tuples.length}) and adds the attribute counts ` +
        `(${pair.left.attributes.length} + ${pair.right.attributes.length} = ${result.attributes.length}).`
      : `${subject} has degree ${result.attributes.length} and cardinality ${result.tuples.length}.`;

  return {
    id: `gen-shape-${variant}-${seed}`,
    topic: variant === "product" ? "cartesian-product" : VARIANT_TOPIC[variant],
    source: "generated",
    difficulty,
    kind: "shape",
    subject,
    prompt: `What are the degree and cardinality of ${subject}?`,
    context: { relations: [pair.left, pair.right] },
    degree: result.attributes.length,
    cardinality: result.tuples.length,
    explanation,
    hints: [
      "Degree counts attributes (columns). Cardinality counts tuples (rows).",
      variant === "product"
        ? "For a Cartesian product: degree adds, cardinality multiplies."
        : "Work out the result rows first, then count them."
    ]
  };
}

/**
 * Division in the homework's shape: project the dividend down to two
 * attributes, and divide by a set of `j` values.
 */
export function generateDivisionQuestion(
  seed: number,
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const rng = makeRng(seed ^ 0x1f2e3d4c);
  const pair = generateJoinPair(seed, JOIN_SPECS[difficulty]);

  const dividend = project(pair.left, ["r2", "j"]).relation;
  const divisorValues = sample(
    rng,
    pair.matchingValues,
    difficulty === "intro" ? 1 : Math.min(2, pair.matchingValues.length)
  );
  const divisor: Relation = {
    name: "T",
    attributes: ["j"],
    tuples: divisorValues.map((value) => [value])
  };

  const { relation: quotient, trace } = divide(dividend, divisor);
  const qualifying = new Set(quotient.tuples.map((tuple) => String(tuple[0])));

  // Every candidate is offered; the wrong ones are the near-misses that
  // cover some of the divisor but not all of it.
  const options = trace.candidates.map((candidate, index) => {
    const value = String(candidate[0]);
    const covered = trace.coverageByCandidate[index].filter(Boolean).length;
    const isCorrect = qualifying.has(value);
    return {
      text: value,
      correct: isCorrect,
      mistake: isCorrect ? undefined : ("division-any-not-all" as MistakeTag),
      note: isCorrect
        ? undefined
        : `${value} is paired with ${covered} of the ${divisorValues.length} required j ${
            divisorValues.length === 1 ? "value" : "values"
          }. Division means for all — every value in the divisor has to be covered, not just some.`
    };
  });

  if (!options.some((option) => option.correct)) {
    options.push({
      text: "None of these values qualify",
      correct: true,
      mistake: undefined,
      note: undefined
    });
  }

  return {
    id: `gen-division-${seed}`,
    topic: "division",
    source: "study-guide",
    sourceNote: "Study-guide style — generated variant of Homework #1, Question 1(g)",
    difficulty,
    kind: "choice",
    multiple: true,
    prompt: `Which r2 values are in Π r2, j (R) ÷ T, where T holds ${divisorValues.join(" and ")}?`,
    context: { relations: [dividend, divisor], note: "Select every value that qualifies." },
    options,
    explanation:
      `Division keeps the r2 values paired with EVERY j in the divisor. ` +
      `${
        quotient.tuples.length === 0
          ? "No value covers all of them here, so the result is empty — which is a legitimate answer."
          : `${quotient.tuples.map((t) => t[0]).join(", ")} ${
              quotient.tuples.length === 1 ? "does" : "do"
            }.`
      } Extra pairings beyond the divisor are ignored and never disqualify a value.`,
    hints: [
      "For each r2 value, list every j it appears with.",
      "Tick it only if that list contains every value in the divisor. Extra values do not matter."
    ]
  };
}

/**
 * Equijoin against natural join, asked about the schema rather than the rows.
 *
 * The two operators return the same tuples over the same data, so a
 * "which rows?" question cannot separate them. The difference is one column,
 * which makes this a question about degree and about which attributes survive.
 */
export function generateSchemaContrastQuestion(
  seed: number,
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const rng = makeRng(seed ^ 0x2c7f19ab);
  const pair = generateJoinPair(seed, JOIN_SPECS[difficulty]);
  const equi = thetaJoin(pair.left, pair.right, J_CONDITION).relation;
  const natural = naturalJoin(pair.left, pair.right).relation;

  const options = shuffle(rng, [
    {
      text: `They hold the same ${equi.tuples.length} tuples, but the equijoin has degree ${equi.attributes.length} and the natural join has degree ${natural.attributes.length}.`,
      correct: true
    },
    {
      text: "They are identical — natural join is just shorthand for an equijoin on the common attribute.",
      correct: false,
      mistake: "equijoin-vs-natural-join" as MistakeTag,
      note:
        `Not quite. The tuples match, but the schemas do not: the equijoin keeps both j columns ` +
        `(degree ${equi.attributes.length}) and the natural join eliminates one of them ` +
        `(degree ${natural.attributes.length}).`
    },
    {
      text: `The natural join returns fewer tuples because it removes duplicates.`,
      correct: false,
      mistake: "equijoin-vs-natural-join" as MistakeTag,
      note:
        `Both return ${equi.tuples.length} tuples here. A natural join removes a duplicate ` +
        `*attribute*, not duplicate tuples — nothing about the rows changes.`
    },
    {
      text: `The equijoin drops unmatched tuples and the natural join keeps them.`,
      correct: false,
      mistake: "inner-join-pads-unmatched" as MistakeTag,
      note:
        "Neither keeps unmatched tuples. Both are inner joins; preserving unmatched tuples takes an outer join."
    }
  ]);

  return {
    id: `gen-schema-contrast-${seed}`,
    topic: "natural-join",
    source: "study-guide",
    sourceNote: "Study-guide style — equijoin vs natural join",
    difficulty,
    kind: "choice",
    prompt: "How do R ⋈ R.j = S.j S and R ⋈ S differ over these two relations?",
    context: { relations: [pair.left, pair.right] },
    options,
    explanation:
      `Both operators pair the same tuples, so both return ${equi.tuples.length} tuples. ` +
      `The equijoin keeps both copies of the joining attribute — ${equi.attributes.join(", ")} — ` +
      `giving degree ${equi.attributes.length}. The natural join eliminates one occurrence of ` +
      `each common attribute — ${natural.attributes.join(", ")} — giving degree ${natural.attributes.length}.`,
    hints: [
      "Start by asking whether the two operators pair up the same tuples. They do.",
      "Now compare the attribute lists. One of them carries j twice."
    ]
  };
}
