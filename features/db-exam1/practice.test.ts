import { describe, expect, it } from "vitest";
import { SOURCE_QUESTIONS } from "@/data/seed/db-exam1/source-questions";
import { gradeQuestion } from "./question-model";
import { buildCramSet, buildMockExam, buildPracticeSet, MOCK_EXAM_LENGTH } from "./practice";
import { TOPIC_IDS } from "./topics";

describe("practice generators stay on-topic", () => {
  it.each(TOPIC_IDS)("%s practice questions are tagged as %s", (topic) => {
    const questions = buildPracticeSet({
      attempts: [],
      topic,
      count: 4,
      seed: 42,
      includeSource: false
    });
    expect(questions.length).toBe(4);
    questions.forEach((question) => {
      expect(question.topic, `${question.id} drifted off ${topic}`).toBe(topic);
    });
  });

  it("prefers unseen professor questions when they exist", () => {
    const questions = buildPracticeSet({
      attempts: [],
      topic: "equijoin",
      count: 3,
      seed: 7,
      includeSource: true
    });
    expect(questions.some((question) => question.source === "professor")).toBe(true);
  });
});

describe("mock exam", () => {
  it("covers the full blueprint without duplicate ids", () => {
    const questions = buildMockExam(99);
    expect(questions).toHaveLength(MOCK_EXAM_LENGTH);
    expect(new Set(questions.map((question) => question.id)).size).toBe(questions.length);
    TOPIC_IDS.forEach((topic) => {
      expect(
        questions.some((question) => question.topic === topic),
        `mock exam missing ${topic}`
      ).toBe(true);
    });
  });

  it("accepts every expression question's own reference", () => {
    buildMockExam(3)
      .filter((question) => question.kind === "expression")
      .forEach((question) => {
        if (question.kind !== "expression") return;
        const verdict = gradeQuestion(question, {
          kind: "expression",
          text: question.referenceText
        });
        expect(verdict.correct, `${question.id}: ${verdict.feedback}`).toBe(true);
      });
  });
});

describe("cram set", () => {
  it("is short and stays inside the course bank or generators", () => {
    const questions = buildCramSet([], 12, 12);
    expect(questions.length).toBeLessThanOrEqual(12);
    expect(questions.length).toBeGreaterThan(0);
    questions.forEach((question) => {
      expect(TOPIC_IDS).toContain(question.topic);
    });
  });

  it("can replay a missed homework question", () => {
    const missed = SOURCE_QUESTIONS.find((question) => question.id === "hw1-q1a");
    expect(missed).toBeDefined();
    if (!missed) return;
    const questions = buildCramSet(
      [
        {
          id: "a",
          quizId: "db-exam1:drill",
          courseId: "database-systems",
          date: new Date().toISOString(),
          score: 0,
          correctCount: 0,
          totalCount: 1,
          timeSpent: 12,
          perQuestionResults: [
            {
              questionId: missed.id,
              questionType: "single",
              isCorrect: false,
              selected: [],
              correct: [],
              tags: [missed.topic],
              mistakes: ["inner-join-pads-unmatched"]
            }
          ],
          topicBreakdown: { [missed.topic]: { correct: 0, total: 1 } },
          status: "completed"
        }
      ],
      5,
      12
    );
    expect(questions.some((question) => question.id === missed.id)).toBe(true);
  });
});
