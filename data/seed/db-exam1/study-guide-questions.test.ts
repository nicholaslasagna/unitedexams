import { describe, expect, it } from "vitest";
import { evaluate } from "@/lib/relational-algebra/ast";
import { parseExpression } from "@/lib/relational-algebra/parser";
import { gradeQuestion } from "@/features/db-exam1/question-model";
import { courseDatabase, HOTEL_TODAY } from "./relations";
import { STUDY_GUIDE_QUESTIONS } from "./study-guide-questions";

/**
 * The photographed study guide is the specification here, so the answers are
 * checked against what the sheets ask for rather than against themselves.
 */

const byId = (id: string) => {
  const question = STUDY_GUIDE_QUESTIONS.find((entry) => entry.id === id);
  if (!question) throw new Error(`missing question ${id}`);
  return question;
};

const correctRows = (id: string) => {
  const question = byId(id);
  if (question.kind !== "rows") throw new Error(`${id} is not a rows question`);
  return question.candidates.filter((candidate) => candidate.inResult);
};

const run = (text: string) => evaluate(parseExpression(text), courseDatabase).relation;

describe("Album / RecordLabel join exercise", () => {
  // L1 matches A1 and A2; L2 matches A3. A4 (L9) is left-only; L3 and L4 are
  // right-only. Every count below follows from that.
  const expected: Record<string, { rows: number; degree: number }> = {
    "sg-music-1": { rows: 3, degree: 8 }, // equijoin
    "sg-music-2": { rows: 3, degree: 7 }, // natural join collapses labelCode
    "sg-music-3": { rows: 4, degree: 8 }, // + A4
    "sg-music-4": { rows: 5, degree: 8 }, // + RedStone, Moonlight
    "sg-music-5": { rows: 6, degree: 8 }, // + all three unmatched
    "sg-music-6": { rows: 3, degree: 4 }, // semijoin: Album's attributes only
    "sg-music-7": { rows: 2, degree: 8 } // theta join on the sales target
  };

  it.each(Object.entries(expected))("%s has the right shape", (id, shape) => {
    const question = byId(id);
    if (question.kind !== "rows") throw new Error("expected a rows question");
    expect(correctRows(id)).toHaveLength(shape.rows);
    expect(question.attributes).toHaveLength(shape.degree);
  });

  it("answers the theta join with the albums that meet their target", () => {
    // Sunrise 60,000 ≥ BlueWave 50,000 ✓; Horizon 80,000 ≥ NorthStar 70,000 ✓;
    // Echoes 35,000 < 50,000 ✗; Drift has no label at all.
    const titles = correctRows("sg-music-7").map((candidate) => String(candidate.values[1])).sort();
    expect(titles).toEqual(["Horizon", "Sunrise"]);
  });

  it("keeps the semijoin to Album's own attributes", () => {
    const question = byId("sg-music-6");
    if (question.kind !== "rows") throw new Error("expected a rows question");
    expect(question.attributes).toEqual(["albumID", "title", "labelCode", "sales"]);
    correctRows("sg-music-6").forEach((candidate) => {
      expect(String(candidate.values[0])).toMatch(/^A\d$/);
    });
  });

  it("preserves the correct side in each outer join", () => {
    const left = correctRows("sg-music-3").map((c) => String(c.values[0]));
    const right = correctRows("sg-music-4").map((c) => String(c.values[0]));
    expect(left).toContain("A4"); // left outer keeps the unmatched album
    expect(right).not.toContain("A4"); // right outer does not
    expect(right.filter((value) => value === "null")).toHaveLength(2);
  });

  it("marks a fully correct selection correct for every task", () => {
    Object.keys(expected).forEach((id) => {
      const question = byId(id);
      if (question.kind !== "rows") return;
      const selected = question.candidates
        .map((candidate, index) => (candidate.inResult ? index : -1))
        .filter((index) => index >= 0);
      expect(gradeQuestion(question, { kind: "rows", selected }).correct, id).toBe(true);
    });
  });
});

describe("Class Practice Activity", () => {
  it("every written answer parses, returns tuples and is graded correct", () => {
    STUDY_GUIDE_QUESTIONS.filter((question) => question.kind === "expression").forEach(
      (question) => {
        if (question.kind !== "expression") return;
        const result = run(question.referenceText);
        expect(result.tuples.length, `${question.id} returns nothing`).toBeGreaterThan(0);
        const verdict = gradeQuestion(question, {
          kind: "expression",
          text: question.referenceText
        });
        expect(verdict.correct, `${question.id}: ${verdict.feedback}`).toBe(true);
      }
    );
  });

  it("3(b) finds the cheap single room the sheet asks for", () => {
    const result = run("σ_{type = 'Single' ∧ price < 20}(Room)");
    expect(result.tuples).toHaveLength(1);
    expect(result.tuples[0][0]).toBe("R7");
  });

  it("3(d) returns both Grosvenor rooms", () => {
    const question = byId("sg-cpa-3d");
    if (question.kind !== "expression") throw new Error("expected an expression question");
    const result = run(question.referenceText);
    expect(result.attributes).toEqual(["price", "type"]);
    expect(result.tuples).toHaveLength(2);
  });

  it("3(f) needs an outer join — the empty room must survive with a NULL guest", () => {
    const question = byId("sg-cpa-3f");
    if (question.kind !== "expression") throw new Error("expected an expression question");
    const result = run(question.referenceText);

    // The Grosvenor has two rooms: one occupied today, one not.
    expect(result.tuples).toHaveLength(2);
    const withGuest = result.tuples.filter((tuple) => tuple[3] !== null);
    const withoutGuest = result.tuples.filter((tuple) => tuple[3] === null);
    expect(withGuest).toHaveLength(1);
    expect(withoutGuest).toHaveLength(1);
    expect(String(withGuest[0][3])).toBe("Ivy Chen");
  });

  it("3(f) with an ordinary join would lose the empty room", () => {
    // This is the whole point of the question, so it is worth asserting: the
    // inner-join version silently drops exactly the row the sheet asks for.
    const inner = run(
      `Π_{Room.roomNo, type, price, guestName}((σ_{hotelNo = 'H01'}(Room)) ` +
        `⋈_{Room.roomNo = Booking.roomNo} ` +
        `(Π_{roomNo, guestName}((σ_{hotelNo = 'H01' ∧ dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking)) ` +
        `⋈_{Booking.guestNo = Guest.guestNo} Guest)))`
    );
    expect(inner.tuples).toHaveLength(1);
  });

  it("3(e) and 3(g) differ only in the projection", () => {
    const e = byId("sg-cpa-3e");
    const g = byId("sg-cpa-3g");
    if (e.kind !== "expression" || g.kind !== "expression") throw new Error("expected expressions");
    const resultE = run(e.referenceText);
    const resultG = run(g.referenceText);
    expect(resultE.attributes).toEqual(["guestName"]);
    expect(resultG.attributes).toHaveLength(3);
    expect(resultE.tuples).toHaveLength(resultG.tuples.length);
    expect(String(resultE.tuples[0][0])).toBe("Ivy Chen");
  });

  it("2(f) division picks the guest who booked every London hotel", () => {
    const result = run(
      "Π_{guestName, hotelNo}(Booking ⋈_{Booking.guestNo = Guest.guestNo} Guest) ÷ Π_{hotelNo}(σ_{city = 'London'}(Hotel))"
    );
    expect(result.attributes).toEqual(["guestName"]);
    // London has two hotels — the Grosvenor and Parkview. Only Ivy Chen has
    // booked at both.
    expect(result.tuples.map((tuple) => String(tuple[0]))).toEqual(["Ivy Chen"]);
  });

  it("2(a) shows projection eliminating duplicates", () => {
    const result = run("Π_{hotelNo}(σ_{price > 50}(Room))");
    // H01 has two rooms over 50 in principle but only one qualifies; the point
    // is that a hotel never appears twice.
    expect(new Set(result.tuples.map((t) => String(t[0]))).size).toBe(result.tuples.length);
  });

  it("labels every study-guide question as study-guide material with a citation", () => {
    STUDY_GUIDE_QUESTIONS.forEach((question) => {
      expect(question.source).toBe("study-guide");
      expect(question.sourceNote, question.id).toBeTruthy();
      expect(question.explanation.length, question.id).toBeGreaterThan(40);
    });
  });

  it("explains every wrong option", () => {
    STUDY_GUIDE_QUESTIONS.filter((question) => question.kind === "choice").forEach((question) => {
      if (question.kind !== "choice") return;
      expect(question.options.some((option) => option.correct), question.id).toBe(true);
      question.options
        .filter((option) => !option.correct)
        .forEach((option) => {
          expect(option.note ?? option.mistake, `${question.id}: "${option.text}"`).toBeTruthy();
        });
    });
  });
});
