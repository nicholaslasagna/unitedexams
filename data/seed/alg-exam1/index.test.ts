import { describe, expect, it } from "vitest";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { Markdown } from "@/components/ui/markdown";
import { getCourseQuizSets } from "@/data/seed";
import { summarizeAttempt } from "@/features/quiz/engine";
import { resolveQuestionCountTarget, resolveQuizSetMode } from "@/lib/study/set-mode";
import { algorithmsExam1Mock, algorithmsExam1PracticeSets, algorithmsExam1PrioritySet, algorithmsExam1QuizSets } from ".";

const bank = algorithmsExam1PracticeSets.flatMap((set) => set.questions);
const byId = (id: string) => bank.find((question) => question.id === id)!;

function numericTable(answer: string) {
  return answer.split("\n").filter((line) => line.startsWith("|")).map((line) =>
    line.split("|").slice(2, -1).map((cell) => cell.trim())
  ).filter((row) => row.length > 0 && row.every((cell) => /^\d+[↖↑←]?$/.test(cell)));
}

function editDistanceTable(x: string, y: string) {
  const table = Array.from({ length: x.length + 1 }, (_, i) =>
    Array.from({ length: y.length + 1 }, (_, j) => i === 0 ? j : j === 0 ? i : 0)
  );
  for (let i = 1; i <= x.length; i++) {
    for (let j = 1; j <= y.length; j++) {
      table[i][j] = Math.min(table[i - 1][j] + 1, table[i][j - 1] + 1,
        table[i - 1][j - 1] + Number(x[i - 1] !== y[j - 1]));
    }
  }
  return table;
}

function isSubsequence(candidate: string, sequence: string) {
  let i = 0;
  for (const char of sequence) if (char === candidate[i]) i++;
  return i === candidate.length;
}

function bruteLcsLength(x: string, y: string) {
  let best = 0;
  for (let mask = 0; mask < 2 ** x.length; mask++) {
    const candidate = [...x].filter((_, index) => mask & (1 << index)).join("");
    if (candidate.length > best && isSubsequence(candidate, y)) best = candidate.length;
  }
  return best;
}

describe("Algorithms Exam 1 preparation", () => {
  it("registers all six sets and makes the full bank available without sampling", () => {
    const registered = getCourseQuizSets("analysis-of-algorithms");
    expect(algorithmsExam1QuizSets).toHaveLength(6);
    expect(new Set(algorithmsExam1QuizSets.map((set) => set.id)).size).toBe(6);
    for (const set of algorithmsExam1QuizSets) {
      expect(registered.find((entry) => entry.id === set.id)).toEqual(set);
      expect(set.courseId).toBe("analysis-of-algorithms");
      expect(set.fixedOrder).toBe(true);
    }
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
    const review = algorithmsExam1QuizSets.find((set) => set.id === "alg-exam1-complete-review")!;
    expect(resolveQuizSetMode(review)).toBe("quiz");
    expect(resolveQuestionCountTarget(review)).toBe(bank.length);
    expect(review.questions).toEqual(bank);
  });

  it("prioritizes every homework subpart and the supplied projected review, without calling extra practice confirmed", () => {
    const hw1 = bank.filter((q) => q.tags.includes("homework-1"));
    const hw2 = bank.filter((q) => q.tags.includes("homework-2"));
    expect(hw1).toHaveLength(16);
    expect(hw2).toHaveLength(10);
    expect(algorithmsExam1PrioritySet.questions.slice(0, 4).map((q) => q.id)).toEqual([
      "alg-e1-dp-edit-table", "alg-e1-dp-edit-recurrence", "alg-e1-dp-edit-cell", "alg-e1-dp-edit-traceback"
    ]);
    expect(algorithmsExam1PrioritySet.questions.slice(4)).toEqual([...hw1, ...hw2]);
    expect(resolveQuestionCountTarget(algorithmsExam1PrioritySet)).toBe(30);
    expect(algorithmsExam1PrioritySet.questions).toHaveLength(30);
    expect(algorithmsExam1PrioritySet.questions.every((q) => !q.tags.includes("additional-practice"))).toBe(true);
    expect(algorithmsExam1PrioritySet.description).toMatch(/professor said.*homework and projected/i);
  });

  it("provides complete self-contained worked models, provenance and usable partial-credit rubrics", () => {
    for (const q of [...bank, ...algorithmsExam1Mock.questions]) {
      expect(q.type, q.id).toBe("free");
      expect(q.references?.length, q.id).toBeGreaterThan(0);
      expect(q.sampleAnswer?.length, q.id).toBeGreaterThan(100);
      expect(q.sampleAnswer, q.id).not.toContain("undefined");
      expect(q.explanation.trim().length, q.id).toBeGreaterThan(30);
      expect(q.hintSteps?.length, q.id).toBeGreaterThanOrEqual(2);
      expect(q.walkthroughSteps?.length, q.id).toBeGreaterThanOrEqual(3);
      expect(q.rubric?.length, q.id).toBeGreaterThan(0);
      expect(q.rubric?.every((item) => item.marks > 0 && item.criterion.trim().length > 0), q.id).toBe(true);
      expect(q.fromProfessor, q.id).not.toBe(true);
      expect(q.tags, q.id).toContain("algorithms");
    }
    expect(JSON.stringify(algorithmsExam1QuizSets)).not.toMatch(/Nicholas|Lasagna|R11892575|tiji@/i);
  });

  it("renders the authored mathematical prompts and worked answers without KaTeX errors", () => {
    for (const q of [...bank, ...algorithmsExam1Mock.questions]) {
      for (const content of [q.prompt, q.sampleAnswer!]) {
        const html = renderToStaticMarkup(createElement(Markdown, { content, promoteMathInInlineCode: true }));
        expect(html, q.id).not.toContain("katex-error");
      }
    }
  });

  it("checks every authored edit-distance cell and arrow against the specified cost and tie rule", () => {
    const x = "esteban", y = "stephen";
    const expected = editDistanceTable(x, y);
    const actual = numericTable(byId("alg-e1-dp-edit-table").sampleAnswer!);
    expect(actual.map((row) => row.map((cell) => parseInt(cell)))).toEqual(expected);
    for (let i = 0; i <= x.length; i++) {
      for (let j = 0; j <= y.length; j++) {
        if (i === 0 && j === 0) continue;
        const arrow = i === 0 ? "←" : j === 0 ? "↑" :
          expected[i - 1][j - 1] + Number(x[i - 1] !== y[j - 1]) === expected[i][j] ? "↖" :
          expected[i - 1][j] + 1 === expected[i][j] ? "↑" : "←";
        expect(actual[i][j], `${i},${j}`).toBe(`${expected[i][j]}${arrow}`);
      }
    }
    expect(expected[7][7]).toBe(4);
    const script = ["esteban", "steban", "stepban", "stephan", "stephen"];
    for (let i = 1; i < script.length; i++) {
      expect(editDistanceTable(script[i - 1], script[i]).at(-1)!.at(-1)).toBe(1);
      expect(byId("alg-e1-dp-edit-traceback").sampleAnswer).toContain(script[i]);
    }
    expect(editDistanceTable("kitten", "sitting").at(-1)!.at(-1)).toBe(3);
  });

  it("checks every LCS table cell independently by enumerating subsequences", () => {
    const x = "ABCBDAB", y = "BDCABA";
    const actual = numericTable(byId("alg-e1-dp-lcs-table").sampleAnswer!);
    expect(actual).toHaveLength(x.length + 1);
    for (let i = 0; i <= x.length; i++) {
      expect(actual[i]).toHaveLength(y.length + 1);
      for (let j = 0; j <= y.length; j++) {
        expect(Number(actual[i][j]), `${i},${j}`).toBe(bruteLcsLength(x.slice(0, i), y.slice(0, j)));
      }
    }
    for (const result of ["BCBA", "BDAB"]) {
      expect(isSubsequence(result, x) && isSubsequence(result, y)).toBe(true);
      expect(result.length).toBe(bruteLcsLength(x, y));
    }
  });

  it("runs all six weighted written questions and awards partial marks out of 100", () => {
    const paper = algorithmsExam1Mock;
    expect(resolveQuizSetMode(paper)).toBe("exam");
    expect(paper.isExamSimulation).toBe(false);
    expect(resolveQuestionCountTarget(paper)).toBe(6);
    expect(paper.timerDefaultMinutes).toBe(75);
    expect(paper.description).toMatch(/actual.*unconfirmed/i);
    expect(paper.questions.reduce((sum, q) => sum + q.points!, 0)).toBe(100);
    for (const q of paper.questions) expect(q.rubric!.reduce((sum, item) => sum + item.marks, 0), q.id).toBe(q.points);
    const order = paper.questions.map((q) => q.id);
    const rubricByQuestion = Object.fromEntries(paper.questions.map((q) => [q.id, q.rubric!.map((_, i) => i)]));
    const perfect = summarizeAttempt({ quiz: paper, selectedByQuestion: {}, rubricByQuestion, order, timeSpentSeconds: 75 * 60 });
    expect(perfect.score).toBe(100);
    rubricByQuestion["alg-e1-mock-q6"] = [0, 1];
    const partial = summarizeAttempt({ quiz: paper, selectedByQuestion: {}, rubricByQuestion, order, timeSpentSeconds: 1 });
    expect(partial.score).toBe(86);
    const blank = summarizeAttempt({ quiz: paper, selectedByQuestion: {}, order, timeSpentSeconds: 1 });
    expect(blank.score).toBe(0);
  });
});
