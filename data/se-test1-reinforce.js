// United Exams - Software Engineering Test 1 Reinforcement Bank
window.SE_TEST1_REINFORCE = [
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
