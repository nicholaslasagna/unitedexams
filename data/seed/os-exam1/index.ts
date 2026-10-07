import type { QuizSet } from "@/lib/types";
import { introductionQuestions, structureQuestions } from "./ch1-2";
import { processQuestions, threadQuestions } from "./ch3-4";
import { schedulingQuestions, synchronizationQuestions } from "./ch5-6";
import { operatingSystemsExam1Mock } from "./mock-exam";

const chapters = [
  { title: "Introduction", questions: introductionQuestions },
  { title: "OS Structure", questions: structureQuestions },
  { title: "Processes", questions: processQuestions },
  { title: "Threads", questions: threadQuestions },
  { title: "CPU Scheduling", questions: schedulingQuestions },
  { title: "Synchronization", questions: synchronizationQuestions }
];

const chapterPractice: QuizSet[] = chapters.map((chapter, index) => ({
  id: `os-exam1-chapter-${index + 1}`,
  courseId: "operating-systems",
  title: `Exam 1 Practice - Ch. ${index + 1}: ${chapter.title}`,
  description: "Slide exercises and additional exam-style questions, with source pages, explanations, code traces and worked solutions. Written answers are self-marked against the provided model.",
  difficulty: "Intermediate",
  estMinutes: 45,
  timerDefaultMinutes: 45,
  mode: "quiz",
  tags: ["exam-1", `chapter-${index + 1}`, "slide-practice"],
  questions: chapter.questions
}));

const fullBank = chapters.flatMap((chapter) => chapter.questions);

export const operatingSystemsExam1QuizSets: QuizSet[] = [
  {
    id: "os-exam1-complete-review",
    courseId: "operating-systems",
    title: "Exam 1 Complete Review - All 193 Questions",
    description: "Every slide exercise from all six decks, plus additional exam-style problems: 193 questions including 18 self-marked written responses. Choose 'Practice first - no timer' to work through the whole bank at your own pace. The guided exam option provides explanations and self-marking as you go, with a 120-minute practice clock. Use the Real Format mock for a timed run in the exam's actual format, with answers hidden.",
    difficulty: "Advanced",
    estMinutes: 240,
    timerDefaultMinutes: 120,
    mode: "exam",
    questionCountTarget: fullBank.length,
    isExamSimulation: true,
    tags: ["exam-1", "chapters-1-6", "slide-practice", "full-bank", "guided-review"],
    questions: fullBank
  },
  // The exam's real format, which replaced an earlier 48-question guess at it.
  operatingSystemsExam1Mock,
  ...chapterPractice,
  {
    id: "os-exam1-written-practice",
    courseId: "operating-systems",
    title: "Exam 1 Written Practice - Worked Problems",
    description: "18 written problems across chapters 1-6: OS design, process and thread code, CPU scheduling, semaphore protocols and synchronization. Work one at a time with progressive hints, model answers and walkthroughs; self-mark your reasoning.",
    difficulty: "Advanced",
    estMinutes: 120,
    timerDefaultMinutes: 120,
    mode: "homework",
    tags: ["exam-1", "chapters-1-6", "homework", "walkthrough"],
    questions: fullBank.filter((question) => question.type === "free")
  }
];
