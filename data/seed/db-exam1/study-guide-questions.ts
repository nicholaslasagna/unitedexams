/**
 * The photographed class study guide.
 *
 * Three sheets, reproduced as practice:
 *
 *   1. the Album / RecordLabel join exercise, whose seven tasks run from
 *      equijoin through to a *theta* join — the only place in the supplied
 *      material where a join predicate is not an equality;
 *   2. the Class Practice Activity's Question 2, six expressions to read back
 *      into English;
 *   3. its Question 3, seven queries to write, including one that only works
 *      as an outer join.
 *
 * Every result table is computed by the evaluator. Nothing here is a
 * transcribed answer, so none of it can drift away from the engine that
 * grades the learner.
 */

import { attr, compare, lit, and } from "@/lib/relational-algebra/condition";
import {
  naturalJoin,
  outerJoin,
  semijoin,
  thetaJoin
} from "@/lib/relational-algebra/operations";
import type { Relation } from "@/lib/relational-algebra/relation";
import type { LabQuestion, RowCandidate } from "@/features/db-exam1/question-model";
import { albumRelation, recordLabelRelation, HOTEL_TODAY } from "./relations";

// ── Sheet 1: Album / RecordLabel ──────────────────────────────────────────

const LABEL_MATCH = compare(attr("Album.labelCode"), "=", attr("RecordLabel.labelCode"));

const THETA = and(
  LABEL_MATCH,
  compare(attr("sales"), ">=", attr("minSalesTarget"))
);

const MUSIC_CONTEXT = {
  relations: [albumRelation, recordLabelRelation],
  note: "The only attribute name shared by both relations is labelCode."
};

function musicRows(
  base: Omit<Extract<LabQuestion, { kind: "rows" }>, "kind" | "attributes" | "candidates">,
  result: Relation,
  distractors: RowCandidate[] = []
): LabQuestion {
  return {
    ...base,
    kind: "rows",
    attributes: result.attributes,
    candidates: [
      ...result.tuples.map((values) => ({ values, inResult: true })),
      ...distractors.filter((candidate) => candidate.values.length === result.attributes.length)
    ]
  };
}

const albumEquijoin = thetaJoin(albumRelation, recordLabelRelation, LABEL_MATCH).relation;
const albumNatural = naturalJoin(albumRelation, recordLabelRelation).relation;
const albumLeft = outerJoin(albumRelation, recordLabelRelation, "left", LABEL_MATCH).relation;
const albumRight = outerJoin(albumRelation, recordLabelRelation, "right", LABEL_MATCH).relation;
const albumFull = outerJoin(albumRelation, recordLabelRelation, "full", LABEL_MATCH).relation;
const albumSemi = semijoin(albumRelation, recordLabelRelation, LABEL_MATCH).relation;
const albumTheta = thetaJoin(albumRelation, recordLabelRelation, THETA).relation;

const musicTasks: LabQuestion[] = [
  musicRows(
    {
      id: "sg-music-1",
      topic: "equijoin",
      source: "study-guide",
      sourceNote: "Class study guide — Task 1, Equijoin",
      difficulty: "core",
      prompt: "Select every tuple in this equijoin.",
      context: {
        ...MUSIC_CONTEXT,
        expression: "Album ⋈_{Album.labelCode = RecordLabel.labelCode} RecordLabel"
      },
      explanation:
        "L1 and L2 appear in both relations. L1 carries two albums (A1 and A2) and one label, giving " +
        "two rows; L2 carries one of each, giving one — three rows in total. A4 has labelCode L9, " +
        "which no label uses, so it contributes nothing. The equijoin keeps both copies of labelCode, " +
        "so the degree is 4 + 4 = 8.",
      hints: [
        "Find the labelCode values that appear in both relations.",
        "A4's L9 is not one of them, and L3 and L4 have no albums."
      ]
    },
    albumEquijoin,
    [
      {
        values: ["A4", "Drift", "L9", 45000, null, null, null, null],
        inResult: false,
        mistake: "inner-join-pads-unmatched",
        note:
          "A4's label L9 does not exist in RecordLabel. An equijoin drops an unmatched tuple rather than padding it — only an outer join pads with NULL."
      },
      {
        values: ["A2", "Echoes", "L1", 35000, "L2", "NorthStar", "Canada", 70000],
        inResult: false,
        mistake: "wrong-join-attributes",
        note:
          "A2 carries L1 and NorthStar is L2, so these two never pair. Tuples join on the value of labelCode, not on their position in the table."
      }
    ]
  ),

  musicRows(
    {
      id: "sg-music-2",
      topic: "natural-join",
      source: "study-guide",
      sourceNote: "Class study guide — Task 2, Natural join",
      difficulty: "core",
      prompt: "Select every tuple in this natural join.",
      context: {
        ...MUSIC_CONTEXT,
        expression: "Album ⋈ RecordLabel"
      },
      explanation:
        "labelCode is the only attribute name the two relations share, so it is the attribute the " +
        "natural join matches on — there is no predicate to write. The same three tuples as the " +
        "equijoin come through, with one copy of labelCode eliminated, so the degree falls from 8 to 7.",
      hints: [
        "The study guide tells you the shared attribute name outright: labelCode.",
        "Start from the equijoin, then remove the duplicate column."
      ]
    },
    albumNatural
  ),

  musicRows(
    {
      id: "sg-music-3",
      topic: "outer-join-left",
      source: "study-guide",
      sourceNote: "Class study guide — Task 3, Left outer join",
      difficulty: "core",
      prompt: "Select every tuple in this left outer join.",
      context: {
        ...MUSIC_CONTEXT,
        expression: "Album ⟕_{Album.labelCode = RecordLabel.labelCode} RecordLabel"
      },
      explanation:
        "A left outer join preserves every tuple of Album. The three matching rows come through as " +
        "before, and A4 — whose label L9 does not exist — is kept with NULLs across all four of " +
        "RecordLabel's attributes. Four rows. RedStone and Moonlight have no albums and do not " +
        "appear: this join does not preserve the right-hand relation.",
      hints: [
        "Every album survives a LEFT outer join, matched or not.",
        "Labels with no albums are a different question — they need a right or full outer join."
      ]
    },
    albumLeft,
    [
      {
        values: [null, null, null, null, "L3", "RedStone", "UK", 40000],
        inResult: false,
        mistake: "outer-join-side",
        note:
          "RedStone is unmatched on the RIGHT. A left outer join preserves Album, the left relation — keeping RedStone takes a right or full outer join."
      }
    ]
  ),

  musicRows(
    {
      id: "sg-music-4",
      topic: "outer-join-right",
      source: "study-guide",
      sourceNote: "Class study guide — Task 4, Right outer join",
      difficulty: "core",
      prompt: "Select every tuple in this right outer join.",
      context: {
        ...MUSIC_CONTEXT,
        expression: "Album ⟖_{Album.labelCode = RecordLabel.labelCode} RecordLabel"
      },
      explanation:
        "A right outer join preserves every tuple of RecordLabel. The three matching rows, plus " +
        "RedStone (L3) and Moonlight (L4) — labels with no albums — padded with NULLs across " +
        "Album's attributes. Five rows. A4 does NOT appear: it is unmatched on the left, and the " +
        "left relation is not the one being preserved.",
      hints: [
        "Every label survives, including the two with no albums.",
        "A4 is an unmatched Album tuple — ask yourself whether this join preserves Album."
      ]
    },
    albumRight,
    [
      {
        values: ["A4", "Drift", "L9", 45000, null, null, null, null],
        inResult: false,
        mistake: "outer-join-side",
        note:
          "A4 is unmatched on the LEFT. A right outer join preserves RecordLabel, so this row belongs to the left or full outer join instead."
      }
    ]
  ),

  musicRows(
    {
      id: "sg-music-5",
      topic: "outer-join-full",
      source: "study-guide",
      sourceNote: "Class study guide — Task 5, Full outer join",
      difficulty: "core",
      prompt:
        "Select every tuple in this full outer join.",
      context: {
        ...MUSIC_CONTEXT,
        expression: "Album ⟗_{Album.labelCode = RecordLabel.labelCode} RecordLabel"
      },
      explanation:
        "Three matching rows, plus the unmatched tuples from both sides: A4 padded on the right, " +
        "RedStone and Moonlight padded on the left. Six rows. Note that a Cartesian product of these " +
        "relations would have 4 × 4 = 16 rows — a full outer join still only pairs tuples that satisfy " +
        "the condition.",
      hints: [
        "Take the matching rows, then add the unmatched tuples from BOTH relations.",
        "Six rows, not sixteen. An outer join is not a Cartesian product."
      ]
    },
    albumFull
  ),

  musicRows(
    {
      id: "sg-music-6",
      topic: "semijoin",
      source: "study-guide",
      sourceNote: "Class study guide — Task 6, Semijoin",
      difficulty: "core",
      prompt:
        "Select every tuple in this semijoin.",
      context: {
        ...MUSIC_CONTEXT,
        expression: "Album ▷_{Album.labelCode = RecordLabel.labelCode} RecordLabel"
      },
      explanation:
        "The semijoin returns the tuples of Album that have at least one matching label, and only " +
        "Album's attributes — degree 4, not 8. A1, A2 and A3 qualify; A4 does not, because L9 is not " +
        "a label. No label columns appear anywhere in the result.",
      hints: [
        "Do the join, then keep only the left relation's columns.",
        "RecordLabel decides which albums qualify and then disappears."
      ]
    },
    albumSemi,
    [
      {
        values: ["L1", "BlueWave", "USA", 50000],
        inResult: false,
        mistake: "semijoin-wrong-relation",
        note:
          "This is a RecordLabel tuple. Album ▷ RecordLabel returns Album's attributes only — the right relation's job is to filter, not to contribute columns."
      },
      {
        values: ["A4", "Drift", "L9", 45000],
        inResult: false,
        mistake: "semijoin-direction",
        note: "A4's label L9 has no matching tuple in RecordLabel, so A4 does not qualify."
      }
    ]
  ),

  musicRows(
    {
      id: "sg-music-7",
      topic: "equijoin",
      source: "study-guide",
      sourceNote: "Class study guide — Task 7, Theta join",
      difficulty: "stretch",
      prompt:
        "Perform a theta join on Album.labelCode = RecordLabel.labelCode AND Album.sales ≥ RecordLabel.minSalesTarget. Which albums meet their label's sales target?",
      context: MUSIC_CONTEXT,
      explanation:
        "This is a theta join, not an equijoin: one of its two comparisons is ≥ rather than =. " +
        "Both comparisons have to hold. Sunrise sold 60,000 against BlueWave's target of 50,000 and " +
        "qualifies; Horizon sold 80,000 against NorthStar's 70,000 and qualifies; Echoes sold only " +
        "35,000 against the same 50,000 target and does not. Drift never gets as far as the sales " +
        "test — its label does not exist, so the first comparison already fails.",
      hints: [
        "Two comparisons joined by AND. Work out the matching pairs first, then apply the sales test to each.",
        "Both comparisons here compare an Album attribute with a RecordLabel attribute, which is what makes them join conditions rather than filters."
      ]
    },
    albumTheta,
    [
      {
        values: ["A2", "Echoes", "L1", 35000, "L1", "BlueWave", "USA", 50000],
        inResult: false,
        mistake: "missing-condition",
        note:
          "A2 does pair with BlueWave on labelCode, but 35,000 is below BlueWave's 50,000 target, so the second comparison fails. Both halves of the predicate have to hold."
      }
    ]
  )
];

// ── Sheet 2: Class Practice Activity, Question 2 ──────────────────────────

const HOTEL_SCHEMA = { schemaId: "hotel" as const };

const practiceReading: LabQuestion[] = [
  {
    id: "sg-cpa-2a",
    topic: "projection",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 2(a)",
    difficulty: "intro",
    kind: "choice",
    prompt: "Describe the relation this expression produces.",
    context: { ...HOTEL_SCHEMA, expression: "Π_{hotelNo}(σ_{price > 50}(Room))" },
    options: [
      {
        text:
          "The hotel numbers of hotels that have at least one room costing more than 50, each listed once.",
        correct: true
      },
      {
        text: "The hotel number of every room costing more than 50, one row per room.",
        correct: false,
        mistake: "forgot-duplicate-elimination",
        note:
          "Projection eliminates duplicate tuples. A hotel with three expensive rooms still appears once, because the result is a relation and a relation is a set."
      },
      {
        text: "The full details of every room costing more than 50.",
        correct: false,
        mistake: "selection-for-projection",
        note:
          "σ chooses the rows; the Π around it then keeps only hotelNo. Room details do not survive the projection."
      },
      {
        text: "The names of hotels that have a room costing more than 50.",
        correct: false,
        mistake: "wrong-relation-for-attribute",
        note:
          "hotelName is in Hotel, and this expression never touches Hotel. Only Room's hotelNo values come back."
      }
    ],
    explanation:
      "Read it inside out. σ price > 50 (Room) keeps the expensive rooms; Π hotelNo then keeps one " +
      "column and removes duplicates. The result has degree 1 and holds each qualifying hotel number once.",
    hints: [
      "Evaluate the innermost bracket first.",
      "Then ask what Π does beyond dropping columns — it also removes duplicate tuples."
    ]
  },
  {
    id: "sg-cpa-2c",
    topic: "reading-expressions",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 2(c)",
    difficulty: "core",
    kind: "choice",
    prompt: "Describe the relation this expression produces.",
    context: {
      ...HOTEL_SCHEMA,
      expression:
        "Π_{hotelName}(Hotel ⋈_{Hotel.hotelNo = Room.hotelNo} (σ_{price > 50}(Room)))"
    },
    options: [
      {
        text: "The names of hotels that have at least one room costing more than 50.",
        correct: true
      },
      {
        text: "The name of every hotel, with its expensive rooms listed alongside.",
        correct: false,
        mistake: "selection-for-projection",
        note:
          "The final Π keeps hotelName and nothing else. No room details survive, and hotels with no expensive room are dropped by the join."
      },
      {
        text: "The names of all hotels, with NULLs where a hotel has no room over 50.",
        correct: false,
        mistake: "outer-join-drops-unmatched",
        note:
          "This is an ordinary join, not an outer join. A hotel with no matching room produces no row at all."
      },
      {
        text: "The names and prices of every room costing more than 50.",
        correct: false,
        mistake: "wrong-relation-for-attribute",
        note: "price is projected away, and hotelName belongs to Hotel rather than to Room."
      }
    ],
    explanation:
      "Compare this with the semijoin form: both pick out the same hotels, but the semijoin returns " +
      "the whole Hotel tuple while this projects down to hotelName alone. The join is what brings the " +
      "name and the price into the same relation in the first place.",
    hints: [
      "Work outward: the filtered rooms, then the join, then the projection.",
      "Ask what happens to a hotel whose rooms are all cheap."
    ]
  },
  {
    id: "sg-cpa-2d",
    topic: "outer-join-left",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 2(d)",
    difficulty: "core",
    kind: "choice",
    prompt: "Describe the relation this expression produces.",
    context: {
      ...HOTEL_SCHEMA,
      expression: "Guest ⟕ (σ_{dateTo ≥ '2007-01-01'}(Booking))"
    },
    options: [
      {
        text:
          "Every guest, paired with their bookings ending on or after 1 Jan 2007 — and guests with no such booking still appear, padded with NULLs.",
        correct: true
      },
      {
        text: "Only the guests who have a booking ending on or after 1 Jan 2007.",
        correct: false,
        mistake: "outer-join-drops-unmatched",
        note:
          "That would be an ordinary join, or a semijoin. Preserving the unmatched guests is exactly what makes this an outer join."
      },
      {
        text: "Every booking ending on or after 1 Jan 2007, including ones with no matching guest.",
        correct: false,
        mistake: "outer-join-side",
        note:
          "That is the RIGHT outer join. Guest is written on the left, so it is Guest that is preserved."
      },
      {
        text: "Every guest paired with every qualifying booking.",
        correct: false,
        mistake: "outer-join-as-product",
        note:
          "An outer join still only pairs tuples that match — here on the common attribute guestNo. Pairing everything with everything is the Cartesian product."
      }
    ],
    explanation:
      "No subscript is given, so this is a natural outer join over the attribute the two relations " +
      "share: guestNo. The left operand is preserved, so every guest appears at least once; a guest " +
      "with no qualifying booking gets NULLs across all of Booking's attributes.\n\n" +
      "Decode the glyph rather than memorising the answer: the bar sits on the side that is " +
      "preserved. ⟕ keeps the left relation, ⟖ keeps the right, ⟗ keeps both. If the version you " +
      "meet writes ⟖ here, the answer flips to \u201Cevery qualifying booking, with guest details " +
      "where they exist\u201D — the next question drills exactly that.",
    hints: [
      "Which side of the bowtie carries the bar? That is the side that is preserved.",
      "With no subscript, the join matches on the attribute name both relations share."
    ]
  },
  {
    // The photographed glyph is small, and ⟕ / ⟖ differ by which side the bar
    // sits on. Rather than rely on one reading of the photo, the mirrored
    // form is drilled too — a learner who can decode the glyph answers either.
    id: "sg-cpa-2d-mirror",
    topic: "outer-join-right",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 2(d), mirrored form",
    difficulty: "core",
    kind: "choice",
    prompt:
      "Same expression with the bar on the other side. Describe the relation this produces.",
    context: {
      ...HOTEL_SCHEMA,
      expression: "Guest ⟖ (σ_{dateTo ≥ '2007-01-01'}(Booking))"
    },
    options: [
      {
        text:
          "Every booking ending on or after 1 Jan 2007, with the guest's details attached — and any such booking whose guest is missing still appears, padded with NULLs.",
        correct: true
      },
      {
        text:
          "Every guest, with their qualifying bookings, and guests with no such booking padded with NULLs.",
        correct: false,
        mistake: "outer-join-side",
        note:
          "That is the LEFT outer join. The bar has moved to the right side of the bowtie, so it is the bookings that are now preserved and guests with no qualifying booking drop out."
      },
      {
        text: "Only the bookings whose guest exists in Guest.",
        correct: false,
        mistake: "outer-join-drops-unmatched",
        note:
          "That is an ordinary join. Preserving unmatched tuples on the named side is what makes this an outer join."
      },
      {
        text: "Every guest paired with every qualifying booking.",
        correct: false,
        mistake: "outer-join-as-product",
        note:
          "Still only matching tuples are paired. Pairing everything with everything is the Cartesian product."
      }
    ],
    explanation:
      "The side named is the side preserved — that is the whole rule, and it is the only thing that " +
      "changes between this question and the previous one. ⟖ preserves the right operand, so every " +
      "qualifying booking survives and a guest with no qualifying booking does not appear at all. " +
      "Referential integrity means a booking's guest always exists in practice, so the NULL padding " +
      "is theoretical here; the point being tested is which side survives.",
    hints: [
      "Compare this with the previous question. Only the bar has moved.",
      "Ask which relation is guaranteed to appear in full."
    ]
  },
  {
    id: "sg-cpa-2f",
    topic: "division",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 2(f)",
    difficulty: "stretch",
    kind: "choice",
    prompt: "Describe the relation this expression produces.",
    context: {
      ...HOTEL_SCHEMA,
      expression:
        "Π_{guestName, hotelNo}(Booking ⋈_{Booking.guestNo = Guest.guestNo} Guest) ÷ Π_{hotelNo}(σ_{city = 'London'}(Hotel))"
    },
    options: [
      {
        text: "The names of guests who have booked at every London hotel.",
        correct: true
      },
      {
        text: "The names of guests who have booked at any London hotel.",
        correct: false,
        mistake: "division-any-not-all",
        note:
          "Division means for all. A guest qualifies only if they have booked at EVERY hotel in the divisor, not at one of them."
      },
      {
        text: "The names of guests who have booked only at London hotels and nowhere else.",
        correct: false,
        mistake: "division-extra-pairings",
        note:
          "Bookings outside the divisor are simply ignored. A guest who has also stayed in Glasgow still qualifies, as long as every London hotel is covered."
      },
      {
        text: "The names and hotel numbers of guests who have booked in London.",
        correct: false,
        mistake: "division-result-schema",
        note:
          "The divisor's attribute is removed by the division. If the dividend is over {guestName, hotelNo} and the divisor over {hotelNo}, the result is over {guestName} alone."
      }
    ],
    explanation:
      "The dividend pairs each guest's name with every hotel they have booked. The divisor is the set " +
      "of London hotel numbers. Division keeps the guestName values paired with all of them, and the " +
      "result is over the attributes the divisor does not have — guestName alone.",
    hints: [
      "Division answers a 'for all' question. Identify the dividend, the divisor, and what is left over.",
      "Result schema = dividend attributes minus divisor attributes."
    ]
  }
];

// ── Sheet 3: Class Practice Activity, Question 3 ──────────────────────────

const practiceWriting: LabQuestion[] = [
  {
    id: "sg-cpa-3a",
    topic: "relational-terminology",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(a)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List all hotels.",
    context: HOTEL_SCHEMA,
    referenceText: "Hotel",
    available: ["Hotel"],
    explanation:
      "No operator is needed. The question asks for the whole relation, and Hotel already is that " +
      "relation — wrapping it in a projection of all its attributes would be correct but redundant.",
    hints: ["Ask what has to be filtered or dropped. Here, nothing."],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "All of them — hotelNo, hotelName, city." },
      { ask: "What conditions filter the tuples?", answer: "None." },
      { ask: "Which relation holds them?", answer: "Hotel." },
      { ask: "Do we need a join?", answer: "No." },
      {
        ask: "Put it together.",
        answer: "Hotel",
        why: "An expression can be a single relation. Not every question needs an operator."
      }
    ]
  },
  {
    id: "sg-cpa-3b",
    topic: "selection",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(b)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List all single rooms with a price below £20 per night.",
    context: HOTEL_SCHEMA,
    referenceText: "σ_{type = 'Single' ∧ price < 20}(Room)",
    available: ["Room"],
    explanation:
      "Two conditions, both on Room, so they combine with ∧ inside one σ. The question asks to list " +
      "the rooms rather than particular attributes of them, so no projection is needed.",
    hints: [
      "Two restrictions: the type and the price. Both are Room attributes.",
      "Join them with ∧ inside a single σ."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "All of Room's — the question says 'list all single rooms'." },
      {
        ask: "What conditions filter the tuples?",
        answer: "type = 'Single' and price < 20",
        why: "Missing one of the two is the most common error on questions phrased like this."
      },
      { ask: "Which relation holds type and price?", answer: "Room." },
      { ask: "Do we need a join?", answer: "No — both attributes are in Room." },
      { ask: "Put it together.", answer: "σ_{type = 'Single' ∧ price < 20}(Room)" }
    ]
  },
  /*
   * The photographed sheet was read as "names and cities". Guest has no city
   * attribute, so that reading turned a plain projection into a trick about
   * the schema — and the stated answer, Π guestName, guestAddress, answers
   * "addresses" rather than "cities" anyway. Treating it as a transcription
   * slip is the reading that makes the question and its own answer agree.
   * If the sheet really does say cities, change `prompt` back and set
   * referenceText to Π_{guestName, city}(Guest) — but then Guest needs a city
   * attribute in relations.ts, because today it has none.
   */
  {
    id: "sg-cpa-3c",
    topic: "projection",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(c)",
    difficulty: "intro",
    kind: "expression",
    prompt: "List the names and addresses of all guests.",
    context: HOTEL_SCHEMA,
    referenceText: "Π_{guestName, guestAddress}(Guest)",
    available: ["Guest"],
    explanation:
      "Both attributes are in Guest, and nothing is being filtered out, so this is projection " +
      "on its own: Π guestName, guestAddress (Guest).\n\n" +
      "Π chooses columns, never rows. Every guest appears in the result — the only thing that " +
      "changes is how many attributes come back, so the degree drops from 3 to 2 while the " +
      "cardinality stays the same.",
    hints: [
      "Which relation holds a guest's name and address?",
      "Only one, and nothing in the sentence filters the rows — so no σ and no join."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "guestName and guestAddress" },
      {
        ask: "Which relation holds them?",
        answer: "Guest, which is (guestNo, guestName, guestAddress).",
        why: "Both are in the same relation, so nothing has to be joined."
      },
      {
        ask: "Does anything filter the rows?",
        answer: "No — 'all guests' means every tuple stays.",
        why: "No condition in the English means no σ in the algebra."
      },
      { ask: "Put it together.", answer: "Π_{guestName, guestAddress}(Guest)" }
    ]
  },
  {
    id: "sg-cpa-3d",
    topic: "writing-expressions",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(d)",
    difficulty: "core",
    kind: "expression",
    prompt: "List the price and type of all rooms at the Grosvenor Hotel.",
    context: HOTEL_SCHEMA,
    referenceText:
      "Π_{price, type}((σ_{hotelName = 'Grosvenor'}(Hotel)) ⋈_{Hotel.hotelNo = Room.hotelNo} Room)",
    available: ["Hotel", "Room"],
    explanation:
      "price and type are in Room; the hotel's name is in Hotel. Because the filter and the output " +
      "live in different relations, the two must be joined on hotelNo first.",
    hints: [
      "What has to come OUT? price and type — both in Room.",
      "What filters the rows? hotelName, which is in Hotel.",
      "Different relations, so join on hotelNo."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "price, type" },
      { ask: "Which relation holds them?", answer: "Room." },
      {
        ask: "What condition filters the tuples, and where does that attribute live?",
        answer: "hotelName = 'Grosvenor', and hotelName is in Hotel.",
        why: "Room only carries hotelNo — it has no idea what a hotel is called."
      },
      { ask: "What attribute connects Hotel and Room?", answer: "hotelNo" },
      {
        ask: "Put it together.",
        answer:
          "Π_{price, type}((σ_{hotelName = 'Grosvenor'}(Hotel)) ⋈_{Hotel.hotelNo = Room.hotelNo} Room)"
      }
    ]
  },
  {
    id: "sg-cpa-3e",
    topic: "multi-table",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(e)",
    difficulty: "stretch",
    kind: "expression",
    prompt: `List all guests currently staying at the Grosvenor Hotel. Take today's date as ${HOTEL_TODAY}.`,
    context: {
      ...HOTEL_SCHEMA,
      note: `"Currently staying" means the booking has started and has not yet ended: dateFrom ≤ '${HOTEL_TODAY}' and dateTo ≥ '${HOTEL_TODAY}'.`
    },
    referenceText:
      `Π_{guestName}(((σ_{hotelName = 'Grosvenor'}(Hotel)) ⋈_{Hotel.hotelNo = Booking.hotelNo} ` +
      `(σ_{dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking))) ` +
      `⋈_{Booking.guestNo = Guest.guestNo} Guest)`,
    available: ["Hotel", "Booking", "Guest"],
    explanation:
      "Three relations. The hotel's name is in Hotel, the dates are in Booking, and the guest's name " +
      "is in Guest — and Hotel and Guest share no attribute, so the path runs through Booking: " +
      "Hotel →(hotelNo) Booking →(guestNo) Guest. Note that a date range needs two comparisons, not one.",
    hints: [
      "Three relations are involved. Hotel and Guest do not touch — trace the path between them.",
      "'Currently' is two conditions: the stay has begun and has not ended."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "guestName" },
      { ask: "Which relation holds it?", answer: "Guest." },
      {
        ask: "What conditions filter the tuples?",
        answer: `hotelName = 'Grosvenor', dateFrom ≤ '${HOTEL_TODAY}', dateTo ≥ '${HOTEL_TODAY}'`,
        why: "A date range is two comparisons. Writing only one is a very common slip."
      },
      {
        ask: "Which relations hold those attributes?",
        answer: "hotelName is in Hotel; dateFrom and dateTo are in Booking."
      },
      {
        ask: "Do Hotel and Guest share an attribute?",
        answer: "No — so the join path goes through Booking.",
        why: "Booking carries both hotelNo and guestNo, which is exactly why it exists."
      },
      {
        ask: "Put it together.",
        answer:
          `Π_{guestName}(((σ_{hotelName = 'Grosvenor'}(Hotel)) ⋈_{Hotel.hotelNo = Booking.hotelNo} ` +
          `(σ_{dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking))) ` +
          `⋈_{Booking.guestNo = Guest.guestNo} Guest)`
      }
    ]
  },
  {
    id: "sg-cpa-3f",
    topic: "outer-join-left",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(f)",
    difficulty: "stretch",
    kind: "expression",
    prompt:
      `List the details of all rooms at the Grosvenor Hotel, including the name of the guest staying in the room, if the room is occupied. Take today's date as ${HOTEL_TODAY}.`,
    context: {
      ...HOTEL_SCHEMA,
      note:
        "“if the room is occupied” is the whole question: an unoccupied room still has to appear."
    },
    referenceText:
      `Π_{Room.roomNo, type, price, guestName}((σ_{hotelNo = 'H01'}(Room)) ` +
      `⟕_{Room.roomNo = Booking.roomNo} ` +
      `(Π_{roomNo, guestName}((σ_{hotelNo = 'H01' ∧ dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking)) ` +
      `⋈_{Booking.guestNo = Guest.guestNo} Guest)))`,
    available: ["Hotel", "Room", "Booking", "Guest"],
    explanation:
      "The phrase 'if the room is occupied' rules out an ordinary join. An inner join would silently " +
      "drop every empty room, which is precisely the rooms the question wants listed. A LEFT outer " +
      "join preserves all of the Grosvenor's rooms and leaves guestName NULL where nobody is staying.",
    hints: [
      "What happens to an empty room under an ordinary join? It disappears — and the question asks for it.",
      "Build the occupancy side first: current bookings at the Grosvenor, joined to Guest for the name.",
      "Then outer-join the rooms to it on roomNo, preserving the rooms."
    ],
    walkthrough: [
      {
        ask: "What attributes must be output?",
        answer: "The room's details, plus guestName.",
        why: "The guest's name comes from Guest; everything else comes from Room."
      },
      {
        ask: "What does 'if the room is occupied' tell you?",
        answer: "That unoccupied rooms must still appear.",
        why: "This is the signal for an outer join. An inner join would drop exactly those rows."
      },
      {
        ask: "Which side is preserved?",
        answer: "The rooms.",
        why: "So the rooms go on the left and the join is a LEFT outer join."
      },
      {
        ask: "What goes on the other side?",
        answer:
          "Current bookings at this hotel, joined to Guest so the name is available: Π roomNo, guestName of that join."
      },
      { ask: "What connects the two sides?", answer: "roomNo" },
      {
        ask: "Put it together.",
        answer:
          `Π_{Room.roomNo, type, price, guestName}((σ_{hotelNo = 'H01'}(Room)) ` +
          `⟕_{Room.roomNo = Booking.roomNo} ` +
          `(Π_{roomNo, guestName}((σ_{hotelNo = 'H01' ∧ dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking)) ` +
          `⋈_{Booking.guestNo = Guest.guestNo} Guest)))`
      }
    ]
  },
  {
    id: "sg-cpa-3g",
    topic: "multi-table",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 3(g)",
    difficulty: "core",
    kind: "expression",
    prompt: `List the guest details (guestNo, guestName, guestAddress) of all guests staying at the Grosvenor Hotel. Take today's date as ${HOTEL_TODAY}.`,
    context: HOTEL_SCHEMA,
    referenceText:
      `Π_{Guest.guestNo, guestName, guestAddress}(((σ_{hotelName = 'Grosvenor'}(Hotel)) ` +
      `⋈_{Hotel.hotelNo = Booking.hotelNo} ` +
      `(σ_{dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking))) ` +
      `⋈_{Booking.guestNo = Guest.guestNo} Guest)`,
    available: ["Hotel", "Booking", "Guest"],
    explanation:
      "Same query as (e) with a different projection — which is the point of the pair. Note that " +
      "guestNo appears in both Booking and Guest after the join, so it has to be qualified: " +
      "Guest.guestNo. An unqualified guestNo here is genuinely ambiguous.",
    hints: [
      "This is (e) again, projecting three attributes instead of one.",
      "After joining Booking to Guest, guestNo exists twice. Say which one you mean."
    ],
    walkthrough: [
      { ask: "What attributes must be output?", answer: "guestNo, guestName, guestAddress" },
      { ask: "Which relation holds them?", answer: "Guest." },
      {
        ask: "What conditions filter the tuples?",
        answer: `hotelName = 'Grosvenor', and the booking spans '${HOTEL_TODAY}'.`
      },
      { ask: "What is the join path?", answer: "Hotel →(hotelNo) Booking →(guestNo) Guest" },
      {
        ask: "Anything to watch in the projection?",
        answer: "guestNo exists in both Booking and Guest, so qualify it as Guest.guestNo.",
        why: "An ambiguous attribute reference is an error, not a detail."
      },
      {
        ask: "Put it together.",
        answer:
          `Π_{Guest.guestNo, guestName, guestAddress}(((σ_{hotelName = 'Grosvenor'}(Hotel)) ` +
          `⋈_{Hotel.hotelNo = Booking.hotelNo} ` +
          `(σ_{dateFrom ≤ '${HOTEL_TODAY}' ∧ dateTo ≥ '${HOTEL_TODAY}'}(Booking))) ` +
          `⋈_{Booking.guestNo = Guest.guestNo} Guest)`
      }
    ]
  }
];

// ── Sheet 2, Question 1 — integrity over the hotel schema ─────────────────

const practiceIntegrity: LabQuestion[] = [
  {
    id: "sg-cpa-1a",
    topic: "integrity",
    source: "study-guide",
    sourceNote: "Class Practice Activity — Question 1(a)",
    difficulty: "core",
    kind: "choice",
    multiple: true,
    prompt: "Which of these are foreign keys in the hotel schema?",
    context: {
      ...HOTEL_SCHEMA,
      note: "Select every attribute that references a candidate key of another relation."
    },
    options: [
      {
        text: "Room.hotelNo, referencing Hotel",
        correct: true
      },
      {
        text: "Booking.hotelNo, referencing Hotel",
        correct: true
      },
      {
        text: "Booking.guestNo, referencing Guest",
        correct: true
      },
      {
        text: "Hotel.hotelNo, referencing Room",
        correct: false,
        mistake: "entity-vs-referential-integrity",
        note:
          "hotelNo is Hotel's own primary key, not a reference to another relation. Foreign keys point away from the relation that holds them, and the direction matters."
      },
      {
        text: "Guest.guestNo, referencing Booking",
        correct: false,
        mistake: "entity-vs-referential-integrity",
        note:
          "guestNo is Guest's primary key. Booking references Guest, not the other way round — a guest exists whether or not they have ever booked."
      }
    ],
    explanation:
      "A foreign key is an attribute in one relation that matches a candidate key of the relation it " +
      "references. Room.hotelNo and Booking.hotelNo both reference Hotel.hotelNo; Booking.guestNo " +
      "references Guest.guestNo. Booking.roomNo together with hotelNo also references Room. Entity " +
      "integrity then says none of the primary keys — hotelNo, (roomNo, hotelNo), (hotelNo, guestNo, " +
      "dateFrom), guestNo — may have a null component, and referential integrity says each foreign-key " +
      "value must match an existing tuple or be wholly null.",
    hints: [
      "A foreign key lives in the relation that does the referencing, not the one being referenced.",
      "Ask which relation can exist on its own, and which one depends on it."
    ]
  }
];

export const STUDY_GUIDE_QUESTIONS: LabQuestion[] = [
  ...musicTasks,
  ...practiceIntegrity,
  ...practiceReading,
  ...practiceWriting
];
