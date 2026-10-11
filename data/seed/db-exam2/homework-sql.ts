import type { Question } from "@/lib/types";

const soccerSchema = "Use MySQL 8.0 with ONLY_FULL_GROUP_BY enabled. The following schema and data are reconstructed from Homework 2 Part 1. Backtick the table name `Match`, which is a MySQL keyword.\n\n- Team(teamId PK, name UNIQUE NOT NULL, city NOT NULL, stadium NULL).\n- Player(playerId PK, fullName NOT NULL, teamId NULL FK -> Team.teamId, position NULL, birthYear NULL). A NULL teamId denotes a free agent.\n- Match(matchId PK, homeTeamId NOT NULL FK -> Team.teamId, awayTeamId NOT NULL FK -> Team.teamId, matchDate NOT NULL, stadium NULL, homeGoals NULL, awayGoals NULL).\n- Appearance(matchId FK -> Match.matchId, playerId FK -> Player.playerId, teamId FK -> Team.teamId, minutes NULL, goals NULL, assists NULL), with composite PK(matchId, playerId). All three foreign keys are NOT NULL.\n\nAppearance.teamId records the team represented in that particular game; Player.teamId is the player's current team. Match 8 is scheduled and has no appearance rows.";

const studentSchema = "Use MySQL 8.0 with ONLY_FULL_GROUP_BY enabled. Analyze the supplied query; give a precise diagnosis and a corrected or justified version.\n\n- Student(studentId INT PRIMARY KEY, name VARCHAR(80) NOT NULL, email VARCHAR(120) NULL).\n- Course(courseId CHAR(6) PRIMARY KEY, title VARCHAR(120) NOT NULL, dept CHAR(3) NOT NULL).\n- Enrollment(studentId FK -> Student.studentId, courseId FK -> Course.courseId, grade CHAR(2) NULL).\n\nEach (studentId, courseId) pair occurs at most once. No sample rows are supplied, so explain behavior from the schema and stated goal rather than inventing output records.";

const teamData = "**Team data**\n| teamId | name | city | stadium |\n| --- | --- | --- | --- |\n| 1 | Real Madrid | Madrid | Santiago Bernabéu |\n| 2 | FC Barcelona | Barcelona | Olympic Stadium |\n| 3 | Liverpool | Liverpool | Anfield |\n| 4 | Manchester City | Manchester | Etihad Stadium |\n| 5 | Paris Saint-Germain | Paris | Parc des Princes |\n| 6 | AC Milan | Milan | San Siro |";

const playerData = "**Player data**\n| playerId | fullName | teamId | position | birthYear |\n| --- | --- | --- | --- | --- |\n| 1 | Vinícius Júnior | 1 | FW | 2000 |\n| 2 | Jude Bellingham | 1 | MF | 2003 |\n| 3 | Robert Lewandowski | 2 | FW | 1988 |\n| 4 | Pedri | 2 | MF | 2002 |\n| 5 | Mohamed Salah | 3 | FW | 1992 |\n| 6 | Virgil van Dijk | 3 | DF | 1991 |\n| 7 | Erling Haaland | 4 | FW | 2000 |\n| 8 | Kevin De Bruyne | 4 | MF | 1991 |\n| 9 | Kylian Mbappé | 5 | FW | 1998 |\n| 10 | Marquinhos | 5 | DF | 1994 |\n| 11 | Alisson Becker | 3 | GK | 1992 |\n| 12 | Theo Hernández | 6 | DF | 1997 |\n| 13 | Paulo Souza | NULL | FW | 1999 |\n| 14 | İlkay Gündoğan | 2 | MF | 1990 |";

const matchData = "**Match data**\n| matchId | homeTeamId | awayTeamId | matchDate | stadium | homeGoals | awayGoals |\n| --- | --- | --- | --- | --- | --- | --- |\n| 1 | 1 | 2 | 2025-09-01 | Santiago Bernabéu | 2 | 1 |\n| 2 | 3 | 5 | 2025-09-05 | Anfield | 0 | 0 |\n| 3 | 2 | 4 | 2025-09-10 | Olympic Stadium | 2 | 3 |\n| 4 | 1 | 5 | 2025-09-15 | Santiago Bernabéu | 1 | 2 |\n| 5 | 4 | 3 | 2025-09-20 | Etihad Stadium | 1 | 1 |\n| 6 | 5 | 2 | 2025-09-25 | Parc des Princes | 2 | 0 |\n| 7 | 1 | 3 | 2025-10-02 | Santiago Bernabéu | 0 | 1 |\n| 8 | 4 | 5 | 2025-10-10 | Etihad Stadium | NULL | NULL |";

const appearanceData = "**Appearance data**\n| matchId | playerId | teamId | minutes | goals | assists |\n| --- | --- | --- | --- | --- | --- |\n| 1 | 1 | 1 | 90 | 1 | 0 |\n| 1 | 2 | 1 | 88 | 1 | 1 |\n| 1 | 3 | 2 | 90 | 1 | 0 |\n| 1 | 4 | 2 | 90 | 0 | 1 |\n| 2 | 5 | 3 | 90 | 0 | 0 |\n| 2 | 6 | 3 | 90 | 0 | 0 |\n| 2 | 9 | 5 | 90 | 0 | 0 |\n| 2 | 10 | 5 | 65 | 0 | NULL |\n| 3 | 3 | 2 | 90 | 1 | 0 |\n| 3 | 4 | 2 | 85 | 1 | 1 |\n| 3 | 7 | 4 | 90 | 2 | 0 |\n| 3 | 8 | 4 | 88 | 1 | 1 |\n| 4 | 1 | 1 | 90 | 0 | 1 |\n| 4 | 2 | 1 | 90 | 1 | 0 |\n| 4 | 9 | 5 | 90 | 1 | 0 |\n| 4 | 10 | 5 | 90 | 1 | 0 |\n| 5 | 7 | 4 | 90 | 1 | 0 |\n| 5 | 8 | 4 | 80 | 0 | 1 |\n| 5 | 5 | 3 | 90 | 1 | 0 |\n| 5 | 6 | 3 | 90 | 0 | 0 |\n| 6 | 9 | 5 | 90 | 1 | 1 |\n| 6 | 10 | 5 | 90 | 1 | 0 |\n| 6 | 3 | 2 | 90 | 0 | 0 |\n| 6 | 4 | 2 | 78 | 0 | NULL |\n| 7 | 1 | 1 | 90 | 0 | 0 |\n| 7 | 2 | 1 | 75 | 0 | NULL |\n| 7 | 5 | 3 | 90 | 1 | 0 |\n| 7 | 6 | 3 | 90 | 0 | 0 |";

export const homeworkSqlQuestions: Question[] = [
  {
    "id": "db-e2-hw-soccer-01",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + teamData + "\n\n" + "Homework 2, Question 1.1: List all teams as (teamId, name, city, stadium), ordered by city and then name. State the resulting teamId order.",
    "sampleAnswer": "```sql\nSELECT teamId, name, city, stadium\nFROM Team\nORDER BY city ASC, name ASC;\n```\n\nThe teamId order is **2, 3, 1, 4, 6, 5**: Barcelona, Liverpool, Madrid, Manchester, Milan, Paris.\n\nORDER BY keys are applied left to right. A tie on city is resolved by name; ASC is the default but is shown explicitly.",
    "solutionMd": "```sql\nSELECT teamId, name, city, stadium\nFROM Team\nORDER BY city ASC, name ASC;\n```\n\nThe teamId order is **2, 3, 1, 4, 6, 5**: Barcelona, Liverpool, Madrid, Manchester, Milan, Paris.",
    "explanation": "ORDER BY keys are applied left to right. A tie on city is resolved by name; ASC is the default but is shown explicitly.",
    "hintSteps": [
      "Select the four requested columns, not just the names.",
      "The city is the primary sort key; name breaks city ties."
    ],
    "walkthroughSteps": [
      "Read the requested output columns directly from Team.",
      "Sort cities ascending, then names within any equal city.",
      "Check the six IDs in order: 2, 3, 1, 4, 6, 5."
    ],
    "rubric": [
      {
        "criterion": "Selects teamId, name, city, stadium from Team.",
        "marks": 2
      },
      {
        "criterion": "Orders by city before name, both ascending.",
        "marks": 2
      },
      {
        "criterion": "Gives teamId order 2, 3, 1, 4, 6, 5.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 4"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-ordering"
    ]
  },
  {
    "id": "db-e2-hw-soccer-02",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + teamData + "\n\n" + "Homework 2, Question 1.2: List teams whose stadium contains the substring 'Park'. State whether any supplied team matches.",
    "sampleAnswer": "```sql\nSELECT teamId, name, city, stadium\nFROM Team\nWHERE stadium LIKE '%Park%';\n```\n\n**No rows match.** Parc des Princes contains \"Parc\", not \"Park\".\n\nThe two percent wildcards allow the substring anywhere in a value. The supplied data intentionally yields an empty result; do not silently change Park to Parc.",
    "solutionMd": "```sql\nSELECT teamId, name, city, stadium\nFROM Team\nWHERE stadium LIKE '%Park%';\n```\n\n**No rows match.** Parc des Princes contains \"Parc\", not \"Park\".",
    "explanation": "The two percent wildcards allow the substring anywhere in a value. The supplied data intentionally yields an empty result; do not silently change Park to Parc.",
    "hintSteps": [
      "Use a substring pattern with a wildcard on both sides.",
      "Compare the spelling of the PSG stadium to the literal requested substring."
    ],
    "walkthroughSteps": [
      "Build the pattern %Park%.",
      "Apply it to stadium, not Team.name or city.",
      "Inspect all six stadium values and conclude that none contains Park."
    ],
    "rubric": [
      {
        "criterion": "Uses LIKE '%Park%' on stadium.",
        "marks": 2
      },
      {
        "criterion": "Returns teams rather than players or matches.",
        "marks": 2
      },
      {
        "criterion": "Correctly identifies an empty result without changing Park to Parc.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 4"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-like"
    ]
  },
  {
    "id": "db-e2-hw-soccer-03",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + playerData + "\n\n" + "Homework 2, Question 1.3: List players whose teamId is NULL, ordered by fullName. Identify the supplied free agent.",
    "sampleAnswer": "```sql\nSELECT playerId, fullName, teamId, position, birthYear\nFROM Player\nWHERE teamId IS NULL\nORDER BY fullName ASC;\n```\n\nOnly **playerId 13, Paulo Souza**, matches.\n\nIS NULL tests for a missing team association. teamId = NULL evaluates to UNKNOWN rather than selecting free agents.",
    "solutionMd": "```sql\nSELECT playerId, fullName, teamId, position, birthYear\nFROM Player\nWHERE teamId IS NULL\nORDER BY fullName ASC;\n```\n\nOnly **playerId 13, Paulo Souza**, matches.",
    "explanation": "IS NULL tests for a missing team association. teamId = NULL evaluates to UNKNOWN rather than selecting free agents.",
    "hintSteps": [
      "A missing value requires IS NULL rather than equality.",
      "Sort the matching rows by fullName."
    ],
    "walkthroughSteps": [
      "Filter Player using teamId IS NULL.",
      "Return player details and order by fullName.",
      "Find the one free agent, player 13."
    ],
    "rubric": [
      {
        "criterion": "Uses teamId IS NULL.",
        "marks": 2
      },
      {
        "criterion": "Returns player information and orders by fullName.",
        "marks": 2
      },
      {
        "criterion": "Identifies only playerId 13.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 4"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-null"
    ]
  },
  {
    "id": "db-e2-hw-soccer-04",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + matchData + "\n\n" + "Homework 2, Question 1.4: List matches whose two recorded scores are equal, including both actual draws and the scheduled match with both scores NULL. Give the matching matchIds.",
    "sampleAnswer": "```sql\nSELECT matchId, homeTeamId, awayTeamId, matchDate,\n       stadium, homeGoals, awayGoals\nFROM `Match`\nWHERE homeGoals <=> awayGoals\nORDER BY matchId;\n```\n\nExpected matchIds: **2, 5, 8**. Match 8 is scheduled, not an actual played draw. A portable equivalent condition is `homeGoals = awayGoals OR (homeGoals IS NULL AND awayGoals IS NULL)`.\n\nMySQL <=> is NULL-safe equality: two NULL operands compare true. Ordinary = includes the two actual draws but excludes the two-NULL scheduled row.",
    "solutionMd": "```sql\nSELECT matchId, homeTeamId, awayTeamId, matchDate,\n       stadium, homeGoals, awayGoals\nFROM `Match`\nWHERE homeGoals <=> awayGoals\nORDER BY matchId;\n```\n\nExpected matchIds: **2, 5, 8**. Match 8 is scheduled, not an actual played draw. A portable equivalent condition is `homeGoals = awayGoals OR (homeGoals IS NULL AND awayGoals IS NULL)`.",
    "explanation": "MySQL <=> is NULL-safe equality: two NULL operands compare true. Ordinary = includes the two actual draws but excludes the two-NULL scheduled row.",
    "hintSteps": [
      "Ordinary equality cannot make NULL = NULL true.",
      "Use MySQL NULL-safe equality, or explicitly include the two-NULL case."
    ],
    "walkthroughSteps": [
      "Match 2 has 0-0 and match 5 has 1-1.",
      "Match 8 has two NULL scores and must be included by the stated requirement.",
      "Apply <=> and return matchIds 2, 5, 8 in the shown order."
    ],
    "rubric": [
      {
        "criterion": "Uses <=> or equality plus an explicit both-NULL condition.",
        "marks": 2
      },
      {
        "criterion": "Includes 2, 5, 8 and excludes unequal scores.",
        "marks": 2
      },
      {
        "criterion": "Distinguishes a scheduled row from a completed draw and quotes Match safely.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 4"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-null"
    ]
  },
  {
    "id": "db-e2-hw-soccer-05",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + playerData + "\n\n" + appearanceData + "\n\n" + "Homework 2, Question 1.5: For every player with at least one appearance, return (playerId, fullName, totalGoals) using SUM(goals). Order by totalGoals descending, then fullName. Do not exclude players with zero goals.",
    "sampleAnswer": "```sql\nSELECT p.playerId, p.fullName, SUM(a.goals) AS totalGoals\nFROM Player AS p\nJOIN Appearance AS a ON a.playerId = p.playerId\nGROUP BY p.playerId, p.fullName\nORDER BY totalGoals DESC, p.fullName ASC;\n```\n\nIn output order, (playerId, totalGoals) is **(7,3), (2,2), (9,2), (10,2), (5,2), (3,2), (8,1), (4,1), (1,1), (6,0)**. All ten players with appearances are included.\n\nThe inner join limits the result to players who appeared; grouping creates one total per player. SUM ignores NULL inputs and yields NULL for an all-NULL group in general. The supplied Appearance.goals values are all non-NULL, so no COALESCE is needed for these totals.",
    "solutionMd": "```sql\nSELECT p.playerId, p.fullName, SUM(a.goals) AS totalGoals\nFROM Player AS p\nJOIN Appearance AS a ON a.playerId = p.playerId\nGROUP BY p.playerId, p.fullName\nORDER BY totalGoals DESC, p.fullName ASC;\n```\n\nIn output order, (playerId, totalGoals) is **(7,3), (2,2), (9,2), (10,2), (5,2), (3,2), (8,1), (4,1), (1,1), (6,0)**. All ten players with appearances are included.",
    "explanation": "The inner join limits the result to players who appeared; grouping creates one total per player. SUM ignores NULL inputs and yields NULL for an all-NULL group in general. The supplied Appearance.goals values are all non-NULL, so no COALESCE is needed for these totals.",
    "hintSteps": [
      "Join on playerId before grouping.",
      "Having scored zero is different from having no appearances."
    ],
    "walkthroughSteps": [
      "Join each appearance to its Player row.",
      "Group by the player key and name, summing goals rather than counting rows.",
      "Keep zero-goal groups and apply the two requested sort keys."
    ],
    "rubric": [
      {
        "criterion": "Joins Player and Appearance on playerId with inner-join scope.",
        "marks": 2
      },
      {
        "criterion": "Computes SUM(a.goals) per player and keeps zero scorers.",
        "marks": 2
      },
      {
        "criterion": "Orders by totalGoals DESC, fullName ASC with the stated totals.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 4"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-aggregation"
    ]
  },
  {
    "id": "db-e2-hw-soccer-06",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + playerData + "\n\n" + appearanceData + "\n\n" + "Homework 2, Question 1.6: Return players with at least two appearances as (playerId, fullName, appearancesCount). Give the count for each matching playerId.",
    "sampleAnswer": "```sql\nSELECT p.playerId, p.fullName, COUNT(*) AS appearancesCount\nFROM Player AS p\nJOIN Appearance AS a ON a.playerId = p.playerId\nGROUP BY p.playerId, p.fullName\nHAVING COUNT(*) >= 2\nORDER BY p.playerId;\n```\n\nPlayers **1-6, 9, 10** have **3** appearances each; players **7 and 8** have **2** each. Ten players qualify.\n\nEach Appearance row counts as participation, even when goals or assists are zero/NULL. COUNT(goals) would count non-NULL goal values, not necessarily appearances; HAVING filters groups after counting.",
    "solutionMd": "```sql\nSELECT p.playerId, p.fullName, COUNT(*) AS appearancesCount\nFROM Player AS p\nJOIN Appearance AS a ON a.playerId = p.playerId\nGROUP BY p.playerId, p.fullName\nHAVING COUNT(*) >= 2\nORDER BY p.playerId;\n```\n\nPlayers **1-6, 9, 10** have **3** appearances each; players **7 and 8** have **2** each. Ten players qualify.",
    "explanation": "Each Appearance row counts as participation, even when goals or assists are zero/NULL. COUNT(goals) would count non-NULL goal values, not necessarily appearances; HAVING filters groups after counting.",
    "hintSteps": [
      "Count rows of Appearance, not the number of goals scored.",
      "The minimum-count condition belongs after grouping."
    ],
    "walkthroughSteps": [
      "Join Player to its appearance rows.",
      "Group by player and compute COUNT(*).",
      "Retain counts at least two using HAVING; verify eight counts of three and two counts of two."
    ],
    "rubric": [
      {
        "criterion": "Counts appearance rows per player.",
        "marks": 2
      },
      {
        "criterion": "Uses GROUP BY and HAVING for the at-least-two condition.",
        "marks": 2
      },
      {
        "criterion": "Returns the ten qualifying players with correct counts.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 4"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-aggregation"
    ]
  },
  {
    "id": "db-e2-hw-soccer-07",
    "type": "free",
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + teamData + "\n\n" + playerData + "\n\n" + matchData + "\n\n" + appearanceData + "\n\n" + "Homework 2, Question 1.7: For matches on or after '2025-09-10', return (matchDate, fullName, Team.name, minutes, goals), ordered by matchDate and fullName. Use the team represented in that particular match, and state the result's row count.",
    "sampleAnswer": "```sql\nSELECT m.matchDate, p.fullName, t.name, a.minutes, a.goals\nFROM `Match` AS m\nJOIN Appearance AS a ON a.matchId = m.matchId\nJOIN Player AS p ON p.playerId = a.playerId\nJOIN Team AS t ON t.teamId = a.teamId\nWHERE m.matchDate >= '2025-09-10'\nORDER BY m.matchDate ASC, p.fullName ASC;\n```\n\n**20 rows:** four appearances each for matches 3, 4, 5, 6, 7. Match 8 passes the date filter but contributes no rows because it has no appearances. Team is joined through `a.teamId`, not the potentially changed current `p.teamId`.\n\nThis is a four-table relationship traversal. Appearance links the specific match, player, and represented team. The inner joins intentionally return recorded participation, not one placeholder row per scheduled match.",
    "solutionMd": "```sql\nSELECT m.matchDate, p.fullName, t.name, a.minutes, a.goals\nFROM `Match` AS m\nJOIN Appearance AS a ON a.matchId = m.matchId\nJOIN Player AS p ON p.playerId = a.playerId\nJOIN Team AS t ON t.teamId = a.teamId\nWHERE m.matchDate >= '2025-09-10'\nORDER BY m.matchDate ASC, p.fullName ASC;\n```\n\n**20 rows:** four appearances each for matches 3, 4, 5, 6, 7. Match 8 passes the date filter but contributes no rows because it has no appearances. Team is joined through `a.teamId`, not the potentially changed current `p.teamId`.",
    "explanation": "This is a four-table relationship traversal. Appearance links the specific match, player, and represented team. The inner joins intentionally return recorded participation, not one placeholder row per scheduled match.",
    "hintSteps": [
      "Follow the Match -> Appearance -> Player relationships.",
      "Appearance.teamId tells you which team the player represented at that game."
    ],
    "walkthroughSteps": [
      "Join matches to appearances using matchId and appearances to players using playerId.",
      "Join the represented team using a.teamId and apply the inclusive date boundary.",
      "Sort by date/name and count the five qualifying games with four appearances each."
    ],
    "rubric": [
      {
        "criterion": "Correctly joins all four tables and uses Appearance.teamId for Team.",
        "marks": 2
      },
      {
        "criterion": "Uses the inclusive date filter and required output/sort columns.",
        "marks": 2
      },
      {
        "criterion": "Explains 20 rows and why scheduled match 8 is absent.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 5"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-joins"
    ]
  },
  {
    "id": "db-e2-hw-soccer-08",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": soccerSchema + "\n\n" + playerData + "\n\n" + appearanceData + "\n\n" + "Homework 2, Question 1.8: List players who have never appeared. Return (playerId, fullName, teamId), ordered by playerId. Identify every qualifying playerId.",
    "sampleAnswer": "```sql\nSELECT p.playerId, p.fullName, p.teamId\nFROM Player AS p\nLEFT JOIN Appearance AS a ON a.playerId = p.playerId\nWHERE a.playerId IS NULL\nORDER BY p.playerId;\n```\n\nExpected playerIds: **11, 12, 13, 14**. `NOT EXISTS (SELECT 1 FROM Appearance a WHERE a.playerId = p.playerId)` is an equally valid anti-join.\n\nA left join preserves players without a matching Appearance. Checking the nonnullable joined key for NULL identifies the null-extended unmatched rows. Checking a.goals IS NULL would instead confuse missing participation with missing goal data.",
    "solutionMd": "```sql\nSELECT p.playerId, p.fullName, p.teamId\nFROM Player AS p\nLEFT JOIN Appearance AS a ON a.playerId = p.playerId\nWHERE a.playerId IS NULL\nORDER BY p.playerId;\n```\n\nExpected playerIds: **11, 12, 13, 14**. `NOT EXISTS (SELECT 1 FROM Appearance a WHERE a.playerId = p.playerId)` is an equally valid anti-join.",
    "explanation": "A left join preserves players without a matching Appearance. Checking the nonnullable joined key for NULL identifies the null-extended unmatched rows. Checking a.goals IS NULL would instead confuse missing participation with missing goal data.",
    "hintSteps": [
      "Preserve all Player rows before testing for missing matches.",
      "Test a nonnullable Appearance key, not a nullable statistic."
    ],
    "walkthroughSteps": [
      "Left join each Player to Appearance on playerId.",
      "Keep rows where the joined playerId is NULL, indicating no match.",
      "Return and sort playerIds 11, 12, 13, 14."
    ],
    "rubric": [
      {
        "criterion": "Uses a correct LEFT JOIN anti-join or correlated NOT EXISTS.",
        "marks": 2
      },
      {
        "criterion": "Tests absence using the relationship key rather than nullable statistics.",
        "marks": 2
      },
      {
        "criterion": "Returns the requested columns ordered by playerId with IDs 11-14.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 5"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-anti-join"
    ]
  },
  {
    "id": "db-e2-hw-repair-a",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(a). Goal: Count enrollments per course, showing courseId, title, and count. Repair the original inner-join version and explain whether courses with no enrollments appear.\n\n```sql\nSELECT c.courseId, c.title, COUNT(*) AS enrollments\nFROM Course c\nJOIN Enrollment e USING (courseId);\n```",
    "sampleAnswer": "```sql\nSELECT c.courseId, c.title, COUNT(*) AS enrollments\nFROM Course AS c\nJOIN Enrollment AS e ON e.courseId = c.courseId\nGROUP BY c.courseId, c.title;\n```\n\nThe missing GROUP BY causes an aggregate/nonaggregate error under the specified SQL mode. This fix preserves the original inner-join scope: only courses with enrollments appear. If all courses are wanted, use `LEFT JOIN` and `COUNT(e.courseId)` so an unmatched course gets 0.\n\nGrouping by course creates one count per course. MySQL can also permit grouping only by a primary key when it detects the selected title is functionally dependent; grouping by both key and title is explicit and portable.",
    "solutionMd": "```sql\nSELECT c.courseId, c.title, COUNT(*) AS enrollments\nFROM Course AS c\nJOIN Enrollment AS e ON e.courseId = c.courseId\nGROUP BY c.courseId, c.title;\n```\n\nThe missing GROUP BY causes an aggregate/nonaggregate error under the specified SQL mode. This fix preserves the original inner-join scope: only courses with enrollments appear. If all courses are wanted, use `LEFT JOIN` and `COUNT(e.courseId)` so an unmatched course gets 0.",
    "explanation": "Grouping by course creates one count per course. MySQL can also permit grouping only by a primary key when it detects the selected title is functionally dependent; grouping by both key and title is explicit and portable.",
    "hintSteps": [
      "The selected course attributes accompany an aggregate.",
      "Separate fixing the grouping from expanding the result to include empty courses."
    ],
    "walkthroughSteps": [
      "Diagnose the absent grouping under ONLY_FULL_GROUP_BY.",
      "Group the inner-join rows by courseId/title.",
      "State that zero-enrollment courses require LEFT JOIN and a count of a nonnullable joined key."
    ],
    "rubric": [
      {
        "criterion": "Diagnoses missing grouping rather than claiming COUNT(*) is always invalid.",
        "marks": 2
      },
      {
        "criterion": "Provides valid per-course grouped SQL.",
        "marks": 2
      },
      {
        "criterion": "States the original inner-join scope and a correct optional zero-count variant.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 5"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-aggregation"
    ]
  },
  {
    "id": "db-e2-hw-repair-b",
    "type": "free",
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(b). Goal: List enrollment rows whose grade does not appear anywhere in this same Enrollment table. Explain whether the goal can produce any rows as written; do not invent a different intended goal.\n\n```sql\nSELECT *\nFROM Enrollment e\nWHERE e.grade NOT IN (SELECT grade FROM Enrollment);\n```",
    "sampleAnswer": "```sql\nSELECT e.studentId, e.courseId, e.grade\nFROM Enrollment AS e\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM Enrollment AS other\n    WHERE other.grade <=> e.grade\n);\n```\n\n**No rows can satisfy this goal.** Every row already contains its own grade in the same table. The shown NULL-safe NOT EXISTS formulation faithfully states the impossible goal and still returns no rows. A different target table or an explicit exclusion of the current row would be a changed goal, not a correction of this wording.\n\nThe original returns no rows: a non-NULL grade matches itself, and a NULL grade produces UNKNOWN under NOT IN. A NULL inside a NOT IN subquery is also a general three-valued-logic trap. Merely filtering out subquery NULLs does not remove self-membership or make this goal meaningful.",
    "solutionMd": "```sql\nSELECT e.studentId, e.courseId, e.grade\nFROM Enrollment AS e\nWHERE NOT EXISTS (\n    SELECT 1\n    FROM Enrollment AS other\n    WHERE other.grade <=> e.grade\n);\n```\n\n**No rows can satisfy this goal.** Every row already contains its own grade in the same table. The shown NULL-safe NOT EXISTS formulation faithfully states the impossible goal and still returns no rows. A different target table or an explicit exclusion of the current row would be a changed goal, not a correction of this wording.",
    "explanation": "The original returns no rows: a non-NULL grade matches itself, and a NULL grade produces UNKNOWN under NOT IN. A NULL inside a NOT IN subquery is also a general three-valued-logic trap. Merely filtering out subquery NULLs does not remove self-membership or make this goal meaningful.",
    "hintSteps": [
      "A candidate row is also a row in the subquery table.",
      "For a NULL candidate, distinguish ordinary equality from MySQL NULL-safe equality."
    ],
    "walkthroughSteps": [
      "Show that every non-NULL candidate grade appears in its own row.",
      "Explain why NULL candidates do not pass the original predicate either.",
      "Use NULL-safe NOT EXISTS to express the unchanged goal and conclude the result is empty."
    ],
    "rubric": [
      {
        "criterion": "Recognizes self-membership makes the literal goal impossible.",
        "marks": 2
      },
      {
        "criterion": "Explains NULL/NOT IN behavior without claiming NULL removal solves self-membership.",
        "marks": 2
      },
      {
        "criterion": "Gives a faithful empty-result formulation and does not substitute a new goal.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 6"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-null"
    ]
  },
  {
    "id": "db-e2-hw-repair-c",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(c). Goal: Show the number of enrollments per student, highest first. Preserve the original scope of students appearing in Enrollment.\n\n```sql\nSELECT e.studentId, COUNT(*) AS n\nORDER BY n DESC\nFROM Enrollment e;\n```",
    "sampleAnswer": "```sql\nSELECT e.studentId, COUNT(*) AS n\nFROM Enrollment AS e\nGROUP BY e.studentId\nORDER BY n DESC, e.studentId ASC;\n```\n\nFROM must precede ORDER BY, and a per-student count requires GROUP BY. The added secondary order makes equal-count output deterministic without changing the requested highest-first ranking.\n\nSQL clause order is SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY. Enrollment contains only enrolled students, so this form does not introduce zero-count students.",
    "solutionMd": "```sql\nSELECT e.studentId, COUNT(*) AS n\nFROM Enrollment AS e\nGROUP BY e.studentId\nORDER BY n DESC, e.studentId ASC;\n```\n\nFROM must precede ORDER BY, and a per-student count requires GROUP BY. The added secondary order makes equal-count output deterministic without changing the requested highest-first ranking.",
    "explanation": "SQL clause order is SELECT, FROM, WHERE, GROUP BY, HAVING, ORDER BY. Enrollment contains only enrolled students, so this form does not introduce zero-count students.",
    "hintSteps": [
      "Check both clause order and aggregation granularity.",
      "A secondary key can make ties deterministic."
    ],
    "walkthroughSteps": [
      "Move FROM before ORDER BY.",
      "Group by studentId to produce one count per student.",
      "Sort the aggregate alias n descending, optionally breaking ties by ID."
    ],
    "rubric": [
      {
        "criterion": "Diagnoses the misplaced ORDER BY and missing GROUP BY.",
        "marks": 2
      },
      {
        "criterion": "Computes a count per enrolled student.",
        "marks": 2
      },
      {
        "criterion": "Orders counts descending with valid clause order.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 6"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-ordering"
    ]
  },
  {
    "id": "db-e2-hw-repair-d",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(d). Goal: Find students whose email contains a literal underscore character _.\n\n```sql\nSELECT studentId, email\nFROM Student\nWHERE email LIKE '%_%';\n```",
    "sampleAnswer": "```sql\nSELECT studentId, email\nFROM Student\nWHERE email LIKE '%!_%' ESCAPE '!';\n```\n\nThe unescaped underscore matches any single character in LIKE. An explicit escape character makes `!_` a literal underscore; percent still permits surrounding characters. NULL emails do not match.\n\nUsing an explicit non-backslash escape avoids dependence on MySQL string-literal backslash settings. Other correctly escaped literal-underscore patterns are acceptable.",
    "solutionMd": "```sql\nSELECT studentId, email\nFROM Student\nWHERE email LIKE '%!_%' ESCAPE '!';\n```\n\nThe unescaped underscore matches any single character in LIKE. An explicit escape character makes `!_` a literal underscore; percent still permits surrounding characters. NULL emails do not match.",
    "explanation": "Using an explicit non-backslash escape avoids dependence on MySQL string-literal backslash settings. Other correctly escaped literal-underscore patterns are acceptable.",
    "hintSteps": [
      "The underscore is a wildcard in LIKE, not an ordinary literal.",
      "Choose and declare an escape character explicitly."
    ],
    "walkthroughSteps": [
      "Identify _ as a one-character wildcard.",
      "Declare ESCAPE and prefix the underscore with that character.",
      "Keep percent wildcards around the literal underscore to find it anywhere."
    ],
    "rubric": [
      {
        "criterion": "Explains why the original matches more than literal underscores.",
        "marks": 2
      },
      {
        "criterion": "Uses a valid explicit literal-underscore pattern.",
        "marks": 2
      },
      {
        "criterion": "Retains the requested studentId/email projection.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 6"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-like"
    ]
  },
  {
    "id": "db-e2-hw-repair-e",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(e). Goal: Show student names with the titles of courses in which they are enrolled.\n\n```sql\nSELECT s.name, c.title\nFROM Student s\nJOIN Course c ON s.studentId = c.courseId;\n```",
    "sampleAnswer": "```sql\nSELECT s.name, c.title\nFROM Student AS s\nJOIN Enrollment AS e ON e.studentId = s.studentId\nJOIN Course AS c ON c.courseId = e.courseId;\n```\n\nStudent and Course IDs identify different entity types. Enrollment is the relationship connecting them, so both foreign-key links are needed. Matching unrelated ID values is logically wrong even if MySQL can compare/coerce their types.\n\nThe three-table join produces one row per qualifying enrollment, not one row per distinct student name. DISTINCT is not required by the stated goal.",
    "solutionMd": "```sql\nSELECT s.name, c.title\nFROM Student AS s\nJOIN Enrollment AS e ON e.studentId = s.studentId\nJOIN Course AS c ON c.courseId = e.courseId;\n```\n\nStudent and Course IDs identify different entity types. Enrollment is the relationship connecting them, so both foreign-key links are needed. Matching unrelated ID values is logically wrong even if MySQL can compare/coerce their types.",
    "explanation": "The three-table join produces one row per qualifying enrollment, not one row per distinct student name. DISTINCT is not required by the stated goal.",
    "hintSteps": [
      "Find the relation that stores the student-course association.",
      "Use one join condition for each relationship edge."
    ],
    "walkthroughSteps": [
      "Reject the direct Student.studentId = Course.courseId connection.",
      "Join Student to Enrollment on studentId.",
      "Join Enrollment to Course on courseId and select name/title."
    ],
    "rubric": [
      {
        "criterion": "Diagnoses the missing Enrollment relationship.",
        "marks": 2
      },
      {
        "criterion": "Correctly joins both foreign-key edges.",
        "marks": 2
      },
      {
        "criterion": "Returns student names and enrolled course titles without unrelated ID matching.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 6"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-joins"
    ]
  },
  {
    "id": "db-e2-hw-repair-f",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(f). Goal: Return courses with at least two enrollments, with their counts.\n\n```sql\nSELECT e.courseId, COUNT(*) AS num\nFROM Enrollment e\nWHERE num >= 2\nGROUP BY e.courseId;\n```",
    "sampleAnswer": "```sql\nSELECT e.courseId, COUNT(*) AS num\nFROM Enrollment AS e\nGROUP BY e.courseId\nHAVING COUNT(*) >= 2;\n```\n\nWHERE filters input rows before grouping and cannot reference the SELECT aggregate alias num here. HAVING filters completed groups. MySQL also permits `HAVING num >= 2`.\n\nThe condition is on the number of rows in each course group, so changing WHERE to HAVING at the correct clause position fixes both timing and alias visibility.",
    "solutionMd": "```sql\nSELECT e.courseId, COUNT(*) AS num\nFROM Enrollment AS e\nGROUP BY e.courseId\nHAVING COUNT(*) >= 2;\n```\n\nWHERE filters input rows before grouping and cannot reference the SELECT aggregate alias num here. HAVING filters completed groups. MySQL also permits `HAVING num >= 2`.",
    "explanation": "The condition is on the number of rows in each course group, so changing WHERE to HAVING at the correct clause position fixes both timing and alias visibility.",
    "hintSteps": [
      "The predicate concerns a group count, not a property of one input row.",
      "HAVING follows GROUP BY."
    ],
    "walkthroughSteps": [
      "Recognize that num does not exist at the WHERE stage.",
      "Group enrollment rows by courseId.",
      "Apply the at-least-two condition with HAVING."
    ],
    "rubric": [
      {
        "criterion": "Diagnoses aggregate filtering/alias use in WHERE.",
        "marks": 2
      },
      {
        "criterion": "Groups by courseId and counts enrollments.",
        "marks": 2
      },
      {
        "criterion": "Uses a valid HAVING condition of at least two.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 6"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-aggregation"
    ]
  },
  {
    "id": "db-e2-hw-repair-g",
    "type": "free",
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(g). Goal: List enrollment rows whose letter grade is 'A'. Assess the original under MySQL 8.0 before deciding whether it is invalid.\n\n```sql\nSELECT studentId, courseId, grade\nFROM Enrollment\nHAVING grade = 'A';\n```",
    "sampleAnswer": "```sql\nSELECT studentId, courseId, grade\nFROM Enrollment\nWHERE grade = 'A';\n```\n\n**The original can be legal and work in MySQL.** Its HAVING predicate refers to a selected column and there is no aggregation. WHERE is the clearer row-filtering formulation. Do not diagnose an unconditional syntax error merely because GROUP BY is absent.\n\nThis item is labeled broken in the assignment, but MySQL extends HAVING beyond grouped aggregate use. The model answer changes it to the conventional row filter while accurately describing the dialect behavior.",
    "solutionMd": "```sql\nSELECT studentId, courseId, grade\nFROM Enrollment\nWHERE grade = 'A';\n```\n\n**The original can be legal and work in MySQL.** Its HAVING predicate refers to a selected column and there is no aggregation. WHERE is the clearer row-filtering formulation. Do not diagnose an unconditional syntax error merely because GROUP BY is absent.",
    "explanation": "This item is labeled broken in the assignment, but MySQL extends HAVING beyond grouped aggregate use. The model answer changes it to the conventional row filter while accurately describing the dialect behavior.",
    "hintSteps": [
      "Do not apply a blanket rule that HAVING always requires GROUP BY.",
      "This predicate tests each row, so the conventional clause is WHERE."
    ],
    "walkthroughSteps": [
      "Check the specified MySQL dialect and the absence of aggregation.",
      "Recognize that the selected grade column can be filtered by this HAVING expression.",
      "Provide the clearer WHERE version without inventing a syntax failure."
    ],
    "rubric": [
      {
        "criterion": "Explicitly notes the original may be legal in MySQL.",
        "marks": 2
      },
      {
        "criterion": "Explains WHERE is the appropriate conventional row-filtering clause.",
        "marks": 2
      },
      {
        "criterion": "Provides equivalent grade-A SQL with the requested columns.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 7"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-dialect"
    ]
  },
  {
    "id": "db-e2-hw-repair-h",
    "type": "free",
    "difficulty": "easy",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(h). Goal: List enrollments with no recorded grade.\n\n```sql\nSELECT *\nFROM Enrollment\nWHERE grade = NULL;\n```",
    "sampleAnswer": "```sql\nSELECT *\nFROM Enrollment\nWHERE grade IS NULL;\n```\n\nOrdinary comparison with NULL evaluates to UNKNOWN. WHERE keeps only TRUE, so `grade = NULL` does not find ungraded rows. IS NULL is the required missing-value test.\n\nMissing grades are not the same as an empty string, a space, or a literal text value \"NULL\".",
    "solutionMd": "```sql\nSELECT *\nFROM Enrollment\nWHERE grade IS NULL;\n```\n\nOrdinary comparison with NULL evaluates to UNKNOWN. WHERE keeps only TRUE, so `grade = NULL` does not find ungraded rows. IS NULL is the required missing-value test.",
    "explanation": "Missing grades are not the same as an empty string, a space, or a literal text value \"NULL\".",
    "hintSteps": [
      "NULL is not tested with ordinary equality.",
      "Use the predicate specifically designed to test missing values."
    ],
    "walkthroughSteps": [
      "Evaluate grade = NULL as UNKNOWN for each candidate row.",
      "Observe that WHERE rejects UNKNOWN.",
      "Replace the comparison with grade IS NULL."
    ],
    "rubric": [
      {
        "criterion": "Explains three-valued comparison behavior.",
        "marks": 2
      },
      {
        "criterion": "Uses IS NULL rather than a text/empty-string comparison.",
        "marks": 2
      },
      {
        "criterion": "Returns the enrollment rows with no grade.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 7"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-null"
    ]
  },
  {
    "id": "db-e2-hw-repair-i",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(i). Goal: List students with at least two enrollments.\n\n```sql\nSELECT s.studentId, s.name\nFROM Student s\nJOIN (SELECT studentId, COUNT(*) AS n\n      FROM Enrollment GROUP BY studentId)\nON s.studentId = t.studentId\nWHERE t.n >= 2;\n```",
    "sampleAnswer": "```sql\nSELECT s.studentId, s.name\nFROM Student AS s\nJOIN (\n    SELECT studentId, COUNT(*) AS n\n    FROM Enrollment\n    GROUP BY studentId\n) AS t ON t.studentId = s.studentId\nWHERE t.n >= 2;\n```\n\nThe derived table lacks the required alias t, yet the outer query uses t.studentId and t.n. Add AS t. The outer WHERE can filter t.n because it is already a column of the derived result.\n\nUnlike filtering a newly computed aggregate in its own SELECT, filtering the already formed derived-table column in the outer WHERE is valid. Moving that outer filter to HAVING is unnecessary.",
    "solutionMd": "```sql\nSELECT s.studentId, s.name\nFROM Student AS s\nJOIN (\n    SELECT studentId, COUNT(*) AS n\n    FROM Enrollment\n    GROUP BY studentId\n) AS t ON t.studentId = s.studentId\nWHERE t.n >= 2;\n```\n\nThe derived table lacks the required alias t, yet the outer query uses t.studentId and t.n. Add AS t. The outer WHERE can filter t.n because it is already a column of the derived result.",
    "explanation": "Unlike filtering a newly computed aggregate in its own SELECT, filtering the already formed derived-table column in the outer WHERE is valid. Moving that outer filter to HAVING is unnecessary.",
    "hintSteps": [
      "The outer query refers to a table alias that has never been declared.",
      "The inner aggregate result is a normal input relation to the outer query."
    ],
    "walkthroughSteps": [
      "Find the undefined alias t and the unnamed derived table.",
      "Name the derived table AS t.",
      "Join by studentId and filter its computed count in the outer WHERE."
    ],
    "rubric": [
      {
        "criterion": "Diagnoses the missing derived-table alias.",
        "marks": 2
      },
      {
        "criterion": "Declares t and joins it correctly on studentId.",
        "marks": 2
      },
      {
        "criterion": "Correctly retains the outer WHERE t.n >= 2 and explains its validity.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 7"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-subqueries"
    ]
  },
  {
    "id": "db-e2-hw-repair-j",
    "type": "free",
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 6,
    "prompt": studentSchema + "\n\n" + "Homework 2, Question 2(j). Goal: List every student ID/name with titles of enrolled courses, retaining students with no enrollments and a NULL title.\n\n```sql\nSELECT s.studentId, s.name, c.title\nFROM Student s\nRIGHT JOIN Enrollment e ON s.studentId = e.studentId\nLEFT JOIN Course c ON e.courseId = c.courseId;\n```",
    "sampleAnswer": "```sql\nSELECT s.studentId, s.name, c.title\nFROM Student AS s\nLEFT JOIN Enrollment AS e ON e.studentId = s.studentId\nLEFT JOIN Course AS c ON c.courseId = e.courseId;\n```\n\nThe original RIGHT JOIN preserves Enrollment, not all Student rows. Starting from Student and using LEFT JOIN on both relationship edges retains unenrolled students. Their enrollment and course attributes are NULL.\n\nThe second join must not turn an unmatched Student row into an inner-join requirement. A valid equivalent formulation with the preserved relation on the opposite side is also acceptable.",
    "solutionMd": "```sql\nSELECT s.studentId, s.name, c.title\nFROM Student AS s\nLEFT JOIN Enrollment AS e ON e.studentId = s.studentId\nLEFT JOIN Course AS c ON c.courseId = e.courseId;\n```\n\nThe original RIGHT JOIN preserves Enrollment, not all Student rows. Starting from Student and using LEFT JOIN on both relationship edges retains unenrolled students. Their enrollment and course attributes are NULL.",
    "explanation": "The second join must not turn an unmatched Student row into an inner-join requirement. A valid equivalent formulation with the preserved relation on the opposite side is also acceptable.",
    "hintSteps": [
      "Identify which table must be preserved even when no match exists.",
      "An inner join later in the chain can discard the earlier null-extended rows."
    ],
    "walkthroughSteps": [
      "Make Student the preserved left relation.",
      "Left join Enrollment on studentId.",
      "Left join Course on courseId so the student survives even when both joins have no match."
    ],
    "rubric": [
      {
        "criterion": "Explains why the original preserves the wrong relation.",
        "marks": 2
      },
      {
        "criterion": "Uses a correct two-edge outer-join chain preserving all students.",
        "marks": 2
      },
      {
        "criterion": "Explains NULL course titles for students with no enrollments.",
        "marks": 2
      }
    ],
    "references": [
      "Homework  2 Part 1.pdf, PDF page 7"
    ],
    "tags": [
      "mysql",
      "adapted-homework",
      "sql-debugging",
      "sql-outer-join"
    ]
  },
];
