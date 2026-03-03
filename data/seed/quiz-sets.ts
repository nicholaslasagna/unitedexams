import type { QuizSet } from "@/lib/types";
import { computerArchitectureQuizSets } from "./quiz-ca";
import { automataQuizSets } from "./quiz-automata";
import { softwareEngineeringQuizSets } from "./quiz-se";
import { testReviewQuizSetReplacements } from "./quiz-test-reviews";

const legacyQuizSets: QuizSet[] = [
  {
    "id": "se-core-legacy",
    "courseId": "software-engineering",
    "title": "Software Engineering Test 1 (Legacy Core)",
    "description": "Imported from existing question bank used in your current workspace.",
    "difficulty": "Intermediate",
    "estMinutes": 28,
    "tags": [
      "legacy",
      "core",
      "professor-aligned"
    ],
    "timerDefaultMinutes": 25,
    "questions": [
      {
        "id": "se-core-legacy-q1",
        "type": "single",
        "prompt": "In a \"Plan-driven\" process, how is progress typically measured?",
        "options": [
          "By the number of user stories completed each day.",
          "Against a pre-determined plan of activities and stages.",
          "Based on the customer's satisfaction at the end of each sprint.",
          "Based on the level of pair programming used."
        ],
        "correct": [
          1
        ],
        "explanation": "In plan-driven processes, progress is measured against a pre-determined plan with defined activities and stages.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "plan-driven",
          "process-models",
          "waterfall",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q2",
        "type": "single",
        "prompt": "In the Scrum agile method, what is a \"Sprint\"?",
        "options": [
          "A race between developers to finish their code.",
          "A fixed time period, usually 2-4 weeks, during which a system increment is developed.",
          "A meeting where the Scrum Master reports to the CEO.",
          "The process of moving requirements from the product backlog to the archive.",
          "A specialized tool used for automated testing.",
          "The final release of the software to the customer.",
          "A method for scaling agile to large organizations."
        ],
        "correct": [
          1
        ],
        "explanation": "A Sprint is a fixed time period (typically 2-4 weeks) during which a potentially shippable system increment is developed.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "scrum",
          "sprint",
          "agile-practices",
          "chapter-3"
        ]
      },
      {
        "id": "se-core-legacy-q3",
        "type": "single",
        "prompt": "Software engineering ethics dictate that engineers should NOT:",
        "options": [
          "Respect the confidentiality of employers or clients.",
          "Misuse their skills to take over or damage others' computers.",
          "Be honest about their level of competence.",
          "Support the professional software development of their colleagues."
        ],
        "correct": [
          1
        ],
        "explanation": "B is what engineers should NOT do. Misusing skills to damage others' computers is unethical.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "ethics",
          "professional-responsibility",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q4",
        "type": "multi",
        "prompt": "What are the characteristics of agile development? (Select all that apply)",
        "options": [
          "Detailed documentation.",
          "Mostly focused on coding.",
          "Frequent delivery of new versions.",
          "Implementation starts after the system design has been fully completed.",
          "Minimal documentation.",
          "None of the above."
        ],
        "correct": [
          1,
          2,
          4
        ],
        "explanation": "Agile: focus on coding, frequent delivery, minimal documentation.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "agile-characteristics",
          "agile-principles",
          "documentation",
          "chapter-3"
        ]
      },
      {
        "id": "se-core-legacy-q5",
        "type": "single",
        "prompt": "The prototype of the software will be very close to the final software version. Therefore, the prototype should not be discarded.",
        "options": [
          "True",
          "False"
        ],
        "correct": [
          1
        ],
        "explanation": "False. Prototypes are throw-away — built to explore requirements, not to become the final product.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "prototyping",
          "coping-with-change",
          "chapter-2"
        ]
      },
      {
        "id": "se-core-legacy-q6",
        "type": "single",
        "prompt": "There are two types of software products: Generic products and customized products. Which one of the following statements is true about a generic product?",
        "options": [
          "Software that is commissioned for specific customer needs.",
          "Software that is developed to maintain the hardware in a specific factory.",
          "Software made for any customer who wants to buy it.",
          "Banking app made for a specific bank to manage its internal activities (ex: Citi bank)."
        ],
        "correct": [
          2
        ],
        "explanation": "Generic products (COTS) are sold to any customer on the open market.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "generic-vs-customized",
          "product-types",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q7",
        "type": "multi",
        "prompt": "The Waterfall Model presents the software development process in a number of stages. What are the phases of the waterfall model? (Select all that apply)",
        "options": [
          "Requirements analysis and definition",
          "Customer involvement",
          "System and software design",
          "Product increments",
          "Implementation and unit testing",
          "Integration and system testing",
          "Version development",
          "Operation and maintenance"
        ],
        "correct": [
          0,
          2,
          4,
          5,
          7
        ],
        "explanation": "Waterfall phases: Requirements → Design → Implementation/unit testing → Integration/system testing → Operation/maintenance.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "waterfall",
          "waterfall-phases",
          "process-models",
          "chapter-2"
        ]
      },
      {
        "id": "se-core-legacy-q8",
        "type": "single",
        "prompt": "Which essential software product attribute ensures the system can be adapted to meet the changing needs of customers?",
        "options": [
          "Dependability",
          "Efficiency",
          "Security",
          "Maintainability",
          "Portability"
        ],
        "correct": [
          3
        ],
        "explanation": "Maintainability = software can evolve with changing customer needs.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "essential-attributes",
          "maintainability",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q9",
        "type": "single",
        "prompt": "What is the key difference between software engineering and computer science?",
        "options": [
          "Software engineering is the study of algorithms and data structures in isolation.",
          "Computer science focuses on theory and fundamentals while software engineering focuses on practical development.",
          "Computer science deals exclusively with hardware and circuit design.",
          "Software engineering only covers the testing phase of development.",
          "They are identical disciplines with different names used at different universities.",
          "Computer science is about building products while software engineering is about theory."
        ],
        "correct": [
          1
        ],
        "explanation": "CS = theory and fundamentals. SE = practical development and delivery.",
        "tags": [
          "se-vs-cs",
          "definitions",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q10",
        "type": "single",
        "prompt": "Which essential attribute means the software should not cause physical or economic damage in the event of system failure?",
        "options": [
          "Maintainability — the system can be changed to meet evolving needs.",
          "Acceptability — the system is usable and compatible with other tools.",
          "Dependability and Security — the system should not cause damage upon failure.",
          "Efficiency — the system does not waste memory or processor resources.",
          "Portability — the system can run on multiple hardware platforms.",
          "Scalability — the system can handle growing numbers of users."
        ],
        "correct": [
          2
        ],
        "explanation": "Dependability and security = no physical or economic damage upon failure.",
        "tags": [
          "essential-attributes",
          "dependability",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q11",
        "type": "single",
        "prompt": "Which of the following is true about maintenance costs in software engineering?",
        "options": [
          "Maintenance costs are typically a small fraction of development costs.",
          "Maintenance costs usually exceed development costs for long-lived systems.",
          "Maintenance is unnecessary for software that was well-designed initially.",
          "Maintenance only involves correcting bugs found after initial deployment.",
          "Maintenance costs decrease as the software ages and stabilizes over time.",
          "Maintenance is only required for customized products, not generic ones."
        ],
        "correct": [
          1
        ],
        "explanation": "For most long-lived systems, maintenance costs exceed development costs.",
        "tags": [
          "maintenance-costs",
          "evolution",
          "chapter-1"
        ]
      },
      {
        "id": "se-core-legacy-q12",
        "type": "single",
        "prompt": "What is a \"system of systems\"?",
        "options": [
          "A single monolithic application deployed across multiple servers for redundancy.",
          "A system built by integrating multiple independently managed systems together.",
          "A backup system that mirrors the primary system for disaster recovery.",
          "A system that only runs on one specific operating system or platform.",
          "A development methodology where systems are built in sequential layers.",
          "A testing framework that validates systems against multiple specifications."
        ],
        "correct": [
          1
        ],
        "explanation": "System of systems = integrating independently managed systems into a larger system.",
        "tags": [
          "system-of-systems",
          "definitions",
          "chapter-1"
        ]
      }
    ]
  },
  {
    "id": "se-reinforce-legacy",
    "courseId": "software-engineering",
    "title": "Software Engineering Reinforcement (Legacy)",
    "description": "Targeted reinforcement set imported from your existing bank.",
    "difficulty": "Intermediate",
    "estMinutes": 24,
    "tags": [
      "legacy",
      "reinforcement"
    ],
    "timerDefaultMinutes": 22,
    "questions": [
      {
        "id": "se-reinforce-legacy-q1",
        "type": "single",
        "prompt": "A client says: 'We need new regulatory reporting features every quarter as laws change.' Which essential attribute is MOST important here?",
        "options": [
          "Efficiency — the system must use minimal processing resources.",
          "Maintainability — the system must be easily modified for new requirements.",
          "Dependability — the system must never crash during normal operations.",
          "Acceptability — the system must be intuitive for non-technical staff.",
          "Security — the system must prevent all unauthorized data access.",
          "Portability — the system must run on both Windows and macOS."
        ],
        "correct": [
          1
        ],
        "explanation": "Frequently changing features = maintainability is critical.",
        "tags": [
          "essential-attributes",
          "maintainability",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q2",
        "type": "single",
        "prompt": "A medical device software failure could endanger patients in a hospital. Which essential attribute should be the TOP priority?",
        "options": [
          "Acceptability — patients should find the interface easy to use.",
          "Efficiency — the device must respond within strict time constraints.",
          "Dependability and Security — failures could cause physical harm.",
          "Maintainability — the device software must be updated frequently.",
          "Portability — the device must work across different hospital systems.",
          "Scalability — the device must support hundreds of simultaneous users."
        ],
        "correct": [
          2
        ],
        "explanation": "Potential physical harm = dependability and security is top priority.",
        "tags": [
          "essential-attributes",
          "dependability",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q3",
        "type": "single",
        "prompt": "An embedded system for a satellite has only 256KB of RAM and limited battery. Which attribute is most constrained?",
        "options": [
          "Maintainability — the software needs to be updated after launch.",
          "Efficiency — severely limited resources make resource usage critical.",
          "Acceptability — astronauts must find the interface comfortable to use.",
          "Dependability — the satellite must operate reliably in orbit for years.",
          "Security — the system must prevent unauthorized command transmissions.",
          "Portability — the system must run on multiple satellite platforms."
        ],
        "correct": [
          1
        ],
        "explanation": "Severely limited resources = efficiency is the critical constraint.",
        "tags": [
          "essential-attributes",
          "efficiency",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q4",
        "type": "single",
        "prompt": "Users find a new payroll system confusing and incompatible with their existing HR tools. Which attribute is lacking?",
        "options": [
          "Dependability — the system crashes frequently during payroll runs.",
          "Acceptability — the system is not usable or compatible with existing tools.",
          "Maintainability — the development team cannot add new features easily.",
          "Efficiency — the system takes too long to process payroll calculations.",
          "Security — unauthorized employees can access salary information.",
          "Portability — the system only works on one specific web browser."
        ],
        "correct": [
          1
        ],
        "explanation": "Confusing + incompatible with existing tools = poor acceptability.",
        "tags": [
          "essential-attributes",
          "acceptability",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q5",
        "type": "multi",
        "prompt": "Which of the following are the four essential attributes of good software? (Select all that apply)",
        "options": [
          "Maintainability — ability to evolve with changing needs.",
          "Scalability — ability to handle growing user loads.",
          "Dependability and Security — reliability and protection from harm.",
          "Efficiency — responsible use of system resources.",
          "Acceptability — usable, understandable, and compatible.",
          "Portability — ability to run on multiple operating systems."
        ],
        "correct": [
          0,
          2,
          3,
          4
        ],
        "explanation": "The four: Maintainability, Dependability & Security, Efficiency, Acceptability.",
        "tags": [
          "essential-attributes",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q6",
        "type": "single",
        "prompt": "An engineer discovers their employer is knowingly shipping software with critical security flaws. Per the ACM/IEEE Code, they should prioritize:",
        "options": [
          "Unconditional loyalty to their employer above all other concerns.",
          "The public interest and safety over organizational loyalty.",
          "Meeting the delivery deadline regardless of any quality concerns.",
          "Keeping quiet to avoid creating conflict within the organization.",
          "Requesting a raise in compensation for taking on additional risk.",
          "Waiting to see if customers actually discover the security flaws."
        ],
        "correct": [
          1
        ],
        "explanation": "Public interest and safety = highest priority in the code of ethics.",
        "tags": [
          "ethics",
          "professional-responsibility",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q7",
        "type": "single",
        "prompt": "An engineer is asked to work on a project outside their area of expertise. Per professional ethics, they should:",
        "options": [
          "Accept the assignment and figure it out silently without telling anyone.",
          "Be honest about their competence level and seek training or assistance.",
          "Decline all work that falls outside their specific area of expertise.",
          "Blame any resulting failures on the project manager who assigned them.",
          "Outsource the work to a third party without informing their employer.",
          "Agree enthusiastically and hope the team carries the technical load."
        ],
        "correct": [
          1
        ],
        "explanation": "Be honest about competence; seek training or assistance as needed.",
        "walkthroughSteps": [
          "Be honest about competence.",
          "seek training or assistance as needed."
        ],
        "tags": [
          "ethics",
          "professional-responsibility",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q8",
        "type": "single",
        "prompt": "Microsoft Word is an example of which type of software product?",
        "options": [
          "A customized product built for a specific organization's needs.",
          "A generic product sold on the open market to any interested buyer.",
          "An open-source product maintained by a community of volunteers.",
          "An embedded product designed for a specific hardware platform only.",
          "A prototype product used to explore requirements before full development.",
          "A legacy product that is no longer maintained or updated by Microsoft."
        ],
        "correct": [
          1
        ],
        "explanation": "Sold to anyone on the open market = generic product.",
        "tags": [
          "generic-vs-customized",
          "product-types",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q9",
        "type": "single",
        "prompt": "Who decides what features to include in the next version of a generic software product?",
        "options": [
          "Individual customers submit feature requests that must be implemented.",
          "The development organization decides based on market analysis and strategy.",
          "Government regulators mandate specific features that must be included.",
          "End users vote democratically on which features should be prioritized.",
          "An independent standards body publishes required feature specifications.",
          "The QA team determines features based on which areas have the most bugs."
        ],
        "correct": [
          1
        ],
        "explanation": "For generic products, the development organization controls the specification.",
        "tags": [
          "generic-vs-customized",
          "specification-control",
          "chapter-1"
        ]
      },
      {
        "id": "se-reinforce-legacy-q10",
        "type": "single",
        "prompt": "In the Waterfall Model, which phase comes immediately after 'System and software design'?",
        "options": [
          "Requirements analysis and definition — gathering what users need.",
          "Implementation and unit testing — building and testing individual modules.",
          "Integration and system testing — combining and testing the full system.",
          "Operation and maintenance — deploying and supporting the live system.",
          "Project planning and scheduling — creating timelines and milestones.",
          "Customer acceptance testing — having users validate the final product."
        ],
        "correct": [
          1
        ],
        "explanation": "Sequence: Requirements → Design → Implementation and unit testing.",
        "tags": [
          "waterfall",
          "waterfall-phases",
          "chapter-2"
        ]
      }
    ]
  },
  {
    "id": "de-core-legacy",
    "courseId": "differential-equations",
    "title": "Differential Equations Test 1 (Legacy Core)",
    "description": "Open-ended Differential Equations practice with free-response answers and progressive hints.",
    "difficulty": "Advanced",
    "estMinutes": 30,
    "tags": [
      "legacy",
      "core",
      "ode",
      "open-ended",
      "free-response",
      "hint-driven"
    ],
    "timerDefaultMinutes": 27,
    "questions": [
      {
        "id": "de-core-legacy-q1",
        "type": "free",
        "prompt": "Which first-order differential equation is separable as written?",
        "options": [],
        "correct": [],
        "explanation": "y' = x(1+y) can be rearranged as dy/(1+y) = x dx, so it is separable.\n\n**One valid final answer:** y' = x(1 + y)",
        "references": [
          "Professor-priority legacy question",
          "Differential Equations guided practice"
        ],
        "tags": [
          "separable",
          "first-order",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "y' = x(1+y) can be rearranged as dy/(1+y) = x dx, so it is separable."
        ],
        "walkthroughSteps": [
          "y' = x(1+y) can be rearranged as dy/(1+y) = x dx, so it is separable."
        ],
        "sampleAnswer": "y' = x(1 + y)"
      },
      {
        "id": "de-core-legacy-q2",
        "type": "free",
        "prompt": "For y'' - 4y' + 4y = 0, which general solution is correct?",
        "options": [],
        "correct": [],
        "explanation": "Characteristic equation r^2 - 4r + 4 = (r-2)^2 has repeated root r=2, so y=(c1+c2 x)e^{2x}.\n\n**One valid final answer:** y = (c1 + c2 x)e^{2x}",
        "references": [
          "Professor-priority legacy question",
          "Differential Equations guided practice"
        ],
        "tags": [
          "second-order",
          "characteristic-equation",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Characteristic equation r^2 - 4r + 4 = (r-2)^2 has repeated root r=2, so y=(c1+c2 x)e^{2x}."
        ],
        "walkthroughSteps": [
          "Characteristic equation r^2 - 4r + 4 = (r-2)^2 has repeated root r=2, so y=(c1+c2 x)e^{2x}."
        ],
        "sampleAnswer": "y = (c1 + c2 x)e^{2x}"
      },
      {
        "id": "de-core-legacy-q3",
        "type": "free",
        "prompt": "If L{y(t)} = Y(s), then L{y'(t)} equals:",
        "options": [],
        "correct": [],
        "explanation": "Derivative rule: L{y'} = sY(s) - y(0).\n\n**One valid final answer:** sY(s) - y(0)",
        "references": [
          "Professor-priority legacy question",
          "Differential Equations guided practice"
        ],
        "tags": [
          "laplace",
          "derivative-rule",
          "chapter-3"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Derivative rule: L{y'} = sY(s) - y(0)."
        ],
        "walkthroughSteps": [
          "Derivative rule: L{y'} = sY(s) - y(0)."
        ],
        "sampleAnswer": "sY(s) - y(0)"
      },
      {
        "id": "de-core-legacy-q4",
        "type": "free",
        "prompt": "A linear system x' = Ax is solved by diagonalizing A primarily to:",
        "options": [],
        "correct": [],
        "explanation": "Diagonalization decouples the system into modes associated with eigenvalues/eigenvectors.\n\n**One valid final answer:** Reduce the system to independent modes along eigenvectors.",
        "references": [
          "Professor-priority legacy question",
          "Differential Equations guided practice"
        ],
        "tags": [
          "systems",
          "matrix-form",
          "chapter-4"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Diagonalization decouples the system into modes associated with eigenvalues/eigenvectors."
        ],
        "walkthroughSteps": [
          "Diagonalization decouples the system into modes associated with eigenvalues/eigenvectors."
        ],
        "sampleAnswer": "Reduce the system to independent modes along eigenvectors."
      },
      {
        "id": "de-core-legacy-q5",
        "type": "free",
        "prompt": "The order of y''' + 2y' - y = e^x is:",
        "options": [],
        "correct": [],
        "explanation": "The highest derivative is third derivative, so order is 3.\n\n**One valid final answer:** 3",
        "tags": [
          "classification",
          "order",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "The highest derivative is third derivative, so order is 3."
        ],
        "walkthroughSteps": [
          "The highest derivative is third derivative, so order is 3."
        ],
        "sampleAnswer": "3",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q6",
        "type": "free",
        "prompt": "Which equation is linear in y?",
        "options": [],
        "correct": [],
        "explanation": "Linear means y and derivatives appear to first power and are not multiplied together.\n\n**One valid final answer:** y' + x y = cos(x)",
        "tags": [
          "linear-first-order",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Linear means y and derivatives appear to first power and are not multiplied together."
        ],
        "walkthroughSteps": [
          "Linear means y and derivatives appear to first power and are not multiplied together."
        ],
        "sampleAnswer": "y' + x y = cos(x)",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q7",
        "type": "free",
        "prompt": "Solve y' = 2x with y(0)=3. What is y(x)?",
        "options": [],
        "correct": [],
        "explanation": "Integrate: y = x^2 + C, and y(0)=3 gives C=3.\n\n**One valid final answer:** x^2 + 3",
        "tags": [
          "initial-value-problem",
          "separable",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Integrate: y = x^2 + C, and y(0)=3 gives C=3."
        ],
        "walkthroughSteps": [
          "Integrate: y = x^2 + C, and y(0)=3 gives C=3."
        ],
        "sampleAnswer": "x^2 + 3",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q8",
        "type": "free",
        "prompt": "For y' = r y(1 - y/K), the equilibrium solutions are:",
        "options": [],
        "correct": [],
        "explanation": "Set y' = 0: y=0 or (1-y/K)=0 => y=K.\n\n**One valid final answer:** y = 0 and y = K",
        "tags": [
          "logistic",
          "equilibria",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Set y' = 0: y=0 or (1-y/K)=0 => y=K."
        ],
        "walkthroughSteps": [
          "Set y' = 0: y=0 or (1-y/K)=0 => y=K."
        ],
        "sampleAnswer": "y = 0 and y = K",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q9",
        "type": "free",
        "prompt": "For a separable ODE, which steps are valid? (Select all that apply)",
        "options": [],
        "correct": [],
        "explanation": "Separable workflow: separate variables, integrate, then apply conditions.\n\n**One valid final answer:** Collect y terms with dy on one side and x terms with dx on the other.; Integrate both sides after separation.; Apply initial conditions after finding the antiderivative relation.",
        "tags": [
          "separable",
          "technique",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Separable workflow: separate variables, integrate, then apply conditions."
        ],
        "walkthroughSteps": [
          "Separable workflow: separate variables, integrate, then apply conditions."
        ],
        "sampleAnswer": "Collect y terms with dy on one side and x terms with dx on the other. | Integrate both sides after separation. | Apply initial conditions after finding the antiderivative relation.",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q10",
        "type": "free",
        "prompt": "If r1 and r2 are distinct real roots of the characteristic equation, the homogeneous solution is:",
        "options": [],
        "correct": [],
        "explanation": "Distinct real roots produce sum of exponentials.\n\n**One valid final answer:** y_h = c1 e^{r1 x} + c2 e^{r2 x}",
        "tags": [
          "characteristic-equation",
          "distinct-roots",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Distinct real roots produce sum of exponentials."
        ],
        "walkthroughSteps": [
          "Distinct real roots produce sum of exponentials."
        ],
        "sampleAnswer": "y_h = c1 e^{r1 x} + c2 e^{r2 x}",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q11",
        "type": "free",
        "prompt": "For roots r = a +- bi, the real-form solution is:",
        "options": [],
        "correct": [],
        "explanation": "Complex conjugate roots give damped sinusoidal form.\n\n**One valid final answer:** y = c1 e^{ax} cos(bx) + c2 e^{ax} sin(bx)",
        "tags": [
          "complex-roots",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Complex conjugate roots give damped sinusoidal form."
        ],
        "walkthroughSteps": [
          "Complex conjugate roots give damped sinusoidal form."
        ],
        "sampleAnswer": "y = c1 e^{ax} cos(bx) + c2 e^{ax} sin(bx)",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-core-legacy-q12",
        "type": "free",
        "prompt": "Method of undetermined coefficients is typically used for:",
        "options": [],
        "correct": [],
        "explanation": "Undetermined coefficients targets linear constant-coefficient ODEs with compatible forcing forms.\n\n**One valid final answer:** Linear ODEs with simple forcing terms like polynomials, exponentials, sines/cosines",
        "tags": [
          "undetermined-coefficients",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Undetermined coefficients targets linear constant-coefficient ODEs with compatible forcing forms."
        ],
        "walkthroughSteps": [
          "Undetermined coefficients targets linear constant-coefficient ODEs with compatible forcing forms."
        ],
        "sampleAnswer": "Linear ODEs with simple forcing terms like polynomials, exponentials, sines/cosines",
        "references": [
          "Differential Equations guided practice"
        ]
      }
    ]
  },
  {
    "id": "de-reinforce-legacy",
    "courseId": "differential-equations",
    "title": "Differential Equations Reinforcement (Legacy)",
    "description": "Open-ended Differential Equations practice with free-response answers and progressive hints.",
    "difficulty": "Advanced",
    "estMinutes": 24,
    "tags": [
      "legacy",
      "reinforcement",
      "laplace",
      "open-ended",
      "free-response",
      "hint-driven"
    ],
    "timerDefaultMinutes": 22,
    "questions": [
      {
        "id": "de-reinforce-legacy-q1",
        "type": "free",
        "prompt": "Which rewrite confirms y' = (x^2)/(1+y) is separable?",
        "options": [],
        "correct": [],
        "explanation": "Move (1+y) with dy and x terms with dx.\n\n**One valid final answer:** (1+y)dy = x^2 dx",
        "tags": [
          "separable",
          "first-order",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Move (1+y) with dy and x terms with dx."
        ],
        "walkthroughSteps": [
          "Move (1+y) with dy and x terms with dx."
        ],
        "sampleAnswer": "(1+y)dy = x^2 dx",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q2",
        "type": "free",
        "prompt": "For y' + 2y = e^x, the integrating factor is:",
        "options": [],
        "correct": [],
        "explanation": "mu(x)=exp(integral 2 dx)=e^{2x}.\n\n**One valid final answer:** e^{2x}",
        "tags": [
          "linear-first-order",
          "integrating-factor",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "mu(x)=exp(integral 2 dx)=e^{2x}."
        ],
        "walkthroughSteps": [
          "mu(x)=exp(integral 2 dx)=e^{2x}."
        ],
        "sampleAnswer": "e^{2x}",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q3",
        "type": "free",
        "prompt": "For M(x,y)dx + N(x,y)dy = 0, exactness means: (Select all that apply)",
        "options": [],
        "correct": [],
        "explanation": "Exact equations correspond to total differentials.\n\n**One valid final answer:** There exists potential F with dF = M dx + N dy.; Partial M/partial y equals partial N/partial x.; Solution can be written F(x,y)=C.",
        "tags": [
          "exact-equations",
          "first-order",
          "chapter-1"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Exact equations correspond to total differentials."
        ],
        "walkthroughSteps": [
          "Exact equations correspond to total differentials."
        ],
        "sampleAnswer": "There exists potential F with dF = M dx + N dy. | Partial M/partial y equals partial N/partial x. | Solution can be written F(x,y)=C.",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q4",
        "type": "free",
        "prompt": "Repeated root r=3 for y''-6y'+9y=0 gives:",
        "options": [],
        "correct": [],
        "explanation": "Repeated root form includes x factor.\n\n**One valid final answer:** (c1+c2x)e^{3x}",
        "tags": [
          "characteristic-equation",
          "repeated-roots",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Repeated root form includes x factor."
        ],
        "walkthroughSteps": [
          "Repeated root form includes x factor."
        ],
        "sampleAnswer": "(c1+c2x)e^{3x}",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q5",
        "type": "free",
        "prompt": "A good first trial for y''+y = 3cos x is:",
        "options": [],
        "correct": [],
        "explanation": "cos x overlaps homogeneous basis, so multiply by x.\n\n**One valid final answer:** x(Acos x + Bsin x)",
        "tags": [
          "undetermined-coefficients",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "cos x overlaps homogeneous basis, so multiply by x."
        ],
        "walkthroughSteps": [
          "cos x overlaps homogeneous basis, so multiply by x."
        ],
        "sampleAnswer": "x(Acos x + Bsin x)",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q6",
        "type": "free",
        "prompt": "Which statements describe underdamped motion? (Select all that apply)",
        "options": [],
        "correct": [],
        "explanation": "Underdamped systems oscillate while decaying.\n\n**One valid final answer:** Oscillatory behavior is present.; Amplitude decays over time.; Complex conjugate roots with negative real part appear.",
        "tags": [
          "damping",
          "modeling",
          "chapter-2"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Underdamped systems oscillate while decaying."
        ],
        "walkthroughSteps": [
          "Underdamped systems oscillate while decaying."
        ],
        "sampleAnswer": "Oscillatory behavior is present. | Amplitude decays over time. | Complex conjugate roots with negative real part appear.",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q7",
        "type": "free",
        "prompt": "L{e^{at}} equals:",
        "options": [],
        "correct": [],
        "explanation": "L{e^{at}} = 1/(s-a) for s>a.\n\n**One valid final answer:** 1/(s-a)",
        "tags": [
          "laplace-table",
          "chapter-3"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "L{e^{at}} = 1/(s-a) for s>a."
        ],
        "walkthroughSteps": [
          "L{e^{at}} = 1/(s-a) for s>a."
        ],
        "sampleAnswer": "1/(s-a)",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q8",
        "type": "free",
        "prompt": "Inverse Laplace of 1/(s-2) is:",
        "options": [],
        "correct": [],
        "explanation": "1/(s-a) maps to e^{at}.\n\n**One valid final answer:** e^{2t}",
        "tags": [
          "inverse-laplace",
          "partial-fractions",
          "chapter-3"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "1/(s-a) maps to e^{at}."
        ],
        "walkthroughSteps": [
          "1/(s-a) maps to e^{at}."
        ],
        "sampleAnswer": "e^{2t}",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q9",
        "type": "free",
        "prompt": "Unit step functions are useful for representing: (Select all that apply)",
        "options": [],
        "correct": [],
        "explanation": "u(t-a) captures delayed/switching input structure.\n\n**One valid final answer:** Piecewise forcing that turns on at time a.; Inputs with delays.; Switching behavior in circuits/mechanical loads.",
        "tags": [
          "unit-step",
          "piecewise",
          "chapter-3"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "u(t-a) captures delayed/switching input structure."
        ],
        "walkthroughSteps": [
          "u(t-a) captures delayed/switching input structure."
        ],
        "sampleAnswer": "Piecewise forcing that turns on at time a. | Inputs with delays. | Switching behavior in circuits/mechanical loads.",
        "references": [
          "Differential Equations guided practice"
        ]
      },
      {
        "id": "de-reinforce-legacy-q10",
        "type": "free",
        "prompt": "In x' = Ax, eigenvectors primarily determine:",
        "options": [],
        "correct": [],
        "explanation": "Eigenvectors define invariant directions of modal solutions.\n\n**One valid final answer:** Solution directions/modes",
        "tags": [
          "systems",
          "eigenvectors",
          "chapter-4"
        ],
        "hintSteps": [
          "Classify the ODE type first (separable, linear, exact, etc.).",
          "Choose the matching solving method and set up the transformed equation.",
          "Eigenvectors define invariant directions of modal solutions."
        ],
        "walkthroughSteps": [
          "Eigenvectors define invariant directions of modal solutions."
        ],
        "sampleAnswer": "Solution directions/modes",
        "references": [
          "Differential Equations guided practice"
        ]
      }
    ]
  },
  {
    "id": "ca-core-legacy",
    "courseId": "computer-architecture",
    "title": "Computer Architecture Test 1 (Legacy Core)",
    "description": "Core architecture/assembly/pipeline bank imported from existing files.",
    "difficulty": "Intermediate",
    "estMinutes": 28,
    "tags": [
      "legacy",
      "core",
      "architecture"
    ],
    "timerDefaultMinutes": 25,
    "questions": [
      {
        "id": "ca-core-legacy-q1",
        "type": "single",
        "prompt": "For C code `if (i == j) a = b + c; else a = b - c;` with i in s6 and j in s7, the branch condition should compare:",
        "options": [
          "s6 and s7",
          "a0 and a1",
          "ra and sp",
          "t0 and t1"
        ],
        "correct": [
          0
        ],
        "explanation": "The condition depends on i and j, so compare s6 with s7 before choosing add/sub path.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "assembly",
          "branch",
          "chapter-2"
        ]
      },
      {
        "id": "ca-core-legacy-q2",
        "type": "single",
        "prompt": "In `A[2*i] = a + A[i]` for 4-byte integers, the byte offset for A[2*i] is:",
        "options": [
          "i << 1",
          "i << 2",
          "i << 3",
          "i << 4"
        ],
        "correct": [
          2
        ],
        "explanation": "Index 2*i times 4 bytes = 8*i, implemented as left shift by 3.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "assembly",
          "array-addressing",
          "chapter-2"
        ]
      },
      {
        "id": "ca-core-legacy-q3",
        "type": "single",
        "prompt": "Machine code (hex) for `addi t0, zero, -101` is:",
        "options": [
          "0xF9B00293",
          "0xF9B00313",
          "0x09B00293",
          "0x41680FB3"
        ],
        "correct": [
          0
        ],
        "explanation": "-101 encoded in 12-bit immediate (two's complement) with rd=t0 and opcode for ADDI.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "machine-code",
          "encoding",
          "chapter-2"
        ]
      },
      {
        "id": "ca-core-legacy-q4",
        "type": "single",
        "prompt": "Instruction `0x41680FB3` decodes to:",
        "options": [
          "add x31, x16, x22",
          "sub x31, x16, x22",
          "and x31, x16, x22",
          "beq x31, x16, x22"
        ],
        "correct": [
          1
        ],
        "explanation": "R-type with funct7=0100000 and funct3=000 corresponds to SUB.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "machine-code",
          "decode",
          "chapter-2"
        ]
      },
      {
        "id": "ca-core-legacy-q5",
        "type": "single",
        "prompt": "In a 5-stage pipeline, a load-use dependency typically requires a stall because:",
        "options": [
          "Register file cannot be written at all.",
          "Loaded value is produced too late for immediate next EX stage operand use.",
          "Branch predictor disables forwarding.",
          "All loads are multicycle and unpipelined by definition."
        ],
        "correct": [
          1
        ],
        "explanation": "Load result becomes available after MEM, often too late for next instruction EX without bubble.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "pipeline",
          "hazards",
          "chapter-3"
        ]
      },
      {
        "id": "ca-core-legacy-q6",
        "type": "single",
        "prompt": "A 2-bit dynamic predictor reduces mispredictions vs 1-bit because it:",
        "options": [
          "Eliminates branch hazards completely.",
          "Requires two consecutive opposite outcomes to reverse strong prediction.",
          "Uses floating-point confidence counters.",
          "Predicts using opcode parity."
        ],
        "correct": [
          1
        ],
        "explanation": "Saturating 2-bit FSM adds hysteresis against one-off branch behavior.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "branch-prediction",
          "2-bit",
          "chapter-3"
        ]
      },
      {
        "id": "ca-core-legacy-q7",
        "type": "single",
        "prompt": "Which metric measures time to finish one task?",
        "options": [
          "Throughput",
          "Response time",
          "Utilization",
          "Bandwidth"
        ],
        "correct": [
          1
        ],
        "explanation": "Response time (latency) is completion time for a single task.",
        "tags": [
          "performance",
          "metrics",
          "chapter-1"
        ]
      },
      {
        "id": "ca-core-legacy-q8",
        "type": "single",
        "prompt": "Speedup of machine X over machine Y is:",
        "options": [
          "Exec time X / Exec time Y",
          "Exec time Y / Exec time X",
          "CPI X / CPI Y",
          "Clock rate X / Clock rate Y"
        ],
        "correct": [
          1
        ],
        "explanation": "Lower execution time means better performance; ratio uses Y over X.",
        "tags": [
          "performance",
          "speedup",
          "chapter-1"
        ]
      },
      {
        "id": "ca-core-legacy-q9",
        "type": "single",
        "prompt": "Processor performance equation is commonly written as CPU time =",
        "options": [
          "IC + CPI + cycle time",
          "IC x CPI x cycle time",
          "IC / CPI / cycle time",
          "CPI / IC x cycle time"
        ],
        "correct": [
          1
        ],
        "explanation": "Instruction count times cycles per instruction times cycle time.",
        "tags": [
          "cpu-time",
          "equation",
          "chapter-1"
        ]
      },
      {
        "id": "ca-core-legacy-q10",
        "type": "single",
        "prompt": "In the slides, the 'old' view of architecture focused mainly on:",
        "options": [
          "Cooling and datacenter design",
          "ISA decisions only",
          "Compiler optimization only",
          "Network protocols"
        ],
        "correct": [
          1
        ],
        "explanation": "Old view centered on ISA choices (registers, addressing, encoding, etc.).",
        "tags": [
          "isa",
          "architecture-definition",
          "chapter-1"
        ]
      },
      {
        "id": "ca-core-legacy-q11",
        "type": "single",
        "prompt": "SIMD stands for:",
        "options": [
          "Single instruction, multiple data",
          "Single instruction, mixed data",
          "Sequential instruction, multiple decode",
          "Synchronous instruction, memory distributed"
        ],
        "correct": [
          0
        ],
        "explanation": "Flynn taxonomy: single instruction stream over multiple data streams.",
        "tags": [
          "parallelism",
          "flynn",
          "chapter-1"
        ]
      },
      {
        "id": "ca-core-legacy-q12",
        "type": "multi",
        "prompt": "Which of the following are core ISA design decisions include: (Select all that apply)",
        "options": [
          "Registers",
          "Addressing modes",
          "Instruction encoding",
          "Cooling fan geometry"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "explanation": "ISA defines programmer-visible instruction/register/address behavior.",
        "tags": [
          "isa",
          "risc-v",
          "chapter-1"
        ]
      }
    ]
  },
  {
    "id": "ca-reinforce-legacy",
    "courseId": "computer-architecture",
    "title": "Computer Architecture Reinforcement (Legacy)",
    "description": "Targeted architecture reinforcement from existing bank.",
    "difficulty": "Intermediate",
    "estMinutes": 24,
    "tags": [
      "legacy",
      "reinforcement",
      "pipeline"
    ],
    "timerDefaultMinutes": 22,
    "questions": [
      {
        "id": "ca-reinforce-legacy-q1",
        "type": "single",
        "prompt": "If execution time is cut in half, speedup is:",
        "options": [
          "0.5x",
          "1x",
          "2x",
          "4x"
        ],
        "correct": [
          2
        ],
        "explanation": "Speedup = old/new; halving time gives 2x.",
        "walkthroughSteps": [
          "Speedup = old/new.",
          "halving time gives 2x."
        ],
        "tags": [
          "performance",
          "speedup",
          "chapter-1"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q2",
        "type": "single",
        "prompt": "CPU time depends directly on:",
        "options": [
          "IC, CPI, cycle time",
          "Clock rate only",
          "CPI only",
          "Cache size only"
        ],
        "correct": [
          0
        ],
        "explanation": "Core equation multiplies these three factors.",
        "tags": [
          "cpu-time",
          "equation",
          "chapter-1"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q3",
        "type": "multi",
        "prompt": "Flynn classes include: (Select all that apply)",
        "options": [
          "SISD",
          "SIMD",
          "MISD",
          "MIMD"
        ],
        "correct": [
          0,
          1,
          2,
          3
        ],
        "explanation": "All four are Flynn taxonomy categories.",
        "tags": [
          "parallelism",
          "flynn",
          "chapter-1"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q4",
        "type": "single",
        "prompt": "addi belongs to:",
        "options": [
          "R-type",
          "I-type",
          "S-type",
          "B-type"
        ],
        "correct": [
          1
        ],
        "explanation": "addi uses immediate format.",
        "tags": [
          "instruction-format",
          "addi",
          "chapter-2"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q5",
        "type": "single",
        "prompt": "sw (store word) uses:",
        "options": [
          "S-type",
          "R-type",
          "U-type",
          "J-type"
        ],
        "correct": [
          0
        ],
        "explanation": "Store immediates are split in S-type encoding.",
        "tags": [
          "instruction-format",
          "store",
          "chapter-2"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q6",
        "type": "single",
        "prompt": "If R-type funct7 is 0100000 and funct3 is 000, operation is usually:",
        "options": [
          "ADD",
          "SUB",
          "AND",
          "OR"
        ],
        "correct": [
          1
        ],
        "explanation": "In base integer ALU ops, this encodes SUB.",
        "tags": [
          "machine-code",
          "decode",
          "chapter-2"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q7",
        "type": "multi",
        "prompt": "Standard convention facts: (Select all that apply)",
        "options": [
          "a0-a7 used for arguments",
          "a0 used for return value",
          "ra stores return address",
          "x0 used as stack pointer"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "explanation": "sp is x2; x0 is constant zero.",
        "walkthroughSteps": [
          "sp is x2.",
          "x0 is constant zero."
        ],
        "tags": [
          "calling-convention",
          "procedures",
          "chapter-2"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q8",
        "type": "single",
        "prompt": "For int array A, byte offset of A[i] is typically:",
        "options": [
          "i",
          "2*i",
          "4*i",
          "8*i"
        ],
        "correct": [
          2
        ],
        "explanation": "Word-size scaling for 4-byte ints.",
        "tags": [
          "array-addressing",
          "assembly",
          "chapter-2"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q9",
        "type": "single",
        "prompt": "Which stage reads data memory for loads?",
        "options": [
          "IF",
          "ID",
          "MEM",
          "WB"
        ],
        "correct": [
          2
        ],
        "explanation": "Memory access happens in MEM stage.",
        "tags": [
          "pipeline",
          "stages",
          "chapter-3"
        ]
      },
      {
        "id": "ca-reinforce-legacy-q10",
        "type": "single",
        "prompt": "Dependency `producer writes reg, consumer later reads same reg` is:",
        "options": [
          "RAW",
          "WAR",
          "WAW",
          "RAR"
        ],
        "correct": [
          0
        ],
        "explanation": "Classic read-after-write dependency.",
        "tags": [
          "hazards",
          "raw",
          "chapter-3"
        ]
      }
    ]
  },
  {
    "id": "ta-core-legacy",
    "courseId": "theory-of-automata",
    "title": "Theory of Automata Test 1 (Legacy Core)",
    "description": "Core automata/regex/formal language set imported from existing bank.",
    "difficulty": "Advanced",
    "estMinutes": 29,
    "tags": [
      "legacy",
      "core",
      "automata"
    ],
    "timerDefaultMinutes": 26,
    "questions": [
      {
        "id": "ta-core-legacy-q1",
        "type": "single",
        "prompt": "For relation R, the directed graph of R union R^-1 is best interpreted as:",
        "options": [
          "Keeping only self-loops from R.",
          "Adding reverse-direction edges for every edge in R.",
          "Removing all asymmetric edges from R.",
          "Creating a total order from R."
        ],
        "correct": [
          1
        ],
        "explanation": "R union R^-1 contains each pair and its reverse, so edges appear both directions where applicable.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "relations",
          "graphs",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q2",
        "type": "single",
        "prompt": "Which statement matches Homework/Test material?",
        "options": [
          "(b* a*) intersection (a* b*) = empty set",
          "(b* a*) intersection (a* b*) = a* union b*",
          "(b* a*) intersection (a* b*) = (ab)*",
          "(b* a*) intersection (a* b*) = (a+b)*"
        ],
        "correct": [
          1
        ],
        "explanation": "The overlap of a* b* and b* a* is strings of only a's or only b's.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "regex",
          "set-identity",
          "chapter-2"
        ]
      },
      {
        "id": "ta-core-legacy-q3",
        "type": "single",
        "prompt": "A lecture-note expression for strings over {0,1} with 2 or 3 ones and first two non-consecutive starts with:",
        "options": [
          "0*10*010*",
          "(01)*",
          "1*0*1*",
          "(0+1)*111"
        ],
        "correct": [
          0
        ],
        "explanation": "The note example uses 0*10*010*... to force spacing between first and second 1.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "regex",
          "language-design",
          "chapter-2"
        ]
      },
      {
        "id": "ta-core-legacy-q4",
        "type": "single",
        "prompt": "A valid regex for strings over {a,b} with number of a's divisible by 3 is:",
        "options": [
          "b*(ab*ab*ab*)*",
          "(ab)*",
          "a*b*",
          "(aa)*b*"
        ],
        "correct": [
          0
        ],
        "explanation": "Each block contributes exactly three a's with any number of b's in between.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "regex",
          "homework",
          "chapter-2"
        ]
      },
      {
        "id": "ta-core-legacy-q5",
        "type": "single",
        "prompt": "A DFA for language 'w has abab as a substring' must:",
        "options": [
          "Track progress through a,b,a,b pattern states.",
          "Count total a's only.",
          "Accept only length-4 strings.",
          "Use a stack to match symbols."
        ],
        "correct": [
          0
        ],
        "explanation": "Substring DFAs track partial matched prefix of target pattern.",
        "references": [
          "Professor-priority legacy question"
        ],
        "tags": [
          "dfa",
          "substring",
          "chapter-2"
        ]
      },
      {
        "id": "ta-core-legacy-q6",
        "type": "single",
        "prompt": "Which identity is correct?",
        "options": [
          "A - (B intersection C) = (A - B) union (A - C)",
          "A - (B intersection C) = (A union B) - C",
          "A - (B intersection C) = (A - B) intersection C",
          "A - (B intersection C) = B - (A intersection C)"
        ],
        "correct": [
          0
        ],
        "explanation": "This is the De Morgan-style set-difference identity proved in HW1.",
        "tags": [
          "sets",
          "de-morgan",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q7",
        "type": "single",
        "prompt": "For relations R and S, composition R o S means:",
        "options": [
          "(a,b) is in R o S if (a,b) is in both R and S directly.",
          "(a,b) is in R o S if there exists c with (a,c) in R and (c,b) in S.",
          "R o S always equals S o R.",
          "R o S contains only reflexive pairs."
        ],
        "correct": [
          1
        ],
        "explanation": "Composition chains through an intermediate element c.",
        "tags": [
          "relations",
          "composition",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q8",
        "type": "single",
        "prompt": "If (x,y) is in relation R, then R^-1 contains:",
        "options": [
          "(x,y)",
          "(y,x)",
          "(x,x)",
          "(y,y)"
        ],
        "correct": [
          1
        ],
        "explanation": "Inverse relation swaps ordered-pair components.",
        "tags": [
          "relations",
          "inverse",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q9",
        "type": "single",
        "prompt": "A directed graph represents a function exactly when each node in domain has:",
        "options": [
          "At least one outgoing edge",
          "Exactly one outgoing edge",
          "Exactly one incoming edge",
          "No self-loops"
        ],
        "correct": [
          1
        ],
        "explanation": "Function requires one and only one output for each input.",
        "tags": [
          "functions",
          "graph-criterion",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q10",
        "type": "single",
        "prompt": "On positive integers, relation aRb iff b is divisible by a is:",
        "options": [
          "Neither partial nor total order",
          "A partial order but not total order",
          "A total order",
          "An equivalence relation"
        ],
        "correct": [
          1
        ],
        "explanation": "It is reflexive/antisymmetric/transitive but not comparable for every pair (e.g., 2 and 3).",
        "tags": [
          "partial-order",
          "divisibility",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q11",
        "type": "multi",
        "prompt": "Which properties define an equivalence relation? (Select all that apply)",
        "options": [
          "Reflexive",
          "Symmetric",
          "Transitive",
          "Antisymmetric"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "explanation": "Equivalence relation uses reflexive + symmetric + transitive.",
        "tags": [
          "relation-properties",
          "chapter-1"
        ]
      },
      {
        "id": "ta-core-legacy-q12",
        "type": "single",
        "prompt": "In a DFA transition table, each state/symbol pair has:",
        "options": [
          "Zero or more next states",
          "Exactly one next state",
          "A stack action",
          "A grammar rule"
        ],
        "correct": [
          1
        ],
        "explanation": "Determinism means one defined transition per symbol from each state.",
        "tags": [
          "dfa",
          "deterministic",
          "chapter-2"
        ]
      }
    ]
  },
  {
    "id": "ta-reinforce-legacy",
    "courseId": "theory-of-automata",
    "title": "Theory of Automata Reinforcement (Legacy)",
    "description": "Automata reinforcement set imported from your existing files.",
    "difficulty": "Advanced",
    "estMinutes": 24,
    "tags": [
      "legacy",
      "reinforcement",
      "proofs"
    ],
    "timerDefaultMinutes": 22,
    "questions": [
      {
        "id": "ta-reinforce-legacy-q1",
        "type": "single",
        "prompt": "Which expression equals A - (B intersection C)?",
        "options": [
          "(A-B) union (A-C)",
          "(A-B) intersection (A-C)",
          "A-(B union C)",
          "(B-A) union (C-A)"
        ],
        "correct": [
          0
        ],
        "explanation": "Matches the set identity used in HW1.",
        "tags": [
          "sets",
          "de-morgan",
          "chapter-1"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q2",
        "type": "single",
        "prompt": "If R = {(a,b),(c,d)}, then R^-1 contains:",
        "options": [
          "(a,b),(c,d)",
          "(b,a),(d,c)",
          "(a,a),(b,b)",
          "(a,d),(c,b)"
        ],
        "correct": [
          1
        ],
        "explanation": "Inverse swaps each ordered pair.",
        "tags": [
          "relations",
          "inverse",
          "chapter-1"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q3",
        "type": "multi",
        "prompt": "Which are required for partial order? (Select all that apply)",
        "options": [
          "Reflexive",
          "Antisymmetric",
          "Transitive",
          "Symmetric"
        ],
        "correct": [
          0,
          1,
          2
        ],
        "explanation": "Partial order = reflexive + antisymmetric + transitive.",
        "tags": [
          "relation-properties",
          "chapter-1"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q4",
        "type": "single",
        "prompt": "In a DFA, transitions are:",
        "options": [
          "Nondeterministic",
          "Exactly one per state-symbol pair",
          "Based on stack top",
          "Allowed only from accept states"
        ],
        "correct": [
          1
        ],
        "explanation": "Deterministic transition function gives one next state.",
        "tags": [
          "dfa",
          "definition",
          "chapter-2"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q5",
        "type": "single",
        "prompt": "Epsilon transitions consume:",
        "options": [
          "One input symbol",
          "No input symbol",
          "Only terminal symbols",
          "Only if stack empty"
        ],
        "correct": [
          1
        ],
        "explanation": "They are empty-string moves.",
        "tags": [
          "nfa",
          "epsilon",
          "chapter-2"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q6",
        "type": "single",
        "prompt": "Regex for 'no more than three a's' over {a,b} may be built by union of terms containing:",
        "options": [
          "0,1,2,3 occurrences of a",
          "Only exactly three a's",
          "Only even number of a's",
          "Only odd number of a's"
        ],
        "correct": [
          0
        ],
        "explanation": "HW solution builds cases for 0 through 3 a's.",
        "tags": [
          "regex",
          "homework",
          "chapter-2"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q7",
        "type": "multi",
        "prompt": "Regular languages are closed under: (Select all that apply)",
        "options": [
          "Union",
          "Concatenation",
          "Kleene star",
          "Intersection"
        ],
        "correct": [
          0,
          1,
          2,
          3
        ],
        "explanation": "All listed operations preserve regularity.",
        "tags": [
          "closure",
          "regular",
          "chapter-2"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q8",
        "type": "single",
        "prompt": "Pumping lemma gives a necessary condition for:",
        "options": [
          "Context-free languages",
          "Regular languages",
          "Decidable languages",
          "Finite languages only"
        ],
        "correct": [
          1
        ],
        "explanation": "Every regular language must satisfy pumping property.",
        "tags": [
          "pumping-lemma",
          "chapter-2"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q9",
        "type": "single",
        "prompt": "The expression b*a* intersection a*b* allows which strings?",
        "options": [
          "Only strings with both a and b alternating",
          "Only all-a strings or all-b strings",
          "All binary strings",
          "Only epsilon"
        ],
        "correct": [
          1
        ],
        "explanation": "Intersection collapses to a* union b*.",
        "tags": [
          "regex",
          "test1",
          "chapter-2"
        ]
      },
      {
        "id": "ta-reinforce-legacy-q10",
        "type": "single",
        "prompt": "Which language is nonregular?",
        "options": [
          "(ab)*",
          "a* union b*",
          "{a^n b^n : n>=0}",
          "b*(ab*ab*ab*)*"
        ],
        "correct": [
          2
        ],
        "explanation": "Finite-state machines cannot enforce equal unbounded counts.",
        "tags": [
          "nonregular",
          "examples",
          "chapter-2"
        ]
      }
    ]
  }
];

const replacementQuizSetIds = new Set(testReviewQuizSetReplacements.map((quizSet) => quizSet.id));
const legacyQuizSetsWithoutReplacedReviews = legacyQuizSets.filter(
  (quizSet) => !replacementQuizSetIds.has(quizSet.id),
);

export const quizSets: QuizSet[] = [
  ...legacyQuizSetsWithoutReplacedReviews,
  ...testReviewQuizSetReplacements,
  ...computerArchitectureQuizSets,
  ...automataQuizSets,
  ...softwareEngineeringQuizSets,
];

export function getQuizSetById(quizId: string) {
  return quizSets.find((quiz) => quiz.id === quizId);
}

export function getQuizSetsByCourse(courseId: string) {
  return quizSets.filter((quiz) => quiz.courseId === courseId);
}
