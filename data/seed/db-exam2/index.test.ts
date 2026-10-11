import { describe, expect, it } from "vitest";
import { getCourseQuizSets } from "@/data/seed";
import { gradeQuestion, summarizeAttempt } from "@/features/quiz/engine";
import { resolveQuestionCountTarget, resolveQuizSetMode } from "@/lib/study/set-mode";
import { databaseExam2Mocks, databaseExam2PracticeSets, databaseExam2QuizSets } from ".";

const bank = databaseExam2PracticeSets.flatMap((set) => set.questions);
const all = [...bank, ...databaseExam2Mocks.flatMap((set) => set.questions)];

describe("Databases Exam 2 preparation", () => {
  it("registers both mock choices, five focused sets and the entire untimed bank", () => {
    const registered = getCourseQuizSets("database-systems");
    expect(databaseExam2QuizSets).toHaveLength(8);
    expect(new Set(databaseExam2QuizSets.map((set) => set.id)).size).toBe(8);
    for (const set of databaseExam2QuizSets) {
      expect(registered.find((entry) => entry.id === set.id)).toEqual(set);
      expect(set.courseId).toBe("database-systems");
      expect(set.fixedOrder).toBe(true);
    }
    const review = databaseExam2QuizSets.find((set) => set.id === "db-exam2-complete-review")!;
    expect(resolveQuizSetMode(review)).toBe("quiz");
    expect(review.questions).toEqual(bank);
    expect(resolveQuestionCountTarget(review)).toBe(bank.length);
    expect(bank).toHaveLength(89);
    expect(new Set(bank.map((q) => q.id)).size).toBe(bank.length);
  });

  it("covers every numbered lecture example, activity subpart and homework item", () => {
    const ids = new Set(bank.map((q) => q.id));
    for (let n = 1; n <= 18; n++) expect(ids.has(`db-e2-sql-ex6-${n}`)).toBe(true);
    for (const part of ["q1", "q2", "q3", "q4a", "q4b-i", "q4b-ii", "q4b-iii", "q5", "q6a", "q6b", "q7"]) {
      expect(ids.has(`db-e2-activity-${part}`), part).toBe(true);
    }
    for (let n = 1; n <= 8; n++) expect(ids.has(`db-e2-hw-soccer-${String(n).padStart(2, "0")}`)).toBe(true);
    for (const part of "abcdefghij") expect(ids.has(`db-e2-hw-repair-${part}`), part).toBe(true);
    for (let n = 1; n <= 4; n++) expect(ids.has(`db-e2-multi-${String(n).padStart(2, "0")}`)).toBe(true);
  });

  it("provides complete models, valid rubrics and progressive help for written answers", () => {
    for (const q of all) {
      expect(q.references?.length, q.id).toBeGreaterThan(0);
      expect(q.explanation.trim().length, q.id).toBeGreaterThan(30);
      expect(q.tags, q.id).toContain("mysql");
      expect(q.fromProfessor, q.id).not.toBe(true);
      if (q.type === "free") {
        expect(q.sampleAnswer?.trim().length, q.id).toBeGreaterThan(50);
        expect(q.hintSteps?.length, q.id).toBeGreaterThanOrEqual(2);
        expect(q.walkthroughSteps?.length, q.id).toBeGreaterThanOrEqual(3);
        expect(q.rubric?.length, q.id).toBeGreaterThan(0);
        expect(q.rubric!.every((item) => item.marks > 0 && item.criterion.trim().length > 0), q.id).toBe(true);
        expect(new Set(q.rubric!.map((item) => item.criterion)).size, q.id).toBe(q.rubric!.length);
      } else {
        expect(q.correct?.length, q.id).toBeGreaterThan(0);
        if (q.type === "single" || q.type === "multi") {
          expect(gradeQuestion(q, q.correct as number[]), q.id).toBe(true);
          expect(gradeQuestion(q, []), q.id).toBe(false);
          expect(q.correct!.every((n) => typeof n === "number" && n >= 0 && n < q.options!.length), q.id).toBe(true);
        } else {
          for (const answer of q.correct!) expect(gradeQuestion(q, [], String(answer)), q.id).toBe(true);
        }
      }
    }
  });

  it("keeps the Exam 1 choice format without scoring the unchosen question", () => {
    const [query, debug] = databaseExam2Mocks;
    expect(query.questions.slice(0, 2)).toEqual(debug.questions.slice(0, 2));
    expect(query.questions[2].id).toBe("db2-mock-q3");
    expect(debug.questions[2].id).toBe("db2-mock-q4");
    for (const paper of databaseExam2Mocks) {
      expect(resolveQuizSetMode(paper)).toBe("exam");
      expect(paper.isExamSimulation).toBe(false);
      expect(paper.fixedOrder).toBe(true);
      expect(resolveQuestionCountTarget(paper)).toBe(3);
      expect(paper.questions).toHaveLength(3);
      expect(paper.timerDefaultMinutes).toBe(70);
      for (const q of paper.questions) {
        expect(q.type).toBe("free");
        expect(q.points).toBe(5);
        expect(q.rubric?.reduce((sum, item) => sum + item.marks, 0)).toBe(5);
      }
    }
  });

  it("awards weighted partial credit rather than counting each long answer as all-or-nothing", () => {
    for (const paper of databaseExam2Mocks) {
      const order = paper.questions.map((q) => q.id);
      const rubricByQuestion = Object.fromEntries(paper.questions.map((q) => [q.id, q.rubric!.map((_, i) => i)]));
      const perfect = summarizeAttempt({ quiz: paper, selectedByQuestion: {}, rubricByQuestion, order, timeSpentSeconds: 70 * 60 });
      expect(perfect.score).toBe(100);
      expect(perfect.perQuestionResults.reduce((sum, q) => sum + q.pointsEarned!, 0)).toBe(15);
      rubricByQuestion[order[2]] = [0, 1];
      const partial = summarizeAttempt({ quiz: paper, selectedByQuestion: {}, rubricByQuestion, order, timeSpentSeconds: 1 });
      expect(partial.score).toBe(80); // 5 + 5 + 2 out of 15.
      expect(partial.perQuestionResults[2].isCorrect).toBe(false);
      const blank = summarizeAttempt({ quiz: paper, selectedByQuestion: {}, order, timeSpentSeconds: 1 });
      expect(blank.score).toBe(0);
    }
  });

  it("keeps MySQL-specific caveats and removes student identifiers from source-derived content", () => {
    const byId = (id: string) => bank.find((q) => q.id === id)!;
    expect(byId("db-e2-hw-repair-b").sampleAnswer).toMatch(/impossible|cannot|no rows|empty/i);
    expect(byId("db-e2-hw-repair-g").sampleAnswer).toMatch(/valid|legal/i);
    expect(byId("db-e2-hw-soccer-04").sampleAnswer).toContain("<=>");
    expect(byId("db-e2-activity-q2").sampleAnswer).toContain("admin!______");
    expect(byId("db-e2-activity-q5").sampleAnswer).toMatch(/4.*3.*2/);
    expect(JSON.stringify(databaseExam2QuizSets)).not.toMatch(/Nicholas|Lasagna|R11892575|passwordHash|\$2b\$/i);
  });
});
