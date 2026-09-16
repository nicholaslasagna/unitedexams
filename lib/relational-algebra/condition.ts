/**
 * Predicates for σ and for the theta-join's F.
 *
 * Lecture 4 defines the theta-join predicate as one or more comparisons
 * `R.a θ S.b` where θ ∈ {<, ≤, >, ≥, =, ≠}, combined with ∧ and ∨ — so that
 * is exactly what this supports, plus NOT for completeness.
 *
 * NULL follows the relational rule rather than JavaScript's: a comparison
 * involving NULL is unknown, and unknown is not true. That is what makes the
 * padded rows of an outer join behave the way the slides show.
 */

import {
  ATTRIBUTE_AMBIGUOUS,
  ATTRIBUTE_NOT_FOUND,
  resolveAttributeIndex,
  type RAValue,
  type Relation,
  type Tuple
} from "./relation";

export type ComparisonOperator = "=" | "!=" | "<" | "<=" | ">" | ">=";

export type Operand =
  | { kind: "attribute"; name: string }
  | { kind: "literal"; value: RAValue };

export type Condition =
  | { kind: "compare"; left: Operand; operator: ComparisonOperator; right: Operand }
  | { kind: "and"; left: Condition; right: Condition }
  | { kind: "or"; left: Condition; right: Condition }
  | { kind: "not"; inner: Condition };

export const attr = (name: string): Operand => ({ kind: "attribute", name });
export const lit = (value: RAValue): Operand => ({ kind: "literal", value });

export function compare(
  left: Operand,
  operator: ComparisonOperator,
  right: Operand
): Condition {
  return { kind: "compare", left, operator, right };
}

export function and(left: Condition, right: Condition): Condition {
  return { kind: "and", left, right };
}

export function or(left: Condition, right: Condition): Condition {
  return { kind: "or", left, right };
}

export class ConditionError extends Error {}

function operandValue(operand: Operand, relation: Relation, tuple: Tuple): RAValue {
  if (operand.kind === "literal") return operand.value;
  const index = resolveAttributeIndex(relation, operand.name);
  if (index === ATTRIBUTE_NOT_FOUND) {
    throw new ConditionError(
      `${relation.name} has no attribute named ${operand.name}.`
    );
  }
  if (index === ATTRIBUTE_AMBIGUOUS) {
    throw new ConditionError(
      `${operand.name} is ambiguous here — qualify it, for example ${relation.name}.${operand.name}.`
    );
  }
  return tuple[index];
}

/**
 * Compare two values. Numbers compare numerically; strings compare
 * case-insensitively so `'Manager'` matches `Manager`. A numeric string is
 * compared numerically against a number, which is what makes `price > 50`
 * work whether the data stores 50 or "50".
 */
function compareValues(
  left: RAValue,
  operator: ComparisonOperator,
  right: RAValue
): boolean {
  // Relational NULL: any comparison is unknown, and unknown is not true.
  if (left === null || right === null) return false;

  const leftNumber = typeof left === "number" ? left : Number(left);
  const rightNumber = typeof right === "number" ? right : Number(right);
  const numeric =
    Number.isFinite(leftNumber) &&
    Number.isFinite(rightNumber) &&
    String(left).trim() !== "" &&
    String(right).trim() !== "";

  if (numeric) {
    switch (operator) {
      case "=":
        return leftNumber === rightNumber;
      case "!=":
        return leftNumber !== rightNumber;
      case "<":
        return leftNumber < rightNumber;
      case "<=":
        return leftNumber <= rightNumber;
      case ">":
        return leftNumber > rightNumber;
      case ">=":
        return leftNumber >= rightNumber;
    }
  }

  const a = String(left).toLowerCase();
  const b = String(right).toLowerCase();
  switch (operator) {
    case "=":
      return a === b;
    case "!=":
      return a !== b;
    case "<":
      return a < b;
    case "<=":
      return a <= b;
    case ">":
      return a > b;
    case ">=":
      return a >= b;
  }
}

export function evaluateCondition(
  condition: Condition,
  relation: Relation,
  tuple: Tuple
): boolean {
  switch (condition.kind) {
    case "compare":
      return compareValues(
        operandValue(condition.left, relation, tuple),
        condition.operator,
        operandValue(condition.right, relation, tuple)
      );
    case "and":
      return (
        evaluateCondition(condition.left, relation, tuple) &&
        evaluateCondition(condition.right, relation, tuple)
      );
    case "or":
      return (
        evaluateCondition(condition.left, relation, tuple) ||
        evaluateCondition(condition.right, relation, tuple)
      );
    case "not":
      return !evaluateCondition(condition.inner, relation, tuple);
  }
}

/** Every attribute name mentioned, for "which table holds this?" feedback. */
export function conditionAttributes(condition: Condition): string[] {
  switch (condition.kind) {
    case "compare": {
      const names: string[] = [];
      if (condition.left.kind === "attribute") names.push(condition.left.name);
      if (condition.right.kind === "attribute") names.push(condition.right.name);
      return names;
    }
    case "and":
    case "or":
      return [
        ...conditionAttributes(condition.left),
        ...conditionAttributes(condition.right)
      ];
    case "not":
      return conditionAttributes(condition.inner);
  }
}

/**
 * True when the predicate compares one attribute to another rather than to a
 * constant — i.e. it is a *join* condition, not a *filter*. Confusing the two
 * is one of the mistakes this course punishes, so the distinction is
 * first-class here rather than inferred at the call site.
 */
export function isJoinCondition(condition: Condition): boolean {
  switch (condition.kind) {
    case "compare":
      return condition.left.kind === "attribute" && condition.right.kind === "attribute";
    case "and":
    case "or":
      return isJoinCondition(condition.left) || isJoinCondition(condition.right);
    case "not":
      return isJoinCondition(condition.inner);
  }
}

/** True when every comparison uses `=` — the test for an equijoin. */
export function isEqualityOnly(condition: Condition): boolean {
  switch (condition.kind) {
    case "compare":
      return condition.operator === "=";
    case "and":
    case "or":
      return isEqualityOnly(condition.left) && isEqualityOnly(condition.right);
    case "not":
      return false;
  }
}

const OPERATOR_GLYPH: Record<ComparisonOperator, string> = {
  "=": "=",
  "!=": "≠",
  "<": "<",
  "<=": "≤",
  ">": ">",
  ">=": "≥"
};

function operandText(operand: Operand): string {
  if (operand.kind === "attribute") return operand.name;
  if (operand.value === null) return "null";
  if (typeof operand.value === "number") return String(operand.value);
  return `'${operand.value}'`;
}

/** Human-readable predicate using the course's glyphs (≠ ≤ ≥ ∧ ∨). */
export function conditionText(condition: Condition): string {
  switch (condition.kind) {
    case "compare":
      return `${operandText(condition.left)} ${OPERATOR_GLYPH[condition.operator]} ${operandText(
        condition.right
      )}`;
    case "and":
      return `${conditionText(condition.left)} ∧ ${conditionText(condition.right)}`;
    case "or":
      return `${conditionText(condition.left)} ∨ ${conditionText(condition.right)}`;
    case "not":
      return `¬(${conditionText(condition.inner)})`;
  }
}
