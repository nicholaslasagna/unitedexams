/**
 * English ↔ algebra, generated from the course's own schemas.
 *
 * Homework #1 asks both directions: Question 2 gives an expression and asks
 * what relation it produces, Questions 3 and 4 give a sentence and ask for the
 * expression. These templates reproduce both, varying the attributes, the
 * conditions and the values.
 *
 * One rule governs everything here: **the reference answer must return at
 * least one tuple.** Equivalence is decided by evaluating both expressions, so
 * a reference that returns nothing would mark every wrong answer that also
 * returns nothing as correct — the question would silently stop testing
 * anything. Each template proposes candidate parameters and the builder keeps
 * the first that produces a non-empty result.
 */

import { courseDatabase, roomRelation, staffRelation } from "@/data/seed/db-exam1/relations";
import { evaluate } from "@/lib/relational-algebra/ast";
import { parseExpression } from "@/lib/relational-algebra/parser";
import type { Relation } from "@/lib/relational-algebra/relation";
import type { MistakeTag } from "../mistakes";
import type { Choice, LabQuestion, WalkthroughStep } from "../question-model";
import type { TopicId } from "../topics";
import { makeRng, shuffle, type Rng } from "./random";

interface QueryVariant {
  prompt: string;
  referenceText: string;
  available: string[];
  schemaId: string;
  topic: TopicId;
  explanation: string;
  hints: string[];
  walkthrough: WalkthroughStep[];
}

/** Distinct values of an attribute, so conditions always match something. */
function valuesOf(relation: Relation, attribute: string): string[] {
  const index = relation.attributes.findIndex(
    (a) => a.toLowerCase() === attribute.toLowerCase()
  );
  if (index < 0) return [];
  return [...new Set(relation.tuples.map((tuple) => String(tuple[index])))];
}

function resultOf(referenceText: string): Relation | null {
  try {
    return evaluate(parseExpression(referenceText), courseDatabase).relation;
  } catch {
    return null;
  }
}

/** The first variant whose reference answer actually returns tuples. */
function firstNonEmpty(variants: QueryVariant[]): QueryVariant | null {
  for (const variant of variants) {
    const result = resultOf(variant.referenceText);
    if (result && result.tuples.length > 0) return variant;
  }
  return null;
}

// ── Templates ─────────────────────────────────────────────────────────────

/**
 * Single relation: choose rows with σ, then columns with Π.
 * Modelled on Homework #1 Question 3(a).
 */
function staffSingleRelation(rng: Rng): QueryVariant[] {
  const positions = shuffle(rng, valuesOf(staffRelation, "position"));
  const outputs = shuffle(rng, [
    ["fName", "lName"],
    ["staffNo", "salary"],
    ["lName", "DOB"]
  ]);

  return positions.flatMap((position) =>
    outputs.map((output) => ({
      prompt: `List the ${output.join(" and ")} of every member of staff whose position is ${position}.`,
      referenceText: `Π_{${output.join(", ")}}(σ_{position = '${position}'}(Staff))`,
      available: ["Staff"],
      schemaId: "staff",
      topic: "writing-expressions" as TopicId,
      explanation:
        `Everything needed is in Staff, so no join is required. σ picks the rows where ` +
        `position is ${position}; Π then keeps ${output.join(" and ")}.`,
      hints: [
        `What has to come OUT? ${output.join(" and ")} — that is the final Π.`,
        `What CONDITION filters rows? position = '${position}' — that is the σ.`,
        "Both attributes live in Staff, so one relation is enough."
      ],
      walkthrough: [
        {
          ask: "What attributes must be output?",
          answer: output.join(", "),
          why: "The sentence says 'List the …' — whatever follows is the final projection."
        },
        {
          ask: "What conditions filter the tuples?",
          answer: `position = '${position}'`,
          why: "'whose position is …' is a restriction on rows, so it belongs in σ."
        },
        {
          ask: "Which relation holds those attributes?",
          answer: "Staff holds all of them.",
          why: "Check the schema before reaching for an attribute — if they were split, you would need a join."
        },
        {
          ask: "Do we need more than one relation?",
          answer: "No.",
          why: "Both the output attributes and the filtered attribute live in Staff."
        },
        {
          ask: "Put it together, inside out.",
          answer: `Π_{${output.join(", ")}}(σ_{position = '${position}'}(Staff))`,
          why: "Filter first, then project — σ innermost, Π outermost."
        }
      ]
    }))
  );
}

/**
 * Two relations: the output attribute and the filtered attribute live in
 * different places, so a join is unavoidable.
 * Modelled on Homework #1 Question 3(a)–(c).
 */
function staffBranchJoin(rng: Rng): QueryVariant[] {
  const positions = shuffle(rng, valuesOf(staffRelation, "position"));
  const branchOutputs = shuffle(rng, [
    ["street", "city", "postcode"],
    ["city"],
    ["branchNo", "city"]
  ]);

  const byPosition = positions.flatMap((position) =>
    branchOutputs.map((output) => ({
      prompt: `List the ${output.join(", ")} of every branch that has a member of staff whose position is ${position}.`,
      referenceText:
        `Π_{${output.join(", ")}}((σ_{position = '${position}'}(Staff)) ` +
        `⋈_{Staff.branchNo = Branch.branchNo} Branch)`,
      available: ["Staff", "Branch"],
      schemaId: "staff",
      topic: "writing-expressions" as TopicId,
      explanation:
        `position lives in Staff and ${output.join(", ")} ${
          output.length === 1 ? "lives" : "live"
        } in Branch, so the two relations must be joined on branchNo — the attribute they share — ` +
        `before either can be used.`,
      hints: [
        `What has to come OUT? ${output.join(", ")}.`,
        "Which relation holds those? Branch. Which holds position? Staff.",
        "They are different relations, so join them on the attribute they share: branchNo."
      ],
      walkthrough: [
        {
          ask: "What attributes must be output?",
          answer: output.join(", "),
          why: "That is the final projection."
        },
        {
          ask: "Which relation holds them?",
          answer: "Branch.",
          why: "city, street and postcode are Branch attributes — they are not in Staff."
        },
        {
          ask: "What condition filters the tuples, and where does that attribute live?",
          answer: `position = '${position}', and position is in Staff.`,
          why: "This is the moment you know one relation is not enough."
        },
        {
          ask: "What attribute connects the two relations?",
          answer: "branchNo — a foreign key in Staff referencing Branch.",
          why: "The join condition compares two attributes, one from each relation."
        },
        {
          ask: "Put it together.",
          answer:
            `Π_{${output.join(", ")}}((σ_{position = '${position}'}(Staff)) ` +
            `⋈_{Staff.branchNo = Branch.branchNo} Branch)`,
          why: "Filter Staff, join to Branch on branchNo, then project what was asked for."
        }
      ]
    }))
  );

  const byYear = shuffle(rng, ["1955", "1962", "1968"]).map((year) => ({
    prompt: `List the cities of all staff born before ${year}.`,
    referenceText:
      `Π_{city}((σ_{DOB < '${year}-01-01'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)`,
    available: ["Staff", "Branch"],
    schemaId: "staff",
    topic: "writing-expressions" as TopicId,
    explanation:
      `DOB is in Staff but city is in Branch, so the relations join on branchNo. Dates compare ` +
      `as strings in ISO order, so 'born before ${year}' is DOB < '${year}-01-01'.`,
    hints: [
      "What has to come OUT? city — and city is a Branch attribute.",
      "What filters the rows? DOB, which is a Staff attribute.",
      "Different relations, so join on branchNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "city" },
      {
        ask: "Which relation holds city?",
        answer: "Branch.",
        why: "A very common slip is to filter city out of Staff. Staff has no city attribute at all."
      },
      { ask: "What condition filters the tuples?", answer: `DOB < '${year}-01-01'` },
      { ask: "What attribute connects Staff and Branch?", answer: "branchNo" },
      {
        ask: "Put it together.",
        answer: `Π_{city}((σ_{DOB < '${year}-01-01'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)`
      }
    ]
  }));

  return [...byPosition, ...byYear];
}

/**
 * The hotel query the lecture and the homework both use as their worked
 * example: two conditions on one relation, then a join to reach the name.
 */
function hotelRoomJoin(rng: Rng): QueryVariant[] {
  const types = shuffle(rng, valuesOf(roomRelation, "type"));
  const prices = shuffle(rng, [50, 100, 150]);

  return types.flatMap((type) =>
    prices.map((price) => ({
      prompt: `List the hotel names of hotels that have a ${type} costing more than ${price}.`,
      referenceText:
        `Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} ` +
        `(σ_{type = '${type}' ∧ price > ${price}}(Room)))`,
      available: ["Hotel", "Room"],
      schemaId: "hotel",
      topic: "writing-expressions" as TopicId,
      explanation:
        `hotelName is in Hotel; type and price are in Room. Both conditions apply to Room, so ` +
        `they combine with ∧ inside one σ. The relations join on hotelNo.`,
      hints: [
        "What has to come OUT? hotelName, which lives in Hotel.",
        `What CONDITIONS are there? Two: type = '${type}' and price > ${price}. Both are Room attributes, so they go in one σ joined by ∧.`,
        "Connect Hotel and Room on hotelNo."
      ],
      walkthrough: [
        { ask: "What attributes must be output?", answer: "hotelName" },
        {
          ask: "Which relation contains hotelName?",
          answer: "Hotel.",
          why: "Room has no name attribute — only roomNo, hotelNo, type and price."
        },
        {
          ask: "What conditions are present?",
          answer: `type = '${type}' and price > ${price}`,
          why: "Two separate restrictions. Missing one is the most common error on this question."
        },
        {
          ask: "Which relation contains type and price?",
          answer: "Room.",
          why: "They are both Room attributes, so a single σ over Room handles both with ∧."
        },
        {
          ask: "What attribute joins Hotel and Room?",
          answer: "hotelNo.",
          why: "It is the primary key of Hotel and a foreign key in Room."
        },
        {
          ask: "Put it together.",
          answer:
            `Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = '${type}' ∧ price > ${price}}(Room)))`,
          why: "Restrict Room first so the join carries fewer tuples, then project the name."
        }
      ]
    }))
  );
}

function hotelBookingChain(): QueryVariant[] {
  return [
    {
      prompt: "List the names of guests staying at the Grosvenor.",
      referenceText:
        "Π_{guestName}(((σ_{hotelName = 'Grosvenor'}(Hotel)) ⋈_{Hotel.hotelNo = Booking.hotelNo} Booking) ⋈_{Booking.guestNo = Guest.guestNo} Guest)",
      available: ["Hotel", "Booking", "Guest"],
      schemaId: "hotel",
      topic: "multi-table" as TopicId,
      explanation:
        "guestName is in Guest and hotelName is in Hotel. They share nothing, so the path runs Hotel →(hotelNo) Booking →(guestNo) Guest.",
      hints: [
        "What has to come OUT? guestName, in Guest.",
        "What filters? hotelName = 'Grosvenor', in Hotel.",
        "Booking is the relation that connects them."
      ],
      walkthrough: [
        { ask: "What attributes must be output?", answer: "guestName" },
        { ask: "Which relation holds it?", answer: "Guest." },
        { ask: "What condition filters the tuples?", answer: "hotelName = 'Grosvenor'" },
        { ask: "Which relation holds hotelName?", answer: "Hotel." },
        {
          ask: "What is the join path?",
          answer: "Hotel →(hotelNo) Booking →(guestNo) Guest",
          why: "Booking is the only relation that touches both a hotel and a guest."
        },
        {
          ask: "Put it together.",
          answer:
            "Π_{guestName}(((σ_{hotelName = 'Grosvenor'}(Hotel)) ⋈_{Hotel.hotelNo = Booking.hotelNo} Booking) ⋈_{Booking.guestNo = Guest.guestNo} Guest)"
        }
      ]
    }
  ];
}

/** Three relations chained — Homework #1 Question 4(f). */
function libraryChain(rng: Rng): QueryVariant[] {
  const titles = shuffle(rng, ["Lord of the Rings", "The C Programming Language"]);

  return titles.map((title) => ({
    prompt: `List the names of borrowers who currently have the book title "${title}" on loan.`,
    referenceText:
      `Π_{borrowerName}(((σ_{title = '${title}'}(Book)) ⋈_{Book.ISBN = BookCopy.ISBN} BookCopy) ` +
      `⋈_{BookCopy.copyNo = BookLoan.copyNo} BookLoan ⋈_{BookLoan.borrowerNo = Borrower.borrowerNo} Borrower)`,
    available: ["Book", "BookCopy", "BookLoan", "Borrower"],
    schemaId: "library",
    topic: "multi-table" as TopicId,
    explanation:
      `The title is in Book and the name is in Borrower, and nothing connects them directly. ` +
      `The path runs Book → BookCopy (on ISBN) → BookLoan (on copyNo) → Borrower (on borrowerNo).`,
    hints: [
      "What has to come OUT? borrowerName, which is in Borrower.",
      "What filters? title, which is in Book. Those two relations do not share an attribute.",
      "Trace the path: Book and BookCopy share ISBN; BookCopy and BookLoan share copyNo; BookLoan and Borrower share borrowerNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "borrowerName" },
      { ask: "Which relation holds it?", answer: "Borrower." },
      { ask: "What condition filters the tuples?", answer: `title = '${title}'` },
      {
        ask: "Which relation holds title?",
        answer: "Book.",
        why: "Book holds titles; BookCopy holds physical copies and only references the ISBN."
      },
      {
        ask: "Do Book and Borrower share an attribute?",
        answer: "No — so more than one join is needed.",
        why: "When two relations do not touch, you have to find the path between them."
      },
      {
        ask: "What is the join path?",
        answer: "Book →(ISBN) BookCopy →(copyNo) BookLoan →(borrowerNo) Borrower"
      },
      {
        ask: "Put it together.",
        answer:
          `Π_{borrowerName}(((σ_{title = '${title}'}(Book)) ⋈_{Book.ISBN = BookCopy.ISBN} BookCopy) ` +
          `⋈_{BookCopy.copyNo = BookLoan.copyNo} BookLoan ⋈_{BookLoan.borrowerNo = Borrower.borrowerNo} Borrower)`
      }
    ]
  }));
}

/**
 * An English → algebra question.
 *
 * `difficulty` chooses how many relations are involved: intro stays inside
 * one relation, core needs a join, stretch chains three or four.
 */
export function generateWriteQuestion(
  seed: number,
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const rng = makeRng(seed);
  const pool =
    difficulty === "intro"
      ? [staffSingleRelation]
      : difficulty === "stretch"
        ? [libraryChain, () => hotelBookingChain()]
        : [staffBranchJoin, hotelRoomJoin];

  const variants = shuffle(rng, pool).flatMap((template) => template(rng));
  const variant = firstNonEmpty(variants);

  if (!variant) {
    // Every template is data-driven, so this only happens if the seed data
    // changes underneath. Fall back to the one query that cannot be empty.
    return generateWriteQuestion(seed + 1, "intro");
  }

  return {
    id: `gen-write-${seed}`,
    topic: variant.topic,
    source: "generated",
    sourceNote: "Generated variant in the style of Homework #1, Questions 3 and 4",
    difficulty,
    kind: "expression",
    prompt: variant.prompt,
    context: { schemaId: variant.schemaId },
    referenceText: variant.referenceText,
    available: variant.available,
    explanation: variant.explanation,
    hints: variant.hints,
    walkthrough: variant.walkthrough
  };
}

// ── Reading direction ─────────────────────────────────────────────────────

interface ReadingVariant {
  expression: string;
  correct: string;
  distractors: { text: string; mistake: MistakeTag; note: string }[];
  explanation: string;
  schemaId: string;
}

/**
 * Expression → English, in the shape of Homework #1 Question 2.
 *
 * The distractors are the readings that differ in exactly one respect —
 * which side is preserved, whose attributes come back, whether unmatched
 * tuples survive — because those are the distinctions the question is for.
 */
export function generateReadQuestion(
  seed: number,
  difficulty: "intro" | "core" | "stretch" = "core"
): LabQuestion {
  const rng = makeRng(seed ^ 0x51a2);
  const variants = readingVariants();
  const variant = variants[seed % variants.length];

  const options: Choice[] = shuffle(rng, [
    { text: variant.correct, correct: true },
    ...variant.distractors.map((distractor) => ({
      text: distractor.text,
      correct: false,
      mistake: distractor.mistake,
      note: distractor.note
    }))
  ]);

  return {
    id: `gen-read-${seed}`,
    topic: "reading-expressions",
    source: "generated",
    sourceNote: "Generated variant in the style of Homework #1, Question 2",
    difficulty,
    kind: "choice",
    prompt: "What relation does this expression produce?",
    context: { expression: variant.expression, schemaId: variant.schemaId },
    options,
    explanation: variant.explanation,
    hints: [
      "Work from the inside out: evaluate the innermost bracket first.",
      "Then ask three things: which tuples survive, which attributes come back, and what happens to tuples with no match."
    ]
  };
}

function readingVariants(): ReadingVariant[] {
  return [
    {
      // Homework #1, Question 2(a), verbatim.
      expression: "Hotel ▷_{Hotel.hotelNo = Room.hotelNo} (σ_{price > 50}(Room))",
      schemaId: "hotel",
      correct:
        "The full details of every hotel that has at least one room costing more than 50.",
      distractors: [
        {
          text: "Every hotel together with each of its rooms costing more than 50.",
          mistake: "semijoin-wrong-relation",
          note:
            "A semijoin returns only the LEFT relation's attributes. No room details appear in the result — Room only decides which hotels qualify.",
        },
        {
          text: "Every room costing more than 50, together with its hotel's details.",
          mistake: "semijoin-direction",
          note:
            "That would be the semijoin the other way round. Hotel ▷ Room keeps tuples of Hotel, not of Room.",
        },
        {
          text: "Every hotel, with NULLs where it has no room over 50.",
          mistake: "outer-join-drops-unmatched",
          note:
            "That describes an outer join. A semijoin simply drops the hotels that do not qualify; nothing is padded.",
        }
      ],
      explanation:
        "A semijoin performs the join and then projects over the attributes of the first operand. So the result has Hotel's schema — hotelNo, hotelName, city — and contains exactly those hotels with at least one matching room over 50."
    },
    {
      // Homework #1, Question 2(b), verbatim.
      expression: "σ_{Hotel.hotelNo = Room.hotelNo}(Hotel X Room)",
      schemaId: "hotel",
      correct:
        "Every room paired with the details of the hotel it belongs to. Only hotels with at least one room appear.",
      distractors: [
        {
          text: "Every possible pairing of a hotel with a room.",
          mistake: "filter-vs-join-condition",
          note:
            "That is the Cartesian product on its own. The σ around it keeps only the pairs whose hotelNo values match.",
        },
        {
          text: "Every hotel, including those with no rooms, paired with its rooms.",
          mistake: "outer-join-drops-unmatched",
          note:
            "A selection over a product is an inner join. A hotel with no rooms produces no matching pair and disappears.",
        },
        {
          text: "The hotels that have at least one room, with only Hotel's attributes.",
          mistake: "semijoin-wrong-relation",
          note:
            "That would be a semijoin. This expression keeps both relations' attributes side by side — degree 3 + 4 = 7.",
        }
      ],
      explanation:
        "σ over a Cartesian product is exactly a theta join: R ⋈_F S = σ_F(R X S). The result carries both schemas — hotelNo, hotelName, city, roomNo, Room.hotelNo, type, price — and a hotel with no rooms contributes nothing."
    },
    {
      expression: "Π_{city}(Branch) − Π_{city}(σ_{position = 'Manager'}(Staff) ⋈_{Staff.branchNo = Branch.branchNo} Branch)",
      schemaId: "staff",
      correct: "The cities that have a branch but no manager.",
      distractors: [
        {
          text: "The cities that have both a branch and a manager.",
          mistake: "unclassified",
          note: "That would be an intersection. This expression subtracts the second set from the first."
        },
        {
          text: "Every city that has a branch.",
          mistake: "missing-condition",
          note: "The subtraction is not optional — it removes the cities that do have a manager."
        },
        {
          text: "The managers who work in a city with no branch.",
          mistake: "wrong-relation-for-attribute",
          note: "The result has one attribute, city, because both operands project down to city. No staff details survive."
        }
      ],
      explanation:
        "Both operands project down to city, so they are union-compatible. The difference keeps the cities in the first set that are not in the second — branches with no manager."
    },
    {
      expression: "R ⟕_{R.j = S.j} S",
      schemaId: "rs",
      correct:
        "Every matching pair, plus every tuple of R with no match, padded with NULL across S's attributes.",
      distractors: [
        {
          text: "Every matching pair, plus every tuple of S with no match, padded with NULL.",
          mistake: "outer-join-side",
          note: "That is the RIGHT outer join. The side named is the side preserved."
        },
        {
          text: "Every matching pair only — unmatched tuples are dropped.",
          mistake: "outer-join-drops-unmatched",
          note: "Preserving unmatched tuples is the whole purpose of an outer join."
        },
        {
          text: "Every tuple of R paired with every tuple of S.",
          mistake: "outer-join-as-product",
          note:
            "An outer join still only pairs tuples that satisfy the condition. Pairing everything with everything is the Cartesian product."
        }
      ],
      explanation:
        "A left outer join keeps every tuple of the left relation. Matching tuples pair up as in an equijoin; an unmatched left tuple appears once with NULLs in every attribute that came from S."
    }
  ];
}
