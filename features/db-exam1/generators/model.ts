/**
 * Terminology, selection and projection generators.
 *
 * These topics used to reuse key/write-expression generators, which meant a
 * learner drilling "σ" was actually being asked to write a join. The Exam 1
 * mix-ups the dashboard is supposed to catch — degree vs cardinality, σ vs Π,
 * projection duplicate elimination — only show up if the questions isolate
 * them.
 */

import {
  branchRelation,
  roomRelation,
  staffRelation
} from "@/data/seed/db-exam1/relations";
import { attr, compare, lit, type Condition } from "@/lib/relational-algebra/condition";
import { project, select } from "@/lib/relational-algebra/operations";
import type { Relation } from "@/lib/relational-algebra/relation";
import type { MistakeTag } from "../mistakes";
import type { Choice, LabQuestion, RowCandidate } from "../question-model";
import { makeRng, shuffle } from "./random";

type Difficulty = "intro" | "core" | "stretch";

// ── Relational terminology ────────────────────────────────────────────────

interface TerminologyItem {
  prompt: string;
  options: Choice[];
  explanation: string;
  hints: string[];
}

function terminologyBank(): TerminologyItem[] {
  return [
    {
      prompt: "Which pairing of relational-model terms is correct?",
      options: [
        { text: "Relation = table, tuple = row, attribute = column, domain = allowable values", correct: true },
        {
          text: "Relation = row, tuple = table, attribute = allowable values, domain = column",
          correct: false,
          note: "A relation is the table (the set). A tuple is one record in it. An attribute is a named column. A domain is the set of values that column may take."
        },
        {
          text: "Degree = number of tuples; cardinality = number of attributes",
          correct: false,
          mistake: "degree-cardinality-swapped",
          note: "The other way round. Degree counts attributes (columns). Cardinality counts tuples (rows). Lecture 2 defines both on the same slide."
        },
        {
          text: "A domain is the primary key of a relation",
          correct: false,
          note: "A domain is the set of allowable values for an attribute — integer, 'London'|'Glasgow'|… — not a key."
        }
      ],
      explanation:
        "Lecture 2's alternative terminology: relation/table, tuple/row/record, attribute/column, and domain as the set of allowable values. Degree counts attributes; cardinality counts tuples.",
      hints: ["Match each formal word with how the table looks on the page."]
    },
    {
      prompt: "Which statement is a property of a relation in the relational model?",
      options: [
        {
          text: "Each cell contains exactly one atomic value, and there are no duplicate tuples.",
          correct: true
        },
        {
          text: "The order of tuples is significant, because it is how they are stored.",
          correct: false,
          note: "Lecture 2: the order of tuples has no significance, theoretically. Storage order is a physical matter, not part of the model."
        },
        {
          text: "The order of attributes is significant, so the leftmost column is the key.",
          correct: false,
          note: "Attribute order has no significance either. Which attribute is the key is a constraint, not a position."
        },
        {
          text: "A cell may hold several values from the same domain.",
          correct: false,
          note: "Each cell holds exactly one atomic value. That is the first property on the Lecture 2 slide."
        }
      ],
      explanation:
        "From Lecture 2: distinct relation name, atomic cells, distinct attribute names, values of an attribute from one domain, no duplicate tuples, and neither attribute order nor tuple order carries meaning.",
      hints: ["Four of these come straight from the 'Properties of Relations' slide."]
    },
    {
      prompt: "What is a domain?",
      options: [
        { text: "The set of allowable values for an attribute.", correct: true },
        {
          text: "The set of all tuples currently stored in a relation.",
          correct: false,
          note: "That is the relation instance, not the domain. The domain exists whether or not any tuple currently uses a particular value."
        },
        {
          text: "The primary key of the relation.",
          correct: false,
          note: "A domain is a pool of legal values, not a key."
        },
        {
          text: "The number of attributes in the relation.",
          correct: false,
          mistake: "degree-cardinality-swapped",
          note: "That is the degree."
        }
      ],
      explanation:
        "Lecture 2: a domain is the set of allowable values for an attribute. Every value of that attribute in the relation must come from that same domain.",
      hints: ["Think 'what values is this column allowed to hold?'"]
    },
    {
      prompt:
        "A relation is defined as a subset of a Cartesian product of domains. If D1 = {2, 4} and D2 = {1, 3, 5}, which of the following is a relation over D1 × D2?",
      options: [
        { text: "R = {(2, 1), (4, 1)}", correct: true },
        {
          text: "R = {(1, 2), (3, 4)} — first from D2, second from D1 is equally valid",
          correct: false,
          note: "An ordered pair in D1 × D2 has its first component from D1 and its second from D2. (1, 2) is not in D1 × D2."
        },
        {
          text: "R = {(2, 1), (2, 1)} — the pair may appear twice",
          correct: false,
          note: "A relation is a set, so duplicate tuples are not allowed. {(2, 1), (2, 1)} is just {(2, 1)}."
        },
        {
          text: "R = D1 × D2 is the only relation, because a relation must contain every pair",
          correct: false,
          note: "Lecture 2: any subset of the Cartesian product is a relation, including proper subsets and the empty set."
        }
      ],
      explanation:
        "Lecture 2's mathematical definition: D1 × D2 is every ordered pair with first from D1 and second from D2, and any subset of that product is a relation. {(2, 1), (4, 1)} is the worked example on the slide.",
      hints: ["The Cartesian product lists every ordered pair. A relation picks some of them."]
    },
    {
      prompt: "What does 'atomic' mean for a value in a relation?",
      options: [
        { text: "The cell holds exactly one value, not a list or a nested table.", correct: true },
        {
          text: "The value cannot be NULL.",
          correct: false,
          mistake: "null-semantics",
          note: "Atomicity is about not being composite. NULL is the absence of a value, which is a different issue (entity integrity, for a primary key)."
        },
        {
          text: "The value is a primary key.",
          correct: false,
          note: "Any attribute's values are atomic, keys or not."
        },
        {
          text: "The value is an integer rather than text.",
          correct: false,
          note: "Text, dates and numbers are all atomic. A list of numbers in one cell is not."
        }
      ],
      explanation:
        "Lecture 2: each cell contains exactly one atomic (single) value. A repeating group or a nested table in a cell would violate that, which is why first normal form is the default of the model.",
      hints: ["Atomic means 'not composite' — one value per cell."]
    }
  ];
}

export function generateTerminologyQuestion(
  seed: number,
  difficulty: Difficulty = "intro"
): LabQuestion {
  const rng = makeRng(seed ^ 0x51c00);
  const bank = terminologyBank();
  const item = bank[seed % bank.length];
  return {
    id: `gen-term-${seed}`,
    topic: "relational-terminology",
    source: "generated",
    sourceNote: "Generated variant of Lecture 2 terminology",
    difficulty,
    kind: "choice",
    prompt: item.prompt,
    options: shuffle(rng, item.options),
    explanation: item.explanation,
    hints: item.hints
  };
}

/**
 * Lecture 2's Cartesian-product-of-domains arithmetic, generated with
 * different small sets so the 2×3=6 example cannot be memorised.
 */
export function generateCartesianDomainQuestion(
  seed: number,
  difficulty: Difficulty = "intro"
): LabQuestion {
  const sizeA = 2 + (seed % 3);
  const sizeB = 2 + ((seed >> 2) % 3);
  const a = Array.from({ length: sizeA }, (_, i) => 2 * i + 2);
  const b = Array.from({ length: sizeB }, (_, i) => 2 * i + 1);
  const degree = 2;
  const cardinality = sizeA * sizeB;

  return {
    id: `gen-domain-product-${seed}`,
    topic: "degree-cardinality",
    source: "generated",
    sourceNote: "Generated variant of Lecture 2's Cartesian-product-of-domains example",
    difficulty,
    kind: "shape",
    subject: `D1 × D2`,
    prompt: `D1 = {${a.join(", ")}} and D2 = {${b.join(", ")}}. What are the degree and cardinality of D1 × D2?`,
    context: {
      note:
        "D1 × D2 is the set of all ordered pairs with the first component from D1 and the second from D2. Any subset of that product is a relation."
    },
    degree,
    cardinality,
    explanation:
      `Lecture 2: the Cartesian product is every ordered pair. There are ${sizeA} × ${sizeB} = ${cardinality} pairs, and each pair has 2 components, so the degree is 2. Cardinality multiplies; degree is the number of attributes in each tuple.`,
    hints: [
      "Degree is how many values each pair holds. Cardinality is how many pairs there are.",
      "Every element of D1 is paired with every element of D2 — multiply the sizes."
    ]
  };
}

// ── Selection ─────────────────────────────────────────────────────────────

interface SelectSpec {
  relation: Relation;
  condition: Condition;
  label: string;
  predicateEnglish: string;
}

function selectSpecs(): SelectSpec[] {
  return [
    {
      relation: staffRelation,
      condition: compare(attr("salary"), ">", lit(10000)),
      label: "σ salary > 10000 (Staff)",
      predicateEnglish: "salary greater than 10,000"
    },
    {
      relation: staffRelation,
      condition: compare(attr("position"), "=", lit("Assistant")),
      label: "σ position = 'Assistant' (Staff)",
      predicateEnglish: "position is Assistant"
    },
    {
      relation: staffRelation,
      condition: compare(attr("sex"), "=", lit("F")),
      label: "σ sex = 'F' (Staff)",
      predicateEnglish: "sex is F"
    },
    {
      relation: staffRelation,
      condition: compare(attr("position"), "=", lit("Manager")),
      label: "σ position = 'Manager' (Staff)",
      predicateEnglish: "position is Manager"
    },
    {
      relation: roomRelation,
      condition: compare(attr("price"), ">", lit(100)),
      label: "σ price > 100 (Room)",
      predicateEnglish: "price greater than 100"
    },
    {
      relation: roomRelation,
      condition: compare(attr("type"), "=", lit("Suite")),
      label: "σ type = 'Suite' (Room)",
      predicateEnglish: "type is Suite"
    },
    {
      relation: branchRelation,
      condition: compare(attr("city"), "=", lit("London")),
      label: "σ city = 'London' (Branch)",
      predicateEnglish: "city is London"
    }
  ];
}

export function generateSelectQuestion(
  seed: number,
  difficulty: Difficulty = "core"
): LabQuestion {
  const specs = selectSpecs();
  const spec = specs[seed % specs.length];
  const { relation: result, trace } = select(spec.relation, spec.condition);

  if (seed % 2 === 0) {
    const candidates: RowCandidate[] = spec.relation.tuples.map((values, index) => {
      const kept = trace.kept.includes(index);
      return {
        values,
        inResult: kept,
        mistake: kept ? undefined : "projection-for-selection",
        note: kept
          ? undefined
          : `This tuple does not satisfy ${spec.predicateEnglish}, so σ drops it. Selection never changes which attributes come back — it only chooses rows.`
      };
    });

    return {
      id: `gen-select-rows-${seed}`,
      topic: "selection",
      source: "generated",
      sourceNote: "Generated variant of Lecture 3's selection example",
      difficulty,
      kind: "rows",
      prompt: `Select every tuple that remains in ${spec.label}.`,
      context: {
        relations: [spec.relation],
        note: "Leave every row unchecked if none qualify. Selection slices horizontally — the columns do not change."
      },
      attributes: spec.relation.attributes,
      candidates,
      explanation:
        `${spec.label} keeps the ${result.tuples.length} tuple${
          result.tuples.length === 1 ? "" : "s"
        } whose ${spec.predicateEnglish}. Degree stays ${spec.relation.attributes.length} because σ never drops a column. Cardinality falls from ${spec.relation.tuples.length} to ${result.tuples.length}.`,
      hints: [
        "Walk the table row by row and test the predicate. A tuple is in or it is out.",
        "The result has the same attributes as the input. If you dropped a column, you used Π."
      ]
    };
  }

  return {
    id: `gen-select-shape-${seed}`,
    topic: "selection",
    source: "generated",
    sourceNote: "Generated variant of Lecture 3's selection example",
    difficulty,
    kind: "shape",
    subject: spec.label,
    prompt: `What are the degree and cardinality of ${spec.label}?`,
    context: { relations: [spec.relation] },
    degree: result.attributes.length,
    cardinality: result.tuples.length,
    explanation:
      `Selection slices horizontally. Degree is unchanged at ${result.attributes.length}. Cardinality is the number of tuples that satisfy ${spec.predicateEnglish}: ${result.tuples.length} of ${spec.relation.tuples.length}.`,
    hints: [
      "Degree counts columns and σ does not touch columns.",
      "Count the rows that pass the predicate — that is the new cardinality."
    ]
  };
}

// ── Projection ────────────────────────────────────────────────────────────

interface ProjectSpec {
  relation: Relation;
  attributes: string[];
  label: string;
}

function projectSpecs(): ProjectSpec[] {
  return [
    { relation: branchRelation, attributes: ["city"], label: "Π city (Branch)" },
    { relation: staffRelation, attributes: ["position"], label: "Π position (Staff)" },
    { relation: staffRelation, attributes: ["sex"], label: "Π sex (Staff)" },
    { relation: roomRelation, attributes: ["type"], label: "Π type (Room)" },
    { relation: staffRelation, attributes: ["branchNo"], label: "Π branchNo (Staff)" },
    {
      relation: staffRelation,
      attributes: ["staffNo", "fName", "lName", "salary"],
      label: "Π staffNo, fName, lName, salary (Staff)"
    }
  ];
}

export function generateProjectQuestion(
  seed: number,
  difficulty: Difficulty = "core"
): LabQuestion {
  const rng = makeRng(seed ^ 0x0dd);
  const spec = projectSpecs()[seed % projectSpecs().length];
  const { relation: result, trace } = project(spec.relation, spec.attributes);
  const inputCard = spec.relation.tuples.length;
  const outputCard = result.tuples.length;
  const collapsed = trace.duplicatesRemoved.length;

  const options: Choice[] = shuffle(rng, [
    {
      text: `${outputCard} — duplicate tuples are eliminated after the extra columns are dropped`,
      correct: true
    },
    {
      text: `${inputCard} — projection only drops columns, so the row count is unchanged`,
      correct: false,
      mistake: "forgot-duplicate-elimination" as MistakeTag,
      note:
        collapsed > 0
          ? `Π also eliminates duplicates. ${collapsed} input row${
              collapsed === 1 ? "" : "s"
            } collapsed into a row that was already there, so the cardinality is ${outputCard}, not ${inputCard}.`
          : `Projection does eliminate duplicates; they just happen not to arise on this attribute list. The cardinality is still counted after the set semantics, which here is ${outputCard}.`
    },
    {
      text: `${spec.relation.attributes.length} — that is how many attributes the input had`,
      correct: false,
      mistake: "degree-cardinality-swapped" as MistakeTag,
      note: `That number is the input's degree, not a cardinality. After Π the degree is ${result.attributes.length} and the cardinality is ${outputCard}.`
    },
    {
      text: `${result.attributes.length} — one row per remaining attribute`,
      correct: false,
      mistake: "degree-cardinality-swapped" as MistakeTag,
      note: `Degree is ${result.attributes.length}. Cardinality is how many tuples survive, which is ${outputCard}.`
    }
  ]);

  return {
    id: `gen-project-${seed}`,
    topic: "projection",
    source: "generated",
    sourceNote: "Generated variant of Lecture 3's projection example",
    difficulty,
    kind: "choice",
    prompt: `What is the cardinality of ${spec.label}?`,
    context: {
      relations: [spec.relation],
      note: "A relation is a set: after columns are dropped, identical rows collapse into one."
    },
    options,
    explanation:
      `${spec.label} keeps ${spec.attributes.join(", ")}. The input has ${inputCard} tuples;` +
      (collapsed > 0
        ? ` ${collapsed} of them become duplicates once the other columns are gone, so they disappear and the result has ${outputCard} tuples.`
        : ` those columns still distinguish every row, so the cardinality stays ${outputCard}.`) +
      ` Degree falls from ${spec.relation.attributes.length} to ${result.attributes.length}.`,
    hints: [
      "Write down the remaining columns for each input row.",
      "Then strike out any row that is now identical to one above it. What is left is the cardinality."
    ]
  };
}
