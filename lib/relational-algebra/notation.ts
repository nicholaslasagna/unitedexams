/**
 * How expressions are written down.
 *
 * The glyphs follow the course rather than a generic textbook:
 *
 *   - projection is **Π**, the way every Lecture 3–5 slide writes it (π means
 *     the same thing and the parser accepts it, but Π is what the exam shows);
 *   - the semijoin is **▷**, which is what Lecture 5 and Homework #1 use;
 *     ⋉ is the same operator and is offered as the alternate form;
 *   - the Cartesian product is written **X** in the slides, so that is the
 *     primary glyph, with × accepted on input.
 *
 * Output is a token list, not a LaTeX string. Outer-join glyphs (⟕ ⟖ ⟗) have
 * no core KaTeX macro, and a half-supported macro renders as literal
 * backslash-text in front of a student revising for an exam. Unicode plus a
 * styled subscript is both more reliable and easier to make accessible.
 */

import { conditionText, type Condition } from "./condition";
import type { RAExpr } from "./ast";

export interface SymbolEntry {
  glyph: string;
  /** Equally valid glyph a learner may meet elsewhere. */
  alternate?: string;
  name: string;
  /** One-line meaning, as the cheat sheet states it. */
  meaning: string;
  example: string;
  /** What the example produces, in words. */
  exampleMeaning: string;
}

export const RA_SYMBOLS: SymbolEntry[] = [
  {
    glyph: "σ",
    name: "Selection",
    meaning: "Keeps the rows that satisfy a condition. Slices horizontally.",
    example: "σ salary > 10000 (Staff)",
    exampleMeaning: "The staff tuples whose salary is over 10,000. Same columns, fewer rows."
  },
  {
    glyph: "Π",
    alternate: "π",
    name: "Projection",
    meaning: "Keeps the listed columns and eliminates duplicate tuples. Slices vertically.",
    example: "Π city (Branch)",
    exampleMeaning: "The distinct cities branches are in. Duplicates collapse to one row."
  },
  {
    glyph: "X",
    alternate: "×",
    name: "Cartesian product",
    meaning: "Every tuple of R paired with every tuple of S. Degree adds, cardinality multiplies.",
    example: "R X S",
    exampleMeaning: "All possible pairings — no condition is applied."
  },
  {
    glyph: "⋈",
    name: "Join (theta / equi)",
    meaning: "The tuples of R X S that satisfy F. Both copies of the joining attribute stay.",
    example: "R ⋈ R.j = S.j S",
    exampleMeaning: "Matching pairs only. Equivalent to σ F (R X S)."
  },
  {
    glyph: "⋈",
    name: "Natural join",
    meaning:
      "An equijoin over every common attribute, with one copy of each common attribute removed.",
    example: "R ⋈ S",
    exampleMeaning: "Matches on all shared attribute names; the duplicate column collapses."
  },
  {
    glyph: "⟕",
    name: "Left outer join",
    meaning: "Matching tuples, plus every unmatched tuple of the LEFT relation, padded with NULL.",
    example: "R ⟕ R.j = S.j S",
    exampleMeaning: "Nothing from R is lost. Unmatched R rows get NULLs on the S side."
  },
  {
    glyph: "⟖",
    name: "Right outer join",
    meaning: "Matching tuples, plus every unmatched tuple of the RIGHT relation, padded with NULL.",
    example: "R ⟖ R.j = S.j S",
    exampleMeaning: "Nothing from S is lost. Unmatched R rows disappear."
  },
  {
    glyph: "⟗",
    name: "Full outer join",
    meaning: "Matching tuples plus the unmatched tuples of both relations, padded with NULL.",
    example: "R ⟗ R.j = S.j S",
    exampleMeaning:
      "Nothing is lost from either side. Still not a Cartesian product — only matches are paired."
  },
  {
    glyph: "▷",
    alternate: "⋉",
    name: "Semijoin",
    meaning:
      "The tuples of the LEFT relation that have at least one match. Only the left relation's attributes are returned.",
    example: "Staff ▷ Staff.branchNo = Branch.branchNo (σ city = 'Glasgow' (Branch))",
    exampleMeaning:
      "Complete Staff tuples for staff at a Glasgow branch. Branch decides who qualifies, then disappears."
  },
  {
    glyph: "÷",
    name: "Division",
    meaning: "The values paired with EVERY tuple of the divisor. Answers a 'for all' question.",
    example: "Π clientNo, propertyNo (Viewing) ÷ Π propertyNo (σ rooms = 3 (PropertyForRent))",
    exampleMeaning: "Clients who have viewed all three-room properties — every one, not just some."
  },
  {
    glyph: "∧",
    name: "AND",
    meaning: "Both conditions must hold.",
    example: "σ type = 'Suite' ∧ price > 150 (Room)",
    exampleMeaning: "Suites that also cost more than 150."
  },
  {
    glyph: "∨",
    name: "OR",
    meaning: "At least one condition must hold.",
    example: "σ j = 'J1' ∨ j = 'J2' (S)",
    exampleMeaning: "Tuples whose j is either J1 or J2."
  },
  {
    glyph: "∪",
    name: "Union",
    meaning: "Every tuple in either relation, duplicates removed. Relations must be union-compatible.",
    example: "Π city (Branch) ∪ Π city (PropertyForRent)",
    exampleMeaning: "Cities with a branch office or a property for rent."
  },
  {
    glyph: "∩",
    name: "Intersection",
    meaning: "Tuples in both relations. R ∩ S = R − (R − S).",
    example: "Π city (Branch) ∩ Π city (PropertyForRent)",
    exampleMeaning: "Cities with both a branch office and a property."
  },
  {
    glyph: "−",
    name: "Set difference",
    meaning: "Tuples in R but not in S. Relations must be union-compatible.",
    example: "Π city (Branch) − Π city (PropertyForRent)",
    exampleMeaning: "Cities with a branch office but no property for rent."
  }
];

export type TokenKind =
  | "operator"
  | "subscript"
  | "relation"
  | "punct"
  | "attributes"
  | "space";

export interface NotationToken {
  kind: TokenKind;
  text: string;
  /** Accessible name / tooltip for an operator glyph. */
  title?: string;
}

const OPERATOR_TITLES: Record<string, string> = {
  σ: "selection",
  Π: "projection",
  X: "Cartesian product",
  "⋈": "join",
  "⟕": "left outer join",
  "⟖": "right outer join",
  "⟗": "full outer join",
  "▷": "semijoin",
  "÷": "division",
  "∪": "union",
  "∩": "intersection",
  "−": "set difference"
};

function op(text: string): NotationToken {
  return { kind: "operator", text, title: OPERATOR_TITLES[text] };
}

const SPACE: NotationToken = { kind: "space", text: " " };
const OPEN: NotationToken = { kind: "punct", text: "(" };
const CLOSE: NotationToken = { kind: "punct", text: ")" };

/**
 * Whether a sub-expression needs brackets when it appears as a binary
 * operand. A bare relation never does; anything with its own operator does,
 * which keeps `(σ…(Room)) ⋈ Hotel` unambiguous without over-bracketing
 * simple expressions into noise.
 */
function needsBrackets(expr: RAExpr): boolean {
  return expr.kind !== "relation";
}

function operand(expr: RAExpr): NotationToken[] {
  const inner = tokenize(expr);
  return needsBrackets(expr) ? [OPEN, ...inner, CLOSE] : inner;
}

function binary(
  glyph: string,
  left: RAExpr,
  right: RAExpr,
  condition?: Condition
): NotationToken[] {
  const tokens: NotationToken[] = [...operand(left), SPACE, op(glyph)];
  if (condition) {
    tokens.push({ kind: "subscript", text: conditionText(condition) });
  }
  tokens.push(SPACE, ...operand(right));
  return tokens;
}

/** An expression as renderable tokens. */
export function tokenize(expr: RAExpr): NotationToken[] {
  switch (expr.kind) {
    case "relation":
      return [{ kind: "relation", text: expr.name }];

    case "select":
      return [
        op("σ"),
        { kind: "subscript", text: conditionText(expr.condition) },
        SPACE,
        OPEN,
        ...tokenize(expr.input),
        CLOSE
      ];

    case "project":
      return [
        op("Π"),
        { kind: "attributes", text: expr.attributes.join(", ") },
        SPACE,
        OPEN,
        ...tokenize(expr.input),
        CLOSE
      ];

    case "product":
      return binary("X", expr.left, expr.right);

    case "join":
      return binary("⋈", expr.left, expr.right, expr.condition);

    case "naturalJoin":
      return binary("⋈", expr.left, expr.right);

    case "outerJoin":
      return binary(
        expr.side === "left" ? "⟕" : expr.side === "right" ? "⟖" : "⟗",
        expr.left,
        expr.right,
        expr.condition
      );

    case "semijoin":
      return binary("▷", expr.left, expr.right, expr.condition);

    case "divide":
      return binary("÷", expr.left, expr.right);

    case "union":
      return binary("∪", expr.left, expr.right);

    case "intersect":
      return binary("∩", expr.left, expr.right);

    case "difference":
      return binary("−", expr.left, expr.right);
  }
}

/**
 * Flat text, with conditions and attribute lists in braces. This is the form
 * the typed-expression editor round-trips and the form stored in content, so
 * it has to be something the parser accepts back.
 */
export function toText(expr: RAExpr): string {
  return tokenize(expr)
    .map((token) => {
      if (token.kind === "subscript" || token.kind === "attributes") return `_{${token.text}}`;
      return token.text;
    })
    .join("")
    .replace(/\s+/g, " ")
    .trim();
}

/** Spoken form, so a screen reader gets "projection of" rather than "Pi". */
export function toSpeech(expr: RAExpr): string {
  switch (expr.kind) {
    case "relation":
      return expr.name;
    case "select":
      return `selection where ${conditionText(expr.condition)} of ${toSpeech(expr.input)}`;
    case "project":
      return `projection of ${expr.attributes.join(", ")} from ${toSpeech(expr.input)}`;
    case "product":
      return `${toSpeech(expr.left)} Cartesian product ${toSpeech(expr.right)}`;
    case "join":
      return `${toSpeech(expr.left)} join on ${conditionText(expr.condition)} ${toSpeech(expr.right)}`;
    case "naturalJoin":
      return `${toSpeech(expr.left)} natural join ${toSpeech(expr.right)}`;
    case "outerJoin":
      return `${toSpeech(expr.left)} ${expr.side} outer join ${
        expr.condition ? `on ${conditionText(expr.condition)} ` : ""
      }${toSpeech(expr.right)}`;
    case "semijoin":
      return `${toSpeech(expr.left)} semijoin ${
        expr.condition ? `on ${conditionText(expr.condition)} ` : ""
      }${toSpeech(expr.right)}`;
    case "divide":
      return `${toSpeech(expr.left)} divided by ${toSpeech(expr.right)}`;
    case "union":
      return `${toSpeech(expr.left)} union ${toSpeech(expr.right)}`;
    case "intersect":
      return `${toSpeech(expr.left)} intersect ${toSpeech(expr.right)}`;
    case "difference":
      return `${toSpeech(expr.left)} minus ${toSpeech(expr.right)}`;
  }
}

/** Palette for the expression builder, in the order the course introduces them. */
export const BUILDER_PALETTE = [
  { glyph: "σ", label: "Select", insert: "σ_{}" },
  { glyph: "Π", label: "Project", insert: "Π_{}" },
  { glyph: "X", label: "Product", insert: " X " },
  { glyph: "⋈", label: "Join", insert: " ⋈_{} " },
  { glyph: "⟕", label: "Left outer", insert: " ⟕_{} " },
  { glyph: "⟖", label: "Right outer", insert: " ⟖_{} " },
  { glyph: "⟗", label: "Full outer", insert: " ⟗_{} " },
  { glyph: "▷", label: "Semijoin", insert: " ▷_{} " },
  { glyph: "÷", label: "Divide", insert: " ÷ " },
  { glyph: "∧", label: "And", insert: " ∧ " },
  { glyph: "∨", label: "Or", insert: " ∨ " },
  { glyph: "∪", label: "Union", insert: " ∪ " },
  { glyph: "∩", label: "Intersect", insert: " ∩ " },
  { glyph: "−", label: "Minus", insert: " − " },
  { glyph: "≠", label: "Not equal", insert: " ≠ " },
  { glyph: "≤", label: "At most", insert: " ≤ " },
  { glyph: "≥", label: "At least", insert: " ≥ " }
] as const;
