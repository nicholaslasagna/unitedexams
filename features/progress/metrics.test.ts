import { describe, expect, it } from "vitest";
import { topicBreakdownRows } from "@/features/progress/metrics";
import { scoreBandLabel } from "@/lib/utils";

describe("topicBreakdownRows", () => {
  it("drops tags that span the whole run, since they only restate the total", () => {
    // 6-question run: three set-level tags on every question plus two real topics.
    const rows = topicBreakdownRows(
      {
        "software-engineering": { correct: 1, total: 6 },
        "exam-2": { correct: 1, total: 6 },
        "final-review": { correct: 1, total: 6 },
        multiplicity: { correct: 1, total: 1 },
        "context-model": { correct: 0, total: 2 }
      },
      6
    );
    expect(rows.map((row) => row.label)).toEqual(["multiplicity", "context-model"]);
    expect(rows).toEqual([
      { label: "multiplicity", value: 100 },
      { label: "context-model", value: 0 }
    ]);
  });

  it("keeps whole-run tags rather than rendering an empty chart", () => {
    const rows = topicBreakdownRows({ algebra: { correct: 2, total: 4 } }, 4);
    expect(rows).toEqual([{ label: "algebra", value: 50 }]);
  });

  it("caps the number of rows", () => {
    const wide = Object.fromEntries(
      Array.from({ length: 12 }, (_, i) => [`topic-${i}`, { correct: i % 2, total: 1 }])
    );
    expect(topicBreakdownRows(wide, 12)).toHaveLength(8);
  });

  it("treats a zero-total tag as 0% instead of dividing by zero", () => {
    const rows = topicBreakdownRows({ ghost: { correct: 0, total: 0 } }, 3);
    expect(rows).toEqual([{ label: "ghost", value: 0 }]);
  });
});

describe("scoreBandLabel", () => {
  it("never claims a ranking against other students", () => {
    const labels = [100, 95, 90, 85, 70, 60, 50, 20, 0].map(scoreBandLabel);
    for (const label of labels) {
      expect(label).not.toMatch(/top\s*\d|percentile|%|than (other|most)|rank/i);
    }
  });

  it("describes the score in front of the user", () => {
    expect(scoreBandLabel(100)).toBe("Nearly everything correct");
    expect(scoreBandLabel(85)).toBe("Solid grasp");
    expect(scoreBandLabel(70)).toBe("Mostly there");
    expect(scoreBandLabel(50)).toBe("About half correct");
    expect(scoreBandLabel(0)).toBe("Early days on this set");
  });
});
