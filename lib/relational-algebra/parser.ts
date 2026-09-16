/**
 * A parser for typed relational-algebra expressions.
 *
 * String comparison is not an adequate way to grade this material: a learner
 * who writes `Π hotelName (Room ⋈ Hotel)` has given a correct answer to a
 * question whose stored solution puts Hotel first, and marking that wrong
 * teaches them to copy rather than to reason. Parsing to a tree lets the
 * grader *evaluate* both answers and compare the relations.
 *
 * The grammar is deliberately forgiving about the things students vary and
 * strict about the things that change meaning:
 *
 *   forgiving — Π or π or `project`, X or × or `*`, ▷ or ⋉, `_{...}` or a
 *               bare subscript, straight or curly quotes, any spacing;
 *   strict    — which operator, which attributes, which condition.
 *
 * Errors carry a position and a plain-English message, because a parse error
 * is the first feedback a learner sees and "unexpected token" teaches nothing.
 */

import { and, compare, lit, attr, or, type Condition, type ComparisonOperator, type Operand } from "./condition";
import type { RAExpr } from "./ast";

export class ParseError extends Error {
  constructor(message: string, readonly position: number) {
    super(message);
  }
}

/** Normalises the many ways a glyph can be typed or pasted. */
function normalise(source: string): string {
  return source
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/ /g, " ")
    // Word forms, longest first so `natural join` beats `join`.
    //
    // The trailing guard is a lookahead rather than \b: an operator is very
    // often written straight against its subscript (`project_{city}`), and
    // `_` counts as a word character, so \b never fires there.
    .replace(/\bnatural\s+join(?![A-Za-z0-9])/gi, "⋈")
    .replace(/\bleft\s+outer\s+join(?![A-Za-z0-9])/gi, "⟕")
    .replace(/\bright\s+outer\s+join(?![A-Za-z0-9])/gi, "⟖")
    .replace(/\bfull\s+outer\s+join(?![A-Za-z0-9])/gi, "⟗")
    .replace(/\bsemi\s*join(?![A-Za-z0-9])/gi, "▷")
    .replace(/\bjoin(?![A-Za-z0-9])/gi, "⋈")
    .replace(/\bdivide(?:d\s+by)?(?![A-Za-z0-9])/gi, "÷")
    .replace(/\bunion(?![A-Za-z0-9])/gi, "∪")
    .replace(/\bintersect(?:ion)?(?![A-Za-z0-9])/gi, "∩")
    .replace(/\bminus(?![A-Za-z0-9])/gi, "−")
    .replace(/\bdifference(?![A-Za-z0-9])/gi, "−")
    .replace(/\bproject(?![A-Za-z0-9])/gi, "Π")
    .replace(/\bselect(?![A-Za-z0-9])/gi, "σ")
    .replace(/\bpi(?![A-Za-z0-9])/gi, "Π")
    .replace(/\bsigma(?![A-Za-z0-9])/gi, "σ")
    .replace(/\band(?![A-Za-z0-9])/gi, "∧")
    .replace(/\bor(?![A-Za-z0-9])/gi, "∨")
    // Glyph aliases.
    .replace(/π/g, "Π")
    .replace(/⋉/g, "▷")
    .replace(/⊳/g, "▷")
    .replace(/⋊/g, "◁")
    .replace(/[×*]/g, "X")
    .replace(/⋈/g, "⋈")
    .replace(/<=/g, "≤")
    .replace(/>=/g, "≥")
    .replace(/(!=|<>)/g, "≠")
    .replace(/&&/g, "∧")
    .replace(/\|\|/g, "∨")
    .replace(/[–—]/g, "−");
}

const BINARY_GLYPHS = ["X", "⋈", "⟕", "⟖", "⟗", "▷", "◁", "÷", "∪", "∩", "−", "-"] as const;

interface Cursor {
  text: string;
  pos: number;
}

function skipSpace(c: Cursor) {
  while (c.pos < c.text.length && /\s/.test(c.text[c.pos])) c.pos += 1;
}

function peek(c: Cursor): string {
  return c.text[c.pos] ?? "";
}

function startsWith(c: Cursor, token: string): boolean {
  return c.text.startsWith(token, c.pos);
}

/** Read to the matching close bracket, honouring nesting. */
function readBracketed(c: Cursor, open: string, close: string): string {
  if (peek(c) !== open) {
    throw new ParseError(`Expected ${open} here.`, c.pos);
  }
  const start = c.pos;
  let depth = 0;
  while (c.pos < c.text.length) {
    const ch = c.text[c.pos];
    if (ch === open) depth += 1;
    if (ch === close) {
      depth -= 1;
      if (depth === 0) {
        const inner = c.text.slice(start + 1, c.pos);
        c.pos += 1;
        return inner;
      }
    }
    c.pos += 1;
  }
  throw new ParseError(
    `This ${open} is never closed — check your brackets.`,
    start
  );
}

/**
 * Subscript after σ / Π. The professor writes these with the condition or
 * attribute list set small and no braces, so anything up to the argument's
 * opening bracket is taken as the subscript.
 */
function readUnarySubscript(c: Cursor): string {
  skipSpace(c);
  if (peek(c) === "_") c.pos += 1;
  skipSpace(c);
  if (peek(c) === "{") return readBracketed(c, "{", "}").trim();
  if (peek(c) === "[") return readBracketed(c, "[", "]").trim();

  // Bare form: read until the bracket that opens the operand.
  const start = c.pos;
  while (c.pos < c.text.length && c.text[c.pos] !== "(") c.pos += 1;
  if (c.pos >= c.text.length) {
    throw new ParseError(
      "This operator needs a relation in brackets after it, for example σ price > 50 (Room).",
      start
    );
  }
  return c.text.slice(start, c.pos).trim();
}

/** Optional braced subscript after a join glyph. */
function readBinarySubscript(c: Cursor): string | null {
  const save = c.pos;
  skipSpace(c);
  if (peek(c) === "_") {
    c.pos += 1;
    skipSpace(c);
  }
  if (peek(c) === "{") return readBracketed(c, "{", "}").trim();
  if (peek(c) === "[") return readBracketed(c, "[", "]").trim();
  c.pos = save;
  return null;
}

const IDENT = /[A-Za-z_][A-Za-z0-9_]*(?:\.[A-Za-z_][A-Za-z0-9_]*)?/y;

function readIdentifier(c: Cursor): string | null {
  IDENT.lastIndex = c.pos;
  const match = IDENT.exec(c.text);
  if (!match || match.index !== c.pos) return null;
  c.pos += match[0].length;
  return match[0];
}

// ── Conditions ────────────────────────────────────────────────────────────

function parseOperand(c: Cursor): Operand {
  skipSpace(c);
  const ch = peek(c);

  if (ch === "'" || ch === '"') {
    const quote = ch;
    c.pos += 1;
    const start = c.pos;
    while (c.pos < c.text.length && c.text[c.pos] !== quote) c.pos += 1;
    const value = c.text.slice(start, c.pos);
    if (c.pos >= c.text.length) {
      throw new ParseError("This quoted value is never closed.", start - 1);
    }
    c.pos += 1;
    return lit(value);
  }

  if (/[0-9]/.test(ch) || (ch === "-" && /[0-9]/.test(c.text[c.pos + 1] ?? ""))) {
    const start = c.pos;
    if (ch === "-") c.pos += 1;
    while (c.pos < c.text.length && /[0-9._]/.test(c.text[c.pos])) c.pos += 1;
    return lit(Number(c.text.slice(start, c.pos).replace(/_/g, "")));
  }

  const identifier = readIdentifier(c);
  if (identifier === null) {
    throw new ParseError(
      "Expected an attribute name or a value here.",
      c.pos
    );
  }
  if (/^(null)$/i.test(identifier)) return lit(null);
  return attr(identifier);
}

const COMPARATORS: Array<[string, ComparisonOperator]> = [
  ["≤", "<="],
  ["≥", ">="],
  ["≠", "!="],
  ["=", "="],
  ["<", "<"],
  [">", ">"]
];

function parseComparison(c: Cursor): Condition {
  skipSpace(c);
  if (peek(c) === "(") {
    const inner = readBracketed(c, "(", ")");
    return parseCondition(inner);
  }

  const left = parseOperand(c);
  skipSpace(c);
  for (const [glyph, operator] of COMPARATORS) {
    if (startsWith(c, glyph)) {
      c.pos += glyph.length;
      const right = parseOperand(c);
      return compare(left, operator, right);
    }
  }
  throw new ParseError(
    "Expected a comparison (=, ≠, <, ≤, >, ≥) in this condition.",
    c.pos
  );
}

function parseConjunction(c: Cursor): Condition {
  let node = parseComparison(c);
  for (;;) {
    skipSpace(c);
    if (!startsWith(c, "∧")) return node;
    c.pos += 1;
    node = and(node, parseComparison(c));
  }
}

/** Parse a bare predicate such as `type = 'Suite' ∧ price > 150`. */
export function parseCondition(source: string): Condition {
  const c: Cursor = { text: normalise(source), pos: 0 };
  let node = parseConjunction(c);
  for (;;) {
    skipSpace(c);
    if (!startsWith(c, "∨")) break;
    c.pos += 1;
    node = or(node, parseConjunction(c));
  }
  skipSpace(c);
  if (c.pos < c.text.length) {
    throw new ParseError(
      `Could not read "${c.text.slice(c.pos).trim()}" as part of this condition.`,
      c.pos
    );
  }
  return node;
}

// ── Expressions ───────────────────────────────────────────────────────────

function parseTerm(c: Cursor): RAExpr {
  skipSpace(c);

  if (peek(c) === "(") {
    const inner = readBracketed(c, "(", ")");
    return parseExpressionText(inner);
  }

  if (peek(c) === "σ") {
    c.pos += 1;
    const subscript = readUnarySubscript(c);
    if (!subscript) {
      throw new ParseError("σ needs a condition, for example σ price > 50 (Room).", c.pos);
    }
    // A braced subscript can be followed by a space before the operand.
    skipSpace(c);
    const inner = readBracketed(c, "(", ")");
    return { kind: "select", condition: parseCondition(subscript), input: parseExpressionText(inner) };
  }

  if (peek(c) === "Π") {
    c.pos += 1;
    const subscript = readUnarySubscript(c);
    if (!subscript) {
      throw new ParseError(
        "Π needs an attribute list, for example Π city (Branch).",
        c.pos
      );
    }
    skipSpace(c);
    const inner = readBracketed(c, "(", ")");
    return {
      kind: "project",
      attributes: subscript
        .split(",")
        .map((part) => part.trim())
        .filter(Boolean),
      input: parseExpressionText(inner)
    };
  }

  const identifier = readIdentifier(c);
  if (identifier === null) {
    const rest = c.text.slice(c.pos).trim();
    throw new ParseError(
      rest
        ? `Expected a relation name or an operator, but found "${rest.slice(0, 20)}".`
        : "This expression is incomplete.",
      c.pos
    );
  }
  return { kind: "relation", name: identifier };
}

function binaryNode(
  glyph: string,
  left: RAExpr,
  right: RAExpr,
  condition: Condition | null
): RAExpr {
  switch (glyph) {
    case "X":
      return { kind: "product", left, right };
    case "⋈":
      return condition
        ? { kind: "join", condition, left, right }
        : { kind: "naturalJoin", left, right };
    case "⟕":
      return { kind: "outerJoin", side: "left", condition: condition ?? undefined, left, right };
    case "⟖":
      return { kind: "outerJoin", side: "right", condition: condition ?? undefined, left, right };
    case "⟗":
      return { kind: "outerJoin", side: "full", condition: condition ?? undefined, left, right };
    case "▷":
      return { kind: "semijoin", condition: condition ?? undefined, left, right };
    case "◁":
      // Right semijoin: the mirror image, expressed with the operands swapped.
      return { kind: "semijoin", condition: condition ?? undefined, left: right, right: left };
    case "÷":
      return { kind: "divide", left, right };
    case "∪":
      return { kind: "union", left, right };
    case "∩":
      return { kind: "intersect", left, right };
    default:
      return { kind: "difference", left, right };
  }
}

function parseExpressionText(source: string): RAExpr {
  const c: Cursor = { text: source, pos: 0 };
  let node = parseTerm(c);

  for (;;) {
    skipSpace(c);
    if (c.pos >= c.text.length) break;

    const glyph = BINARY_GLYPHS.find((candidate) => startsWith(c, candidate));
    if (!glyph) {
      throw new ParseError(
        `Expected an operator between these two relations, but found "${c.text
          .slice(c.pos)
          .trim()
          .slice(0, 20)}".`,
        c.pos
      );
    }
    c.pos += glyph.length;

    const subscript = readBinarySubscript(c);
    const right = parseTerm(c);
    node = binaryNode(
      glyph === "-" ? "−" : glyph,
      node,
      right,
      subscript ? parseCondition(subscript) : null
    );
  }

  return node;
}

/** Parse a full expression. Throws {@link ParseError} with a position. */
export function parseExpression(source: string): RAExpr {
  const text = normalise(source).trim();
  if (!text) throw new ParseError("Write an expression to check.", 0);
  return parseExpressionText(text);
}

/** Non-throwing variant for live editor feedback. */
export function tryParseExpression(
  source: string
): { ok: true; expr: RAExpr } | { ok: false; message: string; position: number } {
  try {
    return { ok: true, expr: parseExpression(source) };
  } catch (error) {
    if (error instanceof ParseError) {
      return { ok: false, message: error.message, position: error.position };
    }
    return {
      ok: false,
      message: error instanceof Error ? error.message : "That expression could not be read.",
      position: 0
    };
  }
}
