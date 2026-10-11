import type { Question } from "@/lib/types";

const dreamHomeSchema = "Use MySQL 8.0 with ONLY_FULL_GROUP_BY enabled. These are pedagogical projections of the DreamHome case study sufficient for the queries below.\n\n- Branch(branchNo PRIMARY KEY, street, city).\n- Staff(staffNo PRIMARY KEY, fName, lName, position, branchNo FOREIGN KEY -> Branch.branchNo).\n- PropertyForRent(propertyNo PRIMARY KEY, city, staffNo NULL FOREIGN KEY -> Staff.staffNo, branchNo FOREIGN KEY -> Branch.branchNo).\n- Client(clientNo PRIMARY KEY, fName, lName).\n- Viewing(clientNo FOREIGN KEY -> Client.clientNo, propertyNo FOREIGN KEY -> PropertyForRent.propertyNo, comment NULL).\n\nUnless the question explicitly adds a condition, a property's staffNo identifies its assigned staff member; do not additionally require the property branch to equal that staff member's branch. A member of staff can manage a property without having the job title Manager.";

const branchData = "**Branch data**\n| branchNo | street | city |\n| --- | --- | --- |\n| B005 | 22 Deer Rd | London |\n| B007 | 16 Argyll St | Aberdeen |\n| B003 | 163 Main St | Glasgow |\n| B004 | 32 Manse Rd | Bristol |\n| B002 | 56 Clover Dr | London |";

const staffData = "**Staff data**\n| staffNo | fName | lName | position | branchNo |\n| --- | --- | --- | --- | --- |\n| SL21 | John | White | Manager | B005 |\n| SG37 | Ann | Beech | Assistant | B003 |\n| SG14 | David | Ford | Supervisor | B003 |\n| SA9 | Mary | Howe | Assistant | B007 |\n| SG5 | Susan | Brand | Manager | B003 |\n| SL41 | Julie | Lee | Assistant | B005 |";

const propertyData = "**PropertyForRent data**\n| propertyNo | city | staffNo | branchNo |\n| --- | --- | --- | --- |\n| PA14 | Aberdeen | SA9 | B007 |\n| PL94 | London | SL41 | B005 |\n| PG4 | Glasgow | NULL | B003 |\n| PG36 | Glasgow | SG37 | B003 |\n| PG21 | Glasgow | SG37 | B003 |\n| PG16 | Glasgow | SG14 | B003 |";

const clientData = "**Client data**\n| clientNo | fName | lName |\n| --- | --- | --- |\n| CR76 | John | Kay |\n| CR56 | Aline | Stewart |\n| CR74 | Mike | Ritchie |\n| CR62 | Mary | Tregear |";

const viewingData = "**Viewing data**\n| clientNo | propertyNo | comment |\n| --- | --- | --- |\n| CR56 | PA14 | too small |\n| CR76 | PG4 | too remote |\n| CR56 | PG4 | NULL |\n| CR62 | PA14 | no dining room |\n| CR56 | PG36 | NULL |\n\nThe two blank comment cells in the lecture screenshot are represented as NULL in this reconstructed table. A blank display by itself does not establish whether the stored value is NULL or an empty string.";

export const multiTableQuestions: Question[] = [
  {
    "id": "db-e2-multi-01",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + "Lecture 10 scalar-subquery exercise: list (staffNo, fName, lName, position) of staff who work at the branch on '163 Main St'. Use a scalar equality subquery and give the matching staffNos. Assume the street identifies at most one branch for this exercise.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, position\nFROM Staff\nWHERE branchNo = (\n    SELECT branchNo\n    FROM Branch\n    WHERE street = '163 Main St'\n);\n```\n\nThe inner query returns **B003**. Matching staffNos are **SG37, SG14, SG5** (output order is unspecified because no ORDER BY is requested). Their names are Ann Beech, David Ford, and Susan Brand.\n\nThe scalar subquery supplies one branch key to the outer equality predicate. The result includes all three staff positions at that branch, not only managers. Equality is appropriate only under the stated one-row guarantee.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, position\nFROM Staff\nWHERE branchNo = (\n    SELECT branchNo\n    FROM Branch\n    WHERE street = '163 Main St'\n);\n```\n\nThe inner query returns **B003**. Matching staffNos are **SG37, SG14, SG5** (output order is unspecified because no ORDER BY is requested). Their names are Ann Beech, David Ford, and Susan Brand.",
    "explanation": "The scalar subquery supplies one branch key to the outer equality predicate. The result includes all three staff positions at that branch, not only managers. Equality is appropriate only under the stated one-row guarantee.",
    "hintSteps": [
      "Find the branch key before selecting staff.",
      "The scalar comparison expects at most one branch row."
    ],
    "walkthroughSteps": [
      "Filter Branch to street 163 Main St, obtaining B003.",
      "Use that branchNo in the outer Staff predicate.",
      "Return the three B003 staff rows with the four requested attributes."
    ],
    "rubric": [
      {
        "criterion": "Uses a scalar Branch subquery filtered by the stated street.",
        "marks": 2
      },
      {
        "criterion": "Compares Staff.branchNo to the scalar branchNo result.",
        "marks": 2
      },
      {
        "criterion": "Returns SG37, SG14, SG5 with the requested columns.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 3-5"
    ],
    "tags": [
      "mysql",
      "lecture-exercise",
      "sql-scalar-subquery"
    ]
  },
  {
    "id": "db-e2-multi-02",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + "Lecture 10 IN-subquery exercise: return first name, last name, and position of every staff member working at a branch in London. Give the matching names; do not assume London has exactly one branch.",
    "sampleAnswer": "```sql\nSELECT fName, lName, position\nFROM Staff\nWHERE branchNo IN (\n    SELECT branchNo\n    FROM Branch\n    WHERE city = 'London'\n);\n```\n\nLondon branches are **B005 and B002**. The matching names are **John White (Manager)** and **Julie Lee (Assistant)**; B002 has no staff in the supplied data.\n\nIN accepts the single-column set of branch numbers and tests membership. A scalar = formulation would fail here because the London subquery returns two rows, even though only one of those branches has staff.",
    "solutionMd": "```sql\nSELECT fName, lName, position\nFROM Staff\nWHERE branchNo IN (\n    SELECT branchNo\n    FROM Branch\n    WHERE city = 'London'\n);\n```\n\nLondon branches are **B005 and B002**. The matching names are **John White (Manager)** and **Julie Lee (Assistant)**; B002 has no staff in the supplied data.",
    "explanation": "IN accepts the single-column set of branch numbers and tests membership. A scalar = formulation would fail here because the London subquery returns two rows, even though only one of those branches has staff.",
    "hintSteps": [
      "The city can identify multiple branches.",
      "Membership in a list is different from equality to one scalar value."
    ],
    "walkthroughSteps": [
      "Select London branchNos B005 and B002.",
      "Use IN to retain Staff rows from either branch.",
      "Identify John White and Julie Lee as the matching staff."
    ],
    "rubric": [
      {
        "criterion": "Uses IN with a one-column London branch subquery.",
        "marks": 2
      },
      {
        "criterion": "Does not incorrectly assume one London branch.",
        "marks": 2
      },
      {
        "criterion": "Returns John White and Julie Lee with their positions.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 6-7"
    ],
    "tags": [
      "mysql",
      "lecture-exercise",
      "sql-in-subquery"
    ]
  },
  {
    "id": "db-e2-multi-03",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + clientData + "\n\n" + viewingData + "\n\n" + "Lecture 10 Client/Viewing inner-join exercise: list (clientNo, fName, lName, propertyNo, comment) for all clients who viewed a property, including any supplied comment. Give the row count and identify the client absent from the result.",
    "sampleAnswer": "```sql\nSELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c\nJOIN Viewing AS v ON v.clientNo = c.clientNo;\n```\n\n**Five rows:** CR56 appears for PA14, PG4, PG36; CR62 for PA14; CR76 for PG4. **CR74** has no viewing and is absent. Both rows with NULL comments remain because they still satisfy the clientNo join condition.\n\nInner joins return matching row combinations. A repeated client can contribute multiple viewing rows; missing comments do not erase an otherwise matching viewing. DISTINCT or comment IS NOT NULL would change the exercise.",
    "solutionMd": "```sql\nSELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c\nJOIN Viewing AS v ON v.clientNo = c.clientNo;\n```\n\n**Five rows:** CR56 appears for PA14, PG4, PG36; CR62 for PA14; CR76 for PG4. **CR74** has no viewing and is absent. Both rows with NULL comments remain because they still satisfy the clientNo join condition.",
    "explanation": "Inner joins return matching row combinations. A repeated client can contribute multiple viewing rows; missing comments do not erase an otherwise matching viewing. DISTINCT or comment IS NOT NULL would change the exercise.",
    "hintSteps": [
      "One viewing gives one matching output row.",
      "No comment is different from no viewing."
    ],
    "walkthroughSteps": [
      "Match each Viewing.clientNo to its Client row.",
      "Project the client identity/name and viewing property/comment.",
      "Count five viewing matches and exclude only client CR74, which has none."
    ],
    "rubric": [
      {
        "criterion": "Uses the clientNo relationship in a valid inner join.",
        "marks": 2
      },
      {
        "criterion": "Returns the requested attributes and preserves NULL-comment viewings.",
        "marks": 2
      },
      {
        "criterion": "Identifies five rows and CR74 as the unmatched client.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 10-11"
    ],
    "tags": [
      "mysql",
      "lecture-exercise",
      "sql-inner-join"
    ]
  },
  {
    "id": "db-e2-multi-04",
    "type": "free",
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + propertyData + "\n\n" + "Lecture 10 three-table exercise: for each staff branch, list (branchNo, branch city, staffNo, fName, lName, propertyNo) for staff assigned to manage properties. Sort by branchNo, staffNo, propertyNo. Give the five (branchNo, staffNo, propertyNo) triples. Use the assigned staff relationship; do not impose a Manager job-title filter or an extra property-branch equality.",
    "sampleAnswer": "```sql\nSELECT b.branchNo, b.city, s.staffNo, s.fName, s.lName,\n       p.propertyNo\nFROM Branch AS b\nJOIN Staff AS s ON s.branchNo = b.branchNo\nJOIN PropertyForRent AS p ON p.staffNo = s.staffNo\nORDER BY b.branchNo, s.staffNo, p.propertyNo;\n```\n\n| branchNo | staffNo | propertyNo |\n| --- | --- | --- |\n| B003 | SG14 | PG16 |\n| B003 | SG37 | PG21 |\n| B003 | SG37 | PG36 |\n| B005 | SL41 | PL94 |\n| B007 | SA9 | PA14 |\n\nThe unassigned property PG4 is absent. SL21 and SG5 have the job title Manager but no assigned properties in this data, so they do not appear.\n\nThe two joins follow Branch -> Staff -> PropertyForRent. \"Manage properties\" means matching p.staffNo; it does not require s.position = Manager. The displayed city is the staff branch city.",
    "solutionMd": "```sql\nSELECT b.branchNo, b.city, s.staffNo, s.fName, s.lName,\n       p.propertyNo\nFROM Branch AS b\nJOIN Staff AS s ON s.branchNo = b.branchNo\nJOIN PropertyForRent AS p ON p.staffNo = s.staffNo\nORDER BY b.branchNo, s.staffNo, p.propertyNo;\n```\n\n| branchNo | staffNo | propertyNo |\n| --- | --- | --- |\n| B003 | SG14 | PG16 |\n| B003 | SG37 | PG21 |\n| B003 | SG37 | PG36 |\n| B005 | SL41 | PL94 |\n| B007 | SA9 | PA14 |\n\nThe unassigned property PG4 is absent. SL21 and SG5 have the job title Manager but no assigned properties in this data, so they do not appear.",
    "explanation": "The two joins follow Branch -> Staff -> PropertyForRent. \"Manage properties\" means matching p.staffNo; it does not require s.position = Manager. The displayed city is the staff branch city.",
    "hintSteps": [
      "Join staff to their branch, then properties to their assigned staff.",
      "A business role described in the question is not necessarily an equality on the position column."
    ],
    "walkthroughSteps": [
      "Join Branch and Staff on branchNo.",
      "Join PropertyForRent to Staff on staffNo, without adding an unstated property-branch restriction.",
      "Exclude nonmatches and sort the five matching triples as requested."
    ],
    "rubric": [
      {
        "criterion": "Correctly joins Branch -> Staff -> assigned PropertyForRent.",
        "marks": 2
      },
      {
        "criterion": "Selects branch city and the requested columns with the stated sort.",
        "marks": 2
      },
      {
        "criterion": "Gives all five triples and does not add Manager/property-branch restrictions.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 13-14"
    ],
    "tags": [
      "mysql",
      "lecture-exercise",
      "sql-three-table-join"
    ]
  },
  {
    "id": "db-e2-multi-05",
    "type": "single",
    "difficulty": "med",
    "points": 2,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + "What happens if the London exercise is changed to `WHERE branchNo = (SELECT branchNo FROM Branch WHERE city = 'London')` using the supplied data?",
    "options": [
      "It correctly returns staff at both London branches.",
      "It converts the two branch rows into one NULL automatically.",
      "MySQL raises an error because the scalar subquery returns more than one row.",
      "It silently selects whichever London branch is physically stored first."
    ],
    "correct": [
      2
    ],
    "explanation": "The London subquery returns B005 and B002. A scalar equality operand cannot contain both rows; it errors rather than selecting one. Use IN for multirow membership.",
    "hintSteps": [
      "Count rows returned by the inner Branch query.",
      "A scalar subquery cannot silently choose a row from a multirow result."
    ],
    "walkthroughSteps": [
      "Identify two London branches.",
      "Recognize the outer = requires a scalar value.",
      "Conclude a cardinality error, and use IN to express the intended membership."
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 3, 6, 8"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-scalar-subquery"
    ]
  },
  {
    "id": "db-e2-multi-06",
    "type": "free",
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + "Extend the Main St exercise: add Branch('B009','163 Main St','Bristol') and Staff('SX1','Alex','River','Assistant','B009') to the shown data. The street is no longer unique. Write a subquery version that safely lists staff at every branch on that street, and give the matching staffNo set.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, position\nFROM Staff\nWHERE branchNo IN (\n    SELECT branchNo\n    FROM Branch\n    WHERE street = '163 Main St'\n);\n```\n\nThe subquery returns **B003 and B009**. The matching staffNo set is **{SG37, SG14, SG5, SX1}**. The original scalar = version would raise a multirow error.\n\nThis added practice scenario deliberately removes the original exercise's uniqueness assumption. Choosing IN addresses the actual result shape; adding LIMIT 1 would silently lose an eligible branch.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, position\nFROM Staff\nWHERE branchNo IN (\n    SELECT branchNo\n    FROM Branch\n    WHERE street = '163 Main St'\n);\n```\n\nThe subquery returns **B003 and B009**. The matching staffNo set is **{SG37, SG14, SG5, SX1}**. The original scalar = version would raise a multirow error.",
    "explanation": "This added practice scenario deliberately removes the original exercise's uniqueness assumption. Choosing IN addresses the actual result shape; adding LIMIT 1 would silently lose an eligible branch.",
    "hintSteps": [
      "The inner street query now has two eligible branches.",
      "Do not use LIMIT 1 to discard part of the requested result."
    ],
    "walkthroughSteps": [
      "Add the explicitly supplied pedagogical branch/staff rows.",
      "Replace scalar equality with IN membership over both branch keys.",
      "Collect the original three B003 staff plus SX1 from B009."
    ],
    "rubric": [
      {
        "criterion": "Recognizes the scalar uniqueness assumption no longer holds.",
        "marks": 2
      },
      {
        "criterion": "Uses IN or an equivalent EXISTS/join without discarding an eligible branch.",
        "marks": 2
      },
      {
        "criterion": "Gives all four matching staffNos.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 3, 6, 8"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-in-subquery"
    ]
  },
  {
    "id": "db-e2-multi-07",
    "type": "single",
    "difficulty": "med",
    "points": 2,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + "The subquery `(SELECT branchNo FROM Branch WHERE street = 'No Such Street')` returns no rows. What does `WHERE Staff.branchNo = (that subquery)` do in MySQL?",
    "options": [
      "Returns every Staff row because the subquery has no restrictions left.",
      "Returns no Staff rows because the scalar subquery becomes NULL and equality is UNKNOWN.",
      "Raises the same error as a scalar subquery returning two rows.",
      "Selects only Staff rows whose branchNo is NULL because NULL = NULL is TRUE."
    ],
    "correct": [
      1
    ],
    "explanation": "An empty scalar subquery evaluates to NULL. Ordinary equality to NULL is UNKNOWN for every candidate, including one whose own branchNo is NULL; WHERE keeps only TRUE.",
    "hintSteps": [
      "Empty scalar results and multirow scalar results have different behavior.",
      "Recall how WHERE treats UNKNOWN."
    ],
    "walkthroughSteps": [
      "No branch satisfies the street condition.",
      "The scalar result is NULL, not a nonexistent literal branch key.",
      "Every equality test is UNKNOWN and no Staff row is retained."
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF page 3"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-null"
    ]
  },
  {
    "id": "db-e2-multi-08",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + clientData + "\n\n" + viewingData + "\n\n" + "Rewrite the Client/Viewing exercise with JOIN ... USING(clientNo), returning (clientNo, fName, lName, propertyNo, comment). Then give an equivalent older implicit-join formulation. Explain why neither should add DISTINCT.",
    "sampleAnswer": "```sql\nSELECT clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c\nJOIN Viewing AS v USING (clientNo);\n\nSELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c, Viewing AS v\nWHERE c.clientNo = v.clientNo;\n```\n\nBoth formulations return the same **five row combinations** as the explicit ON inner join. USING merges the shared join column for unqualified output; the implicit form relies on its WHERE predicate. The task is one row per viewing, so DISTINCT is not needed.\n\nON is the general form; USING applies when the intended join columns have the same name. The older comma syntax is equivalent here only because its equality condition is present. Omitting that condition creates a Cartesian product.",
    "solutionMd": "```sql\nSELECT clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c\nJOIN Viewing AS v USING (clientNo);\n\nSELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c, Viewing AS v\nWHERE c.clientNo = v.clientNo;\n```\n\nBoth formulations return the same **five row combinations** as the explicit ON inner join. USING merges the shared join column for unqualified output; the implicit form relies on its WHERE predicate. The task is one row per viewing, so DISTINCT is not needed.",
    "explanation": "ON is the general form; USING applies when the intended join columns have the same name. The older comma syntax is equivalent here only because its equality condition is present. Omitting that condition creates a Cartesian product.",
    "hintSteps": [
      "USING lists the common column name once.",
      "The comma-join version still needs a WHERE relationship condition."
    ],
    "walkthroughSteps": [
      "Replace the explicit clientNo equality with USING(clientNo).",
      "Write the comma-separated FROM list and restore equality in WHERE.",
      "Keep all five viewing combinations without unnecessary duplicate elimination."
    ],
    "rubric": [
      {
        "criterion": "Gives valid USING SQL with the requested projection.",
        "marks": 2
      },
      {
        "criterion": "Gives an equivalent implicit join with its equality condition.",
        "marks": 2
      },
      {
        "criterion": "Preserves the five viewing rows and explains why DISTINCT is not required.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF page 12"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-join-syntax"
    ]
  },
  {
    "id": "db-e2-multi-09",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + clientData + "\n\n" + viewingData + "\n\n" + "Extend the viewing report to include every client, even one with no viewing. Return (clientNo, fName, lName, propertyNo, comment). Give the output row count and explain the difference between an unmatched viewing and an existing viewing with a missing comment.",
    "sampleAnswer": "```sql\nSELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c\nLEFT JOIN Viewing AS v ON v.clientNo = c.clientNo;\n```\n\nThere are **six rows**: the five existing viewing matches plus one null-extended row for **CR74**. Existing viewings with NULL comments still have non-NULL propertyNo; the unmatched CR74 row has NULL propertyNo as well.\n\nLEFT JOIN preserves the Client relation. An existing nullable comment is not evidence of a missing Viewing row. A later WHERE v.comment IS NOT NULL would remove both missing-comment viewings and the unmatched client.",
    "solutionMd": "```sql\nSELECT c.clientNo, c.fName, c.lName, v.propertyNo, v.comment\nFROM Client AS c\nLEFT JOIN Viewing AS v ON v.clientNo = c.clientNo;\n```\n\nThere are **six rows**: the five existing viewing matches plus one null-extended row for **CR74**. Existing viewings with NULL comments still have non-NULL propertyNo; the unmatched CR74 row has NULL propertyNo as well.",
    "explanation": "LEFT JOIN preserves the Client relation. An existing nullable comment is not evidence of a missing Viewing row. A later WHERE v.comment IS NOT NULL would remove both missing-comment viewings and the unmatched client.",
    "hintSteps": [
      "Choose the relation that must survive without a match.",
      "Inspect a relationship/key value to distinguish an absent viewing from an absent comment."
    ],
    "walkthroughSteps": [
      "Start from Client and left join Viewing on clientNo.",
      "Keep all five matches and add the one unmatched client CR74.",
      "Distinguish missing Viewing by NULL joined propertyNo, not by comment alone."
    ],
    "rubric": [
      {
        "criterion": "Uses LEFT JOIN with Client as the preserved relation.",
        "marks": 2
      },
      {
        "criterion": "Gives six rows and identifies CR74 as the added unmatched client.",
        "marks": 2
      },
      {
        "criterion": "Explains NULL comment versus absent Viewing without filtering away preserved rows.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 10-12",
      "Homework  2 Part 1.pdf, PDF page 7"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-outer-join"
    ]
  },
  {
    "id": "db-e2-multi-10",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + clientData + "\n\n" + viewingData + "\n\n" + "List each client who has at least one viewing exactly once as (clientNo, fName, lName). Use a correlated EXISTS subquery rather than generating and deduplicating joined rows. Give the matching clientNo set.",
    "sampleAnswer": "```sql\nSELECT c.clientNo, c.fName, c.lName\nFROM Client AS c\nWHERE EXISTS (\n    SELECT 1\n    FROM Viewing AS v\n    WHERE v.clientNo = c.clientNo\n);\n```\n\nExpected clientNo set: **{CR56, CR62, CR76}**. CR56 appears once even though it has three viewings. CR74 has none and is excluded.\n\nEXISTS tests whether the correlated result has any row; it does not multiply the outer client by the number of matches. SELECT 1 is conventional because the projected subquery value is irrelevant to existence.",
    "solutionMd": "```sql\nSELECT c.clientNo, c.fName, c.lName\nFROM Client AS c\nWHERE EXISTS (\n    SELECT 1\n    FROM Viewing AS v\n    WHERE v.clientNo = c.clientNo\n);\n```\n\nExpected clientNo set: **{CR56, CR62, CR76}**. CR56 appears once even though it has three viewings. CR74 has none and is excluded.",
    "explanation": "EXISTS tests whether the correlated result has any row; it does not multiply the outer client by the number of matches. SELECT 1 is conventional because the projected subquery value is irrelevant to existence.",
    "hintSteps": [
      "The output needs client identities, not one row per viewing.",
      "Tie the subquery to the current outer client with a correlation predicate."
    ],
    "walkthroughSteps": [
      "Visit each Client row once.",
      "Test whether Viewing contains a matching clientNo for that outer row.",
      "Keep three client rows and avoid join fan-out for CR56."
    ],
    "rubric": [
      {
        "criterion": "Uses a correlated EXISTS with the clientNo relationship.",
        "marks": 2
      },
      {
        "criterion": "Returns each qualifying Client once with requested attributes.",
        "marks": 2
      },
      {
        "criterion": "Gives CR56, CR62, CR76 and explains why CR56 is not tripled.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 8, 10-11"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-exists"
    ]
  },
  {
    "id": "db-e2-multi-11",
    "type": "multi",
    "difficulty": "med",
    "points": 2,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + propertyData + "\n\n" + "Add the pedagogical row PropertyForRent('PX99','Glasgow','SL41','B003'). Explicitly allow staff to manage properties at a different branch from the one where they work. Which statements are correct for joining Staff to PropertyForRent? Select all that apply.",
    "options": [
      "An explicit ON p.staffNo = s.staffNo join includes PX99 assigned to SL41.",
      "NATURAL JOIN always uses only staffNo and ignores every other identically named column.",
      "NATURAL JOIN also compares branchNo in this schema, so it excludes the cross-branch PX99 assignment.",
      "A report using b.branchNo = s.branchNo displays B005 for SL41; that is the staff branch rather than the PX99 property branch."
    ],
    "correct": [
      0,
      2,
      3
    ],
    "explanation": "Staff and PropertyForRent share both staffNo and branchNo, so NATURAL JOIN adds an unstated branch equality. The explicitly permitted cross-branch assignment makes the difference observable: the intended staffNo join includes it, while NATURAL JOIN drops it.",
    "hintSteps": [
      "List every identically named column in the two schemas.",
      "The new record intentionally has a different property branch and staff branch."
    ],
    "walkthroughSteps": [
      "SL41 works at B005 but PX99 belongs to B003.",
      "ON staffNo alone connects PX99 to its assigned staff member.",
      "NATURAL JOIN also demands branchNo equality and therefore rejects this assignment."
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 12-14"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-natural-join"
    ]
  },
  {
    "id": "db-e2-multi-12",
    "type": "free",
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": dreamHomeSchema + "\n\n" + branchData + "\n\n" + staffData + "\n\n" + propertyData + "\n\n" + "Diagnose this attempted assigned-property report, repair it, and compare row counts using only the original supplied data.\n\n```sql\nSELECT b.branchNo, s.staffNo, p.propertyNo\nFROM Branch AS b\nJOIN Staff AS s ON s.branchNo = b.branchNo\nJOIN PropertyForRent AS p ON p.branchNo = b.branchNo;\n```\nThe goal is one row for each property with its assigned staff member, including that staff member's branch.",
    "sampleAnswer": "```sql\nSELECT b.branchNo, s.staffNo, p.propertyNo\nFROM Branch AS b\nJOIN Staff AS s ON s.branchNo = b.branchNo\nJOIN PropertyForRent AS p ON p.staffNo = s.staffNo\nORDER BY b.branchNo, s.staffNo, p.propertyNo;\n```\n\nThe incorrect query returns **15 rows**: B003 contributes 3 staff × 4 properties = 12; B005 contributes 2 × 1 = 2; B007 contributes 1 × 1 = 1. The corrected assignment join returns **5 rows**. The incorrect form even associates unassigned PG4 with all three B003 staff.\n\nJoining by common branch membership connects every local staff member with every local property, not just the assigned manager of each property. Fix the relationship edge using p.staffNo = s.staffNo; DISTINCT does not repair the wrong associations.",
    "solutionMd": "```sql\nSELECT b.branchNo, s.staffNo, p.propertyNo\nFROM Branch AS b\nJOIN Staff AS s ON s.branchNo = b.branchNo\nJOIN PropertyForRent AS p ON p.staffNo = s.staffNo\nORDER BY b.branchNo, s.staffNo, p.propertyNo;\n```\n\nThe incorrect query returns **15 rows**: B003 contributes 3 staff × 4 properties = 12; B005 contributes 2 × 1 = 2; B007 contributes 1 × 1 = 1. The corrected assignment join returns **5 rows**. The incorrect form even associates unassigned PG4 with all three B003 staff.",
    "explanation": "Joining by common branch membership connects every local staff member with every local property, not just the assigned manager of each property. Fix the relationship edge using p.staffNo = s.staffNo; DISTINCT does not repair the wrong associations.",
    "hintSteps": [
      "Ask which column records the actual staff assignment.",
      "Within each branch, the incorrect query multiplies staff count by property count."
    ],
    "walkthroughSteps": [
      "Count branch-wide combinations: 12 at B003, 2 at B005, 1 at B007.",
      "Replace the property branch condition with the property staff assignment condition.",
      "Enumerate the five non-NULL staff assignments and conclude the repaired result has five rows."
    ],
    "rubric": [
      {
        "criterion": "Diagnoses branch-wide fan-out and the missing assignment relationship.",
        "marks": 2
      },
      {
        "criterion": "Repairs the join using p.staffNo = s.staffNo without a cosmetic DISTINCT patch.",
        "marks": 2
      },
      {
        "criterion": "Correctly derives 15 incorrect rows and 5 assigned-property rows.",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 10 2026.pdf, PDF pages 13-14"
    ],
    "tags": [
      "mysql",
      "additional-practice",
      "sql-join-cardinality"
    ]
  },
];
