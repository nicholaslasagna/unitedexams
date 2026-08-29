import type { Course } from "@/lib/types";

export const courses: Course[] = [
  {
    id: "software-engineering",
    code: "SE-301",
    name: "Software Engineering",
    description:
      "Architect scalable systems, model requirements cleanly, and ship software with confidence.",
    difficulty: "Intermediate",
    tags: ["Design", "Testing", "Architecture"],
    topics: ["requirements", "uml", "solid", "testing", "agile", "quality"],
    accent: "from-cyan-500 to-blue-600",
    icon: "schematic"
  },
  {
    id: "differential-equations",
    code: "MATH-231",
    name: "Differential Equations",
    description:
      "Master first and second-order ODEs, Laplace transforms, and modeling techniques.",
    difficulty: "Advanced",
    tags: ["Math", "Modeling", "Laplace"],
    topics: ["separable", "linear-ode", "laplace", "systems", "stability"],
    accent: "from-indigo-500 to-sky-500",
    icon: "integral"
  },
  {
    /*
     * Keeps the original `computer-architecture` id after the undergraduate
     * CSE-240 material and the graduate CS-5375 course were merged into one
     * class. The id is referenced by eight existing quiz sets, the notes,
     * the artwork map and the branding table, and every saved attempt and
     * bookmarked URL points at it — so renaming it would strand all of that
     * to no benefit.
     */
    id: "computer-architecture",
    code: "CS-5375",
    name: "Computer Systems Organization and Architecture",
    shortName: "Computer Systems Architecture",
    description:
      "Instruction sets and pipelines through to instruction-level parallelism, cache coherence, memory consistency and multicore scaling.",
    difficulty: "Advanced",
    tags: ["Hardware", "Pipelining", "Parallelism"],
    topics: [
      "isa",
      "pipeline",
      "cache",
      "hazards",
      "memory",
      "ilp",
      "branch-prediction",
      "cache-coherence",
      "memory-consistency",
      "multicore"
    ],
    accent: "from-violet-500 to-fuchsia-500",
    icon: "chip"
  },
  {
    id: "theory-of-automata",
    code: "CS-330",
    name: "Theory of Automata",
    description:
      "Build rigor in formal languages, automata, grammars, and computability.",
    difficulty: "Advanced",
    tags: ["Proofs", "Regex", "Turing Machines"],
    topics: ["dfa", "nfa", "regex", "cfg", "tm", "decidability"],
    accent: "from-emerald-500 to-teal-500",
    icon: "automata"
  },

  // ── Fall 2026 additions ──────────────────────────────────────────
  {
    id: "analysis-of-algorithms",
    code: "CS-5381",
    name: "Analysis of Algorithms",
    description:
      "Prove what an algorithm costs — recurrences, greedy and dynamic programming, graphs, and NP-completeness.",
    difficulty: "Advanced",
    tags: ["Complexity", "Proofs", "Graphs"],
    topics: [
      "asymptotics",
      "recurrences",
      "divide-and-conquer",
      "greedy",
      "dynamic-programming",
      "graphs",
      "np-completeness"
    ],
    accent: "from-amber-500 to-orange-600",
    icon: "complexity"
  },
  {
    id: "database-systems",
    code: "CS-4354",
    name: "Concepts of Database Systems",
    description:
      "Model data properly, write SQL that means what you think, and understand what the engine does underneath.",
    difficulty: "Intermediate",
    tags: ["SQL", "Modeling", "Transactions"],
    topics: [
      "er-modeling",
      "relational-algebra",
      "sql",
      "normalization",
      "indexing",
      "transactions"
    ],
    accent: "from-sky-500 to-blue-600",
    icon: "database"
  },
  {
    id: "operating-systems",
    code: "CS-4352",
    name: "Operating Systems",
    description:
      "Processes and threads, scheduling, synchronization, deadlock, virtual memory, and file systems.",
    difficulty: "Intermediate",
    tags: ["Concurrency", "Scheduling", "Memory"],
    topics: [
      "processes",
      "threads",
      "scheduling",
      "synchronization",
      "deadlock",
      "virtual-memory",
      "file-systems"
    ],
    accent: "from-teal-500 to-emerald-600",
    icon: "kernel"
  }
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId);
}
