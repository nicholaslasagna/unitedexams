import { describe, expect, it } from "vitest";
import type { Attempt } from "@/lib/types";
import {
  buildLabAttempt,
  formatExamDate,
  labAttemptTitle,
  masteryByTopic,
  mistakeCounts,
  nextTopic,
  readiness,
  recentlyMissed,
  topicMastery,
  weakestTopics,
  type RecordedAnswer
} from "./mastery";
import { buildCramSet, buildMockExam, buildPracticeSet, followUpQuestion, repairQuestion, MOCK_EXAM_LENGTH } from "./practice";
import { gradeQuestion, type LabAnswer } from "./question-model";
import { TOPICS } from "./topics";

function answer(
  topic: RecordedAnswer["topic"],
  correct: boolean,
  index: number,
  mistakes: RecordedAnswer["mistakes"] = []
): RecordedAnswer {
  return { questionId: `q-${topic}-${index}`, topic, correct, mistakes };
}

function session(answers: RecordedAnswer[], daysAgo = 0): Attempt {
  const date = new Date(Date.now() - daysAgo * 86400000).toISOString();
  return buildLabAttempt({ mode: "drill", answers, timeSpentSeconds: 120, date });
}

describe("mastery derives from real attempts only", () => {
  it("reports nothing when nothing has been attempted", () => {
    const state = readiness([]);
    expect(state.percent).toBe(0);
    expect(state.questionsAnswered).toBe(0);
    expect(state.topicsStarted).toBe(0);
    expect(state.accuracy).toBe(0);
    topicMastery([]).forEach((entry) => {
      expect(entry.level).toBe("not-started");
      expect(entry.score).toBe(0);
    });
  });

  it("ignores attempts that are not lab attempts", () => {
    const foreign: Attempt = {
      id: "a1",
      quizId: "db-modeling-sql",
      courseId: "database-systems",
      date: new Date().toISOString(),
      score: 100,
      correctCount: 5,
      totalCount: 5,
      timeSpent: 60,
      perQuestionResults: [
        {
          questionId: "x",
          questionType: "single",
          isCorrect: true,
          selected: [],
          correct: [],
          tags: ["equijoin"]
        }
      ],
      topicBreakdown: { equijoin: { correct: 1, total: 1 } }
    };
    expect(readiness([foreign]).questionsAnswered).toBe(0);
  });

  it("scores a topic from its answers", () => {
    const attempts = [
      session([
        answer("equijoin", true, 1),
        answer("equijoin", true, 2),
        answer("equijoin", true, 3),
        answer("equijoin", false, 4)
      ])
    ];
    const mastery = masteryByTopic(attempts).equijoin;
    expect(mastery.attempted).toBe(4);
    expect(mastery.correct).toBe(3);
    expect(mastery.score).toBe(75);
    expect(mastery.level).toBe("learning");
  });

  it("requires sustained accuracy before calling a topic mastered", () => {
    const twoRight = [session([answer("division", true, 1), answer("division", true, 2)])];
    // Two correct answers is not mastery, however good the ratio looks.
    expect(masteryByTopic(twoRight).division.level).toBe("learning");

    const sustained = [
      session([
        answer("division", true, 1),
        answer("division", true, 2),
        answer("division", true, 3),
        answer("division", true, 4),
        answer("division", true, 5)
      ])
    ];
    expect(masteryByTopic(sustained).division.level).toBe("mastered");
  });

  it("marks a topic weak when most answers are wrong", () => {
    const attempts = [
      session([
        answer("semijoin", false, 1, ["semijoin-wrong-relation"]),
        answer("semijoin", false, 2, ["semijoin-direction"]),
        answer("semijoin", true, 3)
      ])
    ];
    expect(masteryByTopic(attempts).semijoin.level).toBe("weak");
    expect(weakestTopics(attempts)[0].topic).toBe("semijoin");
  });

  it("lets recent improvement move a topic out of weak", () => {
    const attempts = [
      // Older: three wrong.
      session(
        [
          answer("outer-join-left", false, 1),
          answer("outer-join-left", false, 2),
          answer("outer-join-left", false, 3)
        ],
        3
      ),
      // Recent: nine right.
      session(
        Array.from({ length: 9 }, (_, i) => answer("outer-join-left", true, 10 + i)),
        0
      )
    ];
    const mastery = masteryByTopic(attempts)["outer-join-left"];
    // The window holds 12 answers, so the old failures still count — but they
    // no longer dominate, and the topic is no longer weak.
    expect(mastery.attempted).toBe(12);
    expect(mastery.score).toBe(75);
    expect(mastery.level).toBe("learning");
  });

  it("weights readiness by exam importance and confidence", () => {
    const light = [session(Array.from({ length: 6 }, (_, i) => answer("relational-terminology", true, i)))];
    const heavy = [session(Array.from({ length: 6 }, (_, i) => answer("writing-expressions", true, i)))];
    // writing-expressions carries more weight than relational-terminology.
    expect(readiness(heavy).percent).toBeGreaterThan(readiness(light).percent);
  });

  it("never reports readiness above 100", () => {
    const attempts = TOPICS.map((topic) =>
      session(Array.from({ length: 12 }, (_, i) => answer(topic.id, true, i)))
    );
    const state = readiness(attempts);
    expect(state.percent).toBeLessThanOrEqual(100);
    expect(state.percent).toBe(100);
    expect(state.topicsMastered).toBe(TOPICS.length);
  });

  it("counts days until the exam on the Lubbock calendar", () => {
    const before = readiness([], new Date("2026-09-10T09:00:00-05:00"));
    expect(before.daysUntilExam).toBe(7);
    const after = readiness([], new Date("2026-09-20T09:00:00-05:00"));
    expect(after.daysUntilExam).toBe(0);
    // 11:30pm CDT on the 15th is already the 16th in UTC — still two days out.
    expect(readiness([], new Date("2026-09-16T04:30:00.000Z")).daysUntilExam).toBe(2);
    expect(readiness([], new Date("2026-09-17T12:00:00-05:00")).daysUntilExam).toBe(0);
  });

  it("formats the exam date without locale APIs", () => {
    expect(formatExamDate()).toBe("Thursday, September 17, 2026");
    expect(formatExamDate(false)).toBe("September 17");
  });

  it("gives lab attempts a readable title", () => {
    expect(labAttemptTitle("db-exam1:mock-exam")).toMatch(/Mock exam/i);
    expect(labAttemptTitle("db-modeling-sql")).toBeNull();
  });
});

describe("mistake tracking", () => {
  const attempts = [
    session([
      answer("equijoin", false, 1, ["filter-vs-join-condition"]),
      answer("equijoin", false, 2, ["filter-vs-join-condition"]),
      answer("division", false, 3, ["division-any-not-all"])
    ])
  ];

  it("tallies misconceptions across sessions", () => {
    const counts = mistakeCounts(attempts);
    expect(counts["filter-vs-join-condition"]).toBe(2);
    expect(counts["division-any-not-all"]).toBe(1);
  });

  it("surfaces the most recently missed topics without repeating one", () => {
    const missed = recentlyMissed(attempts);
    expect(missed.map((event) => event.topic)).toEqual(["equijoin", "division"]);
  });

  it("maps every repeated misconception to a repair exercise", () => {
    const counts = mistakeCounts(attempts);
    Object.keys(counts).forEach((tag) => {
      const question = repairQuestion(tag as never, 7);
      expect(question, `no repair exercise for ${tag}`).toBeTruthy();
    });
  });
});

describe("what to do next", () => {
  it("repairs a weak topic before introducing a new one", () => {
    const attempts = [
      session([
        answer("semijoin", false, 1, ["semijoin-direction"]),
        answer("semijoin", false, 2, ["semijoin-direction"]),
        answer("semijoin", false, 3)
      ])
    ];
    expect(nextTopic(attempts)).toBe("semijoin");
  });

  it("starts at the beginning of the path for a new learner", () => {
    expect(nextTopic([])).toBe("relational-terminology");
  });

  it("puts repair questions at the front of an adaptive set", () => {
    const attempts = [
      session([
        answer("division", false, 1, ["division-any-not-all"]),
        answer("division", false, 2, ["division-any-not-all"])
      ])
    ];
    const set = buildPracticeSet({ attempts, count: 6, seed: 42 });
    expect(set.length).toBe(6);
    expect(set[0].topic).toBe("division");
  });

  it("does not re-ask professor questions already answered", () => {
    const first = buildPracticeSet({ attempts: [], topic: "equijoin", count: 4, seed: 1 });
    const answered = first.map((question) => answer(question.topic, true, 0));
    const attempts = [
      buildLabAttempt({
        mode: "drill",
        timeSpentSeconds: 60,
        answers: first.map((question) => ({
          questionId: question.id,
          topic: question.topic,
          correct: true,
          mistakes: []
        }))
      })
    ];
    expect(answered.length).toBeGreaterThan(0);

    const second = buildPracticeSet({ attempts, topic: "equijoin", count: 4, seed: 1 });
    const overlap = second.filter((question) =>
      first.some((earlier) => earlier.id === question.id)
    );
    expect(overlap).toHaveLength(0);
  });

  it("produces a near-transfer follow-up on the same topic", () => {
    const [question] = buildPracticeSet({ attempts: [], topic: "semijoin", count: 1, seed: 5 });
    const follow = followUpQuestion(question);
    expect(follow).toBeTruthy();
    expect(follow!.topic).toBe(question.topic);
    expect(follow!.id).not.toBe(question.id);
  });

  it("fills a practice set even for an untouched topic", () => {
    TOPICS.forEach((topic) => {
      const set = buildPracticeSet({ attempts: [], topic: topic.id, count: 5, seed: 3 });
      expect(set.length, `${topic.id} produced ${set.length} questions`).toBe(5);
      set.forEach((question) => {
        expect(question.prompt.length).toBeGreaterThan(5);
        expect(question.explanation.length).toBeGreaterThan(20);
      });
    });
  });
});

describe("mock exam", () => {
  it("covers the blueprint", () => {
    const exam = buildMockExam(9);
    expect(exam).toHaveLength(MOCK_EXAM_LENGTH);
    expect(new Set(exam.map((question) => question.id)).size).toBe(exam.length);
  });

  it("includes every examined topic", () => {
    const exam = buildMockExam(9);
    const covered = new Set(exam.map((question) => question.topic));
    ["equijoin", "semijoin", "division", "keys", "integrity", "multi-table"].forEach((topic) => {
      expect(covered, `${topic} missing from mock exam`).toContain(topic);
    });
  });

  it("changes between sittings", () => {
    const a = buildMockExam(1).map((question) => question.id).join("|");
    const b = buildMockExam(2).map((question) => question.id).join("|");
    expect(a).not.toBe(b);
  });

  it("is reproducible for a given seed", () => {
    expect(buildMockExam(17).map((q) => q.id)).toEqual(buildMockExam(17).map((q) => q.id));
  });

  it("every question can be answered and graded", () => {
    buildMockExam(4).forEach((question) => {
      // Grading an empty answer must not throw, whatever the question kind.
      const empty: LabAnswer =
        question.kind === "expression"
          ? { kind: "expression", text: "" }
          : question.kind === "shape"
            ? { kind: "shape", degree: null, cardinality: null }
            : question.kind === "rows"
              ? { kind: "rows", selected: [] }
              : { kind: "choice", selected: [] };
      expect(() => gradeQuestion(question, empty)).not.toThrow();
    });
  });
});

describe("cram mode", () => {
  it("leads with the learner's repeated mistakes", () => {
    const attempts = [
      session([
        answer("outer-join-right", false, 1, ["outer-join-side"]),
        answer("outer-join-right", false, 2, ["outer-join-side"])
      ])
    ];
    const set = buildCramSet(attempts, 3, 8);
    expect(set.length).toBeGreaterThan(0);
    expect(["outer-join-left", "outer-join-right"]).toContain(set[0].topic);
  });

  it("still produces a useful set for someone with no history", () => {
    const set = buildCramSet([], 3, 10);
    expect(set).toHaveLength(10);
    // Heaviest topics first when there is nothing else to go on.
    expect(set.map((question) => question.topic)).toContain("writing-expressions");
  });
});
