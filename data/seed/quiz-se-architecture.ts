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

function padExamStyleOptions(
  questions: Question[],
  pads: Record<string, string[]>,
  targetCount = 7
): Question[] {
  return questions.map((question) => {
    if (!question.options || question.options.length >= targetCount) return question;

    const extras = pads[question.id];
    if (!extras || extras.length === 0) return question;

    const nextOptions = [...question.options];
    const seen = new Set(
      nextOptions.map((option) =>
        option
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, " ")
          .trim()
      )
    );

    for (const extra of extras) {
      const normalized = extra
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, " ")
        .trim();
      if (!seen.has(normalized)) {
        nextOptions.push(extra);
        seen.add(normalized);
      }
      if (nextOptions.length >= targetCount) break;
    }

    return nextOptions.length === question.options.length ? question : { ...question, options: nextOptions };
  });
}

const chapter5QuestionsBase: Question[] = [
  makeSingleQuestion({
    id: "se-exam2-ch5-q1",
    prompt:
      'What is "system modeling," and how can it help us?',
    options: [
      "It is the process of coding and implementing software components to verify design efficiency.",
      "It uses mathematical equations to test system performance under high load conditions.",
      "It involves collecting user feedback after deployment to improve usability.",
      "It is the process of creating abstract models of a system to understand its functionality and communicate with customers.",
      "It is a project management activity used to track progress and deadlines."
    ],
    correctIndex: 3,
    explanation:
      "System modeling is the process of developing abstract models of a system. Those models help analysts understand functionality and communicate with customers.",
    hintSteps: [
      "Think abstraction, not implementation.",
      "The goal is understanding and communication.",
      "UML is the usual notation in this chapter."
    ],
    walkthroughSteps: [
      "Start by identifying what modeling does: it abstracts the system.",
      "That abstraction helps analysts understand functionality before building everything.",
      "The same models are also used to communicate with customers and stakeholders.",
      "Choose the abstract-models-for-understanding-and-communication answer."
    ],
    references: ["Chapter 5 – System modeling"],
    tags: ["chapter-5", "system-modeling", "foundations"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q2",
    prompt:
      "Which of the following diagrams represents the structure of a system in terms of objects, attributes, associations, and operations?",
    options: [
      "Use case diagrams",
      "Sequence diagrams",
      "Class diagrams",
      "State diagrams",
      "Activity diagrams"
    ],
    correctIndex: 2,
    explanation:
      "Class diagrams model the static structure of a system by showing classes, attributes, operations, and the relationships among those classes.",
    hintSteps: [
      "This is structural, not behavioral.",
      "Think classes, attributes, operations, relationships.",
      "Use case and sequence diagrams are interaction models instead."
    ],
    walkthroughSteps: [
      "The key words are objects, attributes, associations, and operations.",
      "Those are exactly the elements represented in a class diagram.",
      "The other UML diagrams focus on actors, messages, workflow, or state changes.",
      "Choose Class diagrams."
    ],
    references: ["Chapter 5 – Structural models", "Chapter 5 – Class diagrams"],
    tags: ["chapter-5", "class-diagram", "structural-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q3",
    prompt:
      "Sometimes a context diagram is used to represent a system. What characteristics are shown in a context model?",
    options: [
      "How a software interacts with its components",
      "Shows the states of the system",
      "Activities involved in a process or data processing",
      "How external entities interact with an internal software system",
      "Functional behavior of the system as seen by the user"
    ],
    correctIndex: 3,
    explanation:
      "A context model shows the external perspective: how outside actors or systems interact with the system boundary.",
    hintSteps: [
      "Context means outside the boundary.",
      "This is not about internal states or workflow steps.",
      "Focus on external entities and the internal system."
    ],
    walkthroughSteps: [
      "A context model asks what surrounds the system and interacts with it.",
      "That is the external/system-boundary perspective.",
      "It does not show detailed internal components, states, or workflows.",
      "Choose the option about external entities interacting with an internal software system."
    ],
    references: ["Chapter 5 – Context models", "Lecture review image – context model question"],
    tags: ["chapter-5", "context-model", "external-perspective", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q4",
    prompt: "In a context diagram, what does the circle symbol represent?",
    options: [
      "External entity",
      "Process",
      "Flow line",
      "External system",
      "Use case"
    ],
    correctIndex: 1,
    explanation:
      "In the class slides, the single circle in the context diagram represents the process for the whole system.",
    hintSteps: [
      "There is only one system-level process in these context examples.",
      "Entities sit outside; the circle is the system process.",
      "Arrows/lines are the flows."
    ],
    walkthroughSteps: [
      "Recall the basic context-diagram legend from the slide.",
      "External entities sit outside the process.",
      "The circle stands for the whole system as one process.",
      "Choose Process."
    ],
    references: ["Chapter 5 – Context diagram legend", "Chapter 5 – Mentcare context diagram"],
    tags: ["chapter-5", "context-model", "symbols"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q5",
    prompt:
      'Which of the following diagrams can be used to represent an "interaction model"? (Select all that apply)',
    options: [
      "State diagram",
      "Class diagram",
      "Use case diagrams",
      "Sequence diagrams",
      "Context diagrams",
      "Solid diagrams"
    ],
    correct: [2, 3],
    explanation:
      "Chapter 5 interaction modeling uses use case diagrams for actor/system interaction and sequence diagrams for more detailed component interaction.",
    hintSteps: [
      "Interaction is not structure and not context.",
      "One diagram is actor/task focused, the other is message/time focused.",
      "Class and state diagrams belong to different perspectives."
    ],
    walkthroughSteps: [
      "Separate interaction models from context, structural, and behavioral models.",
      "Use case diagrams model interactions between a system and external agents.",
      "Sequence diagrams model interactions between system components over time.",
      "Select Use case diagrams and Sequence diagrams only."
    ],
    references: ["Chapter 5 – Interaction models"],
    tags: ["chapter-5", "interaction-model", "uml"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q6",
    prompt: "Which of the following statements is true about use cases?",
    options: [
      "Use cases are used to represent the status of an object.",
      "Use cases are used to represent structure of components.",
      "Use cases are used to represent output of a system.",
      "Use cases are used to represent maintainability of a system.",
      "Use cases are used to represent functional requirements."
    ],
    correctIndex: 4,
    explanation:
      "Use case modeling was originally developed to support requirements elicitation, so use cases represent functional requirements from the actor's point of view.",
    hintSteps: [
      "Use cases came from requirements work.",
      "Actors initiate use cases to access system functionality.",
      "They are not object-status or component-structure diagrams."
    ],
    walkthroughSteps: [
      "Ask what use cases are fundamentally for.",
      "They describe system behavior as seen from an actor's perspective.",
      "That means they capture functional requirements.",
      "Choose the functional-requirements statement."
    ],
    references: ["Chapter 5 – Use case modeling", "Chapter 5 – Functional requirements"],
    tags: ["chapter-5", "use-case", "requirements"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q7",
    prompt: "Which basic UML shape is used to indicate a use case?",
    options: [
      "Ellipse (oval)",
      "Stick figure",
      "Rectangle with class compartments",
      "Circle process",
      "Rounded rectangle state"
    ],
    correctIndex: 0,
    explanation:
      "A use case is drawn as an ellipse/oval. Actors are the stick figures outside the system boundary.",
    hintSteps: [
      "Separate the actor symbol from the use case symbol.",
      "The use case itself is a task bubble, not a box.",
      "Class and state notation use different shapes."
    ],
    walkthroughSteps: [
      "Use case diagrams have two iconic shapes: actors and use cases.",
      "Actors are stick figures.",
      "The use case itself is the oval/ellipse.",
      "Choose Ellipse (oval)."
    ],
    references: ["Chapter 5 – UML use case diagrams"],
    tags: ["chapter-5", "use-case", "symbols"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q8",
    prompt:
      "We learned about several relationships associated with use cases. Select all the relationships that are associated with use cases.",
    options: [
      "Include",
      "Association",
      "Inheritance",
      "Extend",
      "Range",
      "Postcondition"
    ],
    correct: [0, 1, 2, 3],
    explanation:
      "The use case relationships emphasized in class are association, include, extend, and inheritance/generalization.",
    hintSteps: [
      "Ignore documentation words like postcondition.",
      "Range is not a UML use case relationship.",
      "Inheritance here means generalization."
    ],
    walkthroughSteps: [
      "List the actual use case relationships from the lecture.",
      "They are association, include, extend, and inheritance/generalization.",
      "Range and postcondition are distractors from other contexts.",
      "Select Include, Association, Inheritance, and Extend."
    ],
    references: ["Chapter 5 – Use case relationships"],
    tags: ["chapter-5", "use-case", "relationships"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q9",
    prompt: 'What does an "alternative frame" symbolize in a sequence diagram?',
    options: [
      "Show when and how long an object is performing a process",
      "Show the information being sent between objects",
      "If-else logic",
      "Represents a return message",
      "Shows existence of an object or actor over time"
    ],
    correctIndex: 2,
    explanation:
      "The alt frame in a sequence diagram represents alternative control paths, which is the UML way to show if/else logic in that scenario.",
    hintSteps: [
      "Think branching behavior inside a scenario.",
      "This is not the activation box or the lifeline.",
      "Alternative frame means alternate path."
    ],
    walkthroughSteps: [
      "Sequence diagrams can include frames for special control structures.",
      "The alt frame is used when one of multiple alternative branches can occur.",
      "That is equivalent to if-else logic.",
      "Choose If-else logic."
    ],
    references: ["Chapter 5 – Sequence diagrams", "Chapter 5 – alt frames"],
    tags: ["chapter-5", "sequence-diagram", "symbols"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q10",
    prompt: "Which visibility mapping is correct for UML class-diagram notation?",
    options: [
      "+ public, - private, # protected",
      "+ private, - public, # protected",
      "+ protected, - private, # public",
      "+ public, - protected, # private"
    ],
    correctIndex: 0,
    explanation:
      "In UML class diagrams, `+` means public, `-` means private, and `#` means protected.",
    hintSteps: [
      "This is pure notation recall.",
      "Public is the plus sign.",
      "Protected is the hash sign."
    ],
    walkthroughSteps: [
      "Recall the three visibility markers from the homework feedback.",
      "`+` means public.",
      "`-` means private and `#` means protected.",
      "Choose the first mapping."
    ],
    references: ["Chapter 5 – Class notation", "Homework 5 review – class visibility"],
    tags: ["chapter-5", "class-diagram", "symbols", "visibility"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q11",
    prompt: 'Which symbol is used to represent the "aggregation" relationship in a class diagram?',
    options: [
      "Hollow diamond",
      "Filled diamond",
      "Dashed arrow labeled <<include>>",
      "Open triangle arrow"
    ],
    correctIndex: 0,
    explanation:
      "Aggregation in a class diagram is shown with a hollow diamond. Composition uses the filled diamond.",
    hintSteps: [
      "Aggregation and composition are easy to swap.",
      "Aggregation is the weaker whole-part relation.",
      "That weaker relation uses the open/hollow diamond."
    ],
    walkthroughSteps: [
      "Start by separating aggregation from composition.",
      "Aggregation uses the hollow/open diamond.",
      "Composition is the filled diamond, so that option is the distractor.",
      "Choose Hollow diamond."
    ],
    references: ["Chapter 5 – Class diagram relationships", "Homework 5 review – aggregation"],
    tags: ["chapter-5", "class-diagram", "aggregation"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q12",
    prompt:
      "Multiplicity notation indicates the number of instances of one class linked to one instance of another class. What does the multiplicity `6..*` indicate?",
    options: [
      "Exactly six",
      "Six objects",
      "Up to six",
      "Six or more",
      "Zero to six"
    ],
    correctIndex: 3,
    explanation:
      "`6..*` means the lower bound is six and the upper bound is unbounded, so the relationship allows six or more instances.",
    hintSteps: [
      "Look at the lower bound and the star separately.",
      "The star means no fixed upper limit.",
      "So the only certain minimum is six."
    ],
    walkthroughSteps: [
      "Read the notation as lower bound to upper bound.",
      "The lower bound is six.",
      "The star means many/unbounded above.",
      "Choose Six or more."
    ],
    references: ["Chapter 5 – Multiplicity notation", "Homework 5 review – multiplicity"],
    tags: ["chapter-5", "class-diagram", "multiplicity"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q13",
    prompt:
      "Behavioral models represent the dynamic behavior of a system during execution. Which of the following stimuli can trigger a system? (Select all that apply)",
    options: [
      "Events",
      "Data",
      "Object",
      "Classes",
      "Data type"
    ],
    correct: [0, 1],
    explanation:
      "Chapter 5 says behavioral models can be driven either by data that arrives for processing or by events that stimulate a response.",
    hintSteps: [
      "The chapter names exactly two stimulus categories.",
      "They are not object-oriented nouns like class or object.",
      "Think trigger types."
    ],
    walkthroughSteps: [
      "Behavioral models start from a stimulus.",
      "The two stimulus types emphasized in the chapter are data and events.",
      "Object, class, and data type are distractors here.",
      "Select Events and Data."
    ],
    references: ["Chapter 5 – Behavioral models"],
    tags: ["chapter-5", "behavioral-model", "stimuli"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q14",
    prompt:
      "Which of the following diagrams can be used to describe how a system behaves in response to events?",
    options: [
      "Data diagram",
      "Control diagram",
      "State diagram",
      "Context diagram",
      "Class diagram"
    ],
    correctIndex: 2,
    explanation:
      "State diagrams / state machine diagrams model how a system behaves in response to internal or external events.",
    hintSteps: [
      "The keyword is events.",
      "Behavior over changing states points to the state machine model.",
      "Class and context diagrams are not event-response models."
    ],
    walkthroughSteps: [
      "The question is asking for event-driven behavior.",
      "State diagrams are specifically used for event-triggered state changes.",
      "The other options are structural or irrelevant distractors.",
      "Choose State diagram."
    ],
    references: ["Chapter 5 – State machine diagrams"],
    tags: ["chapter-5", "state-machine", "events"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch5-q15",
    prompt:
      'Which of the following statements are true about "model-driven architecture"? (Select all that apply)',
    options: [
      "Model-driven architecture is used to determine the accessibility of the information contained in classes.",
      "Model-driven architecture shows how classes are composed of other classes.",
      "Model-driven architecture focuses on the design and implementation stages of software development.",
      "Model-driven architecture can express the different states of your objects and how the states will change.",
      "Model-driven architecture will try to generate executable code by sending a platform-specific model through a translator tool.",
      "Model-driven architecture only shows flow from one activity to another activity."
    ],
    correct: [2, 4],
    explanation:
      "MDA focuses on the design and implementation stages and tries to move models toward executable code through transformations. The other options describe class, state, or activity modeling instead.",
    hintSteps: [
      "Keep MDA separate from class diagrams, state diagrams, and activity diagrams.",
      "One true statement is about design/implementation scope.",
      "The other true statement is about code generation from platform-specific models."
    ],
    walkthroughSteps: [
      "Reject the options that are really about class accessibility, class composition, object states, or activity flow.",
      "Keep the statements that match the actual purpose of MDA.",
      "Those are the design/implementation focus and the model-to-code transformation goal.",
      "Select the third and fifth statements."
    ],
    references: ["Chapter 5 – Model-driven architecture", "Homework 5 review – MDA"],
    tags: ["chapter-5", "mda", "mde"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q16",
    prompt:
      "(True/False) In model-driven architecture, the final output it tries to obtain is an executable code.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "MDA raises the abstraction level through models, but its downstream goal is still to transform those models toward implementation and executable code.",
    hintSteps: [
      "The question is asking about the end target, not the intermediate artifacts.",
      "MDA still points toward implementation.",
      "The model chain ends in executable code."
    ],
    walkthroughSteps: [
      "MDA starts with models at different abstraction levels.",
      "Those models are transformed toward a platform-specific form.",
      "The overall goal of that chain is executable code.",
      "Choose True."
    ],
    references: ["Chapter 5 – Model-driven architecture", "Lecture review image – MDA true/false"],
    tags: ["chapter-5", "mda", "mde", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch5-q17",
    prompt: "Which list names the three model types recommended by model-driven architecture (MDA)?",
    options: [
      "CIM, PIM, PSM",
      "DFD, ERD, PSM",
      "Context model, interaction model, architecture model",
      "Use case model, sequence model, class model"
    ],
    correctIndex: 0,
    explanation:
      "The three MDA model types are the Computation-Independent Model (CIM), Platform-Independent Model (PIM), and Platform-Specific Model (PSM).",
    hintSteps: [
      "One is domain/computation independent.",
      "One is platform independent.",
      "One is platform specific."
    ],
    walkthroughSteps: [
      "Recall the three abstraction levels from the slide.",
      "They are computation-independent, platform-independent, and platform-specific.",
      "That corresponds to CIM, PIM, and PSM.",
      "Choose CIM, PIM, PSM."
    ],
    references: ["Chapter 5 – Types of models in MDA"],
    tags: ["chapter-5", "mda", "cim", "pim", "psm"],
    difficulty: "med"
  })
];

const chapter5OptionPads: Record<string, string[]> = {
  "se-exam2-ch5-q1": [
    "It focuses on documenting only database schemas for storage design.",
    "It is mainly used after deployment to measure user adoption."
  ],
  "se-exam2-ch5-q2": ["Context diagrams", "Deployment diagrams"],
  "se-exam2-ch5-q3": [
    "How data moves through a transformation pipeline",
    "How classes inherit from one another"
  ],
  "se-exam2-ch5-q4": ["Data store", "Actor"],
  "se-exam2-ch5-q6": [
    "Use cases are used to represent non-functional quality attributes.",
    "Use cases are used to describe detailed message timing between objects."
  ],
  "se-exam2-ch5-q7": ["Hexagon component", "Diamond relationship symbol"],
  "se-exam2-ch5-q9": ["Shows an included use case", "Represents a state transition"],
  "se-exam2-ch5-q10": [
    "+ private, - protected, # public",
    "+ protected, - public, # private",
    "+ private, - public, # protected"
  ],
  "se-exam2-ch5-q11": ["Solid association line only", "Crow's foot cardinality", "Circle process node"],
  "se-exam2-ch5-q12": ["Any number from zero upward", "Between six and seven"],
  "se-exam2-ch5-q14": ["Sequence diagram", "Use case diagram"],
  "se-exam2-ch5-q17": ["PIM, PSM, MVC", "CIM, UML, DFD", "CIM, PSM, ERD"]
};

const chapter5Questions = padExamStyleOptions(chapter5QuestionsBase, chapter5OptionPads);

const architectureQuestions: Question[] = [
  makeMultiQuestion({
    id: "se-exam2-arch-q0",
    prompt:
      "Architectural patterns/styles provide guidance on the situations in which a specific architectural pattern should be used. Several architectural patterns were introduced in this chapter. List all of them:",
    options: [
      "Class view",
      "Client-server",
      "Logical filter",
      "Layered",
      "Pipes and filters",
      "Development view",
      "Repository",
      "Model-view-controllers"
    ],
    correct: [1, 3, 4, 6, 7],
    explanation:
      "The architectural patterns introduced in Chapter 6 are Client-server, Layered, Pipes and filters, Repository, and Model-view-controller. The lecture slide spells the final option as 'Model-view-controllers,' but it is referring to MVC. Class view and Development view are views, and Logical filter is not one of the chapter's named patterns.",
    hintSteps: [
      "Separate architecture patterns from architecture views.",
      "The actual pattern list from the chapter is five items long.",
      "Class view and Development view are distractors, not patterns."
    ],
    walkthroughSteps: [
      "Start by recalling the named Chapter 6 patterns.",
      "They are Client-server, Layered, Pipes and filters, Repository, and Model-view-controller.",
      "Reject Class view and Development view because they are views rather than patterns.",
      "Reject Logical filter because the chapter names Pipe-and-filter/Pipes and filters instead."
    ],
    references: ["Chapter 6 – Architectural patterns", "Lecture review slide – list all patterns"],
    tags: ["chapter-6", "architecture", "patterns", "final-review"],
    difficulty: "easy"
  }),
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

const chapter6FundamentalsQuestionsBase: Question[] = [
  makeSingleQuestion({
    id: "se-exam2-ch6-q1",
    prompt: 'Why do software engineers use "architectural design"?',
    options: [
      "To define the overall structure and organization of a system, link requirements to implementation, and reason about qualities like safety, availability, performance, security, and maintainability.",
      "To eliminate the need for requirements engineering and system analysis.",
      "To decide on private versus public class attributes.",
      "To replace stakeholder communication with automatic code generation."
    ],
    correctIndex: 0,
    explanation:
      "Architectural design identifies the main structural components and their relationships. It is the critical link between requirements and implementation and supports quality-attribute reasoning.",
    hintSteps: [
      "Think structure and organization first.",
      "Architecture sits between requirements and implementation.",
      "The answer should mention large-scale qualities, not class-level details."
    ],
    walkthroughSteps: [
      "Start with what architecture does: it defines the main structural components and relationships.",
      "Then connect it to requirements and implementation.",
      "Finally, include the non-functional qualities it helps engineers evaluate.",
      "Choose the long structure-and-quality-focused answer."
    ],
    references: ["Chapter 6 – Architectural design", "Homework 6 review – architectural design"],
    tags: ["chapter-6", "architecture", "foundations"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q2",
    prompt:
      "Which symbol is used to represent a component in a system architecture?",
    options: [
      "Stick figure actor",
      "Ellipse use case",
      "Box / rectangular block",
      "Circle process",
      "Dashed message arrow"
    ],
    correctIndex: 2,
    explanation:
      "In the Chapter 6 architectural notation, each box in the diagram represents a component. Nested boxes show subcomponents.",
    hintSteps: [
      "Do not import UML use case or context symbols into architecture diagrams.",
      "Architecture in this class uses simple box-and-line notation.",
      "Components are blocks."
    ],
    walkthroughSteps: [
      "Chapter 6 architecture diagrams are simple block diagrams.",
      "Each box represents a component.",
      "Actors, ellipses, and circles belong to other modeling notations.",
      "Choose Box / rectangular block."
    ],
    references: ["Chapter 6 – Block diagrams", "Homework 6 review – component symbol"],
    tags: ["chapter-6", "architecture", "symbols"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q3",
    prompt: "How does architectural design help stakeholders?",
    options: [
      "Stakeholders use it to write code.",
      "Stakeholders use it to design class diagrams.",
      "It helps improve communication.",
      "Stakeholders use it to run the program."
    ],
    correctIndex: 2,
    explanation:
      "An explicit system architecture gives stakeholders a shared high-level picture of the system, which improves communication and understanding.",
    hintSteps: [
      "This is one of the named benefits from the chapter.",
      "Think shared understanding before implementation.",
      "The right answer is about communication."
    ],
    walkthroughSteps: [
      "Architecture gives a common high-level representation of the system.",
      "That shared representation helps different stakeholders discuss the system coherently.",
      "The chapter explicitly lists stakeholder communication as a benefit.",
      "Choose Help improve communication."
    ],
    references: ["Chapter 6 – Advantages of using a system architecture"],
    tags: ["chapter-6", "architecture", "communication"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q4",
    prompt:
      "(True/False) An architectural diagram of a system shows the detailed relationships between components.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Architectural diagrams are intentionally high-level. They show organization and interaction at a coarse level, not detailed class/message relationships.",
    hintSteps: [
      "Architecture is coarse-grained communication.",
      "Detailed relationships belong to lower-level models.",
      "This statement overclaims the level of detail."
    ],
    walkthroughSteps: [
      "Architecture diagrams show structure and organization broadly.",
      "They do not try to capture detailed relationships the way more detailed design models do.",
      "That makes the statement false.",
      "Choose False."
    ],
    references: ["Chapter 6 – Architectural views", "Homework 6 review – T/F"],
    tags: ["chapter-6", "architecture", "views"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q5",
    prompt:
      "(True/False) An architectural pattern is a description of a system's organization.",
    options: ["True", "False"],
    correctIndex: 0,
    explanation:
      "Architectural patterns capture reusable knowledge about how systems can be organized and when that organization is appropriate.",
    hintSteps: [
      "Patterns are reusable organization knowledge.",
      "The wording comes almost directly from the chapter.",
      "This statement is meant to be straightforward."
    ],
    walkthroughSteps: [
      "Architectural patterns describe common system organizations.",
      "They also explain when those organizations are useful.",
      "So the statement is true.",
      "Choose True."
    ],
    references: ["Chapter 6 – Architectural patterns"],
    tags: ["chapter-6", "architecture", "patterns"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch6-q6",
    prompt:
      "Architectural patterns/styles provide guidance on the situations in which specific architectural patterns should be used. Several architectural patterns were introduced in this chapter. List all of them.",
    options: [
      "Class view",
      "Client-server",
      "Logical filter",
      "Layered",
      "Pipes and filters",
      "Development view",
      "Repository",
      "Model-view-controller"
    ],
    correct: [1, 3, 4, 6, 7],
    explanation:
      "The architectural patterns introduced in Chapter 6 are Client-server, Layered, Pipes and filters, Repository, and Model-view-controller.",
    hintSteps: [
      "Separate views from patterns.",
      "The correct list has five items.",
      "Logical filter is a distractor for Pipes and filters."
    ],
    walkthroughSteps: [
      "Recall the exact list from the chapter and homework review.",
      "Keep Client-server, Layered, Pipes and filters, Repository, and Model-view-controller.",
      "Reject Class view and Development view because they are views, not patterns.",
      "Reject Logical filter because that is not the chapter's named pattern."
    ],
    references: ["Chapter 6 – Architectural patterns", "Homework 6 review – list all patterns"],
    tags: ["chapter-6", "architecture", "patterns", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q7",
    prompt:
      "What architectural style/pattern is described by the following statement: System functionality is organized into separate layers, and each layer only relies on the facilities and services offered by the layer immediately beneath it?",
    options: [
      "Layered style",
      "Repository style",
      "Client-server style",
      "Pipes and filters style"
    ],
    correctIndex: 0,
    explanation:
      "That description is the standard definition of layered architecture: related functionality grouped into layers with adjacent-layer service dependence.",
    hintSteps: [
      "The phrase 'layer immediately beneath it' is the giveaway.",
      "This is not about shared repositories or remote services.",
      "Think service levels."
    ],
    walkthroughSteps: [
      "The description centers on separate layers and adjacent-layer dependence.",
      "That is the defining structure of the layered style.",
      "Repository and client-server describe different organizational ideas.",
      "Choose Layered style."
    ],
    references: ["Chapter 6 – Layered architecture"],
    tags: ["chapter-6", "layered", "patterns"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q8",
    prompt: "What is an example of a transaction processing application?",
    options: [
      "Web search engine",
      "Video game",
      "Google Assistant",
      "Online shopping"
    ],
    correctIndex: 3,
    explanation:
      "Online shopping is a transaction processing application because it handles user requests that read/update shared business data while maintaining integrity.",
    hintSteps: [
      "Think user requests plus shared persistent data.",
      "Shopping, banking, and reservations are the classic examples.",
      "Search engines and assistants map elsewhere."
    ],
    walkthroughSteps: [
      "Transaction processing is about user-driven operations against a shared database.",
      "Online shopping fits that directly because orders, carts, and payments update business data.",
      "The other options are not the textbook transaction-processing example from the chapter.",
      "Choose Online shopping."
    ],
    references: ["Chapter 6 – Transaction processing applications"],
    tags: ["chapter-6", "transaction-processing", "application-type"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q9",
    prompt:
      "Which of the following is a primary reason for using architectural patterns in software design?",
    options: [
      "To eliminate the need for documentation",
      "To define the user interface for the system",
      "To provide a template solution to common software design problems",
      "To model the hardware layout for the system",
      "To show the structural view of a component"
    ],
    correctIndex: 2,
    explanation:
      "Architectural patterns capture reusable solutions to recurring high-level software design problems.",
    hintSteps: [
      "Patterns are about reuse of architectural knowledge.",
      "They are not a substitute for documentation.",
      "The right answer sounds like reusable guidance."
    ],
    walkthroughSteps: [
      "Architectural patterns are meant to reuse proven architectural organization ideas.",
      "That makes them template solutions for common design problems.",
      "They do not exist to eliminate documentation or define hardware layout.",
      "Choose the template-solution answer."
    ],
    references: ["Chapter 6 – Architectural patterns", "Homework 6 review – pattern purpose"],
    tags: ["chapter-6", "architecture", "patterns"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-exam2-ch6-q10",
    prompt:
      "(True/False) It is not possible to combine several architectural patterns when developing an application.",
    options: ["True", "False"],
    correctIndex: 1,
    explanation:
      "Architectural patterns can be combined. A real system may use multiple patterns at once depending on its structure and needs.",
    hintSteps: [
      "Real systems often mix deployment style, storage style, and UI organization.",
      "The statement says 'not possible,' which is too absolute.",
      "Think layered plus client-server plus MVC in one product."
    ],
    walkthroughSteps: [
      "Architectural patterns are not mutually exclusive.",
      "A system can combine multiple patterns in different parts or views of the architecture.",
      "That makes the statement false.",
      "Choose False."
    ],
    references: ["Chapter 6 – Combining patterns", "Homework 6 review – T/F"],
    tags: ["chapter-6", "architecture", "patterns"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-exam2-ch6-q11",
    prompt:
      "Which of the following will determine the structure of a system architecture? (Select all that apply)",
    options: [
      "Safety",
      "Availability",
      "Performance",
      "Use case patterns",
      "Agile method",
      "Security",
      "Maintainability"
    ],
    correct: [0, 1, 2, 5, 6],
    explanation:
      "Chapter 6 ties architecture structure to major non-functional requirements such as safety, availability, performance, security, and maintainability.",
    hintSteps: [
      "The real drivers here are quality attributes.",
      "The wrong answers are process/method distractors.",
      "Memorize the five quality words from the slide."
    ],
    walkthroughSteps: [
      "Architecture structure is shaped by non-functional requirements here.",
      "The five valid drivers are Safety, Availability, Performance, Security, and Maintainability.",
      "Use case patterns and Agile method are not the quality attributes being tested.",
      "Select the five quality-attribute options."
    ],
    references: ["Chapter 6 – Architecture and system characteristics", "Lecture review slide – architecture structure drivers"],
    tags: ["chapter-6", "nfr", "quality-attributes", "final-review"],
    difficulty: "med"
  })
];

const chapter6OptionPads: Record<string, string[]> = {
  "se-exam2-ch6-q1": [
    "To replace testing with architecture reviews.",
    "To choose UML visibility symbols inside class diagrams.",
    "To remove the need for stakeholder communication."
  ],
  "se-exam2-ch6-q2": ["Diamond aggregation symbol", "Rounded rectangle state symbol"],
  "se-exam2-ch6-q3": [
    "It helps them choose variable names.",
    "It helps them avoid all documentation.",
    "It helps them compile the system."
  ],
  "se-exam2-ch6-q7": [
    "Model-view-controller style",
    "Transaction processing style",
    "Language processing style"
  ],
  "se-exam2-ch6-q8": ["Compiler", "Streaming video player", "Weather simulation"],
  "se-exam2-ch6-q9": [
    "To force all systems into the same architecture",
    "To remove the need for requirements analysis"
  ]
};

const chapter6FundamentalsQuestions = padExamStyleOptions(
  chapter6FundamentalsQuestionsBase,
  chapter6OptionPads
);

const softwareEngineeringExam2FullSimulation: QuizSet = {
  id: "se-exam2-full-simulation",
  courseId: "software-engineering",
  title: "Exam 2 Full Simulation (Ch. 5 + 6)",
  description:
    "Full Software Engineering Exam 2 review aligned to your Chapter 5 and 6 homework patterns, lecture review sheet, and the exact guaranteed slide wording used in class.",
  difficulty: "Advanced",
  estMinutes: 46,
  tags: ["exam-2", "chapter-5", "chapter-6", "uml", "architectural-design", "system-modeling", "final-review"],
  mode: "exam",
  timerDefaultMinutes: 46,
  questionCountTarget: 28,
  isExamSimulation: true,
  questions: [
    ...chapter5Questions,
    ...chapter6FundamentalsQuestions
  ]
};

const softwareEngineeringExam2SystemModelingDrill: QuizSet = {
  id: "se-exam2-system-modeling-drill",
  courseId: "software-engineering",
  title: "Exam 2 UML + System Modeling Drill",
  description:
    "Chapter 5 rapid drill that mirrors the actual homework/review style: diagram identification, symbols, relationships, behavioral triggers, and model-driven architecture.",
  difficulty: "Intermediate",
  estMinutes: 22,
  tags: ["exam-2", "chapter-5", "uml", "system-modeling", "focused-drill"],
  mode: "quiz",
  timerDefaultMinutes: 22,
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
    "Fast recognition drill for the exact Chapter 6 architecture-identification style, now including the recurring review pattern and quality-attribute checks.",
  difficulty: "Intermediate",
  estMinutes: 16,
  tags: ["exam-2", "chapter-6", "focused-drill", "a-g-options"],
  mode: "quiz",
  timerDefaultMinutes: 16,
  questions: [
    architectureQuestions[0],
    chapter6FundamentalsQuestions[10],
    ...architectureQuestions.slice(1, 9)
  ]
};

const softwareEngineeringExam2GuaranteedLectureDrill: QuizSet = {
  id: "se-exam2-core-final-review",
  courseId: "software-engineering",
  title: "Exam 2 Guaranteed Lecture Questions",
  description:
    "The four Software Engineering Exam 2 questions pulled directly from your lecture-review images. Use this set to memorize the exact wording and answer patterns.",
  difficulty: "Intermediate",
  estMinutes: 8,
  tags: ["exam-2", "chapter-5", "chapter-6", "final-review", "core-final-review"],
  mode: "quiz",
  timerDefaultMinutes: 8,
  questions: [
    {
      ...chapter5Questions[2],
      id: "se-exam2-guaranteed-q1-context-model",
      tags: [...(chapter5Questions[2].tags ?? []), "core-final-review"]
    },
    {
      ...chapter5Questions[15],
      id: "se-exam2-guaranteed-q2-mda-true-false",
      tags: [...(chapter5Questions[15].tags ?? []), "core-final-review"]
    },
    {
      ...architectureQuestions[0],
      id: "se-exam2-guaranteed-q3-pattern-list",
      tags: [...(architectureQuestions[0].tags ?? []), "core-final-review"]
    },
    {
      ...chapter6FundamentalsQuestions[10],
      id: "se-exam2-guaranteed-q4-architecture-drivers",
      tags: [...(chapter6FundamentalsQuestions[10].tags ?? []), "core-final-review"]
    }
  ]
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
  softwareEngineeringExam2GuaranteedLectureDrill,
  softwareEngineeringExam2SystemModelingDrill,
  softwareEngineeringExam2ArchitectureSimulation,
  softwareEngineeringExam2ArchitectureFocusedDrill,
  softwareEngineeringExam2SystemModelingWalkthrough,
  softwareEngineeringExam2ArchitectureWalkthrough
];
