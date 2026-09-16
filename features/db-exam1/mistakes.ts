/**
 * What went wrong, not just that something did.
 *
 * "Incorrect" is useless feedback. A learner who returns S's tuples for
 * R ▷ S and a learner who forgot that three R tuples each match two S tuples
 * have made completely different errors, and the next question each of them
 * needs is different too.
 *
 * Every wrong answer is therefore classified into one of these tags. The tag
 * chooses the explanation shown, and the practice scheduler uses the running
 * tally to decide what to ask next — so repeatedly confusing a join condition
 * with a filter produces a run of questions that isolate exactly that.
 */

import type { TopicId } from "./topics";

export type MistakeTag =
  // Shape
  | "degree-cardinality-swapped"
  | "cartesian-arithmetic"
  | "forgot-duplicate-elimination"
  // Operator choice
  | "selection-for-projection"
  | "projection-for-selection"
  | "equijoin-vs-natural-join"
  // Conditions
  | "missing-condition"
  | "filter-vs-join-condition"
  | "wrong-join-attributes"
  // Structure
  | "missing-join"
  | "wrong-relation-for-attribute"
  // Join behaviour
  | "outer-join-side"
  | "outer-join-drops-unmatched"
  | "inner-join-pads-unmatched"
  | "outer-join-as-product"
  | "semijoin-wrong-relation"
  | "semijoin-direction"
  | "missed-multiple-matches"
  | "null-padding"
  // Division
  | "division-any-not-all"
  | "division-extra-pairings"
  | "division-result-schema"
  // Model
  | "superkey-minimality"
  | "primary-vs-candidate-key"
  | "entity-vs-referential-integrity"
  | "null-semantics"
  // Fallback
  | "unclassified";

export interface MistakeDefinition {
  tag: MistakeTag;
  /** Short label for the analytics list. */
  label: string;
  /** The misconception, stated as the learner is holding it. */
  belief: string;
  /** The correction. Concise and specific; this is the teaching moment. */
  correction: string;
  /** Topic to drill when this keeps happening. */
  drillTopic: TopicId;
}

export const MISTAKES: MistakeDefinition[] = [
  {
    tag: "degree-cardinality-swapped",
    label: "Degree and cardinality swapped",
    belief: "Degree counts rows and cardinality counts columns.",
    correction:
      "It is the other way round. Degree is the number of attributes — the columns. Cardinality is the number of tuples — the rows. Lecture 2 defines both on the same slide.",
    drillTopic: "degree-cardinality"
  },
  {
    tag: "cartesian-arithmetic",
    label: "Cartesian product arithmetic",
    belief: "The product's row and column counts combine the same way.",
    correction:
      "They combine differently. Cardinality multiplies (every tuple of R is paired with every tuple of S) and degree adds (the columns sit side by side). I tuples and N attributes with J tuples and M attributes gives I × J tuples and N + M attributes.",
    drillTopic: "cartesian-product"
  },
  {
    tag: "forgot-duplicate-elimination",
    label: "Projection duplicates",
    belief: "Projection just drops columns and leaves the rows alone.",
    correction:
      "Projection also eliminates duplicate tuples. The result is a relation, and a relation is a set — so once the distinguishing columns are gone, identical rows collapse into one.",
    drillTopic: "projection"
  },
  {
    tag: "selection-for-projection",
    label: "σ used where Π was needed",
    belief: "σ can pick out the columns you want.",
    correction:
      "σ only ever chooses rows; it cannot change which attributes come back. To choose columns you need Π. Selection slices horizontally, projection slices vertically.",
    drillTopic: "projection"
  },
  {
    tag: "projection-for-selection",
    label: "Π used where σ was needed",
    belief: "Π can filter to the rows you want.",
    correction:
      "Π only ever chooses columns. Naming an attribute in Π does not restrict its values — you need σ with a condition for that.",
    drillTopic: "selection"
  },
  {
    tag: "equijoin-vs-natural-join",
    label: "Equijoin vs natural join",
    belief: "An equijoin and a natural join produce the same relation.",
    correction:
      "They hold the same tuples but not the same attributes. An equijoin keeps both copies of the joining attribute; a natural join eliminates one occurrence of each common attribute. That is one column of difference, and it changes the degree.",
    drillTopic: "natural-join"
  },
  {
    tag: "missing-condition",
    label: "Dropped a condition",
    belief: "One of the conditions in the question was optional.",
    correction:
      "Every restriction in the English has to appear in the algebra. Read the sentence again and list each condition before you write anything — two conditions joined by 'and' become ∧ inside one σ.",
    drillTopic: "writing-expressions"
  },
  {
    tag: "filter-vs-join-condition",
    label: "Filter confused with join condition",
    belief: "A condition is a condition — it does not matter where it goes.",
    correction:
      "A join condition compares an attribute in one relation with an attribute in another (Staff.branchNo = Branch.branchNo) and decides which tuples pair up. A filter compares an attribute with a constant (salary > 10000) and decides which tuples survive. Putting a filter where the join condition belongs pairs everything with everything.",
    drillTopic: "equijoin"
  },
  {
    tag: "wrong-join-attributes",
    label: "Joined on the wrong attributes",
    belief: "Tuples that look related belong together.",
    correction:
      "Match on the values of the joining attribute, not on how the identifiers look. R101 and S201 are the first row of each table and share nothing — compare their j values instead.",
    drillTopic: "equijoin"
  },
  {
    tag: "missing-join",
    label: "Needed a join and did not use one",
    belief: "All the attributes were available in one relation.",
    correction:
      "They were not. When the output attribute and the filtered attribute live in different relations, those relations have to be joined on the attribute they share before either can be used.",
    drillTopic: "multi-table"
  },
  {
    tag: "wrong-relation-for-attribute",
    label: "Attribute taken from the wrong relation",
    belief: "This relation holds the attribute I need.",
    correction:
      "Check the schema before reaching for an attribute. city belongs to Branch, not Staff; position belongs to Staff, not Branch. Splitting them across two relations is exactly why the question needs a join.",
    drillTopic: "multi-table"
  },
  {
    tag: "outer-join-side",
    label: "Outer join preserved the wrong side",
    belief: "Left and right outer joins keep the same tuples.",
    correction:
      "The side named is the side preserved. A left outer join keeps every tuple of the LEFT relation and pads the right with NULL; a right outer join does the opposite. Swapping them changes which unmatched tuples appear.",
    drillTopic: "outer-join-left"
  },
  {
    tag: "outer-join-drops-unmatched",
    label: "Unmatched tuples dropped",
    belief: "Unmatched rows disappear in an outer join, as they do in an inner join.",
    correction:
      "Preserving unmatched tuples is the entire point of an outer join. The unmatched tuple stays and the attributes from the other relation are padded with NULL.",
    drillTopic: "outer-join-left"
  },
  {
    tag: "inner-join-pads-unmatched",
    label: "Inner join treated as an outer join",
    belief: "An unmatched tuple still appears, padded with NULL.",
    correction:
      "Only an outer join does that. A plain join — equijoin, theta or natural — returns nothing at all for a tuple with no match. If you want the unmatched tuple kept, the question has to ask for an outer join.",
    drillTopic: "equijoin"
  },
  {
    tag: "outer-join-as-product",
    label: "Outer join treated as a Cartesian product",
    belief: "A full outer join pairs everything with everything.",
    correction:
      "It does not. A full outer join still only pairs tuples that satisfy the condition; it simply also keeps the unmatched tuples from both sides, padded with NULL. A Cartesian product pairs every tuple with every tuple and applies no condition at all.",
    drillTopic: "outer-join-full"
  },
  {
    tag: "semijoin-wrong-relation",
    label: "Semijoin returned the wrong relation's attributes",
    belief: "A semijoin returns columns from both relations.",
    correction:
      "R ▷ S returns only R's attributes. S decides which tuples of R qualify and then disappears — that is why Lecture 5 defines it as Π over R's attributes of the join.",
    drillTopic: "semijoin"
  },
  {
    tag: "semijoin-direction",
    label: "Semijoin direction inverted",
    belief: "R ▷ S and S ▷ R give the same answer.",
    correction:
      "The semijoin is directional. R ▷ S keeps tuples of R; S ▷ R keeps tuples of S. They have different schemas and generally different cardinalities.",
    drillTopic: "semijoin"
  },
  {
    tag: "missed-multiple-matches",
    label: "Missed repeated matches",
    belief: "Each tuple matches at most one tuple on the other side.",
    correction:
      "A tuple produces one output row for every tuple it matches. If two S tuples share a j value, an R tuple with that j appears twice in the result. Count the matches on each side before you count the rows.",
    drillTopic: "equijoin"
  },
  {
    tag: "null-padding",
    label: "NULL padding",
    belief: "Padded attributes get a blank or a zero.",
    correction:
      "They get NULL, which is the absence of a value — not zero, not an empty string. Lecture 2 calls this out specifically, and a comparison against NULL is never true.",
    drillTopic: "integrity"
  },
  {
    tag: "division-any-not-all",
    label: "Division treated as ANY",
    belief: "A value qualifies if it is paired with something in the divisor.",
    correction:
      "Division means for all. A value only qualifies if it is paired with EVERY tuple of the divisor. Being paired with one of them, or most of them, is not enough.",
    drillTopic: "division"
  },
  {
    tag: "division-extra-pairings",
    label: "Extra pairings treated as disqualifying",
    belief: "A value paired with something outside the divisor cannot qualify.",
    correction:
      "Extra pairings are ignored. The test is whether every divisor tuple is covered; anything beyond that is irrelevant and never disqualifies a value.",
    drillTopic: "division"
  },
  {
    tag: "division-result-schema",
    label: "Division result schema",
    belief: "The result keeps the divisor's attributes.",
    correction:
      "It keeps the attributes the divisor does not have. If R is over A and S is over B, the result is over C = A − B — the columns left once the divisor's are removed.",
    drillTopic: "division"
  },
  {
    tag: "superkey-minimality",
    label: "Superkey minimality",
    belief: "Any set of attributes that identifies a tuple is a candidate key.",
    correction:
      "Only if no proper subset also identifies it. If A alone is unique, {A, B} is still a superkey but is not a candidate key, because B is unnecessary. Uniqueness plus irreducibility.",
    drillTopic: "keys"
  },
  {
    tag: "primary-vs-candidate-key",
    label: "Primary vs candidate key",
    belief: "A relation has one candidate key and it is the primary key.",
    correction:
      "A relation can have several candidate keys. The one chosen to identify tuples is the primary key; the rest are alternate keys, and they are still keys.",
    drillTopic: "keys"
  },
  {
    tag: "entity-vs-referential-integrity",
    label: "Entity vs referential integrity",
    belief: "The two integrity rules are interchangeable.",
    correction:
      "Entity integrity is about primary keys: no attribute of a primary key may be null. Referential integrity is about foreign keys: a foreign-key value must match a candidate-key value in the referenced relation, or be wholly null.",
    drillTopic: "integrity"
  },
  {
    tag: "null-semantics",
    label: "NULL semantics",
    belief: "NULL behaves like zero or an empty string.",
    correction:
      "NULL is the absence of a value. It is not zero, not a space, and not equal to anything — including another NULL. Any comparison involving it is unknown, and unknown is not true.",
    drillTopic: "integrity"
  },
  {
    tag: "unclassified",
    label: "Something else",
    belief: "",
    correction:
      "Work back through the expression from the inside out and check each step against what the question asks for.",
    drillTopic: "writing-expressions"
  }
];

const BY_TAG = new Map(MISTAKES.map((mistake) => [mistake.tag, mistake] as const));

export function getMistake(tag: MistakeTag): MistakeDefinition {
  return BY_TAG.get(tag) ?? BY_TAG.get("unclassified")!;
}

export function mistakeLabel(tag: MistakeTag): string {
  return getMistake(tag).label;
}

/**
 * Turn a tally of mistakes into the ones worth acting on.
 *
 * A single slip is noise; a pattern is a misconception. Tags seen at least
 * twice are surfaced first, and a tag seen once only makes the list when
 * nothing has repeated yet — otherwise the panel fills with one-offs and the
 * real pattern is buried.
 */
export function rankMistakes(
  counts: Partial<Record<MistakeTag, number>>,
  limit = 4
): { tag: MistakeTag; count: number; definition: MistakeDefinition }[] {
  const entries = Object.entries(counts)
    .filter(([tag, count]) => tag !== "unclassified" && (count ?? 0) > 0)
    .map(([tag, count]) => ({
      tag: tag as MistakeTag,
      count: count ?? 0,
      definition: getMistake(tag as MistakeTag)
    }))
    .sort((a, b) => b.count - a.count);

  const repeated = entries.filter((entry) => entry.count >= 2);
  return (repeated.length > 0 ? repeated : entries).slice(0, limit);
}
