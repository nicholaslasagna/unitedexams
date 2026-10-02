import { describe, expect, it } from "vitest";
import { getCourseQuizSets } from "@/data/seed";
import { gradeQuestion } from "@/features/quiz/engine";
import { resolveQuestionCountTarget, resolveQuizSetMode } from "@/lib/study/set-mode";
import type { Question } from "@/lib/types";
import { introductionQuestions, structureQuestions } from "./ch1-2";
import { processQuestions, threadQuestions } from "./ch3-4";
import { schedulingQuestions, synchronizationQuestions } from "./ch5-6";
import { operatingSystemsExam1QuizSets } from "./index";

const chapters = [
  { chapter: 1, file: "Ch1 Introduction.pdf", pages: 78, questions: introductionQuestions, exercisePages: [21, 35, 43, 45, 46, 54, 61, 68, 69, 77] },
  { chapter: 2, file: "Ch2 OS Structure.pdf", pages: 64, questions: structureQuestions, exercisePages: [21, 31, 32, 35, 47, 48, 49, 51, 52, 62, 63] },
  { chapter: 3, file: "Ch3 Process.pdf", pages: 66, questions: processQuestions, exercisePages: [9, 10, 11, 18, 27, 28, 29, 33, 34, 35, 41, 48, 51, 52, 56, 63, 64, 65] },
  { chapter: 4, file: "Ch4 Thread.pdf", pages: 46, questions: threadQuestions, exercisePages: [5, 6, 7, 12, 13, 14, 19, 20, 24, 32, 33, 34, 43, 44, 45, 46] },
  { chapter: 5, file: "Ch5 CPU Scheduling.pdf", pages: 39, questions: schedulingQuestions, exercisePages: [5, 21, 22, 23, 28, 37, 38] },
  { chapter: 6, file: "Ch6 Synchronization.pdf", pages: 60, questions: synchronizationQuestions, exercisePages: [5, 9, 10, 19, 23, 24, 33, 34, 35, 48, 49, 57, 58, 59] }
];
const bank = chapters.flatMap((chapter) => chapter.questions);
const question = (id: string): Question => {
  const found = bank.find((item) => item.id === id);
  if (!found) throw new Error(`Missing OS practice question: ${id}`);
  return found;
};
const set = (id: string) => {
  const found = operatingSystemsExam1QuizSets.find((item) => item.id === id);
  if (!found) throw new Error(`Missing OS study set: ${id}`);
  return found;
};
const pageRanges = (reference: string) => {
  const pageList = reference.match(/PDF pages? ([\d,\s–-]+)/)?.[1] ?? "";
  return Array.from(pageList.matchAll(/(\d+)(?:\s*[–-]\s*(\d+))?/g), (match) =>
    [Number(match[1]), Number(match[2] ?? match[1])] as const
  );
};

describe("Operating Systems chapter 1–6 study sets", () => {
  it("registers the mock, six chapter quizzes, and written practice", () => {
    const registered = getCourseQuizSets("operating-systems");
    expect(new Set(operatingSystemsExam1QuizSets.map((item) => item.id)).size).toBe(8);
    for (const item of operatingSystemsExam1QuizSets) {
      expect(registered.find((candidate) => candidate.id === item.id)).toEqual(item);
      expect(item.courseId).toBe("operating-systems");
      expect(new Set(item.questions.map((q) => q.id)).size).toBe(item.questions.length);
    }
    for (const { chapter, questions } of chapters) {
      const chapterSet = set(`os-exam1-chapter-${chapter}`);
      expect(chapterSet.mode).toBe("quiz");
      expect(resolveQuizSetMode(chapterSet)).toBe("quiz");
      expect(chapterSet.questions).toEqual(questions);
      expect(questions.some((q) => q.tags.includes("slide-exercise"))).toBe(true);
    }
  });

  it("sits a fixed 48-question objective mock with balanced chapters and hidden answers", () => {
    const mock = set("os-exam1-simulation");
    expect(resolveQuizSetMode(mock)).toBe("exam");
    expect(mock.isExamSimulation).toBe(false);
    expect(mock.questions).toHaveLength(48);
    expect(mock.questionCountTarget).toBe(mock.questions.length);
    expect(resolveQuestionCountTarget(mock)).toBe(48);
    expect(mock.timerDefaultMinutes).toBe(90);
    for (const { chapter, questions } of chapters) {
      const included = mock.questions.filter((q) => q.tags.includes(`chapter-${chapter}`));
      expect(included).toEqual(questions.slice(0, 8));
      expect(included.filter((q) => q.type !== "free")).toHaveLength(8);
      expect(included.filter((q) => q.type === "free")).toHaveLength(0);
    }
  });

  it("offers all 18 written questions for guided practice", () => {
    const written = set("os-exam1-written-practice");
    expect(resolveQuizSetMode(written)).toBe("homework");
    expect(written.questions).toHaveLength(18);
    expect(written.questions).toEqual(bank.filter((q) => q.type === "free"));
  });

  it("keeps canonical question IDs distinct across chapters", () => {
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
    for (const { chapter, questions } of chapters) {
      for (const q of questions) {
        expect(q.id).toMatch(new RegExp(`^os-e1-c${chapter}-\\d+$`));
        expect(q.tags.filter((tag) => /^chapter-\d+$/.test(tag))).toEqual([`chapter-${chapter}`]);
      }
    }
  });

  it("covers the exercise pages in each supplied slide deck", () => {
    for (const { chapter, file, questions, exercisePages } of chapters) {
      const exercises = questions.filter((q) => q.tags.includes("slide-exercise"));
      // Chapter 2 has two separate exercises on page 21.
      expect(exercises.length, `chapter ${chapter}`).toBeGreaterThanOrEqual(exercisePages.length + Number(chapter === 2));
      const covered = new Set(exercises.flatMap((q) => (q.references ?? [])
        .filter((reference) => reference.startsWith(`${file}, PDF page`))
        .flatMap((reference) => pageRanges(reference).flatMap(([first, last]) =>
          Array.from({ length: last - first + 1 }, (_, index) => first + index)))));
      for (const page of exercisePages) expect(covered, `chapter ${chapter}, exercise page ${page}`).toContain(page);
    }
  });

  it("keeps every answer usable and every PDF citation inside its source deck", () => {
    for (const { questions } of chapters) {
      for (const q of questions) {
        expect(q.prompt.trim(), q.id).not.toBe("");
        expect(q.explanation.trim(), q.id).not.toBe("");
        expect(q.references?.length, q.id).toBeGreaterThan(0);
        for (const reference of q.references ?? []) {
          const source = chapters.find(({ file }) => reference.startsWith(`${file}, PDF page`));
          expect(source, `${q.id}: unknown source ${reference}`).toBeDefined();
          const ranges = pageRanges(reference);
          expect(ranges.length, `${q.id}: ${reference}`).toBeGreaterThan(0);
          for (const [first, last] of ranges) {
            expect(first, reference).toBeGreaterThanOrEqual(1);
            expect(last, reference).toBeGreaterThanOrEqual(first);
            expect(last, reference).toBeLessThanOrEqual(source!.pages);
          }
        }
        if (q.type === "single" || q.type === "multi") {
          expect(q.options?.length, q.id).toBeGreaterThanOrEqual(2);
          const correct = q.correct ?? [];
          expect(correct.length, q.id).toBeGreaterThan(0);
          expect(new Set(correct).size, q.id).toBe(correct.length);
          for (const index of correct) {
            expect(typeof index, q.id).toBe("number");
            expect(Number.isInteger(index), q.id).toBe(true);
            expect(index, q.id).toBeGreaterThanOrEqual(0);
            expect(index, q.id).toBeLessThan(q.options!.length);
          }
          if (q.type === "single") expect(correct, q.id).toHaveLength(1);
          expect(gradeQuestion(q, correct as number[]), q.id).toBe(true);
          expect(gradeQuestion(q, []), q.id).toBe(false);
        } else if (q.type === "fill") {
          expect(q.correct?.length, q.id).toBeGreaterThan(0);
          for (const answer of q.correct ?? []) {
            expect(typeof answer, q.id).toBe("string");
            expect(gradeQuestion(q, [], String(answer)), `${q.id}: ${answer}`).toBe(true);
          }
          expect(gradeQuestion(q, [], ""), q.id).toBe(false);
          expect(gradeQuestion(q, [], "definitely incorrect"), q.id).toBe(false);
        } else {
          expect(q.sampleAnswer?.trim().length, q.id).toBeGreaterThan(80);
          expect(q.hintSteps?.length, q.id).toBeGreaterThan(0);
          expect(q.walkthroughSteps?.length, q.id).toBeGreaterThanOrEqual(3);
        }
      }
    }
  });
});

// Source examples all arrive at zero. Track completion after each dispatch,
// independently of the answers and Gantt charts written in the content bank.
function averageWaiting(bursts: number[], order: number[], quantum = Infinity, priorities = bursts.map(() => 0)) {
  const remaining = [...bursts];
  const completion = bursts.map(() => 0);
  const queue = [...order];
  let clock = 0;
  while (queue.length > 0) {
    queue.sort((a, b) => priorities[a] - priorities[b]);
    const process = queue.shift()!;
    const slice = Math.min(quantum, remaining[process]);
    clock += slice;
    remaining[process] -= slice;
    if (remaining[process] > 0) queue.push(process);
    else completion[process] = clock;
  }
  return completion.reduce((sum, end, i) => sum + end - bursts[i], 0) / bursts.length;
}

describe("independently calculated OS answers", () => {
  it("matches the FCFS, SJF, RR, and priority slide examples", () => {
    const sjfBursts = [6, 8, 7, 3];
    const cases: Array<[string, number, number?]> = [
      ["os-e1-c5-02", averageWaiting([24, 3, 3], [0, 1, 2])],
      ["os-e1-c5-03", averageWaiting(sjfBursts, [0, 1, 2, 3].sort((a, b) => sjfBursts[a] - sjfBursts[b]))],
      ["os-e1-c5-04", averageWaiting([24, 3, 3], [0, 1, 2], 4), 2],
      ["os-e1-c5-05", averageWaiting([10, 1, 2, 1, 5], [0, 1, 2, 3, 4], Infinity, [3, 1, 4, 5, 2])],
      ["os-e1-c5-28", averageWaiting([4, 5, 8, 7, 3], [0, 1, 2, 3, 4], 2, [3, 2, 2, 1, 3])]
    ];
    for (const [id, value, decimalPlaces] of cases) {
      const answer = decimalPlaces === undefined ? String(value) : value.toFixed(decimalPlaces);
      expect(gradeQuestion(question(id), [], answer), `${id}: independently calculated ${answer}`).toBe(true);
    }
  });

  it("checks burst prediction, feedback allotments, hardware threads, and blocking semaphore arithmetic", () => {
    const cases: Array<[string, number]> = [
      ["os-e1-c5-15", 0.5 * 6 + (1 - 0.5) * 10],
      ["os-e1-c5-19", 35 - 8 - 16],
      ["os-e1-c5-21", 4 * 2],
      ["os-e1-c6-21", [1, 1, 1].reduce((value, wait) => value - wait, 2)]
    ];
    for (const [id, answer] of cases) {
      expect(gradeQuestion(question(id), [], String(answer)), id).toBe(true);
    }
  });

  it("calculates Amdahl speedup from the serial fraction rather than confusing it with parallel work", () => {
    const exercise = question("os-e1-c4-02");
    const speedup = 1 / (0.6 + (1 - 0.6) / 4);
    const answerIndex = exercise.options!.indexOf(speedup.toFixed(2));
    expect(answerIndex).toBeGreaterThanOrEqual(0);
    expect(gradeQuestion(exercise, [answerIndex])).toBe(true);

    const worked = question("os-e1-c4-30");
    for (const cores of [2, 4]) {
      const runtime = 100 * (0.25 + (1 - 0.25) / cores);
      expect(worked.sampleAnswer).toContain(`${runtime} seconds`);
      const gain = 100 / runtime;
      expect(worked.sampleAnswer).toContain(cores === 2 ? String(gain) : gain.toFixed(3));
    }
    expect(worked.sampleAnswer).toContain(`1/0.25 = ${1 / 0.25}`);
  });
});
