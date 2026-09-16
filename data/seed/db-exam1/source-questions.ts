/**
 * Questions taken from the course's own material.
 *
 * These are the professor's, not variants: Homework #1 verbatim, and concept
 * questions drawn straight from the Lecture 2–5 slides. The UI labels them as
 * course material so a learner always knows whether they are working on the
 * real thing or on a generated variant of it.
 *
 * Result tables are computed by the evaluator rather than transcribed, so the
 * answers cannot drift from the engine that marks them.
 */

import { attr, compare, lit, or } from "@/lib/relational-algebra/condition";
import {
  divide,
  naturalJoin,
  outerJoin,
  project,
  select,
  semijoin,
  thetaJoin
} from "@/lib/relational-algebra/operations";
import type { Relation } from "@/lib/relational-algebra/relation";
import type { LabQuestion, RowCandidate } from "@/features/db-exam1/question-model";
import {
  branchRelation,
  propertyForRentRelation,
  relationR,
  relationS,
  staffRelation,
  viewingRelation
} from "./relations";

const J = compare(attr("R.j"), "=", attr("S.j"));

/** Rows of `result`, plus hand-picked wrong rows that share its width. */
function rowsQuestion(
  base: Omit<Extract<LabQuestion, { kind: "rows" }>, "kind" | "attributes" | "candidates">,
  result: Relation,
  distractors: RowCandidate[]
): LabQuestion {
  const correct: RowCandidate[] = result.tuples.map((values) => ({ values, inResult: true }));
  return {
    ...base,
    kind: "rows",
    attributes: result.attributes,
    candidates: [
      ...correct,
      ...distractors.filter((candidate) => candidate.values.length === result.attributes.length)
    ]
  };
}

const RS_CONTEXT = { relations: [relationR, relationS] };

// ── Homework #1, Question 1 ───────────────────────────────────────────────

const equijoin = thetaJoin(relationR, relationS, J).relation;
const natural = naturalJoin(relationR, relationS).relation;
const leftOuter = outerJoin(relationR, relationS, "left", J).relation;
const rightOuter = outerJoin(relationR, relationS, "right", J).relation;
const fullOuter = outerJoin(relationR, relationS, "full", J).relation;
const semi = semijoin(relationR, relationS, J).relation;

const homeworkOne: LabQuestion[] = [
  rowsQuestion(
    {
      id: "hw1-q1a",
      topic: "equijoin",
      source: "professor",
      sourceNote: "Homework #1, Question 1(a)",
      difficulty: "core",
      prompt: "Select every tuple in the equijoin R ⋈ R.j = S.j S.",
      context: RS_CONTEXT,
      explanation:
        "J1, J2 and J3 appear in both relations. J1 has two R tuples and two S tuples (4 rows), " +
        "J2 has one and two (2 rows), J3 has two and one (2 rows) — eight rows in total. " +
        "R105 carries J7, which S does not have, so it contributes nothing. The equijoin keeps " +
        "both copies of j, so the degree is 8.",
      hints: [
        "List the j values that appear in both R and S.",
        "For each one, multiply the number of R tuples by the number of S tuples carrying it."
      ]
    },
    equijoin,
    [
      {
        values: ["R105", "J7", "E", 61, null, null, null, null],
        inResult: false,
        mistake: "inner-join-pads-unmatched",
        note:
          "R105 has no matching tuple in S. An equijoin returns nothing for an unmatched tuple — only an outer join pads with NULL."
      },
      {
        values: ["R101", "J1", "A", 15, "S202", "J2", "Purple", 30],
        inResult: false,
        mistake: "wrong-join-attributes",
        note:
          "R101 carries J1 and S202 carries J2, so they never pair. Tuples join on the value of j, not on where the rows sit in the table."
      }
    ]
  ),

  rowsQuestion(
    {
      id: "hw1-q1b",
      topic: "natural-join",
      source: "professor",
      sourceNote: "Homework #1, Question 1(b)",
      difficulty: "core",
      prompt: "Select every tuple in the natural join R ⋈ S.",
      context: RS_CONTEXT,
      explanation:
        "The same eight tuples as the equijoin — a natural join is an equijoin over the common " +
        "attributes — but one copy of j is eliminated, so the degree drops from 8 to 7.",
      hints: [
        "Start from the equijoin's rows.",
        "Then remove one copy of the common attribute j. The rows do not change; the schema does."
      ]
    },
    natural,
    [
      {
        values: ["R105", "J7", "E", 61, null, null, null],
        inResult: false,
        mistake: "inner-join-pads-unmatched",
        note: "A natural join is still an inner join — unmatched tuples are dropped, not padded."
      }
    ]
  ),

  rowsQuestion(
    {
      id: "hw1-q1c",
      topic: "outer-join-left",
      source: "professor",
      sourceNote: "Homework #1, Question 1(c)",
      difficulty: "core",
      prompt: "Select every tuple in the left outer join R ⟕ R.j = S.j S.",
      context: RS_CONTEXT,
      explanation:
        "The eight matching rows, plus R105 — the only R tuple with no match — carried through " +
        "with NULLs across all four of S's attributes. Nine rows. S204 (J9) is unmatched on the " +
        "right and does not appear, because a left outer join preserves the left relation only.",
      hints: [
        "Begin with the equijoin's eight rows.",
        "Then add every R tuple with no match, filling S's columns with NULL."
      ]
    },
    leftOuter,
    [
      {
        values: [null, null, null, null, "S204", "J9", "Blue", 42],
        inResult: false,
        mistake: "outer-join-side",
        note:
          "S204 is unmatched on the RIGHT. A left outer join preserves the left relation; it takes a right or full outer join to keep this tuple."
      }
    ]
  ),

  rowsQuestion(
    {
      id: "hw1-q1d",
      topic: "outer-join-right",
      source: "professor",
      sourceNote: "Homework #1, Question 1(d)",
      difficulty: "core",
      prompt: "Select every tuple in the right outer join R ⟖ R.j = S.j S.",
      context: RS_CONTEXT,
      explanation:
        "The eight matching rows, plus S204 (J9) padded with NULLs across R's attributes. Nine " +
        "rows. R105 does NOT appear — a right outer join preserves the right relation, and R105 " +
        "is an unmatched tuple on the left.",
      hints: [
        "Begin with the equijoin's eight rows.",
        "Then add every S tuple with no match. Unmatched R tuples are not preserved."
      ]
    },
    rightOuter,
    [
      {
        values: ["R105", "J7", "E", 61, null, null, null, null],
        inResult: false,
        mistake: "outer-join-side",
        note:
          "R105 is unmatched on the LEFT, and a right outer join preserves the right relation. This row belongs in the left or full outer join."
      }
    ]
  ),

  rowsQuestion(
    {
      id: "hw1-q1e",
      topic: "outer-join-full",
      source: "professor",
      sourceNote: "Homework #1, Question 1(e)",
      difficulty: "core",
      prompt: "Select every tuple in the full outer join R ⟗ R.j = S.j S.",
      context: RS_CONTEXT,
      explanation:
        "Eight matching rows plus both unmatched tuples — R105 padded on the right and S204 " +
        "padded on the left — giving ten rows. Note that this is still far short of the 36 rows " +
        "of R X S: a full outer join only ever pairs tuples that satisfy the condition.",
      hints: [
        "Take the matching rows, then add the unmatched tuples from BOTH sides.",
        "Ten rows, not 36. An outer join is not a Cartesian product."
      ]
    },
    fullOuter,
    []
  ),

  rowsQuestion(
    {
      id: "hw1-q1f",
      topic: "semijoin",
      source: "professor",
      sourceNote: "Homework #1, Question 1(f)",
      difficulty: "core",
      prompt: "Select every tuple in the semijoin R ▷ R.j = S.j S.",
      context: RS_CONTEXT,
      explanation:
        "The semijoin keeps the tuples of R that have at least one match in S, and returns only " +
        "R's attributes — degree 4, not 8. Five of R's six tuples qualify; R105 (J7) does not. " +
        "Note that R101 appears once even though it matches two S tuples: the result is a set of " +
        "R tuples, not one row per match.",
      hints: [
        "Do the join first, then keep only R's columns.",
        "One row per qualifying R tuple, however many matches it had."
      ]
    },
    semi,
    [
      {
        values: ["S201", "J1", "Red", 15],
        inResult: false,
        mistake: "semijoin-wrong-relation",
        note:
          "This is a tuple of S. R ▷ S returns only R's attributes — S decides which tuples of R qualify and then disappears."
      },
      {
        values: ["R105", "J7", "E", 61],
        inResult: false,
        mistake: "semijoin-direction",
        note: "R105 carries J7, which does not appear in S, so it has no match and does not qualify."
      }
    ]
  )
];

// ── Homework #1, Question 1(g) — division ─────────────────────────────────

const dividend = project(relationR, ["r2", "j"]).relation;
const divisorRelation = project(
  select(relationS, or(compare(attr("j"), "=", lit("J1")), compare(attr("j"), "=", lit("J2"))))
    .relation,
  ["j"]
).relation;
const { relation: quotient, trace: divisionTrace } = divide(dividend, divisorRelation);

const divisionQuestion: LabQuestion = {
  id: "hw1-q1g",
  topic: "division",
  source: "professor",
  sourceNote: "Homework #1, Question 1(g)",
  difficulty: "core",
  kind: "choice",
  multiple: true,
  prompt:
    "Which r2 values appear in Π r2, j (R) ÷ Π j (σ j = 'J1' ∨ j = 'J2' (S))?",
  context: {
    relations: [dividend, divisorRelation],
    note: "Select every value that qualifies. The divisor holds J1 and J2."
  },
  options: divisionTrace.candidates.map((candidate, index) => {
    const value = String(candidate[0]);
    const covered = divisionTrace.coverageByCandidate[index];
    const isCorrect = quotient.tuples.some((tuple) => String(tuple[0]) === value);
    return {
      text: value,
      correct: isCorrect,
      mistake: isCorrect ? undefined : ("division-any-not-all" as const),
      note: isCorrect
        ? undefined
        : `${value} is paired with ${covered.filter(Boolean).length} of the 2 required values ` +
          `(${divisorRelation.tuples.map((t) => t[0]).join(", ")}). Division means for all — ` +
          `covering one of them is not enough.`
    };
  }),
  explanation:
    "A is paired with both J1 and J2, so it qualifies. C is paired with J1 only, D and F with J3, " +
    "E with J7 — none of those cover the divisor. The result is a single tuple, A, over the " +
    "attribute r2: the divisor's attribute j is removed, because the result is over C = A − B.",
  hints: [
    "For each r2 value, list every j it is paired with.",
    "Keep it only if that list contains both J1 and J2. Extra pairings never disqualify a value."
  ]
};

// ── Homework #1, Question 2 — reading algebra ─────────────────────────────

const homeworkTwo: LabQuestion[] = [
  {
    id: "hw1-q2a",
    topic: "reading-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 2(a)",
    difficulty: "core",
    kind: "choice",
    prompt: "Describe the relation this expression produces.",
    context: {
      expression: "Hotel ▷_{Hotel.hotelNo = Room.hotelNo} (σ_{price > 50}(Room))",
      schemaId: "hotel"
    },
    options: [
      {
        text: "The full details of every hotel that has at least one room costing more than 50.",
        correct: true
      },
      {
        text: "Every hotel paired with each of its rooms costing more than 50.",
        correct: false,
        mistake: "semijoin-wrong-relation",
        note:
          "A semijoin returns only the first operand's attributes. No room details survive — Room's role is to decide which hotels qualify."
      },
      {
        text: "Every room costing more than 50, with its hotel's details attached.",
        correct: false,
        mistake: "semijoin-direction",
        note:
          "That is the semijoin the other way round. Hotel ▷ Room returns tuples of Hotel; Room ▷ Hotel would return tuples of Room."
      },
      {
        text: "Every hotel, with NULLs where it has no room over 50.",
        correct: false,
        mistake: "outer-join-drops-unmatched",
        note:
          "That is an outer join. A semijoin drops the hotels that do not qualify rather than padding them."
      }
    ],
    explanation:
      "Lecture 5 defines the semijoin as R ▷_F S = Π_A(R ⋈_F S) where A is the set of all " +
      "attributes of R. So the result has Hotel's schema and contains exactly the hotels with at " +
      "least one room over 50 — 'at least one', because a single matching room is enough.",
    hints: [
      "Evaluate the inner bracket first: σ price > 50 (Room) is the rooms costing more than 50.",
      "Then ask what a semijoin returns — whose attributes survive?"
    ]
  },
  {
    id: "hw1-q2b",
    topic: "reading-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 2(b)",
    difficulty: "core",
    kind: "choice",
    prompt: "Describe the relation this expression produces.",
    context: {
      expression: "σ_{Hotel.hotelNo = Room.hotelNo}(Hotel X Room)",
      schemaId: "hotel"
    },
    options: [
      {
        text:
          "Each room together with the details of the hotel it belongs to. Only hotels that have at least one room appear.",
        correct: true
      },
      {
        text: "Every possible pairing of a hotel with a room.",
        correct: false,
        mistake: "filter-vs-join-condition",
        note:
          "That is the Cartesian product alone. The σ wrapped around it keeps only the pairs whose hotelNo values agree."
      },
      {
        text: "Every hotel, including those with no rooms, alongside its rooms.",
        correct: false,
        mistake: "outer-join-drops-unmatched",
        note:
          "A selection over a product behaves as an inner join: a hotel with no rooms produces no matching pair and disappears."
      },
      {
        text: "The hotels that have at least one room, with Hotel's attributes only.",
        correct: false,
        mistake: "semijoin-wrong-relation",
        note:
          "That would be a semijoin. This expression keeps both schemas side by side, so the degree is 3 + 4 = 7."
      }
    ],
    explanation:
      "This is the identity from Lecture 4: R ⋈_F S = σ_F(R X S). The result carries every " +
      "attribute of both relations and one row per matching hotel/room pair — which is a room " +
      "with its hotel's details attached.",
    hints: [
      "A selection over a Cartesian product is exactly a join written the long way.",
      "Count the attributes: the product has degree 3 + 4, and σ never changes the degree."
    ]
  }
];

// ── Homework #1, Question 3 — writing algebra ─────────────────────────────

const homeworkThree: LabQuestion[] = [
  {
    id: "hw1-q3a",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 3(a)",
    difficulty: "core",
    kind: "expression",
    prompt: "List the street, city and postcode of all female staff.",
    context: { schemaId: "staff" },
    referenceText:
      "Π_{street, city, postcode}((σ_{sex = 'F'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)",
    available: ["Staff", "Branch"],
    explanation:
      "street, city and postcode are Branch attributes; sex is a Staff attribute. Because the " +
      "output and the filter live in different relations, Staff and Branch must be joined on " +
      "branchNo before either can be used.",
    hints: [
      "What has to come OUT? street, city, postcode — all three are in Branch.",
      "What filters the rows? sex = 'F', which is in Staff.",
      "Different relations, so join them on branchNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "street, city, postcode" },
      {
        ask: "Which relation holds them?",
        answer: "Branch.",
        why: "Staff has no address attributes at all — it only carries branchNo."
      },
      { ask: "What condition filters the tuples?", answer: "sex = 'F'" },
      {
        ask: "Which relation holds sex?",
        answer: "Staff.",
        why: "So one relation is not enough — this is the moment a join becomes necessary."
      },
      { ask: "What attribute connects them?", answer: "branchNo" },
      {
        ask: "Put it together.",
        answer:
          "Π_{street, city, postcode}((σ_{sex = 'F'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)"
      }
    ]
  },
  {
    id: "hw1-q3b",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 3(b)",
    difficulty: "core",
    kind: "expression",
    prompt: "List the cities of all staff born before 1955.",
    context: { schemaId: "staff" },
    referenceText:
      "Π_{city}((σ_{DOB < '1955-01-01'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)",
    available: ["Staff", "Branch"],
    explanation:
      "city is in Branch and DOB is in Staff, so the relations join on branchNo. Π also " +
      "eliminates duplicates, so a city with two qualifying staff still appears once.",
    hints: [
      "city is a Branch attribute — a very common slip is to try to filter it out of Staff.",
      "DOB is in Staff, so a join on branchNo is needed."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "city" },
      {
        ask: "Which relation holds city?",
        answer: "Branch.",
        why: "Staff has no city attribute. Reaching for one there is the mistake this question is built around."
      },
      { ask: "What condition filters the tuples?", answer: "DOB < '1955-01-01'" },
      { ask: "What attribute connects Staff and Branch?", answer: "branchNo" },
      {
        ask: "Put it together.",
        answer: "Π_{city}((σ_{DOB < '1955-01-01'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)"
      }
    ]
  },
  {
    id: "hw1-q3c",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 3(c)",
    difficulty: "core",
    kind: "expression",
    prompt: "List all branch details for all staff who are managers.",
    context: { schemaId: "staff" },
    referenceText:
      "Π_{Branch.branchNo, street, city, postcode}((σ_{position = 'Manager'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)",
    available: ["Staff", "Branch"],
    explanation:
      "'All branch details' means every attribute of Branch. Filter Staff down to managers, " +
      "join on branchNo, then project Branch's four attributes. A semijoin — " +
      "Branch ▷ Branch.branchNo = Staff.branchNo (σ position = 'Manager' (Staff)) — is an equally " +
      "correct answer and returns exactly the same relation.",
    hints: [
      "'All branch details' is every Branch attribute: branchNo, street, city, postcode. After the join both relations carry a branchNo, so that one has to be qualified.",
      "position is a Staff attribute, so join on branchNo first."
    ],
    walkthrough: [
      {
        ask: "What attributes must be output?",
        answer: "Branch.branchNo, street, city, postcode — all of Branch.",
        why: "'All branch details' means the whole Branch tuple."
      },
      { ask: "What condition filters the tuples?", answer: "position = 'Manager'" },
      { ask: "Which relation holds position?", answer: "Staff." },
      { ask: "What attribute connects them?", answer: "branchNo" },
      {
        ask: "Put it together.",
        answer:
          "Π_{Branch.branchNo, street, city, postcode}((σ_{position = 'Manager'}(Staff)) ⋈_{Staff.branchNo = Branch.branchNo} Branch)",
        why:
          "Because only Branch's attributes come back, this is exactly the situation a semijoin describes — and that form is accepted too."
      }
    ]
  }
];

// ── Homework #1, Question 4 — the library database ────────────────────────

const homeworkFour: LabQuestion[] = [
  {
    id: "hw1-q4a",
    topic: "projection",
    source: "professor",
    sourceNote: "Homework #1, Question 4(a)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List all book titles.",
    context: { schemaId: "library" },
    referenceText: "Π_{title}(Book)",
    available: ["Book"],
    explanation:
      "title lives in Book and there is no filter, so the expression is a projection. Π also " +
      "eliminates duplicate titles, which would matter if two ISBNs shared a title.",
    hints: ["What has to come OUT? title. Which relation holds it? Book. No condition, no join."],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "title" },
      { ask: "What conditions filter the tuples?", answer: "None." },
      { ask: "Which relation holds title?", answer: "Book." },
      { ask: "Do we need a join?", answer: "No." },
      { ask: "Put it together.", answer: "Π_{title}(Book)" }
    ]
  },
  {
    id: "hw1-q4b",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 4(b)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List all borrower details.",
    context: { schemaId: "library" },
    referenceText: "Borrower",
    available: ["Borrower"],
    explanation:
      "'All details' means every attribute of Borrower. There is no filter and no other " +
      "relation involved, so the expression is the relation itself. Projecting every " +
      "attribute of Borrower is the same relation and is also accepted.",
    hints: ["'All borrower details' is the whole Borrower tuple — no projection needed, and no join."],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "Every attribute of Borrower." },
      { ask: "What conditions filter the tuples?", answer: "None." },
      { ask: "Which relation holds them?", answer: "Borrower." },
      { ask: "Do we need a join?", answer: "No." },
      { ask: "Put it together.", answer: "Borrower" }
    ]
  },
  {
    id: "hw1-q4c",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 4(c)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List all book titles published in the year 2012.",
    context: { schemaId: "library" },
    referenceText: "Π_{title}(σ_{year = 2012}(Book))",
    available: ["Book"],
    explanation:
      "Everything is in Book, so no join is needed. σ restricts to 2012 and Π keeps the title.",
    hints: ["Both title and year are Book attributes — one relation is enough."],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "title" },
      { ask: "What condition filters the tuples?", answer: "year = 2012" },
      { ask: "Which relation holds both?", answer: "Book." },
      { ask: "Do we need a join?", answer: "No.", why: "Both attributes live in the same relation." },
      { ask: "Put it together.", answer: "Π_{title}(σ_{year = 2012}(Book))" }
    ]
  },
  {
    id: "hw1-q4d",
    topic: "selection",
    source: "professor",
    sourceNote: "Homework #1, Question 4(d)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List all copies of book titles that are available for borrowing.",
    context: { schemaId: "library" },
    referenceText: "Π_{copyNo}(σ_{available = 'Y'}(BookCopy))",
    available: ["BookCopy"],
    explanation:
      "Availability is an attribute of BookCopy, and copyNo identifies the copy. No other " +
      "relation is required. σ keeps the rows where available is Y; Π then returns the copy numbers.",
    hints: [
      "available lives in BookCopy, not in Book.",
      "The output is the copies — copyNo — not the titles."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "copyNo" },
      { ask: "What condition filters the tuples?", answer: "available = 'Y'" },
      { ask: "Which relation holds both?", answer: "BookCopy." },
      { ask: "Do we need a join?", answer: "No.", why: "Book is not involved; this is not asking for titles." },
      { ask: "Put it together.", answer: "Π_{copyNo}(σ_{available = 'Y'}(BookCopy))" }
    ]
  },
  {
    id: "hw1-q4e",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Homework #1, Question 4(e)",
    difficulty: "core",
    kind: "expression",
    prompt:
      'List all copies of the book title "Lord of the Rings" that are available for borrowing.',
    context: { schemaId: "library" },
    referenceText:
      "Π_{copyNo}((σ_{title = 'Lord of the Rings'}(Book)) ⋈_{Book.ISBN = BookCopy.ISBN} (σ_{available = 'Y'}(BookCopy)))",
    available: ["Book", "BookCopy"],
    explanation:
      "The title lives in Book and availability lives in BookCopy, joined by ISBN. Filtering " +
      "each relation before the join keeps the expression small and is the form the lecture uses.",
    hints: [
      "Two conditions, in two different relations: title in Book, available in BookCopy.",
      "They share ISBN — that is the join condition."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "copyNo" },
      { ask: "Which relation holds copyNo?", answer: "BookCopy." },
      {
        ask: "What conditions are present?",
        answer: "title = 'Lord of the Rings' and available = 'Y'",
        why: "One belongs to Book, the other to BookCopy — a strong hint that a join is coming."
      },
      { ask: "What attribute connects Book and BookCopy?", answer: "ISBN" },
      {
        ask: "Put it together.",
        answer:
          "Π_{copyNo}((σ_{title = 'Lord of the Rings'}(Book)) ⋈_{Book.ISBN = BookCopy.ISBN} (σ_{available = 'Y'}(BookCopy)))"
      }
    ]
  },
  {
    id: "hw1-q4f",
    topic: "multi-table",
    source: "professor",
    sourceNote: "Homework #1, Question 4(f)",
    difficulty: "stretch",
    kind: "expression",
    prompt:
      'List the names of borrowers who currently have the book title "Lord of the Rings" on loan.',
    context: { schemaId: "library" },
    referenceText:
      "Π_{borrowerName}(((σ_{title = 'Lord of the Rings'}(Book)) ⋈_{Book.ISBN = BookCopy.ISBN} BookCopy) ⋈_{BookCopy.copyNo = BookLoan.copyNo} BookLoan ⋈_{BookLoan.borrowerNo = Borrower.borrowerNo} Borrower)",
    available: ["Book", "BookCopy", "BookLoan", "Borrower"],
    explanation:
      "Four relations. Book and Borrower share nothing, so the path has to be traced: " +
      "Book →(ISBN) BookCopy →(copyNo) BookLoan →(borrowerNo) Borrower.",
    hints: [
      "borrowerName is in Borrower; title is in Book. They share no attribute.",
      "Find the path: Book–BookCopy on ISBN, BookCopy–BookLoan on copyNo, BookLoan–Borrower on borrowerNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "borrowerName" },
      { ask: "Which relation holds it?", answer: "Borrower." },
      { ask: "What condition filters the tuples?", answer: "title = 'Lord of the Rings'" },
      { ask: "Which relation holds title?", answer: "Book." },
      {
        ask: "Do Book and Borrower share an attribute?",
        answer: "No.",
        why: "When the two ends do not touch, you have to trace a path through the relations between them."
      },
      {
        ask: "What is the join path?",
        answer: "Book →(ISBN) BookCopy →(copyNo) BookLoan →(borrowerNo) Borrower"
      },
      {
        ask: "Put it together.",
        answer:
          "Π_{borrowerName}(((σ_{title = 'Lord of the Rings'}(Book)) ⋈_{Book.ISBN = BookCopy.ISBN} BookCopy) ⋈_{BookCopy.copyNo = BookLoan.copyNo} BookLoan ⋈_{BookLoan.borrowerNo = Borrower.borrowerNo} Borrower)"
      }
    ]
  },
  {
    id: "hw1-q4g",
    topic: "multi-table",
    source: "professor",
    sourceNote: "Homework #1, Question 4(g)",
    difficulty: "stretch",
    kind: "expression",
    prompt:
      "List the names of borrowers with overdue books, taking today as 17 September 2026 (Exam 1).",
    context: { schemaId: "library" },
    referenceText:
      "Π_{borrowerName}((σ_{dateDue < '2026-09-17'}(BookLoan)) ⋈_{BookLoan.borrowerNo = Borrower.borrowerNo} Borrower)",
    available: ["BookLoan", "Borrower"],
    explanation:
      "dateDue lives in BookLoan and borrowerName lives in Borrower, so the relations join on " +
      "borrowerNo. 'Overdue on 17 September 2026' is dateDue < '2026-09-17'. A loan that is still " +
      "out but not yet due does not qualify — dropping the date filter returns every borrower " +
      "with a loan, which is a different question.",
    hints: [
      "What has to come OUT? borrowerName, in Borrower.",
      "What filters? dateDue < 2026-09-17, which is in BookLoan.",
      "Join them on borrowerNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "borrowerName" },
      { ask: "Which relation holds it?", answer: "Borrower." },
      {
        ask: "What condition filters the tuples?",
        answer: "dateDue < '2026-09-17'",
        why: "Overdue means the due date is strictly before today. ISO dates compare in order, so a string comparison is enough."
      },
      { ask: "Which relation holds dateDue?", answer: "BookLoan." },
      { ask: "What attribute connects BookLoan and Borrower?", answer: "borrowerNo" },
      {
        ask: "Put it together.",
        answer:
          "Π_{borrowerName}((σ_{dateDue < '2026-09-17'}(BookLoan)) ⋈_{BookLoan.borrowerNo = Borrower.borrowerNo} Borrower)"
      }
    ]
  }
];

// ── Lecture 2 concepts ────────────────────────────────────────────────────

const lectureConcepts: LabQuestion[] = [
  {
    id: "lec2-terminology",
    topic: "relational-terminology",
    source: "professor",
    sourceNote: "Lecture 2 — Relational Model Terminology",
    difficulty: "intro",
    kind: "choice",
    prompt: "Which statement about a relation in the relational model is correct?",
    options: [
      {
        text: "Each cell contains exactly one atomic value, and there are no duplicate tuples.",
        correct: true
      },
      {
        text: "The order of tuples is significant, because it determines how they are stored.",
        correct: false,
        note:
          "Lecture 2 states the opposite: the order of tuples has no significance, theoretically. How a real DBMS stores them is a separate matter."
      },
      {
        text: "The order of attributes is significant, so the first column is the key.",
        correct: false,
        note:
          "The order of attributes has no significance either. Which attribute is the key is a constraint, not a position."
      },
      {
        text: "A cell may hold a list of values as long as they come from the same domain.",
        correct: false,
        note: "Each cell holds exactly one atomic value. That is what 'atomic' means here."
      }
    ],
    explanation:
      "From Lecture 2: each cell contains exactly one atomic value, each attribute has a distinct " +
      "name, values of an attribute all come from the same domain, each tuple is distinct, and " +
      "neither attribute order nor tuple order carries significance.",
    hints: ["Four of the listed properties come straight from the 'Properties of Relations' slide."]
  },
  {
    id: "lec2-degree-cardinality",
    topic: "degree-cardinality",
    source: "professor",
    sourceNote: "Lecture 2 — Entity and Referential Integrity example",
    difficulty: "intro",
    kind: "shape",
    subject: "Branch",
    prompt: "What are the degree and cardinality of the Branch relation shown?",
    context: { relations: [branchRelation] },
    degree: 4,
    cardinality: 5,
    explanation:
      "Branch has four attributes — branchNo, street, city, postcode — so its degree is 4. It " +
      "holds five tuples, so its cardinality is 5. Degree counts columns; cardinality counts rows.",
    hints: ["Degree is the number of attributes. Cardinality is the number of tuples."]
  },
  {
    id: "lec2-keys",
    topic: "keys",
    source: "professor",
    sourceNote: "Lecture 2 — Relational Keys",
    difficulty: "core",
    kind: "choice",
    prompt: "What distinguishes a candidate key from a superkey?",
    options: [
      {
        text: "A candidate key is a superkey with no proper subset that is also a superkey.",
        correct: true
      },
      {
        text: "A candidate key is any set of attributes that uniquely identifies a tuple.",
        correct: false,
        mistake: "superkey-minimality",
        note:
          "That is the definition of a superkey. A candidate key adds irreducibility: no proper subset of it may have the uniqueness property."
      },
      {
        text: "A candidate key is the one chosen to identify tuples; the others are superkeys.",
        correct: false,
        mistake: "primary-vs-candidate-key",
        note:
          "The one chosen is the PRIMARY key. The candidate keys not chosen are alternate keys — still candidate keys, not merely superkeys."
      },
      {
        text: "A candidate key must be a single attribute; a superkey may be composite.",
        correct: false,
        mistake: "superkey-minimality",
        note:
          "A candidate key can perfectly well be composite — as long as no proper subset of it is unique on its own."
      }
    ],
    explanation:
      "Lecture 2 gives candidate keys two properties: uniqueness (the values identify the tuple) " +
      "and irreducibility (no proper subset has the uniqueness property). A superkey only has to " +
      "satisfy the first, so every candidate key is a superkey but not the reverse.",
    hints: ["Both definitions require uniqueness. Only one of them requires anything more."]
  },
  {
    id: "lec2-cartesian-domains",
    topic: "cartesian-product",
    source: "professor",
    sourceNote: "Lecture 2 — Mathematical Definition of Relation",
    difficulty: "intro",
    kind: "shape",
    subject: "D1 × D2",
    prompt:
      "D1 = {2, 4} and D2 = {1, 3, 5}. What are the degree and cardinality of the Cartesian product D1 × D2?",
    degree: 2,
    cardinality: 6,
    explanation:
      "Lecture 2's worked example: D1 × D2 = {(2,1), (2,3), (2,5), (4,1), (4,3), (4,5)}. Six ordered pairs, " +
      "each of degree 2. Cardinality multiplies (2 × 3 = 6); degree is the number of components in each pair.",
    hints: [
      "Every element of D1 is paired with every element of D2.",
      "Each pair has one value from D1 and one from D2, so the degree is 2."
    ]
  },
  {
    id: "lec2-null",
    topic: "integrity",
    source: "professor",
    sourceNote: "Lecture 2 — Integrity Constraints",
    difficulty: "intro",
    kind: "choice",
    prompt: "Which statement about NULL is the one Lecture 2 makes?",
    options: [
      {
        text: "NULL is the absence of a value; it is not the same as zero or spaces.",
        correct: true
      },
      {
        text: "NULL is stored as zero for numbers and as an empty string for text.",
        correct: false,
        mistake: "null-semantics",
        note: "Lecture 2 is explicit: NULL is the absence of a value, not the same as zero or spaces."
      },
      {
        text: "A primary key may be NULL when the rest of the tuple is known.",
        correct: false,
        mistake: "entity-vs-referential-integrity",
        note: "Entity integrity forbids that: in a base relation, no attribute of a primary key can be null."
      },
      {
        text: "Two NULLs compare as equal, so they group together.",
        correct: false,
        mistake: "null-semantics",
        note: "NULL is not equal to anything, including another NULL. A comparison involving NULL is unknown, and unknown is not true."
      }
    ],
    explanation:
      "Lecture 2 puts it in the margin of the integrity slide: NULL is the absence of a value, not the same as zero or spaces. Entity integrity then uses that fact — a primary key cannot be null.",
    hints: ["The slide contrasts NULL with zero and with spaces specifically."]
  },
  {
    id: "lec2-integrity-rules",
    topic: "integrity",
    source: "professor",
    sourceNote: "Lecture 2 — Integrity Constraints",
    difficulty: "core",
    kind: "choice",
    prompt: "What does referential integrity require of a foreign key?",
    options: [
      {
        text: "Its value must match a candidate-key value in the referenced relation, or be wholly null.",
        correct: true
      },
      {
        text: "Its value must never be null, and must match a candidate key in the referenced relation.",
        correct: false,
        mistake: "entity-vs-referential-integrity",
        note: "Wholly null is explicitly allowed. A null foreign key means 'not yet assigned', which is a legal state. Non-null is a requirement of entity integrity, and only for primary keys."
      },
      {
        text: "Its value may match any attribute in the referenced relation, not only a candidate key.",
        correct: false,
        note: "The match has to be against a candidate key of the home relation, not an arbitrary column."
      },
      {
        text: "Referential integrity is the rule that a primary key cannot be null.",
        correct: false,
        mistake: "entity-vs-referential-integrity",
        note: "That is entity integrity. Referential integrity is the foreign-key rule."
      }
    ],
    explanation:
      "Lecture 2: if a foreign key exists, its value must match a candidate-key value of some tuple in its home relation, or be wholly null. Entity integrity is the other rule — no attribute of a primary key can be null.",
    hints: ["One rule is about primary keys. The other is about foreign keys. Which sentence is this?"]
  },
  {
    id: "lec3-selection",
    topic: "selection",
    source: "professor",
    sourceNote: "Lecture 3 — Example: Selection",
    difficulty: "intro",
    kind: "shape",
    subject: "σ salary > 10000 (Staff)",
    prompt:
      "What are the degree and cardinality of σ salary > 10000 (Staff) over the Staff relation used in class?",
    context: { relations: [staffRelation] },
    degree: 8,
    cardinality: 4,
    explanation:
      "Lecture 3's worked example. Selection slices horizontally: the eight Staff attributes stay. " +
      "Four of the six staff have salary over 10,000 (SL21, SG37, SG14, SG5). SA9 and SL41 at 9,000 are dropped.",
    hints: [
      "σ does not change the columns. Count Staff's attributes for the degree.",
      "Walk the salary column and count who is strictly above 10,000."
    ]
  },
  {
    id: "lec3-projection-duplicates",
    topic: "projection",
    source: "professor",
    sourceNote: "Lecture 3 — Projection",
    difficulty: "core",
    kind: "choice",
    prompt: "What is the cardinality of Π city (Branch) over the Branch relation used in class?",
    context: { relations: [branchRelation] },
    options: [
      {
        text: "4 — London appears twice and collapses to one tuple",
        correct: true
      },
      {
        text: "5 — projection only drops columns, so the row count is unchanged",
        correct: false,
        mistake: "forgot-duplicate-elimination",
        note: "Π also eliminates duplicate tuples. B005 and B002 are both London, so they become one row once street, branchNo and postcode are gone."
      },
      {
        text: "1 — there is only one city attribute",
        correct: false,
        mistake: "degree-cardinality-swapped",
        note: "That confuses degree with cardinality. The result has degree 1 (the city column) and cardinality 4 (distinct cities)."
      },
      {
        text: "2 — London and everything else",
        correct: false,
        note: "The distinct cities are London, Aberdeen, Glasgow and Bristol — four of them."
      }
    ],
    explanation:
      "Branch has five tuples but only four distinct city values, because London appears on B005 and B002. After Π city the duplicates collapse, which is why Lecture 3 says projection eliminates duplicates.",
    hints: ["List the city of each Branch tuple, then strike out repeats."]
  },
  {
    id: "lec3-assistant",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Lecture 3 — in-class question",
    difficulty: "intro",
    kind: "expression",
    prompt: "List sex and DOB of staff whose position is Assistant.",
    context: { schemaId: "staff" },
    referenceText: "Π_{sex, DOB}(σ_{position = 'Assistant'}(Staff))",
    available: ["Staff"],
    explanation:
      "Lecture 3's in-class question. Both attributes and the filter live in Staff, so no join is required. " +
      "σ keeps Assistants; Π keeps sex and DOB. Projecting the extra column position first and selecting afterwards is equally correct.",
    hints: [
      "What has to come OUT? sex and DOB.",
      "What filters? position = 'Assistant'.",
      "All three live in Staff."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "sex, DOB" },
      { ask: "What conditions filter the tuples?", answer: "position = 'Assistant'" },
      { ask: "Which relation holds them?", answer: "Staff." },
      { ask: "Do we need a join?", answer: "No." },
      { ask: "Put it together.", answer: "Π_{sex, DOB}(σ_{position = 'Assistant'}(Staff))" }
    ]
  },
  {
    id: "lec3-union",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Lecture 3 — Example: Union",
    difficulty: "core",
    kind: "expression",
    prompt: "List all cities where there is either a branch office or a property for rent.",
    context: { schemaId: "dreamhome" },
    referenceText: "Π_{city}(Branch) ∪ Π_{city}(PropertyForRent)",
    available: ["Branch", "PropertyForRent"],
    explanation:
      "Lecture 3's union example. Both operands must be union-compatible — same degree, same domains — so each side is projected to city first. Union then keeps every distinct city that appears on either side. A join would pair rows, which this question does not ask for.",
    hints: [
      "The word 'or' between two sets of cities is a union, not a join.",
      "Project both relations down to city so they have the same schema, then ∪."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "city" },
      {
        ask: "Which relations hold a city?",
        answer: "Branch and PropertyForRent.",
        why: "The question is 'either a branch office or a property' — two sources, one column."
      },
      {
        ask: "Do we join them?",
        answer: "No. We want the set of cities, not paired rows.",
        why: "Union requires union-compatible operands, so project each to city first."
      },
      { ask: "Put it together.", answer: "Π_{city}(Branch) ∪ Π_{city}(PropertyForRent)" }
    ]
  },
  {
    id: "lec4-product-shape",
    topic: "cartesian-product",
    source: "professor",
    sourceNote: "Lecture 4 — Cartesian product",
    difficulty: "intro",
    kind: "shape",
    subject: "R X S",
    prompt:
      "R has 6 tuples and 4 attributes. S has 6 tuples and 4 attributes. What are the degree and cardinality of R X S?",
    degree: 8,
    cardinality: 36,
    explanation:
      "Lecture 4 states it directly: I tuples with N attributes and J tuples with M attributes " +
      "give I × J tuples with N + M attributes. So 6 × 6 = 36 tuples and 4 + 4 = 8 attributes.",
    hints: ["Cardinality multiplies. Degree adds. They do not combine the same way."]
  },
  {
    id: "lec4-join-identity",
    topic: "equijoin",
    source: "professor",
    sourceNote: "Lecture 4 — Theta join",
    difficulty: "core",
    kind: "choice",
    prompt: "Which identity does Lecture 4 give for a theta join?",
    options: [
      {
        text: "R ⋈_F S = σ_F(R X S)",
        correct: true
      },
      {
        text: "R ⋈_F S = Π_F(R X S)",
        correct: false,
        mistake: "selection-for-projection",
        note: "The filter is a selection, not a projection. Π would pick columns, not decide which pairs survive."
      },
      {
        text: "R ⋈_F S = R X S — the join condition is optional documentation",
        correct: false,
        mistake: "filter-vs-join-condition",
        note: "Without σ_F the product keeps every pairing. The identity exists precisely because the join is the filtered product."
      },
      {
        text: "R ⋈_F S = R ∪ S",
        correct: false,
        note: "Union requires union-compatible relations and does not pair tuples at all."
      }
    ],
    explanation:
      "Lecture 4: a theta join can be rewritten using the fundamental operations as a selection over a Cartesian product. When F uses only equality, the join is called an equijoin, and both copies of the joining attribute stay.",
    hints: ["The compact form is a join. The long form is σ around a product."]
  },
  {
    id: "lec4-difference",
    topic: "writing-expressions",
    source: "professor",
    sourceNote: "Lecture 4 — Example: Set difference",
    difficulty: "core",
    kind: "expression",
    prompt: "List all cities where there is a branch office but no property for rent.",
    context: { schemaId: "dreamhome" },
    referenceText: "Π_{city}(Branch) − Π_{city}(PropertyForRent)",
    available: ["Branch", "PropertyForRent"],
    explanation:
      "Lecture 4's set-difference example. Project both relations to city, then subtract: cities in the first set that are not in the second. Bristol is the one that remains on the class instance. A left outer join would keep property columns padded with NULL; the question asked only for cities.",
    hints: [
      "'But no' between two sets of cities is a difference, not an outer join.",
      "Project both to city first so the operands are union-compatible."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "city" },
      {
        ask: "What does 'but no property for rent' mean as a set operation?",
        answer: "Cities of Branch, minus cities of PropertyForRent.",
        why: "Difference keeps values in the first set that are absent from the second."
      },
      { ask: "Put it together.", answer: "Π_{city}(Branch) − Π_{city}(PropertyForRent)" }
    ]
  },
  {
    id: "lec5-semijoin-rewrite",
      topic: "semijoin",
      source: "professor",
      sourceNote: "Lecture 5 — Semijoin",
      difficulty: "core",
      kind: "choice",
      prompt: "Lecture 5 rewrites the semijoin as which expression? R ▷_F S =",
      options: [
        {
          text: "Π_A(R ⋈_F S), where A is the set of all attributes of R",
          correct: true
        },
        {
          text: "Π_A(R ⋈_F S), where A is the set of all attributes of S",
          correct: false,
          mistake: "semijoin-wrong-relation",
          note: "The projection is over R's attributes. S decides who qualifies and then disappears."
        },
        {
          text: "R ⟕_F S — a left outer join is the same thing",
          correct: false,
          mistake: "outer-join-drops-unmatched",
          note: "A left outer join keeps unmatched R tuples, padded with NULL. A semijoin drops them, and also drops S's attributes."
        },
        {
          text: "R X S — then keep R's columns",
          correct: false,
          mistake: "filter-vs-join-condition",
          note: "Without the join condition every R tuple would survive, because the product pairs everyone with everyone. The F in ▷_F is not optional."
        }
      ],
      explanation:
        "Lecture 5: the semijoin performs a join and then projects over the attributes of the first operand. That is why R ▷ S has R's schema and why unmatched tuples of R disappear rather than being padded.",
      hints: ["Join first, then keep whose columns?"]
    },
    {
      id: "lec5-natural-clients",
      topic: "writing-expressions",
      source: "professor",
      sourceNote: "Lecture 5 — Example: Natural join",
      difficulty: "core",
      kind: "expression",
      prompt: "List the names and comments of all clients who have viewed a property for rent.",
      context: { schemaId: "dreamhome" },
      referenceText:
        "Π_{fName, lName, comment}((Π_{clientNo, fName, lName}(Client)) ⋈ (Π_{clientNo, propertyNo, comment}(Viewing)))",
      available: ["Client", "Viewing"],
      explanation:
        "Lecture 5's natural-join example. fName and lName are Client attributes; comment is a Viewing attribute. Project each relation down to the attributes you need (including the join key clientNo), natural-join on that common attribute, then project the requested columns. Clients with no viewing disappear — this is an inner join.",
      hints: [
        "What has to come OUT? fName, lName, comment.",
        "fName and lName live in Client; comment lives in Viewing. They share clientNo.",
        "Lecture 5 projects each side first, then natural-joins, then projects the result."
      ],
      walkthrough: [
        { ask: "What attributes must be output?", answer: "fName, lName, comment" },
        {
          ask: "Which relation holds the names?",
          answer: "Client.",
          why: "Viewing only has clientNo, propertyNo, viewDate and comment."
        },
        {
          ask: "Which relation holds the comments?",
          answer: "Viewing."
        },
        {
          ask: "What attribute connects them?",
          answer: "clientNo — the only name they share, so a natural join matches on it automatically."
        },
        {
          ask: "Put it together.",
          answer:
            "Π_{fName, lName, comment}((Π_{clientNo, fName, lName}(Client)) ⋈ (Π_{clientNo, propertyNo, comment}(Viewing)))"
        }
      ]
    },
    {
      id: "lec5-left-outer-viewings",
      topic: "outer-join-left",
      source: "professor",
      sourceNote: "Lecture 5 — Example: Left outer join",
      difficulty: "core",
      kind: "expression",
      prompt:
        "Produce a status report on property viewings: every property's number, street and city, together with viewing details where they exist.",
      context: { schemaId: "dreamhome" },
      referenceText:
        "(Π_{propertyNo, street, city}(PropertyForRent)) ⟕ Viewing",
      available: ["PropertyForRent", "Viewing"],
      explanation:
        "Lecture 5: a left outer join includes every unmatched tuple from the left-hand relation, padding the right with nulls. Project PropertyForRent down to propertyNo, street and city first, then left-outer-join Viewing so properties that nobody viewed still appear — with NULLs for clientNo, viewDate and comment. An inner join would drop those properties, which is not a status report.",
      hints: [
        "A status report has to include properties with no viewings.",
        "That is what a LEFT outer join is for: preserve the left relation.",
        "The common attribute is propertyNo, so the join can be written without a subscript."
      ],
      walkthrough: [
        {
          ask: "What attributes must be output?",
          answer: "propertyNo, street, city, plus whatever Viewing contributes."
        },
        {
          ask: "Do unmatched properties have to survive?",
          answer: "Yes — a status report includes properties nobody viewed.",
          why: "That is the definition of a left outer join: keep every tuple of the left relation."
        },
        {
          ask: "What attribute connects PropertyForRent and Viewing?",
          answer: "propertyNo"
        },
        {
          ask: "Put it together.",
          answer: "(Π_{propertyNo, street, city}(PropertyForRent)) ⟕ Viewing"
        }
      ]
    },
    {
      id: "lec5-semijoin-glasgow",
      topic: "writing-expressions",
      source: "professor",
      sourceNote: "Lecture 5 — Example: Semijoin",
      difficulty: "core",
      kind: "expression",
      prompt: "List complete details of all staff who work at the branch in Glasgow.",
      context: { schemaId: "staff" },
      referenceText:
        "Staff ▷_{Staff.branchNo = Branch.branchNo} (σ_{city = 'Glasgow'}(Branch))",
      available: ["Staff", "Branch"],
      explanation:
        "Lecture 5's semijoin example. 'Complete details of staff' means Staff's full schema, so the result cannot carry Branch columns. City lives in Branch, so Branch decides which staff qualify and then disappears: Staff ▷ (σ city = 'Glasgow' (Branch)). An equijoin would attach the Glasgow branch's street and postcode, which the question did not ask for.",
      hints: [
        "'Complete details of staff' is every Staff attribute — no Branch columns.",
        "city is in Branch, so Branch is the relation that decides who qualifies.",
        "That is a semijoin: join, then keep only the first operand's attributes."
      ],
      walkthrough: [
        {
          ask: "What attributes must be output?",
          answer: "Every attribute of Staff.",
          why: "'Complete details' means the whole Staff tuple, not a projection."
        },
        { ask: "What condition filters the tuples?", answer: "city = 'Glasgow'" },
        {
          ask: "Which relation holds city?",
          answer: "Branch.",
          why: "Staff has no city attribute. Reaching for one there is the usual miss."
        },
        { ask: "What attribute connects Staff and Branch?", answer: "branchNo" },
        {
          ask: "Whose attributes survive?",
          answer: "Staff's only — Branch disappears after deciding who qualifies.",
          why: "That is exactly what a semijoin returns."
        },
        {
          ask: "Put it together.",
          answer: "Staff ▷_{Staff.branchNo = Branch.branchNo} (σ_{city = 'Glasgow'}(Branch))"
        }
      ]
    },
    {
      id: "lec5-division-viewing",
    topic: "division",
    source: "professor",
    sourceNote: "Lecture 5 — Example: Division",
    difficulty: "core",
    kind: "choice",
    multiple: true,
    prompt:
      "Using the DreamHome instance from class, which client numbers appear in Π clientNo, propertyNo (Viewing) ÷ Π propertyNo (σ rooms = 3 (PropertyForRent))?",
    context: {
      relations: [
        project(viewingRelation, ["clientNo", "propertyNo"]).relation,
        project(
          select(propertyForRentRelation, compare(attr("rooms"), "=", lit(3))).relation,
          ["propertyNo"]
        ).relation
      ],
      schemaId: "dreamhome",
      note: "Select every client who viewed EVERY three-room property. Extra viewings do not disqualify a client."
    },
    options: lectureDivisionOptions(),
    explanation:
      "Lecture 5's worked example: clients who have viewed all properties with three rooms. The three-room properties are PG4 and PG36. CR56 viewed both (and also PA14, which is extra and irrelevant). CR76 viewed only PG4. CR62 viewed only PA14. Division means for all, so only CR56 qualifies.",
    hints: [
      "First list the property numbers with rooms = 3. That is the divisor.",
      "Then, for each client, tick off which of those properties they viewed. Extra properties do not matter."
    ]
  }
];

function lectureDivisionOptions() {
  const dividend = project(viewingRelation, ["clientNo", "propertyNo"]).relation;
  const divisor = project(
    select(propertyForRentRelation, compare(attr("rooms"), "=", lit(3))).relation,
    ["propertyNo"]
  ).relation;
  const { relation: quotient, trace } = divide(dividend, divisor);
  const qualifying = new Set(quotient.tuples.map((tuple) => String(tuple[0])));
  return trace.candidates.map((candidate, index) => {
    const value = String(candidate[0]);
    const covered = trace.coverageByCandidate[index].filter(Boolean).length;
    const isCorrect = qualifying.has(value);
    return {
      text: value,
      correct: isCorrect,
      mistake: isCorrect ? undefined : ("division-any-not-all" as const),
      note: isCorrect
        ? undefined
        : `${value} is paired with ${covered} of the ${divisor.tuples.length} required three-room properties. Division means for all.`
    };
  });
}

import { STUDY_GUIDE_QUESTIONS } from "./study-guide-questions";

export const SOURCE_QUESTIONS: LabQuestion[] = [
  ...STUDY_GUIDE_QUESTIONS,
  ...homeworkOne,
  divisionQuestion,
  ...homeworkTwo,
  ...homeworkThree,
  ...homeworkFour,
  {
    id: "sg-hotel-suite",
    topic: "writing-expressions",
    source: "generated",
    sourceNote: "Written for practice, modelled on the Lecture 5 worked example",
    difficulty: "core",
    kind: "expression",
    prompt: "List the hotel names of hotels that have a Suite costing more than 150.",
    context: { schemaId: "hotel" },
    referenceText:
      "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = 'Suite' ∧ price > 150}(Room)))",
    available: ["Hotel", "Room"],
    explanation:
      "hotelName is in Hotel; type and price are in Room. Both filters apply to Room, so they combine with ∧ inside one σ. The relations join on hotelNo. Missing either condition, or filtering city from the wrong relation, produces a different set of hotels.",
    hints: [
      "What has to come OUT? hotelName, which lives in Hotel.",
      "Two conditions, both Room attributes: type = 'Suite' and price > 150.",
      "Connect Hotel and Room on hotelNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "hotelName" },
      {
        ask: "Which table contains hotelName?",
        answer: "Hotel.",
        why: "Room has no name attribute — only roomNo, hotelNo, type and price."
      },
      {
        ask: "What conditions are present?",
        answer: "type = 'Suite' and price > 150"
      },
      {
        ask: "Which table contains type and price?",
        answer: "Room.",
        why: "They are both Room attributes, so a single σ over Room handles both with ∧."
      },
      { ask: "Do we need more than one table?", answer: "Yes — the output and the filters live in different relations." },
      { ask: "Which attribute joins Hotel and Room?", answer: "hotelNo" },
      {
        ask: "Put it together.",
        answer:
          "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{type = 'Suite' ∧ price > 150}(Room)))"
      }
    ]
  },
  ...lectureConcepts
];

export function sourceQuestionsForTopic(topic: string): LabQuestion[] {
  return SOURCE_QUESTIONS.filter((question) => question.topic === topic);
}
