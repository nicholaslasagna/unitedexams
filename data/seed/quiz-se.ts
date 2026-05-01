import seExam1FullPractice from "@/content/software-engineering/se-exam1-full-practice.json";
import type { Question, QuizSet } from "@/lib/types";
import { softwareEngineeringArchitectureQuizSets } from "./quiz-se-architecture";
import { softwareEngineeringFinalQuizSets } from "./quiz-se-final";

interface JsonQuestion {
  id: string;
  externalId?: string;
  type: "single" | "multi" | "free";
  prompt: string;
  options?: string[];
  correct?: number[];
  explanation: string;
  solutionMd?: string;
  walkthroughSteps?: string[];
  references?: string[];
  tags?: string[];
  difficulty?: "easy" | "med" | "hard";
  homeworkFormat?: "short" | "multi-step" | "proof" | "calc";
  fromProfessor?: boolean;
}

interface JsonSet {
  id: string;
  externalId?: string;
  courseId: string;
  title: string;
  description: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced";
  estMinutes: number;
  tags: string[];
  mode: "quiz" | "exam" | "homework";
  timerDefaultMinutes: number;
  questionCountTarget?: number | null;
  isExamSimulation?: boolean;
}

interface JsonDocument {
  set: JsonSet;
  questions: JsonQuestion[];
}

const seExam1Doc = seExam1FullPractice as JsonDocument;

function toQuestion(question: JsonQuestion): Question {
  return {
    id: question.id,
    externalId: question.externalId,
    type: question.type,
    prompt: question.prompt,
    options: question.options,
    correct: question.correct,
    explanation: question.explanation,
    solutionMd: question.solutionMd,
    walkthroughSteps: question.walkthroughSteps,
    references: question.references,
    tags: question.tags ?? [],
    difficulty: question.difficulty,
    homeworkFormat: question.homeworkFormat,
    fromProfessor: question.fromProfessor
  };
}

function toSet(doc: JsonDocument): QuizSet {
  return {
    id: doc.set.id,
    externalId: doc.set.externalId,
    courseId: doc.set.courseId,
    title: doc.set.title,
    description: doc.set.description,
    difficulty: doc.set.difficulty,
    estMinutes: doc.set.estMinutes,
    tags: doc.set.tags,
    mode: doc.set.mode,
    timerDefaultMinutes: doc.set.timerDefaultMinutes,
    questionCountTarget: doc.set.questionCountTarget ?? null,
    isExamSimulation: Boolean(doc.set.isExamSimulation ?? doc.set.mode === "exam"),
    questions: doc.questions.map(toQuestion)
  };
}

const seExam1FullSet = toSet(seExam1Doc);

const focusedDrill: QuizSet = {
  id: "se-exam1-focused-drill",
  courseId: "software-engineering",
  title: "Exam 1 Focused Drill (12 Q)",
  description:
    "Short, high-yield chapter 1–4 drill for warmups before running the full exam simulation.",
  difficulty: "Intermediate",
  estMinutes: 20,
  tags: ["exam-1", "chapters-1-4", "focused-drill"],
  mode: "quiz",
  timerDefaultMinutes: 20,
  questions: seExam1FullSet.questions.slice(0, 12)
};

const chapterHomeworkWalkthrough: QuizSet = {
  id: "se-exam1-homework-walkthrough",
  courseId: "software-engineering",
  title: "Exam 1 Homework Walkthrough",
  description:
    "Step-by-step free-response reflections for chapters 1–4 concepts. Solve one prompt at a time with hints and full solutions.",
  difficulty: "Intermediate",
  estMinutes: 35,
  tags: ["homework", "exam-1", "walkthrough", "chapters-1-4"],
  mode: "homework",
  timerDefaultMinutes: 35,
  questions: [
    {
      id: "se-hw-walk-q1",
      type: "free",
      prompt:
        "Explain how you would choose between a plan-driven process and an agile process for a safety-critical hospital system.",
      explanation:
        "Safety-critical systems favor plan-driven rigor, traceability, and verification gates; agile can still be used at subsystem boundaries where change rate is high.",
      solutionMd:
        "A strong answer contrasts requirement stability, verification burden, regulation, and risk appetite. It then justifies a primarily plan-driven process with controlled iterative loops.",
      walkthroughSteps: [
        "State the decision factors: requirement volatility, regulation, risk, and auditability.",
        "Explain why safety-critical contexts prioritize traceability and formal verification.",
        "Note where agile can still help: UI refinements, tooling, or non-critical modules.",
        "Conclude with a justified hybrid/process recommendation."
      ],
      hintSteps: [
        "Mention regulation and auditability explicitly.",
        "Compare validation cadence between waterfall-like and agile iterations.",
        "Address maintainability and change handling."
      ],
      tags: ["chapter-2", "process-models", "risk"],
      homeworkFormat: "multi-step"
    },
    {
      id: "se-hw-walk-q2",
      type: "free",
      prompt:
        "A requirement says: \"The portal should feel fast.\" Rewrite it into one measurable system requirement and one validation test.",
      explanation:
        "Convert vague user language into measurable non-functional criteria and an executable acceptance test.",
      solutionMd:
        "Example requirement: \"95% of dashboard requests complete in under 2.0 seconds for 1,000 concurrent users.\" Example validation: run a load test with 1,000 virtual users and verify the percentile target.",
      walkthroughSteps: [
        "Identify that \"feel fast\" is vague and unverifiable.",
        "Translate it into measurable metrics: percentile, latency threshold, workload.",
        "Write an acceptance/validation procedure tied to the metric.",
        "Ensure pass/fail criteria are unambiguous."
      ],
      hintSteps: [
        "Use a percentile target (for example, p95).",
        "Specify load assumptions.",
        "Include a concrete pass/fail threshold."
      ],
      tags: ["chapter-4", "requirements", "validation"],
      homeworkFormat: "multi-step"
    },
    {
      id: "se-hw-walk-q3",
      type: "free",
      prompt:
        "Map one Scrum sprint cycle to the four core process activities (specification, development, validation, evolution).",
      explanation:
        "A sprint naturally contains all four activities, but with lightweight artifacts and frequent feedback loops.",
      solutionMd:
        "Specification: sprint planning + backlog refinement. Development: implementation during sprint. Validation: reviews/tests + sprint review. Evolution: backlog reprioritization based on feedback and retrospective actions.",
      walkthroughSteps: [
        "List the four process activities.",
        "For each activity, tie it to one Scrum event or artifact.",
        "Show the loop: review feedback drives backlog changes.",
        "Close by explaining why Scrum supports change better than one-pass models."
      ],
      hintSteps: [
        "Use sprint planning, sprint review, and retrospective as anchors.",
        "Mention backlog reprioritization for evolution.",
        "Mention testing in validation."
      ],
      tags: ["chapter-3", "scrum", "process-activities"],
      homeworkFormat: "multi-step"
    },
    {
      id: "se-hw-walk-q4",
      type: "free",
      prompt:
        "You discover two conflicting requirements in a spec. Write a mini resolution protocol a student team should follow.",
      explanation:
        "Conflict resolution should be traceable, stakeholder-driven, and testable after revision.",
      solutionMd:
        "A strong protocol: identify conflict IDs, gather stakeholders, analyze impact, decide priority/source of truth, update requirement text + trace links, then re-run validation checks.",
      walkthroughSteps: [
        "Identify and document both conflicting requirements with IDs.",
        "Call the right stakeholders and classify conflict type (functional, non-functional, policy).",
        "Resolve with priority/business rule and update the source specification.",
        "Re-validate consistency and traceability across downstream artifacts."
      ],
      hintSteps: [
        "Use requirement IDs and traceability.",
        "Include stakeholder sign-off.",
        "End with verification that contradiction is removed."
      ],
      tags: ["chapter-4", "requirements-management", "consistency"],
      homeworkFormat: "proof"
    }
  ]
};

export const softwareEngineeringQuizSets: QuizSet[] = [
  ...softwareEngineeringFinalQuizSets,
  ...softwareEngineeringArchitectureQuizSets,
  seExam1FullSet,
  focusedDrill,
  chapterHomeworkWalkthrough
];
