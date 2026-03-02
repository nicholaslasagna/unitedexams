// ═══════════════════════════════════════════════════════
//  CS 3365 SOFTWARE ENGINEERING — EXAM 1 QUESTION BANK
//  Chapters 1, 2, 3, 4
//  Types: single, multi, fill, free
// ═══════════════════════════════════════════════════════

const QUESTION_BANK = [

  // ╔═══════════════════════════════════════╗
  // ║  PROFESSOR CONFIRMED (always included)║
  // ╚═══════════════════════════════════════╝

  {
    id: "P1", chapter: 1, type: "single", fromProfessor: true,
    question: 'In a "Plan-driven" process, how is progress typically measured?',
    options: [
      "By the number of user stories completed each day.",
      "Against a pre-determined plan of activities and stages.",
      "Based on the customer's satisfaction at the end of each sprint.",
      "Based on the level of pair programming used.",
    ],
    answer: [1],
    explanation: "In plan-driven processes (like Waterfall), progress is measured against a pre-determined plan with defined activities and stages, unlike agile where progress is measured by working software increments.",
  },
  {
    id: "P2", chapter: 3, type: "single", fromProfessor: true,
    question: 'In the Scrum agile method, what is a "Sprint"?',
    options: [
      "A race between developers to finish their code.",
      "A fixed time period, usually 2-4 weeks, during which a system increment is developed.",
      "A meeting where the Scrum Master reports to the CEO.",
      "The process of moving requirements from the product backlog to the archive.",
      "A specialized tool used for automated testing.",
      "The final release of the software to the customer.",
      "A method for scaling agile to large organizations.",
    ],
    answer: [1],
    explanation: "A Sprint is a fixed time period (typically 2-4 weeks) during which a potentially shippable system increment is developed. It's the core iteration cycle in Scrum.",
  },
  {
    id: "P3", chapter: 1, type: "single", fromProfessor: true,
    question: "Software engineering ethics dictate that engineers should NOT:",
    options: [
      "Respect the confidentiality of employers or clients.",
      "Misuse their skills to take over or damage others' computers.",
      "Be honest about their level of competence.",
      "Support the professional software development of their colleagues.",
    ],
    answer: [1],
    explanation: "B is what engineers should NOT do. Misusing skills to damage others' computers is unethical. Options A, C, and D are things engineers SHOULD do per the ACM/IEEE Code of Ethics.",
  },
  {
    id: "P4", chapter: 3, type: "multi", fromProfessor: true,
    question: "What are the characteristics of agile development? (Select all that apply)",
    options: [
      "Detailed documentation.",
      "Mostly focused on coding.",
      "Frequent delivery of new versions.",
      "Implementation starts after the system design has been fully completed.",
      "Minimal documentation.",
      "None of the above.",
    ],
    answer: [1, 2, 4],
    explanation: "Agile development is characterized by: focus on coding over documentation, frequent delivery of new versions, and minimal documentation with focus on working code. Detailed documentation and completing design before implementation are plan-driven traits.",
  },
  {
    id: "P5", chapter: 2, type: "single", fromProfessor: true,
    question: "The prototype of the software will be very close to the final software version. Therefore, the prototype should not be discarded.",
    options: ["True", "False"],
    answer: [1],
    explanation: "False. Prototypes are typically throw-away. They are built to explore requirements, not to become the final product. They often cut corners on structure and quality.",
  },
  {
    id: "P6", chapter: 1, type: "single", fromProfessor: true,
    question: "There are two types of software products: Generic products and customized products. Which one of the following statements is true about a generic product?",
    options: [
      "Software that is commissioned for specific customer needs.",
      "Software that is developed to maintain the hardware in a specific factory.",
      "Software made for any customer who wants to buy it.",
      "Banking app made for a specific bank to manage its internal activities (ex: Citi bank).",
    ],
    answer: [2],
    explanation: "Generic products (COTS) are stand-alone systems produced for a general market and sold to any customer. Options A, B, and D describe customized (bespoke) products.",
  },
  {
    id: "P7", chapter: 2, type: "multi", fromProfessor: true,
    question: "The Waterfall Model presents the software development process in a number of stages. What are the phases of the waterfall model? (Select all that apply)",
    options: [
      "Requirements analysis and definition",
      "Customer involvement",
      "System and software design",
      "Product increments",
      "Implementation and unit testing",
      "Integration and system testing",
      "Version development",
      "Operation and maintenance",
    ],
    answer: [0, 2, 4, 5, 7],
    explanation: "The five Waterfall phases: (1) Requirements analysis and definition, (2) System and software design, (3) Implementation and unit testing, (4) Integration and system testing, (5) Operation and maintenance.",
  },
  {
    id: "P8", chapter: 1, type: "single", fromProfessor: true,
    question: "Which essential software product attribute ensures the system can be adapted to meet the changing needs of customers?",
    options: ["Dependability", "Efficiency", "Security", "Maintainability", "Portability"],
    answer: [3],
    explanation: "Maintainability means software should be written so it can evolve to meet changing customer needs. One of four essential product attributes.",
  },

  // ╔═══════════════════════════════════════╗
  // ║  CHAPTER 1 — INTRODUCTION             ║
  // ╚═══════════════════════════════════════╝

  {
    id: "C1-01", chapter: 1, type: "single",
    question: "What is the key difference between software engineering and computer science?",
    options: [
      "Software engineering focuses on theories and fundamentals, while computer science focuses on practical development.",
      "Computer science focuses on theories and fundamentals, while software engineering is concerned with the practicalities of developing useful software.",
      "They are the same discipline with different names.",
      "Computer science only deals with hardware design.",
    ],
    answer: [1],
    explanation: "Computer science focuses on theory and fundamentals. Software engineering is concerned with the practicalities of developing and delivering useful software.",
  },
  {
    id: "C1-02", chapter: 1, type: "single",
    question: "Which essential attribute means the software should not cause physical or economic damage in the event of system failure?",
    options: ["Maintainability", "Acceptability", "Dependability and Security", "Efficiency"],
    answer: [2],
    explanation: "Dependability and security means software should not cause physical or economic damage upon failure. Includes reliability, security, and safety.",
  },
  {
    id: "C1-03", chapter: 1, type: "single",
    question: "Which of the following is true about maintenance costs in software engineering?",
    options: [
      "Maintenance costs are typically less than development costs.",
      "Maintenance costs usually exceed development costs for long-lived systems.",
      "Maintenance is not necessary for well-designed software.",
      "Maintenance only includes fixing bugs.",
    ],
    answer: [1],
    explanation: "For most long-lived systems, the majority of costs are in maintaining and evolving the software after deployment.",
  },
  {
    id: "C1-04", chapter: 1, type: "single",
    question: 'What is a "system of systems"?',
    options: [
      "A single monolithic application.",
      "A system built by integrating multiple independently managed systems to create a new system.",
      "A backup system that mirrors the primary system.",
      "A system that only runs on one operating system.",
    ],
    answer: [1],
    explanation: "A system of systems is created by integrating independently managed systems to form a new, larger system with emergent properties.",
  },
  {
    id: "C1-05", chapter: 1, type: "single",
    question: "Which essential product attribute means the software must be understandable, usable, and compatible with existing systems?",
    options: ["Efficiency", "Maintainability", "Acceptability", "Dependability"],
    answer: [2],
    explanation: "Acceptability means the software must be acceptable to its users — understandable, usable, and compatible with other systems they use.",
  },
  {
    id: "C1-06", chapter: 1, type: "single",
    question: "Which of the following best describes the 'efficiency' attribute of software?",
    options: [
      "Software should be easy to modify.",
      "Software should not waste system resources like memory and processor cycles.",
      "Software should be secure from external attacks.",
      "Software should be understandable to users.",
    ],
    answer: [1],
    explanation: "Efficiency means software should not waste system resources such as memory and processor cycles. Includes responsiveness and resource utilization.",
  },
  {
    id: "C1-07", chapter: 1, type: "fill",
    question: "The two types of software products are _______ products and _______ products.",
    answer: ["generic", "customized"],
    acceptableAnswers: [
      ["generic", "customized"],
      ["generic", "custom"],
      ["generic", "bespoke"],
      ["customized", "generic"],
      ["custom", "generic"],
      ["bespoke", "generic"],
    ],
    explanation: "Software products are either generic (stand-alone, sold on open market) or customized (bespoke, commissioned by a specific customer).",
  },
  {
    id: "C1-08", chapter: 1, type: "fill",
    question: "The four essential attributes of good software are maintainability, dependability and security, efficiency, and _______.",
    answer: ["acceptability"],
    acceptableAnswers: [["acceptability"], ["acceptable"]],
    explanation: "The four essential product attributes are: Maintainability, Dependability & Security, Efficiency, and Acceptability.",
  },
  {
    id: "C1-09", chapter: 1, type: "single",
    question: "In a customized software product, who controls the software specification?",
    options: [
      "The software development organization.",
      "The customer who commissions the software.",
      "The end users.",
      "The government regulatory body.",
    ],
    answer: [1],
    explanation: "For customized (bespoke) products, the customer who commissions the software controls the specification. For generic products, the developing organization controls it.",
  },
  {
    id: "C1-10", chapter: 1, type: "single",
    question: "Which of the following is NOT one of the ACM/IEEE ethical principles for software engineers?",
    options: [
      "Act in a way that is in the best interests of the public.",
      "Maintain integrity and independence in professional judgment.",
      "Maximize profit for the employing organization at all costs.",
      "Advance the integrity and reputation of the profession.",
    ],
    answer: [2],
    explanation: "Maximizing profit at all costs is NOT an ethical principle. Engineers should act in the public interest, maintain integrity, and advance the profession's reputation.",
  },
  {
    id: "C1-11", chapter: 1, type: "multi",
    question: "Which of the following are examples of software engineering challenges? (Select all that apply)",
    options: [
      "Coping with increasing diversity of systems.",
      "Demands for reduced delivery times.",
      "Developing trustworthy software.",
      "Ensuring all software is written in one programming language.",
    ],
    answer: [0, 1, 2],
    explanation: "Key SE challenges include: heterogeneity (diverse systems), delivery speed demands, and trustworthiness. Using a single language is not a recognized challenge — polyglot development is the norm.",
  },
  {
    id: "C1-12", chapter: 1, type: "fill",
    question: "For a generic product, the organization that develops the software controls the software _______.",
    answer: ["specification"],
    acceptableAnswers: [["specification"], ["spec"], ["specifications"]],
    explanation: "For generic products, the development organization controls the specification since they decide what features to include. For customized products, the customer controls it.",
  },

  // ╔═══════════════════════════════════════╗
  // ║  CHAPTER 2 — SOFTWARE PROCESSES        ║
  // ╚═══════════════════════════════════════╝

  {
    id: "C2-01", chapter: 2, type: "single",
    question: "Which software process model develops the system as a series of versions (increments), with each version adding functionality?",
    options: ["Waterfall Model", "Incremental Development", "Reuse-oriented Software Engineering", "Formal Methods"],
    answer: [1],
    explanation: "Incremental development interleaves specification, development, and validation. The system is developed as a series of versions.",
  },
  {
    id: "C2-02", chapter: 2, type: "single",
    question: "In the software process, which activity involves checking that the software meets its specification and the customer's actual needs?",
    options: ["Specification", "Design and Implementation", "Validation", "Evolution"],
    answer: [2],
    explanation: "Software validation (V&V) checks that the system conforms to its specification and meets customer needs.",
  },
  {
    id: "C2-03", chapter: 2, type: "multi",
    question: "Which of the following are general process activities common to all software processes? (Select all that apply)",
    options: ["Specification", "Design and implementation", "Pair programming", "Validation", "Evolution", "Daily standups"],
    answer: [0, 1, 3, 4],
    explanation: "The four fundamental activities: Specification, Design and Implementation, Validation, and Evolution. Pair programming and standups are specific agile practices.",
  },
  {
    id: "C2-04", chapter: 2, type: "single",
    question: "What is the primary advantage of incremental development over the waterfall model?",
    options: [
      "It requires more detailed documentation.",
      "It is easier to accommodate changing customer requirements.",
      "It requires no testing.",
      "It eliminates the need for requirements gathering.",
    ],
    answer: [1],
    explanation: "A key advantage of incremental development is easier accommodation of changing requirements through customer feedback on each increment.",
  },
  {
    id: "C2-05", chapter: 2, type: "single",
    question: "Which testing stage focuses on testing individual components in isolation?",
    options: ["System testing", "Acceptance testing", "Component (unit) testing", "Integration testing"],
    answer: [2],
    explanation: "Component (unit) testing focuses on testing individual program components independently.",
  },
  {
    id: "C2-06", chapter: 2, type: "single",
    question: "In the Integration and Configuration model, what are COTS systems?",
    options: [
      "Custom-designed systems built from scratch.",
      "Commercial Off-The-Shelf systems that can be adapted and integrated.",
      "Testing frameworks for component testing.",
      "Coding standards enforced by the team.",
    ],
    answer: [1],
    explanation: "COTS (Commercial Off-The-Shelf) are pre-existing software systems that can be configured and integrated to create new systems.",
  },
  {
    id: "C2-07", chapter: 2, type: "single",
    question: "What is the main purpose of prototyping in software development?",
    options: [
      "To create the final production version of the software.",
      "To help with requirements elicitation and validation by providing a working model.",
      "To replace the need for testing.",
      "To generate detailed documentation.",
    ],
    answer: [1],
    explanation: "Prototyping helps with requirements elicitation and validation by allowing stakeholders to experiment with a working model.",
  },
  {
    id: "C2-08", chapter: 2, type: "single",
    question: "In customer (acceptance) testing, who primarily performs the testing?",
    options: [
      "The development team.",
      "An automated testing framework.",
      "The customer or end users to validate the system meets their needs.",
      "The project manager.",
    ],
    answer: [2],
    explanation: "Acceptance testing is performed by the customer or representative users to validate the system meets their actual needs.",
  },
  {
    id: "C2-09", chapter: 2, type: "fill",
    question: "The three testing stages in order are: Component testing, _______ testing, and Customer (Acceptance) testing.",
    answer: ["system"],
    acceptableAnswers: [["system"], ["systems"]],
    explanation: "The three testing stages are: Component (unit) testing → System testing → Customer (acceptance) testing.",
  },
  {
    id: "C2-10", chapter: 2, type: "single",
    question: "Which of the following is a key disadvantage of the waterfall model?",
    options: [
      "It provides too much flexibility.",
      "It produces too little documentation.",
      "Difficulty accommodating change after the process has started.",
      "It delivers software too quickly.",
    ],
    answer: [2],
    explanation: "The waterfall model is inflexible — it's difficult to accommodate changes once a stage has been completed, making it poorly suited for evolving requirements.",
  },
  {
    id: "C2-11", chapter: 2, type: "multi",
    question: "Which of the following are strategies for coping with change in software development? (Select all that apply)",
    options: [
      "Prototyping",
      "Incremental delivery",
      "Ignoring change requests",
      "Freezing requirements permanently after the first meeting",
    ],
    answer: [0, 1],
    explanation: "Prototyping and incremental delivery are key strategies for coping with change. Ignoring changes or freezing requirements defeats the purpose of adaptable development.",
  },
  {
    id: "C2-12", chapter: 2, type: "fill",
    question: "Software _______ is the process of changing a system after it has been delivered, in response to changing requirements or discovered errors.",
    answer: ["evolution"],
    acceptableAnswers: [["evolution"], ["maintenance"]],
    explanation: "Software evolution is the ongoing process of modifying a system after delivery to adapt to changing needs, fix errors, or improve performance.",
  },
  {
    id: "C2-13", chapter: 2, type: "single",
    question: "In the waterfall model, when does the customer typically first see a working version of the software?",
    options: [
      "After the requirements phase.",
      "During the design phase.",
      "Very late in the process, often not until the system is nearly complete.",
      "Before any development begins.",
    ],
    answer: [2],
    explanation: "A major drawback of waterfall is that the customer doesn't see a working system until very late, making it hard to catch misunderstandings early.",
  },
  {
    id: "C2-14", chapter: 2, type: "single",
    question: "Which process model is most appropriate when requirements are well-understood and unlikely to change?",
    options: [
      "Agile development",
      "Waterfall model",
      "Extreme Programming",
      "Scrum",
    ],
    answer: [1],
    explanation: "The waterfall model works best when requirements are well-understood and stable, such as in safety-critical systems or when integrating with existing rigid systems.",
  },
  {
    id: "C2-15", chapter: 2, type: "single",
    question: "What is 'incremental delivery'?",
    options: [
      "Delivering the entire system at once after all development is complete.",
      "Delivering the system in increments, with each increment providing part of the required functionality.",
      "A method of delivering only documentation to the customer.",
      "Delivering software only to internal testers.",
    ],
    answer: [1],
    explanation: "Incremental delivery means deploying each increment to the customer for real use. Each increment provides a portion of the required functionality.",
  },

  // ╔═══════════════════════════════════════╗
  // ║  CHAPTER 3 — AGILE DEVELOPMENT         ║
  // ╚═══════════════════════════════════════╝

  {
    id: "C3-01", chapter: 3, type: "single",
    question: "According to the Agile Manifesto, which of the following is valued MORE?",
    options: [
      "Processes and tools over individuals and interactions.",
      "Comprehensive documentation over working software.",
      "Customer collaboration over contract negotiation.",
      "Following a plan over responding to change.",
    ],
    answer: [2],
    explanation: "The Agile Manifesto values: Individuals and interactions over processes and tools, Working software over comprehensive documentation, Customer collaboration over contract negotiation, Responding to change over following a plan.",
  },
  {
    id: "C3-02", chapter: 3, type: "single",
    question: "In XP, what is the practice of improving existing code without changing its external behavior called?",
    options: ["Pair programming", "Refactoring", "Test-first development", "Continuous integration"],
    answer: [1],
    explanation: "Refactoring is restructuring/improving existing code without changing its external behavior. It keeps code clean and reduces technical debt.",
  },
  {
    id: "C3-03", chapter: 3, type: "single",
    question: "What is 'test-first development' in XP?",
    options: [
      "Testing the software only after all code is written.",
      "Writing tests before writing the code that makes those tests pass.",
      "Having customers write all the tests.",
      "Testing only the user interface first.",
    ],
    answer: [1],
    explanation: "Test-first development (TDD) involves writing automated tests BEFORE the code, then writing the minimum code to pass, then refactoring.",
  },
  {
    id: "C3-04", chapter: 3, type: "single",
    question: "What does 'collective ownership' mean in XP?",
    options: [
      "The project manager owns all the code.",
      "All developers share responsibility for all the code, and anyone can change anything.",
      "Each developer owns specific modules that only they can modify.",
      "The customer owns the source code.",
    ],
    answer: [1],
    explanation: "Collective ownership means all developers work on all areas of the system. Anyone can change any code, preventing knowledge silos.",
  },
  {
    id: "C3-05", chapter: 3, type: "single",
    question: "In Scrum, what is the Product Backlog?",
    options: [
      "A list of bugs found during testing.",
      "A prioritized list of features, enhancements, and fixes that serves as the work to be done.",
      "The final release documentation.",
      "A record of all past sprints.",
    ],
    answer: [1],
    explanation: "The Product Backlog is a prioritized to-do list for the project containing features, enhancements, bug fixes, and other work items.",
  },
  {
    id: "C3-06", chapter: 3, type: "single",
    question: "What is the purpose of the Daily Scrum (standup)?",
    options: [
      "To assign blame for bugs.",
      "To provide a brief synchronization where team members share what they did, what they'll do, and any blockers.",
      "To write detailed design documents.",
      "To demo the product to customers.",
    ],
    answer: [1],
    explanation: "The Daily Scrum is a short (~15 min) meeting where each member shares: what they did, what they'll do, and any impediments.",
  },
  {
    id: "C3-07", chapter: 3, type: "single",
    question: "In XP, what are 'user stories'?",
    options: [
      "Detailed UML diagrams of user interactions.",
      "Short descriptions of functionality from the user's perspective, used for planning.",
      "Full requirements specification documents.",
      "Bug reports submitted by end users.",
    ],
    answer: [1],
    explanation: "User stories are short descriptions of a feature from the user's perspective, used as the basis for planning iterations.",
  },
  {
    id: "C3-08", chapter: 3, type: "single",
    question: "What does 'small releases' mean as an XP practice?",
    options: [
      "Only releasing software once a year.",
      "Releasing small, frequent increments so value is delivered to the customer quickly.",
      "Releasing only bug fixes, not new features.",
      "Only releasing to a small number of customers.",
    ],
    answer: [1],
    explanation: "Small releases means frequent, small increments so the customer receives value quickly and can provide feedback.",
  },
  {
    id: "C3-09", chapter: 3, type: "fill",
    question: "In Scrum, the three main roles are the Product Owner, the Development Team, and the _______.",
    answer: ["scrum master"],
    acceptableAnswers: [["scrum master"], ["scrummaster"], ["scrum-master"]],
    explanation: "The three Scrum roles are: Product Owner (manages backlog), Development Team (builds increments), and Scrum Master (facilitates the process).",
  },
  {
    id: "C3-10", chapter: 3, type: "fill",
    question: "The Agile Manifesto values working _______ over comprehensive documentation.",
    answer: ["software"],
    acceptableAnswers: [["software"]],
    explanation: "One of the four Agile Manifesto values: Working software over comprehensive documentation.",
  },
  {
    id: "C3-11", chapter: 3, type: "single",
    question: "Which of the following is NOT an XP practice?",
    options: [
      "Pair programming",
      "Test-first development",
      "Big up-front design",
      "Refactoring",
    ],
    answer: [2],
    explanation: "Big up-front design (BUFD) is the opposite of XP philosophy. XP favors incremental design through refactoring, not comprehensive up-front planning.",
  },
  {
    id: "C3-12", chapter: 3, type: "single",
    question: "What is pair programming?",
    options: [
      "Two programmers working on separate features simultaneously.",
      "Two programmers working together at one workstation — one writes code while the other reviews in real time.",
      "A programmer and a tester working on different machines.",
      "Two project managers reviewing the development plan.",
    ],
    answer: [1],
    explanation: "Pair programming involves two developers at one workstation: the driver writes code while the navigator reviews each line in real time. They switch roles frequently.",
  },
  {
    id: "C3-13", chapter: 3, type: "multi",
    question: "Which of the following are values of the Agile Manifesto? (Select all that apply)",
    options: [
      "Individuals and interactions over processes and tools.",
      "Working software over comprehensive documentation.",
      "Detailed contracts over customer collaboration.",
      "Responding to change over following a plan.",
    ],
    answer: [0, 1, 3],
    explanation: "The Agile Manifesto values individuals/interactions, working software, customer collaboration (NOT detailed contracts), and responding to change.",
  },
  {
    id: "C3-14", chapter: 3, type: "single",
    question: "What challenge does 'scaling agile' address?",
    options: [
      "How to use agile for solo developers.",
      "How to apply agile methods to large systems developed by large organizations.",
      "How to reduce the size of the development team.",
      "How to limit the number of features in a product.",
    ],
    answer: [1],
    explanation: "Scaling agile addresses how to apply agile principles and practices to large, complex systems developed by large, distributed organizations.",
  },
  {
    id: "C3-15", chapter: 3, type: "fill",
    question: "In XP, _______ programming involves two developers working together at one workstation.",
    answer: ["pair"],
    acceptableAnswers: [["pair"]],
    explanation: "Pair programming is an XP practice where two developers share one workstation — one writes code (driver) and the other reviews (navigator).",
  },
  {
    id: "C3-16", chapter: 3, type: "single",
    question: "What happens at the end of each Sprint in Scrum?",
    options: [
      "The project is cancelled if not complete.",
      "A Sprint Review is held to demonstrate the increment to stakeholders and get feedback.",
      "All code is deleted and restarted.",
      "The team takes a mandatory two-week break.",
    ],
    answer: [1],
    explanation: "At the end of each Sprint, a Sprint Review is held where the team demonstrates the completed increment to stakeholders and collects feedback for the next Sprint.",
  },
  {
    id: "C3-17", chapter: 3, type: "single",
    question: "Which Agile Manifesto value emphasizes adapting to new information rather than rigidly sticking to the original plan?",
    options: [
      "Individuals and interactions over processes and tools.",
      "Working software over comprehensive documentation.",
      "Customer collaboration over contract negotiation.",
      "Responding to change over following a plan.",
    ],
    answer: [3],
    explanation: "Responding to change over following a plan emphasizes flexibility and adaptation when new information or requirements emerge.",
  },

  // ╔═══════════════════════════════════════╗
  // ║  CHAPTER 4 — REQUIREMENTS ENGINEERING  ║
  // ╚═══════════════════════════════════════╝

  {
    id: "C4-01", chapter: 4, type: "single",
    question: "What is the difference between functional and non-functional requirements?",
    options: [
      "Functional requirements describe system constraints; non-functional describe what the system should do.",
      "Functional requirements describe what the system should do; non-functional describe constraints and quality attributes.",
      "There is no difference; they are interchangeable terms.",
      "Functional requirements are optional; non-functional are mandatory.",
    ],
    answer: [1],
    explanation: "Functional requirements describe what the system should do (services, behaviors). Non-functional requirements describe constraints and quality attributes (performance, security, usability).",
  },
  {
    id: "C4-02", chapter: 4, type: "multi",
    question: "Non-functional requirements can be classified into which categories? (Select all that apply)",
    options: ["Product requirements", "Organizational requirements", "External requirements", "Functional requirements", "Aesthetic requirements"],
    answer: [0, 1, 2],
    explanation: "Non-functional requirements are classified into: Product (performance, reliability), Organizational (development standards), and External (regulatory, legislative).",
  },
  {
    id: "C4-03", chapter: 4, type: "single",
    question: "What is the difference between user requirements and system requirements?",
    options: [
      "User requirements are written in natural language for stakeholders; system requirements are more detailed technical descriptions.",
      "System requirements are written in natural language; user requirements are technical specifications.",
      "User requirements are only for developers; system requirements are for managers.",
      "There is no meaningful difference between them.",
    ],
    answer: [0],
    explanation: "User requirements are high-level natural language statements for customers/stakeholders. System requirements are detailed technical descriptions for developers.",
  },
  {
    id: "C4-04", chapter: 4, type: "multi",
    question: "Which of the following are requirements elicitation techniques? (Select all that apply)",
    options: ["Interviews", "Ethnography", "Scenarios and user stories", "Pair programming", "Refactoring"],
    answer: [0, 1, 2],
    explanation: "Interviews, ethnography, and scenarios/user stories are elicitation techniques. Pair programming and refactoring are XP development practices.",
  },
  {
    id: "C4-05", chapter: 4, type: "single",
    question: "What is ethnography in the context of requirements elicitation?",
    options: [
      "A formal mathematical specification technique.",
      "An observational technique where an analyst spends time observing how people actually work to discover implicit requirements.",
      "A type of automated testing.",
      "A project management methodology.",
    ],
    answer: [1],
    explanation: "Ethnography is an observational technique where an analyst immerses in the work environment to discover implicit requirements.",
  },
  {
    id: "C4-06", chapter: 4, type: "multi",
    question: "Requirements validation checks include which of the following? (Select all that apply)",
    options: [
      "Validity checks — Do requirements reflect real needs?",
      "Consistency checks — Are there contradictions?",
      "Completeness checks — Are all functions included?",
      "Realism checks — Can requirements be implemented within budget/schedule?",
      "Verifiability checks — Can requirements be tested?",
    ],
    answer: [0, 1, 2, 3, 4],
    explanation: "All five are standard validation checks: validity, consistency, completeness, realism, and verifiability.",
  },
  {
    id: "C4-07", chapter: 4, type: "single",
    question: "What is requirements management?",
    options: [
      "The process of writing all requirements in one sitting.",
      "The process of managing changing requirements during requirements engineering and system development.",
      "Deleting requirements that are too difficult to implement.",
      "Assigning each requirement to a specific developer.",
    ],
    answer: [1],
    explanation: "Requirements management is the process of managing changes to requirements as they evolve during development.",
  },
  {
    id: "C4-08", chapter: 4, type: "single",
    question: "Who are stakeholders in requirements engineering?",
    options: [
      "Only the development team.",
      "Only the end users of the system.",
      "Anyone who is affected by the system, including end users, managers, engineers, domain experts, and others.",
      "Only the project manager and the client.",
    ],
    answer: [2],
    explanation: "Stakeholders include anyone who has an interest in or is affected by the system.",
  },
  {
    id: "C4-09", chapter: 4, type: "single",
    question: "What is the main problem with writing requirements in natural language?",
    options: [
      "It's too expensive.",
      "Natural language is inherently ambiguous, which can lead to misunderstandings.",
      "Only programmers can understand natural language specifications.",
      "Natural language cannot express functional requirements.",
    ],
    answer: [1],
    explanation: "Natural language is inherently ambiguous. The same statement can be interpreted differently by different readers.",
  },
  {
    id: "C4-10", chapter: 4, type: "fill",
    question: "The three types of non-functional requirements are product requirements, organizational requirements, and _______ requirements.",
    answer: ["external"],
    acceptableAnswers: [["external"]],
    explanation: "Non-functional requirements are classified into: Product, Organizational, and External requirements.",
  },
  {
    id: "C4-11", chapter: 4, type: "fill",
    question: "Requirements _______ is the process of discovering, analyzing, documenting, and checking requirements.",
    answer: ["engineering"],
    acceptableAnswers: [["engineering"], ["elicitation"]],
    explanation: "Requirements engineering encompasses the full process of discovering, analyzing, documenting, and validating requirements.",
  },
  {
    id: "C4-12", chapter: 4, type: "single",
    question: "Which elicitation technique involves creating a narrative description of how a user interacts with the system to accomplish a goal?",
    options: [
      "Ethnography",
      "Interviews",
      "Scenarios",
      "Brainstorming",
    ],
    answer: [2],
    explanation: "Scenarios are narrative descriptions that describe a specific interaction between a user and the system to accomplish a particular goal.",
  },
  {
    id: "C4-13", chapter: 4, type: "single",
    question: "A requirement that states 'The system shall process 99.9% of transactions within 2 seconds' is an example of what type of requirement?",
    options: [
      "Functional requirement",
      "Non-functional product requirement",
      "Non-functional organizational requirement",
      "Non-functional external requirement",
    ],
    answer: [1],
    explanation: "Performance constraints like response time are non-functional product requirements — they specify how the system should perform, not what it should do.",
  },
  {
    id: "C4-14", chapter: 4, type: "single",
    question: "A requirement that states 'The system must comply with HIPAA regulations' is an example of what type of requirement?",
    options: [
      "Functional requirement",
      "Non-functional product requirement",
      "Non-functional organizational requirement",
      "Non-functional external requirement",
    ],
    answer: [3],
    explanation: "Regulatory and legislative compliance requirements are non-functional external requirements — they come from factors external to the system and its development organization.",
  },
  {
    id: "C4-15", chapter: 4, type: "multi",
    question: "Which of the following are activities in the requirements engineering process? (Select all that apply)",
    options: [
      "Requirements elicitation",
      "Requirements specification",
      "Requirements validation",
      "Requirements implementation",
      "Requirements negotiation",
    ],
    answer: [0, 1, 2, 4],
    explanation: "The requirements engineering process includes: elicitation, analysis/negotiation, specification, and validation. Implementation is a later development phase, not an RE activity.",
  },
  {
    id: "C4-16", chapter: 4, type: "fill",
    question: "_______ requirements define the services the system should provide, how the system should react to inputs, and how it should behave in particular situations.",
    answer: ["functional"],
    acceptableAnswers: [["functional"]],
    explanation: "Functional requirements define the system's services, reactions to inputs, and behaviors in specific situations.",
  },

  // ╔═══════════════════════════════════════╗
  // ║  FREE RESPONSE (always included)       ║
  // ╚═══════════════════════════════════════╝

  {
    id: "FR1", chapter: 3, type: "free", fromProfessor: false,
    question: "Describe the four core values of the Agile Manifesto. For each value, explain what is valued more and what is valued less, and why this matters for software development.",
    answer: [],
    explanation: "The Agile Manifesto states four core values: (1) Individuals and interactions over processes and tools — people and communication matter most. (2) Working software over comprehensive documentation — functional software is the primary measure of progress. (3) Customer collaboration over contract negotiation — close collaboration leads to better outcomes. (4) Responding to change over following a plan — adaptability matters because requirements evolve. Items on the right still have value, but items on the left are valued more.",
  },
  {
    id: "FR2", chapter: 2, type: "free", fromProfessor: false,
    question: "Compare and contrast the Waterfall Model with Incremental Development. Discuss the advantages and disadvantages of each, and explain in which situations each model would be most appropriate.",
    answer: [],
    explanation: "Waterfall: Sequential phases (requirements → design → implementation → testing → maintenance). Pros: clear structure, good documentation, suits stable requirements. Cons: inflexible, late problem discovery. Best for: safety-critical systems, stable requirements. Incremental: Interleaved activities with multiple versions. Pros: early delivery, customer feedback, adaptable. Cons: less visible process, potential structure degradation. Best for: business systems where requirements may change.",
  },
];

// Export for use in main app
window.QUESTION_BANK = QUESTION_BANK;
