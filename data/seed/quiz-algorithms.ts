import type { QuizSet } from "@/lib/types";

/**
 * Analysis of Algorithms (CS-5381) — Fall 2026.
 *
 * Graduate algorithms: asymptotic analysis and recurrences first, then the
 * design paradigms (divide-and-conquer, greedy, dynamic programming) and
 * graph algorithms, finishing at reductions and NP-completeness.
 */
export const algorithmsQuizSets: QuizSet[] = [
  {
    id: "algo-asymptotics-recurrences",
    courseId: "analysis-of-algorithms",
    title: "Asymptotics, Recurrences & Divide-and-Conquer",
    description:
      "Growth rates, the master theorem, recursion trees, and the divide-and-conquer analyses these courses open with.",
    difficulty: "Advanced",
    estMinutes: 30,
    tags: ["asymptotics", "recurrences", "master-theorem", "divide-and-conquer"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "algo-ar-q1",
        type: "single",
        prompt:
          "Which statement about $O$, $\\Omega$ and $\\Theta$ is correct?",
        options: [
          "$f(n) = \\Theta(g(n))$ if and only if $f(n) = O(g(n))$ and $f(n) = \\Omega(g(n))$",
          "$f(n) = O(g(n))$ means $f$ grows strictly slower than $g$",
          "$\\Omega$ describes the worst case and $O$ describes the best case",
          "If $f(n) = O(g(n))$ then $g(n) = O(f(n))$"
        ],
        correct: [0],
        explanation:
          "$\\Theta$ is exactly the intersection of $O$ (asymptotic upper bound) and $\\Omega$ (asymptotic lower bound). The other options confuse bounds with cases: $O$ and $\\Omega$ bound a *function*, while best/worst case decides *which function* you are bounding.",
        walkthroughSteps: [
          "$f(n) = O(g(n))$: there exist $c > 0$ and $n_0$ with $f(n) \\le c\\,g(n)$ for all $n \\ge n_0$ — an upper bound, and it need not be tight.",
          "$f(n) = \\Omega(g(n))$: same shape with $f(n) \\ge c\\,g(n)$ — a lower bound.",
          "$\\Theta$ requires both, which is why it is the 'tight' bound.",
          "The classic trap is option C. Worst case and upper bound are independent ideas: you can perfectly well state a $\\Omega$ bound on the worst case, or an $O$ bound on the best case."
        ],
        tags: ["asymptotics", "big-o", "definitions"]
      },
      {
        id: "algo-ar-q2",
        type: "single",
        prompt:
          "Solve $T(n) = 2T(n/2) + \\Theta(n)$ with the master theorem.",
        options: ["$\\Theta(n \\log n)$", "$\\Theta(n)$", "$\\Theta(n^2)$", "$\\Theta(\\log n)$"],
        correct: [0],
        explanation:
          "With $a = 2$, $b = 2$, we get $n^{\\log_b a} = n^1$. The driving function $\\Theta(n)$ matches $n^{\\log_b a}$, which is case 2, giving $\\Theta(n^{\\log_b a} \\log n) = \\Theta(n \\log n)$ — merge sort's running time.",
        walkthroughSteps: [
          "Identify $a = 2$ subproblems of size $n/b = n/2$, plus $f(n) = \\Theta(n)$ work to divide and combine.",
          "Compute the watershed function $n^{\\log_b a} = n^{\\log_2 2} = n$.",
          "Compare $f(n) = \\Theta(n)$ against $n^{\\log_b a} = n$: they are the same order, so case 2 applies.",
          "Case 2 gives $T(n) = \\Theta(n^{\\log_b a} \\log n) = \\Theta(n \\log n)$.",
          "Sanity check with the recursion tree: $\\log_2 n$ levels, each doing $\\Theta(n)$ total work."
        ],
        tags: ["recurrences", "master-theorem", "merge-sort"]
      },
      {
        id: "algo-ar-q3",
        type: "single",
        prompt:
          "Solve $T(n) = 3T(n/4) + n^2$.",
        options: [
          "$\\Theta(n^2)$",
          "$\\Theta(n^{\\log_4 3})$",
          "$\\Theta(n^2 \\log n)$",
          "$\\Theta(n^{\\log_3 4})$"
        ],
        correct: [0],
        explanation:
          "$n^{\\log_4 3} \\approx n^{0.79}$, and $f(n) = n^2$ grows polynomially faster. The regularity condition holds ($3(n/4)^2 = \\tfrac{3}{16}n^2 \\le c\\,n^2$ for $c = 3/16 < 1$), so case 3 gives $\\Theta(n^2)$ — the root dominates.",
        walkthroughSteps: [
          "$a = 3$, $b = 4$, so $n^{\\log_b a} = n^{\\log_4 3} \\approx n^{0.792}$.",
          "$f(n) = n^2$ is polynomially larger than $n^{0.792}$, which points at case 3.",
          "Case 3 also needs regularity: $a f(n/b) \\le c f(n)$ for some $c < 1$. Here $3(n/4)^2 = \\tfrac{3}{16} n^2$, so $c = 3/16$ works.",
          "Therefore $T(n) = \\Theta(f(n)) = \\Theta(n^2)$ — almost all the work happens at the top level."
        ],
        tags: ["recurrences", "master-theorem", "case-3"]
      },
      {
        id: "algo-ar-q4",
        type: "single",
        prompt:
          "Why does the master theorem **not** apply to $T(n) = 2T(n/2) + n \\log n$?",
        options: [
          "$f(n)$ is larger than $n^{\\log_b a}$ but not *polynomially* larger, so it falls in the gap between cases 2 and 3",
          "The master theorem requires $f(n)$ to be a polynomial",
          "$a$ must be strictly greater than $b$",
          "The recurrence has no base case"
        ],
        correct: [0],
        explanation:
          "Here $n^{\\log_b a} = n$ and $f(n) = n\\log n$. The ratio is $\\log n$, which is smaller than any $n^{\\varepsilon}$, so $f$ is not polynomially larger and case 3 does not apply — nor is it $\\Theta(n)$, so case 2 does not either. A recursion tree gives $\\Theta(n \\log^2 n)$.",
        walkthroughSteps: [
          "Compute $n^{\\log_2 2} = n$ and compare with $f(n) = n \\log n$.",
          "Case 3 needs $f(n) = \\Omega(n^{\\log_b a + \\varepsilon})$ for some $\\varepsilon > 0$ — that is, larger by a *polynomial* factor.",
          "$\\frac{n \\log n}{n} = \\log n$, and $\\log n = o(n^{\\varepsilon})$ for every $\\varepsilon > 0$, so no such $\\varepsilon$ exists.",
          "Fall back to a recursion tree: level $i$ contributes $n \\log(n/2^i)$, and summing over $\\log n$ levels gives $\\Theta(n \\log^2 n)$."
        ],
        tags: ["recurrences", "master-theorem", "gap-case"]
      },
      {
        id: "algo-ar-q5",
        type: "multi",
        prompt:
          "Select every statement that is true about **randomised quicksort**.",
        options: [
          "Its expected running time is $\\Theta(n \\log n)$",
          "Its worst-case running time is $\\Theta(n^2)$",
          "The randomisation makes the worst case impossible",
          "Its expected running time does not depend on the input ordering",
          "It sorts in place, using $O(\\log n)$ expected additional stack space"
        ],
        correct: [0, 1, 3, 4],
        explanation:
          "Randomisation moves the bad case from *particular inputs* to *unlucky coin flips* — it does not eliminate it. The worst case is still $\\Theta(n^2)$; it just no longer corresponds to any fixed adversarial input, which is exactly why the expectation is input-independent.",
        walkthroughSteps: [
          "Expected time: each pair of elements is compared at most once, and summing the comparison probabilities gives $O(n \\log n)$.",
          "Worst case: every pivot could still be the minimum, giving $n + (n-1) + \\dots = \\Theta(n^2)$. The probability is tiny, but it is not zero.",
          "Because the pivot is chosen randomly rather than by position, no *fixed* input is bad — that is the whole point of randomising, and why option D holds.",
          "Space: partitioning is in place, and recursing on the smaller side first bounds the stack at $O(\\log n)$ expected."
        ],
        tags: ["divide-and-conquer", "quicksort", "randomised"]
      },
      {
        id: "algo-ar-q6",
        type: "single",
        prompt:
          "A comparison-based sort cannot beat $\\Omega(n \\log n)$. What is the argument?",
        options: [
          "The decision tree has $n!$ leaves, so its height is at least $\\log_2(n!) = \\Omega(n \\log n)$",
          "Every comparison sort must examine all $n^2$ pairs",
          "Merge sort is optimal, so nothing can be faster",
          "Sorting requires reading the input $\\log n$ times"
        ],
        correct: [0],
        explanation:
          "Model the algorithm as a binary decision tree whose leaves are the possible permutations. There are $n!$ of them, a binary tree of height $h$ has at most $2^h$ leaves, so $h \\ge \\log_2(n!)$, and Stirling gives $\\log_2(n!) = \\Theta(n \\log n)$.",
        walkthroughSteps: [
          "Each comparison has two outcomes, so an execution is a root-to-leaf path in a binary tree.",
          "The algorithm must be able to produce every one of the $n!$ orderings, so the tree needs at least $n!$ leaves.",
          "A binary tree of height $h$ has at most $2^h$ leaves, hence $2^h \\ge n!$ and $h \\ge \\log_2(n!)$.",
          "By Stirling, $\\log_2(n!) = \\Theta(n \\log n)$, so the worst case takes $\\Omega(n \\log n)$ comparisons.",
          "Note the scope of the claim: counting sort and radix sort beat this bound precisely because they do not decide by comparison."
        ],
        tags: ["lower-bounds", "decision-tree", "sorting"]
      },
      {
        id: "algo-ar-q7",
        type: "free",
        prompt:
          "Solve $T(n) = T(n/3) + T(2n/3) + n$ using a recursion tree, and state the resulting bound with justification.",
        explanation:
          "Every level does $n$ work; the tree is unbalanced, so the shortest root-to-leaf path has length $\\log_3 n$ and the longest $\\log_{3/2} n$. That bounds the total between $n\\log_3 n$ and $n\\log_{3/2} n$, both $\\Theta(n \\log n)$.",
        sampleAnswer:
          "$T(n) = \\Theta(n \\log n)$. Each level sums to $n$ because the subproblem sizes at a level add back to $n$. The tree's depth is between $\\log_3 n$ and $\\log_{3/2} n$, so the total is between $n \\log_3 n$ and $n \\log_{3/2} n$; both are $\\Theta(n\\log n)$, so the bound is tight.",
        hintSteps: [
          "Draw two or three levels and add up the work at each level before worrying about depth.",
          "The two subproblem sizes at each level sum back to $n$ — so what is the work per level?",
          "The tree is lopsided: one branch shrinks by $1/3$ each time, the other by $2/3$. Those give different depths.",
          "Sandwich the answer between the shortest and longest paths, then note both are $\\Theta(\\log n)$ since the bases differ only by a constant factor."
        ],
        walkthroughSteps: [
          "Level 0 does $n$ work. Level 1 has subproblems $n/3$ and $2n/3$, which sum to $n$ again — and this holds at every level until branches bottom out.",
          "Shortest path: repeatedly take the $n/3$ branch, reaching a leaf after about $\\log_3 n$ levels.",
          "Longest path: repeatedly take the $2n/3$ branch, reaching a leaf after about $\\log_{3/2} n$ levels.",
          "So $n \\log_3 n \\le T(n) \\le n \\log_{3/2} n$ up to constants.",
          "Changing logarithm base is a constant factor, so both ends are $\\Theta(n \\log n)$ and the bound is tight.",
          "This is the standard analysis of quicksort under a guaranteed constant-fraction split — the split need not be even, only balanced by a fixed ratio."
        ],
        tags: ["recurrences", "recursion-tree", "unbalanced"]
      },
      {
        id: "algo-ar-q8",
        type: "single",
        prompt:
          "Strassen multiplies two $n \\times n$ matrices with 7 recursive multiplications of $n/2$ blocks plus $\\Theta(n^2)$ additions. What is its running time?",
        options: [
          "$\\Theta(n^{\\log_2 7}) \\approx \\Theta(n^{2.81})$",
          "$\\Theta(n^3)$",
          "$\\Theta(n^2 \\log n)$",
          "$\\Theta(n^{7/2})$"
        ],
        correct: [0],
        explanation:
          "$T(n) = 7T(n/2) + \\Theta(n^2)$. Here $n^{\\log_2 7} \\approx n^{2.807}$ dominates $n^2$ polynomially, so case 1 of the master theorem gives $\\Theta(n^{\\log_2 7})$ — asymptotically better than the naive $\\Theta(n^3)$.",
        walkthroughSteps: [
          "Read the recurrence straight off the description: $a = 7$, $b = 2$, $f(n) = \\Theta(n^2)$.",
          "$n^{\\log_b a} = n^{\\log_2 7} \\approx n^{2.807}$.",
          "$f(n) = \\Theta(n^2)$ is polynomially *smaller*, so case 1 applies and the leaves dominate.",
          "$T(n) = \\Theta(n^{\\log_2 7})$.",
          "Worth stating out loud in an exam: the saving comes from trading one multiplication for extra additions, and the constant factor is bad enough that it only pays off for large $n$."
        ],
        tags: ["divide-and-conquer", "strassen", "master-theorem"]
      }
    ]
  },
  {
    id: "algo-greedy-dp-graphs",
    courseId: "analysis-of-algorithms",
    title: "Greedy, Dynamic Programming & Graphs",
    description:
      "When greedy is provably correct, how to recognise optimal substructure, and the graph algorithms that follow from both.",
    difficulty: "Advanced",
    estMinutes: 32,
    tags: ["greedy", "dynamic-programming", "graphs", "shortest-paths"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "algo-gd-q1",
        type: "single",
        prompt:
          "Which pair of properties must hold for a greedy algorithm to be provably optimal?",
        options: [
          "The greedy-choice property and optimal substructure",
          "Optimal substructure and overlapping subproblems",
          "The greedy-choice property and overlapping subproblems",
          "Memoisation and optimal substructure"
        ],
        correct: [0],
        explanation:
          "Greedy needs the **greedy-choice property** (a globally optimal solution can be reached by making the locally best choice) plus **optimal substructure**. Overlapping subproblems is the hallmark of dynamic programming, not greedy — greedy never revisits a subproblem.",
        walkthroughSteps: [
          "Optimal substructure: an optimal solution contains optimal solutions to its subproblems. Both greedy and DP need this.",
          "The greedy-choice property is the extra ingredient: you can commit to the locally best option without looking ahead, and still reach a global optimum.",
          "Overlapping subproblems is what makes DP *worth it* — the same subproblem recurs, so you memoise. Greedy solves one chain of subproblems and never revisits.",
          "Exam habit: to justify a greedy algorithm, give an exchange argument — take any optimal solution, swap in the greedy choice, and show it is no worse."
        ],
        tags: ["greedy", "proof-technique", "definitions"]
      },
      {
        id: "algo-gd-q2",
        type: "single",
        prompt:
          "For the activity-selection problem, which greedy rule is provably optimal?",
        options: [
          "Repeatedly pick the compatible activity with the earliest finish time",
          "Repeatedly pick the shortest activity",
          "Repeatedly pick the activity with the earliest start time",
          "Repeatedly pick the activity overlapping the fewest others"
        ],
        correct: [0],
        explanation:
          "Earliest finish time is the rule with an exchange-argument proof: it leaves the maximum amount of remaining time for everything after it. Shortest-first and earliest-start-first both have easy counterexamples.",
        walkthroughSteps: [
          "Sort by finish time and repeatedly take the first activity compatible with what you have already chosen.",
          "Exchange argument: let $O$ be an optimal solution and $a_1$ the earliest-finishing activity. Replacing $O$'s first activity with $a_1$ keeps it feasible and the same size, so some optimal solution starts with $a_1$.",
          "Induct on the remaining subproblem, which is the same problem on the activities starting after $a_1$ finishes.",
          "Counterexample for shortest-first: one short activity straddling the boundary between two long compatible ones knocks both out.",
          "Counterexample for earliest-start: an activity that starts first but runs the whole day blocks everything else."
        ],
        tags: ["greedy", "activity-selection", "exchange-argument"]
      },
      {
        id: "algo-gd-q3",
        type: "single",
        prompt:
          "Why does Dijkstra's algorithm fail on graphs with negative edge weights?",
        options: [
          "Finalising a vertex assumes no later path can be shorter, which a negative edge can violate",
          "The priority queue cannot store negative keys",
          "It would loop forever on any negative edge",
          "Negative weights make the graph disconnected"
        ],
        correct: [0],
        explanation:
          "Dijkstra's correctness rests on the invariant that once a vertex is extracted with the minimum tentative distance, that distance is final. A negative edge can reduce the cost of a path discovered later, breaking the invariant. Bellman–Ford relaxes $|V|-1$ times instead and handles negatives.",
        walkthroughSteps: [
          "Dijkstra extracts the closest unfinalised vertex and never reconsiders it.",
          "That is sound only if extending any path can never decrease its cost — which requires non-negative weights.",
          "With a negative edge, a longer-looking route can later become cheaper, and the finalised value is already wrong.",
          "Bellman–Ford makes no such assumption: it relaxes every edge $|V|-1$ times, so it costs $O(VE)$ but tolerates negative weights and can report a negative cycle on one extra pass."
        ],
        tags: ["graphs", "dijkstra", "shortest-paths"]
      },
      {
        id: "algo-gd-q4",
        type: "multi",
        prompt:
          "Select every problem for which a **dynamic programming** solution is the standard approach.",
        options: [
          "0/1 knapsack",
          "Longest common subsequence",
          "Matrix-chain multiplication ordering",
          "Finding a minimum spanning tree",
          "All-pairs shortest paths via Floyd–Warshall"
        ],
        correct: [0, 1, 2, 4],
        explanation:
          "0/1 knapsack, LCS, matrix-chain and Floyd–Warshall all have overlapping subproblems and optimal substructure. Minimum spanning tree is the classic greedy problem — Kruskal and Prim are both greedy and both provably optimal via the cut property.",
        walkthroughSteps: [
          "0/1 knapsack: subproblems over (item index, remaining capacity); the fractional variant is greedy, the 0/1 variant is not.",
          "LCS: subproblems over prefix pairs, $\\Theta(mn)$ table.",
          "Matrix-chain: subproblems over intervals $[i, j]$, choosing a split point.",
          "Floyd–Warshall: subproblems indexed by the highest intermediate vertex allowed, $\\Theta(V^3)$.",
          "MST is greedy: the cut property guarantees the minimum edge crossing any cut is safe, which is what Kruskal and Prim each exploit."
        ],
        tags: ["dynamic-programming", "greedy", "classification"]
      },
      {
        id: "algo-gd-q5",
        type: "single",
        prompt:
          "What is the running time of the standard 0/1 knapsack DP on $n$ items with capacity $W$, and why is it not polynomial?",
        options: [
          "$\\Theta(nW)$ — pseudo-polynomial, because $W$ is exponential in the number of bits used to write it",
          "$\\Theta(n \\log W)$ — polynomial",
          "$\\Theta(2^n)$ — exponential in the item count",
          "$\\Theta(n^2 W)$ — polynomial in both inputs"
        ],
        correct: [0],
        explanation:
          "The table has $n \\times W$ cells and each takes constant time, so the running time is $\\Theta(nW)$. That is *pseudo-polynomial*: the input encodes $W$ in $\\Theta(\\log W)$ bits, so the runtime is exponential in the input **size** even though it looks linear in $W$.",
        walkthroughSteps: [
          "Fill a table indexed by item $i$ and capacity $w$, each entry a max of two previously computed entries.",
          "$n \\cdot W$ entries at $O(1)$ each gives $\\Theta(nW)$.",
          "Now count input size: writing $W$ takes about $\\log_2 W$ bits, so $W = 2^{\\log_2 W}$ is exponential in that.",
          "Hence 'pseudo-polynomial' — polynomial in the numeric *value*, exponential in the encoding *length*. This is why 0/1 knapsack being NP-hard is not contradicted by this algorithm."
        ],
        tags: ["dynamic-programming", "knapsack", "complexity"]
      },
      {
        id: "algo-gd-q6",
        type: "single",
        prompt:
          "To show a problem $X$ is NP-hard, what must you do?",
        options: [
          "Reduce a known NP-hard problem **to** $X$ in polynomial time",
          "Reduce $X$ to a known NP-hard problem in polynomial time",
          "Show $X$ is in NP and give an exponential algorithm",
          "Show no polynomial algorithm for $X$ has ever been published"
        ],
        correct: [0],
        explanation:
          "The direction is the whole point: known-hard $\\le_p X$. That says $X$ is at least as hard as something already known to be hard. Reducing the other way would only show $X$ is no harder than a hard problem, which proves nothing.",
        walkthroughSteps: [
          "Write it as $A \\le_p X$ where $A$ is already known NP-hard (3-SAT, vertex cover, and so on).",
          "The reduction maps any instance of $A$ into an instance of $X$ in polynomial time, preserving yes/no answers.",
          "If $X$ had a polynomial algorithm, composing it with the reduction would solve $A$ in polynomial time — so $X$ cannot be easy unless $A$ is.",
          "For NP-**complete** you additionally show $X \\in$ NP, usually by exhibiting a certificate verifiable in polynomial time.",
          "Getting the direction backwards is the single most common error on this topic."
        ],
        tags: ["np-completeness", "reductions", "proof-technique"]
      },
      {
        id: "algo-gd-q7",
        type: "free",
        prompt:
          "Give the recurrence for the longest common subsequence of $X_{1..m}$ and $Y_{1..n}$, state the table size and running time, and explain how to recover the subsequence itself.",
        explanation:
          "Standard LCS DP: match characters to extend diagonally, otherwise take the better of dropping one character from either string. $\\Theta(mn)$ time and space, with the actual subsequence recovered by walking the table backwards.",
        sampleAnswer:
          "$c[i][j] = 0$ if $i = 0$ or $j = 0$; $c[i-1][j-1] + 1$ if $x_i = y_j$; otherwise $\\max(c[i-1][j], c[i][j-1])$. The table is $(m+1) \\times (n+1)$, filled in $\\Theta(mn)$ time and $\\Theta(mn)$ space. To recover the subsequence, start at $c[m][n]$ and walk backwards: on a character match move diagonally and prepend the character, otherwise move toward the larger of $c[i-1][j]$ and $c[i][j-1]$. That walk is $O(m+n)$.",
        hintSteps: [
          "Define the subproblem precisely first: $c[i][j]$ is the LCS length of the prefixes $X_{1..i}$ and $Y_{1..j}$.",
          "Split on whether the last two characters match — that is the only case distinction you need.",
          "If they match, the match is safe to take. If they do not, one of the two characters cannot be in the LCS.",
          "For recovery, remember which choice each cell made — either store a pointer or re-derive it from the neighbouring values."
        ],
        walkthroughSteps: [
          "Subproblem: $c[i][j] = |\\mathrm{LCS}(X_{1..i}, Y_{1..j})|$.",
          "Base case: either prefix empty gives $0$.",
          "Match case $x_i = y_j$: the LCS ends with that character, so $c[i][j] = c[i-1][j-1] + 1$.",
          "Mismatch: the LCS cannot use both, so drop one and take the better: $\\max(c[i-1][j], c[i][j-1])$.",
          "Fill row by row; each of the $\\Theta(mn)$ cells is $O(1)$, so $\\Theta(mn)$ time.",
          "Space can drop to $\\Theta(\\min(m,n))$ if you only need the length, since each row depends only on the one above — but recovering the sequence needs the full table or Hirschberg's divide-and-conquer trick.",
          "Recovery: from $c[m][n]$, move diagonally on a match (prepending the character), otherwise toward the larger neighbour, until an index hits zero."
        ],
        tags: ["dynamic-programming", "lcs", "traceback"]
      },
      {
        id: "algo-gd-q8",
        type: "single",
        prompt:
          "Kruskal's algorithm runs in $O(E \\log E)$. Which step dominates, and what data structure makes the rest fast?",
        options: [
          "Sorting the edges dominates; a disjoint-set union-find keeps cycle checks near-constant",
          "The cycle check dominates; a min-heap keeps sorting fast",
          "Building the adjacency list dominates; a hash map keeps lookups constant",
          "Both steps are $\\Theta(E \\log E)$, so neither dominates"
        ],
        correct: [0],
        explanation:
          "Sorting $E$ edges is $O(E \\log E)$. Each of the $E$ cycle checks is a union-find find/union, which with union by rank and path compression is $O(\\alpha(V))$ — effectively constant — so the sort is the bottleneck.",
        walkthroughSteps: [
          "Kruskal sorts all edges by weight, then adds each edge whose endpoints are in different components.",
          "Sorting: $O(E \\log E)$, and since $E \\le V^2$ this is also $O(E \\log V)$.",
          "Cycle check: 'are these two vertices already connected?' is exactly disjoint-set find.",
          "With union by rank and path compression, $E$ operations cost $O(E\\,\\alpha(V))$, where $\\alpha$ is the inverse Ackermann function and never exceeds about 4 in practice.",
          "So the sort dominates. If the edges arrive pre-sorted, Kruskal becomes near-linear."
        ],
        tags: ["graphs", "mst", "kruskal", "union-find"]
      }
    ]
  }
];
