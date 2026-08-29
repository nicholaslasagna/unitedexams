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
    id: "computer-architecture",
    code: "CSE-240",
    name: "Computer Architecture",
    description:
      "Understand instruction sets, pipelines, memory hierarchies, and performance tradeoffs.",
    difficulty: "Intermediate",
    tags: ["Hardware", "Assembly", "Performance"],
    topics: ["isa", "pipeline", "cache", "hazards", "memory"],
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
    id: "computer-systems-architecture",
    code: "CS-5375",
    name: "Computer Systems Organization and Architecture",
    shortName: "Computer Systems Architecture",
    description:
      "Graduate-level architecture: pipelining and ILP, cache coherence, memory consistency, and parallel systems.",
    difficulty: "Advanced",
    tags: ["Pipelining", "Caches", "Parallelism"],
    topics: [
      "ilp",
      "branch-prediction",
      "cache-coherence",
      "memory-consistency",
      "multicore",
      "performance-models"
    ],
    accent: "from-rose-500 to-red-600",
    icon: "chip"
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
  },
  {
    id: "us-history-since-1877",
    code: "HIST-2301",
    name: "History of the United States Since 1877",
    shortName: "U.S. History Since 1877",
    description:
      "Reconstruction to the present — industrialization, reform, two world wars, civil rights, and the modern era.",
    difficulty: "Intermediate",
    tags: ["Reconstruction", "Reform", "Civil Rights"],
    topics: [
      "reconstruction",
      "gilded-age",
      "progressive-era",
      "world-wars",
      "new-deal",
      "cold-war",
      "civil-rights"
    ],
    accent: "from-stone-500 to-amber-700",
    icon: "archive"
  }
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId);
}
