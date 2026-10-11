import type { QuizSet } from "@/lib/types";
import { lectureSqlQuestions, classActivityQuestions } from "./lecture-sql";
import { homeworkSqlQuestions } from "./homework-sql";
import { multiTableQuestions } from "./joins-sql";
import { schemaQuestions } from "./schema-practice";
import { databaseExam2Mocks } from "./mock-exam";

export { databaseExam2Mocks } from "./mock-exam";

export const databaseExam2PracticeSets: QuizSet[] = [
  {
    id: "db-exam2-lecture-practice",
    courseId: "database-systems",
    title: "Exam 2 - MySQL Lecture Practice",
    description: "Lectures 7-9: every unique numbered SELECT example, SQL syntax, DISTINCT, calculated columns, predicates, sorting, aggregates, GROUP BY and HAVING. Write SQL, then compare equivalent solutions against the worked answers.",
    difficulty: "Intermediate",
    estMinutes: 90,
    timerDefaultMinutes: 60,
    mode: "quiz",
    fixedOrder: true,
    tags: ["exam-2", "mysql", "lectures-7-9"],
    questions: lectureSqlQuestions
  },
  {
    id: "db-exam2-class-activity",
    courseId: "database-systems",
    title: "Exam 2 - Class Activity: Patterns, NULLs & Results",
    description: "All seven class activity tasks and their subparts: literal wildcards, exact-length patterns, missing values, parameter comparisons, counts, query repairs and inferring a sort. Includes the small input tables needed to work every problem.",
    difficulty: "Intermediate",
    estMinutes: 45,
    timerDefaultMinutes: 40,
    mode: "quiz",
    fixedOrder: true,
    tags: ["exam-2", "mysql", "class-activity"],
    questions: classActivityQuestions
  },
  {
    id: "db-exam2-homework-practice",
    courseId: "database-systems",
    title: "Exam 2 - Homework 2: SoccerHub & Broken SQL",
    description: "All eight SoccerHub queries and all ten broken-query diagnoses from Homework 2 Part 1. Model answers handle MySQL-specific behavior and explain ambiguous or impossible goals instead of inventing a correction.",
    difficulty: "Advanced",
    estMinutes: 120,
    timerDefaultMinutes: 90,
    mode: "quiz",
    fixedOrder: true,
    tags: ["exam-2", "mysql", "homework-2", "debugging"],
    questions: homeworkSqlQuestions
  },
  {
    id: "db-exam2-multi-table",
    courseId: "database-systems",
    title: "Exam 2 - Lecture 10: Subqueries & Joins",
    description: "Scalar and IN subqueries, two- and three-table joins, matching rows and query variants from Lecture 10. Extra problems practise join preservation and checking whether a subquery returns one value or a list.",
    difficulty: "Advanced",
    estMinutes: 60,
    timerDefaultMinutes: 50,
    mode: "quiz",
    fixedOrder: true,
    tags: ["exam-2", "mysql", "lecture-10", "subqueries", "joins"],
    questions: multiTableQuestions
  },
  {
    id: "db-exam2-schema-practice",
    courseId: "database-systems",
    title: "Exam 2 - Tables, Keys & MySQL Constraints",
    description: "Build the four SoccerHub tables, explain primary/foreign keys precisely, and connect Exam 1's library and join problems to SQL. Extra INSERT, UPDATE and DELETE drills are labelled as additional practice.",
    difficulty: "Intermediate",
    estMinutes: 50,
    timerDefaultMinutes: 45,
    mode: "quiz",
    fixedOrder: true,
    tags: ["exam-2", "mysql", "ddl", "constraints"],
    questions: schemaQuestions
  }
];

const fullBank = databaseExam2PracticeSets.flatMap((set) => set.questions);

export const databaseExam2QuizSets: QuizSet[] = [
  ...databaseExam2Mocks,
  ...databaseExam2PracticeSets,
  {
    id: "db-exam2-complete-review",
    courseId: "database-systems",
    title: `Exam 2 Complete MySQL Review - All ${fullBank.length} Problems`,
    description: "The entire Exam 2 practice bank, including all lecture SELECT examples, class activity tasks, Homework 2 queries/repairs, Lecture 10 and schema practice. No default timer or sampled subset: work through every problem with hints, source references and model answers. The separate mock papers hide answers until submission.",
    difficulty: "Advanced",
    estMinutes: 300,
    timerDefaultMinutes: 120,
    mode: "quiz",
    fixedOrder: true,
    questionCountTarget: fullBank.length,
    tags: ["exam-2", "mysql", "full-bank", "guided-review"],
    questions: fullBank
  }
];
