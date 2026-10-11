import type { Question } from "@/lib/types";

export const schemaQuestions: Question[] = [
  {
    id: "db2-schema-team",
    type: "free",
    difficulty: "easy",
    prompt: "In MySQL 8, create `Team` with: `teamId INT UNSIGNED`, an auto-increment primary key; `name VARCHAR(80)`, mandatory and unique; `city VARCHAR(80)`, mandatory; and optional `stadium VARCHAR(80)`. Write the complete `CREATE TABLE` statement.",
    sampleAnswer: "```sql\nCREATE TABLE Team (\n  teamId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n  name VARCHAR(80) NOT NULL UNIQUE,\n  city VARCHAR(80) NOT NULL,\n  stadium VARCHAR(80) NULL\n);\n```\n`NULL` on stadium is optional syntax: a nullable column is the default. The name needs both UNIQUE and NOT NULL; neither replaces the other.",
    explanation: "The primary key uniquely identifies a team, AUTO_INCREMENT allocates identifiers, UNIQUE prevents duplicate names, and NOT NULL makes the required attributes mandatory.",
    rubric: [
      { criterion: "Uses INT UNSIGNED AUTO_INCREMENT PRIMARY KEY for teamId.", marks: 1 },
      { criterion: "Uses VARCHAR(80) NOT NULL UNIQUE for name.", marks: 1 },
      { criterion: "Makes city VARCHAR(80) NOT NULL and stadium VARCHAR(80) nullable.", marks: 1 }
    ],
    hintSteps: ["Translate each requirement into a column declaration.", "Uniqueness and whether a value may be absent are separate requirements."],
    walkthroughSteps: ["Declare the identifier and primary key.", "Add AUTO_INCREMENT and UNSIGNED as specified.", "Declare the unique, mandatory name and mandatory city.", "Allow NULL for the optional stadium."],
    references: ["Homework  2 Part 1.pdf, PDF p. 1, Question 1: Team"],
    tags: ["exam-2", "mysql", "ddl", "constraints", "adapted-homework"]
  },
  {
    id: "db2-schema-player",
    type: "free",
    difficulty: "med",
    prompt: "`Team(teamId INT UNSIGNED PRIMARY KEY)` already exists. Create `Player` in MySQL 8 with an auto-increment unsigned integer primary key `playerId`, mandatory `fullName VARCHAR(100)`, optional `teamId` referencing Team, optional `position VARCHAR(20)`, and optional `birthYear SMALLINT`. A NULL teamId means a free agent. Include an explicit foreign-key constraint.",
    sampleAnswer: "```sql\nCREATE TABLE Player (\n  playerId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n  fullName VARCHAR(100) NOT NULL,\n  teamId INT UNSIGNED NULL,\n  position VARCHAR(20) NULL,\n  birthYear SMALLINT NULL,\n  FOREIGN KEY (teamId) REFERENCES Team(teamId)\n);\n```\nCreate Team before Player. The signedness of the referencing integer must agree with the referenced key. A free agent uses NULL, not an invented team identifier such as 0.",
    explanation: "A nullable foreign key still checks every non-NULL value. Being a foreign key does not automatically make a column mandatory.",
    rubric: [
      { criterion: "Declares the player key, mandatory name, and optional position/birthYear with the specified types.", marks: 1 },
      { criterion: "Declares teamId as a nullable INT UNSIGNED.", marks: 1 },
      { criterion: "Includes FOREIGN KEY (teamId) REFERENCES Team(teamId).", marks: 1 }
    ],
    hintSteps: ["The referenced key is unsigned, so match that type.", "A free agent has an absent team value rather than a nonexistent team."],
    walkthroughSteps: ["Define the Player attributes.", "Keep teamId nullable to model free agents.", "Use the same integer signedness as Team.teamId.", "Add the foreign key after the column declarations."],
    references: ["Homework  2 Part 1.pdf, PDF p. 1, Question 1: Player", "Lecture 2.pdf, PDF pp. 12-13, foreign keys and referential integrity"],
    tags: ["exam-2", "mysql", "ddl", "foreign-keys", "null", "adapted-homework"]
  },
  {
    id: "db2-schema-appearance",
    type: "free",
    difficulty: "med",
    prompt: "Team, Player, and `Match` already exist and have unsigned integer keys named teamId, playerId, and matchId. Create `Appearance(matchId, playerId, teamId, minutes, goals, assists)` in MySQL 8. Its primary key is the pair (matchId, playerId). All three ID columns are mandatory foreign keys. minutes is optional SMALLINT; goals and assists are optional TINYINT. Quote `Match` with backticks in your reference.",
    sampleAnswer: "```sql\nCREATE TABLE Appearance (\n  matchId INT UNSIGNED NOT NULL,\n  playerId INT UNSIGNED NOT NULL,\n  teamId INT UNSIGNED NOT NULL,\n  minutes SMALLINT NULL,\n  goals TINYINT NULL,\n  assists TINYINT NULL,\n  PRIMARY KEY (matchId, playerId),\n  FOREIGN KEY (matchId) REFERENCES `Match`(matchId),\n  FOREIGN KEY (playerId) REFERENCES Player(playerId),\n  FOREIGN KEY (teamId) REFERENCES Team(teamId)\n);\n```\nA player can appear in multiple matches, and a match can have multiple players. Only repeating the same match-player pair violates this primary key.",
    explanation: "The composite key identifies an appearance, while the three foreign keys connect it to the game, player, and represented team. Neither matchId nor playerId alone identifies an appearance.",
    rubric: [
      { criterion: "Uses the specified unsigned mandatory IDs and nullable statistical types.", marks: 1 },
      { criterion: "Declares exactly the composite PRIMARY KEY (matchId, playerId).", marks: 1 },
      { criterion: "Declares all three foreign keys to the correct relations/attributes.", marks: 1 }
    ],
    hintSteps: ["A composite key is one PRIMARY KEY clause containing both columns.", "The teamId here records the team represented in that appearance."],
    walkthroughSteps: ["Declare the columns and their nullability.", "Write the pair as one composite primary key.", "Reference each parent key separately.", "Check that many players per match and many matches per player remain possible."],
    references: ["Homework  2 Part 1.pdf, PDF pp. 1-2, Question 1: Appearance", "Lecture 2.pdf, PDF pp. 11-13"],
    tags: ["exam-2", "mysql", "ddl", "composite-key", "foreign-keys", "adapted-homework"]
  },
  {
    id: "db2-schema-match",
    type: "free",
    difficulty: "med",
    prompt: "Write MySQL 8 DDL for `Match`: unsigned auto-increment integer matchId primary key; mandatory unsigned homeTeamId and awayTeamId both referencing Team(teamId); mandatory matchDate DATE; optional stadium VARCHAR(80); optional homeGoals and awayGoals TINYINT. Explain why an unplayed scheduled match can have both goal columns NULL without violating entity integrity.",
    sampleAnswer: "```sql\nCREATE TABLE `Match` (\n  matchId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,\n  homeTeamId INT UNSIGNED NOT NULL,\n  awayTeamId INT UNSIGNED NOT NULL,\n  matchDate DATE NOT NULL,\n  stadium VARCHAR(80) NULL,\n  homeGoals TINYINT NULL,\n  awayGoals TINYINT NULL,\n  FOREIGN KEY (homeTeamId) REFERENCES Team(teamId),\n  FOREIGN KEY (awayTeamId) REFERENCES Team(teamId)\n);\n```\nEntity integrity forbids NULL in the primary key. The scores are not key attributes and are explicitly nullable, so unknown scores are permitted. NULL does not mean a recorded score of zero.",
    explanation: "Two role-specific foreign keys can reference the same parent relation. Entity integrity concerns the primary key, while other attributes follow their declared nullability.",
    rubric: [
      { criterion: "Defines matchId, matchDate, stadium, and goal columns with the requested types and nullability.", marks: 1 },
      { criterion: "Defines both mandatory team foreign keys correctly.", marks: 1 },
      { criterion: "Explains that scores are nullable non-key attributes and distinguishes NULL from zero.", marks: 1 }
    ],
    hintSteps: ["Home and away teams need separate references to Team.", "Which attribute is the primary key: a score or matchId?"],
    walkthroughSteps: ["Declare the match identifier.", "Declare each team role with its own foreign key.", "Require the date but allow absent scores and stadium.", "Apply entity integrity to the key rather than every column."],
    references: ["Homework  2 Part 1.pdf, PDF pp. 1-3, Match schema and scheduled match", "Lecture 2.pdf, PDF p. 13"],
    tags: ["exam-2", "mysql", "ddl", "integrity", "null", "adapted-homework"]
  },
  {
    id: "db2-schema-fk-full-answer",
    type: "free",
    difficulty: "easy",
    prompt: "Given `Player(playerId PK, fullName, teamId FK)` and `Team(teamId PK, name)`, identify the foreign key fully: (a) its attribute, (b) the relation containing it, and (c) the referenced relation and attribute. Then distinguish entity integrity from referential integrity for these tables. teamId in Player is nullable.",
    sampleAnswer: "(a) The foreign-key attribute is Player.teamId. (b) It belongs to Player. (c) It references Team.teamId.\n\nEntity integrity requires Player.playerId and Team.teamId to be non-NULL primary keys; their key values must also be unique. Referential integrity requires each non-NULL Player.teamId to identify an existing Team.teamId. NULL is permitted in Player.teamId because that foreign-key column is nullable. fullName and Team.name are not the joining keys.",
    explanation: "Give both ends of the relationship, not merely two column names that happen to match. The prior paper explicitly required the attribute, containing relation, and referenced relation/attribute.",
    rubric: [
      { criterion: "Names Player.teamId and its reference to Team.teamId.", marks: 1 },
      { criterion: "States the non-NULL/unique primary-key requirements.", marks: 1 },
      { criterion: "States the existing-parent requirement with the nullable-FK exception.", marks: 1 }
    ],
    hintSteps: ["Start with the child relation, then name the parent's key.", "Entity integrity checks identity; referential integrity checks the link."],
    walkthroughSteps: ["Locate the attribute declared as the foreign key.", "Name its containing relation explicitly.", "Name the referenced relation and key.", "Apply the two integrity rules separately."],
    references: ["Exam 1, IMG_6542.jpg, Question 2(a)-(b): adapted to SoccerHub", "Homework  2 Part 1.pdf, PDF p. 1", "Lecture 2.pdf, PDF pp. 12-13"],
    tags: ["exam-2", "mysql", "foreign-keys", "integrity", "additional-practice"]
  },
  {
    id: "db2-schema-insert-free-agent",
    type: "free",
    difficulty: "easy",
    prompt: "Player is empty. Its columns are playerId INT UNSIGNED AUTO_INCREMENT PRIMARY KEY, fullName VARCHAR(100) NOT NULL, teamId INT UNSIGNED NULL, position VARCHAR(20) NULL, and birthYear SMALLINT NULL. It has an explicitly declared FOREIGN KEY (teamId) REFERENCES Team(teamId). Write an INSERT for a free agent called 'Alex Rivera', position 'FW', born in 2001, allowing MySQL to generate playerId. Explain whether teamId=0 is equivalent to NULL.",
    sampleAnswer: "```sql\nINSERT INTO Player (fullName, teamId, position, birthYear)\nVALUES ('Alex Rivera', NULL, 'FW', 2001);\n```\nOmit the auto-generated playerId. NULL represents no team. Zero is a real integer and, unless a Team with teamId=0 exists, would violate the foreign key. Do not quote NULL as the string 'NULL'.",
    explanation: "Use a column list to make the value mapping explicit. A missing relationship is represented by SQL NULL, not a placeholder number or string.",
    rubric: [
      { criterion: "Uses a column list and correctly quoted name/position with numeric birthYear.", marks: 1 },
      { criterion: "Uses unquoted NULL for teamId and leaves playerId auto-generated.", marks: 1 },
      { criterion: "Explains why zero is a value subject to the FK check, not an absent relationship.", marks: 1 }
    ],
    hintSteps: ["Leave the auto-increment column out of the column list.", "SQL NULL is a keyword, not a quoted string."],
    walkthroughSteps: ["List the four attributes being supplied.", "Use single quotes for strings and an unquoted year.", "Represent the absent team with NULL.", "Explain how a non-NULL foreign-key value is checked."],
    references: ["Lecture 7.pdf, PDF pp. 3, 5, 9", "Homework  2 Part 1.pdf, PDF p. 1: adapted Player requirements"],
    tags: ["exam-2", "mysql", "insert", "literals", "foreign-keys", "additional-practice"]
  },
  {
    id: "db2-schema-safe-update",
    type: "free",
    difficulty: "easy",
    prompt: "`Player(playerId PRIMARY KEY, fullName, teamId)` has players 1, 2, and 3. Player 2 has become a free agent. Write an UPDATE affecting only that player. What goes wrong if its WHERE clause is omitted?",
    sampleAnswer: "```sql\nUPDATE Player\nSET teamId = NULL\nWHERE playerId = 2;\n```\nThe primary-key predicate limits the update to one player. Without WHERE, the statement sets teamId to NULL for every row allowed by the database's execution settings; it does not choose a row automatically. A client's safe-update setting may reject that broad statement, but it is not part of the intended SQL predicate.",
    explanation: "The SET clause says what changes; WHERE identifies which rows change. This is extra DML practice based on the lecture's SQL component overview.",
    rubric: [
      { criterion: "Writes UPDATE Player SET teamId = NULL.", marks: 1 },
      { criterion: "Limits the operation with WHERE playerId = 2.", marks: 1 },
      { criterion: "Explains the all-row effect of omitting WHERE.", marks: 1 }
    ],
    hintSteps: ["Use the primary key to identify the row.", "SET and WHERE perform different jobs."],
    walkthroughSteps: ["Select Player as the target table.", "Assign NULL to its teamId.", "Restrict by playerId=2.", "Check that the intended target set contains only one row."],
    references: ["Lecture 7.pdf, PDF p. 3, SQL DML overview; additional practice"],
    tags: ["exam-2", "mysql", "update", "where", "additional-practice"]
  },
  {
    id: "db2-schema-delete-fk",
    type: "free",
    difficulty: "med",
    prompt: "Team contains (teamId=1, name='North FC'). Player contains (playerId=10, teamId=1). Player.teamId is a nullable foreign key to Team.teamId with the default restrictive delete behavior; no cascade or SET NULL action is declared. Explain the outcome of `DELETE FROM Team WHERE teamId = 1;`. Give a two-statement way to keep the player as a free agent and then delete that team, and state why it works.",
    sampleAnswer: "The direct delete is rejected because the Player row still references Team 1.\n\n```sql\nUPDATE Player SET teamId = NULL WHERE teamId = 1;\nDELETE FROM Team WHERE teamId = 1;\n```\nThe update removes the references without deleting players. NULL is allowed for a free agent, so after the update the team can be deleted without leaving a dangling foreign key. In an application these related changes should be handled as one transaction to avoid an unintended partial operation.",
    explanation: "A declared foreign key protects links on parent deletes as well as child inserts. The specified default behavior matters: no automatic cascading or nulling was requested.",
    rubric: [
      { criterion: "Explains why the original delete fails under the stated restrictive behavior.", marks: 1 },
      { criterion: "Nulls the referencing teamId only for players in Team 1.", marks: 1 },
      { criterion: "Deletes Team 1 after removing the references, while preserving Player rows.", marks: 1 }
    ],
    hintSteps: ["Check the referencing Player rows before deleting the parent.", "A nullable FK gives a way to remove the relationship while keeping the child."],
    walkthroughSteps: ["Find the foreign-key dependency.", "Apply the stated restrictive delete behavior.", "Set referencing values to NULL.", "Delete the now-unreferenced parent."],
    references: ["Lecture 2.pdf, PDF p. 13, referential integrity", "Lecture 7.pdf, PDF p. 3, DML overview", "Homework  2 Part 1.pdf, PDF p. 1; additional practice"],
    tags: ["exam-2", "mysql", "delete", "referential-integrity", "additional-practice"]
  },
  {
    id: "db2-schema-join-bridge",
    type: "free",
    difficulty: "med",
    prompt: "Translate the join-result style from Exam 1 into SQL.\n\nR(r_id, j, r2): (1,10,'A'), (2,20,'A'), (3,10,'B'), (4,30,'C').\nS(s_id, j, s2): (101,10,'X'), (103,20,'Z'), (104,40,'W').\n\nWrite (a) an inner equijoin returning R.r_id, R.j, S.s_id, S.j; (b) a LEFT JOIN returning R.r_id and S.s_id, ordered by R.r_id; (c) the row count of each result. Is a NATURAL JOIN equivalent to the equijoin's column layout?",
    sampleAnswer: "```sql\n-- (a)\nSELECT r.r_id, r.j AS r_j, s.s_id, s.j AS s_j\nFROM R AS r JOIN S AS s ON r.j = s.j;\n-- (b)\nSELECT r.r_id, s.s_id\nFROM R AS r LEFT JOIN S AS s ON r.j = s.j\nORDER BY r.r_id;\n```\n(a) has 3 rows: (1,10,101,10), (2,20,103,20), (3,10,101,10).\n(b) has 4 rows: (1,101), (2,103), (3,101), (4,NULL).\nA NATURAL JOIN matches on the shared j but exposes one j column in SELECT *, whereas the explicit equijoin's layout retains both. These schemas have no other shared column names.",
    explanation: "A join does not deduplicate matching keys. Two R rows with j=10 both match S's j=10 row; LEFT JOIN also preserves the unmatched j=30 row.",
    rubric: [
      { criterion: "Writes the equijoin on r.j=s.j with both requested j columns.", marks: 1 },
      { criterion: "Writes the left join and gives the correct 3/4 row counts and NULL padding.", marks: 1 },
      { criterion: "Explains the one-common-column layout of NATURAL JOIN.", marks: 1 }
    ],
    hintSteps: ["Count matching row pairs, not just distinct joining values.", "The unmatched R row survives only the left join."],
    walkthroughSteps: ["Match each R row's j against S.", "Emit one result for each match.", "For the left join, emit the unmatched R row with NULL S columns.", "Distinguish matching behavior from the displayed column layout."],
    references: ["Exam 1, IMG_6543.jpg, Question 4: adapted SQL variant", "Lecture 4.pdf, PDF pp. 11-14", "Lecture 5.pdf, PDF pp. 1, 5", "Lecture 10 2026.pdf, PDF pp. 9-12"],
    tags: ["exam-2", "mysql", "joins", "outer-join", "additional-practice"]
  },
  {
    id: "db2-schema-library-sql",
    type: "free",
    difficulty: "med",
    prompt: "Use the Exam 1 Library schema in MySQL: Book(ISBN PK, title, edition, year), BookCopy(copyNo PK, ISBN FK, available). available is a BOOLEAN represented as 1 for available and 0 otherwise. Write SQL for (a) every book title published in 2012; (b) copyNo and title for available copies; (c) copyNo for available copies of 'Lord of the Rings'. Return distinct titles in (a), but preserve individual copies in (b)/(c).",
    sampleAnswer: "```sql\n-- (a)\nSELECT DISTINCT title FROM Book WHERE year = 2012;\n-- (b)\nSELECT bc.copyNo, b.title\nFROM BookCopy AS bc JOIN Book AS b ON bc.ISBN = b.ISBN\nWHERE bc.available = 1;\n-- (c)\nSELECT bc.copyNo\nFROM BookCopy AS bc JOIN Book AS b ON bc.ISBN = b.ISBN\nWHERE bc.available = 1 AND b.title = 'Lord of the Rings';\n```\nThe join follows ISBN, which identifies the book title; copyNo identifies a physical copy. Do not deduplicate copies merely because two share a title.",
    explanation: "This is a MySQL transfer exercise using the familiar Exam 1 schema, rather than a repeat of its relational-algebra language. The representation of available is explicitly specified.",
    rubric: [
      { criterion: "Filters Book by year=2012 and projects distinct titles.", marks: 1 },
      { criterion: "Joins BookCopy to Book on ISBN and filters available=1 for individual copies.", marks: 1 },
      { criterion: "Adds the exact title predicate and returns copyNo for part (c).", marks: 1 }
    ],
    hintSteps: ["The title is in Book; availability is in BookCopy.", "Use ISBN to connect those facts, then project the requested columns."],
    walkthroughSteps: ["Identify where each requested attribute lives.", "Translate selection into WHERE and projection into SELECT.", "Add the ISBN join for copy queries.", "Apply DISTINCT only where the requested output is a set of titles."],
    references: ["Exam 1, IMG_6541.jpg and IMG_6542.jpg, Question 1: adapted SQL variant", "Homework 1-1.pdf, PDF p. 2, Question 4", "Lecture 10 2026.pdf, PDF pp. 9-12"],
    tags: ["exam-2", "mysql", "joins", "distinct", "additional-practice"]
  }
];
