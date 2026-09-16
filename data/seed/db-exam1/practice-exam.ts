/**
 * Exam 1 simulation — a sit-down paper for the course's Exams tab.
 *
 * Distinct from the Mock exam inside Exam 1 Mastery. That one is adaptive:
 * it draws on what you have already answered and never gives the same paper
 * twice. This is a fixed paper of the kind you actually sit — same questions
 * every time, so a score means something when compared with last week's.
 *
 * It is a `QuizSet` rather than a lab mode so it appears where a student
 * looks for exams and runs through the existing timed-exam machinery, with
 * the question types that machinery renders: multiple choice, fill-in for
 * the numeric answers, and free response for the algebra.
 *
 * Every number below was computed with the relational-algebra evaluator
 * against the relations in `relations.ts`, not worked out by hand.
 */

import type { QuizSet } from "@/lib/types";

const EXAM_TAGS = ["exam-1", "exam-simulation", "relational-algebra"];

export const databaseExam1QuizSets: QuizSet[] = [
  {
    id: "db-exam1-simulation",
    courseId: "database-systems",
    title: "Exam 1 Simulation — Relational Model & Relational Algebra",
    description:
      "A full 50-minute paper over Lectures 2–5: the relational model, keys and integrity, σ, Π, Cartesian product, every join, semijoin and division. Fixed questions, so you can compare one sitting with the next.",
    difficulty: "Intermediate",
    estMinutes: 50,
    mode: "exam",
    isExamSimulation: true,
    questionCountTarget: 22,
    tags: [...EXAM_TAGS, "lecture-2", "lecture-3", "lecture-4", "lecture-5", "joins", "division"],
    timerDefaultMinutes: 50,
    questions: [
      // ── Section A: the relational model ──────────────────────────────
      {
        id: "db-exam1-sim-q1",
        type: "single",
        fromProfessor: true,
        difficulty: "easy",
        prompt:
          "Which of the following is **not** a property of a relation in the relational model?",
        options: [
          "The order of tuples is significant and is preserved by the DBMS.",
          "Each cell contains exactly one atomic value.",
          "Each attribute has a distinct name.",
          "All values of an attribute come from the same domain."
        ],
        correct: [0],
        explanation:
          "Lecture 2 states that the order of tuples has no significance, theoretically. How a DBMS physically stores rows is a separate matter from the model. The other three are listed on the same slide as properties that do hold.",
        tags: ["relational-terminology", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q2",
        type: "fill",
        fromProfessor: true,
        difficulty: "easy",
        prompt:
          "The **Branch** relation is `Branch(branchNo, street, city, postcode)` and holds 5 tuples.\n\nWhat is its **degree**?",
        correct: ["4", "four"],
        explanation:
          "Degree is the number of attributes — branchNo, street, city and postcode, so 4. Cardinality is the number of tuples, which is 5. Swapping the two is the single most common slip on this topic.",
        hintSteps: ["Degree counts columns. Cardinality counts rows."],
        tags: ["degree-cardinality", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q3",
        type: "fill",
        fromProfessor: true,
        difficulty: "easy",
        prompt:
          "The **Staff** relation is `Staff(staffNo, fName, lName, position, sex, DOB, salary, branchNo)` and holds 6 tuples.\n\nWhat is its **cardinality**?",
        correct: ["6", "six"],
        explanation:
          "Cardinality is the number of tuples: 6. Its degree is 8, the number of attributes.",
        tags: ["degree-cardinality", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q4",
        type: "single",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "In a relation, attribute **A** is unique on its own. Attribute **B** is not.\n\nWhich statement about the set **{A, B}** is correct?",
        options: [
          "{A, B} is a superkey but not a candidate key.",
          "{A, B} is both a superkey and a candidate key.",
          "{A, B} is a candidate key but not a superkey.",
          "{A, B} is neither, because B is not unique."
        ],
        correct: [0],
        explanation:
          "{A, B} identifies tuples uniquely, so it is a superkey. It is not a candidate key, because a candidate key must also be irreducible — and the proper subset {A} already has the uniqueness property, so B is unnecessary. Uniqueness plus irreducibility is what Lecture 2 requires.",
        hintSteps: [
          "A superkey only has to be unique.",
          "A candidate key has to be unique AND have no proper subset that is unique."
        ],
        tags: ["keys", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q5",
        type: "single",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "In an `Enrolment(studentNo, courseCode, term, grade)` relation, a student takes many courses and a course has many students, but a student appears at most once per course.\n\nWhat is the candidate key?",
        options: [
          "{studentNo, courseCode}",
          "{studentNo}",
          "{courseCode}",
          "{studentNo, courseCode, term}"
        ],
        correct: [0],
        explanation:
          "Neither studentNo nor courseCode is unique on its own, so the key must be composite. {studentNo, courseCode} is unique and has no unique proper subset, so it is a candidate key. {studentNo, courseCode, term} is a superkey but adds an unnecessary attribute, so it is not a candidate key.",
        tags: ["keys", ...EXAM_TAGS]
      },

      // ── Section B: integrity ─────────────────────────────────────────
      {
        id: "db-exam1-sim-q6",
        type: "single",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "`Staff.branchNo` is a foreign key referencing `Branch.branchNo`. A new Staff tuple is inserted with `staffNo = 'SG90'`, `lName = 'Reed'` and `branchNo = 'B099'`, where B099 is not a branch that exists.\n\nWhich integrity rule does this break?",
        options: [
          "Referential integrity",
          "Entity integrity",
          "Neither — the insert is valid",
          "Both rules equally"
        ],
        correct: [0],
        explanation:
          "Referential integrity. The primary key staffNo is present and unique, so entity integrity is satisfied. The problem is the foreign key: its value must either match a candidate-key value in Branch or be wholly null, and B099 does neither.",
        tags: ["integrity", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q7",
        type: "single",
        fromProfessor: true,
        difficulty: "easy",
        prompt: "Which statement about **NULL** is correct?",
        options: [
          "NULL represents the absence of a value and is not the same as zero or a space.",
          "NULL is stored as zero for numeric attributes and as an empty string for text.",
          "Two NULLs are equal, so they group together in a comparison.",
          "A primary key may be NULL provided the rest of the tuple is filled in."
        ],
        correct: [0],
        explanation:
          "Lecture 2 is explicit: NULL is the absence of a value, not the same as zero or spaces. It is not equal to anything, including another NULL, so any comparison involving it is unknown — and unknown is not true. A NULL primary key is exactly what entity integrity forbids.",
        tags: ["integrity", ...EXAM_TAGS]
      },

      // ── Section C: selection, projection, Cartesian product ──────────
      {
        id: "db-exam1-sim-q8",
        type: "fill",
        fromProfessor: true,
        difficulty: "easy",
        prompt:
          "Staff holds 6 tuples. Four of them have a salary above 10,000.\n\nHow many tuples are in `σ salary > 10000 (Staff)`?",
        correct: ["4", "four"],
        explanation:
          "Selection slices horizontally: it keeps the tuples satisfying the predicate and changes nothing about the attributes. Four tuples qualify, and the degree stays at 8.",
        tags: ["selection", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q9",
        type: "fill",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "Branch holds 5 tuples. Their `city` values are London, Aberdeen, Glasgow, Bristol and London.\n\nHow many tuples are in `Π city (Branch)`?",
        correct: ["4", "four"],
        explanation:
          "Four. Projection keeps the chosen column **and eliminates duplicate tuples**, because the result is a relation and a relation is a set. London appears twice in Branch but once in the result. Answering 5 is the classic projection error.",
        hintSteps: ["Projection does two things, not one. The second is duplicate elimination."],
        tags: ["projection", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q10",
        type: "fill",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "Staff has 6 tuples and 8 attributes. Branch has 5 tuples and 4 attributes.\n\nWhat is the **degree** of `Staff X Branch`?",
        correct: ["12", "twelve"],
        explanation:
          "Degree adds: 8 + 4 = 12. Lecture 4 states it directly — I tuples with N attributes and J tuples with M attributes give I × J tuples with N + M attributes.",
        tags: ["cartesian-product", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q11",
        type: "fill",
        fromProfessor: true,
        difficulty: "med",
        prompt: "Staff has 6 tuples and 8 attributes. Branch has 5 tuples and 4 attributes.\n\nWhat is the **cardinality** of `Staff X Branch`?",
        correct: ["30", "thirty"],
        explanation:
          "Cardinality multiplies: 6 × 5 = 30. Degree adds and cardinality multiplies — they do not combine the same way, and mixing them up is the mistake this pair of questions is built to catch.",
        tags: ["cartesian-product", ...EXAM_TAGS]
      },

      // ── Section D: joins ─────────────────────────────────────────────
      {
        id: "db-exam1-sim-q12",
        type: "fill",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "| Album | | | |\n|---|---|---|---|\n| **albumID** | **title** | **labelCode** | **sales** |\n| A1 | Sunrise | L1 | 60000 |\n| A2 | Echoes | L1 | 35000 |\n| A3 | Horizon | L2 | 80000 |\n| A4 | Drift | L9 | 45000 |\n\n| RecordLabel | | | |\n|---|---|---|---|\n| **labelCode** | **labelName** | **country** | **minSalesTarget** |\n| L1 | BlueWave | USA | 50000 |\n| L2 | NorthStar | Canada | 70000 |\n| L3 | RedStone | UK | 40000 |\n| L4 | Moonlight | France | 55000 |\n\nHow many tuples are in the equijoin `Album ⋈ Album.labelCode = RecordLabel.labelCode RecordLabel`?",
        correct: ["3", "three"],
        explanation:
          "Three. L1 matches two albums (A1, A2) against one label, giving two rows; L2 matches one against one, giving a third. A4 carries L9, which no label uses, so it contributes nothing — and L3 and L4 have no albums.",
        hintSteps: [
          "List the labelCode values that appear in both relations.",
          "For each, multiply the number of albums by the number of labels carrying it."
        ],
        tags: ["equijoin", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q13",
        type: "fill",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "Album(albumID, title, labelCode, sales) holds 4 tuples with labelCodes **L1, L1, L2, L9**. RecordLabel(labelCode, labelName, country, minSalesTarget) holds 4 tuples with labelCodes **L1, L2, L3, L4**. `labelCode` is the only attribute name the two relations share.\n\nWhat is the **degree** of the natural join `Album ⋈ RecordLabel`?",
        correct: ["7", "seven"],
        explanation:
          "Seven. The equijoin has degree 4 + 4 = 8 and keeps both copies of labelCode. A natural join eliminates one occurrence of each common attribute, so it drops to 7. The tuples are the same three either way — one column is the entire difference between the two operators.",
        tags: ["natural-join", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q14",
        type: "fill",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "Album(albumID, title, labelCode, sales) holds 4 tuples with labelCodes **L1, L1, L2, L9**. RecordLabel(labelCode, labelName, country, minSalesTarget) holds 4 tuples with labelCodes **L1, L2, L3, L4**. `labelCode` is the only attribute name the two relations share.\n\nHow many tuples are in `Album ⟕ Album.labelCode = RecordLabel.labelCode RecordLabel` (left outer join)?",
        correct: ["4", "four"],
        explanation:
          "Four: the three matching rows plus A4 (Drift), whose label L9 does not exist, carried through with NULLs across all four of RecordLabel's attributes. A left outer join preserves the left relation. RedStone and Moonlight have no albums and do not appear.",
        tags: ["outer-join-left", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q15",
        type: "fill",
        fromProfessor: true,
        difficulty: "hard",
        prompt:
          "Album(albumID, title, labelCode, sales) holds 4 tuples with labelCodes **L1, L1, L2, L9**. RecordLabel(labelCode, labelName, country, minSalesTarget) holds 4 tuples with labelCodes **L1, L2, L3, L4**. `labelCode` is the only attribute name the two relations share.\n\nHow many tuples are in `Album ⟖ Album.labelCode = RecordLabel.labelCode RecordLabel` (right outer join)?",
        correct: ["5", "five"],
        explanation:
          "Five: the three matching rows plus RedStone (L3) and Moonlight (L4), the two labels with no albums, padded with NULLs across Album's attributes. A4 does **not** appear — it is unmatched on the left, and a right outer join preserves the right relation. Answering 4 usually means the preserved side was inverted.",
        hintSteps: ["Which relation does a RIGHT outer join guarantee in full?"],
        tags: ["outer-join-right", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q16",
        type: "single",
        fromProfessor: true,
        difficulty: "hard",
        prompt:
          "Which albums are returned by the theta join\n\n`Album ⋈ Album.labelCode = RecordLabel.labelCode ∧ Album.sales ≥ RecordLabel.minSalesTarget RecordLabel`?",
        options: [
          "Sunrise and Horizon",
          "Sunrise, Echoes and Horizon",
          "Sunrise, Echoes, Horizon and Drift",
          "Horizon only"
        ],
        correct: [0],
        explanation:
          "Both comparisons have to hold. Sunrise sold 60,000 against BlueWave's target of 50,000 and qualifies; Horizon sold 80,000 against NorthStar's 70,000 and qualifies; Echoes sold 35,000 against the same 50,000 target and does not. Drift never reaches the sales test — its label does not exist, so the first comparison already fails. Note that this is a theta join, not an equijoin: one of its comparisons is ≥.",
        tags: ["equijoin", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q17",
        type: "single",
        fromProfessor: true,
        difficulty: "med",
        prompt:
          "Album(albumID, title, labelCode, sales) holds 4 tuples with labelCodes **L1, L1, L2, L9**. RecordLabel(labelCode, labelName, country, minSalesTarget) holds 4 tuples with labelCodes **L1, L2, L3, L4**. `labelCode` is the only attribute name the two relations share.\n\nWhich attributes does `Album ▷ Album.labelCode = RecordLabel.labelCode RecordLabel` (semijoin) return, and how many tuples?",
        options: [
          "Album's four attributes only; 3 tuples",
          "All eight attributes; 3 tuples",
          "RecordLabel's four attributes only; 3 tuples",
          "Album's four attributes only; 4 tuples"
        ],
        correct: [0],
        explanation:
          "A semijoin performs the join and then projects over the attributes of the **first** operand, so the result has Album's schema — degree 4, not 8. Three of the four albums have a matching label; A4 does not. RecordLabel decides which albums qualify and then disappears entirely.",
        hintSteps: ["Lecture 5 defines R ▷ S as Π over R's attributes of R ⋈ S."],
        tags: ["semijoin", ...EXAM_TAGS]
      },

      // ── Section E: division ──────────────────────────────────────────
      {
        id: "db-exam1-sim-q18",
        type: "single",
        fromProfessor: true,
        difficulty: "hard",
        prompt:
          "`Π guestName, hotelNo (Booking ⋈ Booking.guestNo = Guest.guestNo Guest) ÷ Π hotelNo (σ city = 'London' (Hotel))`\n\nWhat does this expression return?",
        options: [
          "The names of guests who have booked at every London hotel.",
          "The names of guests who have booked at any London hotel.",
          "The names of guests who have booked only at London hotels and nowhere else.",
          "The names and hotel numbers of guests who have booked in London."
        ],
        correct: [0],
        explanation:
          "Division answers a 'for all' question: it keeps the guestName values paired with **every** tuple of the divisor. Bookings outside the divisor are ignored and never disqualify a guest. The result is over the attributes the divisor does not have — guestName alone — so no hotel numbers survive.",
        hintSteps: [
          "Identify the dividend, the divisor, and what is left over.",
          "Result schema = dividend attributes minus divisor attributes."
        ],
        tags: ["division", ...EXAM_TAGS]
      },

      // ── Section F: reading and writing algebra ───────────────────────
      {
        id: "db-exam1-sim-q19",
        type: "free",
        fromProfessor: true,
        difficulty: "med",
        homeworkFormat: "short",
        prompt:
          "```\nHotel (hotelNo, hotelName, city)\nRoom (roomNo, hotelNo, type, price)\nBooking (hotelNo, guestNo, dateFrom, dateTo, roomNo)\nGuest (guestNo, guestName, guestAddress)\n```\n\nDescribe **in words** the relation produced by:\n\n`Hotel ▷ Hotel.hotelNo = Room.hotelNo (σ price > 50 (Room))`\n\nSay which tuples survive and which attributes come back.",
        sampleAnswer:
          "The full details of every hotel that has at least one room costing more than 50. Because a semijoin projects over the attributes of its first operand, the result has Hotel's schema — hotelNo, hotelName, city — and no room details appear at all. A hotel with no room over 50 is dropped rather than padded with NULLs, and a hotel with several expensive rooms still appears exactly once.",
        explanation:
          "Three things have to be in a full answer: which tuples survive (hotels with at least one matching room), which attributes come back (Hotel's only), and what happens to non-matching tuples (dropped, not padded). Describing only the condition is the common half-answer.",
        walkthroughSteps: [
          "Evaluate the inner bracket first: σ price > 50 (Room) is the set of rooms costing more than 50.",
          "A semijoin returns tuples of the LEFT operand that have at least one match.",
          "It then projects over the left operand's attributes, so nothing from Room survives.",
          "'At least one' matters: one qualifying room is enough, and it appears once, not once per room."
        ],
        tags: ["reading-expressions", "semijoin", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q20",
        type: "free",
        fromProfessor: true,
        difficulty: "med",
        homeworkFormat: "short",
        prompt:
          "Using `Staff(staffNo, fName, lName, position, sex, DOB, salary, branchNo)` and `Branch(branchNo, street, city, postcode)`:\n\nWrite a relational algebra expression to **list the street, city and postcode of all female staff.**",
        sampleAnswer:
          "Π street, city, postcode ( (σ sex = 'F' (Staff)) ⋈ Staff.branchNo = Branch.branchNo Branch )",
        explanation:
          "street, city and postcode are Branch attributes; sex is a Staff attribute. Because the output and the filter live in different relations, the two must be joined on branchNo before either can be used. Filtering Staff before the join is good practice but not required for correctness.",
        walkthroughSteps: [
          "What must be OUTPUT? street, city, postcode — all three are in Branch.",
          "What CONDITION filters the tuples? sex = 'F', which is in Staff.",
          "Do the output and the filter live in the same relation? No — so a join is unavoidable.",
          "What attribute CONNECTS them? branchNo, a foreign key in Staff referencing Branch.",
          "Assemble: filter Staff, join to Branch on branchNo, then project the three attributes."
        ],
        tags: ["writing-expressions", "multi-table", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q21",
        type: "free",
        fromProfessor: true,
        difficulty: "med",
        homeworkFormat: "short",
        prompt:
          "```\nHotel (hotelNo, hotelName, city)\nRoom (roomNo, hotelNo, type, price)\nBooking (hotelNo, guestNo, dateFrom, dateTo, roomNo)\nGuest (guestNo, guestName, guestAddress)\n```\n\nWrite a relational algebra expression to **list the hotel names of hotels that have a Suite costing more than 150.**",
        sampleAnswer:
          "Π hotelName ( Hotel ⋈ Hotel.hotelNo = Room.hotelNo (σ type = 'Suite' ∧ price > 150 (Room)) )",
        explanation:
          "hotelName is in Hotel; type and price are both in Room, so the two conditions combine with ∧ inside a single σ. The relations join on hotelNo. Dropping either condition, or trying to filter type out of Hotel, gives a different set of hotels. A semijoin form is equally correct if you project down to hotelName afterwards.",
        walkthroughSteps: [
          "What must be OUTPUT? hotelName, which lives in Hotel.",
          "What CONDITIONS are there? Two: type = 'Suite' and price > 150. Both are Room attributes.",
          "Two conditions on the same relation go inside one σ, joined by ∧.",
          "What CONNECTS Hotel and Room? hotelNo.",
          "Assemble: restrict Room, join to Hotel on hotelNo, project hotelName."
        ],
        tags: ["writing-expressions", "multi-table", ...EXAM_TAGS]
      },
      {
        id: "db-exam1-sim-q22",
        type: "free",
        fromProfessor: true,
        difficulty: "hard",
        homeworkFormat: "multi-step",
        prompt:
          "```\nHotel (hotelNo, hotelName, city)\nRoom (roomNo, hotelNo, type, price)\nBooking (hotelNo, guestNo, dateFrom, dateTo, roomNo)\nGuest (guestNo, guestName, guestAddress)\n```\n\n**List the details of all rooms at the Grosvenor Hotel, including the name of the guest staying in the room, if the room is occupied.**\n\nWrite the relational algebra expression, and state clearly which operator makes the phrase *“if the room is occupied”* work.",
        sampleAnswer:
          "A LEFT OUTER JOIN is what makes it work: an ordinary join would silently drop every unoccupied room, which is exactly the rooms the question asks to be listed.\n\nΠ roomNo, type, price, guestName (\n  (σ hotelNo = 'H01' (Room))\n  ⟕ Room.roomNo = Booking.roomNo\n  ( Π roomNo, guestName ( (σ hotelNo = 'H01' ∧ dateFrom ≤ today ∧ dateTo ≥ today (Booking)) ⋈ Booking.guestNo = Guest.guestNo Guest ) )\n)\n\nUnoccupied rooms come through with guestName NULL.",
        explanation:
          "The phrase 'if the room is occupied' is the whole question. An inner join returns nothing for a room with no current booking, so every empty room would vanish — and empty rooms are precisely what a room-status report exists to show. A left outer join preserves all of the hotel's rooms and leaves guestName NULL where nobody is staying.",
        walkthroughSteps: [
          "What must be OUTPUT? The room's details, plus the guest's name from Guest.",
          "What does 'if the room is occupied' tell you? That unoccupied rooms must still appear — the signal for an outer join.",
          "Which side is preserved? The rooms. So rooms go on the left and the join is a LEFT outer join.",
          "Build the occupancy side first: current bookings at this hotel, joined to Guest so the name is available.",
          "Join the rooms to that on roomNo, preserving the rooms, then project."
        ],
        tags: ["outer-join-left", "multi-table", ...EXAM_TAGS]
      }
    ]
  }
];
