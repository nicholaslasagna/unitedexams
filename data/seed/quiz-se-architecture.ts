import type { Question, QuizSet } from "@/lib/types";

const architectureOptions = [
  "Model-View-Controller (MVC)",
  "Layered architecture",
  "Repository architecture",
  "Client-server architecture",
  "Pipe-and-filter architecture",
  "Transaction processing architecture",
  "Language processing architecture"
];

function makeArchitectureQuestion({
  id,
  prompt,
  correctIndex,
  explanation,
  clue,
  contrast,
  tags,
  difficulty = "med"
}: {
  id: string;
  prompt: string;
  correctIndex: number;
  explanation: string;
  clue: string;
  contrast: string;
  tags: string[];
  difficulty?: "easy" | "med" | "hard";
}): Question {
  return {
    id,
    type: "single",
    prompt,
    options: [...architectureOptions],
    correct: [correctIndex],
    explanation,
    hintSteps: [
      "Classify the scenario first: UI separation, layers, shared repository, network services, staged transforms, transaction handling, or language translation.",
      `Highest-signal clue: ${clue}`,
      `Best elimination move: ${contrast}`
    ],
    walkthroughSteps: [
      `Start with the strongest clue in the scenario: ${clue}`,
      `That clue points to ${architectureOptions[correctIndex]} because ${explanation.toLowerCase()}`,
      `Eliminate the nearest distractor: ${contrast}`,
      `Select ${architectureOptions[correctIndex]}.`
    ],
    references: ["Chapter 6 – Architectural Design"],
    tags: ["chapter-6", "exam-2", "architecture", ...tags],
    difficulty,
    homeworkFormat: "short",
    fromProfessor: true
  };
}

const softwareEngineeringExam2ArchitectureSimulation: QuizSet = {
  id: "se-exam2-architecture-practice",
  courseId: "software-engineering",
  title: "Exam 2 — Architecture Recognition Simulation (Ch. 6)",
  description:
    "Scenario-driven Software Engineering Exam 2 simulation focused on identifying architecture styles and application architectures from the exact Chapter 6 cues.",
  difficulty: "Advanced",
  estMinutes: 32,
  tags: ["exam-2", "chapter-6", "architectural-design", "architecture-identification", "a-g-options"],
  mode: "exam",
  timerDefaultMinutes: 32,
  questionCountTarget: 16,
  isExamSimulation: true,
  questions: [
    makeArchitectureQuestion({
      id: "se-exam2-arch-q1",
      prompt:
        "A web-based application separates the system data, the screen representation of that data, and the code that handles user input such as clicks and key presses. Which architecture is this?",
      correctIndex: 0,
      explanation:
        "it separates presentation and interaction from system data, which is the defining idea of MVC",
      clue: "presentation, interaction, and data are split into three collaborating parts",
      contrast:
        "Layered architecture separates service levels for the whole system; MVC specifically separates model, view, and controller around UI/data interaction.",
      tags: ["mvc", "ui"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q2",
      prompt:
        "A system is organized into layers. Each layer provides services to the layer above it, and only the adjacent lower layer should normally be used. Which architecture is this?",
      correctIndex: 1,
      explanation:
        "it organizes related functionality into layers that provide services upward through maintained interfaces",
      clue: "services are organized by levels and adjacent layers matter",
      contrast:
        "MVC is about separating user interaction from data; this question is about whole-system service levels and layer interfaces.",
      tags: ["layered", "structure"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q3",
      prompt:
        "An IDE contains many independent tools. They do not communicate directly with each other; instead, they all read and write shared design information in one central store. Which architecture is this?",
      correctIndex: 2,
      explanation:
        "all data is managed in a central repository and components interact through that shared store rather than directly",
      clue: "central shared data store used by otherwise independent tools",
      contrast:
        "Client-server is about remote service delivery across a network; repository is about shared system data as the interaction center.",
      tags: ["repository", "shared-data"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q4",
      prompt:
        "Users interact through browsers or local apps, while distinct servers deliver shared services across a network. Which architecture is this?",
      correctIndex: 3,
      explanation:
        "the functionality is organized into network-accessed services consumed by clients",
      clue: "clients consume services delivered from servers over a network",
      contrast:
        "Transaction processing is an application type about user requests and database integrity; client-server is the distribution style described here.",
      tags: ["client-server", "distributed"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q5",
      prompt:
        "Invoice data flows through a sequence of small processing steps. Each step performs one transformation and passes output to the next stage. Which architecture is this?",
      correctIndex: 4,
      explanation:
        "the system is organized as discrete transformations connected in sequence, where output from one stage becomes input to the next",
      clue: "sequential transformations connected by data flow",
      contrast:
        "Language processing systems may use staged phases too, but this question is explicitly asking for the transformation pattern itself.",
      tags: ["pipe-and-filter", "staged-processing"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q6",
      prompt:
        "Users make asynchronous requests to query or update a shared database. A transaction manager ensures correctness and database integrity. Which architecture is this?",
      correctIndex: 5,
      explanation:
        "the defining feature is processing user transactions against a database while preserving integrity",
      clue: "user requests plus transaction manager plus shared database",
      contrast:
        "Client-server may also appear in deployment, but the core application structure being tested is transaction processing.",
      tags: ["transaction-processing", "database"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q7",
      prompt:
        "A compiler accepts a formal language, tokenizes it, parses it, checks semantics, and produces another representation of that language. Which architecture is this?",
      correctIndex: 6,
      explanation:
        "it translates an input language into another internal or output representation, which is the defining idea of a language processing system",
      clue: "formal language input is translated into another representation",
      contrast:
        "Pipe-and-filter can describe how phases are organized, but the application type itself is language processing.",
      tags: ["language-processing", "compiler"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q8",
      prompt:
        "You expect multiple future ways to view and interact with the same underlying data, and you want the data representation to change independently from the interface. Which architecture is the best fit?",
      correctIndex: 0,
      explanation:
        "mvc is used when there are multiple ways to view and interact with the same data and when future presentation needs may evolve",
      clue: "multiple views of the same data with interface evolution expected",
      contrast:
        "Layered architecture helps large-scale separation of concerns, but it does not specifically target multiple representations of one data model.",
      tags: ["mvc", "changeability"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q9",
      prompt:
        "Which architecture is commonly used when development is spread across several teams, each responsible for one level of functionality, and when multi-level security is a concern?",
      correctIndex: 1,
      explanation:
        "layered architecture supports team-by-layer responsibility and is a standard fit for multi-level security",
      clue: "several teams own separate levels and security is layered by depth",
      contrast:
        "Repository centralizes data, but it does not give the same service-level separation or adjacent-layer structure.",
      tags: ["layered", "security"],
      difficulty: "hard"
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q10",
      prompt:
        "Which architecture makes components largely independent because they only need to know the shared data model, but suffers from a single point of failure in the central data store?",
      correctIndex: 2,
      explanation:
        "repository architecture centralizes all system data, making components independent while making the repository itself critical",
      clue: "components are independent because the repository is the only shared dependency",
      contrast:
        "Client-server has servers as service providers; repository is specifically about centralized shared data management.",
      tags: ["repository", "tradeoffs"],
      difficulty: "hard"
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q11",
      prompt:
        "Which architecture's main disadvantages include network-dependent performance and the possibility that each service can become a single point of failure?",
      correctIndex: 3,
      explanation:
        "client-server systems depend on the network and each service/server can fail or be attacked independently",
      clue: "performance depends on the network and services run on separate servers",
      contrast:
        "Repository has one central store as a single point of failure; this question is about distributed services over a network.",
      tags: ["client-server", "tradeoffs"],
      difficulty: "hard"
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q12",
      prompt:
        "Which architecture is best suited to batch-style data processing but is usually a poor fit for highly interactive systems?",
      correctIndex: 4,
      explanation:
        "pipe-and-filter architectures shine when data can be processed stage by stage, but interactive control flow is awkward in that model",
      clue: "batch-style sequential transformations are easy; highly interactive behavior is not",
      contrast:
        "Language processing may use pipeline phases, but the architecture style being described is the transformation pipeline itself.",
      tags: ["pipe-and-filter", "tradeoffs"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q13",
      prompt:
        "An online shopping site or hotel reservation system is being classified by generic application architecture. Which option fits best?",
      correctIndex: 5,
      explanation:
        "these are classic transaction processing systems because they process user requests against persistent shared information with integrity constraints",
      clue: "user-driven requests read and update persistent business data",
      contrast:
        "Client-server may still be used to deploy it, but the generic application type is transaction processing.",
      tags: ["transaction-processing", "application-architecture"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q14",
      prompt:
        "A command interpreter or compiler is being classified by generic application architecture. Which option fits best?",
      correctIndex: 6,
      explanation:
        "these systems interpret or translate a formal language into another form or into actions, which is exactly language processing",
      clue: "formal language in, internal representation or execution out",
      contrast:
        "Pipe-and-filter may be one implementation pattern for the phases, but the application category is language processing.",
      tags: ["language-processing", "application-architecture"]
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q15",
      prompt:
        "Critical assets should be protected in the innermost part of the system, while outer parts provide broader services and interfaces. Which architecture best matches that security guidance?",
      correctIndex: 1,
      explanation:
        "layered architecture is the standard recommendation when critical assets should be protected in inner layers",
      clue: "protect the most critical assets in inner layers",
      contrast:
        "Repository centralizes data, but the slide guidance for security specifically points to layered architecture.",
      tags: ["layered", "nfr-security"],
      difficulty: "hard"
    }),
    makeArchitectureQuestion({
      id: "se-exam2-arch-q16",
      prompt:
        "Large amounts of information are generated by one component and then reused by other tools over time, so explicit point-to-point data transfer would be wasteful. Which architecture best fits?",
      correctIndex: 2,
      explanation:
        "repository architecture is most common when large amounts of shared data need long-term storage and reuse by many components",
      clue: "large shared data reused by many tools over time",
      contrast:
        "Pipe-and-filter passes data from one stage to the next; repository keeps it centrally available to all relevant components.",
      tags: ["repository", "reuse"],
      difficulty: "hard"
    })
  ]
};

const softwareEngineeringExam2ArchitectureFocusedDrill: QuizSet = {
  id: "se-exam2-architecture-focused-drill",
  courseId: "software-engineering",
  title: "Exam 2 Architecture A-G Drill",
  description:
    "Fast recognition drill for the exact Chapter 6 architecture-identification style.",
  difficulty: "Intermediate",
  estMinutes: 14,
  tags: ["exam-2", "chapter-6", "focused-drill", "a-g-options"],
  mode: "quiz",
  timerDefaultMinutes: 14,
  questions: softwareEngineeringExam2ArchitectureSimulation.questions.slice(0, 10)
};

const softwareEngineeringExam2ArchitectureWalkthrough: QuizSet = {
  id: "se-exam2-architecture-walkthrough",
  courseId: "software-engineering",
  title: "Exam 2 Architecture Walkthrough",
  description:
    "Free-response architecture classification walkthrough focused on justifying why one architecture fits and why the distractors do not.",
  difficulty: "Advanced",
  estMinutes: 30,
  tags: ["exam-2", "chapter-6", "walkthrough", "architecture"],
  mode: "homework",
  timerDefaultMinutes: 30,
  questions: [
    {
      id: "se-exam2-arch-fr1",
      type: "free",
      prompt:
        "You are given a scenario question on the exam and seven choices: MVC, Layered, Repository, Client-server, Pipe-and-filter, Transaction processing, Language processing. Write a decision process you would use to choose the right answer in under one minute.",
      explanation:
        "The best approach is to classify the question by its dominant clue: UI separation, layers, shared data, network services, staged transforms, transactions, or language translation.",
      solutionMd:
        "A strong answer says: first determine whether the question is about a pattern/style or an application type. Then look for one dominant clue. UI/data separation points to MVC. Service levels and adjacent layers point to layered. Central shared data points to repository. Distributed services over a network point to client-server. Sequential transformations point to pipe-and-filter. User requests against a shared database point to transaction processing. Formal-language translation points to language processing. Then eliminate the closest distractor explicitly.",
      sampleAnswer:
        "I would first decide whether the scenario is mainly about UI separation, layers, shared repository data, networked services, staged transforms, transaction handling, or language translation. Then I would match the strongest clue to one option and explicitly eliminate the nearest distractor so I do not get trapped by overlap.",
      hintSteps: [
        "Use one dominant clue, not every small detail.",
        "Separate implementation pattern from application type.",
        "Always eliminate the nearest distractor before locking in the answer."
      ],
      walkthroughSteps: [
        "Step 1: Ask what the scenario is really centered on: UI structure, system layers, shared data, network services, transformation stages, transactions, or language translation.",
        "Step 2: Match that center clue to the architecture family.",
        "Step 3: Eliminate the most tempting distractor by explaining why it is related but not the best answer.",
        "Step 4: State the final answer in the form 'This is X because ..., not Y because ...'."
      ],
      references: ["Chapter 6 – Architectural Design"],
      tags: ["chapter-6", "decision-process", "exam-strategy"],
      difficulty: "med",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-arch-fr2",
      type: "free",
      prompt:
        "An exam question describes a browser-based system with a web server, application server, and database server. Explain when the best answer is Client-server, and why Layered might still appear as a distractor.",
      explanation:
        "Client-server is correct when the question emphasizes distributed services and networked clients. Layered may still exist inside the servers, but that is a secondary internal organization.",
      solutionMd:
        "Answer Client-server when the scenario emphasizes clients accessing remote services across a network. Mention that layered organization may still exist inside the application server or system internals, but the architectural clue being tested is distribution across client and server roles.",
      sampleAnswer:
        "If the question stresses browsers/apps talking to servers over a network, I should answer Client-server. Layered might still be true internally, but it is not the main clue being tested.",
      hintSteps: [
        "Ask whether the question is about distribution or internal organization.",
        "Networked clients are the key clue.",
        "Layered is a plausible distractor because multitier systems often contain both ideas."
      ],
      walkthroughSteps: [
        "Identify the main architectural clue: distributed roles across clients and servers.",
        "State that this directly matches client-server architecture.",
        "Acknowledge that layered structure may exist within a server-side implementation.",
        "Conclude that the exam answer should follow the dominant clue, which is client-server."
      ],
      references: ["Chapter 6 – Client-server architecture", "Chapter 6 – Web-based information systems"],
      tags: ["chapter-6", "client-server", "layered", "distractors"],
      difficulty: "med",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-arch-fr3",
      type: "free",
      prompt:
        "Explain how to distinguish Repository architecture from Pipe-and-filter architecture on an exam, even though both involve components passing or sharing data.",
      explanation:
        "Repository is about many components sharing one central long-lived data store. Pipe-and-filter is about ordered transformations where data flows stage to stage.",
      solutionMd:
        "Say that repository architecture centralizes all shared data and components communicate through that store. Pipe-and-filter instead organizes discrete transformations in sequence, where each stage consumes input and produces output for the next. The clue for repository is one central data source; the clue for pipe-and-filter is ordered staged processing.",
      sampleAnswer:
        "Repository means shared central data. Pipe-and-filter means sequential transformations. If the scenario says all tools depend on one common store, answer Repository. If it says output of one stage becomes input of the next, answer Pipe-and-filter.",
      hintSteps: [
        "Repository = central store.",
        "Pipe-and-filter = stage-by-stage flow.",
        "Look for whether components are independent around one database or chained in order."
      ],
      walkthroughSteps: [
        "First ask whether the system has one shared long-lived repository.",
        "If yes, that is repository architecture.",
        "If instead the emphasis is on a sequence of processing stages, that is pipe-and-filter.",
        "State one concrete clue for each so the distinction is exam-ready."
      ],
      references: ["Chapter 6 – Repository pattern", "Chapter 6 – Pipe and filter pattern"],
      tags: ["chapter-6", "repository", "pipe-and-filter", "comparison"],
      difficulty: "hard",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-arch-fr4",
      type: "free",
      prompt:
        "Write a short explanation of how non-functional requirements can push you toward one architecture and away from another. Use security, performance, and maintainability as your three examples.",
      explanation:
        "Architecture selection is tied to non-functional requirements: layered helps security, larger localized components can help performance, and finer-grained self-contained components help maintainability.",
      solutionMd:
        "A strong answer says architecture should depend on non-functional requirements. For security, layered architecture can protect critical assets in inner layers. For performance, localizing operations and reducing communication can help, often with larger-grained components. For maintainability, finer-grained self-contained components are easier to change. Also mention that these can conflict, so architects often choose a compromise.",
      sampleAnswer:
        "Architecture is not chosen only from functional behavior. Security often pushes toward layered protection, performance pushes toward less communication and sometimes larger components, and maintainability pushes toward smaller self-contained components. Those goals can conflict, so architecture is usually a negotiated compromise.",
      hintSteps: [
        "Use the slide examples directly.",
        "Mention at least one conflict between NFRs.",
        "Do not write this as if one architecture always wins."
      ],
      walkthroughSteps: [
        "State that architecture choice depends heavily on non-functional requirements.",
        "Use security -> layered protection of critical assets.",
        "Use performance -> localize operations and reduce communication overhead.",
        "Use maintainability -> fine-grained self-contained components, then close with the idea of compromise."
      ],
      references: ["Chapter 6 – Architecture and system characteristics"],
      tags: ["chapter-6", "nfr", "security", "performance", "maintainability"],
      difficulty: "hard",
      homeworkFormat: "multi-step",
      fromProfessor: true
    }
  ]
};

export const softwareEngineeringArchitectureQuizSets: QuizSet[] = [
  softwareEngineeringExam2ArchitectureSimulation,
  softwareEngineeringExam2ArchitectureFocusedDrill,
  softwareEngineeringExam2ArchitectureWalkthrough
];
