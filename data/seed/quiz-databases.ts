import type { QuizSet } from "@/lib/types";

/**
 * Concepts of Database Systems (CS-4354) — Fall 2026.
 *
 * Data modelling and the relational model first, then the SQL and internals
 * material — normalisation, indexing and transactions — that carries the
 * weight on exams.
 */
export const databaseSystemsQuizSets: QuizSet[] = [
  {
    id: "db-modeling-sql",
    courseId: "database-systems",
    title: "ER Modelling, Relational Algebra & SQL",
    description:
      "Turning requirements into a schema, the algebra behind the language, and the SQL semantics people most often get wrong.",
    difficulty: "Intermediate",
    estMinutes: 28,
    tags: ["er-modeling", "relational-algebra", "sql", "joins"],
    timerDefaultMinutes: 25,
    questions: [
      {
        id: "db-ms-q1",
        type: "single",
        prompt:
          "How is a **many-to-many** relationship between two entities represented in a relational schema?",
        options: [
          "With a junction table holding a foreign key to each side, usually keyed on the pair",
          "With a foreign key on whichever side has fewer rows",
          "With a repeating group column on both tables",
          "It cannot be represented and must be split into two one-to-many relationships by removing an entity"
        ],
        correct: [0],
        explanation:
          "A many-to-many needs a third relation — a junction (associative) table — with a foreign key to each participant. Its primary key is normally the pair, and any attributes *of the relationship itself* live there.",
        walkthroughSteps: [
          "A single foreign-key column can only reference one row, so it can express at most many-to-one.",
          "Introduce a junction table, e.g. `Enrollment(student_id, course_id)`, with a foreign key to each side.",
          "Key it on the pair unless the same pair may legitimately repeat, in which case add a surrogate key plus a discriminator.",
          "Attributes belonging to the relationship rather than either entity — a grade, an enrolment date — belong in the junction table.",
          "Repeating columns like `course1, course2, course3` violate first normal form and cap the cardinality arbitrarily."
        ],
        tags: ["er-modeling", "many-to-many", "junction-table"]
      },
      {
        id: "db-ms-q2",
        type: "single",
        prompt:
          "What does `SELECT * FROM A LEFT JOIN B ON A.id = B.a_id` return for a row of `A` with no match in `B`?",
        options: [
          "The row from `A` with NULLs in every column that came from `B`",
          "Nothing — the row is dropped",
          "The row from `A` with zeros in the `B` columns",
          "An error"
        ],
        correct: [0],
        explanation:
          "A left outer join preserves every row of the left relation. Unmatched rows are padded with NULL for all right-hand columns — which is why `WHERE B.col = 'x'` in the outer query silently turns a left join back into an inner join.",
        walkthroughSteps: [
          "INNER JOIN keeps only rows with a match on both sides.",
          "LEFT JOIN keeps all left rows, padding unmatched right columns with NULL.",
          "That padding is the whole point: it lets you ask 'which customers have no orders' via `WHERE B.a_id IS NULL`.",
          "The classic bug: adding `WHERE B.status = 'active'` filters out the NULL-padded rows, because NULL fails the comparison — so the join quietly becomes an inner join. Put such a condition in the `ON` clause instead."
        ],
        tags: ["sql", "joins", "null-semantics"]
      },
      {
        id: "db-ms-q3",
        type: "single",
        prompt: "Why does `WHERE column = NULL` never match any row?",
        options: [
          "NULL means 'unknown', so any comparison with it evaluates to UNKNOWN rather than TRUE — use `IS NULL`",
          "NULL is stored as an empty string, which never equals itself",
          "The parser rewrites it to `WHERE FALSE`",
          "It matches only if the column is declared NOT NULL"
        ],
        correct: [0],
        explanation:
          "SQL uses three-valued logic. Comparing anything to NULL yields UNKNOWN, and `WHERE` keeps only rows evaluating to TRUE. `IS NULL` is a distinct predicate that tests for the marker itself.",
        walkthroughSteps: [
          "NULL is not a value; it is a marker meaning 'no value here'.",
          "`= NULL` asks 'is this unknown thing equal to that unknown thing', which is itself unknown.",
          "`WHERE` admits TRUE only, so UNKNOWN rows are excluded — as are they in a `NOT` of the same expression, which trips people up.",
          "Use `IS NULL` / `IS NOT NULL`, or `COALESCE` to substitute a default first.",
          "Same trap in aggregates: `COUNT(col)` skips NULLs while `COUNT(*)` counts rows, so the two disagree exactly when NULLs are present."
        ],
        tags: ["sql", "null-semantics", "three-valued-logic"]
      },
      {
        id: "db-ms-q4",
        type: "single",
        prompt:
          "In a query with `GROUP BY`, what is the difference between `WHERE` and `HAVING`?",
        options: [
          "`WHERE` filters rows before grouping; `HAVING` filters groups after aggregation, so only `HAVING` can reference aggregates",
          "They are interchangeable",
          "`HAVING` filters rows and `WHERE` filters groups",
          "`HAVING` may only be used without `GROUP BY`"
        ],
        correct: [0],
        explanation:
          "Logical evaluation order is FROM → WHERE → GROUP BY → HAVING → SELECT → ORDER BY. `WHERE` runs before groups exist, so it cannot see `SUM()`; `HAVING` runs after, so it can.",
        walkthroughSteps: [
          "`WHERE` filters individual rows entering the grouping step.",
          "`GROUP BY` collapses the survivors into groups.",
          "`HAVING` then filters whole groups, and is the only place an aggregate condition is legal.",
          "Performance note: filter in `WHERE` whenever the condition does not need an aggregate, because it reduces the rows that ever reach the grouping.",
          "Also from that ordering: `SELECT` aliases are generally not visible in `WHERE` or `HAVING`, since `SELECT` is evaluated later."
        ],
        tags: ["sql", "group-by", "having"]
      },
      {
        id: "db-ms-q5",
        type: "multi",
        prompt:
          "Which relational-algebra operations are part of the standard **primitive** set?",
        options: [
          "Selection $\\sigma$",
          "Projection $\\pi$",
          "Cartesian product $\\times$",
          "Set difference $-$",
          "Natural join $\\bowtie$"
        ],
        correct: [0, 1, 2, 3],
        explanation:
          "The primitives are selection, projection, union, set difference, Cartesian product and rename. Natural join is derived — it is a Cartesian product followed by a selection on matching attributes and a projection to drop the duplicate column.",
        walkthroughSteps: [
          "Primitive set: $\\sigma$, $\\pi$, $\\cup$, $-$, $\\times$, $\\rho$.",
          "Everything else is sugar built on those.",
          "$R \\bowtie S = \\pi_{\\text{no dupes}}(\\sigma_{R.a = S.a}(R \\times S))$.",
          "Intersection is also derived: $R \\cap S = R - (R - S)$.",
          "Knowing which are primitive matters for expressive-power arguments — for instance, that relational algebra cannot express transitive closure."
        ],
        tags: ["relational-algebra", "primitives", "joins"]
      },
      {
        id: "db-ms-q6",
        type: "single",
        prompt: "What is the difference between a **primary key** and a **candidate key**?",
        options: [
          "A candidate key is any minimal set of attributes uniquely identifying a row; the primary key is the candidate key chosen as the identifier",
          "A candidate key may be NULL and a primary key may not",
          "A primary key can be any set of columns; a candidate key must be a single column",
          "There is no difference"
        ],
        correct: [0],
        explanation:
          "A relation can have several candidate keys — a `Student` might be identified by student number or by email. One is designated primary; the rest become alternate keys, usually enforced with UNIQUE constraints.",
        walkthroughSteps: [
          "Superkey: any attribute set that uniquely identifies a row.",
          "Candidate key: a superkey with no removable attribute — that is, minimal.",
          "Primary key: the candidate key you designate, which then cannot be NULL and is typically the clustering key.",
          "The remaining candidate keys should still be enforced with UNIQUE, or the database will permit duplicates the model forbids.",
          "Choosing a surrogate key does not remove the natural candidate keys; it just means they need explicit constraints."
        ],
        tags: ["keys", "primary-key", "candidate-key"]
      },
      {
        id: "db-ms-q7",
        type: "single",
        prompt:
          "What does a **correlated** subquery do differently from an uncorrelated one?",
        options: [
          "It references a column from the outer query, so it is conceptually re-evaluated for each outer row",
          "It always runs faster because it can be cached",
          "It may only appear in the FROM clause",
          "It cannot return more than one row"
        ],
        correct: [0],
        explanation:
          "A correlated subquery depends on the current outer row, so semantically it runs once per row — the source of many accidental $O(n \\cdot m)$ queries. An uncorrelated subquery can be evaluated once and reused.",
        walkthroughSteps: [
          "Uncorrelated: `WHERE id IN (SELECT id FROM B WHERE x = 1)` — the inner query stands alone, so it is computed once.",
          "Correlated: `WHERE EXISTS (SELECT 1 FROM B WHERE B.a_id = A.id)` — the inner query mentions `A.id`, so it depends on the row being tested.",
          "Semantically that is one execution per outer row; a good optimiser often rewrites it as a semi-join, but you should not rely on that.",
          "Rewriting a correlated subquery as an explicit JOIN or a window function is a standard optimisation.",
          "`EXISTS` is usually preferable to `IN` on a correlated condition because it can stop at the first match, and it does not have `IN`'s NULL pitfalls."
        ],
        tags: ["sql", "subqueries", "correlated"]
      },
      {
        id: "db-ms-q8",
        type: "free",
        prompt:
          "Given `Student(sid, name)`, `Course(cid, title)` and `Enrollment(sid, cid, grade)`, write SQL listing every student who is enrolled in **no** course, and explain two different ways to express it.",
        explanation:
          "Anti-join. Standard formulations are a LEFT JOIN with an IS NULL test, or NOT EXISTS; `NOT IN` is a third but is unsafe with NULLs.",
        sampleAnswer:
          "LEFT JOIN form:\n```sql\nSELECT s.sid, s.name\nFROM Student s\nLEFT JOIN Enrollment e ON e.sid = s.sid\nWHERE e.sid IS NULL;\n```\nNOT EXISTS form:\n```sql\nSELECT s.sid, s.name\nFROM Student s\nWHERE NOT EXISTS (\n  SELECT 1 FROM Enrollment e WHERE e.sid = s.sid\n);\n```\nBoth express an anti-join. The LEFT JOIN version relies on unmatched rows being NULL-padded, so testing the joined key for NULL isolates exactly the students with no enrolment row. NOT EXISTS states the intent directly and short-circuits on the first match. A third form, `WHERE s.sid NOT IN (SELECT sid FROM Enrollment)`, is dangerous: if any `Enrollment.sid` is NULL the whole predicate becomes UNKNOWN and the query returns no rows at all.",
        hintSteps: [
          "The shape you want is an anti-join: rows on the left with no partner on the right.",
          "One route keeps all left rows and then filters to the ones that failed to match — what marks those?",
          "The other route asks the question directly with a correlated existence test.",
          "Think about what `NOT IN` does if the subquery can produce a NULL."
        ],
        walkthroughSteps: [
          "'Enrolled in no course' means: no matching row in `Enrollment`.",
          "LEFT JOIN keeps every student, padding the `Enrollment` columns with NULL when there is no match.",
          "So `WHERE e.sid IS NULL` selects exactly the unmatched students — test the *joined* column, not one that could legitimately be NULL.",
          "NOT EXISTS expresses it directly and can stop scanning at the first match, which often plans better.",
          "`NOT IN` looks equivalent but is not: `x NOT IN (1, NULL)` is UNKNOWN rather than TRUE, so a single NULL in the subquery empties the result.",
          "Since `Enrollment.sid` is a foreign key it is probably NOT NULL here, but relying on that makes the query fragile to a schema change."
        ],
        tags: ["sql", "anti-join", "not-exists"]
      }
    ]
  },
  {
    id: "db-normalization-transactions",
    courseId: "database-systems",
    title: "Normalisation, Indexing & Transactions",
    description:
      "Functional dependencies through BCNF, what an index actually costs, and ACID with the isolation anomalies.",
    difficulty: "Intermediate",
    estMinutes: 30,
    tags: ["normalization", "indexing", "transactions", "acid"],
    timerDefaultMinutes: 28,
    questions: [
      {
        id: "db-nt-q1",
        type: "single",
        prompt:
          "A relation is in 2NF but not 3NF. What kind of dependency must it contain?",
        options: [
          "A transitive dependency — a non-key attribute determining another non-key attribute",
          "A partial dependency on part of a composite key",
          "A multi-valued dependency",
          "A dependency with no determinant"
        ],
        correct: [0],
        explanation:
          "2NF removes partial dependencies on part of a composite key. 3NF additionally removes transitive dependencies, where a non-key attribute determines another non-key attribute — the classic `(zip → city)` inside an orders table.",
        walkthroughSteps: [
          "1NF: atomic values, no repeating groups.",
          "2NF: 1NF plus no non-key attribute depending on only *part* of a composite key.",
          "3NF: 2NF plus no non-key attribute depending on another non-key attribute.",
          "Example: `Order(order_id, zip, city)` with `zip → city`. `zip` is not a key, so `city` depends transitively on `order_id` through it.",
          "The practical harm is update anomalies: correcting one city means finding every row with that zip."
        ],
        tags: ["normalization", "3nf", "transitive-dependency"]
      },
      {
        id: "db-nt-q2",
        type: "single",
        prompt: "How does BCNF differ from 3NF?",
        options: [
          "BCNF requires every determinant to be a superkey; 3NF permits a non-superkey determinant if the dependent attribute is prime",
          "BCNF allows partial dependencies and 3NF does not",
          "BCNF applies only to relations with a single-column key",
          "They are the same condition stated differently"
        ],
        correct: [0],
        explanation:
          "BCNF is the stricter form: for every non-trivial $X \\to Y$, $X$ must be a superkey. 3NF relaxes this when $Y$ is a prime attribute, so a relation can be in 3NF and not BCNF — and decomposing to BCNF sometimes costs dependency preservation.",
        walkthroughSteps: [
          "3NF: for every non-trivial $X \\to A$, either $X$ is a superkey or $A$ is prime (part of some candidate key).",
          "BCNF: drops the escape clause — $X$ must be a superkey, full stop.",
          "So every BCNF relation is in 3NF, but not conversely.",
          "The classic example has overlapping candidate keys, where the 3NF exception applies.",
          "Tradeoff worth stating in an exam: a BCNF decomposition is always lossless but may fail to preserve all functional dependencies, whereas a 3NF decomposition can always be both lossless and dependency-preserving."
        ],
        tags: ["normalization", "bcnf", "functional-dependencies"]
      },
      {
        id: "db-nt-q3",
        type: "multi",
        prompt: "Select every true statement about database **indexes**.",
        options: [
          "They speed up reads that match the indexed columns",
          "They slow down inserts, updates and deletes",
          "They consume additional storage",
          "An index on a low-cardinality column is usually highly effective",
          "A composite index on (a, b) can serve a query filtering on `a` alone"
        ],
        correct: [0, 1, 2, 4],
        explanation:
          "Indexes trade write cost and space for read speed. Low cardinality is the weak case — a boolean index matches half the table, so a scan is usually cheaper. Composite indexes follow the leftmost-prefix rule, so (a, b) helps a query on `a`, but not one on `b` alone.",
        walkthroughSteps: [
          "A B-tree index turns an $O(n)$ scan into roughly $O(\\log n)$ for matching predicates.",
          "Every write must also maintain each index on the table, so writes get slower as indexes accumulate.",
          "Storage is real: an index on a wide key can approach the size of the table.",
          "Low cardinality — say a `status` with two values — means any lookup returns a huge fraction of rows, and the optimiser will usually prefer a sequential scan anyway.",
          "Leftmost prefix: (a, b) is usable for `a`, and for `a AND b`, but not for `b` alone, because the index is sorted by `a` first."
        ],
        tags: ["indexing", "b-tree", "performance"]
      },
      {
        id: "db-nt-q4",
        type: "single",
        prompt: "Which anomaly does the READ COMMITTED isolation level still permit?",
        options: [
          "Non-repeatable reads",
          "Dirty reads",
          "Nothing — it is fully serialisable",
          "Lost updates only under MVCC"
        ],
        correct: [0],
        explanation:
          "READ COMMITTED prevents dirty reads but not non-repeatable reads: reading the same row twice in one transaction can return different values if another transaction commits in between. REPEATABLE READ fixes that but may still allow phantoms; SERIALIZABLE removes all three.",
        walkthroughSteps: [
          "Dirty read: seeing another transaction's uncommitted data. Blocked at READ COMMITTED.",
          "Non-repeatable read: re-reading a row and getting a different committed value. Still possible.",
          "Phantom read: re-running a range query and seeing new rows. Possible at REPEATABLE READ in the standard.",
          "SERIALIZABLE forbids all three, at the cost of more blocking or more aborts.",
          "Read the levels as a ladder — each one forbids strictly more, and costs strictly more concurrency."
        ],
        tags: ["transactions", "isolation-levels", "anomalies"]
      },
      {
        id: "db-nt-q5",
        type: "single",
        prompt: "In ACID, what does **durability** guarantee?",
        options: [
          "Once a transaction commits, its effects survive a crash",
          "Transactions cannot see each other's uncommitted changes",
          "A transaction either fully completes or has no effect",
          "The database moves from one valid state to another"
        ],
        correct: [0],
        explanation:
          "Durability is about surviving failure: after commit returns, the change persists even through a power loss. It is normally implemented with write-ahead logging — the log record is forced to stable storage before commit is acknowledged.",
        walkthroughSteps: [
          "Atomicity: all or nothing.",
          "Consistency: constraints hold before and after.",
          "Isolation: concurrent transactions do not observe each other's partial work.",
          "Durability: committed means committed, crash or not.",
          "Write-ahead logging is the mechanism — flush the log first, then the data pages can be written lazily, and recovery replays the log."
        ],
        tags: ["transactions", "acid", "durability"]
      },
      {
        id: "db-nt-q6",
        type: "single",
        prompt: "What does two-phase locking (2PL) guarantee, and what is its cost?",
        options: [
          "It guarantees serialisable schedules, but can deadlock",
          "It guarantees deadlock freedom, but not serialisability",
          "It guarantees both serialisability and deadlock freedom",
          "It only applies to read-only transactions"
        ],
        correct: [0],
        explanation:
          "2PL — acquire locks in a growing phase, release in a shrinking phase, never acquiring after the first release — produces conflict-serialisable schedules. It does not prevent deadlock, so systems add detection (a wait-for graph) or prevention (timeouts, wound-wait).",
        walkthroughSteps: [
          "Growing phase: acquire locks only. Shrinking phase: release only.",
          "The rule that no lock is acquired after any release is what forces conflict serialisability.",
          "Deadlock is still possible: two transactions each holding what the other wants next.",
          "Databases detect it by finding a cycle in the wait-for graph and aborting a victim.",
          "Strict 2PL holds all exclusive locks until commit, which additionally guarantees recoverability and avoids cascading aborts."
        ],
        tags: ["transactions", "two-phase-locking", "serialisability"]
      },
      {
        id: "db-nt-q7",
        type: "single",
        prompt:
          "Why might a well-designed schema be deliberately **denormalised**?",
        options: [
          "To avoid expensive joins on a read-heavy workload, accepting redundancy and update cost",
          "Because normalisation is only a theoretical exercise",
          "To reduce storage consumption",
          "Because denormalised schemas cannot have anomalies"
        ],
        correct: [0],
        explanation:
          "Denormalisation is a considered trade: duplicate data to skip joins on hot read paths. It costs storage and creates the update anomalies normalisation was designed to remove, so it needs a measured reason and a plan for keeping copies consistent.",
        walkthroughSteps: [
          "Normalise first — it is far easier to denormalise a correct schema than to repair an incorrect one.",
          "Denormalise only against evidence: a specific join measured as a bottleneck on a read-dominated path.",
          "It increases storage rather than reducing it, since data is duplicated.",
          "The real cost is consistency: every copy must be updated together, usually via triggers, materialised views, or application-level discipline.",
          "Materialised views are often the better answer — the same benefit with the refresh policy made explicit."
        ],
        tags: ["normalization", "denormalization", "tradeoffs"]
      },
      {
        id: "db-nt-q8",
        type: "free",
        prompt:
          "Given `R(A, B, C, D)` with functional dependencies $A \\to B$, $B \\to C$ and $A \\to D$, identify the key, state the highest normal form R satisfies, and decompose it into 3NF if it is not already.",
        explanation:
          "$A$ is the key; $B \\to C$ is a transitive dependency, so R is in 2NF but not 3NF. Decompose into $R_1(A, B, D)$ and $R_2(B, C)$.",
        sampleAnswer:
          "Closure: $A^+ = \\{A, B, C, D\\}$, so $A$ is the only candidate key. Prime attributes: just $A$. There are no partial dependencies because the key is a single attribute, so R is in 2NF. But $B \\to C$ has a non-superkey determinant and $C$ is non-prime, so R violates 3NF. Decompose into $R_1(A, B, D)$ with key $A$ and $R_2(B, C)$ with key $B$. Both are now in 3NF and in BCNF, the decomposition is lossless because $R_1 \\cap R_2 = \\{B\\}$ is the key of $R_2$, and both original dependencies are preserved.",
        hintSteps: [
          "Compute the attribute closure of each candidate to find the key.",
          "With a single-attribute key, can a partial dependency exist at all?",
          "Look for a dependency whose left side is not a superkey and whose right side is not prime.",
          "When you split, check the lossless-join condition: the shared attributes must be a key of at least one fragment."
        ],
        walkthroughSteps: [
          "$A^+$: start with $A$; $A \\to B$ adds $B$; $B \\to C$ adds $C$; $A \\to D$ adds $D$. So $A^+ = ABCD$ and $A$ is a candidate key.",
          "No other attribute determines everything, so $A$ is the only candidate key and the only prime attribute.",
          "2NF asks about dependencies on *part* of a composite key. The key is a single attribute, so this cannot be violated — R is in 2NF.",
          "3NF: check each dependency. $A \\to B$ and $A \\to D$ are fine ($A$ is a superkey). $B \\to C$ is not — $B$ is not a superkey and $C$ is not prime. So R is not in 3NF.",
          "Decompose along the offending dependency: $R_2(B, C)$ keyed on $B$, and $R_1(A, B, D)$ keyed on $A$.",
          "Lossless check: $R_1 \\cap R_2 = \\{B\\}$, which is the key of $R_2$, so the join reconstructs R exactly.",
          "Dependency preservation: $A \\to B$ and $A \\to D$ live in $R_1$, $B \\to C$ lives in $R_2$ — all preserved. Both fragments are also in BCNF here, so nothing further is needed."
        ],
        tags: ["normalization", "functional-dependencies", "decomposition"]
      }
    ]
  }
];
