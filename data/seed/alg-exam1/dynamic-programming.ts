import type { Question } from "@/lib/types";

export const dynamicProgrammingQuestions: Question[] = [
  {
    id: "alg-e1-dp-edit-table",
    type: "free",
    difficulty: "hard",
    prompt: "**Classroom review problem.** Transform X = `esteban` into Y = `stephen`. Insertion, deletion and replacement each cost 1; matching characters cost 0. Define D[i,j] as the minimum cost for transforming the first i characters of X into the first j characters of Y. Fill the entire 8 × 8 distance-and-direction table, including empty prefixes, and report D[7,7]. An arrow points to the predecessor: ↖ match/replace, ↑ delete, ← insert. For ties, choose ↖ before ↑ before ←. Other optimal arrow choices are valid if explained.",
    sampleAnswer: "| X prefix / Y prefix | ε | s | st | ste | step | steph | stephe | stephen |\n|---|---|---|---|---|---|---|---|---|\n| ε | 0 | 1← | 2← | 3← | 4← | 5← | 6← | 7← |\n| e | 1↑ | 1↖ | 2↖ | 2↖ | 3← | 4← | 5↖ | 6← |\n| es | 2↑ | 1↖ | 2↖ | 3↖ | 3↖ | 4↖ | 5↖ | 6↖ |\n| est | 3↑ | 2↑ | 1↖ | 2← | 3← | 4↖ | 5↖ | 6↖ |\n| este | 4↑ | 3↑ | 2↑ | 1↖ | 2← | 3← | 4↖ | 5← |\n| esteb | 5↑ | 4↑ | 3↑ | 2↑ | 2↖ | 3↖ | 4↖ | 5↖ |\n| esteba | 6↑ | 5↑ | 4↑ | 3↑ | 3↖ | 3↖ | 4↖ | 5↖ |\n| esteban | 7↑ | 6↑ | 5↑ | 4↑ | 4↖ | 4↖ | 4↖ | 4↖ |\n\nThe minimum edit distance is **4**. Each interior entry is the minimum of diagonal + match/replacement cost, above + 1, and left + 1. The classroom photo uses some different ties; the numerical distances agree. A different optimal arrow is not a different distance.",
    explanation: "The photographed classroom solution ends at distance 4. Recomputing all prefix pairs gives the same result. This is the directly observed review example; its appearance in review is evidence for prioritizing it, not confirmation of the exam question.",
    rubric: [
      { criterion: "Initializes row 0 to 0…7 and column 0 to 0…7.", marks: 1 },
      { criterion: "Computes the numerical values correctly in rows e, es and est.", marks: 1 },
      { criterion: "Computes the numerical values correctly in rows este and esteb.", marks: 1 },
      { criterion: "Computes the numerical values correctly in rows esteba and esteban, ending at 4.", marks: 1 },
      { criterion: "Every arrow identifies a minimum-cost predecessor, following the stated tie rule or explaining another valid tie choice.", marks: 1 }
    ],
    hintSteps: ["Empty-to-prefix needs one insertion per target character; prefix-to-empty needs one deletion per source character.", "At a cell, compare three predecessor costs. A matching diagonal adds zero."],
    walkthroughSteps: ["Write the empty-prefix boundary values.", "Fill each row left to right so all three predecessors are already available.", "Compare match/replacement, deletion and insertion at each cell.", "Record a minimizing predecessor and read the answer at the bottom right."],
    references: ["IMG_6612.jpg, projected classroom review table, X=esteban and Y=stephen"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "edit-distance", "class-review", "high-priority"]
  },
  {
    id: "alg-e1-dp-edit-recurrence",
    type: "free",
    difficulty: "med",
    prompt: "For the unit-cost edit-distance problem shown in class, define a subproblem, give all base cases and the recurrence, explain the three transitions, and state the time and space for filling the full table for strings of lengths m and n. Include the cases where one string is empty.",
    sampleAnswer: "$D[i,j]$ is the minimum edit cost from $X[1..i]$ to $Y[1..j]$. Set $D[i,0]=i$ and $D[0,j]=j$, including $D[0,0]=0$. For $i,j>0$,\n\n$$D[i,j]=\\min\\{D[i-1,j]+1,\\ D[i,j-1]+1,\\ D[i-1,j-1]+[X_i\\ne Y_j]\\}.$$\n\nAbove deletes $X_i$; left inserts $Y_j$; diagonal matches for 0 or replaces for 1. Each last operation leaves one of these shorter-prefix subproblems. Row-major filling performs constant work per entry. Full-table time and space are $\\Theta((m+1)(n+1))$, usually written $\\Theta(mn)$ when both lengths are positive. The explicit form also handles empty inputs. To return only the distance, keep two rows and put the shorter string along the columns, using $O(\\min(m,n)+1)$ space. This two-row method alone does not preserve all traceback arrows.",
    explanation: "The recurrence minimizes over the possible last operations. The boundaries are not optional: they represent insertions or deletions involving the empty prefix.",
    rubric: [
      { criterion: "Defines a prefix-pair minimum-cost subproblem and both boundary cases.", marks: 1 },
      { criterion: "Gives the minimum of deletion, insertion and match/replacement with the correct costs.", marks: 1 },
      { criterion: "Explains each transition as a possible last operation.", marks: 1 },
      { criterion: "States full-table time/space, including empty inputs, and distinguishes distance-only row storage from traceback.", marks: 1 }
    ],
    hintSteps: ["Describe the cost for two prefixes, not two arbitrary suffixes.", "Ask what operation could have produced the last character or removed the last source character."],
    walkthroughSteps: ["Define the meaning of a table cell.", "Initialize empty-prefix costs.", "Take the minimum over the three possible last operations.", "Count table entries and constant work per entry."],
    references: ["IMG_6612.jpg, classroom edit-distance review; recurrence and complexity are related practice"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "edit-distance", "adapted-review", "high-priority"]
  },
  {
    id: "alg-e1-dp-edit-cell",
    type: "free",
    difficulty: "easy",
    prompt: "In the `esteban` → `stephen` unit-cost edit-distance table, compute D[5,5] for `esteb` → `steph`. You are given D[4,4]=2, D[4,5]=3 and D[5,4]=2. Show all three candidates, the minimum, and all optimal predecessor arrows.",
    sampleAnswer: "The last characters are `b` and `h`, so the diagonal is a replacement: $2+1=3$. Deletion from above costs $3+1=4$. Insertion from the left costs $2+1=3$. Therefore **D[5,5]=3**, with either **↖ or ←** optimal. The specified diagonal-first tie rule chooses ↖. ↑ is not optimal because it costs 4.",
    explanation: "A cell can have multiple optimal predecessors. Ties concern which optimal edit script is reconstructed, not whether the minimum distance is unique.",
    rubric: [
      { criterion: "Computes diagonal 3, above 4 and left 3, using replacement rather than a free match.", marks: 1 },
      { criterion: "Returns 3 and identifies both diagonal and left as optimal, rejecting up.", marks: 1 }
    ],
    hintSteps: ["Compare the two last characters before deciding the diagonal cost.", "Add the operation cost to each predecessor, then minimize."],
    walkthroughSteps: ["The last characters differ.", "Evaluate replacement, deletion and insertion.", "Keep both minimum-cost choices, then apply the tie rule if one arrow is required."],
    references: ["IMG_6612.jpg, classroom edit-distance table, row esteb and column steph; adapted cell exercise"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "edit-distance", "adapted-review"]
  },
  {
    id: "alg-e1-dp-edit-traceback",
    type: "free",
    difficulty: "med",
    prompt: "The minimum unit-cost distance from `esteban` to `stephen` is 4. Give a forward sequence of four edits, showing the whole string after each edit. Explain how ↑, ← and ↖ arrows are interpreted during backward traceback, and why the operations must be reversed to obtain the forward script.",
    sampleAnswer: "One optimal forward script is:\n\n1. Delete the initial `e`: `esteban` → `steban`.\n2. Insert `p` after `ste`: `steban` → `stepban`.\n3. Replace `b` with `h`: `stepban` → `stephan`.\n4. Replace `a` with `e`: `stephan` → `stephen`.\n\nThere are four paid edits; unchanged `s`, `t`, `e` and `n` are matches. Backward from D[m,n], ↑ consumes a source character (delete), ← consumes a target character (insert), and ↖ consumes both (match/replace). Traceback finds the last operation first, so collect operations and reverse them, or recurse to the predecessor before emitting the operation. Any other valid four-edit script earns full credit.",
    explanation: "Reading arrows backward recovers an optimal script in reverse chronological order. A valid script and the DP value together establish that this four-edit solution is optimal.",
    rubric: [
      { criterion: "Shows a valid four-edit sequence ending exactly at stephen.", marks: 2 },
      { criterion: "Maps all three predecessor directions to the correct operations.", marks: 1 },
      { criterion: "Explains why backward traceback must be reversed or emitted after recursion.", marks: 1 }
    ],
    hintSteps: ["Delete the first e, then align the shared prefix ste.", "An arrow describes where the prefix solution came from; traceback visits operations from last to first."],
    walkthroughSteps: ["Start at the bottom-right optimum.", "Follow minimizing predecessor arrows to the boundary.", "Reverse the recovered operations.", "Apply them to the complete string and count only paid edits."],
    references: ["IMG_6612.jpg, classroom edit-distance table; related traceback practice"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "edit-distance", "adapted-review", "high-priority"]
  },
  {
    id: "alg-e1-dp-edit-variant",
    type: "free",
    difficulty: "med",
    prompt: "**Additional variation.** With unit-cost insertion, deletion and replacement, give the edit distance from `kitten` to `sitting` and a script achieving it. Explain why edit distance is not simply the number of unequal character positions.",
    sampleAnswer: "The distance is **3**. Replace `k` with `s`: `kitten` → `sitten`; replace `e` with `i`: `sitten` → `sittin`; insert `g` at the end: `sittin` → `sitting`. The prefix DP gives bottom-right value 3, so a two-edit solution is impossible. Position-by-position mismatch counting does not consider insertions/deletions that shift subsequent alignment, and it also needs to account for unequal lengths. The recurrence minimizes over all allowed alignments.",
    explanation: "This tests the same method on new strings, rather than memorizing the photographed answer. Replacement is allowed here; a distance that allows only insertions and deletions is a different problem.",
    rubric: [
      { criterion: "States distance 3 and gives a valid three-edit transformation.", marks: 2 },
      { criterion: "Explains that insertions/deletions change alignment and that replacements are allowed.", marks: 1 }
    ],
    hintSteps: ["Two replacements fix the shared-length portion.", "The target also has a final character the source lacks."],
    walkthroughSteps: ["Align the shared characters.", "Replace k/s and e/i.", "Insert the final g and check the resulting string."],
    references: ["Additional practice using the edit-distance method in IMG_6612.jpg"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "edit-distance", "additional-practice"]
  },
  {
    id: "alg-e1-dp-lcs-table",
    type: "free",
    difficulty: "hard",
    prompt: "**Lecture 16 worked example.** Let X=`ABCBDAB` and Y=`BDCABA`. Define c[i,j] as the LCS length of the first i and j characters. Fill the complete length table including the zero row/column, report the LCS length, and give one subsequence achieving it. A subsequence preserves order but need not be contiguous.",
    sampleAnswer: "| X prefix / Y prefix | ε | B | BD | BDC | BDCA | BDCAB | BDCABA |\n|---|---|---|---|---|---|---|---|\n| ε | 0 | 0 | 0 | 0 | 0 | 0 | 0 |\n| A | 0 | 0 | 0 | 0 | 1 | 1 | 1 |\n| AB | 0 | 1 | 1 | 1 | 1 | 2 | 2 |\n| ABC | 0 | 1 | 1 | 2 | 2 | 2 | 2 |\n| ABCB | 0 | 1 | 1 | 2 | 2 | 3 | 3 |\n| ABCBD | 0 | 1 | 2 | 2 | 2 | 3 | 3 |\n| ABCBDA | 0 | 1 | 2 | 2 | 3 | 3 | 4 |\n| ABCBDAB | 0 | 1 | 2 | 2 | 3 | 4 | 4 |\n\nThe LCS length is **4**. One LCS is **BCBA**: positions 2,3,4,6 in X and 1,3,5,6 in Y. `BDAB` is also valid (X positions 2,5,6,7; Y positions 1,2,4,5). A matching cell is diagonal + 1; a mismatch is max(above,left).",
    explanation: "This is the exact pair of sequences used throughout Lecture 16. Multiple optimal subsequences may have the same maximum length; the lecture asks for a longest common subsequence, not a unique string.",
    rubric: [
      { criterion: "Uses zero for both empty-prefix boundaries.", marks: 1 },
      { criterion: "Correctly fills rows A, AB and ABC.", marks: 1 },
      { criterion: "Correctly fills rows ABCB and ABCBD.", marks: 1 },
      { criterion: "Correctly fills the final two rows and reports length 4.", marks: 1 },
      { criterion: "Gives a common subsequence of length 4, preserving order in both strings.", marks: 1 }
    ],
    hintSteps: ["Initialize every empty-prefix LCS to length 0.", "Match: diagonal+1. Mismatch: choose the greater length above or left."],
    walkthroughSteps: ["Create the zero boundaries.", "Fill prefix pairs left to right and top to bottom.", "Read c[7,6]=4.", "Trace back to construct a subsequence and check its positions in both strings."],
    references: ["Lecture16-dynamic programming-part1.pdf, PDF pp. 4, 21-23, ABCBDAB/BDCABA example"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "lecture-exercise", "high-priority"]
  },
  {
    id: "alg-e1-dp-lcs-traceback",
    type: "free",
    difficulty: "med",
    prompt: "For X=`ABCBDAB`, Y=`BDCABA`, reconstruct the LCS using the Lecture 16 rule: move diagonally on a character match; otherwise move ↑ when c[i−1,j] ≥ c[i,j−1], and ← otherwise. List the visited coordinates from (7,6) to the boundary, the matched characters in backward order, and the returned LCS. Explain why PRINT-LCS prints after its recursive call.",
    sampleAnswer: "The path is **(7,6) ↑ (6,6) ↖ (5,5) ↑ (4,5) ↖ (3,4) ← (3,3) ↖ (2,2) ← (2,1) ↖ (1,0)**. Diagonal matches encountered backward are **A, B, C, B**. Reverse them to return **BCBA**. PRINT-LCS calls the predecessor first and then prints the matched character, so the earlier characters appear before the later ones. Printing before the recursive call would output the reverse sequence. Moving up on mismatch ties makes this particular output deterministic, but other valid tie rules can return another LCS of length 4.",
    explanation: "The slide's up-on-tie convention selects BCBA. The table contains lengths; the arrows or a comparison of neighboring lengths determine one reconstruction.",
    rubric: [
      { criterion: "Lists the correct traceback coordinates under the specified tie rule.", marks: 2 },
      { criterion: "Identifies backward matches A,B,C,B and returns BCBA.", marks: 1 },
      { criterion: "Explains why printing occurs after recursion and how tie rules affect the chosen LCS.", marks: 1 }
    ],
    hintSteps: ["At (7,6), B and A differ and the two neighboring lengths tie.", "Only diagonal character matches add a character to the reconstructed result."],
    walkthroughSteps: ["Begin at the final table entry.", "Use the specified mismatch tie rule at each step.", "Record characters on matching diagonals.", "Reverse the recorded characters, or emit them after recursive traceback."],
    references: ["Lecture16-dynamic programming-part1.pdf, PDF pp. 21-23, LCS-LENGTH and PRINT-LCS"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "lecture-exercise", "high-priority"]
  },
  {
    id: "alg-e1-dp-lcs-recurrence-proof",
    type: "free",
    difficulty: "hard",
    prompt: "Define the LCS prefix subproblem and give its recurrence and base cases. Justify the matching-character case with optimal substructure, and explain why the mismatch case takes a maximum of two prefix problems rather than diagonal+1.",
    sampleAnswer: "$c[i,j]=|\\operatorname{LCS}(X[1..i],Y[1..j])|$. Set $c[i,0]=c[0,j]=0$. If $X_i=Y_j$, use $c[i,j]=c[i-1,j-1]+1$. Otherwise use $c[i,j]=\\max(c[i-1,j],c[i,j-1])$.\n\nIf the last characters match, an optimal common subsequence can end with this shared character. Remove it: the remaining subsequence must be optimal for the shorter prefixes, since replacing it with a longer one and appending the shared character would contradict optimality. Conversely, appending that character to an optimal shorter-prefix subsequence is feasible. If the last characters differ, a common subsequence cannot match them to each other; at least one endpoint is omitted. Omitting X's endpoint gives the above subproblem, omitting Y's gives the left subproblem, and the best of these covers both possibilities. A mismatching diagonal cannot add a matched character.",
    explanation: "The proof connects each transition to a feasible common subsequence and uses a contradiction to establish optimal substructure, rather than simply quoting a formula.",
    rubric: [
      { criterion: "Defines prefix LCS length and both zero boundary cases.", marks: 1 },
      { criterion: "Gives both correct recurrence branches.", marks: 1 },
      { criterion: "Justifies the matching branch using an optimal shorter-prefix solution and a cut-and-paste contradiction.", marks: 1 },
      { criterion: "Explains the endpoint-omission alternatives on a mismatch and why no character is added.", marks: 1 }
    ],
    hintSteps: ["The subproblem concerns prefixes and the length of an optimum.", "If a shorter-prefix solution were not optimal, replace it with a longer one."],
    walkthroughSteps: ["Define the table cell and boundaries.", "Separate matching and mismatching last characters.", "Use optimal substructure for the matching case.", "Take the better endpoint-omission solution for a mismatch."],
    references: ["Lecture16-dynamic programming-part1.pdf, PDF pp. 8-13, recurrence and optimal-substructure proof"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "proof", "lecture-example", "high-priority"]
  },
  {
    id: "alg-e1-dp-lcs-complexity",
    type: "free",
    difficulty: "med",
    prompt: "State the time and space costs of bottom-up LCS-LENGTH with full length/direction tables, and the worst-case time of PRINT-LCS, for nonempty strings of lengths m,n. If only the LCS length is required, describe the memory reduction and what information is lost. Is PRINT-LCS always Θ(L), where L is the output length?",
    sampleAnswer: "LCS-LENGTH fills $mn$ interior cells with constant work each: time $\\Theta(mn)$ and full-table space $\\Theta(mn)$ (including boundaries, $\\Theta((m+1)(n+1))$). PRINT-LCS reduces i or j on every step, so it has $O(m+n)$ time and call-stack space; its worst-case time is $\\Theta(m+n)$ for suitable inputs. It is **not always Θ(L)**: with disjoint strings, L=0 but traceback can still cross many cells. Printing characters adds $O(L)$ work, already covered by the path bound.\n\nFor length only, keep the previous and current row, storing $O(\\min(m,n)+1)$ values by putting the shorter string in the columns. This retains the final length but discards the full direction table needed for the ordinary PRINT-LCS reconstruction. More advanced reconstruction methods are outside this question.",
    explanation: "Filling a table and following one traceback path have different costs. A traceback can traverse unmatched characters without emitting output.",
    rubric: [
      { criterion: "States Θ(mn) table time and full-table space, with constant work per cell.", marks: 1 },
      { criterion: "Bounds PRINT-LCS by O(m+n) and explains decreasing coordinates.", marks: 1 },
      { criterion: "Rejects a universal Θ(L) claim using a no-common-character example.", marks: 1 },
      { criterion: "Describes two-row length-only memory and its limitation for ordinary traceback.", marks: 1 }
    ],
    hintSteps: ["Count the cells for filling, then count moves for reconstruction.", "Consider two strings with no shared character: no output does not imply no traversal."],
    walkthroughSteps: ["Count constant work per table cell.", "Bound each traceback step by a decrease in i+j.", "Separate output length from path length.", "Keep only the two rows required by the recurrence if reconstruction is unnecessary."],
    references: ["Lecture16-dynamic programming-part1.pdf, PDF pp. 20-23, time/space questions; two-row method is additional practice"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "complexity", "lecture-exercise", "high-priority"]
  },
  {
    id: "alg-e1-dp-memoization",
    type: "free",
    difficulty: "med",
    prompt: "Lecture 16's naive recursive LCS branches on both shorter prefixes when characters differ. Explain overlapping subproblems with a concrete repeated state, describe memoization including the empty-prefix base cases, and compare worst-case running time with the naive recursion. Does a lazy memoized run necessarily visit every cell?",
    sampleAnswer: "For strings with no matching characters, state (7,6) branches to (6,6) and (7,5), which can both reach **(6,5)**. This is a generic all-mismatch example, not the traceback of ABCBDAB/BDCABA. A recursion tree contains many calls to the same state, although there are only $(m+1)(n+1)$ possible prefix pairs. Initialize the empty-prefix answers to 0. Before solving an interior state, check the cache; compute and store its recurrence result only if absent. Do not confuse cached zero with an uncomputed entry: use a separate visited marker or a sentinel such as -1.\n\nThe naive recursion can take exponential time in the lengths because mismatch branches repeatedly recompute states. Memoization has worst-case $O(mn)$ time for positive m,n, with $\\Theta(mn)$ allocated space for a full cache, and $O(m+n)$ stack depth. A lazy memoized run need not visit every cell: matching strings may follow only diagonal states. Bottom-up tabulation, by contrast, fills every requested table entry.",
    explanation: "Optimal substructure explains which recurrence is correct; overlapping subproblems explains why storing recurrence results saves work. These are distinct properties.",
    rubric: [
      { criterion: "Identifies a repeated prefix pair and explains the limited number of distinct states.", marks: 1 },
      { criterion: "Describes cache lookup/store, zero base cases and an uncomputed-state marker.", marks: 1 },
      { criterion: "Compares potentially exponential naive time with O(mn) memoized worst-case time.", marks: 1 },
      { criterion: "Distinguishes lazy visited states from a full bottom-up table.", marks: 1 }
    ],
    hintSteps: ["The same pair (i,j) can be reached by deleting X first or deleting Y first.", "Zero is a legitimate LCS answer, so it cannot safely mean 'not computed'."],
    walkthroughSteps: ["Locate a repeated state in the recursion tree.", "Define the cache and base cases.", "Solve each encountered state at most once.", "Count distinct states and distinguish worst-case work from a particular run."],
    references: ["Lecture16-dynamic programming-part1.pdf, PDF pp. 14-20, overlapping subproblems and memoization"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "memoization", "lecture-example"]
  },
  {
    id: "alg-e1-dp-lcs-vs-edit",
    type: "free",
    difficulty: "med",
    prompt: "**Additional conceptual variation.** X=`a`, Y=`b`. Give the LCS length, the edit distance when insertion/deletion/replacement all cost 1, and the edit distance when replacement is forbidden. Explain why m+n−2L is not the unit-cost replacement distance in general, even though both problems use prefix tables.",
    sampleAnswer: "The LCS length is **0**. With replacement allowed, the distance is **1**: replace a by b. With only insertion/deletion, the distance is **2**: delete a and insert b. The formula $m+n-2L=2$ is the insertion/deletion-only distance: retain an LCS, delete the other $m-L$ source characters and insert the other $n-L$ target characters. A replacement costs 1 here, while one delete plus one insert costs 2, so the formula does not generally give unit-cost replacement distance. Shared prefix-table structure does not make the objectives or recurrences identical.",
    explanation: "LCS maximizes matched subsequence length; edit distance minimizes permitted operation costs. The edit-distance photo includes replacements, which must not be silently removed.",
    rubric: [
      { criterion: "Gives LCS 0, replacement distance 1 and insertion/deletion distance 2.", marks: 1 },
      { criterion: "Explains m+n−2L as deletion/insertion counts around a retained LCS.", marks: 1 },
      { criterion: "Explains why cost-1 replacement invalidates that identity in general.", marks: 1 }
    ],
    hintSteps: ["The two strings share no character.", "Compare the price of one replacement with delete followed by insert."],
    walkthroughSteps: ["Find the common-subsequence length.", "List the cheapest allowed edit script under each operation set.", "Relate the formula to retaining matched characters and explain the cost difference."],
    references: ["Additional practice connecting IMG_6612.jpg's edit distance with Lecture16-dynamic programming-part1.pdf, PDF pp. 3-9, LCS"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "edit-distance", "additional-practice"]
  },
  {
    id: "alg-e1-dp-subsequence",
    type: "free",
    difficulty: "easy",
    prompt: "For X=`ABCBDAB`, determine whether `BCBA` is a subsequence and whether it is a substring. Give matching positions if it is a subsequence. Explain why this distinction matters when solving the Lecture 16 LCS problem.",
    sampleAnswer: "`BCBA` is a **subsequence**, using 1-based positions **2,3,4,6** in X. It is **not a substring** because those characters do not occur together contiguously: the character at position 5 is D. LCS may skip characters while preserving order. A longest-common-substring algorithm would enforce contiguity and uses a different recurrence, so it does not solve the lecture's problem.",
    explanation: "A subsequence allows gaps; a substring does not. The table in Lecture 16 is for subsequences.",
    rubric: [
      { criterion: "Identifies BCBA as a subsequence and supplies increasing matching positions.", marks: 1 },
      { criterion: "Rejects the substring claim and explains the contiguity requirement.", marks: 1 }
    ],
    hintSteps: ["Scan left to right without rearranging characters.", "Check whether the selected positions are consecutive."],
    walkthroughSteps: ["Match B, C, B and A in increasing positions.", "Notice the skipped D.", "Apply the subsequence rather than substring requirement."],
    references: ["Lecture16-dynamic programming-part1.pdf, PDF pp. 3-4, LCS definition and BCBA example"],
    tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "lecture-example"]
  }
];
