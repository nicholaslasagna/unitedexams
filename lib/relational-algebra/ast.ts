/**
 * Expression trees.
 *
 * Relational algebra is closed — every operand and every result is a
 * relation, so expressions nest (Lecture 3). Representing an expression as a
 * tree rather than a string is what lets the product do three things a string
 * cannot: evaluate a learner's answer against real data, compare two
 * differently-written answers for equivalence, and walk a solution one step
 * at a time in the walkthrough.
 */

import type { Condition } from "./condition";
import {
  divide,
  difference,
  intersect,
  naturalJoin,
  outerJoin,
  product,
  project,
  select,
  semijoin,
  thetaJoin,
  union,
  OperationError,
  type DivisionTrace,
  type JoinTrace,
  type OuterSide,
  type ProjectTrace,
  type SelectTrace
} from "./operations";
import type { Relation } from "./relation";

export type RAExpr =
  | { kind: "relation"; name: string }
  | { kind: "select"; condition: Condition; input: RAExpr }
  | { kind: "project"; attributes: string[]; input: RAExpr }
  | { kind: "product"; left: RAExpr; right: RAExpr }
  | { kind: "join"; condition: Condition; left: RAExpr; right: RAExpr }
  | { kind: "naturalJoin"; left: RAExpr; right: RAExpr }
  | { kind: "outerJoin"; side: OuterSide; condition?: Condition; left: RAExpr; right: RAExpr }
  | { kind: "semijoin"; condition?: Condition; left: RAExpr; right: RAExpr }
  | { kind: "divide"; left: RAExpr; right: RAExpr }
  | { kind: "union"; left: RAExpr; right: RAExpr }
  | { kind: "intersect"; left: RAExpr; right: RAExpr }
  | { kind: "difference"; left: RAExpr; right: RAExpr };

export type RATrace =
  | { kind: "select"; trace: SelectTrace }
  | { kind: "project"; trace: ProjectTrace }
  | { kind: "join"; trace: JoinTrace }
  | { kind: "divide"; trace: DivisionTrace }
  | { kind: "none" };

/** One node's result, kept so the walkthrough can show intermediate tables. */
export interface EvalStep {
  expr: RAExpr;
  relation: Relation;
  trace: RATrace;
}

export type Database = Record<string, Relation>;

export class EvaluationError extends Error {}

/**
 * Evaluate an expression against a set of named relations.
 *
 * `steps` collects every node bottom-up, which is what the step-by-step view
 * and the "show me the intermediate table" affordance read from.
 */
export function evaluate(
  expr: RAExpr,
  database: Database,
  steps: EvalStep[] = []
): { relation: Relation; trace: RATrace; steps: EvalStep[] } {
  const record = (relation: Relation, trace: RATrace) => {
    steps.push({ expr, relation, trace });
    return { relation, trace, steps };
  };

  try {
    switch (expr.kind) {
      case "relation": {
        const found =
          database[expr.name] ??
          Object.values(database).find(
            (candidate) => candidate.name.toLowerCase() === expr.name.toLowerCase()
          );
        if (!found) {
          throw new EvaluationError(
            `There is no relation named ${expr.name} in this schema.`
          );
        }
        return record(found, { kind: "none" });
      }

      case "select": {
        const input = evaluate(expr.input, database, steps).relation;
        const { relation, trace } = select(input, expr.condition);
        return record(relation, { kind: "select", trace });
      }

      case "project": {
        const input = evaluate(expr.input, database, steps).relation;
        const { relation, trace } = project(input, expr.attributes);
        return record(relation, { kind: "project", trace });
      }

      case "product": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const { relation, trace } = product(left, right);
        return record(relation, { kind: "join", trace });
      }

      case "join": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const { relation, trace } = thetaJoin(left, right, expr.condition);
        return record(relation, { kind: "join", trace });
      }

      case "naturalJoin": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const { relation, trace } = naturalJoin(left, right);
        return record(relation, { kind: "join", trace });
      }

      case "outerJoin": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const { relation, trace } = outerJoin(left, right, expr.side, expr.condition);
        return record(relation, { kind: "join", trace });
      }

      case "semijoin": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const { relation, trace } = semijoin(left, right, expr.condition);
        return record(relation, { kind: "join", trace });
      }

      case "divide": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const { relation, trace } = divide(left, right);
        return record(relation, { kind: "divide", trace });
      }

      case "union":
      case "intersect":
      case "difference": {
        const left = evaluate(expr.left, database, steps).relation;
        const right = evaluate(expr.right, database, steps).relation;
        const fn =
          expr.kind === "union" ? union : expr.kind === "intersect" ? intersect : difference;
        return record(fn(left, right), { kind: "none" });
      }
    }
  } catch (error) {
    if (error instanceof OperationError || error instanceof EvaluationError) throw error;
    throw new EvaluationError(
      error instanceof Error ? error.message : "That expression could not be evaluated."
    );
  }
}

/** Relation names an expression reads, in first-seen order. */
export function referencedRelations(expr: RAExpr, seen: string[] = []): string[] {
  switch (expr.kind) {
    case "relation":
      if (!seen.includes(expr.name)) seen.push(expr.name);
      return seen;
    case "select":
    case "project":
      return referencedRelations(expr.input, seen);
    default:
      referencedRelations(expr.left, seen);
      return referencedRelations(expr.right, seen);
  }
}

/** Every operator used, for "did they reach for a join at all?" analysis. */
export function usedOperators(expr: RAExpr, seen: Set<RAExpr["kind"]> = new Set()) {
  seen.add(expr.kind);
  switch (expr.kind) {
    case "relation":
      break;
    case "select":
    case "project":
      usedOperators(expr.input, seen);
      break;
    default:
      usedOperators(expr.left, seen);
      usedOperators(expr.right, seen);
  }
  return seen;
}

export function isJoinKind(kind: RAExpr["kind"]): boolean {
  return (
    kind === "join" || kind === "naturalJoin" || kind === "outerJoin" || kind === "semijoin"
  );
}
