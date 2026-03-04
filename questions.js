// ═══════════════════════════════════════════════════════════
//  CS 3365 SOFTWARE ENGINEERING — EXAM 1 QUESTION BANK
//  All questions have 5-7 options with normalized lengths
//  Topics tagged for reinforcement matching
// ═══════════════════════════════════════════════════════════

const QUESTION_BANK = [

// ╔════════════════════════════════════════════╗
// ║  PROFESSOR CONFIRMED (always included)     ║
// ╚════════════════════════════════════════════╝

{id:"P1",chapter:1,type:"single",fromProfessor:true,topics:["plan-driven","process-models","waterfall"],
  question:'In a "Plan-driven" process, how is progress typically measured?',
  options:[
    "By the number of user stories completed each day.",
    "Against a pre-determined plan of activities and stages.",
    "Based on the customer's satisfaction at the end of each sprint.",
    "Based on the level of pair programming used.",
  ],answer:[1],
  explanation:"In plan-driven processes, progress is measured against a pre-determined plan with defined activities and stages."},

{id:"P2",chapter:3,type:"single",fromProfessor:true,topics:["scrum","sprint","agile-practices"],
  question:'In the Scrum agile method, what is a "Sprint"?',
  options:[
    "A race between developers to finish their code.",
    "A fixed time period, usually 2-4 weeks, during which a system increment is developed.",
    "A meeting where the Scrum Master reports to the CEO.",
    "The process of moving requirements from the product backlog to the archive.",
    "A specialized tool used for automated testing.",
    "The final release of the software to the customer.",
    "A method for scaling agile to large organizations.",
  ],answer:[1],
  explanation:"A Sprint is a fixed time period (typically 2-4 weeks) during which a potentially shippable system increment is developed."},

{id:"P3",chapter:1,type:"single",fromProfessor:true,topics:["ethics","professional-responsibility"],
  question:"Software engineering ethics dictate that engineers should NOT:",
  options:[
    "Respect the confidentiality of employers or clients.",
    "Misuse their skills to take over or damage others' computers.",
    "Be honest about their level of competence.",
    "Support the professional software development of their colleagues.",
  ],answer:[1],
  explanation:"B is what engineers should NOT do. Misusing skills to damage others' computers is unethical."},

{id:"P4",chapter:3,type:"multi",fromProfessor:true,topics:["agile-characteristics","agile-principles","documentation"],
  question:"What are the characteristics of agile development? (Select all that apply)",
  options:[
    "Detailed documentation.",
    "Mostly focused on coding.",
    "Frequent delivery of new versions.",
    "Implementation starts after the system design has been fully completed.",
    "Minimal documentation.",
    "None of the above.",
  ],answer:[1,2,4],
  explanation:"Agile: focus on coding, frequent delivery, minimal documentation."},

{id:"P5",chapter:2,type:"single",fromProfessor:true,topics:["prototyping","coping-with-change"],
  question:"The prototype of the software will be very close to the final software version. Therefore, the prototype should not be discarded.",
  options:["True","False"],answer:[1],
  explanation:"False. Prototypes are throw-away — built to explore requirements, not to become the final product."},

{id:"P6",chapter:1,type:"single",fromProfessor:true,topics:["generic-vs-customized","product-types"],
  question:"There are two types of software products: Generic products and customized products. Which one of the following statements is true about a generic product?",
  options:[
    "Software that is commissioned for specific customer needs.",
    "Software that is developed to maintain the hardware in a specific factory.",
    "Software made for any customer who wants to buy it.",
    "Banking app made for a specific bank to manage its internal activities (ex: Citi bank).",
  ],answer:[2],
  explanation:"Generic products (COTS) are sold to any customer on the open market."},

{id:"P7",chapter:2,type:"multi",fromProfessor:true,topics:["waterfall","waterfall-phases","process-models"],
  question:"The Waterfall Model presents the software development process in a number of stages. What are the phases of the waterfall model? (Select all that apply)",
  options:[
    "Requirements analysis and definition",
    "Customer involvement",
    "System and software design",
    "Product increments",
    "Implementation and unit testing",
    "Integration and system testing",
    "Version development",
    "Operation and maintenance",
  ],answer:[0,2,4,5,7],
  explanation:"Waterfall phases: Requirements → Design → Implementation/unit testing → Integration/system testing → Operation/maintenance."},

{id:"P8",chapter:1,type:"single",fromProfessor:true,topics:["essential-attributes","maintainability"],
  question:"Which essential software product attribute ensures the system can be adapted to meet the changing needs of customers?",
  options:["Dependability","Efficiency","Security","Maintainability","Portability"],
  answer:[3],
  explanation:"Maintainability = software can evolve with changing customer needs."},

// ╔════════════════════════════════════════════╗
// ║  CHAPTER 1 — INTRODUCTION                  ║
// ╚════════════════════════════════════════════╝

{id:"C1-01",chapter:1,type:"single",topics:["se-vs-cs","definitions"],
  question:"What is the key difference between software engineering and computer science?",
  options:[
    "Software engineering is the study of algorithms and data structures in isolation.",
    "Computer science focuses on theory and fundamentals while software engineering focuses on practical development.",
    "Computer science deals exclusively with hardware and circuit design.",
    "Software engineering only covers the testing phase of development.",
    "They are identical disciplines with different names used at different universities.",
    "Computer science is about building products while software engineering is about theory.",
  ],answer:[1],
  explanation:"CS = theory and fundamentals. SE = practical development and delivery."},

{id:"C1-02",chapter:1,type:"single",topics:["essential-attributes","dependability"],
  question:"Which essential attribute means the software should not cause physical or economic damage in the event of system failure?",
  options:[
    "Maintainability — the system can be changed to meet evolving needs.",
    "Acceptability — the system is usable and compatible with other tools.",
    "Dependability and Security — the system should not cause damage upon failure.",
    "Efficiency — the system does not waste memory or processor resources.",
    "Portability — the system can run on multiple hardware platforms.",
    "Scalability — the system can handle growing numbers of users.",
  ],answer:[2],
  explanation:"Dependability and security = no physical or economic damage upon failure."},

{id:"C1-03",chapter:1,type:"single",topics:["maintenance-costs","evolution"],
  question:"Which of the following is true about maintenance costs in software engineering?",
  options:[
    "Maintenance costs are typically a small fraction of development costs.",
    "Maintenance costs usually exceed development costs for long-lived systems.",
    "Maintenance is unnecessary for software that was well-designed initially.",
    "Maintenance only involves correcting bugs found after initial deployment.",
    "Maintenance costs decrease as the software ages and stabilizes over time.",
    "Maintenance is only required for customized products, not generic ones.",
  ],answer:[1],
  explanation:"For most long-lived systems, maintenance costs exceed development costs."},

{id:"C1-04",chapter:1,type:"single",topics:["system-of-systems","definitions"],
  question:'What is a "system of systems"?',
  options:[
    "A single monolithic application deployed across multiple servers for redundancy.",
    "A system built by integrating multiple independently managed systems together.",
    "A backup system that mirrors the primary system for disaster recovery.",
    "A system that only runs on one specific operating system or platform.",
    "A development methodology where systems are built in sequential layers.",
    "A testing framework that validates systems against multiple specifications.",
  ],answer:[1],
  explanation:"System of systems = integrating independently managed systems into a larger system."},

{id:"C1-05",chapter:1,type:"single",topics:["essential-attributes","acceptability"],
  question:"Which essential product attribute means the software must be understandable, usable, and compatible with existing systems?",
  options:[
    "Efficiency — the system uses minimal memory and processing resources.",
    "Maintainability — the system can be modified to meet future requirements.",
    "Acceptability — the system is understandable, usable, and compatible.",
    "Dependability — the system continues to function during component failures.",
    "Portability — the system operates correctly across different environments.",
    "Testability — the system can be verified against its specifications easily.",
  ],answer:[2],
  explanation:"Acceptability = understandable, usable, compatible with users' other systems."},

{id:"C1-06",chapter:1,type:"single",topics:["essential-attributes","efficiency"],
  question:"Which of the following best describes the 'efficiency' attribute of professional software?",
  options:[
    "The software should be modifiable to accommodate changing requirements.",
    "The software should not waste system resources like memory and processor cycles.",
    "The software should protect against unauthorized access and modifications.",
    "The software should be understandable and intuitive for all user types.",
    "The software should integrate smoothly with other organizational systems.",
    "The software should maintain operation during unexpected system failures.",
  ],answer:[1],
  explanation:"Efficiency = not wasting system resources such as memory and processor cycles."},

{id:"C1-07",chapter:1,type:"fill",topics:["generic-vs-customized","product-types"],
  question:"The two types of software products are _______ products and _______ products.",
  answer:["generic","customized"],
  acceptableAnswers:[["generic","customized"],["generic","custom"],["generic","bespoke"],["customized","generic"],["custom","generic"],["bespoke","generic"]],
  explanation:"Generic (open market, like Word) and customized (bespoke, commissioned for a specific client)."},

{id:"C1-08",chapter:1,type:"fill",topics:["essential-attributes"],
  question:"The four essential attributes of good software are maintainability, dependability and security, efficiency, and _______.",
  answer:["acceptability"],acceptableAnswers:[["acceptability"],["acceptable"]],
  explanation:"The four: Maintainability, Dependability & Security, Efficiency, Acceptability."},

{id:"C1-09",chapter:1,type:"single",topics:["generic-vs-customized","specification-control"],
  question:"In a customized software product, who controls the software specification?",
  options:[
    "The software development organization that builds the product.",
    "The customer who commissions and pays for the software.",
    "The end users who will interact with the system daily.",
    "A government regulatory body that oversees the industry.",
    "The project manager assigned to lead the development effort.",
    "An independent quality assurance team hired by both parties.",
  ],answer:[1],
  explanation:"For customized products, the commissioning customer controls the specification."},

{id:"C1-10",chapter:1,type:"single",topics:["ethics","professional-responsibility"],
  question:"Which of the following is NOT one of the ACM/IEEE ethical principles for software engineers?",
  options:[
    "Act in a way that is in the best interests of the public.",
    "Maintain integrity and independence in their professional judgment.",
    "Maximize profit for the employing organization at all costs.",
    "Advance the integrity and reputation of the software profession.",
    "Be fair to and supportive of their professional colleagues.",
    "Participate in lifelong learning regarding the practice of their profession.",
  ],answer:[2],
  explanation:"Maximizing profit at all costs is NOT an ethical principle."},

{id:"C1-11",chapter:1,type:"multi",topics:["se-challenges","definitions"],
  question:"Which of the following are recognized software engineering challenges? (Select all that apply)",
  options:[
    "Coping with increasing diversity and heterogeneity of systems.",
    "Meeting demands for significantly reduced delivery times.",
    "Developing software that is trustworthy and dependable.",
    "Ensuring all software worldwide is written in a single language.",
    "Adapting to changing business environments and requirements.",
    "Eliminating the need for software testing and validation.",
  ],answer:[0,1,2,4],
  explanation:"Key SE challenges: heterogeneity, speed, trustworthiness, and adapting to change."},

{id:"C1-12",chapter:1,type:"fill",topics:["generic-vs-customized","specification-control"],
  question:"For a generic product, the organization that develops the software controls the software _______.",
  answer:["specification"],acceptableAnswers:[["specification"],["spec"],["specifications"]],
  explanation:"For generic products, the development org controls the specification."},

{id:"C1-13",chapter:1,type:"single",topics:["generic-vs-customized","product-types"],
  question:"Which of the following is the BEST example of a customized (bespoke) software product?",
  options:[
    "Microsoft Excel, a spreadsheet program sold to millions of customers.",
    "A traffic control system built specifically for the city of Lubbock, Texas.",
    "Adobe Photoshop, available for purchase on the Adobe website.",
    "The Google Chrome web browser, freely available for download.",
    "A mobile game app distributed through the Apple App Store.",
    "The Linux operating system, available as open source software.",
  ],answer:[1],
  explanation:"A system built specifically for one client (Lubbock's traffic control) is customized/bespoke."},

// ╔════════════════════════════════════════════╗
// ║  CHAPTER 2 — SOFTWARE PROCESSES             ║
// ╚════════════════════════════════════════════╝

{id:"C2-01",chapter:2,type:"single",topics:["incremental-development","process-models"],
  question:"Which software process model develops the system as a series of versions, with each version adding new functionality to the previous one?",
  options:[
    "The Waterfall Model, which follows a strict sequential approach.",
    "Incremental Development, which interleaves specification and development.",
    "Reuse-oriented Software Engineering, which assembles from existing parts.",
    "The Formal Transformation approach using mathematical specifications.",
    "The V-Model, which pairs each development phase with a testing phase.",
    "The Spiral Model, which focuses primarily on risk-driven iteration.",
  ],answer:[1],
  explanation:"Incremental development = series of versions, each adding functionality."},

{id:"C2-02",chapter:2,type:"single",topics:["validation","process-activities"],
  question:"In the software process, which activity involves checking that the software meets its specification and the customer's actual needs?",
  options:[
    "Specification — defining what services the system should provide.",
    "Design and Implementation — organizing and coding the system structure.",
    "Validation — checking the system meets specs and real customer needs.",
    "Evolution — changing the system in response to changing requirements.",
    "Planning — scheduling activities and allocating resources to the project.",
    "Deployment — releasing the finished system to the production environment.",
  ],answer:[2],
  explanation:"Validation (V&V) checks conformance to specification and real customer needs."},

{id:"C2-03",chapter:2,type:"multi",topics:["process-activities"],
  question:"Which of the following are general process activities common to ALL software processes? (Select all that apply)",
  options:[
    "Specification — defining what the system should do.",
    "Design and implementation — building the system's structure and code.",
    "Pair programming — two developers working at one workstation.",
    "Validation — checking the system does what the customer wants.",
    "Evolution — changing the system after it has been deployed.",
    "Daily standups — brief team synchronization meetings each morning.",
    "Refactoring — restructuring code without changing external behavior.",
  ],answer:[0,1,3,4],
  explanation:"Four fundamentals: Specification, Design/Implementation, Validation, Evolution. Others are specific agile practices."},

{id:"C2-04",chapter:2,type:"single",topics:["incremental-development","coping-with-change"],
  question:"What is the primary advantage of incremental development over the waterfall model?",
  options:[
    "It produces more thorough and detailed documentation throughout development.",
    "It makes it easier to accommodate changes in customer requirements.",
    "It completely removes the need for any form of software testing.",
    "It eliminates the need for an initial requirements gathering phase.",
    "It guarantees that the final system will have zero defects at launch.",
    "It allows the project to proceed without any stakeholder involvement.",
  ],answer:[1],
  explanation:"Easier to accommodate change because customers can provide feedback on each increment."},

{id:"C2-05",chapter:2,type:"single",topics:["testing","component-testing"],
  question:"Which testing stage focuses on testing individual program components in isolation from the rest of the system?",
  options:[
    "System testing — testing the complete integrated system as a whole.",
    "Acceptance testing — validating the system meets real customer needs.",
    "Component (unit) testing — testing individual components independently.",
    "Integration testing — testing how well modules work together.",
    "Regression testing — ensuring new changes haven't broken existing features.",
    "Performance testing — measuring system speed under various load conditions.",
  ],answer:[2],
  explanation:"Component (unit) testing = individual components tested in isolation."},

{id:"C2-06",chapter:2,type:"single",topics:["integration-configuration","cots","reuse"],
  question:"In the Integration and Configuration model, what are COTS systems?",
  options:[
    "Custom-designed systems that are built entirely from scratch for a client.",
    "Commercial Off-The-Shelf systems that can be adapted and integrated.",
    "Testing frameworks used specifically for component-level unit testing.",
    "Coding standards that are enforced across the development team.",
    "Customer-Oriented Testing Suites used for acceptance validation.",
    "Continuous Operation and Tracking Systems for monitoring deployments.",
  ],answer:[1],
  explanation:"COTS = Commercial Off-The-Shelf systems that can be configured and integrated."},

{id:"C2-07",chapter:2,type:"single",topics:["prototyping","coping-with-change"],
  question:"What is the main purpose of prototyping in the software development process?",
  options:[
    "To create the final production version that ships to the customer.",
    "To help elicit and validate requirements by providing a working model.",
    "To completely replace the need for any formal testing activities.",
    "To generate detailed technical documentation for the development team.",
    "To serve as the permanent architecture upon which features are added.",
    "To benchmark the system's performance under maximum expected load.",
  ],answer:[1],
  explanation:"Prototyping helps elicit and validate requirements via a working model."},

{id:"C2-08",chapter:2,type:"single",topics:["testing","acceptance-testing"],
  question:"In customer (acceptance) testing, who primarily performs the testing activities?",
  options:[
    "The internal development team using automated test frameworks.",
    "An independent quality assurance firm hired by the dev organization.",
    "The customer or end users who validate the system meets their needs.",
    "The project manager who signs off on each deliverable milestone.",
    "The system architects who verify the design has been followed exactly.",
    "Government regulators who ensure compliance with industry standards.",
  ],answer:[2],
  explanation:"Acceptance testing = customer/end users validate their actual needs are met."},

{id:"C2-09",chapter:2,type:"fill",topics:["testing","testing-stages"],
  question:"The three testing stages in order are: Component testing, _______ testing, and Customer (Acceptance) testing.",
  answer:["system"],acceptableAnswers:[["system"],["systems"]],
  explanation:"Component → System → Customer (Acceptance)."},

{id:"C2-10",chapter:2,type:"single",topics:["waterfall","process-models"],
  question:"Which of the following is a key disadvantage of the waterfall model?",
  options:[
    "It provides too much flexibility for the development team.",
    "It produces far too little documentation for future maintenance.",
    "It is difficult to accommodate changes after the process has begun.",
    "It delivers software to the customer far too quickly for them.",
    "It requires the use of agile practices like pair programming.",
    "It forces customer involvement at every stage of the process.",
  ],answer:[2],
  explanation:"Waterfall is inflexible — hard to accommodate changes once a stage is completed."},

{id:"C2-11",chapter:2,type:"multi",topics:["coping-with-change","prototyping","incremental-development"],
  question:"Which of the following are recognized strategies for coping with change in software development? (Select all that apply)",
  options:[
    "System prototyping to explore ideas before committing to them.",
    "Incremental delivery to get early feedback from real users.",
    "Ignoring all change requests to maintain schedule consistency.",
    "Freezing requirements permanently after the first client meeting.",
    "Refactoring existing code to improve design without changing behavior.",
    "Deleting the codebase and starting completely from scratch each time.",
  ],answer:[0,1,4],
  explanation:"Prototyping, incremental delivery, and refactoring all help cope with change."},

{id:"C2-12",chapter:2,type:"fill",topics:["evolution","process-activities"],
  question:"Software _______ is the process of changing a system after it has been delivered, in response to changing needs or discovered errors.",
  answer:["evolution"],acceptableAnswers:[["evolution"],["maintenance"]],
  explanation:"Software evolution = post-delivery changes."},

{id:"C2-13",chapter:2,type:"single",topics:["waterfall","process-models"],
  question:"In the waterfall model, when does the customer typically first see a working version of the software?",
  options:[
    "Immediately after the requirements phase is finished.",
    "During the system and software design phase of the project.",
    "Very late in the process, often not until the system is nearly complete.",
    "Before any development work on the project has actually begun.",
    "After each phase is completed, via incremental demonstrations.",
    "The customer is embedded with the team and sees progress daily.",
  ],answer:[2],
  explanation:"Major waterfall drawback: customer doesn't see working software until very late."},

{id:"C2-14",chapter:2,type:"single",topics:["waterfall","process-models"],
  question:"Which process model is most appropriate when requirements are well-understood, stable, and unlikely to change significantly?",
  options:[
    "Agile development, which embraces change through short iterations.",
    "The Waterfall model, which follows a structured sequential approach.",
    "Extreme Programming, which relies on pair programming and TDD.",
    "Scrum, which uses sprints and daily standups for team coordination.",
    "Rapid Application Development, which prioritizes speed above all else.",
    "Prototyping, which builds throwaway models to explore requirements.",
  ],answer:[1],
  explanation:"Waterfall works best with stable, well-understood requirements."},

{id:"C2-15",chapter:2,type:"single",topics:["incremental-development","incremental-delivery"],
  question:"What is 'incremental delivery' in software development?",
  options:[
    "Delivering the entire system at once after all development is complete.",
    "Delivering the system in increments, each providing part of the functionality.",
    "Delivering only the documentation to the customer before the software.",
    "Delivering the software exclusively to internal testers for validation.",
    "Delivering each line of code individually as it is written and compiled.",
    "Delivering a prototype that will later be replaced by the real system.",
  ],answer:[1],
  explanation:"Incremental delivery = deploy each increment to the customer for real use."},

// ╔════════════════════════════════════════════╗
// ║  CHAPTER 3 — AGILE DEVELOPMENT              ║
// ╚════════════════════════════════════════════╝

{id:"C3-01",chapter:3,type:"single",topics:["agile-manifesto","agile-principles"],
  question:"According to the Agile Manifesto, which of the following is valued MORE than the alternative?",
  options:[
    "Processes and tools are valued more than individuals and interactions.",
    "Comprehensive documentation is valued more than working software.",
    "Customer collaboration is valued more than contract negotiation.",
    "Following the original plan is valued more than responding to change.",
    "Detailed specifications are valued more than iterative prototyping.",
    "Management oversight is valued more than team self-organization.",
  ],answer:[2],
  explanation:"Customer collaboration over contract negotiation."},

{id:"C3-02",chapter:3,type:"single",topics:["xp","refactoring"],
  question:"In Extreme Programming (XP), what is the practice of improving existing code without changing its external behavior called?",
  options:[
    "Pair programming — two developers working at one workstation together.",
    "Refactoring — restructuring code while preserving its external behavior.",
    "Test-first development — writing automated tests before writing code.",
    "Continuous integration — merging code changes into the main branch frequently.",
    "Collective ownership — allowing any developer to modify any part of code.",
    "Simple design — keeping the code as simple as possible at all times.",
  ],answer:[1],
  explanation:"Refactoring = restructure code while keeping behavior the same."},

{id:"C3-03",chapter:3,type:"single",topics:["xp","test-first","tdd"],
  question:"What is 'test-first development' (TDD) as practiced in Extreme Programming?",
  options:[
    "Testing the software only after all code has been completely written.",
    "Writing automated tests before writing the code that makes them pass.",
    "Having the customer write all test cases based on their requirements.",
    "Testing only the graphical user interface before other components.",
    "Running performance benchmarks first before writing any unit tests.",
    "Letting the QA team define tests after the development sprint ends.",
  ],answer:[1],
  explanation:"TDD: write failing test → write code to pass → refactor → repeat."},

{id:"C3-04",chapter:3,type:"single",topics:["xp","collective-ownership"],
  question:"What does 'collective ownership' mean in Extreme Programming?",
  options:[
    "The project manager has sole ownership of all source code and assets.",
    "All developers share responsibility for all code and anyone can change anything.",
    "Each individual developer owns specific modules that only they can modify.",
    "The customer retains complete ownership of the source code at all times.",
    "Ownership of the codebase transfers to QA after each development cycle.",
    "The most senior developer owns the code and delegates changes to others.",
  ],answer:[1],
  explanation:"Collective ownership = shared responsibility, anyone can change anything."},

{id:"C3-05",chapter:3,type:"single",topics:["scrum","product-backlog"],
  question:"In Scrum, what is the Product Backlog?",
  options:[
    "A list of all bugs discovered during the current sprint's testing.",
    "A prioritized list of features, enhancements, and fixes to be done.",
    "The final release documentation package delivered to the customer.",
    "A historical record of all completed sprints and their outcomes.",
    "A technical debt register tracking code quality issues over time.",
    "A performance monitoring dashboard for the production system.",
  ],answer:[1],
  explanation:"Product Backlog = prioritized list of all work to be done on the product."},

{id:"C3-06",chapter:3,type:"single",topics:["scrum","daily-scrum"],
  question:"What is the primary purpose of the Daily Scrum (standup meeting)?",
  options:[
    "To assign blame when tasks are behind schedule or incomplete.",
    "To provide brief synchronization: what was done, what's next, any blockers.",
    "To write detailed design documents for the upcoming sprint backlog.",
    "To demonstrate the completed product increment to external stakeholders.",
    "To review and update the project's budget and resource allocations.",
    "To conduct thorough code reviews of all work completed that day.",
  ],answer:[1],
  explanation:"Daily Scrum: ~15 minute sync — what I did, what I'll do, any impediments."},

{id:"C3-07",chapter:3,type:"single",topics:["xp","user-stories"],
  question:"In Extreme Programming, what are 'user stories'?",
  options:[
    "Detailed UML sequence diagrams showing all user interaction flows.",
    "Short descriptions of functionality told from the user's perspective.",
    "Comprehensive requirements specification documents with full details.",
    "Bug reports and defect descriptions submitted by end users post-launch.",
    "Narrative accounts of how the development team solved technical challenges.",
    "Marketing materials describing how customers will benefit from features.",
  ],answer:[1],
  explanation:"User stories = short feature descriptions from the user's perspective."},

{id:"C3-08",chapter:3,type:"single",topics:["xp","small-releases"],
  question:"What does the 'small releases' practice mean in Extreme Programming?",
  options:[
    "The team releases software to the customer no more than once per year.",
    "Small, frequent increments are released so value is delivered quickly.",
    "The team releases only bug fixes, never new features, between versions.",
    "Software is released to a small number of beta customers for testing.",
    "The team releases only documentation updates between major versions.",
    "Features are kept small so they can be built by a single developer.",
  ],answer:[1],
  explanation:"Small releases = frequent increments, quick value delivery to the customer."},

{id:"C3-09",chapter:3,type:"fill",topics:["scrum","scrum-roles"],
  question:"In Scrum, the three main roles are the Product Owner, the Development Team, and the _______.",
  answer:["scrum master"],acceptableAnswers:[["scrum master"],["scrummaster"],["scrum-master"]],
  explanation:"Three Scrum roles: Product Owner, Dev Team, Scrum Master."},

{id:"C3-10",chapter:3,type:"fill",topics:["agile-manifesto","agile-principles"],
  question:"The Agile Manifesto values working _______ over comprehensive documentation.",
  answer:["software"],acceptableAnswers:[["software"]],
  explanation:"Working software over comprehensive documentation."},

{id:"C3-11",chapter:3,type:"single",topics:["xp","agile-practices"],
  question:"Which of the following is NOT a practice associated with Extreme Programming?",
  options:[
    "Pair programming — two developers sharing one workstation together.",
    "Test-first development — writing tests before writing production code.",
    "Big up-front design — completing all design before any coding begins.",
    "Refactoring — improving code structure without changing its behavior.",
    "Collective ownership — any developer can change any part of the code.",
    "Continuous integration — frequently merging changes into the main branch.",
  ],answer:[2],
  explanation:"Big up-front design is the opposite of XP, which favors incremental design."},

{id:"C3-12",chapter:3,type:"single",topics:["xp","pair-programming"],
  question:"Which of the following best describes pair programming in XP?",
  options:[
    "Two programmers work on separate features at the same time independently.",
    "Two programmers sit at one workstation — one writes code, one reviews live.",
    "A programmer and a tester work on different machines running different tools.",
    "Two project managers collaborate on reviewing the development schedule.",
    "A senior developer writes code while a junior developer takes notes only.",
    "Two developers alternate writing code on the same feature in shifts.",
  ],answer:[1],
  explanation:"Pair programming: driver writes, navigator reviews, one shared workstation."},

{id:"C3-13",chapter:3,type:"multi",topics:["agile-manifesto","agile-principles"],
  question:"Which of the following are core values stated in the Agile Manifesto? (Select all that apply)",
  options:[
    "Individuals and interactions over processes and tools.",
    "Working software over comprehensive documentation.",
    "Detailed contracts over customer collaboration.",
    "Responding to change over following a plan.",
    "Comprehensive planning over iterative delivery.",
    "Management hierarchy over team self-organization.",
  ],answer:[0,1,3],
  explanation:"NOT detailed contracts — it's customer collaboration over contract negotiation."},

{id:"C3-14",chapter:3,type:"single",topics:["scaling-agile","agile-practices"],
  question:"What primary challenge does 'scaling agile' attempt to address?",
  options:[
    "How to effectively use agile methods for solo developer projects.",
    "How to apply agile practices to large systems built by large organizations.",
    "How to reduce the total size of the software development team.",
    "How to limit the number of features in a given product release.",
    "How to prevent scope creep in projects with a single customer.",
    "How to eliminate the need for a Product Owner in Scrum teams.",
  ],answer:[1],
  explanation:"Scaling agile = applying agile to large systems and large organizations."},

{id:"C3-15",chapter:3,type:"fill",topics:["xp","pair-programming"],
  question:"In XP, _______ programming involves two developers working together at one workstation.",
  answer:["pair"],acceptableAnswers:[["pair"]],
  explanation:"Pair programming."},

{id:"C3-16",chapter:3,type:"single",topics:["scrum","sprint","sprint-review"],
  question:"What happens at the end of each Sprint in the Scrum framework?",
  options:[
    "The entire project is cancelled if the sprint goal was not achieved.",
    "A Sprint Review demonstrates the increment to stakeholders for feedback.",
    "All code written during the sprint is deleted and development restarts.",
    "The team takes a mandatory two-week break before the next sprint.",
    "The Scrum Master assigns individual performance grades to each member.",
    "A new Product Owner is elected by the development team for the next sprint.",
  ],answer:[1],
  explanation:"Sprint Review = demo increment to stakeholders and collect feedback."},

{id:"C3-17",chapter:3,type:"single",topics:["agile-manifesto","agile-principles"],
  question:"Which Agile Manifesto value specifically emphasizes adapting to new information rather than rigidly sticking to the original plan?",
  options:[
    "Individuals and interactions over processes and tools.",
    "Working software over comprehensive documentation.",
    "Customer collaboration over contract negotiation.",
    "Responding to change over following a plan.",
    "Continuous delivery over periodic major releases.",
    "Self-organizing teams over management-directed teams.",
  ],answer:[3],
  explanation:"Responding to change over following a plan."},

// ╔════════════════════════════════════════════╗
// ║  CHAPTER 4 — REQUIREMENTS ENGINEERING       ║
// ╚════════════════════════════════════════════╝

{id:"C4-01",chapter:4,type:"single",topics:["functional-vs-nonfunctional","requirements-types"],
  question:"What is the fundamental difference between functional and non-functional requirements?",
  options:[
    "Functional describe system constraints; non-functional describe what the system does.",
    "Functional describe what the system does; non-functional describe constraints and quality.",
    "There is no meaningful difference between functional and non-functional requirements.",
    "Functional requirements are always optional; non-functional are always mandatory.",
    "Functional requirements come from users; non-functional come from the dev team only.",
    "Functional requirements are testable; non-functional requirements cannot be tested.",
  ],answer:[1],
  explanation:"Functional = what the system does. Non-functional = constraints and quality attributes."},

{id:"C4-02",chapter:4,type:"multi",topics:["nonfunctional-categories","requirements-types"],
  question:"Non-functional requirements can be classified into which of the following categories? (Select all that apply)",
  options:[
    "Product requirements — performance, reliability, usability constraints.",
    "Organizational requirements — development standards and processes.",
    "External requirements — regulatory, legislative, and ethical constraints.",
    "Functional requirements — what the system should do for the user.",
    "Aesthetic requirements — visual design and branding guidelines.",
    "Historical requirements — how previous versions of the system worked.",
  ],answer:[0,1,2],
  explanation:"Three NF categories: Product, Organizational, External."},

{id:"C4-03",chapter:4,type:"single",topics:["user-vs-system-requirements","requirements-types"],
  question:"What is the key difference between user requirements and system requirements?",
  options:[
    "User requirements are natural language for stakeholders; system requirements are detailed technical specs.",
    "System requirements are written in natural language; user requirements use formal mathematical notation.",
    "User requirements are written only for the development team and are highly technical in nature.",
    "There is no meaningful distinction between user requirements and system requirements at all.",
    "User requirements are always informal; system requirements are always expressed in UML diagrams.",
    "System requirements are written first; user requirements are derived from them afterward.",
  ],answer:[0],
  explanation:"User req = natural language for stakeholders. System req = detailed technical descriptions for developers."},

{id:"C4-04",chapter:4,type:"multi",topics:["elicitation-techniques","requirements-elicitation"],
  question:"Which of the following are recognized requirements elicitation techniques? (Select all that apply)",
  options:[
    "Interviews — structured or unstructured conversations with stakeholders.",
    "Ethnography — observing people in their actual work environment.",
    "Scenarios and user stories — narrative descriptions of system interactions.",
    "Pair programming — two developers working at a single workstation.",
    "Refactoring — improving code structure without changing external behavior.",
    "Prototyping — building a working model to help explore requirements.",
    "Sprint planning — selecting items from the product backlog for a sprint.",
  ],answer:[0,1,2,5],
  explanation:"Interviews, ethnography, scenarios/stories, and prototyping are elicitation techniques."},

{id:"C4-05",chapter:4,type:"single",topics:["ethnography","elicitation-techniques"],
  question:"What is ethnography in the context of requirements elicitation?",
  options:[
    "A formal mathematical technique for specifying system requirements precisely.",
    "An observational technique where an analyst observes how people actually work.",
    "A type of automated testing framework used for acceptance test validation.",
    "A project management methodology for scheduling development team activities.",
    "A statistical method for analyzing user survey responses about their needs.",
    "A prototyping approach where mockups are shown to users for rapid feedback.",
  ],answer:[1],
  explanation:"Ethnography = observe people in their actual work environment to discover implicit requirements."},

{id:"C4-06",chapter:4,type:"multi",topics:["requirements-validation","validation-checks"],
  question:"Requirements validation checks include which of the following? (Select all that apply)",
  options:[
    "Validity checks — do requirements reflect the real needs of the users?",
    "Consistency checks — are there any contradictions between requirements?",
    "Completeness checks — have all required system functions been included?",
    "Realism checks — can requirements be implemented within budget and schedule?",
    "Verifiability checks — can the requirements be effectively tested?",
    "Profitability checks — will the system generate sufficient revenue?",
    "Popularity checks — do the majority of stakeholders like the requirements?",
  ],answer:[0,1,2,3,4],
  explanation:"Five standard checks: validity, consistency, completeness, realism, verifiability."},

{id:"C4-07",chapter:4,type:"single",topics:["requirements-management"],
  question:"What is requirements management in software engineering?",
  options:[
    "The process of writing all requirements in a single sitting before development.",
    "The process of managing changing requirements throughout the development lifecycle.",
    "The process of deleting requirements that are too difficult to implement.",
    "The process of assigning each individual requirement to a specific developer.",
    "The process of converting all requirements into UML class diagrams.",
    "The process of testing each requirement individually before development begins.",
  ],answer:[1],
  explanation:"Requirements management = managing changes to requirements as they inevitably evolve."},

{id:"C4-08",chapter:4,type:"single",topics:["stakeholders","requirements-elicitation"],
  question:"Who are stakeholders in the requirements engineering process?",
  options:[
    "Only the members of the software development team working on the project.",
    "Only the end users who will directly interact with the finished system.",
    "Anyone affected by the system — users, managers, engineers, domain experts, and others.",
    "Only the project manager and the client who commissioned the software.",
    "Only the quality assurance team responsible for validating the system.",
    "Only the executives who approved the budget for the development project.",
  ],answer:[2],
  explanation:"Stakeholders = anyone affected by or interested in the system."},

{id:"C4-09",chapter:4,type:"single",topics:["natural-language","requirements-specification"],
  question:"What is the main problem with writing requirements using natural language?",
  options:[
    "Natural language is far too expensive to use for requirements documentation.",
    "Natural language is inherently ambiguous, which can lead to misunderstandings.",
    "Only trained programmers can understand requirements written in natural language.",
    "Natural language is incapable of expressing any functional requirements at all.",
    "Natural language requirements take significantly longer to write than formal specs.",
    "Natural language cannot be translated into other spoken languages for global teams.",
  ],answer:[1],
  explanation:"Natural language is ambiguous — different readers may interpret statements differently."},

{id:"C4-10",chapter:4,type:"fill",topics:["nonfunctional-categories","requirements-types"],
  question:"The three types of non-functional requirements are product requirements, organizational requirements, and _______ requirements.",
  answer:["external"],acceptableAnswers:[["external"]],
  explanation:"Product, Organizational, External."},

{id:"C4-11",chapter:4,type:"fill",topics:["requirements-engineering","definitions"],
  question:"Requirements _______ is the process of discovering, analyzing, documenting, and checking requirements.",
  answer:["engineering"],acceptableAnswers:[["engineering"],["elicitation"]],
  explanation:"Requirements engineering."},

{id:"C4-12",chapter:4,type:"single",topics:["scenarios","elicitation-techniques"],
  question:"Which elicitation technique involves creating a narrative description of how a user interacts with the system to accomplish a specific goal?",
  options:[
    "Ethnography — immersing in the work environment to observe behaviors.",
    "Interviews — having structured conversations with individual stakeholders.",
    "Scenarios — narrative descriptions of specific user-system interactions.",
    "Brainstorming — generating ideas freely in a group workshop setting.",
    "Prototyping — building a working model for users to experiment with.",
    "Questionnaires — distributing written surveys to a large user group.",
  ],answer:[2],
  explanation:"Scenarios = narrative descriptions of specific interactions to accomplish a goal."},

{id:"C4-13",chapter:4,type:"single",topics:["nonfunctional-categories","product-requirements"],
  question:"'The system shall process 99.9% of transactions within 2 seconds' is an example of what type of requirement?",
  options:[
    "A functional requirement specifying a service the system must provide.",
    "A non-functional product requirement constraining system performance.",
    "A non-functional organizational requirement from company development standards.",
    "A non-functional external requirement imposed by government regulation.",
    "A user requirement describing the system in natural language for clients.",
    "A system constraint defining the hardware platform for deployment.",
  ],answer:[1],
  explanation:"Performance constraints = non-functional product requirement."},

{id:"C4-14",chapter:4,type:"single",topics:["nonfunctional-categories","external-requirements"],
  question:"'The system must comply with HIPAA regulations' is an example of what type of requirement?",
  options:[
    "A functional requirement specifying what services the system provides.",
    "A non-functional product requirement constraining system performance.",
    "A non-functional organizational requirement from the development team.",
    "A non-functional external requirement imposed by legislative regulation.",
    "A user requirement written in natural language for the customer.",
    "A system constraint defining the programming language to be used.",
  ],answer:[3],
  explanation:"Regulatory compliance = non-functional external requirement."},

{id:"C4-15",chapter:4,type:"multi",topics:["requirements-engineering","re-activities"],
  question:"Which of the following are activities in the requirements engineering process? (Select all that apply)",
  options:[
    "Requirements elicitation — discovering needs from stakeholders.",
    "Requirements specification — documenting the discovered requirements.",
    "Requirements validation — checking that requirements are correct and complete.",
    "Requirements implementation — writing the code that satisfies requirements.",
    "Requirements negotiation — resolving conflicts between stakeholder needs.",
    "Requirements deployment — releasing the requirements document to production.",
  ],answer:[0,1,2,4],
  explanation:"RE activities: elicitation, specification, validation, negotiation. Implementation and deployment are not RE activities."},

{id:"C4-16",chapter:4,type:"fill",topics:["functional-vs-nonfunctional","requirements-types"],
  question:"_______ requirements define the services the system should provide and how it should behave in particular situations.",
  answer:["functional"],acceptableAnswers:[["functional"]],
  explanation:"Functional requirements = services and behaviors."},

// ╔════════════════════════════════════════════╗
// ║  FREE RESPONSE (always included)            ║
// ╚════════════════════════════════════════════╝

{id:"FR1",chapter:3,type:"free",topics:["agile-manifesto","agile-principles"],
  question:"Describe the four core values of the Agile Manifesto. For each value, explain what is valued more and what is valued less, and why this matters for software development.",
  answer:[],
  explanation:"(1) Individuals and interactions over processes and tools (2) Working software over comprehensive documentation (3) Customer collaboration over contract negotiation (4) Responding to change over following a plan. Both sides have value; left is valued more."},

{id:"FR2",chapter:2,type:"free",topics:["waterfall","incremental-development","process-models"],
  question:"Compare and contrast the Waterfall Model with Incremental Development. Discuss advantages, disadvantages, and when each is most appropriate.",
  answer:[],
  explanation:"Waterfall: sequential, good docs, stable requirements, inflexible, late customer feedback. Incremental: iterative, adaptable, early feedback, but less documentation and possible structural degradation. Waterfall for safety-critical/stable; Incremental for evolving business needs."},
];

// ╔══════════════════════════════════════════════════════╗
// ║  REINFORCEMENT BANK — Extra questions per topic      ║
// ║  Used ONLY in "Practice Weak Areas" mode             ║
// ╚══════════════════════════════════════════════════════╝

const REINFORCEMENT_BANK = [
  // Essential Attributes — scenario-based
  {id:"R-EA-01",chapter:1,type:"single",topics:["essential-attributes","maintainability"],
    question:"A client says: 'We need new regulatory reporting features every quarter as laws change.' Which essential attribute is MOST important here?",
    options:["Efficiency — the system must use minimal processing resources.","Maintainability — the system must be easily modified for new requirements.","Dependability — the system must never crash during normal operations.","Acceptability — the system must be intuitive for non-technical staff.","Security — the system must prevent all unauthorized data access.","Portability — the system must run on both Windows and macOS."],
    answer:[1],explanation:"Frequently changing features = maintainability is critical."},

  {id:"R-EA-02",chapter:1,type:"single",topics:["essential-attributes","dependability"],
    question:"A medical device software failure could endanger patients in a hospital. Which essential attribute should be the TOP priority?",
    options:["Acceptability — patients should find the interface easy to use.","Efficiency — the device must respond within strict time constraints.","Dependability and Security — failures could cause physical harm.","Maintainability — the device software must be updated frequently.","Portability — the device must work across different hospital systems.","Scalability — the device must support hundreds of simultaneous users."],
    answer:[2],explanation:"Potential physical harm = dependability and security is top priority."},

  {id:"R-EA-03",chapter:1,type:"single",topics:["essential-attributes","efficiency"],
    question:"An embedded system for a satellite has only 256KB of RAM and limited battery. Which attribute is most constrained?",
    options:["Maintainability — the software needs to be updated after launch.","Efficiency — severely limited resources make resource usage critical.","Acceptability — astronauts must find the interface comfortable to use.","Dependability — the satellite must operate reliably in orbit for years.","Security — the system must prevent unauthorized command transmissions.","Portability — the system must run on multiple satellite platforms."],
    answer:[1],explanation:"Severely limited resources = efficiency is the critical constraint."},

  {id:"R-EA-04",chapter:1,type:"single",topics:["essential-attributes","acceptability"],
    question:"Users find a new payroll system confusing and incompatible with their existing HR tools. Which attribute is lacking?",
    options:["Dependability — the system crashes frequently during payroll runs.","Acceptability — the system is not usable or compatible with existing tools.","Maintainability — the development team cannot add new features easily.","Efficiency — the system takes too long to process payroll calculations.","Security — unauthorized employees can access salary information.","Portability — the system only works on one specific web browser."],
    answer:[1],explanation:"Confusing + incompatible with existing tools = poor acceptability."},

  {id:"R-EA-05",chapter:1,type:"multi",topics:["essential-attributes"],
    question:"Which of the following are the four essential attributes of good software? (Select all that apply)",
    options:["Maintainability — ability to evolve with changing needs.","Scalability — ability to handle growing user loads.","Dependability and Security — reliability and protection from harm.","Efficiency — responsible use of system resources.","Acceptability — usable, understandable, and compatible.","Portability — ability to run on multiple operating systems."],
    answer:[0,2,3,4],explanation:"The four: Maintainability, Dependability & Security, Efficiency, Acceptability."},

  // Ethics — scenario-based
  {id:"R-ETH-01",chapter:1,type:"single",topics:["ethics","professional-responsibility"],
    question:"An engineer discovers their employer is knowingly shipping software with critical security flaws. Per the ACM/IEEE Code, they should prioritize:",
    options:["Unconditional loyalty to their employer above all other concerns.","The public interest and safety over organizational loyalty.","Meeting the delivery deadline regardless of any quality concerns.","Keeping quiet to avoid creating conflict within the organization.","Requesting a raise in compensation for taking on additional risk.","Waiting to see if customers actually discover the security flaws."],
    answer:[1],explanation:"Public interest and safety = highest priority in the code of ethics."},

  {id:"R-ETH-02",chapter:1,type:"single",topics:["ethics","professional-responsibility"],
    question:"An engineer is asked to work on a project outside their area of expertise. Per professional ethics, they should:",
    options:["Accept the assignment and figure it out silently without telling anyone.","Be honest about their competence level and seek training or assistance.","Decline all work that falls outside their specific area of expertise.","Blame any resulting failures on the project manager who assigned them.","Outsource the work to a third party without informing their employer.","Agree enthusiastically and hope the team carries the technical load."],
    answer:[1],explanation:"Be honest about competence; seek training or assistance as needed."},

  // Generic vs Customized
  {id:"R-GC-01",chapter:1,type:"single",topics:["generic-vs-customized","product-types"],
    question:"Microsoft Word is an example of which type of software product?",
    options:["A customized product built for a specific organization's needs.","A generic product sold on the open market to any interested buyer.","An open-source product maintained by a community of volunteers.","An embedded product designed for a specific hardware platform only.","A prototype product used to explore requirements before full development.","A legacy product that is no longer maintained or updated by Microsoft."],
    answer:[1],explanation:"Sold to anyone on the open market = generic product."},

  {id:"R-GC-02",chapter:1,type:"single",topics:["generic-vs-customized","specification-control"],
    question:"Who decides what features to include in the next version of a generic software product?",
    options:["Individual customers submit feature requests that must be implemented.","The development organization decides based on market analysis and strategy.","Government regulators mandate specific features that must be included.","End users vote democratically on which features should be prioritized.","An independent standards body publishes required feature specifications.","The QA team determines features based on which areas have the most bugs."],
    answer:[1],explanation:"For generic products, the development organization controls the specification."},

  // Waterfall
  {id:"R-WF-01",chapter:2,type:"single",topics:["waterfall","waterfall-phases"],
    question:"In the Waterfall Model, which phase comes immediately after 'System and software design'?",
    options:["Requirements analysis and definition — gathering what users need.","Implementation and unit testing — building and testing individual modules.","Integration and system testing — combining and testing the full system.","Operation and maintenance — deploying and supporting the live system.","Project planning and scheduling — creating timelines and milestones.","Customer acceptance testing — having users validate the final product."],
    answer:[1],explanation:"Sequence: Requirements → Design → Implementation and unit testing."},

  {id:"R-WF-02",chapter:2,type:"single",topics:["waterfall","process-models","plan-driven"],
    question:"Why is the Waterfall Model described as a 'plan-driven' process?",
    options:["It does not require any planning or scheduling before development begins.","All activities must be planned and scheduled in advance before development starts.","The customer plans all features and the developers simply implement them.","It uses the 'planning poker' estimation technique from agile development.","Each developer independently plans their own work without team coordination.","Plans are created after development is complete for documentation purposes."],
    answer:[1],explanation:"Plan-driven = everything planned and scheduled before development begins."},

  {id:"R-WF-03",chapter:2,type:"fill",topics:["waterfall","waterfall-phases"],
    question:"The first phase of the Waterfall Model is requirements analysis and _______.",
    answer:["definition"],acceptableAnswers:[["definition"]],
    explanation:"First phase: Requirements Analysis and Definition."},

  // Prototyping
  {id:"R-PROTO-01",chapter:2,type:"single",topics:["prototyping","coping-with-change"],
    question:"Why should a software prototype typically be discarded after it has served its purpose?",
    options:["Prototypes are always written in a completely different programming language.","Prototypes sacrifice quality and structure for speed, creating long-term tech debt.","Customers generally do not want to see prototypes at any stage of development.","It is illegal to keep prototype code in most software licensing agreements.","Prototypes contain too much documentation that would slow down the final product.","Discarding prototypes is optional and most teams choose to keep them instead."],
    answer:[1],explanation:"Prototypes cut corners on quality/structure; using them as production code creates massive technical debt."},

  {id:"R-PROTO-02",chapter:2,type:"multi",topics:["prototyping","coping-with-change"],
    question:"What are recognized benefits of software prototyping? (Select all that apply)",
    options:["It helps clarify unclear or ambiguous requirements from stakeholders.","It allows stakeholders to see and interact with a working model early.","It completely eliminates the need for any subsequent validation activities.","It can reveal design problems and risks before full implementation begins.","It guarantees that the final product will be free of all defects.","It provides a basis for estimating development costs more accurately."],
    answer:[0,1,3,5],explanation:"Prototyping clarifies requirements, provides early visibility, reveals problems, and helps estimation. Does NOT eliminate validation or guarantee zero defects."},

  // Testing
  {id:"R-TEST-01",chapter:2,type:"single",topics:["testing","testing-stages"],
    question:"Which testing stage verifies that the complete integrated system meets its specification as a whole?",
    options:["Component testing — testing individual modules or functions in isolation.","System testing — testing the fully integrated system against its specification.","Acceptance testing — validating the system meets real customer needs.","Unit testing — testing the smallest testable parts of the application.","Regression testing — verifying new changes haven't broken existing features.","Performance testing — measuring how the system behaves under heavy load."],
    answer:[1],explanation:"System testing = complete integrated system tested against specification."},

  {id:"R-TEST-02",chapter:2,type:"single",topics:["testing","acceptance-testing"],
    question:"What is the primary goal of acceptance testing in the software development process?",
    options:["To find bugs in individual functions and methods of the codebase.","To verify the system meets real-world customer needs before deployment.","To test the system's performance under extreme load conditions and stress.","To ensure all source code lines have been properly commented by developers.","To validate that the system can be installed on all supported platforms.","To confirm the development team followed the organization's coding standards."],
    answer:[1],explanation:"Acceptance testing = validate customer's real needs before deployment."},

  // Process Activities
  {id:"R-PA-01",chapter:2,type:"fill",topics:["process-activities"],
    question:"The four fundamental process activities are specification, design and implementation, validation, and _______.",
    answer:["evolution"],acceptableAnswers:[["evolution"]],
    explanation:"Specification, Design/Implementation, Validation, Evolution."},

  // Scrum
  {id:"R-SCR-01",chapter:3,type:"single",topics:["scrum","scrum-roles","product-backlog"],
    question:"Who is responsible for managing and prioritizing the Product Backlog in Scrum?",
    options:["The Scrum Master, who facilitates all Scrum ceremonies and processes.","The Product Owner, who represents the stakeholders and manages priorities.","The Development Team, who collectively decide what to work on next.","The external stakeholders, who vote on which features are most important.","The project manager, who creates the overall schedule and resource plan.","The QA lead, who prioritizes items based on defect severity and impact."],
    answer:[1],explanation:"Product Owner manages and prioritizes the backlog."},

  {id:"R-SCR-02",chapter:3,type:"single",topics:["scrum","scrum-roles"],
    question:"What is the Scrum Master's primary responsibility within the Scrum framework?",
    options:["Writing production code and contributing to the sprint deliverables.","Managing the project budget and reporting financials to stakeholders.","Facilitating the Scrum process and removing impediments for the team.","Making all technical architecture and design decisions for the project.","Prioritizing the Product Backlog based on customer feedback and value.","Conducting performance reviews and managing team member promotions."],
    answer:[2],explanation:"Scrum Master = facilitator + impediment remover."},

  {id:"R-SCR-03",chapter:3,type:"single",topics:["scrum","sprint","sprint-review"],
    question:"How does a Sprint Review differ from a Sprint Retrospective in Scrum?",
    options:["They are the same meeting referred to by two different names.","Review demos the increment to stakeholders; Retrospective is team process reflection.","Retrospective demos the product; Review is where the team reflects on process.","Neither meeting involves any participation from the development team members.","Review focuses on budget; Retrospective focuses on schedule and deadlines.","Review happens before the sprint; Retrospective happens after the sprint ends."],
    answer:[1],explanation:"Review = demo for stakeholders. Retrospective = team reflects on their process."},

  // XP Practices
  {id:"R-XP-01",chapter:3,type:"single",topics:["xp","refactoring"],
    question:"A developer notices duplicated code across three different modules. The code works correctly. Following XP principles, they should:",
    options:["Leave the duplication alone since the code is functioning correctly as-is.","Refactor to eliminate the duplication while preserving the same external behavior.","Rewrite all three modules completely from scratch using a different approach.","Add detailed comments explaining the reason for the code duplication.","File a bug report and wait for a manager to assign the cleanup task.","Delete two of the three modules and redirect all calls to the remaining one."],
    answer:[1],explanation:"XP encourages continuous refactoring to keep code clean and eliminate duplication."},

  {id:"R-XP-02",chapter:3,type:"single",topics:["xp","test-first","tdd"],
    question:"In Test-Driven Development (TDD), what is the correct sequence of steps?",
    options:["Write all the code first, then write tests, then run all the tests at once.","Write a failing test first, then write code to pass it, then run the test again.","Write all code first, then run the program, then write tests only if bugs are found.","Write comprehensive documentation first, then write tests, then write the code.","Write tests and code simultaneously in parallel using separate team members.","Write the code, deploy it to production, then write tests based on user reports."],
    answer:[1],explanation:"TDD: Write failing test → Write code to pass → Refactor → Repeat."},

  {id:"R-XP-03",chapter:3,type:"multi",topics:["xp","agile-practices"],
    question:"Which of the following are recognized practices of Extreme Programming (XP)? (Select all that apply)",
    options:["Pair programming — two developers collaborating at one workstation.","Collective ownership — any developer can change any area of the code.","Big up-front design — completing all design work before coding begins.","Small releases — frequent delivery of small increments to the customer.","Test-first development — writing tests before writing production code.","Comprehensive documentation — writing detailed docs before each feature."],
    answer:[0,1,3,4],explanation:"XP: pair programming, collective ownership, small releases, TDD. NOT big design or comprehensive docs."},

  // Agile Manifesto
  {id:"R-AM-01",chapter:3,type:"fill",topics:["agile-manifesto","agile-principles"],
    question:"The Agile Manifesto values customer _______ over contract negotiation.",
    answer:["collaboration"],acceptableAnswers:[["collaboration"]],
    explanation:"Customer collaboration over contract negotiation."},

  {id:"R-AM-02",chapter:3,type:"fill",topics:["agile-manifesto","agile-principles"],
    question:"The Agile Manifesto values _______ and interactions over processes and tools.",
    answer:["individuals"],acceptableAnswers:[["individuals"]],
    explanation:"Individuals and interactions over processes and tools."},

  {id:"R-AM-03",chapter:3,type:"single",topics:["agile-manifesto","agile-principles"],
    question:"The Agile Manifesto states: 'while there is value in the items on the right, we value the items on the left more.' This means:",
    options:["Items on the right side of each statement are completely worthless.","Both sides have genuine value, but left-side items are given higher priority.","Only the left-side items should ever be used in software development.","Right-side items are actually more important in day-to-day practice.","The manifesto is intentionally ambiguous and has no clear meaning.","Left-side items are for small teams; right-side items are for large teams."],
    answer:[1],explanation:"Both sides have value — left is valued MORE, not exclusively."},

  // Requirements Types — scenario-based
  {id:"R-REQ-01",chapter:4,type:"single",topics:["functional-vs-nonfunctional","requirements-types"],
    question:"'The system shall allow users to search for flights by date and destination' is an example of:",
    options:["A non-functional requirement constraining the system's performance characteristics.","A functional requirement specifying a service the system must provide to users.","An organizational requirement imposed by the development team's standards.","An external requirement mandated by aviation industry government regulations.","A system constraint defining the hardware platform for the application.","A design specification describing the internal architecture of the search feature."],
    answer:[1],explanation:"Describes what the system does = functional requirement."},

  {id:"R-REQ-02",chapter:4,type:"single",topics:["functional-vs-nonfunctional","requirements-types"],
    question:"'The system shall respond to all search queries within 3 seconds under normal load' is an example of:",
    options:["A functional requirement describing a specific system service or behavior.","A non-functional product requirement constraining system performance.","A non-functional organizational requirement from company coding standards.","A non-functional external requirement imposed by government regulations.","A user requirement written in natural language for stakeholder review.","A test case specification describing how to validate the search feature."],
    answer:[1],explanation:"Performance constraint = non-functional product requirement."},

  {id:"R-REQ-03",chapter:4,type:"single",topics:["nonfunctional-categories","requirements-types"],
    question:"'All source code must follow the company's coding standards and be peer-reviewed before merging' is an example of:",
    options:["A functional requirement describing what the system must do for users.","A non-functional product requirement constraining system performance.","A non-functional organizational requirement from internal company standards.","A non-functional external requirement imposed by government legislation.","A user requirement written for non-technical stakeholders to understand.","A validation check ensuring the requirements document is internally consistent."],
    answer:[2],explanation:"Internal coding standards = organizational requirement."},

  // Elicitation — scenario-based
  {id:"R-ELIC-01",chapter:4,type:"single",topics:["ethnography","elicitation-techniques"],
    question:"An analyst spends two weeks embedded with nurses in a hospital ward to understand their daily workflow. This technique is:",
    options:["A structured interview conducted with prepared questions and topics.","A prototyping exercise where mockups are shown for rapid user feedback.","Ethnography — observing people in their actual work environment over time.","A brainstorming session where participants generate ideas collaboratively.","A survey distributed to a large group of hospital staff for statistical analysis.","A scenario walkthrough where users describe hypothetical system interactions."],
    answer:[2],explanation:"Observing people in their actual work environment = ethnography."},

  {id:"R-ELIC-02",chapter:4,type:"single",topics:["scenarios","elicitation-techniques","user-stories"],
    question:"How do scenarios differ from user stories as elicitation techniques?",
    options:["Scenarios are always shorter and more concise than user stories.",
    "Scenarios provide detailed step-by-step narratives; user stories are brief and high-level.",
    "User stories contain more technical detail and implementation specifics.",
    "There is no practical difference between scenarios and user stories at all.",
    "Scenarios are only used in waterfall; user stories are only used in agile.",
    "User stories are written by developers; scenarios are written by customers."],
    answer:[1],explanation:"Scenarios = detailed narratives. User stories = brief ('As a [user], I want [goal]')."},

  // Validation
  {id:"R-VAL-01",chapter:4,type:"single",topics:["requirements-validation","validation-checks"],
    question:"A reviewer discovers that two requirements in the specification directly contradict each other. Which validation check identified this issue?",
    options:["Validity check — verifying requirements reflect actual user needs.",
    "Consistency check — finding contradictions between different requirements.",
    "Completeness check — ensuring all required system functions are documented.",
    "Realism check — confirming requirements can be built within budget and time.",
    "Verifiability check — confirming each requirement can be effectively tested.",
    "Traceability check — linking each requirement to its original source."],
    answer:[1],explanation:"Contradictions between requirements = consistency check."},

  {id:"R-VAL-02",chapter:4,type:"single",topics:["requirements-validation","validation-checks"],
    question:"A reviewer asks: 'Can we realistically build this within our $50K budget and 3-month timeline?' This represents:",
    options:["A validity check — confirming the requirements reflect real user needs.",
    "A consistency check — ensuring no contradictions exist between requirements.",
    "A verifiability check — confirming that each requirement can be tested.",
    "A realism check — assessing whether requirements can be met within constraints.",
    "A completeness check — verifying all necessary functions have been specified.",
    "A traceability check — linking requirements to their original sources."],
    answer:[3],explanation:"Budget/timeline feasibility = realism check."},

  // User vs System Requirements
  {id:"R-USR-01",chapter:4,type:"single",topics:["user-vs-system-requirements"],
    question:"User requirement: 'Managers should be able to easily view monthly sales reports.' The corresponding system requirement would be:",
    options:["An identical copy of the user requirement with no additional detail.",
    "A detailed spec: 'Generate monthly PDF reports via Reports menu, filtered by date range and category.'",
    "Simply the phrase 'Generate reports' with no further specification needed.",
    "A UML class diagram with no accompanying text description of the feature.",
    "A user story card: 'As a manager, I want reports' with no acceptance criteria.",
    "A performance benchmark: 'Reports must load in under 2 seconds at all times.'"],
    answer:[1],explanation:"System requirements translate user needs into detailed technical specifications."},

  // Requirements Management
  {id:"R-RM-01",chapter:4,type:"single",topics:["requirements-management"],
    question:"Why is requirements management considered necessary throughout the development lifecycle?",
    options:["Requirements never actually change once they have been initially documented.",
    "Requirements inevitably change as understanding grows and business needs evolve.",
    "It creates additional busywork that helps justify larger project budgets.",
    "The waterfall model requires it but agile methodologies do not need it.",
    "It is only needed for external requirements, not for functional requirements.",
    "Requirements management is optional and most successful projects skip it."],
    answer:[1],explanation:"Change is inevitable — requirements management ensures changes are tracked and properly incorporated."},

  // Incremental Development
  {id:"R-INC-01",chapter:2,type:"single",topics:["incremental-development","process-models"],
    question:"What is a key disadvantage of incremental development for large, long-lived systems?",
    options:["The process is always too slow for any practical business application.",
    "System structure may degrade over time and documentation may be insufficient.",
    "Customers are never willing to provide feedback on intermediate versions.",
    "It can only produce very small systems with limited functionality overall.",
    "The development team must be entirely replaced between each increment.",
    "It requires twice as much testing as the waterfall model for the same features."],
    answer:[1],explanation:"Incremental development can lead to structural degradation and insufficient documentation for long-term maintenance."},

  // COTS
  {id:"R-COTS-01",chapter:2,type:"single",topics:["integration-configuration","cots","reuse"],
    question:"What is the main trade-off when using COTS (Commercial Off-The-Shelf) components?",
    options:["COTS components are always significantly more expensive than custom development.",
    "Requirements may need to adapt to available components, compromising ideal design.",
    "COTS components cannot be tested or validated before integration into the system.",
    "COTS components are always outdated and use deprecated technology stacks.",
    "Using COTS eliminates the need for any system integration or testing efforts.",
    "COTS vendors always provide unlimited free support and maintenance forever."],
    answer:[1],explanation:"Using COTS often means adapting requirements to fit available components rather than building the ideal solution."},
];

if (typeof module !== "undefined") {
  module.exports = {
    QUESTION_BANK,
    REINFORCEMENT_BANK
  };
}
