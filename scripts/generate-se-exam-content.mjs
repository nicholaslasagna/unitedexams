#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";

const sourcePath = process.argv[2] ?? path.resolve(process.cwd(), "questions.js");
const outputPath =
  process.argv[3] ??
  path.resolve(process.cwd(), "content/software-engineering/se-exam1-full-practice.json");

const raw = fs.readFileSync(sourcePath, "utf8");
const sandbox = {
  window: {},
  module: { exports: {} },
  exports: {}
};
vm.createContext(sandbox);
vm.runInContext(raw, sandbox, { filename: sourcePath });

const exportedBank =
  (sandbox.module && sandbox.module.exports && sandbox.module.exports.QUESTION_BANK) ??
  (sandbox.exports && sandbox.exports.QUESTION_BANK);
const questionBank = Array.isArray(sandbox.window.QUESTION_BANK)
  ? sandbox.window.QUESTION_BANK
  : Array.isArray(exportedBank)
    ? exportedBank
    : [];
if (questionBank.length === 0) {
  throw new Error("No QUESTION_BANK entries found in source file.");
}

const chapterDifficulty = {
  1: "easy",
  2: "med",
  3: "med",
  4: "hard"
};

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function normalizeFillAnswer(answer) {
  if (Array.isArray(answer) && answer.length > 0) {
    return answer.join(", ");
  }
  if (typeof answer === "string" && answer.trim().length > 0) {
    return answer.trim();
  }
  return "See explanation.";
}

const questions = questionBank
  .filter((item) => Number(item.chapter) >= 1 && Number(item.chapter) <= 4)
  .map((item) => {
    const chapter = Number(item.chapter);
    const externalId = String(item.id);
    const baseId = `se-exam1-${slugify(externalId)}`;
    const type = item.type === "multi" ? "multi" : item.type === "single" ? "single" : "free";
    const topics = Array.isArray(item.topics) ? item.topics.map((topic) => String(topic)) : [];
    const tags = [...new Set([`chapter-${chapter}`, ...topics])];
    const explanation = String(item.explanation ?? "Review the worked solution.");

    if (type === "free") {
      const answerText = normalizeFillAnswer(item.answer);
      return {
        id: baseId,
        externalId,
        type: "free",
        prompt: `Fill in the blank and justify your answer:\n\n${String(item.question)}`,
        explanation,
        solutionMd: answerText,
        sampleAnswer: answerText,
        walkthroughSteps: [
          "Identify what concept the blank is testing (definition, process, or requirement term).",
          "Use chapter vocabulary exactly as presented in lecture and review material.",
          `Final answer: **${answerText}**.`
        ],
        references: [`Software Engineering Exam Bank ${externalId}`],
        tags,
        difficulty: chapterDifficulty[chapter] ?? "med",
        homeworkFormat: "short",
        fromProfessor: Boolean(item.fromProfessor)
      };
    }

    return {
      id: baseId,
      externalId,
      type,
      prompt: String(item.question),
      options: Array.isArray(item.options) ? item.options.map((option) => String(option)) : [],
      correct: Array.isArray(item.answer) ? item.answer.map((value) => Number(value)) : [],
      explanation,
      solutionMd: explanation,
      walkthroughSteps: [
        "Identify the software engineering concept this question is testing.",
        "Eliminate options that conflict with chapter definitions or process-model rules.",
        "Select the answer that aligns with professor keywords and chapter terminology."
      ],
      references: [`Software Engineering Exam Bank ${externalId}`],
      tags,
      difficulty: chapterDifficulty[chapter] ?? "med",
      homeworkFormat: "short",
      fromProfessor: Boolean(item.fromProfessor)
    };
  });

const doc = {
  set: {
    id: "se-exam1-full-practice",
    externalId: "se-exam1-full-practice",
    courseId: "software-engineering",
    title: "Exam 1 — Full Practice (Ch. 1–4)",
    description:
      "Full-length Software Engineering exam simulation built from the chapter 1–4 bank, including professor-priority questions.",
    difficulty: "Intermediate",
    estMinutes: 55,
    tags: ["exam-1", "chapters-1-4", "full-length", "professor-priority"],
    mode: "exam",
    timerDefaultMinutes: 55,
    questionCountTarget: 42,
    isExamSimulation: true
  },
  questions
};

fs.mkdirSync(path.dirname(outputPath), { recursive: true });
fs.writeFileSync(outputPath, `${JSON.stringify(doc, null, 2)}\n`, "utf8");

console.log(`Wrote ${questions.length} questions to ${outputPath}`);
