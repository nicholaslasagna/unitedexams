import type { QuizSet } from "@/lib/types";
import { foundationQuestions } from "./foundations";
import { sortingHashingQuestions } from "./sorting-hashing";
import { dynamicProgrammingQuestions } from "./dynamic-programming";
import { algorithmsExam1Mock } from "./mock-exam";

export { algorithmsExam1Mock } from "./mock-exam";

export const algorithmsExam1PracticeSets: QuizSet[] = [
  {
    id: "alg-exam1-foundations",
    courseId: "analysis-of-algorithms",
    title: "Foundations — Homework 1 and Lectures 1–8",
    description: "Every Homework 1 subpart, then lecture exercises and related practice in loop counts, asymptotic proofs, substitution, recursion trees, the Master Theorem and divide-and-conquer. Full derivations and source references distinguish assigned problems from additional variations.",
    difficulty: "Advanced",
    estMinutes: 180,
    timerDefaultMinutes: 90,
    mode: "quiz",
    fixedOrder: true,
    questionCountTarget: foundationQuestions.length,
    tags: ["exam-1", "algorithms", "foundations", "homework-1"],
    questions: foundationQuestions
  },
  {
    id: "alg-exam1-sorting-hashing",
    courseId: "analysis-of-algorithms",
    title: "Sorting, Selection and Hashing — Homework 2 and Lectures 9–15",
    description: "Every Homework 2 subpart, Lecture 11's exercises, and lecture-based tracing and proofs: partition, quicksort, radix/counting sort, median-of-medians, hash functions and collision resolution. Implementation conventions and source caveats are explicit.",
    difficulty: "Advanced",
    estMinutes: 210,
    timerDefaultMinutes: 90,
    mode: "quiz",
    fixedOrder: true,
    questionCountTarget: sortingHashingQuestions.length,
    tags: ["exam-1", "algorithms", "sorting", "selection", "hashing", "homework-2"],
    questions: sortingHashingQuestions
  },
  {
    id: "alg-exam1-dynamic-programming",
    courseId: "analysis-of-algorithms",
    title: "Dynamic Programming — Projected Edit Distance and Lecture 16 LCS",
    description: "The photographed esteban → stephen distance-and-direction table, its recurrence and traceback, plus Lecture 16's ABCBDAB/BDCABA LCS table, proof and reconstruction. Additional variations help practise the method without memorizing only a final answer.",
    difficulty: "Advanced",
    estMinutes: 90,
    timerDefaultMinutes: 75,
    mode: "quiz",
    fixedOrder: true,
    questionCountTarget: dynamicProgrammingQuestions.length,
    tags: ["exam-1", "algorithms", "dynamic-programming", "class-review", "lcs"],
    questions: dynamicProgrammingQuestions
  }
];

const fullBank = algorithmsExam1PracticeSets.flatMap((set) => set.questions);
const priorityQuestions = [
  ...dynamicProgrammingQuestions.filter((q) => [
    "alg-e1-dp-edit-table",
    "alg-e1-dp-edit-recurrence",
    "alg-e1-dp-edit-cell",
    "alg-e1-dp-edit-traceback"
  ].includes(q.id)),
  ...foundationQuestions.filter((q) => q.tags.includes("homework-1")),
  ...sortingHashingQuestions.filter((q) => q.tags.includes("homework-2"))
];

export const algorithmsExam1PrioritySet: QuizSet = {
  id: "alg-exam1-priority",
  courseId: "analysis-of-algorithms",
  title: "Start Here — Homework and Projected Review",
  description: "Your professor said to study the homework and projected questions. Start with four drills on the supplied edit-distance review, then work every Homework 1 and Homework 2 subpart. These have the strongest direct evidence as study targets. The photograph shows one projected example; the exact exam questions and coverage remain unconfirmed.",
  difficulty: "Advanced",
  estMinutes: 240,
  timerDefaultMinutes: 90,
  mode: "quiz",
  fixedOrder: true,
  questionCountTarget: priorityQuestions.length,
  tags: ["exam-1", "algorithms", "priority", "homework-1", "homework-2", "class-review"],
  questions: priorityQuestions
};

export const algorithmsExam1QuizSets: QuizSet[] = [
  algorithmsExam1PrioritySet,
  ...algorithmsExam1PracticeSets,
  {
    id: "alg-exam1-complete-review",
    courseId: "analysis-of-algorithms",
    title: `Algorithms Exam 1 Complete Review — All ${fullBank.length} Problems`,
    description: "The full source-based practice bank from the supplied lectures, both homework prompts and projected edit-distance review, with worked answers, hints and rubrics. Study mode has no timer and includes every problem; the separate priority set follows the professor's stated guidance.",
    difficulty: "Advanced",
    estMinutes: 480,
    timerDefaultMinutes: 120,
    mode: "quiz",
    fixedOrder: true,
    questionCountTarget: fullBank.length,
    tags: ["exam-1", "algorithms", "full-bank"],
    questions: fullBank
  },
  algorithmsExam1Mock
];
