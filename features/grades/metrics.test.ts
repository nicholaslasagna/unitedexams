import { describe, expect, it } from "vitest";
import {
  computeCourseWeightedAverage,
  computeOverallAverageFromCourseSummaries,
  computeSectionWeightedAverage,
  normalizeSectionGradePolicy,
  summarizeCoursePolicies
} from "./metrics";

describe("normalizeSectionGradePolicy", () => {
  it("falls back to the default 40/60 split", () => {
    expect(normalizeSectionGradePolicy()).toEqual({
      assignmentWeight: 40,
      examWeight: 60
    });
  });

  it("normalizes arbitrary totals back to 100", () => {
    expect(normalizeSectionGradePolicy({ assignmentWeight: 20, examWeight: 20 })).toEqual({
      assignmentWeight: 50,
      examWeight: 50
    });
  });
});

describe("computeSectionWeightedAverage", () => {
  it("uses only assignment scores when no exams are graded yet", () => {
    expect(
      computeSectionWeightedAverage([
        { kind: "assignment", score: 90 },
        { kind: "assignment", score: 70 },
        { kind: "exam", score: null }
      ])
    ).toBe(80);
  });

  it("applies the section policy across assignments and exams", () => {
    expect(
      computeSectionWeightedAverage(
        [
          { kind: "assignment", score: 100 },
          { kind: "assignment", score: 80 },
          { kind: "exam", score: 70 }
        ],
        { assignmentWeight: 40, examWeight: 60 }
      )
    ).toBe(78);
  });
});

describe("computeCourseWeightedAverage", () => {
  it("handles mixed section policies by weighting section averages by graded item count", () => {
    expect(
      computeCourseWeightedAverage(
        [
          { sectionId: "s1", kind: "assignment", score: 100 },
          { sectionId: "s1", kind: "exam", score: 50 },
          { sectionId: "s2", kind: "assignment", score: 90 },
          { sectionId: "s2", kind: "exam", score: 90 },
          { sectionId: "s2", kind: "exam", score: 80 }
        ],
        {
          s1: { assignmentWeight: 40, examWeight: 60 },
          s2: { assignmentWeight: 70, examWeight: 30 }
        }
      )
    ).toBe(81.1);
  });
});

describe("summarizeCoursePolicies", () => {
  it("labels mixed policies clearly", () => {
    expect(
      summarizeCoursePolicies([
        { assignmentWeight: 40, examWeight: 60 },
        { assignmentWeight: 70, examWeight: 30 }
      ])
    ).toEqual({
      policyLabel: "Section-weighted grading",
      hasMixedPolicies: true
    });
  });
});

describe("computeOverallAverageFromCourseSummaries", () => {
  it("weights overall average by graded item count", () => {
    expect(
      computeOverallAverageFromCourseSummaries([
        { average: 90, gradedCount: 2 },
        { average: 70, gradedCount: 6 },
        { average: null, gradedCount: 0 }
      ])
    ).toBe(75);
  });
});
