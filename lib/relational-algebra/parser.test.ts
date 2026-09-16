import { describe, expect, it } from "vitest";
import { courseDatabase } from "@/data/seed/db-exam1/relations";
import { evaluate } from "./ast";
import { checkEquivalence, gradeExpressionText, structuralDiff } from "./equivalence";
import { toText, tokenize } from "./notation";
import { ParseError, parseCondition, parseExpression, tryParseExpression } from "./parser";

const db = courseDatabase;
const rowsOf = (expr: string) => evaluate(parseExpression(expr), db).relation;

describe("parsing", () => {
  it("reads the professor's own notation", () => {
    // Homework #1 Q2(a), written the way the assignment writes it.
    const expr = parseExpression("Hotel ▷_{Hotel.hotelNo = Room.hotelNo} (σ_{price > 50}(Room))");
    expect(expr.kind).toBe("semijoin");
    expect(rowsOf("Hotel ▷_{Hotel.hotelNo = Room.hotelNo} (σ_{price > 50}(Room))").tuples).toHaveLength(3);
  });

  it("accepts the subscript without braces, as the slides print it", () => {
    const a = rowsOf("σ price > 50 (Room)");
    const b = rowsOf("σ_{price > 50}(Room)");
    expect(a.tuples).toEqual(b.tuples);
  });

  it("treats π and Π as the same operator", () => {
    expect(toText(parseExpression("π_{city}(Branch)"))).toBe(toText(parseExpression("Π_{city}(Branch)")));
  });

  it("treats ⋉ and ▷ as the same operator", () => {
    const a = parseExpression("R ⋉_{R.j = S.j} S");
    const b = parseExpression("R ▷_{R.j = S.j} S");
    expect(a.kind).toBe("semijoin");
    expect(toText(a)).toBe(toText(b));
  });

  it("accepts X, × and * for the Cartesian product", () => {
    for (const glyph of ["X", "×", "*"]) {
      expect(parseExpression(`R ${glyph} S`).kind).toBe("product");
    }
  });

  it("accepts written-out operator names", () => {
    expect(parseExpression("Hotel natural join Room").kind).toBe("naturalJoin");
    expect(parseExpression("R left outer join S").kind).toBe("outerJoin");
    expect(parseExpression("project_{city}(Branch)").kind).toBe("project");
    expect(parseExpression("Π_{city}(Branch) minus Π_{city}(PropertyForRent)").kind).toBe(
      "difference"
    );
  });

  it("accepts ASCII comparison operators and curly quotes", () => {
    const a = rowsOf("σ_{price >= 80}(Room)");
    const b = rowsOf("σ_{price ≥ 80}(Room)");
    expect(a.tuples).toEqual(b.tuples);
    expect(rowsOf("σ_{type = ‘Suite’}(Room)").tuples).toHaveLength(3);
  });

  it("parses ∧ and ∨ inside a condition", () => {
    expect(rowsOf("σ_{type = 'Suite' ∧ price > 150}(Room)").tuples).toHaveLength(2);
    expect(rowsOf("σ_{j = 'J1' ∨ j = 'J2'}(S)").tuples).toHaveLength(4);
    expect(rowsOf("σ_{type = 'Suite' and price > 150}(Room)").tuples).toHaveLength(2);
  });

  it("nests expressions to any depth", () => {
    const expr =
      "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = 'Suite' ∧ price > 150}(Room)))";
    const result = rowsOf(expr);
    expect(result.attributes).toEqual(["hotelName"]);
    expect(result.tuples.map((t) => t[0]).sort()).toEqual(["Grosvenor", "Parkview"]);
  });

  it("round-trips through toText", () => {
    const original =
      "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{price > 150}(Room)))";
    const once = toText(parseExpression(original));
    const twice = toText(parseExpression(once));
    expect(twice).toBe(once);
  });

  it("never emits a raw LaTeX macro in its tokens", () => {
    const tokens = tokenize(parseExpression("R ⟕_{R.j = S.j} S"));
    const text = tokens.map((token) => token.text).join("");
    expect(text).not.toMatch(/\\[a-zA-Z]/);
    expect(text).toContain("⟕");
  });
});

describe("parse errors are teachable", () => {
  it("names the unclosed bracket", () => {
    const result = tryParseExpression("Π_{city}(Branch");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/never closed/i);
  });

  it("explains a missing operator between two relations", () => {
    const result = tryParseExpression("Hotel Room");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.message).toMatch(/operator/i);
  });

  it("explains a condition with no comparison", () => {
    expect(() => parseCondition("price")).toThrow(ParseError);
  });

  it("reports a position so the editor can point at the problem", () => {
    const result = tryParseExpression("σ_{price > 50}(Room) ⋈_{a = b} @@@");
    expect(result.ok).toBe(false);
    if (!result.ok) expect(result.position).toBeGreaterThan(0);
  });
});

describe("equivalence grading", () => {
  const reference = parseExpression(
    "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = 'Suite' ∧ price > 150}(Room)))"
  );

  it("accepts the same query with the operands the other way round", () => {
    const verdict = gradeExpressionText(
      "Π_{hotelName}((σ_{type = 'Suite' ∧ price > 150}(Room)) ⋈_{Room.hotelNo = Hotel.hotelNo} Hotel)",
      reference,
      db
    );
    expect(verdict.status).toBe("equivalent");
  });

  it("accepts a selection pushed outside the join", () => {
    const verdict = gradeExpressionText(
      "Π_{hotelName}(σ_{type = 'Suite' ∧ price > 150}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} Room))",
      reference,
      db
    );
    expect(verdict.status).toBe("equivalent");
  });

  it("accepts the join written out as a selection over a Cartesian product", () => {
    // R ⋈_F S = σ_F(R X S) — the identity from Lecture 4.
    const verdict = gradeExpressionText(
      "Π_{hotelName}(σ_{Hotel.hotelNo = Room.hotelNo ∧ type = 'Suite' ∧ price > 150}(Hotel X Room))",
      reference,
      db
    );
    expect(verdict.status).toBe("equivalent");
  });

  it("rejects a dropped condition", () => {
    const verdict = gradeExpressionText(
      "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = 'Suite'}(Room)))",
      reference,
      db
    );
    expect(verdict.status).toBe("different");
  });

  it("rejects the wrong projection", () => {
    const verdict = gradeExpressionText(
      "Π_{city}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = 'Suite' ∧ price > 150}(Room)))",
      reference,
      db
    );
    expect(verdict.status).toBe("different");
    if (verdict.status === "different") expect(verdict.reason).toMatch(/hotelName/);
  });

  it("catches an answer that is only right for this particular data", () => {
    // > 150 and ≥ 151 agree on integer prices here; the numeric witness
    // shifts every price by one and separates them from ≥ 150.
    const looseReference = parseExpression("σ_{price ≥ 175}(Room)");
    const verdict = gradeExpressionText("σ_{price > 170}(Room)", looseReference, db);
    expect(verdict.status).toBe("different");
  });

  it("reports an unknown attribute rather than marking it plainly wrong", () => {
    // `city` lives in Branch, not Staff — the mistake the course warns about.
    const staffReference = parseExpression("Π_{lName}(Staff)");
    const verdict = gradeExpressionText("Π_{city}(Staff)", staffReference, db);
    expect(verdict.status).toBe("error");
    if (verdict.status === "error") expect(verdict.reason).toMatch(/no attribute named city/i);
  });

  it("reports a broken reference answer as a content error, not a wrong learner", () => {
    const broken = parseExpression("Π_{nope}(Staff)");
    const verdict = checkEquivalence(parseExpression("Staff"), broken, db);
    expect(verdict.status).toBe("error");
    if (verdict.status === "error") expect(verdict.reason).toMatch(/reference answer/i);
  });
});

describe("structural diff feeds the mistake classifier", () => {
  it("notices a missing join", () => {
    const reference = parseExpression(
      "Π_{city}(Staff ⋈_{Staff.branchNo = Branch.branchNo} Branch)"
    );
    const submitted = parseExpression("Π_{branchNo}(Staff)");
    const diff = structuralDiff(submitted, reference);
    expect(diff.missingJoin).toBe(true);
    expect(diff.missingRelations).toContain("Branch");
  });

  it("notices a missing projection", () => {
    const reference = parseExpression("Π_{lName}(Staff)");
    const submitted = parseExpression("σ_{salary > 1}(Staff)");
    expect(structuralDiff(submitted, reference).projectionMismatch).toBe(true);
  });
});
