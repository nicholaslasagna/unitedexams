/**
 * The Exam 1 topic model.
 *
 * Mastery is tracked per topic rather than as one "relational algebra"
 * number, because those numbers hide exactly the thing a learner needs to
 * see. Being fluent with σ and Π tells you nothing about whether semijoin
 * direction is understood, and an average across both reports a comfortable
 * 70% while the semijoin question on the exam is still a coin flip.
 *
 * Topic ids double as question tags, so they flow into `Attempt.topicBreakdown`
 * and through the app's existing mastery aggregation untouched.
 */

export type TopicId =
  | "relational-terminology"
  | "degree-cardinality"
  | "keys"
  | "integrity"
  | "selection"
  | "projection"
  | "cartesian-product"
  | "equijoin"
  | "natural-join"
  | "outer-join-left"
  | "outer-join-right"
  | "outer-join-full"
  | "semijoin"
  | "division"
  | "reading-expressions"
  | "writing-expressions"
  | "multi-table";

export interface Topic {
  id: TopicId;
  label: string;
  /** One line a learner reads on the concept map. */
  summary: string;
  /** Topics worth having under your belt first. Guides ordering, not a gate. */
  prerequisites: TopicId[];
  /** Which lecture or assignment this comes from. */
  source: string;
  /**
   * Relative exam weight, used to turn per-topic mastery into a single
   * readiness figure. Joins dominate because the professor said so: the
   * study guide asks students to work from two tables and produce results
   * with bow-tie and half-bow-tie operations.
   */
  weight: number;
}

export const TOPICS: Topic[] = [
  {
    id: "relational-terminology",
    label: "Relational model",
    summary:
      "Relation, tuple, attribute, domain. Atomic values, no duplicate tuples, and why order carries no meaning.",
    prerequisites: [],
    source: "Lecture 2",
    weight: 2
  },
  {
    id: "degree-cardinality",
    label: "Degree & cardinality",
    summary:
      "Degree counts attributes, cardinality counts tuples — and how each operator changes them.",
    prerequisites: ["relational-terminology"],
    source: "Lecture 2",
    weight: 3
  },
  {
    id: "keys",
    label: "Keys",
    summary:
      "Superkey, candidate key and the irreducibility that separates them. Primary, alternate and foreign keys.",
    prerequisites: ["relational-terminology"],
    source: "Lecture 2",
    weight: 3
  },
  {
    id: "integrity",
    label: "Integrity & NULL",
    summary:
      "Entity integrity, referential integrity, and what NULL is — absence of a value, not zero and not blank.",
    prerequisites: ["keys"],
    source: "Lecture 2",
    weight: 2
  },
  {
    id: "selection",
    label: "Selection σ",
    summary: "Keeps rows that satisfy a predicate. Slices horizontally; degree never changes.",
    prerequisites: ["relational-terminology"],
    source: "Lecture 3",
    weight: 2
  },
  {
    id: "projection",
    label: "Projection Π",
    summary:
      "Keeps chosen columns and eliminates duplicate tuples. Slices vertically; the duplicate removal is the half people forget.",
    prerequisites: ["relational-terminology"],
    source: "Lecture 3",
    weight: 2
  },
  {
    id: "cartesian-product",
    label: "Cartesian product X",
    summary:
      "Every tuple of R with every tuple of S. Degree adds, cardinality multiplies. The raw material a join filters.",
    prerequisites: ["degree-cardinality"],
    source: "Lecture 4",
    weight: 3
  },
  {
    id: "equijoin",
    label: "Equijoin ⋈",
    summary:
      "σ over a Cartesian product, written compactly. Equality conditions only, and both copies of the joining attribute survive.",
    prerequisites: ["cartesian-product", "selection"],
    source: "Lecture 4",
    weight: 4
  },
  {
    id: "natural-join",
    label: "Natural join ⋈",
    summary:
      "An equijoin over every common attribute with one copy of each collapsed. The collapsed column is the whole difference.",
    prerequisites: ["equijoin"],
    source: "Lecture 5",
    weight: 4
  },
  {
    id: "outer-join-left",
    label: "Left outer join ⟕",
    summary: "Every tuple of the left relation survives; unmatched ones are padded with NULL.",
    prerequisites: ["equijoin"],
    source: "Lecture 5",
    weight: 4
  },
  {
    id: "outer-join-right",
    label: "Right outer join ⟖",
    summary: "Every tuple of the right relation survives. The mirror image, and easy to invert under pressure.",
    prerequisites: ["outer-join-left"],
    source: "Lecture 5",
    weight: 3
  },
  {
    id: "outer-join-full",
    label: "Full outer join ⟗",
    summary:
      "Nothing is lost from either side — but still only matches are paired, so it is not a Cartesian product.",
    prerequisites: ["outer-join-left", "outer-join-right"],
    source: "Lecture 5",
    weight: 3
  },
  {
    id: "semijoin",
    label: "Semijoin ▷",
    summary:
      "Tuples of the LEFT relation that have a match. The right relation decides who qualifies, then disappears.",
    prerequisites: ["equijoin", "projection"],
    source: "Lecture 5",
    weight: 4
  },
  {
    id: "division",
    label: "Division ÷",
    summary:
      "The values paired with EVERY tuple of the divisor. Division means for all, never for some.",
    prerequisites: ["projection"],
    source: "Lecture 5",
    weight: 3
  },
  {
    id: "reading-expressions",
    label: "Reading algebra",
    summary:
      "Say what a written expression actually returns — which rows survive, which attributes come back.",
    prerequisites: ["equijoin", "semijoin"],
    source: "Homework #1, Question 2",
    weight: 4
  },
  {
    id: "writing-expressions",
    label: "Writing algebra",
    summary:
      "Turn English into algebra: decide the output, the filters, the tables and the attribute that connects them.",
    prerequisites: ["selection", "projection", "equijoin"],
    source: "Homework #1, Question 3",
    weight: 5
  },
  {
    id: "multi-table",
    label: "Multi-table queries",
    summary:
      "Three and four relations chained together, where the join path matters as much as the conditions.",
    prerequisites: ["writing-expressions"],
    source: "Homework #1, Question 4",
    weight: 4
  }
];

export const TOPIC_IDS = TOPICS.map((topic) => topic.id);

const TOPIC_BY_ID = new Map(TOPICS.map((topic) => [topic.id, topic] as const));

export function getTopic(id: TopicId): Topic | undefined {
  return TOPIC_BY_ID.get(id);
}

export function topicLabel(id: TopicId): string {
  return TOPIC_BY_ID.get(id)?.label ?? id;
}

/**
 * The recommended order through the material.
 *
 * A topological sort of the prerequisite graph, with the declaration order
 * breaking ties so the sequence still reads like the course does. Nothing is
 * *locked* — a learner who wants to jump straight to outer joins can — but
 * this is the order "Continue learning" walks.
 */
export function learningPath(): TopicId[] {
  const ordered: TopicId[] = [];
  const placed = new Set<TopicId>();

  const visit = (id: TopicId, stack: Set<TopicId>) => {
    if (placed.has(id) || stack.has(id)) return;
    stack.add(id);
    const topic = TOPIC_BY_ID.get(id);
    topic?.prerequisites.forEach((prerequisite) => visit(prerequisite, stack));
    stack.delete(id);
    placed.add(id);
    ordered.push(id);
  };

  TOPICS.forEach((topic) => visit(topic.id, new Set()));
  return ordered;
}

/** Topics that list `id` as a prerequisite — what unlocking this opens up. */
export function topicsUnlockedBy(id: TopicId): TopicId[] {
  return TOPICS.filter((topic) => topic.prerequisites.includes(id)).map((topic) => topic.id);
}

export const TOTAL_TOPIC_WEIGHT = TOPICS.reduce((sum, topic) => sum + topic.weight, 0);
