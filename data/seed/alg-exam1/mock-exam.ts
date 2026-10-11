import type { QuizSet } from "@/lib/types";
import { dynamicProgrammingQuestions } from "./dynamic-programming";

const editTable = dynamicProgrammingQuestions.find((q) => q.id === "alg-e1-dp-edit-table")!;
const editTrace = dynamicProgrammingQuestions.find((q) => q.id === "alg-e1-dp-edit-traceback")!;
const lcsTable = dynamicProgrammingQuestions.find((q) => q.id === "alg-e1-dp-lcs-table")!;
const lcsTrace = dynamicProgrammingQuestions.find((q) => q.id === "alg-e1-dp-lcs-traceback")!;

export const algorithmsExam1Mock: QuizSet = {
  id: "alg-exam1-written-mock",
  courseId: "analysis-of-algorithms",
  title: "Algorithms Exam 1 — Written Practice Paper",
  description: "Six multipart questions, 100 marks and a 75-minute practice timer. Uses homework and lecture problems plus the supplied dynamic-programming review. The actual exam duration, format and coverage are unconfirmed. Show all reasoning; answers unlock after submission for rubric self-marking. Finish the sitting before refreshing or leaving the page.",
  difficulty: "Advanced",
  estMinutes: 75,
  timerDefaultMinutes: 75,
  mode: "exam",
  isExamSimulation: false,
  questionCountTarget: 6,
  fixedOrder: true,
  tags: ["exam-1", "algorithms", "written-mock"],
  questions: [
    {
      id: "alg-e1-mock-q1",
      type: "free",
      points: 15,
      difficulty: "med",
      prompt: "## Question 1 — Counting and growth (15 marks)\n\n(a) Assume n=2^k, k≥0. Count only the seven assignment instructions in the body, and give the exact count and a tight asymptotic bound.\n\n```text\nfor i = 1; i <= n; i *= 2:\n    for j = 1; j <= i; j++:\n        perform 7 assignment instructions\n```\n\n(b) Decide whether each claim is true and justify it with a constant or a ratio: $2^{n+1}=O(2^n)$; $2^{2n}=O(2^n)$.\n\n(c) Use Stirling's approximation to justify $\\lg(n!)=\\Theta(n\\lg n)$. All logarithms in this paper are base 2 unless stated otherwise.",
      sampleAnswer: "(a) The inner body executes $1+2+4+\\cdots+2^k=2^{k+1}-1=2n-1$ times. The exact assignment count is **7(2n−1)**, giving $\\Theta(n)$ body work. Loop bookkeeping is excluded by the question.\n\n(b) The first claim is true: $2^{n+1}=2\\cdot2^n$, so c=2 works. The second is false: $2^{2n}/2^n=2^n$ is unbounded, so no fixed c can bound the ratio for all sufficiently large n.\n\n(c) Stirling gives $n!=\\sqrt{2\\pi n}(n/e)^n(1+o(1))$. Taking logarithms, $\\lg(n!)=n\\lg n-n\\lg e+\\tfrac12\\lg(2\\pi n)+o(1)$. The $n\\lg n$ term dominates the linear and logarithmic terms, so the result is $\\Theta(n\\lg n)$.",
      explanation: "These are the exact counting, growth comparison and proof skills assigned in Homework 1. A tight bound requires summing the changing inner lengths, rather than multiplying by n at every outer iteration.",
      rubric: [
        { criterion: "(a) Sums 1+2+…+n to 2n−1, respecting n=2^k.", marks: 3 },
        { criterion: "(a) Gives 7(2n−1) assignments and Θ(n) body work.", marks: 2 },
        { criterion: "(b) Proves the first claim using constant factor 2.", marks: 2 },
        { criterion: "(b) Rejects the second claim using the unbounded ratio 2^n.", marks: 3 },
        { criterion: "(c) Takes logs of Stirling and explains dominance of n lg n.", marks: 5 }
      ],
      hintSteps: ["The inner loop lengths form a geometric series.", "For the Big-O claims, divide the proposed left side by 2^n."],
      walkthroughSteps: ["Count the body executions before multiplying by 7.", "Compare each exponential by its ratio to the proposed bound.", "Take logarithms of Stirling's approximation.", "Identify the dominating term and state the tight bound."],
      references: ["cs5381_assignment1_26fall.pdf, PDF pp. 1-2, Q1 first program, Q2 and Q3(a)"],
      tags: ["exam-1", "algorithms", "asymptotics", "loop-counting", "proof", "adapted-homework"]
    },
    {
      id: "alg-e1-mock-q2",
      type: "free",
      points: 20,
      difficulty: "hard",
      prompt: "## Question 2 — Recurrences (20 marks)\n\nAssume positive constant base costs. Ignore floors/ceilings by restricting n to the required powers.\n\n(a) Solve $T(n)=2T(n/4)+\\sqrt n$ using the basic three-case Master Theorem. Identify a,b, the comparison function and the case.\n\n(b) Solve $T(n)=2T(n/4)+n$ using the same theorem, including the regularity check.\n\n(c) Prove by substitution that $T(n)=T(n-1)+n$, T(1)=1, is $O(n^2)$. Give a concrete constant and verify the base case. Also state a tight bound, with a lower-bound justification.",
      sampleAnswer: "(a) a=2, b=4, and $n^{\\log_4 2}=\\sqrt n$. The nonrecursive work matches this function, so case 2 gives **$\\Theta(\\sqrt n\\log n)$**.\n\n(b) The same comparison function is $\\sqrt n$. Now f(n)=n is polynomially larger, by exponent gap 1/2. Regularity holds: $2f(n/4)=n/2\\le (1/2)f(n)$. Case 3 gives **$\\Theta(n)$**.\n\n(c) Claim $T(n)\\le n^2$ for n≥1. Base: T(1)=1≤1. Assuming $T(n-1)\\le(n-1)^2$,\n\n$$T(n)\\le(n-1)^2+n=n^2-n+1\\le n^2.$$\n\nThus c=1 proves $O(n^2)$. Unrolling gives $T(n)=\\sum_{i=1}^n i=n(n+1)/2$. Alternatively the last roughly n/2 summands are each at least n/2, giving $\\Omega(n^2)$. The tight bound is **$\\Theta(n^2)$**. The Master Theorem does not apply to the decrement-by-one recurrence.",
      explanation: "Identify the theorem's threshold, not just the largest-looking term. The substitution proof must establish the proposed bound and its base case.",
      rubric: [
        { criterion: "(a) Identifies a=2,b=4 and n^(log_4 2)=sqrt(n).", marks: 2 },
        { criterion: "(a) Uses case 2 and returns Θ(sqrt(n) log n).", marks: 4 },
        { criterion: "(b) Shows a polynomial gap, regularity factor 1/2, and Θ(n).", marks: 6 },
        { criterion: "(c) Gives a valid induction hypothesis, algebra and base case with c=1 or another valid constant.", marks: 5 },
        { criterion: "(c) Establishes Ω(n²) by summation or another valid argument and concludes Θ(n²).", marks: 3 }
      ],
      hintSteps: ["Compute n^(log_b a) before comparing f(n).", "In the induction, expand (n−1)²+n and check whether it is at most n²."],
      walkthroughSteps: ["Compute the shared Master-Theorem threshold.", "Apply case 2 to the matching work.", "Check polynomial separation and regularity for case 3.", "Prove the decrement recurrence by induction, then establish a matching lower bound."],
      references: ["cs5381_assignment1_26fall.pdf, PDF p. 2, Q4(a), Q6(b-c)", "Lecture6-Asymptotic notation-master theorem.pdf, PDF pp. 3-10"],
      tags: ["exam-1", "algorithms", "recurrences", "master-theorem", "substitution", "adapted-homework"]
    },
    {
      id: "alg-e1-mock-q3",
      type: "free",
      points: 20,
      difficulty: "hard",
      prompt: "## Question 3 — Partition and selection (20 marks)\n\n(a) Apply Lomuto PARTITION to the 1-based array A=[13,19,9,5,12,8,7,4,21,2,6,11]. Use the last element as pivot and the test A[j]≤pivot, starting i=0. Show the array after each successful test's exchange, then the final pivot exchange and returned index.\n\n(b) With this two-way partition, what is QUICKSORT's running time if all n elements are equal? Give the recurrence and a tight bound.\n\n(c) For deterministic median-of-medians selection with groups of 5 distinct elements, explain the guaranteed discard, give the standard worst-case upper-bound recurrence, and justify its linear bound by substitution. Ignore floor/ceiling and O(1) effects for this argument.",
      sampleAnswer: "(a) Pivot=11. Successful j values and resulting arrays:\n\n| j | i after increment | Array after exchange |\n|---|---|---|\n| 3 | 1 | [9,19,13,5,12,8,7,4,21,2,6,11] |\n| 4 | 2 | [9,5,13,19,12,8,7,4,21,2,6,11] |\n| 6 | 3 | [9,5,8,19,12,13,7,4,21,2,6,11] |\n| 7 | 4 | [9,5,8,7,12,13,19,4,21,2,6,11] |\n| 8 | 5 | [9,5,8,7,4,13,19,12,21,2,6,11] |\n| 10 | 6 | [9,5,8,7,4,2,19,12,21,13,6,11] |\n| 11 | 7 | [9,5,8,7,4,2,6,12,21,13,19,11] |\n\nSwap A[8] with A[12] to obtain **[9,5,8,7,4,2,6,11,21,13,19,12]**; return **q=8**. Failed tests do not change the array. Partition does not fully sort either side.\n\n(b) Every test succeeds, so the pivot returns at the right endpoint and only one subproblem shrinks by one. $T(n)=T(n-1)+\\Theta(n)$, hence **$\\Theta(n^2)$**. Equal values do not produce balanced partitions under this rule.\n\n(c) At least about half of the n/5 group medians are on each side of the pivot; each contributes at least three elements on that side. Thus at least 3n/10−O(1) elements can be excluded from either recursive search side. The standard bound is $T(n)\\le T(n/5)+T(7n/10)+dn$, up to rounding/constants. Under T(k)≤ck,\n\n$$T(n)\\le c(n/5+7n/10)+dn=(0.9c+d)n\\le cn$$\n\nwhen c≥10d, with c enlarged to cover base cases. Reading/partitioning costs Ω(n), so the algorithm is **Θ(n)**. The two recursive terms concern median selection and the retained partition, not two equal subproblems.",
      explanation: "Partition traces depend on a specified implementation. The linear-time selection proof relies on the recursive size fractions summing to less than one.",
      rubric: [
        { criterion: "(a) Shows the seven successful exchanges with the correct intermediate arrays.", marks: 6 },
        { criterion: "(a) Gives the final pivot exchange, final array and q=8.", marks: 3 },
        { criterion: "(b) Explains the n−1/0 split and derives Θ(n²) from T(n−1)+Θ(n).", marks: 4 },
        { criterion: "(c) Derives the 3n/10 discard and the n/5,7n/10 recurrence terms.", marks: 4 },
        { criterion: "(c) Uses the 0.9 fraction in a substitution proof, covers constants/base cases and explains Ω(n).", marks: 3 }
      ],
      hintSteps: ["The pivot remains at the last position until the final exchange.", "For selection, multiply half the group count by three guaranteed elements, then add the retained size fractions."],
      walkthroughSteps: ["Trace each successful partition comparison and exchange.", "Place the pivot at i+1.", "Analyze what the same ≤ rule does on equal elements.", "Count the median-of-medians discard and prove its recurrence bound by substitution."],
      references: ["CS5381_hw2.pdf, PDF pp. 1-2, Q1, Q2, Q4", "Lecture12-order-statistics.pdf, PDF pp. 23-29"],
      tags: ["exam-1", "algorithms", "quicksort", "partition", "selection", "adapted-homework"]
    },
    {
      "id": "alg-e1-mock-q4",
      "type": "free",
      "points": 10,
      "difficulty": "hard",
      "prompt": "## Question 4 — Overlap-Sort proof (10 marks)\n\nHomework 2's Overlap-Sort first orders the endpoints, then, for a subarray of length n>2, sets k=floor(n/3) and recursively sorts the first n−k entries, the last n−k entries, and the first n−k entries again.\n\n(a) Prove correctness by induction. Explain why the last k positions contain globally largest values after the second recursive call and remain in order during the third.\n\n(b) Give a worst-case recurrence, ignoring rounding for the asymptotic solution, and its tight bound. Compare the exponent with insertion sort, merge sort and quicksort's worst-case bounds.",
      "sampleAnswer": "(a) For n≤2, ordering the endpoints sorts the subarray. Assume correctness for all smaller lengths. For n>2, let k=floor(n/3)>0 and split the positions into A (first k), B (middle n−2k), C (last k). Since n−2k≥k, the middle block has at least k positions.\n\nThe first recursive call sorts A∪B. Every value in A is now at most every value in B. Therefore the globally largest k values can be chosen from B∪C: there are at least k values in B dominating all of A. The second recursive call sorts B∪C, placing those globally largest k values, in order, in C. The last call sorts A∪B and leaves C untouched. Every value left in A∪B is at most every value in C, so the full subarray is sorted. Equal values do not break these non-strict inequalities. Each recursive length n−k is less than n, so the induction applies.\n\n(b) $T(n)=3T(2n/3)+\\Theta(1)$, with constant base cost (the exact recursive size is $n-\\lfloor n/3\\rfloor$). Taking a=3,b=3/2, the Master Theorem gives **$\\Theta(n^{\\log_{3/2}3})\\approx\\Theta(n^{2.7095})$**. This grows faster than insertion sort's Θ(n²), merge sort's Θ(n log n), and standard quicksort's Θ(n²) worst case. The overlapping recursive strategy is asymptotically worse than all three.",
      "explanation": "This is Homework 2’s correctness-and-analysis exercise. The proof needs the overlap-size argument; merely saying all recursive pieces are sorted does not establish that the whole array is sorted.",
      "rubric": [
        {
          "criterion": "(a) Establishes the n≤2 base case and a smaller-input induction hypothesis.",
          "marks": 1
        },
        {
          "criterion": "(a) Splits A/B/C and uses |B|≥k plus the sorted A∪B relationship to justify globally largest k values in B∪C.",
          "marks": 3
        },
        {
          "criterion": "(a) Explains sorted largest values in C after call two and why call three completes the order without changing C.",
          "marks": 2
        },
        {
          "criterion": "(b) Gives the three-call recurrence and Θ(n^(log_(3/2)3)).",
          "marks": 2
        },
        {
          "criterion": "(b) Compares with all three correct worst-case bounds and concludes it is slower.",
          "marks": 2
        }
      ],
      "hintSteps": [
        "Split the array into the first k, middle n−2k, and last k positions.",
        "After the first sort, the middle block has at least k elements that dominate the first block."
      ],
      "walkthroughSteps": [
        "Prove the base cases and assume smaller calls sort correctly.",
        "Show the second call contains enough candidates for the largest k values.",
        "Fix the last block, then sort the remaining prefix.",
        "Solve the three-call recurrence and compare exponents."
      ],
      "references": [
        "CS5381_hw2.pdf, PDF p. 1, Q3(a-c), Overlapping Recursive Sorting Algorithm"
      ],
      "tags": [
        "exam-1",
        "algorithms",
        "correctness",
        "recurrences",
        "overlap-sort",
        "adapted-homework"
      ]
    },
    {
      id: "alg-e1-mock-q5",
      type: "free",
      points: 15,
      difficulty: "hard",
      prompt: "## Question 5 — Longest common subsequence (15 marks)\n\nFor X=`ABCBDAB`, Y=`BDCABA`:\n\n(a) Define c[i,j], give its base cases and recurrence, and fill the complete length table including empty prefixes.\n\n(b) Reconstruct an LCS. On mismatches, choose ↑ when the above and left values tie. State the visited coordinates and final subsequence.\n\n(c) Give the time and space for filling the full table and the worst-case time bound for traceback, with reasons.",
      sampleAnswer: "$c[i,j]$ is the LCS length of the first i and j characters. The boundaries are zero. Matching characters give $c[i-1,j-1]+1$; mismatches give $\\max(c[i-1,j],c[i,j-1])$.\n\n" + lcsTable.sampleAnswer + "\n\n" + lcsTrace.sampleAnswer + "\n\nFilling has Θ(mn) time and full-table space for positive m,n, with constant work per cell. Traceback has O(m+n) time because each move decreases i or j. It does not require reading every table cell.",
      explanation: "The two sequences and the up-on-tie reconstruction rule come directly from Lecture 16's worked example. Show the table and a valid reconstruction rather than only its final length.",
      rubric: [
        { criterion: "(a) Defines the prefix subproblem, zero boundaries and both correct recurrence branches.", marks: 3 },
        { criterion: "(a) Fills the complete numerical table correctly and obtains length 4.", marks: 6 },
        { criterion: "(b) Gives the specified up-on-tie traceback and BCBA.", marks: 3 },
        { criterion: "(c) Justifies Θ(mn) table time/space and O(m+n) traceback.", marks: 3 }
      ],
      hintSteps: ["Matches extend a diagonal solution; mismatches omit one endpoint.", "The tie rule determines which of several LCS strings is reconstructed."],
      walkthroughSteps: ["Define and initialize prefix states.", "Fill the table row by row.", "Trace the specified path backward and reconstruct BCBA.", "Count cells for filling and coordinate decreases for traceback."],
      references: lcsTable.references,
      tags: ["exam-1", "algorithms", "dynamic-programming", "lcs", "lecture-exercise"]
    },
    {
      id: "alg-e1-mock-q6",
      type: "free",
      points: 20,
      difficulty: "hard",
      prompt: "## Question 6 — Classroom edit-distance review (20 marks)\n\nTransform X=`esteban` into Y=`stephen`; insertion, deletion and replacement cost 1 and matching costs 0.\n\n(a) Define the prefix subproblem and give all boundaries and the recurrence.\n\n(b) Fill the full 8×8 distance-and-direction table. ↖ is match/replace, ↑ delete, ← insert. Choose ↖, then ↑, then ← on ties, or explain a different optimal tie choice. State the distance.\n\n(c) Give one optimal forward edit script, showing the string after every paid operation, and state the full-table time/space for general lengths m,n.",
      sampleAnswer: "$D[i,j]$ is the minimum cost to transform $X[1..i]$ into $Y[1..j]$. Set $D[i,0]=i$, $D[0,j]=j$. For positive i,j, take $\\min\\{D[i-1,j]+1,D[i,j-1]+1,D[i-1,j-1]+[X_i\\ne Y_j]\\}$.\n\n" + editTable.sampleAnswer + "\n\n" + editTrace.sampleAnswer + "\n\nThe full table needs Θ((m+1)(n+1)) time and space, or Θ(mn) for positive lengths. Each cell uses constant work; empty prefixes are included.",
      explanation: "This reproduces the directly observed classroom review input. The mock's scoring and timer are practice settings, while the strings and unit-cost distance are grounded in the photo.",
      rubric: [
        { criterion: "(a) Defines the subproblem and both correct boundary cases.", marks: 3 },
        { criterion: "(a) Gives all three correctly costed transitions in a minimum.", marks: 3 },
        { criterion: "(b) Fills the complete numerical distance table correctly, ending at 4.", marks: 6 },
        { criterion: "(b) Uses only optimal predecessor arrows with a stated consistent tie rule.", marks: 3 },
        { criterion: "(c) Shows a valid four-edit forward script and its intermediate strings.", marks: 3 },
        { criterion: "(c) Gives and justifies full-table time/space, including empty inputs.", marks: 2 }
      ],
      hintSteps: ["The empty-prefix boundaries count required insertions or deletions.", "A matching diagonal costs zero, a replacement costs one, and the traceback finds operations backward."],
      walkthroughSteps: ["Define the prefix cost and initialize the boundaries.", "Fill all cells by minimum predecessor cost.", "Read the bottom-right distance and reconstruct a script.", "Verify the script and count full-table work and storage."],
      references: editTable.references,
      tags: ["exam-1", "algorithms", "dynamic-programming", "edit-distance", "class-review"]
    }
  ]
};
