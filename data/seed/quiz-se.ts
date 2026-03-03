import type { QuizSet } from "@/lib/types";

export const softwareEngineeringQuizSets: QuizSet[] = [
  {
    id: "se-exam1-review",
    courseId: "software-engineering",
    title: "Exam 1 Review: Chapters 1–4",
    description: "Comprehensive review covering Introduction, Software Processes, Agile Development, and Requirements Engineering — aligned with exam keywords and lecture material.",
    difficulty: "Intermediate",
    estMinutes: 35,
    tags: ["exam-1", "chapters-1-4", "exam-aligned"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "se-exam-q1",
        type: "single",
        prompt: "Which of the following is **NOT** one of the four essential product attributes of professional software?",
        options: [
          "Maintainability — can evolve with changing needs",
          "Dependability & Security — safe, reliable, trusted behavior",
          "Scalability — handles increasing workload without redesign",
          "Acceptability — understandable, usable, and compatible for users"
        ],
        correct: [2],
        explanation: "The four essential attributes are **Maintainability**, **Dependability & Security**, **Efficiency** (not wasting resources), and **Acceptability**. Scalability is important but not one of the four core attributes from the textbook.",
        walkthroughSteps: [
          "**Maintainability**: Software should evolve with changing needs.",
          "**Dependability & Security**: Software should be reliable, safe, and secure.",
          "**Efficiency**: Should not waste system resources (compute, memory).",
          "**Acceptability**: Must be understandable, usable, and compatible for its intended users.",
          "Scalability is a valid software quality, but it's not one of these four core attributes from Chapter 1."
        ],
        references: ["Chapter 1 — Essential Product Attributes", "Exam 1 Keywords"],
        tags: ["product-attributes", "chapter-1"]
      },
      {
        id: "se-exam-q2",
        type: "single",
        prompt: "How does **Software Engineering** differ from **Computer Science**?",
        options: [
          "Software Engineering focuses on practical software development with constraints; Computer Science focuses on theories and fundamentals",
          "Computer Science is applied; Software Engineering is theoretical",
          "They are the same discipline with different names",
          "Software Engineering only covers testing; Computer Science covers everything else"
        ],
        correct: [0],
        explanation: "**Software Engineering** is concerned with the practical aspects of developing and delivering useful software within real-world constraints (cost, schedule, organizational). **Computer Science** focuses on the theoretical foundations and fundamentals of computation.",
        walkthroughSteps: [
          "**Computer Science**: Theories of computation, algorithms, data structures, formal methods — foundational knowledge.",
          "**Software Engineering**: Applying engineering principles to build real software — deals with constraints like budget, deadlines, team coordination.",
          "SE includes process models, project management, requirements engineering, testing strategies — all practical concerns.",
          "Both are essential: CS gives you the theory, SE gives you the discipline to build reliable systems."
        ],
        references: ["Chapter 1 — SE vs CS", "Exam 1 Keywords"],
        tags: ["definitions", "chapter-1"]
      },
      {
        id: "se-exam-q3",
        type: "single",
        prompt: "In the **Waterfall Model**, which statement is most accurate?",
        options: [
          "It is sequential and plan-driven, with strong documentation but weak flexibility for change",
          "It encourages frequent delivery of working software in 2-week sprints",
          "It allows going back to any previous phase at any time without cost",
          "It was designed specifically for web application development"
        ],
        correct: [0],
        explanation: "The Waterfall Model is **sequential** and **plan-driven**: each phase (requirements → design → implementation → testing → maintenance) must be completed before the next begins. It produces strong documentation but handles change poorly.",
        walkthroughSteps: [
          "**Waterfall phases** (in order): Requirements → Design → Implementation → Verification → Maintenance.",
          "Each phase produces documentation that feeds into the next — very **plan-driven**.",
          "**Weakness**: Going back to a previous phase is expensive. Requirements must be well-understood upfront.",
          "**Best for**: Systems with stable, well-understood requirements (e.g., safety-critical systems)."
        ],
        references: ["Chapter 2 — Software Process Models", "Exam 1 Keywords"],
        tags: ["waterfall", "process-models", "chapter-2"]
      },
      {
        id: "se-exam-q4",
        type: "single",
        prompt: "What is the key difference between **Incremental Development** and the Waterfall Model?",
        options: [
          "Incremental delivers in slices with early feedback; Waterfall delivers everything at the end",
          "Incremental has no documentation; Waterfall has extensive documentation",
          "Waterfall is faster than Incremental",
          "Incremental only works for small projects"
        ],
        correct: [0],
        explanation: "**Incremental Development** delivers the system in slices (increments), getting early user feedback and supporting change. Each increment adds functionality. The Waterfall model delivers the complete system only at the end of the process.",
        walkthroughSteps: [
          "**Waterfall**: Complete all requirements → all design → all implementation → deliver. Feedback comes late.",
          "**Incremental**: Define initial requirements → develop first increment → get feedback → develop next increment.",
          "Incremental supports **changing requirements** — you can adjust direction based on user feedback.",
          "Incremental does have documentation, just less formal than Waterfall. Both approaches can work for large projects."
        ],
        references: ["Chapter 2 — Incremental Development", "Exam 1 Keywords"],
        tags: ["incremental", "process-models", "chapter-2"]
      },
      {
        id: "se-exam-q5",
        type: "multi",
        prompt: "Which of the following are values from the **Agile Manifesto**? (Select all that apply)",
        options: [
          "Individuals and interactions over processes and tools",
          "Working software over comprehensive documentation",
          "Detailed planning over responding to change",
          "Customer collaboration over contract negotiation"
        ],
        correct: [0, 1, 3],
        explanation: "The four Agile Manifesto values are: (1) Individuals and interactions over processes and tools, (2) Working software over comprehensive documentation, (3) Customer collaboration over contract negotiation, (4) **Responding to change** over following a plan. Option C reverses the fourth value.",
        walkthroughSteps: [
          "**Value 1**: Individuals and interactions > processes and tools. ✓",
          "**Value 2**: Working software > comprehensive documentation. ✓",
          "**Value 3**: Customer collaboration > contract negotiation. ✓",
          "**Value 4**: Responding to change > following a plan. Option C says the **opposite** — detailed planning over responding to change. ✗",
          "Remember: Agile values the items on the LEFT more, but doesn't say the RIGHT items have no value."
        ],
        references: ["Chapter 3 — Agile Manifesto", "Exam 1 Keywords"],
        tags: ["agile", "manifesto", "chapter-3"]
      },
      {
        id: "se-exam-q6",
        type: "single",
        prompt: "In the **Scrum** framework, what is a **Sprint**?",
        options: [
          "A fixed time period (usually 2–4 weeks) during which a system increment is developed",
          "A daily 15-minute standup meeting",
          "The final release of the product",
          "A tool for tracking bugs"
        ],
        correct: [0],
        explanation: "A **Sprint** is a fixed time period, typically 2–4 weeks, during which the team develops a potentially shippable product increment. Sprints have a fixed end date and a defined set of work from the product backlog.",
        walkthroughSteps: [
          "**Sprint**: Fixed timebox (2–4 weeks) for developing an increment. The core unit of work in Scrum.",
          "**Daily Scrum**: The 15-minute standup meeting (not the sprint itself).",
          "**Product Backlog**: Prioritized list of features/requirements maintained by the Product Owner.",
          "**Sprint Review**: Demo at end of sprint. **Sprint Retrospective**: Team reflects on process improvement."
        ],
        references: ["Chapter 3 — Scrum Framework", "Exam 1 Keywords"],
        tags: ["scrum", "sprint", "agile", "chapter-3"]
      },
      {
        id: "se-exam-q7",
        type: "multi",
        prompt: "Which are **Extreme Programming (XP)** practices? (Select all that apply)",
        options: [
          "Test-first development (write tests before code)",
          "Pair programming",
          "Big upfront design document",
          "Refactoring and small releases"
        ],
        correct: [0, 1, 3],
        explanation: "XP practices include **test-first development**, **pair programming**, **refactoring**, **small releases**, **collective ownership**, and **user stories**. Big upfront design contradicts XP's philosophy of emergent design.",
        walkthroughSteps: [
          "**Test-first**: Write tests before code → ensures all code is testable and meets requirements. ✓",
          "**Pair programming**: Two developers at one workstation → code review in real-time. ✓",
          "**Refactoring & small releases**: Continuously improve code structure; release frequently. ✓",
          "**Big upfront design**: This is a Waterfall-style practice. XP uses **incremental design** that evolves. ✗"
        ],
        references: ["Chapter 3 — XP Practices", "Exam 1 Keywords"],
        tags: ["xp", "agile", "practices", "chapter-3"]
      },
      {
        id: "se-exam-q8",
        type: "single",
        prompt: "What is the difference between **User Requirements** and **System Requirements**?",
        options: [
          "User requirements are high-level natural language descriptions; system requirements are detailed technical specifications",
          "User requirements are written by developers; system requirements are written by customers",
          "They are the same thing at different stages of the project",
          "User requirements are optional; system requirements are mandatory"
        ],
        correct: [0],
        explanation: "**User requirements** are high-level statements in natural language describing what the system should do from the user's perspective. **System requirements** are detailed technical descriptions of what the system must implement, including functional and non-functional specifications.",
        walkthroughSteps: [
          "**User requirements**: Written for customers/end users. High-level, natural language, may include diagrams.",
          "**System requirements**: Written for developers. Detailed, precise, may use formal notation.",
          "Example: User req = 'The system shall allow users to search for flights.' System req = 'The search API shall return results within 200ms for queries up to 10 parameters.'",
          "Both are important: user requirements capture WHAT is needed; system requirements capture HOW it's specified."
        ],
        references: ["Chapter 4 — Requirements Engineering", "Exam 1 Keywords"],
        tags: ["requirements", "user-vs-system", "chapter-4"]
      },
      {
        id: "se-exam-q9",
        type: "single",
        prompt: "Which of the following is a **non-functional requirement**?",
        options: [
          "The system shall allow users to create an account",
          "The system shall respond to queries within 2 seconds",
          "The system shall display a list of products",
          "The system shall send email notifications"
        ],
        correct: [1],
        explanation: "Non-functional requirements define **quality constraints** on how the system performs, not what it does. Response time (2 seconds) is a **performance** non-functional requirement. The others describe specific functions the system must perform.",
        walkthroughSteps: [
          "**Functional requirements**: What the system DOES — features, behaviors, operations.",
          "**Non-functional requirements**: How WELL the system does it — constraints on quality.",
          "Non-functional categories: **Product** (performance, reliability, usability), **Organizational** (process standards), **External** (legal, regulatory).",
          "Option B (response time ≤ 2 seconds) is a **product/performance** non-functional requirement.",
          "Options A, C, D all describe specific features → functional requirements."
        ],
        references: ["Chapter 4 — Non-functional Requirements", "Exam 1 Keywords"],
        tags: ["requirements", "non-functional", "chapter-4"]
      },
      {
        id: "se-exam-q10",
        type: "multi",
        prompt: "Which are valid **requirements validation checks**? (Select all that apply)",
        options: [
          "Validity — do requirements reflect real user needs?",
          "Consistency — do requirements contradict each other?",
          "Completeness — are all functions and constraints included?",
          "Profitability — will the requirements generate revenue?"
        ],
        correct: [0, 1, 2],
        explanation: "The standard validation checks are: **Validity**, **Consistency**, **Completeness**, **Realism** (can it be implemented?), and **Verifiability** (can it be tested?). Profitability is a business concern, not a requirements validation check.",
        walkthroughSteps: [
          "**Validity**: Do the requirements actually match what users need? (Not just what they said they want.)",
          "**Consistency**: No requirements contradict each other.",
          "**Completeness**: All necessary functions and constraints are specified.",
          "**Realism**: Requirements can be implemented with available technology and budget.",
          "**Verifiability**: Each requirement can be tested to confirm it's met.",
          "Profitability is important for business decisions but is not part of requirements validation."
        ],
        references: ["Chapter 4 — Requirements Validation", "Exam 1 Keywords"],
        tags: ["requirements", "validation", "chapter-4"]
      },
      {
        id: "se-exam-q11",
        type: "single",
        prompt: "Which requirements elicitation technique involves the analyst **observing users in their actual work environment**?",
        options: [
          "Interviews",
          "Ethnography",
          "Prototyping",
          "Use case modeling"
        ],
        correct: [1],
        explanation: "**Ethnography** involves an analyst spending time observing and understanding how users actually work in their environment. It reveals implicit requirements that users may not articulate in interviews.",
        walkthroughSteps: [
          "**Interviews**: Direct questioning of stakeholders — good for explicit requirements.",
          "**Ethnography**: Observation in the real work environment — reveals implicit practices and workflows.",
          "**Scenarios/User Stories**: Describe specific interactions with the system.",
          "**Prototyping**: Building mock-ups to elicit feedback on requirements.",
          "Ethnography is especially useful for understanding **how work is actually done** versus how people describe it."
        ],
        references: ["Chapter 4 — Elicitation Techniques", "Exam 1 Keywords"],
        tags: ["requirements", "elicitation", "ethnography", "chapter-4"]
      },
      {
        id: "se-exam-q12",
        type: "single",
        prompt: "In software processes, what is the relationship between **prototyping** and coping with change?",
        options: [
          "Prototypes help stakeholders validate requirements early, reducing costly late changes",
          "Prototypes replace the need for requirements entirely",
          "Prototypes are always delivered as the final product",
          "Prototyping is only used in Waterfall development"
        ],
        correct: [0],
        explanation: "Prototyping helps stakeholders **visualize and validate** requirements early. This reduces the risk of expensive changes late in development. However, prototypes are typically **throw-away** — not production-ready.",
        walkthroughSteps: [
          "**Coping with change** is a major challenge in software development.",
          "Two key strategies: **Prototyping** and **Incremental Delivery**.",
          "Prototyping lets stakeholders see a working model early → they can refine requirements before full implementation.",
          "Important: prototypes are often **throw-away** — they demonstrate ideas but aren't built for production quality.",
          "This saves cost because catching requirement misunderstandings early is far cheaper than fixing them after deployment."
        ],
        references: ["Chapter 2 — Coping with Change", "Exam 1 Keywords"],
        tags: ["prototyping", "change", "process-models", "chapter-2"]
      },
      {
        id: "se-exam-q13",
        type: "single",
        prompt: "What are the three **testing stages** in order?",
        options: [
          "Component (Unit) Testing → System Testing → Customer (Acceptance) Testing",
          "System Testing → Component Testing → Acceptance Testing",
          "Acceptance Testing → System Testing → Unit Testing",
          "Integration Testing → Regression Testing → Deployment Testing"
        ],
        correct: [0],
        explanation: "The three testing stages progress from small to large: **Component (Unit) Testing** tests individual parts, **System Testing** tests the integrated system, and **Customer (Acceptance) Testing** validates the system meets user needs.",
        walkthroughSteps: [
          "**Component/Unit Testing**: Test individual functions, classes, or modules in isolation.",
          "**System Testing**: Test the fully integrated system — components working together.",
          "**Acceptance Testing**: Customer validates the system meets their requirements in a real or simulated environment.",
          "The order is bottom-up: small parts first, then the whole system, then user validation."
        ],
        references: ["Chapter 2 — Testing Stages", "Exam 1 Keywords"],
        tags: ["testing", "stages", "chapter-2"]
      },
      {
        id: "se-exam-q14",
        type: "single",
        prompt: "True or False: **Maintenance costs** usually exceed initial development costs for long-lived software systems.",
        options: [
          "True — maintaining, updating, and evolving software over its lifetime typically costs more than building it",
          "False — initial development is always the most expensive phase",
          "False — maintenance is automated and costs nothing",
          "True — but only for government software"
        ],
        correct: [0],
        explanation: "This is **true**. For long-lived systems, maintenance (bug fixes, adaptations, enhancements) typically costs **2–100x** more than initial development. This is why maintainability is a core software quality attribute.",
        walkthroughSteps: [
          "Software doesn't just get built and left alone — it must be maintained throughout its lifetime.",
          "Maintenance includes: **bug fixes**, **adapting to new environments**, **adding new features**, and **improving performance**.",
          "Studies show maintenance can be **60–80%** of total software lifecycle cost.",
          "This is exactly why **maintainability** is one of the four essential product attributes."
        ],
        references: ["Chapter 1 — Maintenance Costs"],
        tags: ["maintenance", "costs", "chapter-1"]
      }
    ]
  }
];
