/**
 * The relations CS 4354 actually works with.
 *
 * Everything here is taken from the course's own material — Homework #1 and
 * the Lecture 2–5 case study — rather than substituted from a textbook. The
 * schemas, attribute spellings and sample values are the ones the exam will
 * use, so a learner who practises here is practising the real thing.
 *
 * Instances are deliberately small. Exam questions are hand-computed, and a
 * relation you can hold in your head is the point.
 */

import type { Relation } from "@/lib/relational-algebra/relation";

export interface SchemaRelation {
  name: string;
  attributes: string[];
  /** Attributes underlined in the source material as the primary key. */
  primaryKey: string[];
  /** Foreign keys, as written in the homework's prose. */
  foreignKeys?: { attributes: string[]; references: string }[];
  description: string;
}

export interface CourseSchema {
  id: string;
  label: string;
  /** Where this schema comes from, shown to the learner. */
  origin: string;
  relations: SchemaRelation[];
}

// ── Homework #1, Question 1 — the R / S join laboratory ───────────────────

/**
 * The homework asks for two relations sharing a joining attribute `j`, with
 * at least two matching values, at least one left-only value and at least one
 * right-only value. This is that instance: J1/J2/J3 match, J7 is left-only,
 * J9 is right-only, and J1, J2 and J3 each repeat so that joins produce the
 * many-to-many fan-out the exam tests.
 */
export const relationR: Relation = {
  name: "R",
  attributes: ["r_id", "j", "r2", "r3"],
  tuples: [
    ["R101", "J1", "A", 15],
    ["R102", "J2", "A", 30],
    ["R103", "J1", "C", 35],
    ["R104", "J3", "D", 42],
    ["R105", "J7", "E", 61],
    ["R106", "J3", "F", 96]
  ]
};

export const relationS: Relation = {
  name: "S",
  attributes: ["s_id", "j", "s2", "s3"],
  tuples: [
    ["S201", "J1", "Red", 15],
    ["S202", "J2", "Purple", 30],
    ["S203", "J3", "Green", 35],
    ["S204", "J9", "Blue", 42],
    ["S205", "J1", "Yellow", 61],
    ["S206", "J2", "Black", 96]
  ]
};

export const homeworkSchema: CourseSchema = {
  id: "rs",
  label: "R / S",
  origin: "Homework #1, Question 1",
  relations: [
    {
      name: "R",
      attributes: ["r_id", "j", "r2", "r3"],
      primaryKey: ["r_id"],
      description: "Left-hand base relation. `j` is the common joining attribute."
    },
    {
      name: "S",
      attributes: ["s_id", "j", "s2", "s3"],
      primaryKey: ["s_id"],
      description: "Right-hand base relation. `j` is the common joining attribute."
    }
  ]
};

// ── Homework #1, Question 2 — the hotel database ──────────────────────────

export const hotelSchema: CourseSchema = {
  id: "hotel",
  label: "Hotel database",
  origin: "Homework #1 Q2 · Class Practice Activity",
  relations: [
    {
      name: "Hotel",
      attributes: ["hotelNo", "hotelName", "city"],
      primaryKey: ["hotelNo"],
      description: "Hotel details."
    },
    {
      name: "Room",
      attributes: ["roomNo", "hotelNo", "type", "price"],
      primaryKey: ["roomNo", "hotelNo"],
      foreignKeys: [{ attributes: ["hotelNo"], references: "Hotel" }],
      description: "Room details for each hotel."
    },
    {
      name: "Booking",
      attributes: ["hotelNo", "guestNo", "dateFrom", "dateTo", "roomNo"],
      primaryKey: ["hotelNo", "guestNo", "dateFrom"],
      foreignKeys: [
        { attributes: ["hotelNo"], references: "Hotel" },
        { attributes: ["guestNo"], references: "Guest" }
      ],
      description: "Booking details."
    },
    {
      name: "Guest",
      attributes: ["guestNo", "guestName", "guestAddress"],
      primaryKey: ["guestNo"],
      description: "Guest details."
    }
  ]
};

export const hotelRelation: Relation = {
  name: "Hotel",
  attributes: ["hotelNo", "hotelName", "city"],
  tuples: [
    ["H01", "Grosvenor", "London"],
    ["H02", "Kingsway", "Glasgow"],
    ["H03", "Riverside", "Aberdeen"],
    ["H04", "Parkview", "London"]
  ]
};

export const roomRelation: Relation = {
  name: "Room",
  attributes: ["roomNo", "hotelNo", "type", "price"],
  tuples: [
    ["R1", "H01", "Single", 45],
    ["R2", "H01", "Suite", 175],
    ["R3", "H02", "Double", 80],
    ["R4", "H02", "Suite", 140],
    ["R5", "H03", "Single", 40],
    ["R6", "H04", "Suite", 210],
    // Question 3(b) asks for single rooms under £20. Deliberately at H03,
    // which has no room over 50, so the "hotels with a room over 50" answers
    // elsewhere are unchanged.
    ["R7", "H03", "Single", 18]
  ]
};

export const guestRelation: Relation = {
  name: "Guest",
  attributes: ["guestNo", "guestName", "guestAddress"],
  tuples: [
    ["G1", "Ana Ruiz", "14 Mill Rd"],
    ["G2", "Tom Petrie", "9 Kings Way"],
    ["G3", "Ivy Chen", "3 Harbour St"]
  ]
};

export const bookingRelation: Relation = {
  name: "Booking",
  attributes: ["hotelNo", "guestNo", "dateFrom", "dateTo", "roomNo"],
  tuples: [
    ["H01", "G1", "2026-09-01", "2026-09-04", "R1"],
    ["H01", "G2", "2026-09-02", "2026-09-06", "R2"],
    ["H02", "G1", "2026-09-10", "2026-09-12", "R3"],
    ["H04", "G3", "2026-09-05", "2026-09-09", "R6"],
    // A stay spanning HOTEL_TODAY, so "currently staying" has an answer.
    // Room R1 of the Grosvenor is occupied and R2 is not, which is what makes
    // Question 3(f) a genuine outer join rather than an ordinary one.
    ["H01", "G3", "2026-09-14", "2026-09-18", "R1"]
  ]
};

/**
 * The date the hotel exercises treat as "today".
 *
 * "Guests currently staying" has no fixed answer unless today is fixed, and a
 * question whose correct answer changes overnight cannot be practised or
 * tested. The questions state this date explicitly rather than relying on the
 * clock.
 */
export const HOTEL_TODAY = "2026-09-16";

// ── The Lecture 2–5 case study — Staff and Branch ─────────────────────────

/**
 * The Staff and Branch instances printed in the Lecture 2 "Entity and
 * Referential Integrity" slide and used again throughout Lectures 3–5. The
 * homework's Question 3 says "the database case study used in class", which
 * is this one, so the values are reproduced exactly.
 */
export const staffRelation: Relation = {
  name: "Staff",
  attributes: ["staffNo", "fName", "lName", "position", "sex", "DOB", "salary", "branchNo"],
  tuples: [
    ["SL21", "John", "White", "Manager", "M", "1945-10-01", 30000, "B005"],
    ["SG37", "Ann", "Beech", "Assistant", "F", "1960-11-10", 12000, "B003"],
    ["SG14", "David", "Ford", "Supervisor", "M", "1958-03-24", 18000, "B003"],
    ["SA9", "Mary", "Howe", "Assistant", "F", "1970-02-19", 9000, "B007"],
    ["SG5", "Susan", "Brand", "Manager", "F", "1940-06-03", 24000, "B003"],
    ["SL41", "Julie", "Lee", "Assistant", "F", "1965-06-13", 9000, "B005"]
  ]
};

export const branchRelation: Relation = {
  name: "Branch",
  attributes: ["branchNo", "street", "city", "postcode"],
  tuples: [
    ["B005", "22 Deer Rd", "London", "SW1 4EH"],
    ["B007", "16 Argyll St", "Aberdeen", "AB2 3SU"],
    ["B003", "163 Main St", "Glasgow", "G11 9QX"],
    ["B004", "32 Manse Rd", "Bristol", "BS99 1NZ"],
    ["B002", "56 Clover Dr", "London", "NW10 6EU"]
  ]
};

export const staffBranchSchema: CourseSchema = {
  id: "staff",
  label: "Staff / Branch",
  origin: "Class case study (Lectures 2–5), used by Homework #1 Question 3",
  relations: [
    {
      name: "Staff",
      attributes: [
        "staffNo",
        "fName",
        "lName",
        "position",
        "sex",
        "DOB",
        "salary",
        "branchNo"
      ],
      primaryKey: ["staffNo"],
      foreignKeys: [{ attributes: ["branchNo"], references: "Branch" }],
      description: "Staff details. `branchNo` is the foreign key to Branch."
    },
    {
      name: "Branch",
      attributes: ["branchNo", "street", "city", "postcode"],
      primaryKey: ["branchNo"],
      description: "Branch office details."
    }
  ]
};

// ── Homework #1, Question 4 — the library database ────────────────────────

export const librarySchema: CourseSchema = {
  id: "library",
  label: "Library database",
  origin: "Homework #1, Question 4",
  relations: [
    {
      name: "Book",
      attributes: ["ISBN", "title", "edition", "year"],
      primaryKey: ["ISBN"],
      description: "Book titles in the library. ISBN is the key."
    },
    {
      name: "BookCopy",
      attributes: ["copyNo", "ISBN", "available"],
      primaryKey: ["copyNo"],
      foreignKeys: [{ attributes: ["ISBN"], references: "Book" }],
      description:
        "Individual copies. `copyNo` is the key; `ISBN` is a foreign key identifying the book title."
    },
    {
      name: "Borrower",
      attributes: ["borrowerNo", "borrowerName", "borrowerAddress"],
      primaryKey: ["borrowerNo"],
      description: "Library members who can borrow books."
    },
    {
      name: "BookLoan",
      attributes: ["copyNo", "dateOut", "dateDue", "borrowerNo"],
      primaryKey: ["copyNo", "dateOut"],
      foreignKeys: [
        { attributes: ["copyNo"], references: "BookCopy" },
        { attributes: ["borrowerNo"], references: "Borrower" }
      ],
      description:
        "Copies on loan. `copyNo`/`dateOut` forms the key; `borrowerNo` identifies the borrower."
    }
  ]
};

export const bookRelation: Relation = {
  name: "Book",
  attributes: ["ISBN", "title", "edition", "year"],
  tuples: [
    ["0-321-52306-7", "Lord of the Rings", "3rd", 2012],
    ["0-201-61622-X", "The Pragmatic Programmer", "2nd", 2019],
    ["0-13-110362-8", "The C Programming Language", "2nd", 2012]
  ]
};

export const bookCopyRelation: Relation = {
  name: "BookCopy",
  attributes: ["copyNo", "ISBN", "available"],
  tuples: [
    ["C1", "0-321-52306-7", "Y"],
    ["C2", "0-321-52306-7", "N"],
    ["C3", "0-201-61622-X", "Y"],
    ["C4", "0-13-110362-8", "N"]
  ]
};

export const borrowerRelation: Relation = {
  name: "Borrower",
  attributes: ["borrowerNo", "borrowerName", "borrowerAddress"],
  tuples: [
    ["B1", "Ana Ruiz", "14 Mill Rd"],
    ["B2", "Tom Petrie", "9 Kings Way"]
  ]
};

export const bookLoanRelation: Relation = {
  name: "BookLoan",
  attributes: ["copyNo", "dateOut", "dateDue", "borrowerNo"],
  tuples: [
    // Still on loan on Exam 1 day, but not yet overdue — so a missing dateDue
    // filter cannot hide behind "everyone with a loan is overdue".
    ["C2", "2026-08-20", "2026-09-25", "B1"],
    ["C4", "2026-08-01", "2026-08-22", "B2"]
  ]
};

// ── Lecture 2–5 DreamHome instance (Figure 4-3 / class case study) ────────
//
// Used by Lecture 5's worked division example: clients who have viewed every
// three-room property. Values match the photographed study-guide instance.

export const clientRelation: Relation = {
  name: "Client",
  attributes: ["clientNo", "fName", "lName", "prefType", "maxRent"],
  tuples: [
    ["CR76", "John", "Kay", "Flat", 425],
    ["CR56", "Aline", "Stewart", "Flat", 350],
    ["CR74", "Mike", "Ritchie", "House", 750],
    ["CR62", "Mary", "Tregrea", "Flat", 600]
  ]
};

export const propertyForRentRelation: Relation = {
  name: "PropertyForRent",
  attributes: ["propertyNo", "street", "city", "type", "rooms", "rent", "staffNo", "branchNo"],
  tuples: [
    ["PA14", "16 Holhead", "Aberdeen", "House", 6, 650, "SA9", "B007"],
    ["PL94", "6 Argyll St", "London", "Flat", 4, 400, "SL41", "B005"],
    ["PG4", "6 Lawrence St", "Glasgow", "Flat", 3, 350, "SG37", "B003"],
    ["PG36", "2 Manor Rd", "Glasgow", "Flat", 3, 375, "SG37", "B003"],
    ["PG21", "18 Dale Rd", "Glasgow", "House", 5, 600, "SG37", "B003"],
    ["PG16", "5 Novar Dr", "Glasgow", "Flat", 4, 450, "SG14", "B003"]
  ]
};

export const viewingRelation: Relation = {
  name: "Viewing",
  attributes: ["clientNo", "propertyNo", "viewDate", "comment"],
  tuples: [
    ["CR56", "PA14", "2013-05-24", "too small"],
    ["CR76", "PG4", "2013-04-20", "too remote"],
    ["CR56", "PG4", "2013-05-26", ""],
    ["CR62", "PA14", "2013-05-14", "no dining room"],
    ["CR56", "PG36", "2013-04-28", ""]
  ]
};

export const dreamHomeSchema: CourseSchema = {
  id: "dreamhome",
  label: "DreamHome — clients, properties & viewings",
  origin: "Lecture 2–5 case study instance (Figure 4-3); Lecture 5 join and division examples",
  relations: [
    {
      name: "Client",
      attributes: ["clientNo", "fName", "lName", "prefType", "maxRent"],
      primaryKey: ["clientNo"],
      description: "Clients looking to rent. Used by Lecture 5's natural-join example."
    },
    {
      name: "PropertyForRent",
      attributes: ["propertyNo", "street", "city", "type", "rooms", "rent", "staffNo", "branchNo"],
      primaryKey: ["propertyNo"],
      foreignKeys: [{ attributes: ["branchNo"], references: "Branch" }],
      description: "Properties available to rent. `rooms` is the divisor filter in Lecture 5."
    },
    {
      name: "Viewing",
      attributes: ["clientNo", "propertyNo", "viewDate", "comment"],
      primaryKey: ["clientNo", "propertyNo", "viewDate"],
      foreignKeys: [
        { attributes: ["clientNo"], references: "Client" },
        { attributes: ["propertyNo"], references: "PropertyForRent" }
      ],
      description: "Which client viewed which property. Extra viewings never disqualify a client."
    },
    {
      name: "Branch",
      attributes: ["branchNo", "street", "city", "postcode"],
      primaryKey: ["branchNo"],
      description: "Branch offices. city is the filter in Lecture 5's Glasgow semijoin."
    }
  ]
};

// ── Study-guide join exercise — Album / RecordLabel ───────────────────────

/**
 * The two relations from the photographed class study guide.
 *
 * Its note that "the only attribute name shared by both relations is
 * labelCode" is what makes the natural join well defined, and the sales /
 * minSalesTarget pair is what makes its final task a genuine *theta* join —
 * a join whose predicate is not an equality. Nothing else in the course
 * material exercises that, so this dataset is not redundant with R/S.
 */
export const albumRelation: Relation = {
  name: "Album",
  attributes: ["albumID", "title", "labelCode", "sales"],
  tuples: [
    ["A1", "Sunrise", "L1", 60000],
    ["A2", "Echoes", "L1", 35000],
    ["A3", "Horizon", "L2", 80000],
    ["A4", "Drift", "L9", 45000]
  ]
};

export const recordLabelRelation: Relation = {
  name: "RecordLabel",
  attributes: ["labelCode", "labelName", "country", "minSalesTarget"],
  tuples: [
    ["L1", "BlueWave", "USA", 50000],
    ["L2", "NorthStar", "Canada", 70000],
    ["L3", "RedStone", "UK", 40000],
    ["L4", "Moonlight", "France", 55000]
  ]
};

export const musicSchema: CourseSchema = {
  id: "music",
  label: "Album / RecordLabel",
  origin: "Class study guide — join exercise",
  relations: [
    {
      name: "Album",
      attributes: ["albumID", "title", "labelCode", "sales"],
      primaryKey: ["albumID"],
      foreignKeys: [{ attributes: ["labelCode"], references: "RecordLabel" }],
      description: "Albums and their sales. `labelCode` is the only shared attribute name."
    },
    {
      name: "RecordLabel",
      attributes: ["labelCode", "labelName", "country", "minSalesTarget"],
      primaryKey: ["labelCode"],
      description: "Labels and the sales target each one sets."
    }
  ]
};

// ── Registry ──────────────────────────────────────────────────────────────

export const courseSchemas: CourseSchema[] = [
  homeworkSchema,
  musicSchema,
  hotelSchema,
  staffBranchSchema,
  librarySchema,
  dreamHomeSchema
];

/** Every named relation instance, keyed for the evaluator's `Database`. */
export const courseDatabase: Record<string, Relation> = {
  R: relationR,
  S: relationS,
  Album: albumRelation,
  RecordLabel: recordLabelRelation,
  Hotel: hotelRelation,
  Room: roomRelation,
  Guest: guestRelation,
  Booking: bookingRelation,
  Staff: staffRelation,
  Branch: branchRelation,
  Book: bookRelation,
  BookCopy: bookCopyRelation,
  Borrower: borrowerRelation,
  BookLoan: bookLoanRelation,
  PropertyForRent: propertyForRentRelation,
  Viewing: viewingRelation,
  Client: clientRelation
};

export function getCourseSchema(id: string) {
  return courseSchemas.find((schema) => schema.id === id);
}

/** Which relation in a schema holds a given attribute — the "where does this live?" lookup. */
export function relationsHolding(schema: CourseSchema, attribute: string): string[] {
  const needle = attribute.toLowerCase();
  return schema.relations
    .filter((relation) => relation.attributes.some((a) => a.toLowerCase() === needle))
    .map((relation) => relation.name);
}
