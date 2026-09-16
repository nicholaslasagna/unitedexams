/**
 * Grading an expression a learner wrote.
 *
 * The rule this module exists to enforce: a mathematically equivalent answer
 * is correct even when it is written differently. `Π hotelName (Room ⋈ Hotel)`
 * and `Π hotelName (Hotel ⋈ Room)` are the same query, and marking the second
 * wrong because the stored solution names Hotel first teaches copying instead
 * of reasoning.
 *
 * Equivalence is decided by *evaluation*, not by comparing trees: both
 * expressions are run against the course data and their result relations are
 * compared as sets. Because agreeing on one instance is weaker than general
 * equivalence, the check also runs against perturbed copies of the same
 * schema, which catches the usual near-misses — a missing condition, a `>`
 * where `≥` belongs, a join that happens to be harmless on the sample rows.
 */

import { evaluate, referencedRelations, usedOperators, type Database, type RAExpr } from "./ast";
import type { Condition } from "./condition";
import { relationsEqual, type RAValue, type Relation } from "./relation";
import { ParseError, parseExpression } from "./parser";

export type EquivalenceVerdict =
  | { status: "equivalent" }
  | { status: "different"; reason: string; expected: Relation; actual: Relation }
  | { status: "error"; reason: string; position?: number };

/** Every numeric constant either expression compares against. */
function numericLiterals(expr: RAExpr, found: Set<number> = new Set()): Set<number> {
  const fromCondition = (condition: Condition) => {
    switch (condition.kind) {
      case "compare":
        for (const side of [condition.left, condition.right]) {
          if (side.kind === "literal" && typeof side.value === "number") found.add(side.value);
        }
        break;
      case "and":
      case "or":
        fromCondition(condition.left);
        fromCondition(condition.right);
        break;
      case "not":
        fromCondition(condition.inner);
        break;
    }
  };

  switch (expr.kind) {
    case "relation":
      break;
    case "select":
      fromCondition(expr.condition);
      numericLiterals(expr.input, found);
      break;
    case "project":
      numericLiterals(expr.input, found);
      break;
    default:
      if ("condition" in expr && expr.condition) fromCondition(expr.condition);
      numericLiterals(expr.left, found);
      numericLiterals(expr.right, found);
  }
  return found;
}

/**
 * Deterministic variations of a database, used as extra witnesses.
 *
 * Two expressions that differ only in a condition frequently agree on the
 * canonical instance and disagree the moment the right row exists. Rather
 * than inventing new schemas, each witness perturbs the existing tuples.
 *
 * The important one is the boundary witness. `price > 170` and `price ≥ 175`
 * pick out the same rooms in the sample data and are still different queries;
 * only a row sitting exactly on one of the constants separates them. So the
 * constants both expressions mention are collected, and every numeric column
 * is rewritten to sweep through those values and their immediate neighbours.
 * Nudging the data by a fixed amount does not do this — the gap between two
 * constants swallows it.
 */
function witnessDatabases(
  database: Database,
  relationNames: string[],
  boundaries: number[]
): Database[] {
  const witnesses: Database[] = [];

  // Witness 1: drop the last tuple of each referenced relation, so a join
  // that quietly matched everything now has an unmatched row.
  const dropped: Database = { ...database };
  for (const name of relationNames) {
    const relation = database[name];
    if (!relation || relation.tuples.length < 2) continue;
    dropped[name] = { ...relation, tuples: relation.tuples.slice(0, -1) };
  }
  witnesses.push(dropped);

  // Witness 2: sweep numeric columns across the constants under test.
  const probes = [
    ...new Set(boundaries.flatMap((value) => [value - 1, value, value + 1]))
  ].sort((a, b) => a - b);

  if (probes.length > 0) {
    const swept: Database = { ...database };
    for (const name of relationNames) {
      const relation = database[name];
      if (!relation) continue;
      let cursor = 0;
      let touched = false;
      const tuples = relation.tuples.map((tuple) =>
        tuple.map((value: RAValue) => {
          if (typeof value !== "number") return value;
          touched = true;
          const probe = probes[cursor % probes.length];
          cursor += 1;
          return probe;
        })
      );
      if (touched) swept[name] = { ...relation, tuples };
    }
    witnesses.push(swept);
  }

  return witnesses;
}

function describeDifference(expected: Relation, actual: Relation): string {
  if (actual.attributes.length !== expected.attributes.length) {
    return `Your result has ${actual.attributes.length} ${
      actual.attributes.length === 1 ? "column" : "columns"
    }, but the question asks for ${expected.attributes.length}.`;
  }

  const base = (name: string) => name.split(".").pop()!.toLowerCase();
  const actualBases = new Set(actual.attributes.map(base));
  // Compare case-insensitively but report the attribute as the schema spells
  // it — `hotelName`, not `hotelname`.
  const missing = expected.attributes.filter((name) => !actualBases.has(base(name)));
  if (missing.length > 0) {
    return `Your result is missing ${missing.join(", ")}.`;
  }

  if (actual.tuples.length !== expected.tuples.length) {
    return `Your expression returns ${actual.tuples.length} ${
      actual.tuples.length === 1 ? "tuple" : "tuples"
    }; the correct answer has ${expected.tuples.length}.`;
  }

  return "Your result has the right shape but contains different tuples.";
}

/**
 * Compare a learner's expression with the reference answer.
 *
 * `database` supplies the relation instances. Both expressions must evaluate;
 * a reference answer that fails to evaluate is a content bug and is reported
 * as an error rather than silently marking the learner wrong.
 */
export function checkEquivalence(
  submitted: RAExpr,
  reference: RAExpr,
  database: Database
): EquivalenceVerdict {
  let expected: Relation;
  try {
    expected = evaluate(reference, database).relation;
  } catch (error) {
    return {
      status: "error",
      reason: `The reference answer for this question could not be evaluated: ${
        error instanceof Error ? error.message : "unknown error"
      }`
    };
  }

  let actual: Relation;
  try {
    actual = evaluate(submitted, database).relation;
  } catch (error) {
    return {
      status: "error",
      reason: error instanceof Error ? error.message : "That expression could not be evaluated."
    };
  }

  if (!relationsEqual(expected, actual)) {
    return {
      status: "different",
      reason: describeDifference(expected, actual),
      expected,
      actual
    };
  }

  // Agreeing on the canonical instance is necessary but not sufficient.
  const names = [
    ...new Set([...referencedRelations(reference), ...referencedRelations(submitted)])
  ];
  const boundaries = [
    ...new Set([...numericLiterals(reference), ...numericLiterals(submitted)])
  ];
  for (const witness of witnessDatabases(database, names, boundaries)) {
    try {
      const witnessExpected = evaluate(reference, witness).relation;
      const witnessActual = evaluate(submitted, witness).relation;
      if (!relationsEqual(witnessExpected, witnessActual)) {
        return {
          status: "different",
          reason:
            "Your expression gives the right answer for this data, but not in general — " +
            "it differs once the tables change. Check your conditions.",
          expected,
          actual
        };
      }
    } catch {
      // A witness that one side cannot evaluate proves nothing; skip it.
      continue;
    }
  }

  return { status: "equivalent" };
}

/** Parse then grade, so callers can hand over raw editor text. */
export function gradeExpressionText(
  text: string,
  reference: RAExpr,
  database: Database
): EquivalenceVerdict {
  try {
    return checkEquivalence(parseExpression(text), reference, database);
  } catch (error) {
    if (error instanceof ParseError) {
      return { status: "error", reason: error.message, position: error.position };
    }
    return {
      status: "error",
      reason: error instanceof Error ? error.message : "That expression could not be read."
    };
  }
}

/**
 * Structural observations used to tag *why* an answer is wrong.
 *
 * These are hints for the mistake classifier, not a verdict — the verdict
 * always comes from evaluation.
 */
export interface StructuralDiff {
  missingRelations: string[];
  extraRelations: string[];
  submittedOperators: Set<RAExpr["kind"]>;
  referenceOperators: Set<RAExpr["kind"]>;
  /** True when the reference joins two relations and the submission does not. */
  missingJoin: boolean;
  /** True when the submission projects and the reference does not, or vice versa. */
  projectionMismatch: boolean;
}

export function structuralDiff(submitted: RAExpr, reference: RAExpr): StructuralDiff {
  const submittedRelations = referencedRelations(submitted);
  const referenceRelations = referencedRelations(reference);
  const submittedOperators = usedOperators(submitted);
  const referenceOperators = usedOperators(reference);

  const joinKinds: RAExpr["kind"][] = ["join", "naturalJoin", "outerJoin", "semijoin", "product"];
  const referenceJoins = joinKinds.some((kind) => referenceOperators.has(kind));
  const submittedJoins = joinKinds.some((kind) => submittedOperators.has(kind));

  return {
    missingRelations: referenceRelations.filter(
      (name) => !submittedRelations.some((other) => other.toLowerCase() === name.toLowerCase())
    ),
    extraRelations: submittedRelations.filter(
      (name) => !referenceRelations.some((other) => other.toLowerCase() === name.toLowerCase())
    ),
    submittedOperators,
    referenceOperators,
    missingJoin: referenceJoins && !submittedJoins,
    projectionMismatch:
      referenceOperators.has("project") !== submittedOperators.has("project")
  };
}
