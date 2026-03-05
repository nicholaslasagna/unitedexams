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
  }
];

export function getCourseById(courseId: string) {
  return courses.find((course) => course.id === courseId);
}
