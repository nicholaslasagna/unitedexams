import { describe, expect, it } from "vitest";
import {
  branchRelation,
  relationR,
  relationS,
  roomRelation,
  hotelRelation,
  staffRelation
} from "@/data/seed/db-exam1/relations";
import { and, attr, compare, lit, or } from "./condition";
import {
  difference,
  divide,
  intersect,
  naturalJoin,
  outerJoin,
  product,
  productShape,
  project,
  select,
  semijoin,
  thetaJoin,
  union,
  OperationError
} from "./operations";
import { cardinality, degree, relationsEqual, type Relation } from "./relation";

/**
 * The homework is the specification.
 *
 * Question 1 of Homework #1 asks for the equijoin, natural join, all three
 * outer joins, the semijoin and a division over R and S. Those answers were
 * computed by hand for the assignment, so they are the fixture: if the
 * evaluator disagrees with them, the evaluator is wrong.
 */

const jEquals = compare(attr("R.j"), "=", attr("S.j"));

/** Row contents as plain strings, order-independent, for readable assertions. */
function rows(relation: Relation): string[] {
  return relation.tuples.map((tuple) => tuple.map((v) => (v === null ? "NULL" : String(v))).join("|")).sort();
}

describe("Homework #1 Question 1 — R and S", () => {
  it("has the shape the question asks for", () => {
    // "at least two matching j values, at least one left-only, one right-only"
    expect(degree(relationR)).toBe(4);
    expect(cardinality(relationR)).toBe(6);
    expect(degree(relationS)).toBe(4);
    expect(cardinality(relationS)).toBe(6);

    const rJ = new Set(relationR.tuples.map((t) => t[1]));
    const sJ = new Set(relationS.tuples.map((t) => t[1]));
    const matching = [...rJ].filter((j) => sJ.has(j));
    expect(matching.length).toBeGreaterThanOrEqual(2);
    expect([...rJ].filter((j) => !sJ.has(j))).toEqual(["J7"]);
    expect([...sJ].filter((j) => !rJ.has(j))).toEqual(["J9"]);
  });

  it("(a) equijoin keeps both copies of the joining attribute", () => {
    const { relation } = thetaJoin(relationR, relationS, jEquals);
    // Only the colliding name is qualified — the convention in the Lecture 4
    // slide and in the homework's own printed table.
    expect(relation.attributes).toEqual(["r_id", "R.j", "r2", "r3", "s_id", "S.j", "s2", "s3"]);
    expect(degree(relation)).toBe(8);
    expect(cardinality(relation)).toBe(8);
    expect(rows(relation)).toEqual(
      [
        "R101|J1|A|15|S201|J1|Red|15",
        "R101|J1|A|15|S205|J1|Yellow|61",
        "R102|J2|A|30|S202|J2|Purple|30",
        "R102|J2|A|30|S206|J2|Black|96",
        "R103|J1|C|35|S201|J1|Red|15",
        "R103|J1|C|35|S205|J1|Yellow|61",
        "R104|J3|D|42|S203|J3|Green|35",
        "R106|J3|F|96|S203|J3|Green|35"
      ].sort()
    );
  });

  it("(b) natural join collapses the duplicate joining attribute", () => {
    const { relation, commonAttributes } = naturalJoin(relationR, relationS);
    expect(commonAttributes).toEqual(["j"]);
    expect(relation.attributes).toEqual(["r_id", "j", "r2", "r3", "s_id", "s2", "s3"]);
    // Same rows as the equijoin, one column narrower. This is the whole
    // difference between the two operators.
    expect(degree(relation)).toBe(7);
    expect(cardinality(relation)).toBe(8);
  });

  it("(c) left outer join preserves the left-only tuple and pads with NULL", () => {
    const { relation } = outerJoin(relationR, relationS, "left", jEquals);
    expect(cardinality(relation)).toBe(9);
    expect(rows(relation)).toContain("R105|J7|E|61|NULL|NULL|NULL|NULL");
  });

  it("(d) right outer join preserves the right-only tuple", () => {
    const { relation } = outerJoin(relationR, relationS, "right", jEquals);
    expect(cardinality(relation)).toBe(9);
    expect(rows(relation)).toContain("NULL|NULL|NULL|NULL|S204|J9|Blue|42");
    // R105 is *not* preserved by a right outer join.
    expect(rows(relation).some((row) => row.startsWith("R105"))).toBe(false);
  });

  it("(e) full outer join preserves both", () => {
    const { relation } = outerJoin(relationR, relationS, "full", jEquals);
    expect(cardinality(relation)).toBe(10);
    expect(rows(relation)).toContain("R105|J7|E|61|NULL|NULL|NULL|NULL");
    expect(rows(relation)).toContain("NULL|NULL|NULL|NULL|S204|J9|Blue|42");
  });

  it("(f) semijoin returns R's attributes only, never S's", () => {
    const { relation } = semijoin(relationR, relationS, jEquals);
    expect(relation.attributes).toEqual(["r_id", "j", "r2", "r3"]);
    expect(degree(relation)).toBe(4);
    // Five of R's six tuples have a match; R105 (J7) does not.
    expect(cardinality(relation)).toBe(5);
    expect(rows(relation)).toEqual(
      [
        "R101|J1|A|15",
        "R102|J2|A|30",
        "R103|J1|C|35",
        "R104|J3|D|42",
        "R106|J3|F|96"
      ].sort()
    );
  });

  it("semijoin is directional — S ▷ R is a different relation", () => {
    const { relation } = semijoin(relationS, relationR, jEquals);
    expect(relation.attributes).toEqual(["s_id", "j", "s2", "s3"]);
    // S204 (J9) has no match in R; the other five do.
    expect(cardinality(relation)).toBe(5);
    expect(rows(relation).some((row) => row.startsWith("S204"))).toBe(false);
  });

  it("(g) division answers a FOR ALL question", () => {
    // Π_{r2,j}(R) ÷ Π_j(σ_{j='J1' ∨ j='J2'}(S))
    const dividend = project(relationR, ["r2", "j"]).relation;
    const divisor = project(
      select(relationS, or(compare(attr("j"), "=", lit("J1")), compare(attr("j"), "=", lit("J2"))))
        .relation,
      ["j"]
    ).relation;

    expect(rows(divisor)).toEqual(["J1", "J2"]);

    const { relation, trace } = divide(dividend, divisor);
    expect(relation.attributes).toEqual(["r2"]);
    expect(rows(relation)).toEqual(["A"]);

    // The coverage grid is what the Division Lab renders: A is ticked in
    // both columns, C only in the first.
    const aIndex = trace.candidates.findIndex((tuple) => tuple[0] === "A");
    const cIndex = trace.candidates.findIndex((tuple) => tuple[0] === "C");
    expect(trace.coverageByCandidate[aIndex]).toEqual([true, true]);
    expect(trace.coverageByCandidate[cIndex]).toEqual([true, false]);
  });
});

describe("selection and projection", () => {
  it("selection slices horizontally and leaves the degree alone", () => {
    // Lecture 3: "List all staff with a salary greater than £10,000."
    const { relation, trace } = select(staffRelation, compare(attr("salary"), ">", lit(10000)));
    expect(degree(relation)).toBe(degree(staffRelation));
    expect(cardinality(relation)).toBe(4);
    expect(trace.kept).toHaveLength(4);
    expect(trace.removed).toHaveLength(2);
  });

  it("projection eliminates duplicates", () => {
    // Π_city(Branch) — London appears twice in the data, once in the result.
    const { relation, trace } = project(branchRelation, ["city"]);
    expect(degree(relation)).toBe(1);
    expect(cardinality(relation)).toBe(4);
    expect(rows(relation)).toEqual(["Aberdeen", "Bristol", "Glasgow", "London"]);
    expect(trace.duplicatesRemoved).toHaveLength(1);
  });

  it("projection without duplicates removes nothing", () => {
    const { trace } = project(staffRelation, ["staffNo", "fName", "lName", "salary"]);
    expect(trace.duplicatesRemoved).toHaveLength(0);
  });

  it("rejects an attribute the relation does not have", () => {
    // The "city lives in Branch, not Staff" mistake, caught at evaluation.
    expect(() => project(staffRelation, ["city"])).toThrow(OperationError);
  });
});

describe("Cartesian product", () => {
  it("multiplies cardinality and adds degree", () => {
    const { relation } = product(relationR, relationS);
    expect(cardinality(relation)).toBe(36);
    expect(degree(relation)).toBe(8);
    expect(productShape(relationR, relationS)).toEqual({ degree: 8, cardinality: 36 });
  });

  it("is what a theta join filters — R ⋈_F S = σ_F(R X S)", () => {
    const viaJoin = thetaJoin(relationR, relationS, jEquals).relation;
    const viaProduct = select(product(relationR, relationS).relation, jEquals).relation;
    expect(rows(viaJoin)).toEqual(rows(viaProduct));
    expect(viaJoin.attributes).toEqual(viaProduct.attributes);
  });
});

describe("joins on the hotel database", () => {
  it("semijoin keeps hotels with at least one room over 50", () => {
    // Homework #1 Q2(a): Hotel ▷_{Hotel.hotelNo = Room.hotelNo} (σ_price>50(Room))
    const expensive = select(roomRelation, compare(attr("price"), ">", lit(50))).relation;
    const { relation } = semijoin(
      hotelRelation,
      expensive,
      compare(attr("Hotel.hotelNo"), "=", attr("Room.hotelNo"))
    );
    expect(relation.attributes).toEqual(["hotelNo", "hotelName", "city"]);
    // H03 only has a £40 single, so it drops out.
    expect(rows(relation)).toEqual([
      "H01|Grosvenor|London",
      "H02|Kingsway|Glasgow",
      "H04|Parkview|London"
    ].sort());
  });

  it("an unmatched-on-both-sides join produces an empty relation but keeps its schema", () => {
    const noMatch = compare(attr("Hotel.hotelNo"), "=", lit("ZZZ"));
    const { relation } = thetaJoin(hotelRelation, roomRelation, noMatch);
    expect(cardinality(relation)).toBe(0);
    expect(degree(relation)).toBe(7);
  });

  it("natural join with no common attribute degenerates to a product", () => {
    const left: Relation = { name: "L", attributes: ["a"], tuples: [["x"], ["y"]] };
    const right: Relation = { name: "Rt", attributes: ["b"], tuples: [["1"], ["2"]] };
    const { relation, commonAttributes } = naturalJoin(left, right);
    expect(commonAttributes).toEqual([]);
    expect(cardinality(relation)).toBe(4);
  });
});

describe("NULL semantics", () => {
  it("a comparison against NULL is never true", () => {
    const withNull: Relation = {
      name: "T",
      attributes: ["a", "b"],
      tuples: [["x", 1], ["y", null]]
    };
    expect(cardinality(select(withNull, compare(attr("b"), "=", lit(1))).relation)).toBe(1);
    // Not zero, and not "y" either — NULL is unknown, not a value.
    expect(cardinality(select(withNull, compare(attr("b"), "!=", lit(1))).relation)).toBe(0);
    expect(cardinality(select(withNull, compare(attr("b"), "=", lit(0))).relation)).toBe(0);
  });
});

describe("set operations", () => {
  const cities = (relation: Relation, attribute: string) => project(relation, [attribute]).relation;

  it("union eliminates duplicates", () => {
    const a = cities(branchRelation, "city");
    const b: Relation = { name: "P", attributes: ["city"], tuples: [["London"], ["Aberdeen"]] };
    expect(rows(union(a, b))).toEqual(["Aberdeen", "Bristol", "Glasgow", "London"]);
  });

  it("difference and intersection agree with R ∩ S = R − (R − S)", () => {
    const a = cities(branchRelation, "city");
    const b: Relation = { name: "P", attributes: ["city"], tuples: [["London"], ["Glasgow"]] };
    expect(rows(intersect(a, b))).toEqual(rows(difference(a, difference(a, b))));
  });

  it("refuses relations that are not union-compatible", () => {
    expect(() => union(staffRelation, branchRelation)).toThrow(OperationError);
  });
});

describe("division edge cases", () => {
  const dividend: Relation = {
    name: "D",
    attributes: ["x", "y"],
    tuples: [
      ["A", "1"],
      ["A", "2"],
      ["A", "3"],
      ["B", "1"],
      ["C", "1"],
      ["C", "2"]
    ]
  };

  it("extra pairings never disqualify a value", () => {
    // A is paired with 3 as well as 1 and 2, and still qualifies.
    const divisor: Relation = { name: "V", attributes: ["y"], tuples: [["1"], ["2"]] };
    expect(rows(divide(dividend, divisor).relation)).toEqual(["A", "C"]);
  });

  it("produces an empty quotient when nothing covers the divisor", () => {
    const divisor: Relation = { name: "V", attributes: ["y"], tuples: [["1"], ["2"], ["9"]] };
    expect(cardinality(divide(dividend, divisor).relation)).toBe(0);
  });

  it("rejects a divisor whose attributes are not a subset of the dividend's", () => {
    const divisor: Relation = { name: "V", attributes: ["zzz"], tuples: [["1"]] };
    expect(() => divide(dividend, divisor)).toThrow(OperationError);
  });
});

describe("comparing two relations", () => {
  it("pairs columns by exact name before falling back to the base name", () => {
    // A join over a shared attribute leaves two columns called j. Treating
    // them as interchangeable made these two relations — which differ — look
    // equal, so a wrong answer could grade as correct.
    const left: Relation = {
      name: "X",
      attributes: ["r_id", "R.j", "s_id", "S.j"],
      tuples: [["R1", "J1", "S1", "J2"]]
    };
    const swapped: Relation = {
      name: "Y",
      attributes: ["r_id", "S.j", "s_id", "R.j"],
      tuples: [["R1", "J1", "S1", "J2"]]
    };
    expect(relationsEqual(left, swapped)).toBe(false);
  });

  it("still ignores column order when the columns are unambiguous", () => {
    const a: Relation = { name: "X", attributes: ["a", "b"], tuples: [[1, 2]] };
    const b: Relation = { name: "Y", attributes: ["b", "a"], tuples: [[2, 1]] };
    expect(relationsEqual(a, b)).toBe(true);
  });

  it("still accepts a qualified name against an unqualified one", () => {
    // A learner writing Π city should match a reference writing Π Branch.city.
    const a: Relation = { name: "X", attributes: ["city"], tuples: [["London"]] };
    const b: Relation = { name: "Y", attributes: ["Branch.city"], tuples: [["London"]] };
    expect(relationsEqual(a, b)).toBe(true);
  });

  it("does not let values drift onto the wrong attribute", () => {
    const a: Relation = { name: "X", attributes: ["a", "b"], tuples: [[1, 2]] };
    const b: Relation = { name: "Y", attributes: ["a", "b"], tuples: [[2, 1]] };
    expect(relationsEqual(a, b)).toBe(false);
  });

  it("separates a theta join from the same join with its j columns swapped", () => {
    // R.j < S.j is a predicate where the two columns genuinely differ.
    const lessThan = thetaJoin(relationR, relationS, compare(attr("R.j"), "<", attr("S.j"))).relation;
    const swapped: Relation = {
      ...lessThan,
      attributes: lessThan.attributes.map((name) =>
        name === "R.j" ? "S.j" : name === "S.j" ? "R.j" : name
      )
    };
    expect(lessThan.tuples.length).toBeGreaterThan(0);
    expect(relationsEqual(lessThan, swapped)).toBe(false);
  });
});

describe("conditions", () => {
  it("combines with AND and OR", () => {
    // σ_{type='Suite' ∧ price>150}(Room)
    const suites = select(
      roomRelation,
      and(compare(attr("type"), "=", lit("Suite")), compare(attr("price"), ">", lit(150)))
    ).relation;
    expect(rows(suites)).toEqual(["R2|H01|Suite|175", "R6|H04|Suite|210"].sort());
  });

  it("matches string literals case-insensitively", () => {
    const managers = select(staffRelation, compare(attr("position"), "=", lit("manager"))).relation;
    expect(cardinality(managers)).toBe(2);
  });
});
