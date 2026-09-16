/**
 * Key and integrity questions.
 *
 * Whether a set of attributes is a superkey or a candidate key is *computed
 * from the tuples shown*, never asserted. That matters because the whole
 * lesson is that you read keys off the data and the constraints, and a
 * question whose stated answer disagreed with its own table would teach the
 * opposite.
 *
 * Two confusions get first-class treatment, because Lecture 2 defines
 * candidate keys precisely to separate them:
 *
 *   - A alone is unique, so {A, B} is a superkey but NOT a candidate key —
 *     B is unnecessary, and a candidate key has to be irreducible.
 *   - Neither A nor B is unique alone, but {A, B} together is — a composite
 *     candidate key.
 */

import { tupleKey, type Relation, type Tuple } from "@/lib/relational-algebra/relation";
import type { MistakeTag } from "../mistakes";
import type { Choice, LabQuestion } from "../question-model";
import { makeRng, shuffle } from "./random";

/** True when the attribute set identifies every tuple uniquely. */
export function isSuperkey(relation: Relation, attributes: string[]): boolean {
  const indexes = attributes.map((name) =>
    relation.attributes.findIndex((a) => a.toLowerCase() === name.toLowerCase())
  );
  if (indexes.some((index) => index < 0)) return false;

  const seen = new Set<string>();
  for (const tuple of relation.tuples) {
    const key = tupleKey(indexes.map((index) => tuple[index]));
    if (seen.has(key)) return false;
    seen.add(key);
  }
  return true;
}

/** Every proper subset, largest first. */
function properSubsets(attributes: string[]): string[][] {
  const out: string[][] = [];
  const total = 1 << attributes.length;
  for (let mask = 1; mask < total - 1; mask += 1) {
    out.push(attributes.filter((_, index) => (mask & (1 << index)) !== 0));
  }
  return out;
}

/**
 * Uniqueness *and* irreducibility — the two properties Lecture 2 lists.
 * A superkey with a redundant attribute fails the second.
 */
export function isCandidateKey(relation: Relation, attributes: string[]): boolean {
  if (!isSuperkey(relation, attributes)) return false;
  return !properSubsets(attributes).some((subset) => isSuperkey(relation, subset));
}

export type KeyPattern = "single-unique" | "composite-only" | "two-candidates";

interface GeneratedKeyRelation {
  relation: Relation;
  pattern: KeyPattern;
  /** Attribute sets to ask about. */
  subsets: string[][];
}

const SURNAMES = ["Beech", "Ford", "Howe", "Brand", "Lee", "White", "Ruiz", "Petrie"];
const TERMS = ["Fall26", "Spr27", "Sum27"];
const COURSES = ["CS4354", "CS4352", "CS5381", "MATH231"];

/**
 * Build a relation whose key structure matches the requested pattern.
 *
 * The tuples are constructed to make the pattern true, then the pattern is
 * re-derived from the tuples by the caller — so a generator bug shows up as a
 * failing test rather than as a wrong answer in front of a learner.
 */
function buildKeyRelation(seed: number, pattern: KeyPattern): GeneratedKeyRelation {
  const rng = makeRng(seed);

  if (pattern === "composite-only") {
    // Enrolment: a student takes several courses, a course has several
    // students, so neither attribute alone identifies a row.
    const students = ["S100", "S101", "S102"];
    const courses = shuffle(rng, COURSES).slice(0, 3);
    const tuples: Tuple[] = [
      [students[0], courses[0], TERMS[0], "A"],
      [students[0], courses[1], TERMS[0], "B"],
      [students[1], courses[0], TERMS[0], "A"],
      [students[1], courses[2], TERMS[1], "C"],
      [students[2], courses[1], TERMS[1], "B"]
    ];
    return {
      relation: {
        name: "Enrolment",
        attributes: ["studentNo", "courseCode", "term", "grade"],
        tuples
      },
      pattern,
      subsets: [
        ["studentNo"],
        ["courseCode"],
        ["studentNo", "courseCode"],
        ["studentNo", "courseCode", "term"],
        ["grade"]
      ]
    };
  }

  if (pattern === "two-candidates") {
    // Both staffNo and email identify a member of staff on their own.
    const names = shuffle(rng, SURNAMES).slice(0, 4);
    const tuples: Tuple[] = names.map((name, index) => [
      `SG${10 + index}`,
      `${name.toLowerCase()}@dept.example`,
      index % 2 === 0 ? "B003" : "B005",
      index % 2 === 0 ? "Assistant" : "Manager"
    ]);
    return {
      relation: {
        name: "Staff",
        attributes: ["staffNo", "email", "branchNo", "position"],
        tuples
      },
      pattern,
      subsets: [
        ["staffNo"],
        ["email"],
        ["staffNo", "email"],
        ["branchNo"],
        ["branchNo", "position"]
      ]
    };
  }

  // single-unique: roomNo is unique on its own; nothing else is.
  const tuples: Tuple[] = [
    ["RM01", "H01", "Single", 45],
    ["RM02", "H01", "Suite", 175],
    ["RM03", "H02", "Single", 45],
    ["RM04", "H02", "Double", 80]
  ];
  return {
    relation: { name: "RoomStock", attributes: ["roomNo", "hotelNo", "type", "price"], tuples },
    pattern,
    subsets: [
      ["roomNo"],
      ["hotelNo"],
      ["roomNo", "hotelNo"],
      ["hotelNo", "type"],
      ["type", "price"]
    ]
  };
}

function formatSet(attributes: string[]): string {
  return `{${attributes.join(", ")}}`;
}

/**
 * "Which of these are superkeys?" and "which are candidate keys?" asked over
 * the same table, because the gap between the two answers is the lesson.
 */
export function generateKeyQuestion(
  seed: number,
  ask: "superkey" | "candidate",
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const patterns: KeyPattern[] = ["single-unique", "composite-only", "two-candidates"];
  const pattern = patterns[seed % patterns.length];
  const built = buildKeyRelation(seed, pattern);
  const { relation, subsets } = built;

  const options: Choice[] = subsets.map((subset) => {
    const superkey = isSuperkey(relation, subset);
    const candidate = isCandidateKey(relation, subset);
    const correct = ask === "superkey" ? superkey : candidate;

    let note: string | undefined;
    let mistake: MistakeTag | undefined;

    if (ask === "candidate" && superkey && !candidate) {
      const redundant = subsets
        .filter((other) => other.length < subset.length)
        .find(
          (other) =>
            other.every((name) => subset.includes(name)) && isSuperkey(relation, other)
        );
      mistake = "superkey-minimality";
      note = redundant
        ? `${formatSet(subset)} does identify every tuple, so it is a superkey — but ` +
          `${formatSet(redundant)} already does that on its own. A candidate key has to be ` +
          `irreducible, so the extra attribute disqualifies it.`
        : `${formatSet(subset)} is a superkey but not irreducible.`;
    } else if (ask === "superkey" && !superkey) {
      const duplicate = findDuplicate(relation, subset);
      note = duplicate
        ? `${formatSet(subset)} is not a superkey: two tuples share the value ${duplicate}, so it ` +
          `does not identify a tuple uniquely.`
        : `${formatSet(subset)} does not identify tuples uniquely.`;
    } else if (ask === "candidate" && !superkey) {
      mistake = "superkey-minimality";
      note = `${formatSet(subset)} is not unique in this table, so it cannot be a candidate key at all.`;
    }

    return { text: formatSet(subset), correct, mistake, note };
  });

  const candidateKeys = subsets.filter((subset) => isCandidateKey(relation, subset));

  const explanation =
    ask === "superkey"
      ? `A superkey is any attribute set that identifies a tuple uniquely — redundant ` +
        `attributes are allowed. ${options
          .filter((option) => option.correct)
          .map((option) => option.text)
          .join(", ")} qualify here.`
      : `A candidate key is a superkey with no proper subset that is also a superkey: ` +
        `uniqueness plus irreducibility. ${
          candidateKeys.length > 0
            ? `${candidateKeys.map(formatSet).join(" and ")} ${
                candidateKeys.length === 1 ? "is the only one" : "are the candidate keys"
              }.`
            : ""
        }${
          pattern === "composite-only"
            ? " Neither attribute is unique on its own, so the key has to be composite."
            : pattern === "two-candidates"
              ? " A relation can have more than one candidate key; the one chosen to identify tuples is the primary key and the rest are alternate keys."
              : ""
        }`;

  return {
    id: `gen-key-${ask}-${seed}`,
    topic: "keys",
    source: "generated",
    difficulty,
    kind: "choice",
    multiple: true,
    prompt:
      ask === "superkey"
        ? `Using only the tuples shown, which of these attribute sets are superkeys of ${relation.name}?`
        : `Using only the tuples shown, which of these attribute sets are candidate keys of ${relation.name}?`,
    context: {
      relations: [relation],
      note: "Assume the tuples shown are the whole relation. Select every set that qualifies."
    },
    options,
    explanation,
    hints: [
      "Check uniqueness first: could two tuples ever share the same values for that set?",
      ask === "candidate"
        ? "Then check irreducibility: if a smaller subset is already unique, the larger set is a superkey but not a candidate key."
        : "A superkey only has to be unique. It is allowed to carry attributes it does not need."
    ]
  };
}

function findDuplicate(relation: Relation, attributes: string[]): string | null {
  const indexes = attributes.map((name) =>
    relation.attributes.findIndex((a) => a.toLowerCase() === name.toLowerCase())
  );
  if (indexes.some((index) => index < 0)) return null;

  const seen = new Map<string, Tuple>();
  for (const tuple of relation.tuples) {
    const values = indexes.map((index) => tuple[index]);
    const key = tupleKey(values);
    if (seen.has(key)) return values.map((value) => String(value)).join(", ");
    seen.set(key, tuple);
  }
  return null;
}

// ── Integrity ─────────────────────────────────────────────────────────────

interface IntegrityScenario {
  prompt: string;
  options: Choice[];
  explanation: string;
}

/**
 * Entity vs referential integrity, asked about a concrete attempted insert.
 *
 * Both rules are one sentence long and are trivially confused when stated
 * abstractly; naming which rule a specific row breaks is the version that
 * actually discriminates.
 */
export function generateIntegrityQuestion(
  seed: number,
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const rng = makeRng(seed ^ 0x7c19ff);
  const scenarios = buildIntegrityScenarios();
  const scenario = scenarios[seed % scenarios.length];

  return {
    id: `gen-integrity-${seed}`,
    topic: "integrity",
    source: "generated",
    difficulty,
    kind: "choice",
    prompt: scenario.prompt,
    context: {
      schemaId: "staff",
      note: "Staff.branchNo is a foreign key referencing Branch.branchNo. Branch holds B002–B005 and B007."
    },
    options: shuffle(rng, scenario.options),
    explanation: scenario.explanation,
    hints: [
      "Entity integrity is about the primary key of the relation being inserted into.",
      "Referential integrity is about a foreign key matching a candidate key in the relation it references — or being wholly null."
    ]
  };
}

function buildIntegrityScenarios(): IntegrityScenario[] {
  const entity: Choice = {
    text: "Entity integrity",
    correct: false,
    mistake: "entity-vs-referential-integrity"
  };
  const referential: Choice = {
    text: "Referential integrity",
    correct: false,
    mistake: "entity-vs-referential-integrity"
  };
  const neither: Choice = { text: "Neither — the insert is valid", correct: false };

  return [
    {
      prompt:
        "A new Staff tuple is inserted with staffNo = NULL, lName = 'Reed' and branchNo = 'B003'. Which integrity rule does this break?",
      options: [
        { ...entity, correct: true },
        {
          ...referential,
          note:
            "branchNo is B003, which exists in Branch, so the foreign key is fine. The problem is the primary key: staffNo is NULL, and entity integrity says no attribute of a primary key may be null."
        },
        { ...neither, note: "A NULL primary key is never valid in a base relation." }
      ],
      explanation:
        "Entity integrity. staffNo is the primary key of Staff, and Lecture 2 states that in a base relation no attribute of a primary key can be null."
    },
    {
      prompt:
        "A new Staff tuple is inserted with staffNo = 'SG90', lName = 'Reed' and branchNo = 'B099'. Which integrity rule does this break?",
      options: [
        {
          ...entity,
          note:
            "The primary key staffNo is present and unique, so entity integrity is satisfied. The problem is branchNo: B099 is not a branch that exists."
        },
        { ...referential, correct: true },
        { ...neither, note: "B099 does not appear in Branch, so the foreign key points at nothing." }
      ],
      explanation:
        "Referential integrity. branchNo is a foreign key, and its value must either match a candidate-key value in Branch or be wholly null. B099 does neither."
    },
    {
      prompt:
        "A new Staff tuple is inserted with staffNo = 'SG91', lName = 'Reed' and branchNo = NULL. Which integrity rule does this break?",
      options: [
        {
          ...entity,
          note:
            "branchNo is not part of the primary key, so a null there says nothing about entity integrity."
        },
        {
          ...referential,
          note:
            "A wholly null foreign key is explicitly allowed. Lecture 2: the foreign key value must match a candidate key value, OR be wholly null."
        },
        {
          ...neither,
          correct: true,
          note: undefined
        }
      ],
      explanation:
        "Neither. The primary key is present, and a wholly null foreign key is permitted — it simply means this member of staff is not yet assigned to a branch."
    },
    {
      prompt:
        "Which statement about NULL is correct?",
      options: [
        {
          text: "NULL represents the absence of a value and is not the same as zero or a space.",
          correct: true
        },
        {
          text: "NULL is stored as zero for numeric attributes and as an empty string for text.",
          correct: false,
          mistake: "null-semantics",
          note:
            "No. Lecture 2 is explicit: NULL is the absence of a value, not the same as zero or spaces. A zero is a known quantity; NULL is the absence of one."
        },
        {
          text: "Two NULLs are equal, so they group together in a comparison.",
          correct: false,
          mistake: "null-semantics",
          note:
            "NULL is not equal to anything, including another NULL. Any comparison involving NULL is unknown, and unknown is not true."
        },
        {
          text: "A primary key may be NULL as long as the rest of the tuple is filled in.",
          correct: false,
          mistake: "entity-vs-referential-integrity",
          note: "That is exactly what entity integrity forbids."
        }
      ],
      explanation:
        "NULL is the absence of a value. It is not zero, not a space, and not equal to anything — which is why a comparison against it is never true."
    }
  ];
}
