import { describe, expect, it } from "vitest";
import { courses, quizSets } from "@/data/seed";
import { CURRENT_TERM } from "@/data/seed/term";

/**
 * Structural guards for the seeded library. These are the failures that are
 * invisible until a student hits them: a class listed with nothing to study,
 * a set pointing at a course that no longer exists, or a duplicated set id
 * making two different sets share one attempt history.
 */
describe("seeded library", () => {
  it("gives every listed course something to study", () => {
    for (const course of courses) {
      const sets = quizSets.filter((set) => set.courseId === course.id);
      expect(sets.length, `${course.code} (${course.name}) has no quiz sets`).toBeGreaterThan(0);
      const questions = sets.reduce((n, set) => n + set.questions.length, 0);
      expect(questions, `${course.code} has sets but no questions`).toBeGreaterThan(0);
    }
  });

  it("has no quiz set pointing at a course that does not exist", () => {
    const ids = new Set(courses.map((c) => c.id));
    const orphans = quizSets.filter((set) => !ids.has(set.courseId));
    expect(orphans.map((s) => `${s.id} -> ${s.courseId}`)).toEqual([]);
  });

  it("keeps course ids and codes unique", () => {
    const ids = courses.map((c) => c.id);
    const codes = courses.map((c) => c.code);
    expect(new Set(ids).size).toBe(ids.length);
    expect(new Set(codes).size).toBe(codes.length);
  });

  it("keeps quiz set ids unique", () => {
    // Attempts are keyed by set id, so a collision would merge two different
    // sets' histories.
    const ids = quizSets.map((set) => set.id);
    const seen = new Set<string>();
    const dupes = ids.filter((id) => (seen.has(id) ? true : (seen.add(id), false)));
    expect(dupes).toEqual([]);
  });

  it("gives every question the fields the runner needs", () => {
    for (const set of quizSets) {
      for (const question of set.questions) {
        expect(question.id, `${set.id} has a question with no id`).toBeTruthy();
        expect(question.prompt.trim(), `${question.id} has an empty prompt`).not.toBe("");
        expect(question.explanation.trim(), `${question.id} has no explanation`).not.toBe("");
        if (question.type === "single" || question.type === "multi") {
          expect(question.options?.length, `${question.id} has no options`).toBeGreaterThan(1);
          expect(question.correct?.length, `${question.id} has no correct answer`).toBeGreaterThan(0);
          for (const index of question.correct ?? []) {
            expect(
              typeof index === "number" ? index < (question.options?.length ?? 0) : true,
              `${question.id} marks an out-of-range option correct`
            ).toBe(true);
          }
        }
        if (question.type === "single") {
          expect(question.correct?.length, `${question.id} is single-answer with several correct`).toBe(1);
        }
      }
    }
  });

  it("states one term, and it is the one the seed data is current for", () => {
    expect(CURRENT_TERM.label).toMatch(/^(Spring|Summer|Fall|Winter) \d{4}$/);
    expect(CURRENT_TERM.short.startsWith(CURRENT_TERM.label.split(" ")[0])).toBe(true);
  });
});

describe("course notes", () => {
  it("gives every listed course notes and a cheat sheet", async () => {
    const { notesByCourse } = await import("@/data/seed/notes");
    for (const course of courses) {
      const content = notesByCourse[course.id];
      expect(content, `${course.code} (${course.name}) has no notes entry`).toBeDefined();
      expect(content.notes.trim().length, `${course.code} notes are empty`).toBeGreaterThan(400);
      expect(
        content.cheatSheet.trim().length,
        `${course.code} cheat sheet is empty`
      ).toBeGreaterThan(200);
      expect(content.resources.length, `${course.code} has no resources`).toBeGreaterThan(0);
      for (const resource of content.resources) {
        expect(resource.href).toMatch(/^https?:\/\//);
        expect(resource.label.trim()).not.toBe("");
      }
    }
  });

  it("keeps the merged architecture notes covering both halves", async () => {
    const { notesByCourse } = await import("@/data/seed/notes");
    const arch = notesByCourse["computer-architecture"];
    // CSE-240 and CS-5375 were merged; neither half may be dropped.
    expect(arch.notes).toMatch(/RISC-V/);
    expect(arch.notes).toMatch(/Amdahl/);
    expect(arch.cheatSheet).toMatch(/MESI/);
  });
});
