import type { QuizSet } from "@/lib/types";
import { introductionQuestions, structureQuestions } from "./ch1-2";
import { processQuestions, threadQuestions } from "./ch3-4";
import { schedulingQuestions, synchronizationQuestions } from "./ch5-6";

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

// Fixed chapter selection keeps every full mock balanced even when its order is shuffled.
const mockQuestions = chapters.flatMap((chapter) => chapter.questions.slice(0, 8));

export const operatingSystemsExam1QuizSets: QuizSet[] = [
  {
    id: "os-exam1-simulation",
    courseId: "operating-systems",
    title: "Exam 1 Practice - Chapters 1-6",
    description: "A balanced 48-question practice exam across all six supplied decks, including slide exercises, code concepts and scheduling calculations. Answers stay hidden during the timed run. Suggested timer: 90 minutes; the instructor's actual exam length and format were not supplied. Practice written responses separately in the Worked Problems homework set.",
    difficulty: "Advanced",
    estMinutes: 90,
    timerDefaultMinutes: 90,
    mode: "exam",
    questionCountTarget: mockQuestions.length,
    // The runner uses true for guided feedback; false keeps this mock's answers hidden.
    isExamSimulation: false,
    tags: ["exam-1", "chapters-1-6", "slide-practice"],
    questions: mockQuestions
  },
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
    questions: chapters.flatMap((chapter) => chapter.questions.filter((question) => question.type === "free"))
  }
];
