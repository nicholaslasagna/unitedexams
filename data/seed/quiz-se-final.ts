import type { Question, QuizSet } from "@/lib/types";

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
    tags: ["software-engineering", "final-exam", ...tags],
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
    tags: ["software-engineering", "final-exam", ...tags],
    difficulty,
    homeworkFormat: "short",
    fromProfessor: true
  };
}

const finalMockQuestions: Question[] = [
  makeSingleQuestion({
    id: "se-final-q1-interface-design",
    prompt:
      "When developing software, the interface needs to be specified. What is interface design primarily concerned with?",
    options: [
      "Defining the detailed structure of all data storage mechanisms used by the software.",
      "Determining the final visual aesthetics and user experience of the graphical user interface (GUI).",
      "Specifying the detail of the interface to a component or to a group of components.",
      "Writing the implementation code for each object and testing it individually.",
      "Allocating hardware resources and scheduling tasks within the operating system."
    ],
    correctIndex: 2,
    explanation:
      "Interface design is about specifying component boundaries and the details of how components interact through their interfaces, not about UI polish or implementation code.",
    hintSteps: [
      "This question is about software-component boundaries, not visuals.",
      "Think specification of interaction points.",
      "The correct answer should mention a component or group of components."
    ],
    walkthroughSteps: [
      "Interface design focuses on how one part of the system connects to another.",
      "That means defining the details of the interface to a component or group of components.",
      "It is not the same as GUI aesthetics or low-level coding.",
      "Choose the component-interface specification answer."
    ],
    references: ["Chapter 7 – Interface specification"],
    tags: ["chapter-7", "interface-design", "design-implementation"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-q2-design-model-types",
    prompt:
      "When using UML to develop a design, you should create two types of design models. What are they?",
    options: [
      "Dynamic models",
      "Visual model",
      "Structural models",
      "Filter model",
      "Validity model",
      "Layered architecture"
    ],
    correct: [0, 2],
    explanation:
      "The two design-model categories emphasized in the course are dynamic models and structural models.",
    hintSteps: [
      "This is a model-category question, not an architecture-style question.",
      "One correct option captures behavior over time; the other captures static structure.",
      "Ignore distractors that sound invented or architectural."
    ],
    walkthroughSteps: [
      "Design models are split into dynamic and structural views.",
      "Dynamic models capture changing behavior; structural models capture static organization.",
      "Layered architecture is an architecture style, not one of the two design-model types here.",
      "Select Dynamic models and Structural models."
    ],
    references: ["Chapter 7 – Design models"],
    tags: ["chapter-7", "uml", "structural-model", "dynamic-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q3-state-diagram",
    prompt: "Which of the following statements is true about a state diagram?",
    options: [
      "Show how objects change their state in response to classes.",
      "Show the sequence of object interactions that take place.",
      "Represents an interaction with outside entities of a system.",
      "Show how objects change their state in response to events."
    ],
    correctIndex: 3,
    explanation:
      "State diagrams / state machine diagrams show how an object or system changes state when events occur.",
    hintSteps: [
      "State diagrams are event-driven behavioral models.",
      "They do not primarily show external actors or message sequence.",
      "The correct option should mention state change and events together."
    ],
    walkthroughSteps: [
      "A state diagram tracks states and transitions between them.",
      "Those transitions happen because of events.",
      "That is why the event-response option is correct.",
      "Choose the statement about objects changing state in response to events."
    ],
    references: ["Chapter 5/7 – State diagrams"],
    tags: ["chapter-7", "state-diagram", "behavioral-model"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q4-context-diagram",
    prompt:
      "The first stage in any software design process is to develop an understanding of the relationships between the software that is being designed, and its external environment. This is essential for deciding how to provide the required system functionality and how to structure the system to communicate with its environment. Which one of the following diagrams will allow us to discover this?",
    options: [
      "Component diagram",
      "Class diagram",
      "State diagram",
      "Context diagram",
      "Activity diagram",
      "Deployment diagram"
    ],
    correctIndex: 3,
    explanation:
      "A context diagram is used first because it shows the system boundary and the relationship between the software system and its external environment.",
    hintSteps: [
      "The key clue is external environment and system boundary.",
      "This is not about detailed internal structure yet.",
      "Choose the diagram that gives the outside-in perspective."
    ],
    walkthroughSteps: [
      "The question is about discovering how the system sits inside its environment.",
      "That is exactly what a context diagram is for.",
      "Class, state, activity, and deployment diagrams serve different purposes later.",
      "Choose Context diagram."
    ],
    references: ["Chapter 7 – System context", "Core final-review item – context question"],
    tags: ["chapter-7", "context-diagram", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q5-observer-relationship",
    prompt:
      "Which of the following statements accurately describes the relationship between observers in the Observer pattern?",
    options: [
      "Observers must continuously communicate with each other to synchronize their data before displaying it.",
      "Observers are strictly ordered and must pass the state information sequentially from one observer to the next.",
      "Observers do not know of the existence of other observers; they only know about changes in the observable (subject).",
      "Observers share a direct interface with each other to negotiate which one gets to update the display first."
    ],
    correctIndex: 2,
    explanation:
      "In the Observer pattern, observers are decoupled from one another. They subscribe to the subject and react to subject changes without needing to know the other observers.",
    hintSteps: [
      "Observer is about decoupling, not observer-to-observer negotiation.",
      "Observers care about the subject's changes.",
      "The correct choice should remove direct dependencies between observers."
    ],
    walkthroughSteps: [
      "The subject notifies observers when its state changes.",
      "Each observer reacts independently to that subject notification.",
      "Therefore observers do not need to know about or coordinate with one another directly.",
      "Choose the option stating that observers only know about changes in the observable subject."
    ],
    references: ["Chapter 7 – Observer pattern", "Core final-review item – observer question"],
    tags: ["chapter-7", "observer-pattern", "final-review"],
    difficulty: "med"
  }),
  makeMultiQuestion({
    id: "se-final-q6-reuse-items",
    prompt:
      "When developing software, you should make as much use as possible of existing items. Which of the following can be reused during software development? (Select all that apply)",
    options: [
      "Components",
      "Classes and objects",
      "Application systems",
      "Architectural patterns"
    ],
    correct: [0, 1, 2, 3],
    explanation:
      "Reuse happens at multiple abstraction levels: object/class level, component level, system level, and even architectural-pattern level.",
    hintSteps: [
      "The chapter emphasizes reuse at several abstraction levels.",
      "Do not artificially limit reuse to code only.",
      "Architectural knowledge can be reused too."
    ],
    walkthroughSteps: [
      "Reuse can happen with classes and objects, components, whole application systems, and architectural patterns.",
      "Those correspond to several abstraction levels of reuse discussed in class.",
      "There is no distractor here among the four listed options.",
      "Select all four options."
    ],
    references: ["Chapter 7 – Software reuse", "Core final-review item – reuse items"],
    tags: ["chapter-7", "software-reuse", "final-review"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-q7-reuse-costs",
    prompt:
      "While software reuse increases reliability and speed, it comes with associated costs. Which of the following are explicitly listed as costs of reuse? (Select all that apply)",
    options: [
      "The cost of time spent looking for software to reuse.",
      "The cost of buying the reusable software.",
      "The cost of adapting and configuring the components to meet requirements.",
      "The cost of integrating reusable software elements with new code.",
      "The cost of decreased reliability, because reused components have usually not been tested previously."
    ],
    correct: [0, 1, 2, 3],
    explanation:
      "The course explicitly lists search, purchase, adaptation/configuration, and integration as reuse costs. Decreased reliability is the false distractor because reuse often improves reliability when components are already tested.",
    hintSteps: [
      "Think acquisition plus fit plus integration.",
      "Reliability is usually a benefit of reuse, not a listed cost in this wording.",
      "The false option attacks the basic argument for reuse."
    ],
    walkthroughSteps: [
      "Reuse is not free: you spend time finding components, may pay for them, must adapt them, and still need to integrate them.",
      "Those are the explicit reuse costs from the lecture framing.",
      "The reliability-decrease option is false because reused elements are often already tested and mature.",
      "Select A, B, C, and D only."
    ],
    references: ["Chapter 7 – Reuse costs", "Core final-review item – reuse costs"],
    tags: ["chapter-7", "software-reuse", "costs", "final-review"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q8-problem-tracking",
    prompt:
      "Three activities of configuration management are version management, system integration, and problem tracking. Which of the following is true about problem tracking?",
    options: [
      "Support is provided to help developers define what versions of components are used to create each version of a system.",
      "Support is provided to allow users to report bugs and other problems, and to allow all developers to see who is working on these bugs and when they are fixed.",
      "Support is provided to keep track of the different versions of software components. It includes facilities to coordinate development by several programmers.",
      "Helps build a system automatically by compiling and linking the required components."
    ],
    correctIndex: 1,
    explanation:
      "Problem tracking is the bug/issue reporting and coordination activity in configuration management. It lets users report issues and developers coordinate fixes.",
    hintSteps: [
      "Version management and automated build are different activities.",
      "Problem tracking is issue-centered.",
      "Look for reporting plus coordination of bug work."
    ],
    walkthroughSteps: [
      "Problem tracking deals with reported bugs and other issues.",
      "It also supports coordination so developers know who is working on each issue and when it was fixed.",
      "The other options describe version management or system integration.",
      "Choose the bug-reporting and coordination answer."
    ],
    references: ["Chapter 7 – Configuration management", "Homework review – problem tracking"],
    tags: ["chapter-7", "configuration-management", "problem-tracking"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-q9-host-target",
    prompt:
      "In host-target development, production software does not usually execute on the same computer as the software development environment. If a gaming company were to run its games, which of the following describe target systems? (Select all that apply)",
    options: [
      "Gaming company's development server",
      "User's gaming console",
      "User's laptop",
      "Game developer's machine"
    ],
    correct: [1, 2],
    explanation:
      "The target system is where the finished software is executed by the end user, not where it is developed.",
    hintSteps: [
      "Host = development environment. Target = execution environment.",
      "Think end-user runtime devices.",
      "The developer's systems are the host side, not the target side."
    ],
    walkthroughSteps: [
      "In host-target development, developers build on one platform and users run the software on another target platform.",
      "That makes the user's gaming console and user's laptop target systems.",
      "The development server and the developer's machine belong to the host/development side instead.",
      "Select User's gaming console and User's laptop."
    ],
    references: ["Chapter 7 – Host-target development", "Homework review – target systems"],
    tags: ["chapter-7", "host-target", "development-platform"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q10-gpl",
    prompt:
      "We discussed three open-source licenses in class. If you want to share everything about your system and keep no secrets on an open-source platform, which license would you use?",
    options: [
      "The GNU General Public License (GPL)",
      "The GNU Lesser General Public License (LGPL)",
      "The Berkeley Standard Distribution (BSD) License",
      "None of the above"
    ],
    correctIndex: 0,
    explanation:
      "The GPL is the strongest copyleft option in this list and is the course answer for sharing everything openly with no proprietary secrecy kept around the distributed derivative work.",
    hintSteps: [
      "This is the most restrictive sharing requirement among the listed licenses.",
      "GPL is the classic strong copyleft answer.",
      "LGPL and BSD are more permissive in different ways."
    ],
    walkthroughSteps: [
      "The question is asking for the license that forces the strongest openness when sharing software.",
      "Among GPL, LGPL, and BSD, GPL is the strongest copyleft answer taught in this course.",
      "That matches the 'share everything, keep no secrets' wording.",
      "Choose the GNU General Public License (GPL)."
    ],
    references: ["Chapter 7 – Open source development", "Homework review – GPL"],
    tags: ["chapter-7", "open-source", "licenses"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-q11-testing-goals",
    prompt:
      "When you test software, you are trying to do two things. What are those two things? (Select all that apply)",
    options: [
      "To discover situations in which the behavior of the software is incorrect.",
      "To demonstrate that the software meets its requirements.",
      "To demonstrate the qualities of its architecture.",
      "To discover the acceptability of the software.",
      "To discover the evolution lifetime of the software."
    ],
    correct: [0, 1],
    explanation:
      "The two core program-testing goals are validation (showing requirements are met) and defect discovery (finding incorrect or undesirable behavior).",
    hintSteps: [
      "One goal is positive: show it works as required.",
      "The other is negative: expose incorrect behavior.",
      "Ignore architecture and lifetime distractors."
    ],
    walkthroughSteps: [
      "Program testing has two main goals in the slides.",
      "The first is to demonstrate that the software meets its requirements.",
      "The second is to discover situations where the software behaves incorrectly or undesirably.",
      "Select the first two statements only."
    ],
    references: ["Chapter 8 – Program testing goals", "Core final-review item – testing goals"],
    tags: ["chapter-8", "testing", "validation-testing", "defect-testing", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q12-verification-validation",
    prompt:
      "Which statement correctly matches verification and validation in software engineering?",
    options: [
      "Verification asks whether we are building the right product; validation asks whether we are building the product right.",
      "Verification asks whether we are building the product right; validation asks whether we are building the right product.",
      "Verification is dynamic execution only; validation never involves testing.",
      "Verification and validation are identical terms for the same testing activity."
    ],
    correctIndex: 1,
    explanation:
      "Verification checks conformance to specification: are we building the product right? Validation checks whether the product meets real user needs: are we building the right product?",
    hintSteps: [
      "Verification is specification-centered.",
      "Validation is user/requirement-centered.",
      "The correct answer preserves the classic right-product/right-way wording."
    ],
    walkthroughSteps: [
      "Verification checks whether the software is built correctly relative to its specification.",
      "Validation checks whether the software does what users actually require.",
      "That gives the classic phrase pair: product right vs right product.",
      "Choose the second option."
    ],
    references: ["Chapter 8 – Verification vs validation"],
    tags: ["chapter-8", "verification", "validation"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q13-inspections-vs-testing",
    prompt:
      "Which statement is true about software inspections and software testing?",
    options: [
      "Inspections execute the system dynamically, while testing studies only static documents.",
      "Inspections are concerned with static system representations, while testing is concerned with exercising and observing product behavior.",
      "Testing replaces inspections entirely because dynamic verification is always sufficient.",
      "Inspections are only for user interfaces, while testing is only for databases."
    ],
    correctIndex: 1,
    explanation:
      "Software inspections are static verification activities; software testing is dynamic verification based on executing the system and observing behavior.",
    hintSteps: [
      "Static versus dynamic is the key split.",
      "Inspections happen without execution.",
      "Testing requires execution with data."
    ],
    walkthroughSteps: [
      "Inspections analyze documents, code, or other static system representations without running the system.",
      "Testing runs the software with test data and observes what happens.",
      "That makes inspections static verification and testing dynamic verification.",
      "Choose the second statement."
    ],
    references: ["Chapter 8 – Inspections and testing"],
    tags: ["chapter-8", "inspections", "dynamic-verification", "static-verification"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q14-equivalence-partitioning",
    prompt:
      "What is equivalence partitioning in software testing?",
    options: [
      "A method of rewriting code to make all branches identical.",
      "Grouping inputs into partitions where all members are expected to be processed in the same way, then choosing representative tests from each group.",
      "A release-testing strategy that always tests every possible input.",
      "A user-testing process where customers decide whether a system should be deployed."
    ],
    correctIndex: 1,
    explanation:
      "Equivalence partitioning divides the input space into groups that are expected to behave similarly so representative values from each group can be tested efficiently.",
    hintSteps: [
      "This is an input-domain technique.",
      "The purpose is to avoid exhaustive testing while still sampling representative behavior.",
      "Look for grouping inputs that should behave the same."
    ],
    walkthroughSteps: [
      "Equivalence partitioning splits inputs into classes expected to be treated similarly by the program.",
      "Then you choose tests from each partition rather than testing every single value.",
      "That is why it is a representative-input strategy.",
      "Choose the partition-grouping answer."
    ],
    references: ["Chapter 8 – Equivalence partitioning"],
    tags: ["chapter-8", "equivalence-partitioning", "testing-guidelines"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q15-shared-memory-interface",
    prompt:
      "Which interface type describes a situation where a block of memory is shared between components, data is placed there by one subsystem, and retrieved by other subsystems?",
    options: [
      "Parameter interface",
      "Shared memory interface",
      "Procedural interface",
      "Message passing interface"
    ],
    correctIndex: 1,
    explanation:
      "A shared memory interface is exactly the interface form where components communicate indirectly through a shared memory area.",
    hintSteps: [
      "This is the interface type named by the communication mechanism itself.",
      "The clue is a shared block of memory.",
      "Message passing would explicitly send a request message instead."
    ],
    walkthroughSteps: [
      "If components communicate by reading and writing the same memory region, the interface type is shared memory.",
      "Parameter interfaces pass data through calls, and message-passing interfaces send service requests.",
      "The prompt matches the shared-memory definition word for word.",
      "Choose Shared memory interface."
    ],
    references: ["Chapter 8 – Interface types"],
    tags: ["chapter-8", "interface-testing", "shared-memory"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q16-regression-testing",
    prompt:
      "Which one of the following testing checks that changes have not 'broken' previously working code?",
    options: [
      "Interface development",
      "Code coverage",
      "System documentation",
      "Simplified debugging",
      "Structure validation",
      "Regression testing"
    ],
    correctIndex: 5,
    explanation:
      "Regression testing reruns tests after changes so you can check that previously working code still works and has not been broken by the change.",
    hintSteps: [
      "This is the exact term for protecting old behavior after a change.",
      "The answer is a testing activity, not a documentation or debugging term.",
      "Think rerunning tests after modifications."
    ],
    walkthroughSteps: [
      "Regression testing is specifically defined as checking that changes have not broken previously working code.",
      "That is why regression suites are run repeatedly after modifications.",
      "The other options are distractors, not the named testing type.",
      "Choose Regression testing."
    ],
    references: ["Chapter 8 – Regression testing", "Core final-review item – regression testing"],
    tags: ["chapter-8", "regression-testing", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q17-release-testing-goal",
    prompt:
      "What is the primary goal of release testing?",
    options: [
      "To help individual developers debug their latest code changes.",
      "To convince the supplier of the system that it is good enough for use outside the development team.",
      "To generate UML models from implementation automatically.",
      "To replace all system testing with customer interviews."
    ],
    correctIndex: 1,
    explanation:
      "Release testing is performed on a release intended for external use, and its primary goal is to convince the supplier that the system is good enough to ship/use.",
    hintSteps: [
      "Release testing is external-use oriented.",
      "The key phrase from the chapter is 'good enough for use.'",
      "This is broader than developer defect hunting."
    ],
    walkthroughSteps: [
      "Release testing happens for a complete release intended for use outside the development team.",
      "Its goal is not merely local debugging, but confidence that the system is ready for external use.",
      "The slide wording says it should convince the supplier the system is good enough for use.",
      "Choose the second option."
    ],
    references: ["Chapter 8 – Release testing"],
    tags: ["chapter-8", "release-testing", "validation"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q18-stress-testing",
    prompt:
      "What does stress testing help you check?",
    options: [
      "Whether the system can fail-soft rather than collapse under overload, and whether defects appear only at full load.",
      "Whether all UML diagrams use the correct symbols.",
      "Whether requirements have been written as user stories.",
      "Whether source code follows a chosen indentation style."
    ],
    correctIndex: 0,
    explanation:
      "Stress testing deliberately overloads the system to study failure behavior and expose defects that only appear when the system is heavily loaded.",
    hintSteps: [
      "Stress testing pushes beyond normal design limits.",
      "The key phrase is fail-soft rather than collapse.",
      "It is a performance-oriented testing technique."
    ],
    walkthroughSteps: [
      "Stress testing means loading the system beyond expected limits.",
      "Under that load, the system should fail-soft instead of collapsing unpredictably.",
      "It can also expose defects that do not show up under normal load.",
      "Choose the overload and fail-soft answer."
    ],
    references: ["Chapter 8 – Stress testing", "Chapter 8 – Fail-soft behavior"],
    tags: ["chapter-8", "stress-testing", "performance-testing"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q19-acceptance-testing",
    prompt:
      "Which type of user testing is used when customers decide whether the software is good enough to be accepted and deployed in its operational environment?",
    options: [
      "Alpha testing",
      "Beta testing",
      "Acceptance testing",
      "Guideline-based testing"
    ],
    correctIndex: 2,
    explanation:
      "Acceptance testing is the user-testing process where customers decide whether the system is ready to be accepted and deployed.",
    hintSteps: [
      "This is the one tied directly to customer acceptance and deployment readiness.",
      "Alpha and beta are other user-testing forms but not this exact decision point.",
      "The name of the answer matches the goal."
    ],
    walkthroughSteps: [
      "Acceptance testing exists so the customer can judge whether the system is ready to accept from the developers and deploy.",
      "That is the explicit purpose named in the chapter.",
      "Alpha and beta testing do not match that final go/no-go role as closely.",
      "Choose Acceptance testing."
    ],
    references: ["Chapter 8 – Acceptance testing"],
    tags: ["chapter-8", "user-testing", "acceptance-testing"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-q20-urgent-changes",
    prompt:
      "Sometimes software needs to go through urgent changes. What may cause these urgent changes? (Select all that apply)",
    options: [
      "Changes to the system's environment",
      "New government legislation",
      "Detection of critical faults",
      "None of the above"
    ],
    correct: [0, 1, 2],
    explanation:
      "Urgent changes can be triggered by environment changes, new legislation, or critical faults that require immediate repair. 'None of the above' is the distractor.",
    hintSteps: [
      "Urgent change requests are about time pressure from risk or external change.",
      "Environment, legislation, and critical faults all qualify.",
      "The 'none' option is incompatible with the chapter examples."
    ],
    walkthroughSteps: [
      "The chapter lists several reasons urgent changes happen without a full normal process.",
      "Those include critical faults, changes in the environment, and external business or legal pressures such as legislation.",
      "Therefore the first three options are valid and the 'none' option is false.",
      "Select the first three options only."
    ],
    references: ["Chapter 9 – Urgent change requests", "Core final-review item – urgent changes"],
    tags: ["chapter-9", "urgent-changes", "final-review"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-q21-maintenance-types",
    prompt:
      "There are three different types of software maintenance. Which of the following are those maintenance types? (Select all that apply)",
    options: [
      "Fault repairs",
      "Environmental adaptation",
      "Functionality addition and modification",
      "Architecture replacement"
    ],
    correct: [0, 1, 2],
    explanation:
      "The three maintenance types are fault repairs, environmental adaptation, and functionality addition/modification. Architecture replacement is not one of the listed maintenance types.",
    hintSteps: [
      "This is a direct list-recall question from the slide.",
      "Two types are about fixing/adapting; one is about adding or changing functionality.",
      "One distractor sounds major enough that it should stand out as not part of the slide."
    ],
    walkthroughSteps: [
      "The Chapter 9 maintenance slide lists exactly three types.",
      "They are fault repairs, environmental adaptation, and functionality addition and modification.",
      "Architecture replacement is not part of that list.",
      "Select the first three options only."
    ],
    references: ["Chapter 9 – Types of maintenance", "Core final-review item – maintenance types"],
    tags: ["chapter-9", "maintenance", "final-review"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q22-environmental-adaptation",
    prompt:
      "Which maintenance type changes a system so that it can operate in a different operating environment such as a new computer or operating system?",
    options: [
      "Fault repair",
      "Environmental adaptation",
      "Functionality addition and modification",
      "Release planning"
    ],
    correctIndex: 1,
    explanation:
      "Environmental adaptation is maintenance that changes software so it can continue working in a changed environment.",
    hintSteps: [
      "The keyword is environment.",
      "Think OS, hardware, or execution-platform changes.",
      "The name of the maintenance type directly matches the situation."
    ],
    walkthroughSteps: [
      "If the operating environment changes, the maintenance work is adapting the system to that new environment.",
      "That is exactly what environmental adaptation means.",
      "Fault repair and functionality addition address different kinds of change.",
      "Choose Environmental adaptation."
    ],
    references: ["Chapter 9 – Environmental adaptation"],
    tags: ["chapter-9", "maintenance", "environmental-adaptation"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-q23-servicing",
    prompt:
      "Which statement best describes the servicing stage of software evolution?",
    options: [
      "The system is evolving with new requirements and major new features are being added regularly.",
      "The system remains useful, but only changes required to keep it operational are made; no new functionality is added.",
      "The software is no longer used, and all changes have stopped permanently.",
      "The system is being rebuilt from scratch with no attention to existing behavior."
    ],
    correctIndex: 1,
    explanation:
      "Servicing means the system is still useful, but only operational fixes and environment-related updates are made; no new functionality is added.",
    hintSteps: [
      "Servicing is later than active evolution but earlier than phase-out.",
      "The key phrase is no new functionality.",
      "It is about keeping the system operational."
    ],
    walkthroughSteps: [
      "In the servicing stage, the software still matters enough to keep running.",
      "However, the organization is no longer extending it with new features.",
      "Only bug fixes and changes needed to keep it working are made.",
      "Choose the second statement."
    ],
    references: ["Chapter 9 – Evolution and servicing"],
    tags: ["chapter-9", "evolution", "servicing"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q24-legacy-replacement-risk",
    prompt:
      "Why is legacy system replacement often risky and expensive?",
    options: [
      "Because legacy systems usually have no business value at all and therefore must be replaced immediately.",
      "Because undocumented business rules, accumulated data, supporting software, and business-process dependencies are often embedded in the legacy system.",
      "Because legacy systems are always easier to replace than to maintain.",
      "Because old systems never depend on hardware or support software."
    ],
    correctIndex: 1,
    explanation:
      "Legacy systems are socio-technical systems with embedded business rules, data, support software, and process dependencies, so replacement is risky and expensive.",
    hintSteps: [
      "The answer should mention embedded dependencies, not just old code.",
      "Legacy systems are broader than one program file.",
      "Look for business rules and accumulated dependencies."
    ],
    walkthroughSteps: [
      "Legacy systems are not just code; they include business rules, processes, data, hardware, and support software relationships.",
      "Those embedded dependencies make replacement risky because many things may break or be lost.",
      "That is why replacement is often expensive as well.",
      "Choose the option about undocumented business rules and accumulated dependencies."
    ],
    references: ["Chapter 9 – Legacy system replacement"],
    tags: ["chapter-9", "legacy-systems", "replacement-risk"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-q25-refactoring-vs-reengineering",
    prompt:
      "Which statement best distinguishes refactoring from reengineering?",
    options: [
      "Refactoring adds major new functionality, while reengineering only changes variable names.",
      "Refactoring is continuous structure improvement that preserves functionality, while reengineering is larger restructuring of a legacy system to improve maintainability without changing its functionality.",
      "Refactoring and reengineering are identical terms for emergency bug fixing.",
      "Refactoring is only used before software release, while reengineering is only used during unit testing."
    ],
    correctIndex: 1,
    explanation:
      "Refactoring is preventative, continuous code-structure improvement without changing behavior. Reengineering is broader legacy-system restructuring to improve maintainability while preserving functionality.",
    hintSteps: [
      "Both preserve functionality, but they differ in scale and context.",
      "Refactoring is continuous and local; reengineering is larger and legacy-focused.",
      "Reject answers that claim new functionality is added."
    ],
    walkthroughSteps: [
      "Refactoring improves internal structure continuously during development and evolution while preserving behavior.",
      "Reengineering is a larger, more deliberate improvement effort on an existing legacy system, again without changing functionality.",
      "The correct answer must capture both preservation of functionality and the scale/context difference.",
      "Choose the second statement."
    ],
    references: ["Chapter 9 – Refactoring vs reengineering"],
    tags: ["chapter-9", "refactoring", "reengineering"],
    difficulty: "med"
  }),
  makeMultiQuestion({
    id: "se-final-q26-computing-impacts",
    prompt:
      "Which of the following are negative impacts of computing solutions discussed for the final? (Select all that apply)",
    options: [
      "Displacement of workers through automation",
      "Unemployment caused by some technologies replacing jobs",
      "Cyber crimes",
      "Improved access to information and digital services"
    ],
    correct: [0, 1, 2],
    explanation:
      "The review guide explicitly calls out displacement, unemployment, and cyber crimes as negative impacts. Improved access to information is a positive impact, not a negative one.",
    hintSteps: [
      "Separate harmful societal effects from benefits.",
      "The review guide explicitly listed displacement, unemployment, and cyber crimes.",
      "Do not select the clearly positive service-access option."
    ],
    walkthroughSteps: [
      "The final guide names several negative impacts of computing solutions and AI-related change.",
      "Those include displacement, unemployment, and cyber crimes.",
      "Improved access to information is a benefit, not a negative impact.",
      "Select the first three options only."
    ],
    references: ["Impact of computing solutions lecture", "Final review guide – impacts of computing solutions"],
    tags: ["impacts-of-computing", "ai-impact", "cyber-crime"],
    difficulty: "easy"
  })
];

const finalGuaranteedLectureDrillQuestions: Question[] = [
  finalMockQuestions[3],
  finalMockQuestions[5],
  finalMockQuestions[6],
  finalMockQuestions[10],
  finalMockQuestions[15],
  finalMockQuestions[19],
  finalMockQuestions[20],
  finalMockQuestions[4]
].map((question, index) => ({
  ...question,
  id: `se-final-guaranteed-q${index + 1}`,
  tags: [...question.tags, "core-final-review"]
}));

const testingEvolutionDrillQuestions: Question[] = [
  makeSingleQuestion({
    id: "se-final-drill-q1-observer-example",
    prompt:
      "One of the design patterns we learned in class is the observer pattern. Which of the following systems is more likely to use this observer pattern?",
    options: [
      "Amazon's product description",
      "Video game's icon updating",
      "YouTube subscriber system",
      "Search bar on an app store"
    ],
    correctIndex: 2,
    explanation:
      "A YouTube subscriber system fits the observer pattern because subscribers observe a channel/subject and are notified when updates occur.",
    hintSteps: [
      "Observer means interested parties are notified when a subject changes.",
      "Think subscription and notification.",
      "The right option naturally involves many listeners reacting to one source."
    ],
    walkthroughSteps: [
      "Observer is about a subject notifying subscribed observers when its state changes.",
      "A YouTube channel notifying subscribers when content changes is the cleanest example here.",
      "The other options do not match the pattern as directly.",
      "Choose YouTube subscriber system."
    ],
    references: ["Chapter 7 – Observer pattern", "Homework review – observer example"],
    tags: ["chapter-7", "observer-pattern"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-drill-q2-open-source-contributors",
    prompt: "Who develops open-source systems?",
    options: [
      "Any one can contribute",
      "Only the development team",
      "Only the stakeholders",
      "Owners of the system and the development team"
    ],
    correctIndex: 0,
    explanation:
      "Open-source development allows outside contributors; it is not limited to one closed internal team.",
    hintSteps: [
      "The defining idea is openness to contribution.",
      "This is broader than the formal development team alone.",
      "Choose the option with the broadest contributor model."
    ],
    walkthroughSteps: [
      "Open-source projects are open to contribution from anyone who participates under the project's rules and license.",
      "That means development is not restricted to one official internal team.",
      "The broadest contribution option is the intended course answer.",
      "Choose Any one can contribute."
    ],
    references: ["Chapter 7 – Open source development"],
    tags: ["chapter-7", "open-source"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-drill-q3-requirements-based-testing",
    prompt: "What is requirements-based testing?",
    options: [
      "Testing only the code that was changed in the last commit.",
      "Examining each requirement and developing a test or tests for it.",
      "Having users invent tests with no reference to the specification.",
      "Replacing validation testing with defect testing."
    ],
    correctIndex: 1,
    explanation:
      "Requirements-based testing means you examine each requirement and derive tests that show whether that requirement has been properly implemented.",
    hintSteps: [
      "This is explicitly tied to testable requirements.",
      "Think one or more tests derived from each requirement.",
      "It is validation-oriented."
    ],
    walkthroughSteps: [
      "Requirements-based testing starts from the requirements specification.",
      "For each requirement, you derive tests that can demonstrate whether the requirement is implemented correctly.",
      "That is why requirements need to be testable.",
      "Choose the second option."
    ],
    references: ["Chapter 8 – Requirements-based testing"],
    tags: ["chapter-8", "requirements-based-testing"],
    difficulty: "easy"
  }),
  makeSingleQuestion({
    id: "se-final-drill-q4-beta-testing",
    prompt: "What is beta testing?",
    options: [
      "Users work with the development team at the developer's site to test the system.",
      "A release of the software is made available to users so they can experiment and report problems they discover.",
      "Customers decide whether the system is ready to be accepted and deployed.",
      "Developers run unit tests before writing code."
    ],
    correctIndex: 1,
    explanation:
      "Beta testing means making a release available to users so they can try it and report issues they discover in realistic use.",
    hintSteps: [
      "Alpha is at the developer's site; acceptance is customer go/no-go.",
      "Beta is field-like exposure to users.",
      "The correct option mentions users experimenting and reporting problems."
    ],
    walkthroughSteps: [
      "Beta testing occurs when a release is given to users outside the development team so they can experiment with it.",
      "Those users then report the issues they find.",
      "That distinguishes beta testing from alpha and acceptance testing.",
      "Choose the second option."
    ],
    references: ["Chapter 8 – Beta testing"],
    tags: ["chapter-8", "user-testing", "beta-testing"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-drill-q5-reengineering-advantages",
    prompt:
      "What are the two important advantages of reengineering over replacement? (Select all that apply)",
    options: [
      "Reduced risk",
      "Reduced cost",
      "Guaranteed new functionality",
      "Elimination of all documentation work"
    ],
    correct: [0, 1],
    explanation:
      "The slides explicitly list reduced risk and reduced cost as the two key advantages of reengineering compared with full replacement.",
    hintSteps: [
      "This is a direct recall point from the Chapter 9 slides.",
      "Both correct answers are business/project advantages.",
      "New functionality and zero documentation are false extremes."
    ],
    walkthroughSteps: [
      "Reengineering preserves existing functionality while improving maintainability, which lowers the risk compared to full replacement.",
      "It is also typically cheaper than building a replacement system from scratch.",
      "Those are the two explicit advantages listed in the slides.",
      "Select Reduced risk and Reduced cost."
    ],
    references: ["Chapter 9 – Advantages of reengineering"],
    tags: ["chapter-9", "reengineering"],
    difficulty: "easy"
  }),
  makeMultiQuestion({
    id: "se-final-drill-q6-reengineering-activities",
    prompt:
      "Which of the following are listed as reengineering process activities? (Select all that apply)",
    options: [
      "Source code translation",
      "Reverse engineering",
      "Program modularization",
      "Feature-market fit discovery"
    ],
    correct: [0, 1, 2],
    explanation:
      "The Chapter 9 reengineering-process activities explicitly include source code translation, reverse engineering, and program modularization.",
    hintSteps: [
      "These are technical restructuring activities, not product-market activities.",
      "All three technical options came directly from the slide.",
      "Reject the startup/product distractor."
    ],
    walkthroughSteps: [
      "Reengineering focuses on improving an existing system's maintainability without changing functionality.",
      "The slide names source code translation, reverse engineering, and program modularization as process activities.",
      "Feature-market fit discovery is unrelated.",
      "Select the first three options."
    ],
    references: ["Chapter 9 – Reengineering process activities"],
    tags: ["chapter-9", "reengineering", "legacy-systems"],
    difficulty: "med"
  }),
  makeMultiQuestion({
    id: "se-final-drill-q7-bad-smells",
    prompt:
      "Which of the following are examples of 'bad smells' that can be improved through refactoring? (Select all that apply)",
    options: [
      "Duplicate code",
      "Long methods",
      "Switch statements",
      "Data clumps",
      "Well-encapsulated abstractions"
    ],
    correct: [0, 1, 2, 3],
    explanation:
      "The Chapter 9 slides explicitly name duplicate code, long methods, switch statements, and data clumps as bad smells that refactoring can improve.",
    hintSteps: [
      "The right answers are all signs of code that is getting harder to maintain.",
      "A well-encapsulated abstraction is the opposite of a bad smell.",
      "This is a list-recall question from the slide."
    ],
    walkthroughSteps: [
      "Bad smells are recurring code patterns that signal maintainability problems.",
      "The slide explicitly listed duplicate code, long methods, switch statements, and data clumps.",
      "A well-encapsulated abstraction is not a smell at all.",
      "Select the first four options."
    ],
    references: ["Chapter 9 – Bad smells", "Chapter 9 – Refactoring"],
    tags: ["chapter-9", "refactoring", "bad-smells"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-drill-q8-business-value-assessment",
    prompt: "What does business value assessment try to measure for a legacy system?",
    options: [
      "How many UML diagrams the system team can draw each sprint.",
      "How much time and effort the system saves compared to manual processes or alternative systems.",
      "Whether the source code has enough comments.",
      "Whether the system uses the latest programming language."
    ],
    correctIndex: 1,
    explanation:
      "Business value assessment asks how much value the system provides to the business, often framed as time/effort savings and dependency of the business on the system outputs.",
    hintSteps: [
      "This assessment is about business usefulness, not code style.",
      "Look for operational/business impact.",
      "Time and effort savings are the key phrase from the slide."
    ],
    walkthroughSteps: [
      "The slide defines business value in terms of how much time and effort a system saves compared with manual processes or other systems.",
      "That means the assessment is looking at operational value to the business.",
      "It is not judging UML coverage or programming-language freshness.",
      "Choose the second option."
    ],
    references: ["Chapter 9 – Business value assessment"],
    tags: ["chapter-9", "legacy-systems", "business-value"],
    difficulty: "med"
  }),
  makeSingleQuestion({
    id: "se-final-drill-q9-cots-build-buy",
    prompt: "What does COTS stand for in software engineering?",
    options: [
      "Component-Oriented Testing Strategy",
      "Commercial Off-The-Shelf",
      "Customer-Owned Technical System",
      "Code Optimization and Tracking Standard"
    ],
    correctIndex: 1,
    explanation:
      "COTS stands for Commercial Off-The-Shelf and refers to acquiring an existing software product/component instead of building it from scratch.",
    hintSteps: [
      "This belongs to the build-or-buy discussion.",
      "Think existing market product, not custom development.",
      "Only one option matches the standard acronym."
    ],
    walkthroughSteps: [
      "COTS is the standard acronym used in build-vs-buy decisions.",
      "It refers to commercially available existing software that can be acquired and reused.",
      "That expands to Commercial Off-The-Shelf.",
      "Choose the second option."
    ],
    references: ["Chapter 7 – Build or Buy", "Chapter 7 – COTS"],
    tags: ["chapter-7", "cots", "build-or-buy"],
    difficulty: "easy"
  })
];

const softwareEngineeringFinalFullSimulation: QuizSet = {
  id: "se-final-full-simulation",
  courseId: "software-engineering",
  title: "Software Engineering Final Mock Exam",
  description:
    "Comprehensive Software Engineering final simulation covering the Chapter 7 continuation topics, Chapter 8 testing, Chapter 9 evolution, and the highest-yield core final-review items.",
  difficulty: "Advanced",
  estMinutes: 52,
  tags: ["final-exam", "chapter-7", "chapter-8", "chapter-9", "impacts-of-computing", "final-review"],
  mode: "exam",
  timerDefaultMinutes: 52,
  questionCountTarget: 26,
  isExamSimulation: true,
  questions: finalMockQuestions
};

const softwareEngineeringFinalGuaranteedLectureDrill: QuizSet = {
  id: "se-final-core-final-review",
  courseId: "software-engineering",
  title: "Final Core Review Drill",
  description:
    "Short repeatable drill made only from the core final-review items for the Software Engineering final.",
  difficulty: "Intermediate",
  estMinutes: 15,
  tags: ["final-exam", "final-review", "core-final-review", "focused-drill"],
  mode: "quiz",
  timerDefaultMinutes: 15,
  questions: finalGuaranteedLectureDrillQuestions
};

const softwareEngineeringFinalTestingEvolutionDrill: QuizSet = {
  id: "se-final-testing-evolution-drill",
  courseId: "software-engineering",
  title: "Final Testing + Evolution Drill",
  description:
    "Focused Chapter 7–9 drill on observer, reuse, open source, regression, release testing, legacy systems, maintenance, refactoring, and reengineering.",
  difficulty: "Intermediate",
  estMinutes: 24,
  tags: ["final-exam", "chapter-7", "chapter-8", "chapter-9", "focused-drill"],
  mode: "quiz",
  timerDefaultMinutes: 24,
  questions: testingEvolutionDrillQuestions
};

export const softwareEngineeringFinalQuizSets: QuizSet[] = [
  softwareEngineeringFinalFullSimulation,
  softwareEngineeringFinalGuaranteedLectureDrill,
  softwareEngineeringFinalTestingEvolutionDrill
];
