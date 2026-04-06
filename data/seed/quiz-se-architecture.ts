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

function makeSingleQuestion({
  id,
  prompt,
  options,
  correctIndex,
  explanation,
  hintSteps,
  walkthroughSteps,
  references,
  tags,
  difficulty = "med"
}: {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
  hintSteps: string[];
  walkthroughSteps: string[];
  references: string[];
  tags: string[];
  difficulty?: "easy" | "med" | "hard";
}): Question {
  return {
    id,
    type: "single",
    prompt,
    options,
    correct: [correctIndex],
    explanation,
    hintSteps,
    walkthroughSteps,
    references,
    tags: ["software-engineering", "exam-2", ...tags],
    difficulty,
    homeworkFormat: "short",
    fromProfessor: true
  };
}

function makeMultiQuestion({
  id,
  prompt,
  options,
  correct,
  explanation,
  hintSteps,
  walkthroughSteps,
  references,
  tags,
  difficulty = "med"
}: {
  id: string;
  prompt: string;
  options: string[];
  correct: number[];
  explanation: string;
  hintSteps: string[];
  walkthroughSteps: string[];
  references: string[];
  tags: string[];
  difficulty?: "easy" | "med" | "hard";
}): Question {
  return {
    id,
    type: "multi",
    prompt,
    options,
    correct,
    explanation,
    hintSteps,
    walkthroughSteps,
    references,
    tags: ["software-engineering", "exam-2", ...tags],
    difficulty,
    homeworkFormat: "short",
    fromProfessor: true
  };
}

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
  return makeSingleQuestion({
    id,
    prompt,
    options: [...architectureOptions],
    correctIndex,
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
    tags: ["chapter-6", "architecture", ...tags],
    difficulty
  });
}

const chapter5Questions: Question[] = [
  makeSingleQuestion({
    id: "se-exam2-ch5-q1",
    prompt:
      "Which UML diagram is best when you want to show external actors and the discrete tasks they perform with the system?",
    options: [
      "Use case diagram",
      "Sequence diagram",
      "Class diagram",
      "State machine diagram"
    ],
    correctIndex: 0,
    explanation:
      "Use case diagrams show the interactions between a system and its environment by focusing on actors and the use cases they participate in.",
    hintSteps: [
      "Ask whether the focus is external users/systems versus internal object messages.",
      "Use case diagrams stay high-level and actor-centered.",
      "Sequence diagrams are more detailed and time-ordered."
    ],
    walkthroughSteps: [
      "Identify the viewpoint: external actors interacting with the system boundary.",
      "That is exactly what a use case diagram is for.",
      "Eliminate sequence/class/state because they focus on messages, structure, or event states instead.",
      "Choose Use case diagram."
    ],
    references: ["Chapter 5 – UML diagram types", "Chapter 5 – Interaction models"],
    tags: ["chapter-5", "uml", "use-case", "interaction-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q2",
    prompt:
      "Which UML diagram is best when you need to show messages moving between actors and system objects in time order for one scenario?",
    options: [
      "Activity diagram",
      "Sequence diagram",
      "Context diagram",
      "Class diagram"
    ],
    correctIndex: 1,
    explanation:
      "Sequence diagrams show interactions between actors and system components, including the order of messages over time.",
    hintSteps: [
      "Look for time ordering and message exchange.",
      "Sequence diagrams place participants across the top and time moving downward.",
      "Activity diagrams are about process flow, not object messages."
    ],
    walkthroughSteps: [
      "The key clue is message sequence over time.",
      "Sequence diagrams use lifelines and arrows specifically for that purpose.",
      "Activity diagrams show workflow steps, not object-to-object message timing.",
      "Choose Sequence diagram."
    ],
    references: ["Chapter 5 – Sequence diagrams"],
    tags: ["chapter-5", "uml", "sequence-diagram", "interaction-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q3",
    prompt:
      "Which UML diagram is best for showing classes in a system and the associations between them?",
    options: [
      "Class diagram",
      "Use case diagram",
      "Activity diagram",
      "State machine diagram"
    ],
    correctIndex: 0,
    explanation:
      "Class diagrams are the structural UML diagram used to show classes and the relationships among those classes.",
    hintSteps: [
      "This is asking for the static object-oriented structure.",
      "Class diagrams are structural, not behavioral.",
      "Use case diagrams show actors, not classes."
    ],
    walkthroughSteps: [
      "Identify the goal: static classes plus their relationships.",
      "That is the definition of a class diagram.",
      "The other options describe behavior or external interaction instead.",
      "Choose Class diagram."
    ],
    references: ["Chapter 5 – Structural models", "Chapter 5 – Class diagrams"],
    tags: ["chapter-5", "uml", "class-diagram", "structural-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q4",
    prompt:
      "Which UML diagram is most appropriate for showing the steps in a business process or data-processing workflow?",
    options: [
      "Activity diagram",
      "State machine diagram",
      "Sequence diagram",
      "Use case diagram"
    ],
    correctIndex: 0,
    explanation:
      "Activity diagrams show the activities involved in a process or in data processing and are commonly used for business process models.",
    hintSteps: [
      "Look for process steps rather than object states or messages.",
      "Activity diagrams can also show parallel flows and swimlanes.",
      "State machines are event/state oriented instead."
    ],
    walkthroughSteps: [
      "The prompt is about workflow steps in a process.",
      "Activity diagrams are the UML tool for workflow and data-processing flow.",
      "State diagrams focus on event-triggered state changes, which is different.",
      "Choose Activity diagram."
    ],
    references: ["Chapter 5 – UML diagram types", "Chapter 5 – Activity diagrams"],
    tags: ["chapter-5", "uml", "activity-diagram", "behavioral-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q5",
    prompt:
      "Which UML diagram is best for showing how a single object or system changes state in response to internal or external events?",
    options: [
      "State machine diagram",
      "Class diagram",
      "Use case diagram",
      "Context diagram"
    ],
    correctIndex: 0,
    explanation:
      "State machine diagrams show system states as nodes and events as arcs, modeling how the system responds to stimuli.",
    hintSteps: [
      "The word 'events' is the biggest clue.",
      "States appear as rounded rectangles and transitions are triggered by events.",
      "Class diagrams are static, not event-driven."
    ],
    walkthroughSteps: [
      "The problem is asking for dynamic state changes caused by events.",
      "That is exactly the role of a state machine diagram.",
      "Eliminate class/use case/context because they do not model event-triggered state transitions.",
      "Choose State machine diagram."
    ],
    references: ["Chapter 5 – State machine models", "Chapter 5 – UML state diagrams"],
    tags: ["chapter-5", "uml", "state-machine", "behavioral-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q6",
    prompt:
      "A team wants to show what lies outside the system boundary and how the system sits among other systems and processes. Which model should they draw first?",
    options: [
      "Context diagram",
      "Sequence diagram",
      "Class diagram",
      "State machine diagram"
    ],
    correctIndex: 0,
    explanation:
      "Context models show the operational context of a system and what lies outside the system boundaries.",
    hintSteps: [
      "This is the external perspective, not the internal design.",
      "Ask what surrounds the system before asking how the inside works.",
      "Context diagrams are about boundaries and neighboring systems."
    ],
    walkthroughSteps: [
      "The question is about environment and boundary placement.",
      "That is the job of a context diagram/context model.",
      "Only after that would you move to interaction, structure, or state detail.",
      "Choose Context diagram."
    ],
    references: ["Chapter 5 – Context models", "Chapter 5 – System perspectives"],
    tags: ["chapter-5", "context-model", "external-perspective"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q7",
    prompt:
      "Which UML diagrams are specifically called out in Chapter 5 as interaction-model diagrams? Select all that apply.",
    options: [
      "Use case diagram",
      "Sequence diagram",
      "Class diagram",
      "Activity diagram"
    ],
    correct: [0, 1],
    explanation:
      "Interaction modeling in Chapter 5 uses use case diagrams for system-to-actor interaction and sequence diagrams for more detailed interaction between system components.",
    hintSteps: [
      "Interaction is not the same as structure or general workflow.",
      "Use case is high-level interaction; sequence is detailed interaction.",
      "Class is structural and activity is process/data flow."
    ],
    walkthroughSteps: [
      "Start by separating interaction models from structural and behavioral models.",
      "Use case diagrams model interactions between the system and external agents.",
      "Sequence diagrams model interactions between system components in more detail.",
      "Select Use case diagram and Sequence diagram only."
    ],
    references: ["Chapter 5 – Interaction models"],
    tags: ["chapter-5", "interaction-model", "uml"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q8",
    prompt:
      "In a use case diagram, what does an <<include>> relationship mean?",
    options: [
      "The included use case happens every time the base use case executes.",
      "The included use case is optional and only runs if a condition is met.",
      "The base use case inherits from the included use case.",
      "The actor may or may not communicate with the use case."
    ],
    correctIndex: 0,
    explanation:
      "Include means the base use case depends on the included use case and executes it every time in order to be complete.",
    hintSteps: [
      "Chapter 5 contrasts include with extend directly.",
      "Include is mandatory, extend is conditional.",
      "The dashed arrow points toward the included use case."
    ],
    walkthroughSteps: [
      "Remember the rule: include happens every time.",
      "That means the base use case requires the included behavior to finish correctly.",
      "Optional behavior belongs to extend, not include.",
      "Choose the mandatory-every-time option."
    ],
    references: ["Chapter 5 – Use case relationships"],
    tags: ["chapter-5", "use-case", "include"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q9",
    prompt:
      "In a use case diagram, what does an <<extend>> relationship mean?",
    options: [
      "The extending use case happens only sometimes, when certain criteria are met.",
      "The extending use case always runs before the base use case.",
      "The base use case becomes a subclass of the extending use case.",
      "The relationship only indicates actor participation."
    ],
    correctIndex: 0,
    explanation:
      "Extend represents optional behavior that occurs only under certain conditions; it does not happen every time the base use case executes.",
    hintSteps: [
      "Include is always; extend is conditional.",
      "The dashed arrow points toward the base use case.",
      "Think 'optional extra behavior.'"
    ],
    walkthroughSteps: [
      "Recall the chapter rule: extend only happens sometimes.",
      "That makes it the optional/conditional relationship.",
      "This is the opposite of include.",
      "Choose the conditional behavior option."
    ],
    references: ["Chapter 5 – Use case relationships"],
    tags: ["chapter-5", "use-case", "extend"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q10",
    prompt:
      "What is generalization in use case or actor modeling mainly used for?",
    options: [
      "To show specialization/inheritance where children share parent behavior and add detail.",
      "To force one use case to execute every time another runs.",
      "To show concurrent flows in an activity diagram.",
      "To represent a return message in a sequence diagram."
    ],
    correctIndex: 0,
    explanation:
      "Generalization reduces complexity by showing inheritance/specialization: child use cases or actors share common parent behavior and add their own details.",
    hintSteps: [
      "Chapter 5 explicitly says generalization is also called inheritance.",
      "Think parent/child, not mandatory execution.",
      "This applies to actors as well as use cases."
    ],
    walkthroughSteps: [
      "Start with the keyword inheritance.",
      "Generalization means one element specializes a more general parent.",
      "That parent-child sharing plus extra detail is the core idea.",
      "Choose the specialization/inheritance option."
    ],
    references: ["Chapter 5 – Use case relationships"],
    tags: ["chapter-5", "use-case", "generalization", "inheritance"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q11",
    prompt:
      "Which relationships are explicitly listed in Chapter 5 as class-diagram relationships? Select all that apply.",
    options: [
      "Association",
      "Generalization",
      "Aggregation",
      "Composition",
      "Include"
    ],
    correct: [0, 1, 2, 3],
    explanation:
      "Chapter 5 lists association, generalization, aggregation, and composition as class-diagram relationships. Include belongs to use case diagrams, not class diagrams.",
    hintSteps: [
      "Separate use case relationship words from class diagram relationship words.",
      "Include and extend are not structural class relationships.",
      "Class diagrams focus on static structure."
    ],
    walkthroughSteps: [
      "List the structural relationships first: association, generalization, aggregation, composition.",
      "Those are class-diagram relationships from the structural-model section.",
      "Reject include because it belongs to use case modeling.",
      "Select the four structural relationships only."
    ],
    references: ["Chapter 5 – Structural models", "Chapter 5 – Class diagrams"],
    tags: ["chapter-5", "class-diagram", "relationships", "structural-model"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q12",
    prompt:
      "Which statement correctly distinguishes data-driven and event-driven behavioral modeling?",
    options: [
      "Data-driven modeling is triggered by incoming data to be processed, while event-driven modeling is triggered by internal or external events.",
      "Data-driven modeling uses states and events, while event-driven modeling uses activities and workflows only.",
      "Data-driven and event-driven modeling are just two names for sequence diagrams.",
      "Event-driven modeling ignores stimulus from the environment and focuses only on stored data."
    ],
    correctIndex: 0,
    explanation:
      "Behavioral models in Chapter 5 distinguish stimuli of two types: data availability triggering processing, and events triggering system responses.",
    hintSteps: [
      "Chapter 5 defines both in the behavioral-model section.",
      "Activity diagrams are usually data-driven; state diagrams are event-driven.",
      "Do not confuse message order with stimulus type."
    ],
    walkthroughSteps: [
      "Identify what triggers system processing in each case.",
      "Data-driven means processing begins when data arrives.",
      "Event-driven means some event triggers the response.",
      "Choose the option that states exactly that distinction."
    ],
    references: ["Chapter 5 – Behavioral models", "Chapter 5 – Activity vs state diagrams"],
    tags: ["chapter-5", "behavioral-model", "data-driven", "event-driven"],
    difficulty: "med"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q13",
    prompt:
      "Which statements about model-driven engineering / model-driven architecture are correct according to Chapter 5? Select all that apply.",
    options: [
      "In MDE, models rather than programs are the principal outputs of development.",
      "A CIM models important domain abstractions without platform detail.",
      "A PIM models system operation without reference to a specific implementation platform.",
      "A PSM is a platform-specific transformation of the platform-independent model.",
      "Completely automated model-to-code translation is rarely possible in practice, and tool/translator cost can reduce cost-effectiveness.",
      "MDA guarantees that agile teams never need extra tooling or manual intervention."
    ],
    correct: [0, 1, 2, 3, 4],
    explanation:
      "Chapter 5 presents MDE/MDA as model-centered approaches using CIM/PIM/PSM abstractions, while also warning that automation is rarely complete and translator/tool costs can limit adoption.",
    hintSteps: [
      "Remember the three MDA model types: CIM, PIM, PSM.",
      "Chapter 5 explicitly says fully automated translation is rarely possible.",
      "The slides also say agile and MDA can be awkward together, not automatically solved."
    ],
    walkthroughSteps: [
      "Start with the core idea: MDE treats models as principal outputs.",
      "Then recall the model stack: CIM, PIM, PSM.",
      "Finally add the adoption caveat: translator/tool costs and incomplete automation.",
      "Reject the 'guarantees agile/no manual work' option because the slides say the opposite in practice."
    ],
    references: ["Chapter 5 – Model-driven engineering", "Chapter 5 – Model-driven architecture"],
    tags: ["chapter-5", "mde", "mda", "cim", "pim", "psm"],
    difficulty: "hard"
  })
];

const architectureQuestions: Question[] = [
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
];

const chapter6FundamentalsQuestions: Question[] = [
  makeMultiQuestion({
    id: "se-exam2-ch6-q1",
    prompt:
      "Which advantages of an explicit system architecture are named in Chapter 6? Select all that apply.",
    options: [
      "Stakeholder communication",
      "System analysis",
      "Large-scale reuse",
      "Guaranteed zero maintenance cost"
    ],
    correct: [0, 1, 2],
    explanation:
      "Chapter 6 gives three core benefits of explicit architecture: stakeholder communication, system analysis, and large-scale reuse.",
    hintSteps: [
      "Think of what architecture helps you do before the code exists.",
      "The slide names three benefits directly.",
      "Anything that sounds absolute or magical is probably wrong."
    ],
    walkthroughSteps: [
      "Recall the exact three benefits listed in the chapter.",
      "They are communication, analysis, and reuse.",
      "Architecture does not eliminate maintenance cost entirely.",
      "Select the first three options only."
    ],
    references: ["Chapter 6 – Advantages of using a system architecture"],
    tags: ["chapter-6", "architecture", "benefits"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch6-q2",
    prompt:
      "In the Chapter 6 box-and-line architectural notation, which statements are correct? Select all that apply.",
    options: [
      "Boxes represent system components.",
      "Nested boxes can represent subcomponents.",
      "Arrows can show data or control flow.",
      "Rounded rectangles always mean actors as in use case diagrams."
    ],
    correct: [0, 1, 2],
    explanation:
      "Chapter 6 uses simple box-and-line diagrams where boxes are components, nested boxes can show subcomponents, and arrows indicate data/control flow.",
    hintSteps: [
      "Do not import UML actor notation into architecture box-and-line diagrams.",
      "The point is coarse architectural communication, not UML purity.",
      "Remember boxes, nested boxes, arrows."
    ],
    walkthroughSteps: [
      "Start with the three symbols Chapter 6 explicitly names.",
      "Boxes are components.",
      "Nested boxes can show subcomponents, and arrows show data/control flow.",
      "Reject the actor statement because that belongs to UML use case notation, not architecture box-and-line notation."
    ],
    references: ["Chapter 6 – Box and line diagrams"],
    tags: ["chapter-6", "architecture", "symbols"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch6-q3",
    prompt:
      "Which non-functional requirements are explicitly highlighted in Chapter 6 as major architectural concerns? Select all that apply.",
    options: [
      "Performance",
      "Security",
      "Safety",
      "Availability",
      "Maintainability",
      "Usability"
    ],
    correct: [0, 1, 2, 3, 4],
    explanation:
      "Chapter 6 explicitly calls out performance, security, safety, availability, and maintainability as architectural concerns. Usability matters in software, but it is not in that named Chapter 6 list.",
    hintSteps: [
      "The chapter gives a five-item list.",
      "Do not add plausible extras that were not on the slide.",
      "Usability is important but not part of this exact list."
    ],
    walkthroughSteps: [
      "Recall the exact Chapter 6 list of non-functional concerns.",
      "It includes performance, security, safety, availability, and maintainability.",
      "Usability is not part of that exact chapter list.",
      "Select the first five options only."
    ],
    references: ["Chapter 6 – Architecture and system characteristics"],
    tags: ["chapter-6", "nfr", "quality-attributes"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q4",
    prompt:
      "A system reads large input files overnight, transforms them into reports and updated data files, and is primarily concerned with bulk batch runs rather than interactive sessions. Which Chapter 6 application type is this?",
    options: [
      "Data processing",
      "Transaction processing",
      "Event processing",
      "Language processing"
    ],
    correctIndex: 0,
    explanation:
      "Data processing applications focus on batch-style processing of input data to generate outputs or updated files.",
    hintSteps: [
      "The clue is batch input data and overnight runs.",
      "Transaction processing is request/response with integrity constraints.",
      "Language processing is compiler/interpreter work."
    ],
    walkthroughSteps: [
      "The scenario is centered on bulk data transformation rather than interactive requests.",
      "That matches data processing architecture.",
      "Reject transaction processing because there is no user transaction flow at the center of the description.",
      "Choose Data processing."
    ],
    references: ["Chapter 6 – Application architectures"],
    tags: ["chapter-6", "application-type", "data-processing"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q5",
    prompt:
      "A monitoring system waits for external sensor updates and then reacts as those events arrive. Which Chapter 6 application type is this?",
    options: [
      "Data processing",
      "Transaction processing",
      "Event processing",
      "Language processing"
    ],
    correctIndex: 2,
    explanation:
      "Event processing systems are driven by events arriving from the environment and react when those events occur.",
    hintSteps: [
      "The word event is not subtle here; incoming stimuli trigger the work.",
      "This is different from bulk batch data or formal language translation.",
      "Focus on reacting to arrivals in real time or near real time."
    ],
    walkthroughSteps: [
      "Identify what triggers the system: sensor events arriving from outside.",
      "That aligns directly with event processing.",
      "Data processing would emphasize batch datasets, not incoming event reactions.",
      "Choose Event processing."
    ],
    references: ["Chapter 6 – Application architectures"],
    tags: ["chapter-6", "application-type", "event-processing"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q6",
    prompt:
      "Which architectural response most directly supports availability according to Chapter 6?",
    options: [
      "Add redundancy and fault tolerance.",
      "Force every use case to include every subtask.",
      "Move all components into one central class diagram.",
      "Replace layers with a single massive module."
    ],
    correctIndex: 0,
    explanation:
      "Chapter 6 ties availability to redundancy and fault tolerance so the system can continue operating when components fail.",
    hintSteps: [
      "Availability is about staying up despite faults.",
      "Think architectural resilience, not UML notation.",
      "The chapter uses redundancy/fault tolerance language."
    ],
    walkthroughSteps: [
      "Availability means the system continues to provide service even when faults occur.",
      "Redundancy and fault tolerance are the Chapter 6 architectural tools for that.",
      "The other options are irrelevant or harmful to availability.",
      "Choose Add redundancy and fault tolerance."
    ],
    references: ["Chapter 6 – Architecture and system characteristics"],
    tags: ["chapter-6", "availability", "nfr"],
    difficulty: "med"
  })
];

const softwareEngineeringExam2FullSimulation: QuizSet = {
  id: "se-exam2-full-simulation",
  courseId: "software-engineering",
  title: "Exam 2 Full Simulation (Ch. 5 + 6)",
  description:
    "Full Software Engineering Exam 2 review built around the posted Chapters 5 and 6 scope: UML/system modeling, MDA, architectural patterns, and application types.",
  difficulty: "Advanced",
  estMinutes: 42,
  tags: ["exam-2", "chapter-5", "chapter-6", "uml", "architectural-design", "system-modeling"],
  mode: "exam",
  timerDefaultMinutes: 42,
  questionCountTarget: 26,
  isExamSimulation: true,
  questions: [
    ...chapter5Questions,
    ...chapter6FundamentalsQuestions,
    ...architectureQuestions.slice(0, 7)
  ]
};

const softwareEngineeringExam2SystemModelingDrill: QuizSet = {
  id: "se-exam2-system-modeling-drill",
  courseId: "software-engineering",
  title: "Exam 2 UML + System Modeling Drill",
  description:
    "Chapter 5 rapid drill covering UML diagram types, relationships, behavioral-model distinctions, and model-driven architecture.",
  difficulty: "Intermediate",
  estMinutes: 18,
  tags: ["exam-2", "chapter-5", "uml", "system-modeling", "focused-drill"],
  mode: "quiz",
  timerDefaultMinutes: 18,
  questions: chapter5Questions
};

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
  questions: architectureQuestions
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
  questions: architectureQuestions.slice(0, 10)
};

const softwareEngineeringExam2SystemModelingWalkthrough: QuizSet = {
  id: "se-exam2-system-modeling-walkthrough",
  courseId: "software-engineering",
  title: "Exam 2 UML + MDA Walkthrough",
  description:
    "Free-response walkthrough for Chapter 5 topics: diagram selection, use case relationships, class/state modeling, and model-driven architecture.",
  difficulty: "Advanced",
  estMinutes: 34,
  tags: ["exam-2", "chapter-5", "walkthrough", "uml", "mda"],
  mode: "homework",
  timerDefaultMinutes: 34,
  questions: [
    {
      id: "se-exam2-modeling-fr1",
      type: "free",
      prompt:
        "A professor asks you to show what lies outside the boundaries of a course-registration system before anyone starts drawing internal design. Explain which diagram you would choose first, what it should contain, and what it should not try to show yet.",
      explanation:
        "Start with a context diagram because it shows the external perspective: neighboring systems, users, and boundaries. It should not try to show internal object messages or class structure yet.",
      solutionMd:
        "A strong answer says to draw a **context diagram** first. It should show the course-registration system in its environment, including outside actors/systems such as students, professors, payment systems, email services, and registrar databases. It should make the system boundary explicit. It should **not** yet try to show sequence messages, classes, or state transitions because those belong to interaction, structural, or behavioral models that come later.",
      sampleAnswer:
        "I would start with a context diagram. It should show the course-registration system boundary and the outside systems or actors around it. I would not try to show internal classes, messages, or states yet because the goal is only to establish the external perspective.",
      hintSteps: [
        "Think external perspective first.",
        "Ask what surrounds the system, not how the inside works.",
        "Mention the system boundary explicitly."
      ],
      walkthroughSteps: [
        "Step 1: Name the external-perspective model: context diagram.",
        "Step 2: Say what belongs on it: outside actors, neighboring systems, boundary.",
        "Step 3: Say what does not belong yet: internal classes, messages, or state transitions.",
        "Step 4: Close by explaining why this is the first model drawn."
      ],
      references: ["Chapter 5 – Context models"],
      tags: ["chapter-5", "context-model", "diagram-selection"],
      difficulty: "med",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-modeling-fr2",
      type: "free",
      prompt:
        "Write a short exam-ready explanation of include, extend, and generalization in use case modeling. Your answer should also mention arrow direction or inheritance meaning where relevant.",
      explanation:
        "Include is mandatory every time and points to the included use case. Extend is optional/conditional and points to the base use case. Generalization shows inheritance/specialization between parent and child use cases or actors.",
      solutionMd:
        "A strong answer says: **include** means the base use case always uses the included use case, so the dashed arrow points toward the included use case. **Extend** means optional behavior that happens only when certain conditions hold, and the dashed arrow points toward the base use case. **Generalization** means inheritance/specialization: a child use case or actor shares the common parent behavior but adds more specific behavior.",
      sampleAnswer:
        "Include happens every time and points to the included use case. Extend happens only sometimes and points back to the base use case. Generalization means parent-child inheritance where the child specializes the parent.",
      hintSteps: [
        "Include = always.",
        "Extend = conditional.",
        "Generalization = inheritance."
      ],
      walkthroughSteps: [
        "Step 1: State the mandatory versus optional difference between include and extend.",
        "Step 2: Add the arrow-direction detail for include and extend.",
        "Step 3: Define generalization as inheritance/specialization.",
        "Step 4: Mention that generalization can apply to actors too."
      ],
      references: ["Chapter 5 – Use case relationships"],
      tags: ["chapter-5", "use-case", "include", "extend", "generalization"],
      difficulty: "med",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-modeling-fr3",
      type: "free",
      prompt:
        "Explain the difference between a use case diagram and a sequence diagram. Then say when each one is the better exam answer.",
      explanation:
        "Use case diagrams are high-level interaction models between the system and external actors. Sequence diagrams show detailed time-ordered message interactions between actors and system objects/components.",
      solutionMd:
        "A strong answer says a **use case diagram** gives a high-level view of discrete tasks involving actors and the system, so it is best when the exam asks who interacts with the system and what tasks they perform. A **sequence diagram** is better when the exam asks for the detailed order of messages or calls between objects/components during one scenario. Sequence diagrams add timing/order detail that use case diagrams deliberately leave out.",
      sampleAnswer:
        "Use case diagrams are actor-centered and high-level. Sequence diagrams are object/message-centered and time-ordered. If the question asks who does what with the system, use a use case diagram. If it asks for message order during one scenario, use a sequence diagram.",
      hintSteps: [
        "High-level actor tasks versus detailed message order.",
        "Use case = external interaction overview.",
        "Sequence = internal interaction detail over time."
      ],
      walkthroughSteps: [
        "Step 1: Define use case diagrams as high-level actor/system interaction views.",
        "Step 2: Define sequence diagrams as detailed time-ordered message interaction views.",
        "Step 3: State the decision rule: who/tasks -> use case, messages/order -> sequence.",
        "Step 4: Mention that they are interaction models at different levels of detail."
      ],
      references: ["Chapter 5 – Interaction models", "Chapter 5 – Sequence diagrams"],
      tags: ["chapter-5", "use-case", "sequence-diagram", "interaction-model"],
      difficulty: "med",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-modeling-fr4",
      type: "free",
      prompt:
        "You are asked to sketch the beginning of a class diagram for a university registration system. Explain which classes you would start with and what relationships you would expect to show between them.",
      explanation:
        "Start with the major domain entities such as Student, Professor, Course, and Section/Class. Then show their structural relationships such as associations and, if relevant, generalization between professor types.",
      solutionMd:
        "A strong answer starts with domain classes like **Student**, **Professor**, **Course**, and a class representing **Class/Section/Registration**. It may also include **Activity** if the scenario requires it. Then it explains relationships: students register for classes/courses, professors teach classes/courses, and professor types such as adjunct/full-time can use **generalization**. The goal is to show the static structure and associations, not the runtime order of messages.",
      sampleAnswer:
        "I would start with Student, Professor, Course, and Section/Class because they are the core domain entities. Then I would show associations such as students registering for sections and professors teaching sections. If the scenario distinguishes professor types, I would use generalization for adjunct and full-time professors.",
      hintSteps: [
        "Think static domain nouns first.",
        "Class diagrams show structure, not time order.",
        "Use associations and generalization where they fit the scenario."
      ],
      walkthroughSteps: [
        "Step 1: Identify the major domain classes from the problem statement.",
        "Step 2: Add the key associations between those classes.",
        "Step 3: Mention generalization if the domain includes specialized types.",
        "Step 4: Close by stating that the diagram is structural and static."
      ],
      references: ["Chapter 5 – Class diagrams", "Chapter 5 – University Registration example"],
      tags: ["chapter-5", "class-diagram", "structural-model", "domain-modeling"],
      difficulty: "hard",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-modeling-fr5",
      type: "free",
      prompt:
        "Explain the difference between data-driven and event-driven behavioral modeling, and name the UML diagram that best fits each one.",
      explanation:
        "Data-driven behavioral modeling is triggered by data arriving for processing and is typically shown with activity diagrams. Event-driven behavioral modeling is triggered by events and is typically shown with state machine diagrams.",
      solutionMd:
        "A strong answer says **data-driven** behavioral models begin when some data arrives and needs to be processed, so **activity diagrams** are a natural fit because they show process steps and flows. **Event-driven** behavioral models begin when an internal or external event occurs, so **state machine diagrams** are the better fit because they show states and event-triggered transitions between them.",
      sampleAnswer:
        "Data-driven means processing starts because data arrives; activity diagrams fit that. Event-driven means some event triggers a response; state machine diagrams fit that because they show states and event-triggered transitions.",
      hintSteps: [
        "Trigger type is the key difference.",
        "Activity diagrams map well to process/data flow.",
        "State diagrams map well to event/state transitions."
      ],
      walkthroughSteps: [
        "Step 1: Define what triggers each behavioral model type.",
        "Step 2: Pair data-driven with activity diagrams.",
        "Step 3: Pair event-driven with state machine diagrams.",
        "Step 4: Explain why those pairings make sense."
      ],
      references: ["Chapter 5 – Behavioral models", "Chapter 5 – Activity diagrams", "Chapter 5 – State machine models"],
      tags: ["chapter-5", "behavioral-model", "activity-diagram", "state-machine"],
      difficulty: "med",
      homeworkFormat: "multi-step",
      fromProfessor: true
    },
    {
      id: "se-exam2-modeling-fr6",
      type: "free",
      prompt:
        "Give an exam-ready explanation of model-driven engineering / model-driven architecture that includes CIM, PIM, PSM, and at least two disadvantages or adoption barriers.",
      explanation:
        "MDE/MDA raises the abstraction level by treating models as primary outputs, but it depends on tools and translators, and full automation is rarely complete in practice.",
      solutionMd:
        "A strong answer says **MDE** treats models rather than programs as the principal outputs of development. **MDA** is the model-focused design/implementation subset that uses UML-based models at different levels of abstraction. The three model types are **CIM** (domain/computation-independent model), **PIM** (platform-independent model describing system operation), and **PSM** (platform-specific model derived for a target platform). Important disadvantages include the cost of creating/adapting translators, limited tool availability, incomplete automation in practice, extra manual coding, and tension with agile's preference for less up-front modeling.",
      sampleAnswer:
        "MDE makes models the main development output, and MDA uses CIM, PIM, and PSM abstractions to move toward implementation. CIM captures the domain, PIM captures system behavior without platform details, and PSM adds platform-specific detail. Major drawbacks are tool/translator cost, limited automation in practice, and mismatch with some agile workflows.",
      hintSteps: [
        "Name all three model levels.",
        "Say what each level abstracts.",
        "Do not forget the practical drawbacks."
      ],
      walkthroughSteps: [
        "Step 1: Define MDE/MDA as model-centered development.",
        "Step 2: Name CIM, PIM, and PSM with one short definition each.",
        "Step 3: Add at least two practical drawbacks from the slides.",
        "Step 4: Close by noting that complete automation is rare in practice."
      ],
      references: ["Chapter 5 – Model-driven engineering", "Chapter 5 – Model-driven architecture"],
      tags: ["chapter-5", "mde", "mda", "cim", "pim", "psm"],
      difficulty: "hard",
      homeworkFormat: "multi-step",
      fromProfessor: true
    }
  ]
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
  softwareEngineeringExam2FullSimulation,
  softwareEngineeringExam2SystemModelingDrill,
  softwareEngineeringExam2ArchitectureSimulation,
  softwareEngineeringExam2ArchitectureFocusedDrill,
  softwareEngineeringExam2SystemModelingWalkthrough,
  softwareEngineeringExam2ArchitectureWalkthrough
];
