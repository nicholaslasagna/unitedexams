import { describe, expect, it } from "vitest";
import type { LabQuestion } from "@/features/db-exam1/question-model";
import { tokenize } from "@/lib/relational-algebra/notation";
import { tryParseExpression } from "@/lib/relational-algebra/parser";
import { SOURCE_QUESTIONS } from "./source-questions";
import { STUDY_GUIDE_QUESTIONS } from "./study-guide-questions";

/**
 * Algebra belongs in the notation renderer, not in the prompt text.
 *
 * A question's `prompt` is rendered as plain text, so an operator written
 * there either has to be spelled out in English — "Album RIGHT OUTER JOIN
 * RecordLabel on ..." — or, worse, carries `_{...}` subscript syntax that
 * renders literally. `context.expression` goes through RAExpression, which
 * draws real glyphs and real <sub> elements.
 *
 * These guard both halves: every expression shown is genuinely parseable,
 * and no prompt quietly goes back to spelling operators out.
 */

const ALL: LabQuestion[] = [...SOURCE_QUESTIONS, ...STUDY_GUIDE_QUESTIONS];

describe("expressions shown to the learner", () => {
  const withExpression = ALL.filter((q) => q.context?.expression);

  it("exist", () => {
    expect(withExpression.length).toBeGreaterThan(0);
  });

  withExpression.forEach((question) => {
    it(`${question.id} parses, and renders without leaking brace syntax`, () => {
      const source = question.context!.expression!;
      const parsed = tryParseExpression(source);
      expect(
        parsed.ok,
        `${question.id}: ${source}${parsed.ok ? "" : ` — ${parsed.message}`}`
      ).toBe(true);
      if (!parsed.ok) return;

      // What RAExpression will actually draw. `_{` or a stray `}` here means
      // the learner sees subscript syntax instead of a subscript.
      const rendered = tokenize(parsed.expr)
        .map((token) => token.text)
        .join("");
      expect(rendered, `${question.id} leaks subscript syntax`).not.toContain("_{");
      expect(rendered, `${question.id} leaks subscript syntax`).not.toContain("}");
    });
  });
});

describe("prompts", () => {
  it("do not write operators as SQL between two relation names", () => {
    // The six Album/RecordLabel tasks used to read "Perform Album RIGHT OUTER
    // JOIN RecordLabel on Album.labelCode = RecordLabel.labelCode", which is
    // SQL dressed as algebra on a course that examines the glyphs.
    //
    // Case-sensitive on purpose: naming the operator in prose is fine and
    // reads well ("Select every tuple in this right outer join"). Shouting it
    // between two relations is the thing that replaced a glyph with a keyword.
    const asSql = /(LEFT|RIGHT|FULL)\s+OUTER\s+JOIN|SEMIJOIN|NATURAL\s+JOIN|CARTESIAN\s+PRODUCT/;
    const offenders = ALL.filter((q) => asSql.test(q.prompt)).map((q) => q.id);
    expect(offenders, "operator written as a SQL keyword in prompt text").toEqual([]);
  });

  it("never carry raw subscript syntax, which prompts render literally", () => {
    const offenders = ALL.filter((q) => q.prompt.includes("_{")).map((q) => q.id);
    expect(offenders, "prompt would show _{...} as literal text").toEqual([]);
  });
});
