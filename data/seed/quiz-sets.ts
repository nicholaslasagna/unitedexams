import type { QuizSet } from "@/lib/types";

export const quizSets: QuizSet[] = [
  {
    id: "se-foundations",
    courseId: "software-engineering",
    title: "SE Foundations: Requirements to Delivery",
    description: "Core concepts for structured software engineering workflows.",
    difficulty: "Intermediate",
    estMinutes: 24,
    tags: ["requirements", "agile", "testing"],
    timerDefaultMinutes: 22,
    questions: [
      {
        id: "se-f-1",
        type: "single",
        prompt: "Which artifact best captures **functional requirements** from a user perspective?",
        options: ["Class diagram", "Use case", "Deployment diagram", "Sequence diagram"],
        correct: [1],
        explanation: "Use cases describe user goals and system interactions at a functional level.",
        tags: ["requirements", "uml"],
        references: ["IEEE 29148 Requirements Engineering"]
      },
      {
        id: "se-f-2",
        type: "multi",
        prompt: "You are defining a sprint goal. Which practices usually improve delivery quality?",
        options: [
          "Definition of Done with test criteria",
          "Daily stand-up with blockers",
          "Skipping retrospective to save time",
          "Small vertical slices"
        ],
        correct: [0, 1, 3],
        explanation:
          "Reliable sprints require shared quality gates, continuous communication, and incremental slices of value.",
        tags: ["agile", "delivery"],
        walkthroughSteps: [
          "Start from **what reduces risk each day** in a sprint.",
          "Keep options that improve visibility and quality control.",
          "Reject options that remove learning loops (like skipping retrospective)."
        ]
      },
      {
        id: "se-f-3",
        type: "single",
        prompt: "In SOLID, the **Open/Closed Principle** suggests that modules should be:",
        options: [
          "Open for modification, closed for extension",
          "Closed for modification, open for extension",
          "Closed for both",
          "Open for both"
        ],
        correct: [1],
        explanation:
          "You should be able to add behavior by extension, without rewriting stable code.",
        tags: ["solid", "design"]
      },
      {
        id: "se-f-4",
        type: "single",
        prompt:
          "A product owner requests a fast patch in production. Which approach balances speed and reliability best?",
        options: [
          "Hotfix straight to production with no tests",
          "Hotfix branch with targeted tests + rollback plan",
          "Wait for next quarter release",
          "Disable CI temporarily"
        ],
        correct: [1],
        explanation:
          "A controlled hotfix path with tests and rollback strategy is standard incident-safe practice.",
        tags: ["devops", "quality"],
        walkthroughSteps: [
          "Identify what minimizes blast radius.",
          "Look for explicit risk controls: tests, branch isolation, rollback.",
          "Prefer the option that is fast **and** reversible."
        ]
      },
      {
        id: "se-f-5",
        type: "multi",
        prompt: "Which are valid examples of **non-functional requirements**?",
        options: [
          "API p95 latency under 200ms",
          "User can reset password",
          "99.9% monthly availability",
          "System shall support 20,000 concurrent sessions"
        ],
        correct: [0, 2, 3],
        explanation: "Performance, reliability, and scalability are non-functional qualities.",
        tags: ["requirements", "quality-attributes"]
      },
      {
        id: "se-f-6",
        type: "single",
        prompt: "Which test type primarily validates behavior between collaborating modules?",
        options: ["Unit test", "Integration test", "Snapshot test", "Linting"],
        correct: [1],
        explanation: "Integration tests validate interfaces and collaboration boundaries.",
        tags: ["testing"]
      },
      {
        id: "se-f-7",
        type: "single",
        prompt:
          "A team has high lead time and low deployment frequency. What is the highest-leverage first move?",
        options: [
          "Add manual QA stage at end",
          "Introduce CI with fast test suite and branch protections",
          "Increase sprint duration",
          "Remove code review"
        ],
        correct: [1],
        explanation:
          "Fast, trustworthy CI reduces merge friction and unlocks frequent safe deployments.",
        tags: ["devops", "metrics"]
      },
      {
        id: "se-f-8",
        type: "multi",
        prompt: "Code review quality improves when reviewers do which actions?",
        options: [
          "Focus comments on correctness and maintainability",
          "Block every stylistic preference difference",
          "Ask for tests around risky logic",
          "Reference architecture decisions"
        ],
        correct: [0, 2, 3],
        explanation: "High-quality reviews optimize signal: risk, correctness, and architectural alignment.",
        tags: ["review", "quality"]
      }
    ]
  },
  {
    id: "se-architecture-patterns",
    courseId: "software-engineering",
    title: "Architecture Patterns & Tradeoffs",
    description: "Reason about modularity, scalability, and maintainability tradeoffs.",
    difficulty: "Advanced",
    estMinutes: 26,
    tags: ["architecture", "patterns", "scalability"],
    timerDefaultMinutes: 24,
    questions: [
      {
        id: "se-a-1",
        type: "single",
        prompt: "In a layered architecture, what is a common anti-pattern?",
        options: [
          "Dependency inversion at boundaries",
          "Skipping domain validation in service layer",
          "Explicit repository interfaces",
          "Contract tests between layers"
        ],
        correct: [1],
        explanation: "Bypassing validation in service logic causes data integrity and business rule drift.",
        tags: ["architecture", "anti-pattern"]
      },
      {
        id: "se-a-2",
        type: "multi",
        prompt: "When introducing a message queue, which benefits are typical?",
        options: [
          "Temporal decoupling",
          "Smoothing traffic spikes",
          "Guaranteed zero complexity",
          "Retry and dead-letter handling"
        ],
        correct: [0, 1, 3],
        explanation: "Queues decouple producers/consumers and support resilience patterns.",
        tags: ["distributed-systems", "reliability"],
        walkthroughSteps: [
          "Map each option to real queue behavior.",
          "Keep operational resilience traits.",
          "Discard absolute claims like 'zero complexity'."
        ]
      },
      {
        id: "se-a-3",
        type: "single",
        prompt: "Which metric best indicates service reliability from a user perspective?",
        options: ["Lines of code", "Uptime/SLO attainment", "Pull request count", "Build minutes"],
        correct: [1],
        explanation: "Reliability is measured against user-facing availability and latency objectives.",
        tags: ["sre", "metrics"]
      },
      {
        id: "se-a-4",
        type: "single",
        prompt: "A monolith is becoming hard to scale. What migration strategy is usually safest?",
        options: [
          "Immediate rewrite into 20 microservices",
          "Strangler pattern around high-change domains",
          "Pause features for one year",
          "Duplicate entire system"
        ],
        correct: [1],
        explanation: "The strangler approach incrementally replaces functionality with lower migration risk.",
        tags: ["migration", "architecture"],
        walkthroughSteps: [
          "Choose incremental over big-bang migration.",
          "Prefer domain-by-domain extraction with observability.",
          "Preserve delivery cadence while migrating."
        ]
      },
      {
        id: "se-a-5",
        type: "multi",
        prompt: "For API versioning, which practices usually reduce client breakage?",
        options: [
          "Backward-compatible schema evolution",
          "Deprecation windows + migration guides",
          "Silent breaking changes",
          "Contract tests per client-critical flow"
        ],
        correct: [0, 1, 3],
        explanation: "Compatibility and communication are central to safe API evolution.",
        tags: ["api", "versioning"]
      },
      {
        id: "se-a-6",
        type: "single",
        prompt: "What is the primary purpose of an ADR (Architecture Decision Record)?",
        options: [
          "Store build artifacts",
          "Document design decisions and tradeoffs",
          "Replace unit tests",
          "Track sprint velocity"
        ],
        correct: [1],
        explanation: "ADRs preserve architectural context and rationale for future teams.",
        tags: ["documentation", "architecture"]
      },
      {
        id: "se-a-7",
        type: "single",
        prompt: "Which caching strategy most directly protects the database under heavy read load?",
        options: ["Write-through only", "Read-through with TTL", "No cache", "Random eviction"],
        correct: [1],
        explanation: "Read-through + TTL can dramatically reduce repetitive read pressure.",
        tags: ["performance", "cache"]
      },
      {
        id: "se-a-8",
        type: "multi",
        prompt: "Which are signals of healthy engineering architecture governance?",
        options: [
          "Shared standards and review guidelines",
          "Architecture board with no feedback loop",
          "Periodic postmortems feeding design improvements",
          "Explicit ownership of critical systems"
        ],
        correct: [0, 2, 3],
        explanation: "Governance works when it is documented, iterative, and ownership-driven.",
        tags: ["governance", "quality"]
      }
    ]
  },
  {
    id: "de-core-methods",
    courseId: "differential-equations",
    title: "Core Methods: First/Second Order ODEs",
    description: "Separable equations, linear ODEs, characteristic roots, and solution strategy.",
    difficulty: "Advanced",
    estMinutes: 28,
    tags: ["separable", "characteristic", "strategy"],
    timerDefaultMinutes: 25,
    questions: [
      {
        id: "de-c-1",
        type: "single",
        prompt: "Which equation is separable as written?",
        options: ["$y' + y = x$", "$y' = x(1+y)$", "$y'' + y = 0$", "$y' + \sin(y)=x$"],
        correct: [1],
        explanation:
          "$y' = x(1+y)$ rearranges to $\frac{dy}{1+y}=x\,dx$, so variables separate cleanly.",
        tags: ["separable", "first-order"]
      },
      {
        id: "de-c-2",
        type: "multi",
        prompt:
          "For a second-order linear nonhomogeneous equation with constant coefficients, which solution workflow is correct?",
        options: [
          "Solve homogeneous part using characteristic equation",
          "Find one particular solution using UC or variation of parameters",
          "Add $y_h + y_p$ and apply initial conditions",
          "Skip initial conditions because constants cancel"
        ],
        correct: [0, 1, 2],
        explanation:
          "Standard process: solve $y_h$, find $y_p$, combine, then fit constants from initial data.",
        tags: ["second-order", "workflow"],
        walkthroughSteps: [
          "Write the homogeneous equation and solve for characteristic roots.",
          "Pick a particular-solution method based on forcing type.",
          "Combine and apply initial conditions at the end."
        ],
        references: ["Boyce & DiPrima, Ch. 3"]
      },
      {
        id: "de-c-3",
        type: "single",
        prompt:
          "If characteristic roots are $r = 2 \pm 3i$, which homogeneous form is correct?",
        options: [
          "$y_h=e^{2x}(c_1\cos 3x + c_2\sin 3x)$",
          "$y_h=c_1e^{2x}+c_2e^{3x}$",
          "$y_h=(c_1+c_2x)e^{2x}$",
          "$y_h=c_1\cos 2x + c_2\sin 2x$"
        ],
        correct: [0],
        explanation: "Complex roots $a\pm bi$ produce $e^{ax}(c_1\cos bx+c_2\sin bx)$.",
        tags: ["characteristic", "complex-roots"]
      },
      {
        id: "de-c-4",
        type: "single",
        prompt: "For $y' + P(x)y = Q(x)$, the integrating factor is:",
        options: ["$e^{\int Q(x)dx}$", "$e^{\int P(x)dx}$", "$\int P(x)Q(x)dx$", "$P(x)^{-1}$"],
        correct: [1],
        explanation: "Integrating factor: $\mu(x)=e^{\int P(x)dx}$.",
        tags: ["linear-ode", "integrating-factor"]
      },
      {
        id: "de-c-5",
        type: "single",
        prompt: "When trial particular solution overlaps with $y_h$, what should you do?",
        options: [
          "Stop and switch to numerical methods",
          "Multiply trial by $x$ (or higher power if needed)",
          "Change the equation",
          "Ignore overlap"
        ],
        correct: [1],
        explanation: "Resonance correction restores linear independence from homogeneous basis.",
        tags: ["undetermined-coefficients", "resonance"]
      },
      {
        id: "de-c-6",
        type: "multi",
        prompt: "Which statements about Wronskian are generally true in this context?",
        options: [
          "Nonzero Wronskian on interval implies linear independence",
          "Wronskian is only used for PDEs",
          "Wronskian helps in variation of parameters",
          "Wronskian determines boundary conditions directly"
        ],
        correct: [0, 2],
        explanation: "Wronskian is a key linear independence tool and appears in variation-of-parameters formulas.",
        tags: ["wronskian", "vop"]
      },
      {
        id: "de-c-7",
        type: "single",
        prompt: "For logistic model $y'=ry(1-y/K)$, equilibrium solutions are:",
        options: ["$y=r, K$", "$y=0, K$", "$y=1, r$", "$y=-K, K$"],
        correct: [1],
        explanation: "Set RHS to zero: $y=0$ or $y=K$.",
        tags: ["logistic", "equilibria"]
      },
      {
        id: "de-c-8",
        type: "single",
        prompt: "Which forcing term is especially convenient for undetermined coefficients?",
        options: [
          "$\ln x$",
          "$x^2 + 3e^x - 2\cos x$",
          "$\tan x$",
          "$\frac{1}{1+x^2}$"
        ],
        correct: [1],
        explanation:
          "Polynomials, exponentials, and sines/cosines are canonical UC-friendly forcing types.",
        tags: ["undetermined-coefficients"]
      }
    ]
  },
  {
    id: "de-laplace-systems",
    courseId: "differential-equations",
    title: "Laplace, IVPs, and Dynamical Systems",
    description: "Transform methods, piecewise forcing, and linear system stability.",
    difficulty: "Advanced",
    estMinutes: 30,
    tags: ["laplace", "ivp", "systems"],
    timerDefaultMinutes: 27,
    questions: [
      {
        id: "de-l-1",
        type: "single",
        prompt: "If $\mathcal{L}\{y(t)\}=Y(s)$, then $\mathcal{L}\{y'(t)\}$ equals:",
        options: ["$sY(s)$", "$sY(s)-y(0)$", "$Y(s)-y(0)$", "$s^2Y(s)$"],
        correct: [1],
        explanation: "Derivative rule: $\mathcal{L}\{y'\}=sY(s)-y(0)$.",
        tags: ["laplace", "derivative-rule"]
      },
      {
        id: "de-l-2",
        type: "multi",
        prompt: "Why is Laplace transform often preferred for IVPs?",
        options: [
          "Converts derivatives to algebraic terms",
          "Encodes initial conditions naturally",
          "Cannot handle piecewise forcing",
          "Works well with impulses and unit-step inputs"
        ],
        correct: [0, 1, 3],
        explanation: "Laplace is strong on initial-value and discontinuous forcing problems.",
        tags: ["ivp", "forcing"],
        walkthroughSteps: [
          "List what makes direct ODE solving hard (piecewise/impulse inputs).",
          "Match Laplace strengths to those pain points.",
          "Reject options that contradict transform theorems."
        ]
      },
      {
        id: "de-l-3",
        type: "single",
        prompt: "$\mathcal{L}\{\sin(at)\}$ is:",
        options: ["$\frac{a}{s^2+a^2}$", "$\frac{s}{s^2+a^2}$", "$\frac{1}{s-a}$", "$\frac{a}{s-a}$"],
        correct: [0],
        explanation: "Standard table entry: $\mathcal{L}\{\sin(at)\}=a/(s^2+a^2)$.",
        tags: ["laplace-table"]
      },
      {
        id: "de-l-4",
        type: "single",
        prompt: "Inverse Laplace of $\frac{1}{s-3}$ is:",
        options: ["$e^{-3t}$", "$3e^t$", "$e^{3t}$", "$te^{3t}$"],
        correct: [2],
        explanation: "$\mathcal{L}^{-1}\{1/(s-a)\}=e^{at}$.",
        tags: ["inverse-laplace"]
      },
      {
        id: "de-l-5",
        type: "multi",
        prompt: "In phase portrait analysis for linear systems, useful qualitative objects include:",
        options: ["Equilibria", "Nullclines", "Flow direction arrows", "Only exact decimal trajectories"],
        correct: [0, 1, 2],
        explanation: "Qualitative analysis prioritizes structure and behavior classes, not exact numeric traces.",
        tags: ["phase-plane", "systems"]
      },
      {
        id: "de-l-6",
        type: "single",
        prompt:
          "For $\mathbf{x}'=A\mathbf{x}$, if all eigenvalues of $A$ have negative real parts, origin is:",
        options: ["Unstable", "Asymptotically stable", "Always center", "Indeterminate"],
        correct: [1],
        explanation: "Negative real parts imply decay to the equilibrium.",
        tags: ["stability", "eigenvalues"]
      },
      {
        id: "de-l-7",
        type: "single",
        prompt: "Convolution in time domain corresponds to what in Laplace domain?",
        options: ["Subtraction", "Multiplication", "Differentiation", "Time shift"],
        correct: [1],
        explanation: "Convolution theorem: $\mathcal{L}\{f * g\}=F(s)G(s)$.",
        tags: ["convolution", "laplace"]
      },
      {
        id: "de-l-8",
        type: "single",
        prompt: "A linear 2D system with one positive and one negative real eigenvalue has a:",
        options: ["Stable node", "Center", "Saddle", "Spiral sink"],
        correct: [2],
        explanation: "Opposite-sign eigenvalues imply saddle behavior.",
        tags: ["classification", "phase-plane"]
      }
    ]
  },
  {
    id: "ca-isa-and-assembly",
    courseId: "computer-architecture",
    title: "ISA, Assembly, and Performance Basics",
    description: "Instruction behavior, register usage, and performance metrics.",
    difficulty: "Intermediate",
    estMinutes: 25,
    tags: ["isa", "assembly", "cpi"],
    timerDefaultMinutes: 22,
    questions: [
      {
        id: "ca-i-1",
        type: "single",
        prompt: "Which quantity is captured by CPI?",
        options: [
          "Cycles per instruction",
          "Clock speed per instruction",
          "Instructions per cycle",
          "Cache misses per instruction"
        ],
        correct: [0],
        explanation: "CPI directly means average cycles required for each instruction.",
        tags: ["performance", "cpi"]
      },
      {
        id: "ca-i-2",
        type: "single",
        prompt: "Given this MIPS snippet, what does it compute?\n\n```asm\nadd $t0, $t1, $t2\nsub $t3, $t0, $t4\n```",
        options: [
          "$t3 = ($t1 + $t2) - $t4$",
          "$t3 = $t1 - $t2 - $t4$",
          "$t0 = $t3 + $t4$",
          "$t3 = $t1 + $t2 + $t4$"
        ],
        correct: [0],
        explanation: "First add computes intermediate in $t0$, then subtract uses that intermediate.",
        tags: ["assembly", "registers"],
        walkthroughSteps: [
          "Track register values line by line.",
          "Write symbolic expression after each instruction.",
          "Substitute the intermediate into final assignment."
        ]
      },
      {
        id: "ca-i-3",
        type: "multi",
        prompt: "RISC design philosophy generally emphasizes:",
        options: [
          "Simple instructions with uniform formats",
          "Large microcoded complex instructions",
          "Load/store architecture",
          "Pipeline-friendly operations"
        ],
        correct: [0, 2, 3],
        explanation: "RISC prioritizes simpler, regular instructions and pipeline efficiency.",
        tags: ["isa", "risc"]
      },
      {
        id: "ca-i-4",
        type: "single",
        prompt: "If CPU time = Instruction Count × CPI × Clock Cycle Time, reducing CPI does what?",
        options: ["Always increases time", "Reduces CPU time, all else fixed", "No effect", "Only affects memory"],
        correct: [1],
        explanation: "Direct proportionality: lower CPI lowers total CPU execution time.",
        tags: ["performance"]
      },
      {
        id: "ca-i-5",
        type: "single",
        prompt: "What is the main purpose of an instruction set architecture (ISA)?",
        options: [
          "Define compiler UI",
          "Define software-hardware contract",
          "Define motherboard layout",
          "Define cache replacement policy"
        ],
        correct: [1],
        explanation: "ISA specifies operations, registers, addressing, and visible behavior.",
        tags: ["isa"]
      },
      {
        id: "ca-i-6",
        type: "multi",
        prompt: "Which factors can increase effective instruction throughput?",
        options: [
          "Reducing branch misprediction",
          "Higher cache hit rate",
          "Increasing pipeline stalls",
          "Compiler optimizations reducing dynamic instruction count"
        ],
        correct: [0, 1, 3],
        explanation: "Throughput improves when stalls and memory delays are reduced.",
        tags: ["pipeline", "cache", "performance"]
      },
      {
        id: "ca-i-7",
        type: "single",
        prompt: "In little-endian systems, the least significant byte is stored at:",
        options: ["Highest address", "Lowest address", "Random address", "Middle address"],
        correct: [1],
        explanation: "Little-endian places low-significance bytes first in memory.",
        tags: ["memory", "endianness"]
      },
      {
        id: "ca-i-8",
        type: "single",
        prompt: "What does this branch do?\n\n```asm\nbeq $t0, $zero, done\n```",
        options: [
          "Branch to done if $t0 != 0",
          "Branch to done if $t0 == 0",
          "Always branch",
          "Compare $t0 with $t1"
        ],
        correct: [1],
        explanation: "`beq` branches when the compared registers are equal.",
        tags: ["assembly", "control-flow"]
      }
    ]
  },
  {
    id: "ca-pipeline-cache",
    courseId: "computer-architecture",
    title: "Pipelining, Hazards, and Cache Systems",
    description: "Pipeline behavior, hazard handling, and memory hierarchy design.",
    difficulty: "Advanced",
    estMinutes: 29,
    tags: ["pipeline", "hazards", "cache"],
    timerDefaultMinutes: 26,
    questions: [
      {
        id: "ca-p-1",
        type: "single",
        prompt: "A **data hazard** occurs when:",
        options: [
          "Two instructions need same ALU simultaneously",
          "An instruction depends on result not yet written back",
          "Branch target is unknown",
          "Cache line is dirty"
        ],
        correct: [1],
        explanation: "Data dependencies in overlapping pipeline stages create data hazards.",
        tags: ["pipeline", "hazards"]
      },
      {
        id: "ca-p-2",
        type: "multi",
        prompt: "Common ways to mitigate control hazards include:",
        options: ["Branch prediction", "Delayed branching", "Instruction forwarding", "Speculative execution"],
        correct: [0, 1, 3],
        explanation: "Control hazards involve branch decisions and speculative control flow handling.",
        tags: ["control-hazard", "prediction"],
        walkthroughSteps: [
          "Separate data-hazard fixes from control-hazard fixes.",
          "Keep branch-specific techniques.",
          "Forwarding solves data hazards, not branch decision timing."
        ]
      },
      {
        id: "ca-p-3",
        type: "single",
        prompt: "A direct-mapped cache maps each memory block to:",
        options: ["Any cache line", "Exactly one cache line", "Two possible sets", "Only L2 cache"],
        correct: [1],
        explanation: "Direct mapping has one deterministic location per block.",
        tags: ["cache", "mapping"]
      },
      {
        id: "ca-p-4",
        type: "single",
        prompt: "What is the main tradeoff of increasing cache associativity?",
        options: [
          "Lower hit rate, lower complexity",
          "Potentially higher hit rate, higher lookup complexity",
          "No effect on misses",
          "Only affects write policy"
        ],
        correct: [1],
        explanation: "Higher associativity reduces conflict misses but increases hardware lookup complexity.",
        tags: ["cache", "associativity"]
      },
      {
        id: "ca-p-5",
        type: "multi",
        prompt: "Which options are **structural hazards** examples?",
        options: [
          "Single memory port needed by instruction fetch and data load simultaneously",
          "Two instructions requiring same multiplier unit in same cycle",
          "Branch direction unknown",
          "Read-after-write dependency"
        ],
        correct: [0, 1],
        explanation: "Structural hazards arise from resource contention.",
        tags: ["hazards", "resources"]
      },
      {
        id: "ca-p-6",
        type: "single",
        prompt: "`AMAT = Hit Time + Miss Rate × Miss Penalty` models:",
        options: ["CPU throughput", "Average memory access latency", "Branch delay", "Power efficiency"],
        correct: [1],
        explanation: "AMAT estimates effective memory access cost under cache behavior.",
        tags: ["cache", "amat"]
      },
      {
        id: "ca-p-7",
        type: "single",
        prompt: "Instruction forwarding primarily helps with:",
        options: ["Control hazards", "Data hazards", "Cache misses", "TLB misses"],
        correct: [1],
        explanation: "Forwarding bypasses yet-to-be-written values to dependent pipeline stages.",
        tags: ["pipeline", "forwarding"]
      },
      {
        id: "ca-p-8",
        type: "single",
        prompt: "If branch predictor accuracy improves, expected pipeline performance typically:",
        options: ["Decreases", "Stays same", "Improves due to fewer flushes", "Becomes unstable"],
        correct: [2],
        explanation: "Fewer mispredictions means fewer costly pipeline flushes.",
        tags: ["branch", "performance"]
      }
    ]
  },
  {
    id: "ta-automata-core",
    courseId: "theory-of-automata",
    title: "Finite Automata & Regular Languages",
    description: "DFA/NFA behavior, regular expressions, and closure properties.",
    difficulty: "Intermediate",
    estMinutes: 26,
    tags: ["dfa", "nfa", "regex"],
    timerDefaultMinutes: 24,
    questions: [
      {
        id: "ta-c-1",
        type: "single",
        prompt: "A DFA differs from an NFA mainly because:",
        options: [
          "DFA can have epsilon transitions",
          "DFA has exactly one transition per symbol from each state",
          "NFA cannot recognize regular languages",
          "DFA requires stack memory"
        ],
        correct: [1],
        explanation: "DFA transition function is total and deterministic.",
        tags: ["dfa", "nfa"]
      },
      {
        id: "ta-c-2",
        type: "multi",
        prompt: "Regular languages are closed under which operations?",
        options: ["Union", "Concatenation", "Complement", "Intersection"],
        correct: [0, 1, 2, 3],
        explanation: "All listed operations preserve regularity.",
        tags: ["closure", "regular-languages"],
        walkthroughSteps: [
          "Recall canonical closure theorem list for regular languages.",
          "Use DeMorgan + complement to reason about intersection if needed.",
          "All four operations are valid closures."
        ],
        references: ["Hopcroft-Ullman, Ch. 2"]
      },
      {
        id: "ta-c-3",
        type: "single",
        prompt: "Which regex matches binary strings ending in `01`?",
        options: ["`(0|1)*01`", "`01(0|1)*`", "`(01)*`", "`0*1*`"],
        correct: [0],
        explanation: "Any prefix over `{0,1}` followed by literal suffix `01`.",
        tags: ["regex"]
      },
      {
        id: "ta-c-4",
        type: "single",
        prompt: "The subset construction converts:",
        options: ["DFA to NFA", "NFA to DFA", "PDA to CFG", "TM to DFA"],
        correct: [1],
        explanation: "Subset (powerset) construction determinizes an NFA.",
        tags: ["construction", "dfa"]
      },
      {
        id: "ta-c-5",
        type: "multi",
        prompt: "What are typical reasons to minimize a DFA?",
        options: [
          "Reduce state count",
          "Obtain canonical equivalent form",
          "Increase language class",
          "Simplify implementation"
        ],
        correct: [0, 1, 3],
        explanation: "Minimization preserves language while reducing complexity.",
        tags: ["minimization"]
      },
      {
        id: "ta-c-6",
        type: "single",
        prompt: "A language is regular if there exists:",
        options: ["A DFA recognizing it", "A TM halting on all input", "A context-free grammar only", "A PDA only"],
        correct: [0],
        explanation: "Existence of a DFA is equivalent characterization of regular languages.",
        tags: ["regular-languages"]
      },
      {
        id: "ta-c-7",
        type: "single",
        prompt: "What does pumping lemma for regular languages primarily help prove?",
        options: ["Language is regular", "Language is non-regular", "Automaton is minimal", "Grammar is ambiguous"],
        correct: [1],
        explanation: "Pumping lemma is mostly used for contradiction to show non-regularity.",
        tags: ["proofs", "pumping-lemma"]
      },
      {
        id: "ta-c-8",
        type: "single",
        prompt: "If two states are distinguishable, then in minimization they:",
        options: ["Merge", "Stay separate", "Become accepting", "Must be start states"],
        correct: [1],
        explanation: "Distinguishable states cannot be merged without changing the language.",
        tags: ["minimization", "equivalence"]
      }
    ]
  },
  {
    id: "ta-cfg-tm",
    courseId: "theory-of-automata",
    title: "CFGs, PDAs, and Turing Machines",
    description: "Context-free structure, parsing intuition, and computability boundaries.",
    difficulty: "Advanced",
    estMinutes: 31,
    tags: ["cfg", "pda", "tm"],
    timerDefaultMinutes: 28,
    questions: [
      {
        id: "ta-a-1",
        type: "single",
        prompt: "Which model recognizes exactly the context-free languages?",
        options: ["DFA", "NFA", "PDA", "LBA"],
        correct: [2],
        explanation: "Pushdown automata characterize context-free languages.",
        tags: ["cfg", "pda"]
      },
      {
        id: "ta-a-2",
        type: "multi",
        prompt: "For CFGs, which statements are true?",
        options: [
          "Ambiguity means a string can have more than one parse tree",
          "Every CFL has an unambiguous grammar",
          "Leftmost and rightmost derivations can represent same parse tree",
          "CNF conversion preserves language except possibly $\epsilon$ handling"
        ],
        correct: [0, 2, 3],
        explanation: "Not all CFLs are unambiguous, but ambiguity and CNF properties hold as stated.",
        tags: ["cfg", "parsing"],
        walkthroughSteps: [
          "Evaluate each statement against standard CFL theorems.",
          "Watch for absolute claims like 'every'.",
          "Remember CNF conversion caveat around epsilon/start symbol handling."
        ]
      },
      {
        id: "ta-a-3",
        type: "single",
        prompt: "A language is decidable if there exists a TM that:",
        options: [
          "Accepts members and may loop forever on non-members",
          "Halts on every input and answers yes/no correctly",
          "Uses at most one tape",
          "Has no reject state"
        ],
        correct: [1],
        explanation: "Deciders must halt on all inputs.",
        tags: ["decidability", "tm"]
      },
      {
        id: "ta-a-4",
        type: "single",
        prompt: "Which is a classic undecidable problem?",
        options: ["DFA emptiness", "TM acceptance problem", "DFA minimization", "CFG membership"],
        correct: [1],
        explanation: "General TM acceptance is undecidable.",
        tags: ["undecidable", "tm"]
      },
      {
        id: "ta-a-5",
        type: "multi",
        prompt: "Useful proof techniques in automata/computability include:",
        options: ["Reduction", "Diagonalization", "Induction", "Random guessing"],
        correct: [0, 1, 2],
        explanation: "Rigorous proofs rely on formal methods, not random guessing.",
        tags: ["proof-techniques"]
      },
      {
        id: "ta-a-6",
        type: "single",
        prompt: "The language $\{a^n b^n \mid n\ge 0\}$ is:",
        options: ["Regular", "Context-free but not regular", "Not context-free", "Finite"],
        correct: [1],
        explanation: "It is CFL (recognized by PDA) but fails regular pumping lemma.",
        tags: ["cfl", "regular-vs-cfl"]
      },
      {
        id: "ta-a-7",
        type: "single",
        prompt: "What does Rice's theorem broadly assert?",
        options: [
          "All TM properties are decidable",
          "Any nontrivial semantic property of TM-recognized languages is undecidable",
          "Only syntax properties are undecidable",
          "Regex matching is undecidable"
        ],
        correct: [1],
        explanation: "Rice classifies broad semantic language properties as undecidable if nontrivial.",
        tags: ["rice-theorem", "undecidability"]
      },
      {
        id: "ta-a-8",
        type: "single",
        prompt: "If a language and its complement are both Turing-recognizable, then the language is:",
        options: ["Undecidable", "Decidable", "Context-free", "Regular"],
        correct: [1],
        explanation: "Recognizable + co-recognizable implies decidable by dovetailing recognizers.",
        tags: ["recognizable", "decidable"]
      }
    ]
  }
];

export function getQuizSetById(quizId: string) {
  return quizSets.find((quiz) => quiz.id === quizId);
}

export function getQuizSetsByCourse(courseId: string) {
  return quizSets.filter((quiz) => quiz.courseId === courseId);
}
