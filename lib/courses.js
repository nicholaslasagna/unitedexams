// United Exams - Course Registry

window.UE_COURSES = [
  {
    id: "se",
    name: "Software Engineering",
    code: "CS 3365",
    icon: "code",
    color: "#2563eb",
    description: "Process models, agile methods, requirements engineering, and system architecture.",
    quizSets: [
      {
        id: "se-test1",
        name: "Test 1 Practice",
        subtitle: "Chapters 1-4",
        questionBankKey: "SE_TEST1_BANK",
        reinforceBankKey: "SE_TEST1_REINFORCE",
        config: {
          totalTime: 3600,
          chapters: [1, 2, 3, 4],
          chapterTargets: { 1: 7, 2: 8, 3: 7, 4: 7 },
          professorQuestions: true,
          freeResponseIncluded: true,
          maxQuestions: 29
        }
      },
      {
        id: "se-process-drill",
        name: "Process & Requirements Drill",
        subtitle: "Fast mixed practice",
        questionBankKey: "SE_TEST1_BANK",
        reinforceBankKey: "SE_TEST1_REINFORCE",
        config: {
          totalTime: 2100,
          chapters: [1, 2, 3, 4],
          chapterTargets: { 1: 4, 2: 4, 3: 4, 4: 4 },
          professorQuestions: false,
          freeResponseIncluded: false,
          maxQuestions: 16
        }
      }
    ],
    notesKey: "SE_NOTES"
  },
  {
    id: "diffeq",
    name: "Differential Equations",
    code: "MATH 3351",
    icon: "function",
    color: "#16a34a",
    description: "First-order ODEs, second-order linear equations, Laplace transforms, and systems.",
    quizSets: [
      {
        id: "diffeq-test1",
        name: "Test 1 Practice",
        subtitle: "First-order + second-order core",
        questionBankKey: "DIFFEQ_TEST1_BANK",
        reinforceBankKey: "DIFFEQ_TEST1_REINFORCE",
        config: {
          totalTime: 3600,
          chapters: [1, 2, 3],
          chapterTargets: { 1: 6, 2: 6, 3: 6 },
          professorQuestions: true,
          freeResponseIncluded: true,
          maxQuestions: 18
        }
      },
      {
        id: "diffeq-midterm-review",
        name: "Midterm Review Set",
        subtitle: "Chapters 1-4 cumulative",
        questionBankKey: "DIFFEQ_TEST1_BANK",
        reinforceBankKey: "DIFFEQ_TEST1_REINFORCE",
        config: {
          totalTime: 4200,
          chapters: [1, 2, 3, 4],
          chapterTargets: { 1: 5, 2: 6, 3: 5, 4: 4 },
          professorQuestions: true,
          freeResponseIncluded: true,
          maxQuestions: 20
        }
      }
    ],
    notesKey: "DIFFEQ_NOTES"
  },
  {
    id: "comparch",
    name: "Computer Architecture",
    code: "CS 3375",
    icon: "cpu",
    color: "#ea580c",
    description: "RISC-V ISA, datapath/control, pipelining, and memory hierarchy.",
    quizSets: [
      {
        id: "comparch-test1",
        name: "Test 1 Practice",
        subtitle: "ISA + datapath + pipeline",
        questionBankKey: "COMPARCH_TEST1_BANK",
        reinforceBankKey: "COMPARCH_TEST1_REINFORCE",
        config: {
          totalTime: 3600,
          chapters: [1, 2, 3],
          chapterTargets: { 1: 6, 2: 6, 3: 6 },
          professorQuestions: true,
          freeResponseIncluded: true,
          maxQuestions: 18
        }
      },
      {
        id: "comparch-midterm-2025s",
        name: "Midterm 2025S Drill",
        subtitle: "Assembly + encoding + hazards",
        questionBankKey: "COMPARCH_TEST1_BANK",
        reinforceBankKey: "COMPARCH_TEST1_REINFORCE",
        config: {
          totalTime: 3000,
          chapters: [2, 3],
          chapterTargets: { 2: 10, 3: 8 },
          professorQuestions: true,
          freeResponseIncluded: false,
          maxQuestions: 18
        }
      },
      {
        id: "comparch-memory-pipeline",
        name: "Pipeline & Cache Focus",
        subtitle: "Performance-centric drill",
        questionBankKey: "COMPARCH_TEST1_BANK",
        reinforceBankKey: "COMPARCH_TEST1_REINFORCE",
        config: {
          totalTime: 2400,
          chapters: [3, 4],
          chapterTargets: { 3: 8, 4: 8 },
          professorQuestions: false,
          freeResponseIncluded: false,
          maxQuestions: 16
        }
      }
    ],
    notesKey: "COMPARCH_NOTES"
  },
  {
    id: "automata",
    name: "Theory of Automata",
    code: "CS 3361",
    icon: "automata",
    color: "#0f766e",
    description: "Finite automata, regular languages, CFG/PDA, and Turing machine computability.",
    quizSets: [
      {
        id: "automata-test1",
        name: "Test 1 Practice",
        subtitle: "Regular languages + CFG fundamentals",
        questionBankKey: "AUTOMATA_TEST1_BANK",
        reinforceBankKey: "AUTOMATA_TEST1_REINFORCE",
        config: {
          totalTime: 3600,
          chapters: [1, 2, 3],
          chapterTargets: { 1: 6, 2: 6, 3: 6 },
          professorQuestions: true,
          freeResponseIncluded: true,
          maxQuestions: 18
        }
      },
      {
        id: "automata-hw1-hw2",
        name: "HW1 + HW2 Focus",
        subtitle: "Relations, regex, DFA/NFA construction",
        questionBankKey: "AUTOMATA_TEST1_BANK",
        reinforceBankKey: "AUTOMATA_TEST1_REINFORCE",
        config: {
          totalTime: 3000,
          chapters: [1, 2],
          chapterTargets: { 1: 8, 2: 10 },
          professorQuestions: true,
          freeResponseIncluded: false,
          maxQuestions: 18
        }
      },
      {
        id: "automata-computability",
        name: "Computability Review",
        subtitle: "Pumping lemma, reductions, decidability",
        questionBankKey: "AUTOMATA_TEST1_BANK",
        reinforceBankKey: "AUTOMATA_TEST1_REINFORCE",
        config: {
          totalTime: 2700,
          chapters: [2, 3, 4],
          chapterTargets: { 2: 6, 3: 5, 4: 7 },
          professorQuestions: false,
          freeResponseIncluded: false,
          maxQuestions: 18
        }
      }
    ],
    notesKey: "AUTOMATA_NOTES"
  }
];
