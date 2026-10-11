import type { Question } from "@/lib/types";

/** MySQL 8 practice, transcribed from lecture examples and class activity. */
export const lectureSqlQuestions: Question[] = [
  {
    "id": "db-e2-sql-01",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\nClassify each operation as DDL, DML, DCL, or TCL: CREATE TABLE, ALTER TABLE, DROP TABLE, SELECT, INSERT, UPDATE, DELETE, GRANT, REVOKE, BEGIN, COMMIT, ROLLBACK. State what each category controls.",
    "sampleAnswer": "DDL: CREATE TABLE, ALTER TABLE, DROP TABLE — define/change database structure.\nDML: SELECT, INSERT, UPDATE, DELETE — retrieve or change data.\nDCL: GRANT, REVOKE — control privileges.\nTCL: BEGIN, COMMIT, ROLLBACK — control transactions.\n\nLecture 7 treats SELECT as DML. The categories describe an operation's role: structure, data, permissions, or transaction boundaries.\n\n1. Classify CREATE/ALTER/DROP as schema definition.\n2. Classify retrieval and row changes as DML.\n3. Classify GRANT/REVOKE as privilege control.\n4. Classify BEGIN/COMMIT/ROLLBACK as transaction control.",
    "explanation": "Lecture 7 treats SELECT as DML. The categories describe an operation's role: structure, data, permissions, or transaction boundaries.",
    "solutionMd": "DDL: CREATE TABLE, ALTER TABLE, DROP TABLE — define/change database structure.\nDML: SELECT, INSERT, UPDATE, DELETE — retrieve or change data.\nDCL: GRANT, REVOKE — control privileges.\nTCL: BEGIN, COMMIT, ROLLBACK — control transactions.\n\nLecture 7 treats SELECT as DML. The categories describe an operation's role: structure, data, permissions, or transaction boundaries.\n\n1. Classify CREATE/ALTER/DROP as schema definition.\n2. Classify retrieval and row changes as DML.\n3. Classify GRANT/REVOKE as privilege control.\n4. Classify BEGIN/COMMIT/ROLLBACK as transaction control.",
    "hintSteps": [
      "Separate a table's structure from the rows stored in it.",
      "Permission changes and transaction completion belong to different categories."
    ],
    "walkthroughSteps": [
      "Classify CREATE/ALTER/DROP as schema definition.",
      "Classify retrieval and row changes as DML.",
      "Classify GRANT/REVOKE as privilege control.",
      "Classify BEGIN/COMMIT/ROLLBACK as transaction control."
    ],
    "rubric": [
      {
        "criterion": "Correctly defines DDL and classifies its three commands",
        "marks": 1
      },
      {
        "criterion": "Correctly defines DML and classifies its four commands",
        "marks": 1
      },
      {
        "criterion": "Correctly defines DCL and classifies its two commands",
        "marks": 1
      },
      {
        "criterion": "Correctly defines TCL and classifies its three commands",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 7.pdf, PDF page 3"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-7",
      "exam-style",
      "sql-components"
    ]
  },
  {
    "id": "db-e2-sql-02",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nExplain why `SELECT * FROM Staff WHERE salary > 10000;` is declarative. Does its written clause order specify the DBMS's physical execution algorithm? How do procedural extensions differ?",
    "sampleAnswer": "The query specifies which result is wanted: Staff rows with salary above 10000. It does not prescribe scans, indexes, join algorithms, or explicit loops. Its logical semantics are distinct from the optimizer's physical execution plan. Procedural extensions add explicit control flow such as IF/ELSE and iteration.\n\nCore SQL is declarative: state the desired information instead of an algorithm. An optimizer may use different physical strategies that preserve the query's meaning.\n\n1. Identify the output condition: salary above 10000.\n2. Notice that the query supplies no scan algorithm or loop.\n3. Explain that the DBMS chooses a physical plan.\n4. Contrast declarative selection with explicit procedural control flow.",
    "explanation": "Core SQL is declarative: state the desired information instead of an algorithm. An optimizer may use different physical strategies that preserve the query's meaning.",
    "solutionMd": "The query specifies which result is wanted: Staff rows with salary above 10000. It does not prescribe scans, indexes, join algorithms, or explicit loops. Its logical semantics are distinct from the optimizer's physical execution plan. Procedural extensions add explicit control flow such as IF/ELSE and iteration.\n\nCore SQL is declarative: state the desired information instead of an algorithm. An optimizer may use different physical strategies that preserve the query's meaning.\n\n1. Identify the output condition: salary above 10000.\n2. Notice that the query supplies no scan algorithm or loop.\n3. Explain that the DBMS chooses a physical plan.\n4. Contrast declarative selection with explicit procedural control flow.",
    "hintSteps": [
      "Ask whether the query describes the desired rows or the steps for searching them.",
      "Logical clause processing and a physical query plan are different concepts."
    ],
    "walkthroughSteps": [
      "Identify the output condition: salary above 10000.",
      "Notice that the query supplies no scan algorithm or loop.",
      "Explain that the DBMS chooses a physical plan.",
      "Contrast declarative selection with explicit procedural control flow."
    ],
    "rubric": [
      {
        "criterion": "Explains what/result versus how/algorithm",
        "marks": 2
      },
      {
        "criterion": "Distinguishes logical order from physical execution",
        "marks": 1
      },
      {
        "criterion": "Identifies explicit control flow as a procedural feature",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 7.pdf, PDF pages 4, 11"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-7",
      "exam-style",
      "declarative-sql"
    ]
  },
  {
    "id": "db-e2-sql-03",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\nExplain MySQL case sensitivity separately for SQL keywords, column identifiers, table/database identifiers, and comparisons of string values. A table is named `Staff`; can a query using `staff` be assumed portable across every MySQL installation?",
    "sampleAnswer": "SQL keywords and column identifiers are case-insensitive. Table/database identifier behavior depends on lower_case_table_names and the platform; therefore changing Staff to staff is not universally portable. String-value comparisons depend on the column/expression collation and must not be inferred from keyword behavior. Use a consistent identifier style and preserve the supplied table spelling.\n\nThe lecture explicitly separates keyword/column case from table/database case. String comparison is a separate collation question; this additional distinction prevents assuming that a case-insensitive keyword makes every value comparison case-insensitive.\n\n1. State the keyword rule and column-identifier rule.\n2. State the setting/platform dependence for table/database identifiers.\n3. Reject a universal portability claim for Staff versus staff.\n4. Separate string-data collation from identifier behavior.",
    "explanation": "The lecture explicitly separates keyword/column case from table/database case. String comparison is a separate collation question; this additional distinction prevents assuming that a case-insensitive keyword makes every value comparison case-insensitive.",
    "solutionMd": "SQL keywords and column identifiers are case-insensitive. Table/database identifier behavior depends on lower_case_table_names and the platform; therefore changing Staff to staff is not universally portable. String-value comparisons depend on the column/expression collation and must not be inferred from keyword behavior. Use a consistent identifier style and preserve the supplied table spelling.\n\nThe lecture explicitly separates keyword/column case from table/database case. String comparison is a separate collation question; this additional distinction prevents assuming that a case-insensitive keyword makes every value comparison case-insensitive.\n\n1. State the keyword rule and column-identifier rule.\n2. State the setting/platform dependence for table/database identifiers.\n3. Reject a universal portability claim for Staff versus staff.\n4. Separate string-data collation from identifier behavior.",
    "hintSteps": [
      "Do not apply one case rule to every kind of SQL token.",
      "The lecture names both a MySQL setting and the underlying platform for table/database names."
    ],
    "walkthroughSteps": [
      "State the keyword rule and column-identifier rule.",
      "State the setting/platform dependence for table/database identifiers.",
      "Reject a universal portability claim for Staff versus staff.",
      "Separate string-data collation from identifier behavior."
    ],
    "rubric": [
      {
        "criterion": "Correctly states keyword and column-identifier behavior",
        "marks": 1
      },
      {
        "criterion": "Names setting/platform dependence for tables/databases",
        "marks": 2
      },
      {
        "criterion": "Rejects universal Staff/staff equivalence and distinguishes data collation",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 7.pdf, PDF pages 6-7"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-7",
      "exam-style",
      "mysql-case"
    ]
  },
  {
    "id": "db-e2-sql-04",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\nA MySQL table named `order` has columns `id`, `city`, and `amount`. Repair `SELECT id FROM order WHERE city = London AND amount > '650.00';` using explicit identifier quoting and the lecture's literal conventions. Explain identifier quotes versus string quotes.",
    "sampleAnswer": "```sql\nSELECT id\nFROM `order`\nWHERE city = 'London'\n  AND amount > 650.00;\n```\n\n`order` conflicts with a reserved word and is quoted with MySQL backticks. London is a string literal and uses single quotes. 650.00 is a numeric literal and is written without quotes. MySQL may coerce a quoted numeric string, but the requested repair follows the numeric-literal convention.\n\n1. Quote the reserved table identifier with backticks.\n2. Quote London with single quotes.\n3. Use 650.00 as a numeric literal and preserve the AND condition.",
    "explanation": "`order` conflicts with a reserved word and is quoted with MySQL backticks. London is a string literal and uses single quotes. 650.00 is a numeric literal and is written without quotes. MySQL may coerce a quoted numeric string, but the requested repair follows the numeric-literal convention.",
    "solutionMd": "```sql\nSELECT id\nFROM `order`\nWHERE city = 'London'\n  AND amount > 650.00;\n```\n\n`order` conflicts with a reserved word and is quoted with MySQL backticks. London is a string literal and uses single quotes. 650.00 is a numeric literal and is written without quotes. MySQL may coerce a quoted numeric string, but the requested repair follows the numeric-literal convention.\n\n1. Quote the reserved table identifier with backticks.\n2. Quote London with single quotes.\n3. Use 650.00 as a numeric literal and preserve the AND condition.",
    "hintSteps": [
      "A reserved table name is an identifier, not a string literal.",
      "String literals need quotes; numeric literals do not."
    ],
    "walkthroughSteps": [
      "Quote the reserved table identifier with backticks.",
      "Quote London with single quotes.",
      "Use 650.00 as a numeric literal and preserve the AND condition."
    ],
    "rubric": [
      {
        "criterion": "Uses backticks for the reserved identifier",
        "marks": 1
      },
      {
        "criterion": "Uses a single-quoted string and an unquoted numeric literal",
        "marks": 1
      },
      {
        "criterion": "Preserves the intended selection/projection and explains the distinction",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 7.pdf, PDF pages 6, 9"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-7",
      "exam-style",
      "sql-literals"
    ]
  },
  {
    "id": "db-e2-sql-05",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\nWrite (a) the normal written order and (b) the conceptual logical processing order of SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY, and LIMIT. Explain why row conditions belong in WHERE and aggregate group conditions belong in HAVING.",
    "sampleAnswer": "Written: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.\nLogical: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.\nWHERE filters source rows before aggregation; HAVING filters aggregate groups after grouping. These are conceptual semantics, not a required physical execution plan.\n\nThe two orders differ. The logical model explains why a direct aggregate expression is unavailable in WHERE and why HAVING can test a group total.\n\n1. List the written clause sequence.\n2. List the conceptual FROM-to-LIMIT sequence.\n3. Locate WHERE before grouping and HAVING after grouping.\n4. Explain that the optimizer can choose another physical plan with the same semantics.",
    "explanation": "The two orders differ. The logical model explains why a direct aggregate expression is unavailable in WHERE and why HAVING can test a group total.",
    "solutionMd": "Written: SELECT → FROM → WHERE → GROUP BY → HAVING → ORDER BY → LIMIT.\nLogical: FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY → LIMIT.\nWHERE filters source rows before aggregation; HAVING filters aggregate groups after grouping. These are conceptual semantics, not a required physical execution plan.\n\nThe two orders differ. The logical model explains why a direct aggregate expression is unavailable in WHERE and why HAVING can test a group total.\n\n1. List the written clause sequence.\n2. List the conceptual FROM-to-LIMIT sequence.\n3. Locate WHERE before grouping and HAVING after grouping.\n4. Explain that the optimizer can choose another physical plan with the same semantics.",
    "hintSteps": [
      "The written statement begins with SELECT, but rows originate in FROM.",
      "Groups do not exist yet when WHERE filters the source rows."
    ],
    "walkthroughSteps": [
      "List the written clause sequence.",
      "List the conceptual FROM-to-LIMIT sequence.",
      "Locate WHERE before grouping and HAVING after grouping.",
      "Explain that the optimizer can choose another physical plan with the same semantics."
    ],
    "rubric": [
      {
        "criterion": "Correct written order",
        "marks": 1
      },
      {
        "criterion": "Correct conceptual logical order",
        "marks": 2
      },
      {
        "criterion": "Correct WHERE/HAVING roles and physical-plan distinction",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 7.pdf, PDF pages 10-11",
      "Lecture 9 Final.pdf, PDF pages 18, 30"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-7",
      "exam-style",
      "clause-order"
    ]
  },
  {
    "id": "db-e2-sql-06",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nWrite a query returning staffNo, fName, lName, and annual salary/12 AS monthlySalary for the two highest-paid staff with annual salary above 10000. Break salary ties by staffNo ascending so the top-two result is deterministic.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, salary / 12 AS monthlySalary\nFROM Staff\nWHERE salary > 10000\nORDER BY salary DESC, staffNo ASC\nLIMIT 2;\n```\n\nWHERE filters annual salaries, SELECT computes the output expression, ORDER BY chooses a deterministic priority, and MySQL LIMIT returns two rows. An alias for monthlySalary does not change the stored salary column.\n\n1. Select the requested identifiers and calculate salary/12 with the requested alias.\n2. Filter with salary > 10000.\n3. Order by salary descending and staffNo ascending.\n4. Apply LIMIT 2 after defining the order.",
    "explanation": "WHERE filters annual salaries, SELECT computes the output expression, ORDER BY chooses a deterministic priority, and MySQL LIMIT returns two rows. An alias for monthlySalary does not change the stored salary column.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, salary / 12 AS monthlySalary\nFROM Staff\nWHERE salary > 10000\nORDER BY salary DESC, staffNo ASC\nLIMIT 2;\n```\n\nWHERE filters annual salaries, SELECT computes the output expression, ORDER BY chooses a deterministic priority, and MySQL LIMIT returns two rows. An alias for monthlySalary does not change the stored salary column.\n\n1. Select the requested identifiers and calculate salary/12 with the requested alias.\n2. Filter with salary > 10000.\n3. Order by salary descending and staffNo ascending.\n4. Apply LIMIT 2 after defining the order.",
    "hintSteps": [
      "Apply the annual salary condition before sorting.",
      "Sort greatest salary first; use the unique staff number to resolve equal salaries."
    ],
    "walkthroughSteps": [
      "Select the requested identifiers and calculate salary/12 with the requested alias.",
      "Filter with salary > 10000.",
      "Order by salary descending and staffNo ascending.",
      "Apply LIMIT 2 after defining the order."
    ],
    "rubric": [
      {
        "criterion": "Correct projection, division, and alias",
        "marks": 1
      },
      {
        "criterion": "Correct annual-salary WHERE condition",
        "marks": 1
      },
      {
        "criterion": "Correct descending salary plus ascending tie-break",
        "marks": 1
      },
      {
        "criterion": "Correct MySQL LIMIT 2",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 7.pdf, PDF pages 10-11",
      "Lecture 8.pdf, PDF pages 8-9",
      "Lecture 9 Final.pdf, PDF page 9"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-7",
      "exam-style",
      "limit",
      "calculated-fields"
    ]
  },
  {
    "id": "db-e2-sql-07",
    "type": "single",
    "difficulty": "med",
    "points": 1,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\nWhich statement about the alias in `SELECT salary / 12 AS monthlySalary FROM Staff ...` matches the lecture's MySQL rules?",
    "options": [
      "The alias may be used in WHERE because SELECT is written first",
      "The alias may be used in ORDER BY but not in WHERE at the same query level",
      "The alias permanently renames the stored salary column",
      "The alias must be enclosed in double quotes to become available"
    ],
    "correct": [
      1
    ],
    "explanation": "MySQL permits SELECT aliases in ORDER BY, GROUP BY, and HAVING, but not in WHERE at that query level. An output alias does not rename the base-table column.",
    "hintSteps": [
      "Consider logical processing: WHERE precedes the SELECT expression.",
      "The lecture lists the clauses where MySQL permits SELECT aliases."
    ],
    "walkthroughSteps": [
      "Recognize monthlySalary as an output alias.",
      "Exclude WHERE, which filters the source rows before that alias is defined.",
      "Use ORDER BY for the output expression if needed."
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF page 31"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "aliases"
    ]
  },
  {
    "id": "db-e2-sql-ex6-1",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nList full details of all staff. Write both an explicit-column query and a `*` query. Use the eight-column schema shown here; no address column is present.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, position, sex, DOB, salary, branchNo\nFROM Staff;\n\nSELECT *\nFROM Staff;\n```\n\nBoth queries return all columns and all rows. The displayed eight-column table does not contain address, even though the slide's explicit query includes it; the adaptation uses the actual supplied schema. No row order is guaranteed without ORDER BY.\n\n1. Read the exact eight-column schema.\n2. Write all eight columns in SELECT and Staff in FROM.\n3. Write the equivalent SELECT * form and avoid the absent address column.",
    "explanation": "Both queries return all columns and all rows. The displayed eight-column table does not contain address, even though the slide's explicit query includes it; the adaptation uses the actual supplied schema. No row order is guaranteed without ORDER BY.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, position, sex, DOB, salary, branchNo\nFROM Staff;\n\nSELECT *\nFROM Staff;\n```\n\nBoth queries return all columns and all rows. The displayed eight-column table does not contain address, even though the slide's explicit query includes it; the adaptation uses the actual supplied schema. No row order is guaranteed without ORDER BY.\n\n1. Read the exact eight-column schema.\n2. Write all eight columns in SELECT and Staff in FROM.\n3. Write the equivalent SELECT * form and avoid the absent address column.",
    "hintSteps": [
      "With no row restriction, no WHERE clause is needed.",
      "The star is shorthand for every column in the supplied schema."
    ],
    "walkthroughSteps": [
      "Read the exact eight-column schema.",
      "Write all eight columns in SELECT and Staff in FROM.",
      "Write the equivalent SELECT * form and avoid the absent address column."
    ],
    "rubric": [
      {
        "criterion": "Explicit projection includes all eight actual columns",
        "marks": 2
      },
      {
        "criterion": "Provides valid SELECT * alternative with correct FROM",
        "marks": 1
      },
      {
        "criterion": "Does not add a filter or absent address column",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 1-3"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "slide-exercise",
      "example-6-1",
      "select-projection",
      "adapted-source"
    ]
  },
  {
    "id": "db-e2-sql-ex6-2",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nProduce a list of salaries for all staff, showing only staff number, first name, last name, and salary.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, salary\nFROM Staff;\n```\n\nProjection chooses four columns without filtering any staff rows. DISTINCT is not needed to satisfy this request.\n\n1. Identify the four requested output columns.\n2. Place them in SELECT.\n3. Read from Staff with no WHERE restriction.",
    "explanation": "Projection chooses four columns without filtering any staff rows. DISTINCT is not needed to satisfy this request.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, salary\nFROM Staff;\n```\n\nProjection chooses four columns without filtering any staff rows. DISTINCT is not needed to satisfy this request.\n\n1. Identify the four requested output columns.\n2. Place them in SELECT.\n3. Read from Staff with no WHERE restriction.",
    "hintSteps": [
      "The request restricts columns, not rows.",
      "Use fName and lName from the supplied schema."
    ],
    "walkthroughSteps": [
      "Identify the four requested output columns.",
      "Place them in SELECT.",
      "Read from Staff with no WHERE restriction."
    ],
    "rubric": [
      {
        "criterion": "Projects exactly the four requested columns",
        "marks": 2
      },
      {
        "criterion": "Correct FROM with no unintended row restriction",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 4-5"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "slide-exercise",
      "example-6-2",
      "select-projection"
    ]
  },
  {
    "id": "db-e2-sql-ex6-3",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Viewing(clientNo, propertyNo, viewDate DATE, comment)`; comment may be NULL.\n\nList each property number that has been viewed once, even if it appears in several Viewing rows. Also state what changes if DISTINCT is removed.",
    "sampleAnswer": "```sql\nSELECT DISTINCT propertyNo\nFROM Viewing;\n```\n\nDISTINCT removes duplicate property numbers from the projected result. Without it, each Viewing row contributes a propertyNo, so repeated viewings can repeat a property number. DISTINCT does not imply an output order.\n\n1. Project propertyNo from Viewing.\n2. Use DISTINCT to collapse repeated selected values.\n3. Explain that omitting DISTINCT retains duplicates from repeated viewings.",
    "explanation": "DISTINCT removes duplicate property numbers from the projected result. Without it, each Viewing row contributes a propertyNo, so repeated viewings can repeat a property number. DISTINCT does not imply an output order.",
    "solutionMd": "```sql\nSELECT DISTINCT propertyNo\nFROM Viewing;\n```\n\nDISTINCT removes duplicate property numbers from the projected result. Without it, each Viewing row contributes a propertyNo, so repeated viewings can repeat a property number. DISTINCT does not imply an output order.\n\n1. Project propertyNo from Viewing.\n2. Use DISTINCT to collapse repeated selected values.\n3. Explain that omitting DISTINCT retains duplicates from repeated viewings.",
    "hintSteps": [
      "A property can appear in many viewing rows.",
      "Duplicate elimination applies to the selected property number, not to all Viewing columns."
    ],
    "walkthroughSteps": [
      "Project propertyNo from Viewing.",
      "Use DISTINCT to collapse repeated selected values.",
      "Explain that omitting DISTINCT retains duplicates from repeated viewings."
    ],
    "rubric": [
      {
        "criterion": "Correct propertyNo projection and FROM",
        "marks": 1
      },
      {
        "criterion": "Uses DISTINCT at the projection level",
        "marks": 1
      },
      {
        "criterion": "Explains duplicate retention without DISTINCT",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 6-7"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "slide-exercise",
      "example-6-3",
      "distinct"
    ]
  },
  {
    "id": "db-e2-sql-ex6-4",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nProduce monthly salaries for all staff, showing staffNo, fName, lName, and salary/12. Name the calculated column monthlySalary. Assume salary stores the annual amount.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, salary / 12 AS monthlySalary\nFROM Staff;\n```\n\nDivision converts each annual amount to its monthly amount and AS names the output expression. It does not update salary in Staff.\n\n1. Select staffNo and both name columns.\n2. Divide salary by 12 for each row.\n3. Name the expression monthlySalary and use Staff as the source.",
    "explanation": "Division converts each annual amount to its monthly amount and AS names the output expression. It does not update salary in Staff.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, salary / 12 AS monthlySalary\nFROM Staff;\n```\n\nDivision converts each annual amount to its monthly amount and AS names the output expression. It does not update salary in Staff.\n\n1. Select staffNo and both name columns.\n2. Divide salary by 12 for each row.\n3. Name the expression monthlySalary and use Staff as the source.",
    "hintSteps": [
      "Convert one annual salary to a monthly amount without changing the table.",
      "AS provides the requested result-column name."
    ],
    "walkthroughSteps": [
      "Select staffNo and both name columns.",
      "Divide salary by 12 for each row.",
      "Name the expression monthlySalary and use Staff as the source."
    ],
    "rubric": [
      {
        "criterion": "Correct identifiers and FROM",
        "marks": 1
      },
      {
        "criterion": "Uses salary/12 and requested alias",
        "marks": 2
      },
      {
        "criterion": "Does not use UPDATE or filter staff",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 8-9"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "slide-exercise",
      "example-6-4",
      "calculated-fields"
    ]
  },
  {
    "id": "db-e2-sql-ex6-5",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nList staffNo, fName, lName, position, and salary for all staff with salary greater than 10000.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, position, salary\nFROM Staff\nWHERE salary > 10000;\n```\n\nThe strict greater-than comparison excludes salary exactly 10000. The condition is a row filter in WHERE.\n\n1. Select the five requested columns.\n2. Read Staff rows.\n3. Keep only rows satisfying salary > 10000.",
    "explanation": "The strict greater-than comparison excludes salary exactly 10000. The condition is a row filter in WHERE.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, position, salary\nFROM Staff\nWHERE salary > 10000;\n```\n\nThe strict greater-than comparison excludes salary exactly 10000. The condition is a row filter in WHERE.\n\n1. Select the five requested columns.\n2. Read Staff rows.\n3. Keep only rows satisfying salary > 10000.",
    "hintSteps": [
      "Greater than is different from greater than or equal to.",
      "The requested filter concerns individual staff rows."
    ],
    "walkthroughSteps": [
      "Select the five requested columns.",
      "Read Staff rows.",
      "Keep only rows satisfying salary > 10000."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct strict comparison in WHERE",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 10-11"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "slide-exercise",
      "example-6-5",
      "where-comparison"
    ]
  },
  {
    "id": "db-e2-sql-ex6-6",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Branch(branchNo PRIMARY KEY, street, city, postcode)`\n\nList branch addresses for offices in London or Glasgow. Return street, city, and postcode only.",
    "sampleAnswer": "```sql\nSELECT street, city, postcode\nFROM Branch\nWHERE city = 'London' OR city = 'Glasgow';\n```\n\nOR accepts either city. `city IN ('London', 'Glasgow')` is equivalent. The original example uses SELECT *; this adaptation explicitly asks for the three address columns rather than full branch details.\n\n1. Project the three requested address fields.\n2. Compare city to each single-quoted literal.\n3. Combine the alternatives with OR.",
    "explanation": "OR accepts either city. `city IN ('London', 'Glasgow')` is equivalent. The original example uses SELECT *; this adaptation explicitly asks for the three address columns rather than full branch details.",
    "solutionMd": "```sql\nSELECT street, city, postcode\nFROM Branch\nWHERE city = 'London' OR city = 'Glasgow';\n```\n\nOR accepts either city. `city IN ('London', 'Glasgow')` is equivalent. The original example uses SELECT *; this adaptation explicitly asks for the three address columns rather than full branch details.\n\n1. Project the three requested address fields.\n2. Compare city to each single-quoted literal.\n3. Combine the alternatives with OR.",
    "hintSteps": [
      "One city value cannot equal London and Glasgow simultaneously.",
      "Use OR or an equivalent IN predicate for either allowed city."
    ],
    "walkthroughSteps": [
      "Project the three requested address fields.",
      "Compare city to each single-quoted literal.",
      "Combine the alternatives with OR."
    ],
    "rubric": [
      {
        "criterion": "Correct address projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct London-or-Glasgow predicate",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 12"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "slide-exercise",
      "example-6-6",
      "boolean-conditions",
      "adapted-source"
    ]
  },
  {
    "id": "db-e2-sql-ex6-7",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nList staffNo, fName, lName, position, and salary for salaries between 20000 and 30000, inclusive. Write a BETWEEN query and an equivalent comparison query.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, position, salary\nFROM Staff\nWHERE salary BETWEEN 20000 AND 30000;\n\nSELECT staffNo, fName, lName, position, salary\nFROM Staff\nWHERE salary >= 20000 AND salary <= 30000;\n```\n\nBETWEEN includes both endpoints. Both bounds must hold, so the equivalent comparison uses AND. NOT BETWEEN excludes the inclusive range for non-NULL salaries; a NULL salary makes either test UNKNOWN.\n\n1. Write the requested projection and FROM.\n2. Use BETWEEN with the lower bound first.\n3. Expand to >= 20000 AND <= 30000.\n4. Check values exactly at 20000 and 30000: both qualify.",
    "explanation": "BETWEEN includes both endpoints. Both bounds must hold, so the equivalent comparison uses AND. NOT BETWEEN excludes the inclusive range for non-NULL salaries; a NULL salary makes either test UNKNOWN.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, position, salary\nFROM Staff\nWHERE salary BETWEEN 20000 AND 30000;\n\nSELECT staffNo, fName, lName, position, salary\nFROM Staff\nWHERE salary >= 20000 AND salary <= 30000;\n```\n\nBETWEEN includes both endpoints. Both bounds must hold, so the equivalent comparison uses AND. NOT BETWEEN excludes the inclusive range for non-NULL salaries; a NULL salary makes either test UNKNOWN.\n\n1. Write the requested projection and FROM.\n2. Use BETWEEN with the lower bound first.\n3. Expand to >= 20000 AND <= 30000.\n4. Check values exactly at 20000 and 30000: both qualify.",
    "hintSteps": [
      "BETWEEN includes both lower and upper endpoints.",
      "The expanded range requires both comparisons to hold."
    ],
    "walkthroughSteps": [
      "Write the requested projection and FROM.",
      "Use BETWEEN with the lower bound first.",
      "Expand to >= 20000 AND <= 30000.",
      "Check values exactly at 20000 and 30000: both qualify."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct BETWEEN bounds",
        "marks": 1
      },
      {
        "criterion": "Equivalent inclusive AND comparisons",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 1-3"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-7",
      "between"
    ]
  },
  {
    "id": "db-e2-sql-ex6-8",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nList staffNo, fName, lName, and position for all Managers and Supervisors, using IN.",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, position\nFROM Staff\nWHERE position IN ('Manager', 'Supervisor');\n```\n\nIN tests membership in the two-value set and is equivalent to an OR of equalities. It is not an AND requiring one row to have two different position values.\n\n1. Select the four requested columns from Staff.\n2. Put both permitted strings into an IN list.\n3. Explain its equivalence to two OR-connected equalities.",
    "explanation": "IN tests membership in the two-value set and is equivalent to an OR of equalities. It is not an AND requiring one row to have two different position values.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, position\nFROM Staff\nWHERE position IN ('Manager', 'Supervisor');\n```\n\nIN tests membership in the two-value set and is equivalent to an OR of equalities. It is not an AND requiring one row to have two different position values.\n\n1. Select the four requested columns from Staff.\n2. Put both permitted strings into an IN list.\n3. Explain its equivalence to two OR-connected equalities.",
    "hintSteps": [
      "The allowed positions form a small set.",
      "Both position values are character strings and need single quotes."
    ],
    "walkthroughSteps": [
      "Select the four requested columns from Staff.",
      "Put both permitted strings into an IN list.",
      "Explain its equivalence to two OR-connected equalities."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct IN list of both positions",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 4"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-8",
      "in-membership"
    ]
  },
  {
    "id": "db-e2-sql-ex6-9",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`PrivateOwner(ownerNo PRIMARY KEY, fName, lName, address, telNo)`\n\nFind all owners whose address contains the string Glasgow anywhere. Return ownerNo, fName, lName, address, and telNo.",
    "sampleAnswer": "```sql\nSELECT ownerNo, fName, lName, address, telNo\nFROM PrivateOwner\nWHERE address LIKE '%Glasgow%';\n```\n\nThe leading and trailing percent wildcards permit any sequence of characters before or after Glasgow, including an empty sequence. Case matching follows the supplied column collation.\n\n1. Select the requested owner fields.\n2. Use LIKE against address.\n3. Place percent wildcards on both sides of Glasgow.",
    "explanation": "The leading and trailing percent wildcards permit any sequence of characters before or after Glasgow, including an empty sequence. Case matching follows the supplied column collation.",
    "solutionMd": "```sql\nSELECT ownerNo, fName, lName, address, telNo\nFROM PrivateOwner\nWHERE address LIKE '%Glasgow%';\n```\n\nThe leading and trailing percent wildcards permit any sequence of characters before or after Glasgow, including an empty sequence. Case matching follows the supplied column collation.\n\n1. Select the requested owner fields.\n2. Use LIKE against address.\n3. Place percent wildcards on both sides of Glasgow.",
    "hintSteps": [
      "A contains test must allow characters before and after the target.",
      "Percent matches zero or more characters; underscore matches exactly one."
    ],
    "walkthroughSteps": [
      "Select the requested owner fields.",
      "Use LIKE against address.",
      "Place percent wildcards on both sides of Glasgow."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct contains pattern with both wildcards",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 5-6"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-9",
      "like-patterns"
    ]
  },
  {
    "id": "db-e2-sql-ex6-10",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Viewing(clientNo, propertyNo, viewDate DATE, comment)`; comment may be NULL.\n\nFor property PG4, list clientNo and viewDate where no comment was supplied. In this question an absent comment is SQL NULL, not an empty string.",
    "sampleAnswer": "```sql\nSELECT clientNo, viewDate\nFROM Viewing\nWHERE propertyNo = 'PG4'\n  AND comment IS NULL;\n```\n\nIS NULL is the missing-value test. `comment = NULL` evaluates to UNKNOWN and does not select NULL comments. An empty string is a different value and is excluded under the stated definition.\n\n1. Project clientNo and viewDate.\n2. Filter the required property with a string equality.\n3. Combine it with comment IS NULL using AND.",
    "explanation": "IS NULL is the missing-value test. `comment = NULL` evaluates to UNKNOWN and does not select NULL comments. An empty string is a different value and is excluded under the stated definition.",
    "solutionMd": "```sql\nSELECT clientNo, viewDate\nFROM Viewing\nWHERE propertyNo = 'PG4'\n  AND comment IS NULL;\n```\n\nIS NULL is the missing-value test. `comment = NULL` evaluates to UNKNOWN and does not select NULL comments. An empty string is a different value and is excluded under the stated definition.\n\n1. Project clientNo and viewDate.\n2. Filter the required property with a string equality.\n3. Combine it with comment IS NULL using AND.",
    "hintSteps": [
      "A comparison using = NULL does not become TRUE for missing values.",
      "Both the PG4 restriction and the missing-comment restriction must hold."
    ],
    "walkthroughSteps": [
      "Project clientNo and viewDate.",
      "Filter the required property with a string equality.",
      "Combine it with comment IS NULL using AND."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source/property restriction",
        "marks": 1
      },
      {
        "criterion": "Uses IS NULL, without conflating empty strings",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 7"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-10",
      "null-tests",
      "adapted-source"
    ]
  },
  {
    "id": "db-e2-sql-ex6-11",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nList staffNo, fName, lName, and salary in descending salary order. Is the order of two staff with equal salaries guaranteed by this query?",
    "sampleAnswer": "```sql\nSELECT staffNo, fName, lName, salary\nFROM Staff\nORDER BY salary DESC;\n\n-- No. Equal-salary rows have no specified relative order.\n-- Add a unique secondary key such as staffNo ASC if a deterministic tie order is required.\n```\n\nDESC puts the largest salary first. The displayed slide happens to show one order for the two 9000 salaries, but a single salary key does not guarantee that tie order.\n\n1. Select the requested staff details.\n2. Apply ORDER BY salary DESC.\n3. Explain that ties require another key for a deterministic order.",
    "explanation": "DESC puts the largest salary first. The displayed slide happens to show one order for the two 9000 salaries, but a single salary key does not guarantee that tie order.",
    "solutionMd": "```sql\nSELECT staffNo, fName, lName, salary\nFROM Staff\nORDER BY salary DESC;\n\n-- No. Equal-salary rows have no specified relative order.\n-- Add a unique secondary key such as staffNo ASC if a deterministic tie order is required.\n```\n\nDESC puts the largest salary first. The displayed slide happens to show one order for the two 9000 salaries, but a single salary key does not guarantee that tie order.\n\n1. Select the requested staff details.\n2. Apply ORDER BY salary DESC.\n3. Explain that ties require another key for a deterministic order.",
    "hintSteps": [
      "Highest salary first requires DESC.",
      "A sort key that ties cannot decide the order of those tied rows."
    ],
    "walkthroughSteps": [
      "Select the requested staff details.",
      "Apply ORDER BY salary DESC.",
      "Explain that ties require another key for a deterministic order."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source and descending salary order",
        "marks": 2
      },
      {
        "criterion": "Correct tie-order explanation",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 9-10"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-11",
      "order-by"
    ]
  },
  {
    "id": "db-e2-sql-ex6-12",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`PropertyForRent(propertyNo PRIMARY KEY, type, rooms, rent)`\n\nProduce an abbreviated property list (propertyNo, type, rooms, rent), sorted first by type ascending and then by rent descending within each type. Explain why ORDER BY type alone is insufficient.",
    "sampleAnswer": "```sql\nSELECT propertyNo, type, rooms, rent\nFROM PropertyForRent\nORDER BY type ASC, rent DESC;\n```\n\nSort keys apply left to right. Type puts flats before houses under the stated ordinary alphabetical order; rent desc orders rows within each type. ORDER BY type alone leaves same-type rows without a specified relative order.\n\n1. Project the four requested property fields.\n2. Use type ASC as the primary key.\n3. Use rent DESC as the secondary key.\n4. Explain the unresolved same-type ties in a one-key query.",
    "explanation": "Sort keys apply left to right. Type puts flats before houses under the stated ordinary alphabetical order; rent desc orders rows within each type. ORDER BY type alone leaves same-type rows without a specified relative order.",
    "solutionMd": "```sql\nSELECT propertyNo, type, rooms, rent\nFROM PropertyForRent\nORDER BY type ASC, rent DESC;\n```\n\nSort keys apply left to right. Type puts flats before houses under the stated ordinary alphabetical order; rent desc orders rows within each type. ORDER BY type alone leaves same-type rows without a specified relative order.\n\n1. Project the four requested property fields.\n2. Use type ASC as the primary key.\n3. Use rent DESC as the secondary key.\n4. Explain the unresolved same-type ties in a one-key query.",
    "hintSteps": [
      "The first key separates property types.",
      "The second key applies only within equal values of the first."
    ],
    "walkthroughSteps": [
      "Project the four requested property fields.",
      "Use type ASC as the primary key.",
      "Use rent DESC as the secondary key.",
      "Explain the unresolved same-type ties in a one-key query."
    ],
    "rubric": [
      {
        "criterion": "Correct projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct ordered pair of keys/directions",
        "marks": 2
      },
      {
        "criterion": "Explains the insufficiency of type alone",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 11-14"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-12",
      "multi-column-order"
    ]
  },
  {
    "id": "db-e2-sql-ex6-13",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`PropertyForRent(propertyNo PRIMARY KEY, type, rooms, rent)`\n\n| propertyNo | type | rooms | rent |\n|---|---|---:|---:|\n| PL94 | Flat | 4 | 400 |\n| PG4 | Flat | 3 | 350 |\n| PG36 | Flat | 3 | 375 |\n| PG16 | Flat | 4 | 450 |\n| PA14 | House | 6 | 650 |\n| PG21 | House | 5 | 600 |\n\nHow many properties cost more than £350 per month to rent? Write a query with output alias myCount and give the result.",
    "sampleAnswer": "```sql\nSELECT COUNT(*) AS myCount\nFROM PropertyForRent\nWHERE rent > 350;\n\n-- Result: myCount = 5\n```\n\nFive rows have rent strictly above 350. PG4 at exactly 350 is excluded. COUNT(*) counts qualifying rows, not distinct rent values.\n\n1. Keep rents 400, 375, 450, 650, and 600.\n2. Exclude the 350 row.\n3. Count the five remaining rows with COUNT(*).",
    "explanation": "Five rows have rent strictly above 350. PG4 at exactly 350 is excluded. COUNT(*) counts qualifying rows, not distinct rent values.",
    "solutionMd": "```sql\nSELECT COUNT(*) AS myCount\nFROM PropertyForRent\nWHERE rent > 350;\n\n-- Result: myCount = 5\n```\n\nFive rows have rent strictly above 350. PG4 at exactly 350 is excluded. COUNT(*) counts qualifying rows, not distinct rent values.\n\n1. Keep rents 400, 375, 450, 650, and 600.\n2. Exclude the 350 row.\n3. Count the five remaining rows with COUNT(*).",
    "hintSteps": [
      "Filter before counting, and keep the comparison strict.",
      "Repeated rent values would still represent separate properties."
    ],
    "walkthroughSteps": [
      "Keep rents 400, 375, 450, 650, and 600.",
      "Exclude the 350 row.",
      "Count the five remaining rows with COUNT(*)."
    ],
    "rubric": [
      {
        "criterion": "Correct COUNT(*) and alias/source",
        "marks": 1
      },
      {
        "criterion": "Correct strict rent filter",
        "marks": 1
      },
      {
        "criterion": "Correct result 5",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 20"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-13",
      "aggregate-count"
    ]
  },
  {
    "id": "db-e2-sql-ex6-14",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Viewing(clientNo, propertyNo, viewDate DATE, comment)`; comment may be NULL.\n\nHow many different properties were viewed in May 2013? Write a query with alias myCount. Use valid ISO date literals. viewDate is DATE, not DATETIME.",
    "sampleAnswer": "```sql\nSELECT COUNT(DISTINCT propertyNo) AS myCount\nFROM Viewing\nWHERE viewDate BETWEEN '2013-05-01' AND '2013-05-31';\n```\n\nDISTINCT makes repeated viewings of the same property count once. DATE values make the inclusive May 31 endpoint appropriate. The slide's day-month-name literals are replaced with valid ISO MySQL dates. For a DATETIME field, a half-open upper bound before June 1 would avoid losing late May 31 times.\n\n1. Filter May 2013 with two ISO DATE endpoints.\n2. Apply COUNT(DISTINCT propertyNo).\n3. Name the result myCount and avoid a day-month-name date string.",
    "explanation": "DISTINCT makes repeated viewings of the same property count once. DATE values make the inclusive May 31 endpoint appropriate. The slide's day-month-name literals are replaced with valid ISO MySQL dates. For a DATETIME field, a half-open upper bound before June 1 would avoid losing late May 31 times.",
    "solutionMd": "```sql\nSELECT COUNT(DISTINCT propertyNo) AS myCount\nFROM Viewing\nWHERE viewDate BETWEEN '2013-05-01' AND '2013-05-31';\n```\n\nDISTINCT makes repeated viewings of the same property count once. DATE values make the inclusive May 31 endpoint appropriate. The slide's day-month-name literals are replaced with valid ISO MySQL dates. For a DATETIME field, a half-open upper bound before June 1 would avoid losing late May 31 times.\n\n1. Filter May 2013 with two ISO DATE endpoints.\n2. Apply COUNT(DISTINCT propertyNo).\n3. Name the result myCount and avoid a day-month-name date string.",
    "hintSteps": [
      "Count properties, not viewing rows.",
      "The range must include every DATE from May 1 through May 31."
    ],
    "walkthroughSteps": [
      "Filter May 2013 with two ISO DATE endpoints.",
      "Apply COUNT(DISTINCT propertyNo).",
      "Name the result myCount and avoid a day-month-name date string."
    ],
    "rubric": [
      {
        "criterion": "Correct distinct property count",
        "marks": 2
      },
      {
        "criterion": "Correct inclusive ISO DATE range",
        "marks": 2
      },
      {
        "criterion": "Correct source and alias",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 21"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-14",
      "aggregate-distinct",
      "adapted-source"
    ]
  },
  {
    "id": "db-e2-sql-ex6-15",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\n| staffNo | fName | lName | position | sex | DOB | salary | branchNo |\n|---|---|---|---|---|---|---:|---|\n| SL21 | John | White | Manager | M | 1945-10-01 | 30000 | B005 |\n| SG37 | Ann | Beech | Assistant | F | 1960-11-10 | 12000 | B003 |\n| SG14 | David | Ford | Supervisor | M | 1958-03-24 | 18000 | B003 |\n| SA9 | Mary | Howe | Assistant | F | 1970-02-19 | 9000 | B007 |\n| SG5 | Susan | Brand | Manager | F | 1940-06-03 | 24000 | B003 |\n| SL41 | Julie | Lee | Assistant | F | 1965-06-13 | 9000 | B005 |\n\nFind the number of Managers and the sum of their annual salaries. Write one query with aliases myCount and mySum and give its result.",
    "sampleAnswer": "```sql\nSELECT COUNT(staffNo) AS myCount, SUM(salary) AS mySum\nFROM Staff\nWHERE position = 'Manager';\n\n-- Result: myCount = 2, mySum = 54000\n```\n\nThe managers are SL21 at 30000 and SG5 at 24000. Their count is 2 and their total is 54000. Since staffNo is a non-NULL primary key, COUNT(*) is an equivalent count here.\n\n1. Filter position = Manager.\n2. Identify the two surviving rows.\n3. Compute 30000 + 24000 = 54000 and count 2.\n4. Return both aggregate expressions with the requested aliases.",
    "explanation": "The managers are SL21 at 30000 and SG5 at 24000. Their count is 2 and their total is 54000. Since staffNo is a non-NULL primary key, COUNT(*) is an equivalent count here.",
    "solutionMd": "```sql\nSELECT COUNT(staffNo) AS myCount, SUM(salary) AS mySum\nFROM Staff\nWHERE position = 'Manager';\n\n-- Result: myCount = 2, mySum = 54000\n```\n\nThe managers are SL21 at 30000 and SG5 at 24000. Their count is 2 and their total is 54000. Since staffNo is a non-NULL primary key, COUNT(*) is an equivalent count here.\n\n1. Filter position = Manager.\n2. Identify the two surviving rows.\n3. Compute 30000 + 24000 = 54000 and count 2.\n4. Return both aggregate expressions with the requested aliases.",
    "hintSteps": [
      "First restrict the rows to Managers.",
      "Count the manager identifiers and sum their salary values in one aggregate query."
    ],
    "walkthroughSteps": [
      "Filter position = Manager.",
      "Identify the two surviving rows.",
      "Compute 30000 + 24000 = 54000 and count 2.",
      "Return both aggregate expressions with the requested aliases."
    ],
    "rubric": [
      {
        "criterion": "Correct Manager row filter/source",
        "marks": 1
      },
      {
        "criterion": "Correct count and salary sum expressions/aliases",
        "marks": 2
      },
      {
        "criterion": "Correct numerical results",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 22"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-15",
      "aggregate-sum"
    ]
  },
  {
    "id": "db-e2-sql-ex6-16",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\n| staffNo | fName | lName | position | sex | DOB | salary | branchNo |\n|---|---|---|---|---|---|---:|---|\n| SL21 | John | White | Manager | M | 1945-10-01 | 30000 | B005 |\n| SG37 | Ann | Beech | Assistant | F | 1960-11-10 | 12000 | B003 |\n| SG14 | David | Ford | Supervisor | M | 1958-03-24 | 18000 | B003 |\n| SA9 | Mary | Howe | Assistant | F | 1970-02-19 | 9000 | B007 |\n| SG5 | Susan | Brand | Manager | F | 1940-06-03 | 24000 | B003 |\n| SL41 | Julie | Lee | Assistant | F | 1965-06-13 | 9000 | B005 |\n\nFind minimum, maximum, and average annual staff salary. Write one query with aliases myMin, myMax, and myAvg and give the result.",
    "sampleAnswer": "```sql\nSELECT MIN(salary) AS myMin, MAX(salary) AS myMax, AVG(salary) AS myAvg\nFROM Staff;\n\n-- Result: myMin = 9000, myMax = 30000, myAvg = 17000\n```\n\nThe six salaries total 102000, so the average is 102000/6 = 17000. The repeated 9000 values both contribute to AVG; AVG(DISTINCT salary) would answer a different question.\n\n1. Identify the minimum 9000 and maximum 30000.\n2. Sum all six salaries to 102000.\n3. Divide by six non-NULL values for 17000.\n4. Write the three aggregate expressions without an unnecessary GROUP BY.",
    "explanation": "The six salaries total 102000, so the average is 102000/6 = 17000. The repeated 9000 values both contribute to AVG; AVG(DISTINCT salary) would answer a different question.",
    "solutionMd": "```sql\nSELECT MIN(salary) AS myMin, MAX(salary) AS myMax, AVG(salary) AS myAvg\nFROM Staff;\n\n-- Result: myMin = 9000, myMax = 30000, myAvg = 17000\n```\n\nThe six salaries total 102000, so the average is 102000/6 = 17000. The repeated 9000 values both contribute to AVG; AVG(DISTINCT salary) would answer a different question.\n\n1. Identify the minimum 9000 and maximum 30000.\n2. Sum all six salaries to 102000.\n3. Divide by six non-NULL values for 17000.\n4. Write the three aggregate expressions without an unnecessary GROUP BY.",
    "hintSteps": [
      "Ordinary AVG includes repeated non-NULL salaries.",
      "Add all six salaries and divide by six."
    ],
    "walkthroughSteps": [
      "Identify the minimum 9000 and maximum 30000.",
      "Sum all six salaries to 102000.",
      "Divide by six non-NULL values for 17000.",
      "Write the three aggregate expressions without an unnecessary GROUP BY."
    ],
    "rubric": [
      {
        "criterion": "Correct three aggregate expressions/aliases/source",
        "marks": 2
      },
      {
        "criterion": "Correct min/max results",
        "marks": 1
      },
      {
        "criterion": "Correct ordinary average 17000",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 23"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-16",
      "aggregate-average"
    ]
  },
  {
    "id": "db-e2-sql-ex6-17",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\n| staffNo | fName | lName | position | sex | DOB | salary | branchNo |\n|---|---|---|---|---|---|---:|---|\n| SL21 | John | White | Manager | M | 1945-10-01 | 30000 | B005 |\n| SG37 | Ann | Beech | Assistant | F | 1960-11-10 | 12000 | B003 |\n| SG14 | David | Ford | Supervisor | M | 1958-03-24 | 18000 | B003 |\n| SA9 | Mary | Howe | Assistant | F | 1970-02-19 | 9000 | B007 |\n| SG5 | Susan | Brand | Manager | F | 1940-06-03 | 24000 | B003 |\n| SL41 | Julie | Lee | Assistant | F | 1965-06-13 | 9000 | B005 |\n\nFind the number of staff in each branch and their total annual salaries. Return branchNo, myCount, and mySum in ascending branchNo order; write the query and its output.",
    "sampleAnswer": "```sql\nSELECT branchNo, COUNT(staffNo) AS myCount, SUM(salary) AS mySum\nFROM Staff\nGROUP BY branchNo\nORDER BY branchNo ASC;\n\n-- B003: 3, 54000\n-- B005: 2, 39000\n-- B007: 1, 9000\n```\n\nGROUP BY creates one group per branch. B003 has 12000+18000+24000; B005 has 30000+9000; B007 has 9000. ORDER BY explicitly requests the output order rather than relying on grouping to sort.\n\n1. Partition Staff into B003, B005, and B007.\n2. Compute group counts 3, 2, and 1.\n3. Compute group sums 54000, 39000, and 9000.\n4. Select the grouped key plus aggregates and order by branchNo.",
    "explanation": "GROUP BY creates one group per branch. B003 has 12000+18000+24000; B005 has 30000+9000; B007 has 9000. ORDER BY explicitly requests the output order rather than relying on grouping to sort.",
    "solutionMd": "```sql\nSELECT branchNo, COUNT(staffNo) AS myCount, SUM(salary) AS mySum\nFROM Staff\nGROUP BY branchNo\nORDER BY branchNo ASC;\n\n-- B003: 3, 54000\n-- B005: 2, 39000\n-- B007: 1, 9000\n```\n\nGROUP BY creates one group per branch. B003 has 12000+18000+24000; B005 has 30000+9000; B007 has 9000. ORDER BY explicitly requests the output order rather than relying on grouping to sort.\n\n1. Partition Staff into B003, B005, and B007.\n2. Compute group counts 3, 2, and 1.\n3. Compute group sums 54000, 39000, and 9000.\n4. Select the grouped key plus aggregates and order by branchNo.",
    "hintSteps": [
      "branchNo is the group key and must remain in the output.",
      "Compute a separate count and salary total inside each branch."
    ],
    "walkthroughSteps": [
      "Partition Staff into B003, B005, and B007.",
      "Compute group counts 3, 2, and 1.",
      "Compute group sums 54000, 39000, and 9000.",
      "Select the grouped key plus aggregates and order by branchNo."
    ],
    "rubric": [
      {
        "criterion": "Correct grouped key and GROUP BY",
        "marks": 1
      },
      {
        "criterion": "Correct count/sum expressions and source",
        "marks": 1
      },
      {
        "criterion": "Correct ORDER BY",
        "marks": 1
      },
      {
        "criterion": "Correct three output rows",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 24-29"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-17",
      "group-by"
    ]
  },
  {
    "id": "db-e2-sql-ex6-18",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\n| staffNo | fName | lName | position | sex | DOB | salary | branchNo |\n|---|---|---|---|---|---|---:|---|\n| SL21 | John | White | Manager | M | 1945-10-01 | 30000 | B005 |\n| SG37 | Ann | Beech | Assistant | F | 1960-11-10 | 12000 | B003 |\n| SG14 | David | Ford | Supervisor | M | 1958-03-24 | 18000 | B003 |\n| SA9 | Mary | Howe | Assistant | F | 1970-02-19 | 9000 | B007 |\n| SG5 | Susan | Brand | Manager | F | 1940-06-03 | 24000 | B003 |\n| SL41 | Julie | Lee | Assistant | F | 1965-06-13 | 9000 | B005 |\n\nFor each branch with more than one member of staff, return branchNo, its staff count AS myCount, and total annual salaries AS mySum. Sort by branchNo. Write the query and output.",
    "sampleAnswer": "```sql\nSELECT branchNo, COUNT(staffNo) AS myCount, SUM(salary) AS mySum\nFROM Staff\nGROUP BY branchNo\nHAVING COUNT(staffNo) > 1\nORDER BY branchNo ASC;\n\n-- B003: 3, 54000\n-- B005: 2, 39000\n```\n\nHAVING filters completed groups, retaining counts 3 and 2 and rejecting B007 with count 1. MySQL also permits HAVING myCount > 1 here. A direct aggregate in WHERE would be invalid.\n\n1. Create groups by branchNo.\n2. Compute the staff count and salary sum in each.\n3. Reject groups with count <= 1 using HAVING.\n4. Sort B003 and B005 in ascending branch order.",
    "explanation": "HAVING filters completed groups, retaining counts 3 and 2 and rejecting B007 with count 1. MySQL also permits HAVING myCount > 1 here. A direct aggregate in WHERE would be invalid.",
    "solutionMd": "```sql\nSELECT branchNo, COUNT(staffNo) AS myCount, SUM(salary) AS mySum\nFROM Staff\nGROUP BY branchNo\nHAVING COUNT(staffNo) > 1\nORDER BY branchNo ASC;\n\n-- B003: 3, 54000\n-- B005: 2, 39000\n```\n\nHAVING filters completed groups, retaining counts 3 and 2 and rejecting B007 with count 1. MySQL also permits HAVING myCount > 1 here. A direct aggregate in WHERE would be invalid.\n\n1. Create groups by branchNo.\n2. Compute the staff count and salary sum in each.\n3. Reject groups with count <= 1 using HAVING.\n4. Sort B003 and B005 in ascending branch order.",
    "hintSteps": [
      "The threshold concerns the number of rows in a group, not a single row.",
      "Group first and use HAVING for the count condition."
    ],
    "walkthroughSteps": [
      "Create groups by branchNo.",
      "Compute the staff count and salary sum in each.",
      "Reject groups with count <= 1 using HAVING.",
      "Sort B003 and B005 in ascending branch order."
    ],
    "rubric": [
      {
        "criterion": "Correct projection, aggregates, and grouping",
        "marks": 2
      },
      {
        "criterion": "Correct HAVING strict count threshold",
        "marks": 2
      },
      {
        "criterion": "Correct order and two output rows",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 30-32"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "example-6-18",
      "having"
    ]
  },
  {
    "id": "db-e2-sql-26",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nRepair this query to mean: staff who are Managers or Supervisors AND have salary above 10000. Explain the original error.\n\n```sql\nSELECT staffNo\nFROM Staff\nWHERE position = 'Manager'\n   OR position = 'Supervisor' AND salary > 10000;\n```",
    "sampleAnswer": "```sql\nSELECT staffNo\nFROM Staff\nWHERE (position = 'Manager' OR position = 'Supervisor')\n  AND salary > 10000;\n```\n\nAND binds more tightly than OR, so the original query allows every Manager regardless of salary. Parentheses make the salary test apply to both positions. IN plus AND is equivalent.\n\n1. Read the original as Manager OR (Supervisor AND high salary).\n2. Group the position alternatives with parentheses.\n3. Apply AND salary > 10000 to the whole position group.",
    "explanation": "AND binds more tightly than OR, so the original query allows every Manager regardless of salary. Parentheses make the salary test apply to both positions. IN plus AND is equivalent.",
    "solutionMd": "```sql\nSELECT staffNo\nFROM Staff\nWHERE (position = 'Manager' OR position = 'Supervisor')\n  AND salary > 10000;\n```\n\nAND binds more tightly than OR, so the original query allows every Manager regardless of salary. Parentheses make the salary test apply to both positions. IN plus AND is equivalent.\n\n1. Read the original as Manager OR (Supervisor AND high salary).\n2. Group the position alternatives with parentheses.\n3. Apply AND salary > 10000 to the whole position group.",
    "hintSteps": [
      "Determine which part the salary condition affects without parentheses.",
      "Group the two alternative positions before adding the common salary condition."
    ],
    "walkthroughSteps": [
      "Read the original as Manager OR (Supervisor AND high salary).",
      "Group the position alternatives with parentheses.",
      "Apply AND salary > 10000 to the whole position group."
    ],
    "rubric": [
      {
        "criterion": "Explains the unfiltered Manager branch of the original",
        "marks": 1
      },
      {
        "criterion": "Correctly groups the OR or uses equivalent IN",
        "marks": 1
      },
      {
        "criterion": "Applies the strict salary test to both positions",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 8.pdf, PDF page 10",
      "Lecture 9 Final.pdf, PDF page 4"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "exam-style",
      "boolean-precedence"
    ]
  },
  {
    "id": "db-e2-sql-27",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "short",
    "points": 3,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Codes(code)` stores strings. Write a query returning strings containing a literal percent sign anywhere. Use LIKE with `!` as the explicit escape character. Explain each part of the pattern.",
    "sampleAnswer": "```sql\nSELECT code\nFROM Codes\nWHERE code LIKE '%!%%' ESCAPE '!';\n```\n\nThe first and final % are wildcards. The middle !% means the literal percent character because ! is declared as the escape character. This avoids relying on backslash behavior or a MySQL SQL-mode setting.\n\n1. Use a leading % for any prefix.\n2. Use !% for a literal percent sign.\n3. Use a trailing % for any suffix and declare ESCAPE !.",
    "explanation": "The first and final % are wildcards. The middle !% means the literal percent character because ! is declared as the escape character. This avoids relying on backslash behavior or a MySQL SQL-mode setting.",
    "solutionMd": "```sql\nSELECT code\nFROM Codes\nWHERE code LIKE '%!%%' ESCAPE '!';\n```\n\nThe first and final % are wildcards. The middle !% means the literal percent character because ! is declared as the escape character. This avoids relying on backslash behavior or a MySQL SQL-mode setting.\n\n1. Use a leading % for any prefix.\n2. Use !% for a literal percent sign.\n3. Use a trailing % for any suffix and declare ESCAPE !.",
    "hintSteps": [
      "A percent character normally has wildcard meaning in LIKE.",
      "Escape just the literal percent, while leaving a contains wildcard on each side."
    ],
    "walkthroughSteps": [
      "Use a leading % for any prefix.",
      "Use !% for a literal percent sign.",
      "Use a trailing % for any suffix and declare ESCAPE !."
    ],
    "rubric": [
      {
        "criterion": "Correct contains pattern with an escaped literal percent",
        "marks": 2
      },
      {
        "criterion": "Declares the explicit escape and explains literal versus wildcard",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF page 5"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "like-escaping"
    ]
  },
  {
    "id": "db-e2-sql-28",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\nFor each pair (5,5), (5,6), (NULL,5), and (NULL,NULL), give the results of `a = b` and MySQL `a <=> b`. Explain which rows a WHERE condition keeps and why `NOT (a = b)` does not select NULL/5.",
    "sampleAnswer": "| a | b | a = b | a <=> b |\n|---|---|---|---|\n| 5 | 5 | TRUE | TRUE |\n| 5 | 6 | FALSE | FALSE |\n| NULL | 5 | UNKNOWN | FALSE |\n| NULL | NULL | UNKNOWN | TRUE |\nWHERE retains only TRUE; FALSE and UNKNOWN are rejected. NOT UNKNOWN is still UNKNOWN, so NOT(a = b) does not retain the NULL/5 row.\n\nOrdinary equality with NULL yields UNKNOWN, even for NULL = NULL. MySQL <=> provides a definite NULL-safe equality result. Negation does not convert UNKNOWN into TRUE.\n\n1. Evaluate the two non-NULL pairs using ordinary equality.\n2. Assign UNKNOWN to both ordinary NULL comparisons.\n3. Evaluate the definite MySQL <=> results.\n4. Apply the WHERE-only-TRUE rule and the NOT UNKNOWN rule.",
    "explanation": "Ordinary equality with NULL yields UNKNOWN, even for NULL = NULL. MySQL <=> provides a definite NULL-safe equality result. Negation does not convert UNKNOWN into TRUE.",
    "solutionMd": "| a | b | a = b | a <=> b |\n|---|---|---|---|\n| 5 | 5 | TRUE | TRUE |\n| 5 | 6 | FALSE | FALSE |\n| NULL | 5 | UNKNOWN | FALSE |\n| NULL | NULL | UNKNOWN | TRUE |\nWHERE retains only TRUE; FALSE and UNKNOWN are rejected. NOT UNKNOWN is still UNKNOWN, so NOT(a = b) does not retain the NULL/5 row.\n\nOrdinary equality with NULL yields UNKNOWN, even for NULL = NULL. MySQL <=> provides a definite NULL-safe equality result. Negation does not convert UNKNOWN into TRUE.\n\n1. Evaluate the two non-NULL pairs using ordinary equality.\n2. Assign UNKNOWN to both ordinary NULL comparisons.\n3. Evaluate the definite MySQL <=> results.\n4. Apply the WHERE-only-TRUE rule and the NOT UNKNOWN rule.",
    "hintSteps": [
      "Ordinary comparison with a NULL operand is UNKNOWN.",
      "NULL-safe equality considers two NULLs equal but a NULL and a non-NULL unequal."
    ],
    "walkthroughSteps": [
      "Evaluate the two non-NULL pairs using ordinary equality.",
      "Assign UNKNOWN to both ordinary NULL comparisons.",
      "Evaluate the definite MySQL <=> results.",
      "Apply the WHERE-only-TRUE rule and the NOT UNKNOWN rule."
    ],
    "rubric": [
      {
        "criterion": "Correct ordinary-equality results for all four pairs",
        "marks": 2
      },
      {
        "criterion": "Correct NULL-safe results for all four pairs",
        "marks": 2
      },
      {
        "criterion": "Correct WHERE and NOT UNKNOWN explanation",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF page 8"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "three-valued-logic",
      "null-safe-equality"
    ]
  },
  {
    "id": "db-e2-sql-29",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nWhy is `SELECT staffNo, COUNT(salary) FROM Staff;` rejected in the stated MySQL mode? Write (a) a valid query for a single total count of non-NULL salaries and (b) a valid query for a count of non-NULL salaries per branch.",
    "sampleAnswer": "```sql\nSELECT COUNT(salary) AS salaryCount\nFROM Staff;\n\nSELECT branchNo, COUNT(salary) AS salaryCount\nFROM Staff\nGROUP BY branchNo;\n```\n\nThe original mixes one aggregate over the whole table with a staffNo that has no single determined value for that aggregate group. Removing staffNo gives the total; grouping by branchNo gives a distinct per-branch question. COUNT(salary) excludes NULL salaries.\n\n1. Identify the undefined staffNo in the original global aggregate.\n2. Remove the nonaggregate identifier for the one-row total.\n3. For branch totals, select and group by branchNo.\n4. Retain COUNT(salary) rather than silently switching to all-row count.",
    "explanation": "The original mixes one aggregate over the whole table with a staffNo that has no single determined value for that aggregate group. Removing staffNo gives the total; grouping by branchNo gives a distinct per-branch question. COUNT(salary) excludes NULL salaries.",
    "solutionMd": "```sql\nSELECT COUNT(salary) AS salaryCount\nFROM Staff;\n\nSELECT branchNo, COUNT(salary) AS salaryCount\nFROM Staff\nGROUP BY branchNo;\n```\n\nThe original mixes one aggregate over the whole table with a staffNo that has no single determined value for that aggregate group. Removing staffNo gives the total; grouping by branchNo gives a distinct per-branch question. COUNT(salary) excludes NULL salaries.\n\n1. Identify the undefined staffNo in the original global aggregate.\n2. Remove the nonaggregate identifier for the one-row total.\n3. For branch totals, select and group by branchNo.\n4. Retain COUNT(salary) rather than silently switching to all-row count.",
    "hintSteps": [
      "Without GROUP BY, all source rows make one implicit aggregate group.",
      "Ask which staffNo could legitimately represent that whole group."
    ],
    "walkthroughSteps": [
      "Identify the undefined staffNo in the original global aggregate.",
      "Remove the nonaggregate identifier for the one-row total.",
      "For branch totals, select and group by branchNo.",
      "Retain COUNT(salary) rather than silently switching to all-row count."
    ],
    "rubric": [
      {
        "criterion": "Correctly explains the undefined nonaggregate value",
        "marks": 2
      },
      {
        "criterion": "Valid global non-NULL salary-count query",
        "marks": 1
      },
      {
        "criterion": "Valid per-branch grouped count query",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 19, 24"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "only-full-group-by"
    ]
  },
  {
    "id": "db-e2-sql-30",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nIs this query valid under ONLY_FULL_GROUP_BY? Explain using the declared key, give the number of result rows for the six-row lecture table, and say whether it finds the highest-paid staff member overall.\n\n```sql\nSELECT staffNo, fName, lName, MAX(salary) AS salary\nFROM Staff\nGROUP BY staffNo;\n```",
    "sampleAnswer": "Yes. staffNo is a primary key, so fName and lName are functionally dependent on it and have one determined value per group. Each group contains one staff row, so the six-row table produces six result rows and each MAX(salary) is that staff member's own salary. It does not select the globally highest-paid staff member.\n\nMySQL permits selected columns functionally dependent on grouped keys. The declared primary key matters; an accidental uniqueness pattern in a sample alone would not justify a general claim. The slide's firstName/lastName spelling is adapted to fName/lName in the supplied schema.\n\n1. Use the primary-key constraint to establish staffNo → fName,lName.\n2. Conclude that each selected name is well-defined per group.\n3. Recognize six single-row groups.\n4. Explain that MAX within each single-row group is not a global maximum selection.",
    "explanation": "MySQL permits selected columns functionally dependent on grouped keys. The declared primary key matters; an accidental uniqueness pattern in a sample alone would not justify a general claim. The slide's firstName/lastName spelling is adapted to fName/lName in the supplied schema.",
    "solutionMd": "Yes. staffNo is a primary key, so fName and lName are functionally dependent on it and have one determined value per group. Each group contains one staff row, so the six-row table produces six result rows and each MAX(salary) is that staff member's own salary. It does not select the globally highest-paid staff member.\n\nMySQL permits selected columns functionally dependent on grouped keys. The declared primary key matters; an accidental uniqueness pattern in a sample alone would not justify a general claim. The slide's firstName/lastName spelling is adapted to fName/lName in the supplied schema.\n\n1. Use the primary-key constraint to establish staffNo → fName,lName.\n2. Conclude that each selected name is well-defined per group.\n3. Recognize six single-row groups.\n4. Explain that MAX within each single-row group is not a global maximum selection.",
    "hintSteps": [
      "The prompt explicitly declares staffNo as a primary key.",
      "How many rows can one primary-key group contain?"
    ],
    "walkthroughSteps": [
      "Use the primary-key constraint to establish staffNo → fName,lName.",
      "Conclude that each selected name is well-defined per group.",
      "Recognize six single-row groups.",
      "Explain that MAX within each single-row group is not a global maximum selection."
    ],
    "rubric": [
      {
        "criterion": "Correct MySQL validity judgment with declared-key dependency",
        "marks": 2
      },
      {
        "criterion": "Correct six single-row groups and per-row maximum",
        "marks": 1
      },
      {
        "criterion": "Explains that the query is not a global highest-salary query",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 24-25",
      "Lecture 8.pdf, PDF page 3"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "adapted-source",
      "functional-dependency",
      "only-full-group-by"
    ]
  },
  {
    "id": "db-e2-sql-31",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\n| staffNo | fName | lName | position | sex | DOB | salary | branchNo |\n|---|---|---|---|---|---|---:|---|\n| SL21 | John | White | Manager | M | 1945-10-01 | 30000 | B005 |\n| SG37 | Ann | Beech | Assistant | F | 1960-11-10 | 12000 | B003 |\n| SG14 | David | Ford | Supervisor | M | 1958-03-24 | 18000 | B003 |\n| SA9 | Mary | Howe | Assistant | F | 1970-02-19 | 9000 | B007 |\n| SG5 | Susan | Brand | Manager | F | 1940-06-03 | 24000 | B003 |\n| SL41 | Julie | Lee | Assistant | F | 1965-06-13 | 9000 | B005 |\n\nWrite a query counting, per branch, only staff with salary at least 12000, and retain only branches with at least two such staff. Return branchNo and eligibleCount, sorted by branchNo. Give the output.",
    "sampleAnswer": "```sql\nSELECT branchNo, COUNT(*) AS eligibleCount\nFROM Staff\nWHERE salary >= 12000\nGROUP BY branchNo\nHAVING COUNT(*) >= 2\nORDER BY branchNo;\n\n-- Result: B003, 3\n```\n\nWHERE first removes the 9000 rows. The remaining group counts are B003=3 and B005=1; B007 has no surviving rows and therefore no group. HAVING retains only B003.\n\n1. Keep salaries 30000, 12000, 18000, and 24000.\n2. Group them into B003 with 3 and B005 with 1.\n3. Apply HAVING COUNT(*) >= 2.\n4. Return B003/3 with an explicit branch order.",
    "explanation": "WHERE first removes the 9000 rows. The remaining group counts are B003=3 and B005=1; B007 has no surviving rows and therefore no group. HAVING retains only B003.",
    "solutionMd": "```sql\nSELECT branchNo, COUNT(*) AS eligibleCount\nFROM Staff\nWHERE salary >= 12000\nGROUP BY branchNo\nHAVING COUNT(*) >= 2\nORDER BY branchNo;\n\n-- Result: B003, 3\n```\n\nWHERE first removes the 9000 rows. The remaining group counts are B003=3 and B005=1; B007 has no surviving rows and therefore no group. HAVING retains only B003.\n\n1. Keep salaries 30000, 12000, 18000, and 24000.\n2. Group them into B003 with 3 and B005 with 1.\n3. Apply HAVING COUNT(*) >= 2.\n4. Return B003/3 with an explicit branch order.",
    "hintSteps": [
      "The salary test concerns individual rows before groups exist.",
      "The eligible-count test concerns the groups made from those surviving rows."
    ],
    "walkthroughSteps": [
      "Keep salaries 30000, 12000, 18000, and 24000.",
      "Group them into B003 with 3 and B005 with 1.",
      "Apply HAVING COUNT(*) >= 2.",
      "Return B003/3 with an explicit branch order."
    ],
    "rubric": [
      {
        "criterion": "Correct row filter and group key",
        "marks": 2
      },
      {
        "criterion": "Correct HAVING threshold and count projection",
        "marks": 2
      },
      {
        "criterion": "Correct result and order",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 26, 30-31"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "where-versus-having"
    ]
  },
  {
    "id": "db-e2-sql-32",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nWrite a grouped query returning branchNo and COUNT(*) AS myCount for branches with more than one staff member, using the SELECT alias in HAVING. Explain why placing `myCount > 1` in WHERE would not work.",
    "sampleAnswer": "```sql\nSELECT branchNo, COUNT(*) AS myCount\nFROM Staff\nGROUP BY branchNo\nHAVING myCount > 1;\n```\n\nMySQL permits a SELECT alias in HAVING for this grouped aggregate. WHERE cannot reference that output alias at the same query level and cannot directly test a count that is computed after its row filtering.\n\n1. Group Staff by branchNo.\n2. Define COUNT(*) AS myCount in SELECT.\n3. Use HAVING myCount > 1.\n4. Explain both the alias visibility and aggregation timing issues with WHERE.",
    "explanation": "MySQL permits a SELECT alias in HAVING for this grouped aggregate. WHERE cannot reference that output alias at the same query level and cannot directly test a count that is computed after its row filtering.",
    "solutionMd": "```sql\nSELECT branchNo, COUNT(*) AS myCount\nFROM Staff\nGROUP BY branchNo\nHAVING myCount > 1;\n```\n\nMySQL permits a SELECT alias in HAVING for this grouped aggregate. WHERE cannot reference that output alias at the same query level and cannot directly test a count that is computed after its row filtering.\n\n1. Group Staff by branchNo.\n2. Define COUNT(*) AS myCount in SELECT.\n3. Use HAVING myCount > 1.\n4. Explain both the alias visibility and aggregation timing issues with WHERE.",
    "hintSteps": [
      "This prompt specifically asks for a MySQL-supported HAVING alias.",
      "WHERE filters individual rows, whereas myCount describes a finished group."
    ],
    "walkthroughSteps": [
      "Group Staff by branchNo.",
      "Define COUNT(*) AS myCount in SELECT.",
      "Use HAVING myCount > 1.",
      "Explain both the alias visibility and aggregation timing issues with WHERE."
    ],
    "rubric": [
      {
        "criterion": "Correct grouped count query",
        "marks": 2
      },
      {
        "criterion": "Uses the alias in valid MySQL HAVING syntax",
        "marks": 1
      },
      {
        "criterion": "Correct same-level WHERE explanation",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 30-31"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "having-alias",
      "where-versus-having"
    ]
  },
  {
    "id": "db-e2-sql-33",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Sample(branchNo, salary)` contains `(NULL, 100)`, `(NULL, 200)`, `('B003', 300)`, and `('B003', NULL)`. Give the result rows of `SELECT branchNo, COUNT(*) AS n, COUNT(salary) AS paid, SUM(salary) AS total FROM Sample GROUP BY branchNo;`. Row order is irrelevant. Explain why this does not make `NULL = NULL` TRUE.",
    "sampleAnswer": "| branchNo | n | paid | total |\n|---|---:|---:|---:|\n| NULL | 2 | 2 | 300 |\n| B003 | 2 | 1 | 300 |\nNULL grouping values form one group by grouping rules; ordinary NULL = NULL remains UNKNOWN.\n\nGROUP BY puts the two NULL branch values together. COUNT(*) includes every row, while COUNT(salary) and SUM(salary) ignore the NULL salary. Grouping equivalence is different from ordinary equality.\n\n1. Form one NULL branch group and one B003 group.\n2. Count two rows in each group.\n3. Count non-NULL salaries as 2 and 1 respectively.\n4. Sum each group's non-NULL salary values to 300 and distinguish grouping from =.",
    "explanation": "GROUP BY puts the two NULL branch values together. COUNT(*) includes every row, while COUNT(salary) and SUM(salary) ignore the NULL salary. Grouping equivalence is different from ordinary equality.",
    "solutionMd": "| branchNo | n | paid | total |\n|---|---:|---:|---:|\n| NULL | 2 | 2 | 300 |\n| B003 | 2 | 1 | 300 |\nNULL grouping values form one group by grouping rules; ordinary NULL = NULL remains UNKNOWN.\n\nGROUP BY puts the two NULL branch values together. COUNT(*) includes every row, while COUNT(salary) and SUM(salary) ignore the NULL salary. Grouping equivalence is different from ordinary equality.\n\n1. Form one NULL branch group and one B003 group.\n2. Count two rows in each group.\n3. Count non-NULL salaries as 2 and 1 respectively.\n4. Sum each group's non-NULL salary values to 300 and distinguish grouping from =.",
    "hintSteps": [
      "Group all NULL branch values together.",
      "Count all rows separately from non-NULL salary values."
    ],
    "walkthroughSteps": [
      "Form one NULL branch group and one B003 group.",
      "Count two rows in each group.",
      "Count non-NULL salaries as 2 and 1 respectively.",
      "Sum each group's non-NULL salary values to 300 and distinguish grouping from =."
    ],
    "rubric": [
      {
        "criterion": "Correct NULL grouping and both group counts",
        "marks": 2
      },
      {
        "criterion": "Correct non-NULL counts and sums",
        "marks": 2
      },
      {
        "criterion": "Correct equality-versus-grouping explanation",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 16-17, 26"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "null-grouping",
      "aggregate-null"
    ]
  },
  {
    "id": "db-e2-sql-34",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Pay(amount)` contains exactly `10`, `10`, `20`, and NULL. Give COUNT(*), COUNT(amount), COUNT(DISTINCT amount), SUM(amount), AVG(amount), MIN(amount), MAX(amount), SUM(DISTINCT amount), and AVG(DISTINCT amount). Explain both the NULL and duplicate rules.",
    "sampleAnswer": "COUNT(*) = 4; COUNT(amount) = 3; COUNT(DISTINCT amount) = 2; SUM(amount) = 40; AVG(amount) = 40/3; MIN(amount) = 10; MAX(amount) = 20; SUM(DISTINCT amount) = 30; AVG(DISTINCT amount) = 15.\n\nCOUNT(*) counts all four rows. The expression aggregates ignore NULL and ordinary SUM/AVG keep repeated numeric values. DISTINCT first reduces the non-NULL values to {10,20}; it changes SUM/AVG here but does not change MIN/MAX.\n\n1. Count four rows but only three non-NULL values.\n2. Compute ordinary SUM=40 and AVG=40/3.\n3. Identify MIN=10 and MAX=20.\n4. Reduce to 10 and 20 for distinct count 2, sum 30, and average 15.",
    "explanation": "COUNT(*) counts all four rows. The expression aggregates ignore NULL and ordinary SUM/AVG keep repeated numeric values. DISTINCT first reduces the non-NULL values to {10,20}; it changes SUM/AVG here but does not change MIN/MAX.",
    "solutionMd": "COUNT(*) = 4; COUNT(amount) = 3; COUNT(DISTINCT amount) = 2; SUM(amount) = 40; AVG(amount) = 40/3; MIN(amount) = 10; MAX(amount) = 20; SUM(DISTINCT amount) = 30; AVG(DISTINCT amount) = 15.\n\nCOUNT(*) counts all four rows. The expression aggregates ignore NULL and ordinary SUM/AVG keep repeated numeric values. DISTINCT first reduces the non-NULL values to {10,20}; it changes SUM/AVG here but does not change MIN/MAX.\n\n1. Count four rows but only three non-NULL values.\n2. Compute ordinary SUM=40 and AVG=40/3.\n3. Identify MIN=10 and MAX=20.\n4. Reduce to 10 and 20 for distinct count 2, sum 30, and average 15.",
    "hintSteps": [
      "Make two lists: all rows, and non-NULL amount values.",
      "For DISTINCT aggregates, reduce the non-NULL list to unique values before computing."
    ],
    "walkthroughSteps": [
      "Count four rows but only three non-NULL values.",
      "Compute ordinary SUM=40 and AVG=40/3.",
      "Identify MIN=10 and MAX=20.",
      "Reduce to 10 and 20 for distinct count 2, sum 30, and average 15."
    ],
    "rubric": [
      {
        "criterion": "Correct three counts",
        "marks": 2
      },
      {
        "criterion": "Correct ordinary sum/average/min/max",
        "marks": 2
      },
      {
        "criterion": "Correct DISTINCT sum/average and rules",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 15-17"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "aggregate-null",
      "aggregate-distinct"
    ]
  },
  {
    "id": "db-e2-sql-35",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nRewrite this invalid query to list staffNo and salary for staff whose salary exceeds the overall average salary: `SELECT staffNo, salary FROM Staff WHERE salary > AVG(salary);`. Explain why the original direct aggregate in WHERE is invalid.",
    "sampleAnswer": "```sql\nSELECT staffNo, salary\nFROM Staff\nWHERE salary > (SELECT AVG(salary) FROM Staff);\n```\n\nWHERE cannot directly aggregate the same query block's rows. A scalar subquery has its own aggregate query block and produces the average used by the outer row comparison. This bridges the aggregate rule to the subsequent subquery material.\n\n1. Keep staffNo and salary as the outer projection.\n2. Place SELECT AVG(salary) FROM Staff inside a scalar subquery.\n3. Use that value in the outer WHERE comparison.\n4. Explain that the outer block filters rows rather than directly aggregating inside WHERE.",
    "explanation": "WHERE cannot directly aggregate the same query block's rows. A scalar subquery has its own aggregate query block and produces the average used by the outer row comparison. This bridges the aggregate rule to the subsequent subquery material.",
    "solutionMd": "```sql\nSELECT staffNo, salary\nFROM Staff\nWHERE salary > (SELECT AVG(salary) FROM Staff);\n```\n\nWHERE cannot directly aggregate the same query block's rows. A scalar subquery has its own aggregate query block and produces the average used by the outer row comparison. This bridges the aggregate rule to the subsequent subquery material.\n\n1. Keep staffNo and salary as the outer projection.\n2. Place SELECT AVG(salary) FROM Staff inside a scalar subquery.\n3. Use that value in the outer WHERE comparison.\n4. Explain that the outer block filters rows rather than directly aggregating inside WHERE.",
    "hintSteps": [
      "Compute the overall average in a separate query block.",
      "Compare each outer row's salary against that single returned value."
    ],
    "walkthroughSteps": [
      "Keep staffNo and salary as the outer projection.",
      "Place SELECT AVG(salary) FROM Staff inside a scalar subquery.",
      "Use that value in the outer WHERE comparison.",
      "Explain that the outer block filters rows rather than directly aggregating inside WHERE."
    ],
    "rubric": [
      {
        "criterion": "Correct scalar average subquery",
        "marks": 2
      },
      {
        "criterion": "Correct outer projection/source/comparison",
        "marks": 1
      },
      {
        "criterion": "Explains the direct-aggregate WHERE error",
        "marks": 1
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF page 18"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "exam-style",
      "aggregate-where",
      "scalar-subquery"
    ]
  },
  {
    "id": "db-e2-sql-36",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "short",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nWithout GROUP BY, write a query returning COUNT(*) AS myCount only if the total staff count exceeds 1. Explain whether it returns a row when Staff has 0 rows, 1 row, or 6 rows.",
    "sampleAnswer": "```sql\nSELECT COUNT(*) AS myCount\nFROM Staff\nHAVING COUNT(*) > 1;\n\n-- 0 staff: no result row; 1 staff: no result row; 6 staff: one row with myCount = 6.\n```\n\nAn aggregate without GROUP BY forms one implicit group. COUNT(*) returns 0 for an empty source, but HAVING rejects that group because 0 > 1 is false. The same rejection occurs for a count of 1.\n\n1. Aggregate all Staff rows into one count.\n2. Apply HAVING count > 1 to that implicit group.\n3. Reject counts 0 and 1.\n4. Return one row with 6 for six staff.",
    "explanation": "An aggregate without GROUP BY forms one implicit group. COUNT(*) returns 0 for an empty source, but HAVING rejects that group because 0 > 1 is false. The same rejection occurs for a count of 1.",
    "solutionMd": "```sql\nSELECT COUNT(*) AS myCount\nFROM Staff\nHAVING COUNT(*) > 1;\n\n-- 0 staff: no result row; 1 staff: no result row; 6 staff: one row with myCount = 6.\n```\n\nAn aggregate without GROUP BY forms one implicit group. COUNT(*) returns 0 for an empty source, but HAVING rejects that group because 0 > 1 is false. The same rejection occurs for a count of 1.\n\n1. Aggregate all Staff rows into one count.\n2. Apply HAVING count > 1 to that implicit group.\n3. Reject counts 0 and 1.\n4. Return one row with 6 for six staff.",
    "hintSteps": [
      "No GROUP BY does not prevent an aggregate query from having one implicit group.",
      "Compute COUNT(*) first, then apply its HAVING threshold."
    ],
    "walkthroughSteps": [
      "Aggregate all Staff rows into one count.",
      "Apply HAVING count > 1 to that implicit group.",
      "Reject counts 0 and 1.",
      "Return one row with 6 for six staff."
    ],
    "rubric": [
      {
        "criterion": "Valid implicit-group HAVING query",
        "marks": 2
      },
      {
        "criterion": "Correct results for all three source sizes",
        "marks": 2
      }
    ],
    "references": [
      "Lecture 9 Final.pdf, PDF pages 30-31"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-9",
      "slide-exercise",
      "having-without-group-by"
    ]
  },
  {
    "id": "db-e2-sql-37",
    "type": "fill",
    "difficulty": "easy",
    "points": 1,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Staff(staffNo PRIMARY KEY, fName, lName, position, sex, DOB DATE, salary DECIMAL(7,2), branchNo)`\n\nJohn White has annual salary 30000. What value is returned for his `salary / 12 AS monthlySalary`? Enter only the number; units are currency per month.",
    "correct": [
      "2500",
      "2500.00"
    ],
    "explanation": "30000/12 = 2500 per month. The calculated SELECT expression changes the displayed result, not the stored annual amount.",
    "hintSteps": [
      "There are 12 monthly amounts in one annual amount.",
      "Divide, rather than multiply, the annual value by 12."
    ],
    "walkthroughSteps": [
      "Take the annual value 30000.",
      "Compute 30000/12 = 2500."
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 8-9"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "exam-style",
      "calculated-fields"
    ]
  },
  {
    "id": "db-e2-sql-38",
    "type": "fill",
    "difficulty": "easy",
    "points": 1,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Viewing(propertyNo)` has five rows with values PA14, PG4, PG4, PA14, PG36. How many rows does `SELECT DISTINCT propertyNo FROM Viewing;` return? Enter an integer.",
    "correct": [
      "3"
    ],
    "explanation": "The unique values are PA14, PG4, and PG36, giving three output rows. SQL projection keeps duplicates unless DISTINCT is requested.",
    "hintSteps": [
      "Ignore repeated appearances of the same property number.",
      "Count the set of unique selected values."
    ],
    "walkthroughSteps": [
      "Collapse the repeated PA14 and PG4 values.",
      "Count PA14, PG4, and PG36: three rows."
    ],
    "references": [
      "Lecture 8.pdf, PDF pages 6-7"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "lecture-8",
      "exam-style",
      "distinct"
    ]
  }
];

export const classActivityQuestions: Question[] = [
  {
    "id": "db-e2-activity-q1",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Users(user_id PRIMARY KEY, username, email)`\n\nClass Activity Q1: Find rows whose username contains a literal underscore anywhere. Return all columns. Use LIKE and the explicit escape character `!`.",
    "sampleAnswer": "```sql\nSELECT *\nFROM Users\nWHERE username LIKE '%!_%' ESCAPE '!';\n```\n\nThe outer percent characters are contains wildcards. !_ represents an actual underscore, so this does not match every nonempty username as an unescaped underscore pattern would.\n\n1. Use SELECT * for rows of Users.\n2. Build % + !_ + % as the pattern.\n3. Declare ! as the escape character.",
    "explanation": "The outer percent characters are contains wildcards. !_ represents an actual underscore, so this does not match every nonempty username as an unescaped underscore pattern would.",
    "solutionMd": "```sql\nSELECT *\nFROM Users\nWHERE username LIKE '%!_%' ESCAPE '!';\n```\n\nThe outer percent characters are contains wildcards. !_ represents an actual underscore, so this does not match every nonempty username as an unescaped underscore pattern would.\n\n1. Use SELECT * for rows of Users.\n2. Build % + !_ + % as the pattern.\n3. Declare ! as the escape character.",
    "hintSteps": [
      "An unescaped underscore matches any one character.",
      "Keep percent wildcards outside an escaped literal underscore."
    ],
    "walkthroughSteps": [
      "Use SELECT * for rows of Users.",
      "Build % + !_ + % as the pattern.",
      "Declare ! as the escape character."
    ],
    "rubric": [
      {
        "criterion": "Correct Users source and complete-row projection",
        "marks": 1
      },
      {
        "criterion": "Correct escaped literal underscore with both contains wildcards",
        "marks": 2
      },
      {
        "criterion": "Explicit ESCAPE declaration",
        "marks": 1
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q1"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "like-escaping"
    ]
  },
  {
    "id": "db-e2-activity-q2",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Users(user_id PRIMARY KEY, username, email)`\n\nClass Activity Q2 (clarified): Return usernames beginning with the literal prefix `admin_`, followed by exactly five additional characters. The underscore in the prefix is literal; the five suffix characters may be any characters. Use LIKE and ESCAPE `!`.",
    "sampleAnswer": "```sql\nSELECT username\nFROM Users\nWHERE username LIKE 'admin!______' ESCAPE '!';\n```\n\nAfter admin, the pattern contains ! followed by SIX underscore characters: the first is escaped and literal, and the remaining five each match one suffix character. There is no percent wildcard, so the length is exact. The photo's prefix/suffix wording is explicitly clarified.\n\n1. Start with the literal letters admin.\n2. Append !_ for the literal prefix underscore.\n3. Append five unescaped underscores for exactly five suffix characters.\n4. Declare ESCAPE !; the resulting username length is eleven characters.",
    "explanation": "After admin, the pattern contains ! followed by SIX underscore characters: the first is escaped and literal, and the remaining five each match one suffix character. There is no percent wildcard, so the length is exact. The photo's prefix/suffix wording is explicitly clarified.",
    "solutionMd": "```sql\nSELECT username\nFROM Users\nWHERE username LIKE 'admin!______' ESCAPE '!';\n```\n\nAfter admin, the pattern contains ! followed by SIX underscore characters: the first is escaped and literal, and the remaining five each match one suffix character. There is no percent wildcard, so the length is exact. The photo's prefix/suffix wording is explicitly clarified.\n\n1. Start with the literal letters admin.\n2. Append !_ for the literal prefix underscore.\n3. Append five unescaped underscores for exactly five suffix characters.\n4. Declare ESCAPE !; the resulting username length is eleven characters.",
    "hintSteps": [
      "Escape the prefix underscore so it is not counted as an arbitrary character.",
      "Use five unescaped underscores for the suffix and no trailing percent."
    ],
    "walkthroughSteps": [
      "Start with the literal letters admin.",
      "Append !_ for the literal prefix underscore.",
      "Append five unescaped underscores for exactly five suffix characters.",
      "Declare ESCAPE !; the resulting username length is eleven characters."
    ],
    "rubric": [
      {
        "criterion": "Projects username from Users",
        "marks": 1
      },
      {
        "criterion": "Escapes the literal prefix underscore",
        "marks": 2
      },
      {
        "criterion": "Requires exactly five further characters without percent wildcard",
        "marks": 2
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q2"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "adapted-source",
      "like-escaping"
    ]
  },
  {
    "id": "db-e2-activity-q3",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`Users(user_id PRIMARY KEY, username, email)`\n\nClass Activity Q3 (scope clarified): List email values tied to university domains. For this exercise define that to mean a domain ending exactly in `.edu` or `.edu.xx`, where xx is exactly two letters. Assume stored emails are syntactically valid, lowercase, and any two-character suffix consists of letters. Do not include `.edu.com` or an email whose local part alone contains `.edu`. Use LIKE.",
    "sampleAnswer": "```sql\nSELECT email\nFROM Users\nWHERE email LIKE '%@%.edu'\n   OR email LIKE '%@%.edu.__';\n```\n\nThe @ separates the local part from the domain. Anchored patterns have no trailing percent: one ends at .edu and the other allows exactly two characters after .edu. The original photo does not define university domains; this adaptation states a grading scope rather than claiming that all universities worldwide use these suffixes.\n\n1. Project email from Users.\n2. Use %@%.edu for the exact .edu suffix.\n3. Use %@%.edu.__ for the explicitly defined two-character suffix.\n4. Combine alternatives with OR and use the stated valid-email assumption.",
    "explanation": "The @ separates the local part from the domain. Anchored patterns have no trailing percent: one ends at .edu and the other allows exactly two characters after .edu. The original photo does not define university domains; this adaptation states a grading scope rather than claiming that all universities worldwide use these suffixes.",
    "solutionMd": "```sql\nSELECT email\nFROM Users\nWHERE email LIKE '%@%.edu'\n   OR email LIKE '%@%.edu.__';\n```\n\nThe @ separates the local part from the domain. Anchored patterns have no trailing percent: one ends at .edu and the other allows exactly two characters after .edu. The original photo does not define university domains; this adaptation states a grading scope rather than claiming that all universities worldwide use these suffixes.\n\n1. Project email from Users.\n2. Use %@%.edu for the exact .edu suffix.\n3. Use %@%.edu.__ for the explicitly defined two-character suffix.\n4. Combine alternatives with OR and use the stated valid-email assumption.",
    "hintSteps": [
      "Anchor the educational suffix at the end of the email instead of using a trailing percent.",
      "Use exactly two underscore wildcards for the defined country suffix."
    ],
    "walkthroughSteps": [
      "Project email from Users.",
      "Use %@%.edu for the exact .edu suffix.",
      "Use %@%.edu.__ for the explicitly defined two-character suffix.",
      "Combine alternatives with OR and use the stated valid-email assumption."
    ],
    "rubric": [
      {
        "criterion": "Correct email projection/source",
        "marks": 1
      },
      {
        "criterion": "Exact .edu terminal-domain pattern",
        "marks": 2
      },
      {
        "criterion": "Exact two-character .edu.xx alternative and OR",
        "marks": 2
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q3"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "adapted-source",
      "like-patterns"
    ]
  },
  {
    "id": "db-e2-activity-q4a",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q4(a): Return sid values for people whose phone numbers are missing, treating both NULL and the empty string as missing. Write the query and give the returned IDs. Row order is irrelevant.",
    "sampleAnswer": "```sql\nSELECT sid\nFROM SurveyMini\nWHERE phone IS NULL OR phone = '';\n\n-- Returned IDs: 2 and 4\n```\n\nRow 2 has a NULL phone; row 4 has an empty phone string. Row 3's email is empty but its phone is present, so it does not qualify. IS NULL alone would miss row 4.\n\n1. Locate the NULL phone at sid 2.\n2. Locate the empty-string phone at sid 4.\n3. Combine phone IS NULL with phone = empty string using OR.\n4. Return the two qualifying identifiers.",
    "explanation": "Row 2 has a NULL phone; row 4 has an empty phone string. Row 3's email is empty but its phone is present, so it does not qualify. IS NULL alone would miss row 4.",
    "solutionMd": "```sql\nSELECT sid\nFROM SurveyMini\nWHERE phone IS NULL OR phone = '';\n\n-- Returned IDs: 2 and 4\n```\n\nRow 2 has a NULL phone; row 4 has an empty phone string. Row 3's email is empty but its phone is present, so it does not qualify. IS NULL alone would miss row 4.\n\n1. Locate the NULL phone at sid 2.\n2. Locate the empty-string phone at sid 4.\n3. Combine phone IS NULL with phone = empty string using OR.\n4. Return the two qualifying identifiers.",
    "hintSteps": [
      "Test the phone column, not email.",
      "Missing is explicitly defined as either of two different representations."
    ],
    "walkthroughSteps": [
      "Locate the NULL phone at sid 2.",
      "Locate the empty-string phone at sid 4.",
      "Combine phone IS NULL with phone = empty string using OR.",
      "Return the two qualifying identifiers."
    ],
    "rubric": [
      {
        "criterion": "Correct two-part phone predicate with OR",
        "marks": 2
      },
      {
        "criterion": "Correct sid projection/source",
        "marks": 1
      },
      {
        "criterion": "Correct IDs 2 and 4",
        "marks": 1
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q4(a)"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "null-versus-empty"
    ]
  },
  {
    "id": "db-e2-activity-q4b-i",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q4(bi): The application binds `:p_email` to NULL. Give the sid result for EACH query below and explain the difference or lack of difference. The `:p_email` notation represents a bound application parameter, not a literal MySQL server-side token.\n\n```sql\nSELECT sid FROM SurveyMini WHERE email = :p_email;\nSELECT sid FROM SurveyMini WHERE email <=> :p_email;\n```",
    "sampleAnswer": "Ordinary equality (=): no rows.\nMySQL NULL-safe equality (<=>): sid 2.\n\nEvery ordinary equality with a NULL parameter is UNKNOWN; NULL-safe equality matches the stored NULL email.\n\n1. Identify the bound parameter value.\n2. Evaluate ordinary equality, remembering its NULL rule.\n3. Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.\n4. Keep only the sid values whose respective predicate is TRUE.",
    "explanation": "Every ordinary equality with a NULL parameter is UNKNOWN; NULL-safe equality matches the stored NULL email.",
    "solutionMd": "Ordinary equality (=): no rows.\nMySQL NULL-safe equality (<=>): sid 2.\n\nEvery ordinary equality with a NULL parameter is UNKNOWN; NULL-safe equality matches the stored NULL email.\n\n1. Identify the bound parameter value.\n2. Evaluate ordinary equality, remembering its NULL rule.\n3. Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.\n4. Keep only the sid values whose respective predicate is TRUE.",
    "hintSteps": [
      "Evaluate the two operators separately against each stored email.",
      "WHERE keeps TRUE and rejects UNKNOWN as well as FALSE."
    ],
    "walkthroughSteps": [
      "Identify the bound parameter value.",
      "Evaluate ordinary equality, remembering its NULL rule.",
      "Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.",
      "Keep only the sid values whose respective predicate is TRUE."
    ],
    "rubric": [
      {
        "criterion": "Correct ordinary-equality result",
        "marks": 1
      },
      {
        "criterion": "Correct NULL-safe-equality result",
        "marks": 1
      },
      {
        "criterion": "Explains the NULL/empty/value distinction",
        "marks": 2
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q4(b)",
      "IMG_6587.jpg, continuation of Class Activity Q4(b)"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "null-safe-equality"
    ]
  },
  {
    "id": "db-e2-activity-q4b-ii",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q4(bii): The application binds `:p_email` to the empty string `''`. Give the sid result for EACH query below and explain the difference or lack of difference. The `:p_email` notation represents a bound application parameter, not a literal MySQL server-side token.\n\n```sql\nSELECT sid FROM SurveyMini WHERE email = :p_email;\nSELECT sid FROM SurveyMini WHERE email <=> :p_email;\n```",
    "sampleAnswer": "Ordinary equality (=): sid 3.\nMySQL NULL-safe equality (<=>): sid 3.\n\nAn empty string is a non-NULL value. Both equality operators match the stored empty email; neither matches the NULL email.\n\n1. Identify the bound parameter value.\n2. Evaluate ordinary equality, remembering its NULL rule.\n3. Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.\n4. Keep only the sid values whose respective predicate is TRUE.",
    "explanation": "An empty string is a non-NULL value. Both equality operators match the stored empty email; neither matches the NULL email.",
    "solutionMd": "Ordinary equality (=): sid 3.\nMySQL NULL-safe equality (<=>): sid 3.\n\nAn empty string is a non-NULL value. Both equality operators match the stored empty email; neither matches the NULL email.\n\n1. Identify the bound parameter value.\n2. Evaluate ordinary equality, remembering its NULL rule.\n3. Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.\n4. Keep only the sid values whose respective predicate is TRUE.",
    "hintSteps": [
      "Evaluate the two operators separately against each stored email.",
      "WHERE keeps TRUE and rejects UNKNOWN as well as FALSE."
    ],
    "walkthroughSteps": [
      "Identify the bound parameter value.",
      "Evaluate ordinary equality, remembering its NULL rule.",
      "Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.",
      "Keep only the sid values whose respective predicate is TRUE."
    ],
    "rubric": [
      {
        "criterion": "Correct ordinary-equality result",
        "marks": 1
      },
      {
        "criterion": "Correct NULL-safe-equality result",
        "marks": 1
      },
      {
        "criterion": "Explains the NULL/empty/value distinction",
        "marks": 2
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q4(b)",
      "IMG_6587.jpg, continuation of Class Activity Q4(b)"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "null-safe-equality"
    ]
  },
  {
    "id": "db-e2-activity-q4b-iii",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q4(biii): The application binds `:p_email` to `'dia@example.com'`. Give the sid result for EACH query below and explain the difference or lack of difference. The `:p_email` notation represents a bound application parameter, not a literal MySQL server-side token.\n\n```sql\nSELECT sid FROM SurveyMini WHERE email = :p_email;\nSELECT sid FROM SurveyMini WHERE email <=> :p_email;\n```",
    "sampleAnswer": "Ordinary equality (=): sid 4.\nMySQL NULL-safe equality (<=>): sid 4.\n\nBoth equality operators match the same non-NULL email value at sid 4. The row with NULL email does not satisfy either condition.\n\n1. Identify the bound parameter value.\n2. Evaluate ordinary equality, remembering its NULL rule.\n3. Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.\n4. Keep only the sid values whose respective predicate is TRUE.",
    "explanation": "Both equality operators match the same non-NULL email value at sid 4. The row with NULL email does not satisfy either condition.",
    "solutionMd": "Ordinary equality (=): sid 4.\nMySQL NULL-safe equality (<=>): sid 4.\n\nBoth equality operators match the same non-NULL email value at sid 4. The row with NULL email does not satisfy either condition.\n\n1. Identify the bound parameter value.\n2. Evaluate ordinary equality, remembering its NULL rule.\n3. Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.\n4. Keep only the sid values whose respective predicate is TRUE.",
    "hintSteps": [
      "Evaluate the two operators separately against each stored email.",
      "WHERE keeps TRUE and rejects UNKNOWN as well as FALSE."
    ],
    "walkthroughSteps": [
      "Identify the bound parameter value.",
      "Evaluate ordinary equality, remembering its NULL rule.",
      "Evaluate NULL-safe equality, which has definite TRUE/FALSE outcomes.",
      "Keep only the sid values whose respective predicate is TRUE."
    ],
    "rubric": [
      {
        "criterion": "Correct ordinary-equality result",
        "marks": 1
      },
      {
        "criterion": "Correct NULL-safe-equality result",
        "marks": 1
      },
      {
        "criterion": "Explains the NULL/empty/value distinction",
        "marks": 2
      }
    ],
    "references": [
      "IMG_6586.jpg, Class Activity Q4(b)",
      "IMG_6587.jpg, continuation of Class Activity Q4(b)"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "null-safe-equality"
    ]
  },
  {
    "id": "db-e2-activity-q5",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q5: Give the result of this query and explain what each count includes.\n\n```sql\nSELECT COUNT(*) AS total_rows,\n       COUNT(email) AS with_email_incl_empty,\n       COUNT(NULLIF(email, '')) AS with_non_empty_email\nFROM SurveyMini;\n```",
    "sampleAnswer": "| total_rows | with_email_incl_empty | with_non_empty_email |\n|---:|---:|---:|\n| 4 | 3 | 2 |\n\nCOUNT(*) counts four rows. COUNT(email) ignores only the one NULL, so the empty string still counts. NULLIF(email, '') converts the empty string to NULL; the last count therefore includes only the two nonempty emails.\n\n1. Count all four rows for total_rows.\n2. Count emails at sids 1, 3, and 4 for with_email_incl_empty.\n3. Convert sid 3's empty string to NULL with NULLIF.\n4. Count only nonempty emails at sids 1 and 4.",
    "explanation": "COUNT(*) counts four rows. COUNT(email) ignores only the one NULL, so the empty string still counts. NULLIF(email, '') converts the empty string to NULL; the last count therefore includes only the two nonempty emails.",
    "solutionMd": "| total_rows | with_email_incl_empty | with_non_empty_email |\n|---:|---:|---:|\n| 4 | 3 | 2 |\n\nCOUNT(*) counts four rows. COUNT(email) ignores only the one NULL, so the empty string still counts. NULLIF(email, '') converts the empty string to NULL; the last count therefore includes only the two nonempty emails.\n\n1. Count all four rows for total_rows.\n2. Count emails at sids 1, 3, and 4 for with_email_incl_empty.\n3. Convert sid 3's empty string to NULL with NULLIF.\n4. Count only nonempty emails at sids 1 and 4.",
    "hintSteps": [
      "COUNT(column) excludes NULL but includes an empty string.",
      "NULLIF(email, empty string) makes empty email values NULL before counting."
    ],
    "walkthroughSteps": [
      "Count all four rows for total_rows.",
      "Count emails at sids 1, 3, and 4 for with_email_incl_empty.",
      "Convert sid 3's empty string to NULL with NULLIF.",
      "Count only nonempty emails at sids 1 and 4."
    ],
    "rubric": [
      {
        "criterion": "Correct total_rows = 4",
        "marks": 1
      },
      {
        "criterion": "Correct COUNT(email) = 3 and explanation",
        "marks": 1
      },
      {
        "criterion": "Correct NULLIF count = 2 and explanation",
        "marks": 2
      }
    ],
    "references": [
      "IMG_6587.jpg, Class Activity Q5"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "count-nullif"
    ]
  },
  {
    "id": "db-e2-activity-q6a",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 4,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q6(a): What is wrong with the following query under the stated MySQL mode? Repair it to return ONE total row count for the whole table, and state the result.\n\n```sql\nSELECT sid, COUNT(*) AS total_rows\nFROM SurveyMini;\n```",
    "sampleAnswer": "```sql\nSELECT COUNT(*) AS total_rows\nFROM SurveyMini;\n\n-- Result: total_rows = 4\n```\n\nThe original ungrouped aggregate mixes a whole-table count with sid, which has no determined single value for that group. The requested global total is repaired by removing sid. GROUP BY sid would be valid but would answer a per-ID question instead.\n\n1. Identify the undefined nonaggregate sid.\n2. Remove it while retaining COUNT(*) and its alias.\n3. Count the four source rows.\n4. Explain why grouping by sid changes the intended output shape.",
    "explanation": "The original ungrouped aggregate mixes a whole-table count with sid, which has no determined single value for that group. The requested global total is repaired by removing sid. GROUP BY sid would be valid but would answer a per-ID question instead.",
    "solutionMd": "```sql\nSELECT COUNT(*) AS total_rows\nFROM SurveyMini;\n\n-- Result: total_rows = 4\n```\n\nThe original ungrouped aggregate mixes a whole-table count with sid, which has no determined single value for that group. The requested global total is repaired by removing sid. GROUP BY sid would be valid but would answer a per-ID question instead.\n\n1. Identify the undefined nonaggregate sid.\n2. Remove it while retaining COUNT(*) and its alias.\n3. Count the four source rows.\n4. Explain why grouping by sid changes the intended output shape.",
    "hintSteps": [
      "Without GROUP BY, COUNT(*) aggregates the entire source into one group.",
      "A global count does not need a particular sid in its output."
    ],
    "walkthroughSteps": [
      "Identify the undefined nonaggregate sid.",
      "Remove it while retaining COUNT(*) and its alias.",
      "Count the four source rows.",
      "Explain why grouping by sid changes the intended output shape."
    ],
    "rubric": [
      {
        "criterion": "Explains the strict-grouping violation",
        "marks": 2
      },
      {
        "criterion": "Correct one-row total-count repair",
        "marks": 1
      },
      {
        "criterion": "Correct count 4",
        "marks": 1
      }
    ],
    "references": [
      "IMG_6587.jpg, Class Activity Q6(a)"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "adapted-source",
      "only-full-group-by"
    ]
  },
  {
    "id": "db-e2-activity-q6b",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`SurveyMini(sid PRIMARY KEY, email, phone, opted_in)`.\n`email` and `phone` can be NULL or the empty string `''`. `opted_in` is 1 (yes), 0 (no), or NULL (unknown). NULL below is a missing SQL value; `''` is a present zero-length string.\n\n| sid | email | phone | opted_in |\n|---:|---|---|---:|\n| 1 | ana@example.edu | 555-111 | 1 |\n| 2 | NULL | NULL | NULL |\n| 3 | '' | 555-3333 | 0 |\n| 4 | dia@example.com | '' | 1 |\n\nClass Activity Q6(b): Identify BOTH problems in this query. Repair it to return each sid with its row count, in ascending sid order. Give its result.\n\n```sql\nSELECT sid, COUNT(*) AS total_rows\nORDER BY sid\nFROM SurveyMini;\n```",
    "sampleAnswer": "```sql\nSELECT sid, COUNT(*) AS total_rows\nFROM SurveyMini\nGROUP BY sid\nORDER BY sid ASC;\n\n-- (sid,total_rows): (1,1), (2,1), (3,1), (4,1)\n```\n\nFROM must precede ORDER BY in the written syntax. After repairing that order, sid still needs to be well-defined per aggregate group; GROUP BY sid produces the explicitly requested per-ID output. Since sid is a primary key, each group contains one row.\n\n1. Move FROM immediately after SELECT.\n2. Add GROUP BY sid for the per-ID count.\n3. Place ORDER BY sid last.\n4. Each primary-key value has one row, giving four counts of 1.",
    "explanation": "FROM must precede ORDER BY in the written syntax. After repairing that order, sid still needs to be well-defined per aggregate group; GROUP BY sid produces the explicitly requested per-ID output. Since sid is a primary key, each group contains one row.",
    "solutionMd": "```sql\nSELECT sid, COUNT(*) AS total_rows\nFROM SurveyMini\nGROUP BY sid\nORDER BY sid ASC;\n\n-- (sid,total_rows): (1,1), (2,1), (3,1), (4,1)\n```\n\nFROM must precede ORDER BY in the written syntax. After repairing that order, sid still needs to be well-defined per aggregate group; GROUP BY sid produces the explicitly requested per-ID output. Since sid is a primary key, each group contains one row.\n\n1. Move FROM immediately after SELECT.\n2. Add GROUP BY sid for the per-ID count.\n3. Place ORDER BY sid last.\n4. Each primary-key value has one row, giving four counts of 1.",
    "hintSteps": [
      "The query has a written-order error and a separate grouping issue.",
      "For a count per sid, sid must be the group key before sorting the output."
    ],
    "walkthroughSteps": [
      "Move FROM immediately after SELECT.",
      "Add GROUP BY sid for the per-ID count.",
      "Place ORDER BY sid last.",
      "Each primary-key value has one row, giving four counts of 1."
    ],
    "rubric": [
      {
        "criterion": "Identifies both clause order and aggregate grouping errors",
        "marks": 2
      },
      {
        "criterion": "Correct FROM/GROUP BY/ORDER BY repair",
        "marks": 2
      },
      {
        "criterion": "Correct four per-ID results",
        "marks": 1
      }
    ],
    "references": [
      "IMG_6587.jpg, Class Activity Q6(b)"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "adapted-source",
      "clause-order",
      "only-full-group-by"
    ]
  },
  {
    "id": "db-e2-activity-q7",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "prompt": "Use MySQL 8 with ONLY_FULL_GROUP_BY enabled. Use the exact table/column names shown and single quotes for strings.\n\n`TableA(city, tier, last_name, points)` contains exactly these rows:\n\n| city | tier | last_name | points |\n|---|---:|---|---:|\n| Chicago | 2 | Smith | 95 |\n| Dallas | 1 | Adams | 80 |\n| Chicago | 1 | Brown | 90 |\n| Dallas | 2 | Brown | 85 |\n| Chicago | 2 | Adams | 95 |\n| Dallas | 1 | Smith | 95 |\n\nClass Activity Q7: A SELECT query with ORDER BY produces this displayed output:\n\n| city | tier | last_name |\n|---|---:|---|\n| Chicago | 1 | Brown |\n| Dallas | 1 | Smith |\n| Dallas | 1 | Adams |\n| Chicago | 2 | Smith |\n| Chicago | 2 | Adams |\n| Dallas | 2 | Brown |\n\nWrite the simplest lexicographic ORDER BY using the three DISPLAYED columns (city, tier, last_name), and a complete SELECT that reproduces this order. State each direction. Assume ordinary alphabetical ordering. The finite sample alone cannot prove that no other expression could reproduce the rows; use the displayed-column restriction.",
    "sampleAnswer": "```sql\nSELECT city, tier, last_name\nFROM TableA\nORDER BY tier ASC, city ASC, last_name DESC;\n```\n\nAll tier-1 rows precede tier-2 rows, establishing tier as the first displayed-column key. Within each tier Chicago precedes Dallas. For an equal city/tier pair, Smith precedes Adams, establishing descending last_name. points is not needed. The original request for exact inferred keys is underdetermined without the stated restriction on columns and simplest lexicographic sorting.\n\n1. Recognize the tier sequence 1,1,1,2,2,2 as ascending.\n2. Within each tier, identify Chicago before Dallas as ascending city order.\n3. Within equal city/tier, Smith precedes Adams, requiring descending last_name.\n4. Project exactly city, tier, last_name and put the keys in that priority order.",
    "explanation": "All tier-1 rows precede tier-2 rows, establishing tier as the first displayed-column key. Within each tier Chicago precedes Dallas. For an equal city/tier pair, Smith precedes Adams, establishing descending last_name. points is not needed. The original request for exact inferred keys is underdetermined without the stated restriction on columns and simplest lexicographic sorting.",
    "solutionMd": "```sql\nSELECT city, tier, last_name\nFROM TableA\nORDER BY tier ASC, city ASC, last_name DESC;\n```\n\nAll tier-1 rows precede tier-2 rows, establishing tier as the first displayed-column key. Within each tier Chicago precedes Dallas. For an equal city/tier pair, Smith precedes Adams, establishing descending last_name. points is not needed. The original request for exact inferred keys is underdetermined without the stated restriction on columns and simplest lexicographic sorting.\n\n1. Recognize the tier sequence 1,1,1,2,2,2 as ascending.\n2. Within each tier, identify Chicago before Dallas as ascending city order.\n3. Within equal city/tier, Smith precedes Adams, requiring descending last_name.\n4. Project exactly city, tier, last_name and put the keys in that priority order.",
    "hintSteps": [
      "Look first for the column whose values occur in uninterrupted blocks across the entire output.",
      "Within each equal tier, inspect city order, then inspect equal-city name ties."
    ],
    "walkthroughSteps": [
      "Recognize the tier sequence 1,1,1,2,2,2 as ascending.",
      "Within each tier, identify Chicago before Dallas as ascending city order.",
      "Within equal city/tier, Smith precedes Adams, requiring descending last_name.",
      "Project exactly city, tier, last_name and put the keys in that priority order."
    ],
    "rubric": [
      {
        "criterion": "Correct primary tier ASC key",
        "marks": 2
      },
      {
        "criterion": "Correct secondary city ASC key",
        "marks": 1
      },
      {
        "criterion": "Correct tertiary last_name DESC key",
        "marks": 1
      },
      {
        "criterion": "Complete correct projection/source/order query",
        "marks": 1
      }
    ],
    "references": [
      "IMG_6587.jpg, Class Activity Q7 Table A",
      "IMG_6588.jpg, Class Activity Q7 Table B"
    ],
    "tags": [
      "sql",
      "mysql",
      "exam-2",
      "class-activity",
      "source-exercise",
      "adapted-source",
      "multi-column-order"
    ]
  }
];
