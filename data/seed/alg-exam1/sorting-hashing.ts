import type { Question } from "@/lib/types";

// Source references use physical PDF pages; sampleAnswer contains the complete self-marking model.
export const sortingHashingQuestions: Question[] = [
  {
    "id": "alg-e1-sh-01",
    "type": "free",
    "prompt": "Homework 2, Q1. Apply PARTITION(A,1,12) to A = [13,19,9,5,12,8,7,4,21,2,6,11]. Show the initial array, the array and i after EVERY loop iteration (even unchanged iterations), the final pivot swap, and the returned index. This asks for one partition, not a complete sort.\n\nUse 1-based Lomuto PARTITION, including self-swaps:\n```text\nx = A[r]; i = p - 1\nfor j = p to r - 1:\n    if A[j] <= x:\n        i = i + 1\n        exchange A[i] and A[j]\nexchange A[i+1] and A[r]\nreturn i+1\n```",
    "sampleAnswer": "Initially `x=11`, `i=0`, A=`[13,19,9,5,12,8,7,4,21,2,6,11]`.\n\n| j just processed | i after iteration | Entire array |\n|---:|---:|---|\n| 1 | 0 | `[13, 19, 9, 5, 12, 8, 7, 4, 21, 2, 6, 11]` |\n| 2 | 0 | `[13, 19, 9, 5, 12, 8, 7, 4, 21, 2, 6, 11]` |\n| 3 | 1 | `[9, 19, 13, 5, 12, 8, 7, 4, 21, 2, 6, 11]` |\n| 4 | 2 | `[9, 5, 13, 19, 12, 8, 7, 4, 21, 2, 6, 11]` |\n| 5 | 2 | `[9, 5, 13, 19, 12, 8, 7, 4, 21, 2, 6, 11]` |\n| 6 | 3 | `[9, 5, 8, 19, 12, 13, 7, 4, 21, 2, 6, 11]` |\n| 7 | 4 | `[9, 5, 8, 7, 12, 13, 19, 4, 21, 2, 6, 11]` |\n| 8 | 5 | `[9, 5, 8, 7, 4, 13, 19, 12, 21, 2, 6, 11]` |\n| 9 | 5 | `[9, 5, 8, 7, 4, 13, 19, 12, 21, 2, 6, 11]` |\n| 10 | 6 | `[9, 5, 8, 7, 4, 2, 19, 12, 21, 13, 6, 11]` |\n| 11 | 7 | `[9, 5, 8, 7, 4, 2, 6, 12, 21, 13, 19, 11]` |\n\nFinally swap A[8]=12 with A[12]=11, giving `[9, 5, 8, 7, 4, 2, 6, 11, 21, 13, 19, 12]`. Return **q=8**. Positions 1..7 are <=11; positions 9..12 are >11. Neither side needs to be internally sorted.",
    "explanation": "The assignment leaves p,r implicit; this version explicitly partitions the entire array with the slide’s last-element pivot and <= comparison. The final high-side order is 21,13,19,12.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q1)",
      "Lecture9-quicksort.pdf, PDF page 5 (PARTITION)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "partition",
      "quicksort"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct pivot, initialization, and <= convention",
        "marks": 2
      },
      {
        "criterion": "All 11 intermediate arrays and corresponding i values, including unchanged iterations",
        "marks": 6
      },
      {
        "criterion": "Correct final array and returned 1-based index q=8",
        "marks": 2
      }
    ],
    "hintSteps": [
      "The pivot stays at position 12 during the loop. Initially the low region is empty.",
      "Increment i only when A[j] <= 11, and swap the CURRENT array entries, not their original values."
    ],
    "walkthroughSteps": [
      "Fix x=11 and i=0.",
      "For each j=1..11, extend the low region only on a <=11 comparison; record unchanged iterations too.",
      "After j=11, i=7; swap positions 8 and 12 and return 8."
    ]
  },
  {
    "id": "alg-e1-sh-02",
    "type": "free",
    "prompt": "Homework 2, Q2. QUICKSORT uses the Lomuto PARTITION below and recursively sorts A[p..q-1] and A[q+1..r] whenever p<r. All n keys are equal. Derive the running time, partition comparison count, and recursion depth. Would choosing the pivot uniformly at random fix this case without changing PARTITION?\n\nUse 1-based Lomuto PARTITION, including self-swaps:\n```text\nx = A[r]; i = p - 1\nfor j = p to r - 1:\n    if A[j] <= x:\n        i = i + 1\n        exchange A[i] and A[j]\nexchange A[i+1] and A[r]\nreturn i+1\n```",
    "sampleAnswer": "Every test `A[j] <= x` succeeds. On an m-element call, i finishes at r-1 and q=r, so the recursive sizes are m-1 and 0. Therefore `T(n)=T(n-1)+Θ(n)` with constant bases, and **T(n)=Θ(n²)**. The partition loop makes `(n-1)+(n-2)+...+1 = n(n-1)/2` key comparisons. The longest recursive chain has Θ(n) depth (n-1 nontrivial partition calls). Randomly choosing an equal-valued pivot leaves the same split, so this implementation is still Θ(n²). A three-way partition separating less/equal/greater could avoid recursing on the equal block and give Θ(n) for this special input.",
    "explanation": "Equal keys are all placed on the low side by <=. Random pivots help distinct-key inputs on average, but do not cure this duplicate-key degeneracy.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q2)",
      "Lecture9-quicksort.pdf, PDF page 5 (<= partition)",
      "Lecture9-quicksort.pdf, PDF page 8 (worst splits)"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "quicksort",
      "duplicates",
      "recurrence"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Shows q=r and recursive sizes n-1,0",
        "marks": 3
      },
      {
        "criterion": "Derives Θ(n²) and n(n-1)/2 partition comparisons",
        "marks": 4
      },
      {
        "criterion": "Explains Θ(n) depth and why randomizing equal pivots does not help",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Run the <= test on an array whose entries all equal the pivot.",
      "Count work over subarray lengths n,n-1,...,2."
    ],
    "walkthroughSteps": [
      "Every scanned key extends the low side, placing q at r.",
      "Write a one-sided recurrence and sum m-1 comparisons per call.",
      "Separate changing the pivot selection from changing the duplicate-handling partition rule."
    ]
  },
  {
    "id": "alg-e1-sh-03",
    "type": "free",
    "prompt": "Homework 2, Q3(a). Prove by strong induction that Overlap-Sort(A,1,n) sorts every nonempty array, allowing duplicates. Treat p,r as inclusive 1-based indices. Explain why sorting the overlapping prefix, suffix, and prefix again establishes the order across their boundary; merely saying all recursive calls sort is insufficient.\n\n```text\nOverlap-Sort(A,p,r):\n    if A[p] > A[r]: exchange A[p] and A[r]\n    if p+1 < r:\n        k = floor((r-p+1)/3)\n        Overlap-Sort(A,p,r-k)\n        Overlap-Sort(A,p+k,r)\n        Overlap-Sort(A,p,r-k)\n```",
    "sampleAnswer": "Base cases: n=1 is already sorted; for n=2 the endpoint comparison orders the pair. For n>=3, let k=floor(n/3). Split the array into consecutive blocks L,M,R with lengths k,n-2k,k. Each recursive call has size n-k<n, and |M|=n-2k>=k. Assume all smaller calls sort correctly.\n\nAfter the first call sorts L∪M, every L key is <= every M key. Let b be the maximum key currently in L. At least |M|>=k suffix keys are >=b. The second call sorts M∪R, so its largest k keys occupy R. Consequently every R key is >=b, hence >=every L key. Its sorted suffix also gives every new M key <=every R key. Thus every key in the prefix L∪M is <=every R key.\n\nThe third call sorts L∪M without changing R. Since R was internally sorted by the second call and all prefix keys remain <=all R keys, the full array is sorted. This proves the inductive step. The preliminary endpoint swap for n>=3 changes the input but the argument applies to any input order; it also supplies the n=2 base case.",
    "explanation": "The essential fact is that the overlap has at least k keys. Those keys force the final suffix block to dominate the untouched first block after the second call.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q3(a))"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "overlap-sort",
      "correctness",
      "induction"
    ],
    "points": 15,
    "rubric": [
      {
        "criterion": "Correct base cases and shrinking recursive lengths",
        "marks": 3
      },
      {
        "criterion": "Defines blocks and uses |M|>=k",
        "marks": 3
      },
      {
        "criterion": "Proves second call makes every R key dominate both L and new M",
        "marks": 6
      },
      {
        "criterion": "Explains third call and concludes complete sorted order",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Name blocks L,M,R of sizes k,n-2k,k, and verify the overlap M is at least as large as L or R.",
      "After the first call, all M keys dominate every L key. Where do the largest k suffix keys go after the second call?"
    ],
    "walkthroughSteps": [
      "Prove n=1 and n=2 bases, then assume correctness for all smaller lengths.",
      "Use first-call ordering and |M|>=k to show the second call puts k keys >=max(L) in R.",
      "Establish all prefix keys <=all R keys, then sort the prefix once more."
    ]
  },
  {
    "id": "alg-e1-sh-04",
    "type": "free",
    "prompt": "Homework 2, Q3(b). Derive the worst-case recurrence of Overlap-Sort, including its inclusive-index subproblem length and small base cases. Solve it to a tight Θ bound. You may ignore rounding when solving asymptotically, but state the rounded recurrence first.\n\n```text\nOverlap-Sort(A,p,r):\n    if A[p] > A[r]: exchange A[p] and A[r]\n    if p+1 < r:\n        k = floor((r-p+1)/3)\n        Overlap-Sort(A,p,r-k)\n        Overlap-Sort(A,p+k,r)\n        Overlap-Sort(A,p,r-k)\n```",
    "sampleAnswer": "For n=r-p+1>2, k=floor(n/3), and every recursive call has length n-k=ceil(2n/3). Only a constant amount of local work is done: compare/swap endpoints, calculate k, and issue calls. Hence `T(n)=3T(ceil(2n/3))+Θ(1)` for n>2 and `T(1),T(2)=Θ(1)`. Ignoring rounding, this is `3T(2n/3)+Θ(1)`, with a=3, b=3/2. Since the constant toll is smaller than `n^(log_(3/2)3)`, **T(n)=Θ(n^(log_(3/2)3)) = Θ(n^2.709511...)**. Standard constant rounding does not change this exponent; the recursion-tree leaf count has the same asymptotic order.",
    "explanation": "The overlapping intervals are each roughly two-thirds long; their overlap does not reduce the number of recursive calls. There is no linear-time merge or partition toll.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q3(b))"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "overlap-sort",
      "recurrence",
      "master-theorem"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct exact subproblem size, three calls, and constant toll",
        "marks": 4
      },
      {
        "criterion": "States base cases and justified rounding convention",
        "marks": 2
      },
      {
        "criterion": "Derives Θ(n^(log_(3/2)3)) with correct exponent",
        "marks": 4
      }
    ],
    "hintSteps": [
      "Compute (r-k)-p+1 and r-(p+k)+1 separately.",
      "There are three recursive calls, but the local work compares only two endpoints."
    ],
    "walkthroughSteps": [
      "Use n-k=ceil(2n/3) for each call.",
      "Write the rounded recurrence and n<=2 base cases.",
      "Apply the Master Theorem to the unrounded recurrence: exponent log_(3/2)3≈2.7095."
    ]
  },
  {
    "id": "alg-e1-sh-05",
    "type": "free",
    "prompt": "Homework 2, Q3(c). Compare the WORST-case running time of Overlap-Sort with standard insertion sort, merge sort, and last-pivot two-way quicksort. State each tight bound and decide whether Overlap-Sort is asymptotically competitive. Explain why its divide-and-conquer shape alone does not guarantee efficiency.",
    "sampleAnswer": "Overlap-Sort has worst-case `Θ(n^log_(3/2)3)≈Θ(n^2.7095)`. Standard insertion sort is `Θ(n²)` in the worst case, merge sort is `Θ(n log n)`, and last-pivot two-way quicksort is `Θ(n²)`. Thus Overlap-Sort is asymptotically slower than all three. For example its ratio to a quadratic method grows as `n^0.7095...`. Its three calls repeatedly sort overlapping regions; unlike efficient merge sort, the total recursive input volume exceeds n at each full level. Divide-and-conquer is a design method, not a running-time guarantee.",
    "explanation": "This comparison is worst-case throughout. Expected randomized quicksort is Θ(n log n), which would only make Overlap-Sort look less competitive.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q3(c))",
      "Lecture9-quicksort.pdf, PDF page 14 (quicksort worst case)"
    ],
    "difficulty": "med",
    "homeworkFormat": "short",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "overlap-sort",
      "sorting-comparison"
    ],
    "points": 5,
    "rubric": [
      {
        "criterion": "Gives all four correct worst-case bounds",
        "marks": 3
      },
      {
        "criterion": "Correctly concludes slower than every listed method and explains overlap cost",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Keep the case being compared consistent: worst case for all four algorithms.",
      "The exponent log_(3/2)3 is larger than 2."
    ],
    "walkthroughSteps": [
      "List all four worst-case tight bounds.",
      "Compare the exponent 2.7095 with 2 and with n log n.",
      "Explain repeated overlapping work as the reason the recursion is expensive."
    ]
  },
  {
    "id": "alg-e1-sh-06",
    "type": "free",
    "prompt": "Homework 2, Q4(a). Is the generalized selection algorithm described below randomized or deterministic? Explain how it differs from RANDOMIZED-SELECT and whether the algorithm needs a randomly ordered input.\n\nGeneralized SELECT operates on n distinct keys with fixed odd group size g >= 3, independent of n. It finds each group's median, recursively selects the median x of those medians, partitions around x, and recurses only on the side containing the requested rank. Grouping and tie-free median conventions are deterministic; groups of bounded size are sorted directly. For the fraction-based analysis, ignore incomplete groups and floors/ceilings; a real implementation uses a fixed-size base case and rounding adds only O(1) to recursive input sizes.",
    "sampleAnswer": "It is **deterministic**. A fixed grouping convention, directly computed group medians, and recursively selected median of those medians determine the pivot without random sampling. RANDOMIZED-SELECT instead chooses a pivot index randomly, so its execution and running time can vary on the same input. Deterministic SELECT does not require a randomly ordered input; its guarantee for suitable group sizes is a worst-case guarantee over input orders. The phrase “median of medians” describes a deterministic pivot construction, not a random median sample.",
    "explanation": "The algorithm uses a recursively computed statistic rather than a random choice. A worst-case guarantee and an expected guarantee are different claims.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q4(a))",
      "Lecture12-order-statistics.pdf, PDF page 21 (deterministic SELECT)"
    ],
    "difficulty": "med",
    "homeworkFormat": "short",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "selection",
      "median-of-medians"
    ],
    "points": 5,
    "rubric": [
      {
        "criterion": "Correctly identifies deterministic and explains pivot construction",
        "marks": 3
      },
      {
        "criterion": "Contrasts randomized selection and rules out random-input requirement",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Look for an actual random choice in the algorithm description.",
      "A median of group medians is computed; it is not sampled from them."
    ],
    "walkthroughSteps": [
      "Identify the fixed grouping and median calculations.",
      "Contrast this pivot with a uniformly random pivot index.",
      "Explain that input randomness is unnecessary for the deterministic worst-case analysis."
    ]
  },
  {
    "id": "alg-e1-sh-07",
    "type": "free",
    "prompt": "Homework 2, Q4(b). Derive a worst-case upper-bound recurrence for generalized SELECT in terms of n and fixed odd g. Show how many keys the pivot guarantees can be discarded on either side, account for the median-selection recursive call, and state what rounding/incomplete groups change. Explain why g must be treated as fixed.\n\nGeneralized SELECT operates on n distinct keys with fixed odd group size g >= 3, independent of n. It finds each group's median, recursively selects the median x of those medians, partitions around x, and recurses only on the side containing the requested rank. Grouping and tie-free median conventions are deterministic; groups of bounded size are sorted directly. For the fraction-based analysis, ignore incomplete groups and floors/ceilings; a real implementation uses a fixed-size base case and rounding adds only O(1) to recursive input sizes.",
    "sampleAnswer": "There are about n/g group medians. At least half are >=x, and each corresponding full group contributes (g+1)/2 keys >=x. Thus at least `(n/g)(1/2)((g+1)/2) = ((g+1)/(4g))n` keys are >=x; the symmetric statement holds for <=x. Ignoring the pivot-containing group and incomplete group changes the strict-side guarantee by only O(g)=O(1) when g is fixed.\n\nSelecting x takes a recursive call on about n/g keys. After partitioning, the requested side has size at most `βn+O(1)`, where `β=1-(g+1)/(4g)=(3g-1)/(4g)`. A valid bound is therefore\n`T(n) <= T(ceil(n/g)) + T(βn+O(1)) + a_g n`, with a fixed-size constant-time base case.\nIn the idealized recurrence analysis this is written `T(n)=T(n/g)+T(((3g-1)/(4g))n)+Θ(n)`. For g=5 the fractions are 1/5 and 7/10; for g=3 they are 1/3 and 2/3. Finding group medians costs linear time because each fixed-size group has bounded sorting cost. If g grows with n, that local-work claim and constants must be reanalyzed. The recurrence for the actual algorithm is an upper bound, not automatically an equality describing attained worst cases.",
    "explanation": "Use the (g+1)/2 keys per group, not just the group median. An upper-bound recurrence should not later be used to claim an algorithmic lower bound without more evidence.",
    "references": [
      "CS5381_hw2.pdf, PDF page 1 (Q4(b))",
      "Lecture12-order-statistics.pdf, PDF page 26 (discard guarantee)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "selection",
      "median-of-medians",
      "generalized-selection",
      "recurrence"
    ],
    "points": 15,
    "rubric": [
      {
        "criterion": "Correct discard count with justification from group medians",
        "marks": 5
      },
      {
        "criterion": "Correct two recursive sizes and linear toll",
        "marks": 5
      },
      {
        "criterion": "Correct fixed-g, rounding/base-case, and upper-bound caveats",
        "marks": 5
      }
    ],
    "hintSteps": [
      "Half of approximately n/g group medians lie on each side of x.",
      "A full odd-sized group with median >=x contributes its median plus (g-1)/2 higher keys."
    ],
    "walkthroughSteps": [
      "Multiply medians on one side by (g+1)/2 keys per group.",
      "Subtract the discard fraction from 1 to get (3g-1)/(4g).",
      "Include both recursive calls and linear local work; distinguish an algorithm bound from an equality model."
    ]
  },
  {
    "id": "alg-e1-sh-08",
    "type": "free",
    "prompt": "Homework 2, Q4(c). Use substitution (not the Master Theorem) to prove O(n) for generalized SELECT when g is a fixed odd integer >=5. Use the idealized recurrence `T(n) <= T(n/g)+T(((3g-1)/(4g))n)+an`, a>0, and constant base cases. Explicitly determine the condition on g and a sufficient coefficient c in T(n)<=cn. Briefly explain how bounded rounding offsets are absorbed.",
    "sampleAnswer": "Assume inductively `T(m)<=cm` for smaller m. Then\n`T(n) <= c(n/g)+c((3g-1)n/(4g))+an`\n`= c[(3g+3)/(4g)]n+an`\n`= cn-[c(g-3)/(4g)-a]n`.\nTo close the induction we need **g>3**, and it suffices to choose `c>=4ga/(g-3)`, enlarged to cover every base case. For a fixed odd g>=5, the child-size fractions sum to less than 1, so there is a positive linear slack. For g=5, the sum is 9/10 and c>=10a suffices. For g=3 the sum is 1, leaving no slack to absorb an>0, so this particular linear substitution fails.\n\nFor a rounded recurrence, the sum of child sizes is at most sn+B for a constant B and s<1. Increase the base-case cutoff until B<=((1-s)/2)n; then the sum is at most ((1+s)/2)n. Choose c>=2a/(1-s), enlarged for the finite bases. This restores positive slack and proves the same O(n) result.",
    "explanation": "The decisive condition is g>3, which for odd g>=3 means g>=5. Failure of this induction at g=3 alone is not a proof of a superlinear lower bound.",
    "references": [
      "CS5381_hw2.pdf, PDF page 2 (Q4(c))"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "selection",
      "generalized-selection",
      "substitution",
      "recurrence"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct substitution and child-fraction sum",
        "marks": 4
      },
      {
        "criterion": "Explicit condition g>3 and sufficient c, with base cases",
        "marks": 4
      },
      {
        "criterion": "Explains constant rounding absorption",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Add the two recursive fractions before choosing c.",
      "The cn term must leave enough unused fraction to pay for an."
    ],
    "walkthroughSteps": [
      "Substitute the inductive cn bounds into both recursive calls.",
      "Solve c(1-(3g+3)/(4g))>=a and require a positive denominator.",
      "Cover finite bases and absorb constant rounding offsets using a larger cutoff."
    ]
  },
  {
    "id": "alg-e1-sh-09",
    "type": "free",
    "prompt": "Homework 2, Q4(d). Explain why generalized SELECT requires Ω(n) time for every fixed g>=3, and combine this with the g>=5 upper bound to obtain a tight result. Keep the lower bound about this algorithm separate from a claim that every possible selection task always requires examining every key.\n\nGeneralized SELECT operates on n distinct keys with fixed odd group size g >= 3, independent of n. It finds each group's median, recursively selects the median x of those medians, partitions around x, and recurses only on the side containing the requested rank. Grouping and tie-free median conventions are deterministic; groups of bounded size are sorted directly. For the fraction-based analysis, ignore incomplete groups and floors/ceilings; a real implementation uses a fixed-size base case and rounding adds only O(1) to recursive input sizes.",
    "sampleAnswer": "For non-base inputs, this implementation processes all groups to compute their medians and scans/partitions the original n keys around x. A standard partition pass alone performs Θ(n) work, so its running time is Ω(n), for every fixed g>=3, regardless of which side is searched recursively. This is an algorithmic lower bound from work actually performed.\nFor each fixed odd g>=5, the substitution proof gives O(n). Combining upper and lower bounds yields **T(n)=Θ(n)** in the worst case. For g=3 we still have the Ω(n) lower bound, but this argument supplies no Ω(n log n) algorithmic lower bound. Such a claim cannot be obtained merely by solving an upper-bound recurrence.",
    "explanation": "The full input scan is enough to establish the requested lower bound. No comparison-sorting lower bound is relevant to selection.",
    "references": [
      "CS5381_hw2.pdf, PDF page 2 (Q4(d))",
      "Lecture12-order-statistics.pdf, PDF page 21 (SELECT passes)"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "selection",
      "generalized-selection",
      "lower-bound"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Justifies Ω(n) from work this algorithm actually performs",
        "marks": 6
      },
      {
        "criterion": "Correct Θ(n) conclusion for odd g>=5 and limited g=3 inference",
        "marks": 4
      }
    ],
    "hintSteps": [
      "Which step scans the original n-element input even before the rank-side recursion?",
      "Combine O(n) and Ω(n) only where both have been established."
    ],
    "walkthroughSteps": [
      "Identify the Θ(n) top-level grouping/partitioning work.",
      "Conclude Ω(n) for all fixed g>=3.",
      "Use the g>=5 substitution upper bound to obtain Θ(n); do not extrapolate a stronger g=3 lower bound."
    ]
  },
  {
    "id": "alg-e1-sh-10",
    "type": "free",
    "prompt": "Homework 2, Q4(e). Analyze the stated EQUALITY recurrence `T(n)=T(n/3)+T(2n/3)+Θ(n)`, with positive constant base cases, by substitution. Prove both O(n log n) and Ω(n log n), not just one direction. Ignore rounding in the algebra; for integer n use children floor(n/3), n-floor(n/3) and bases n<=2. Finally state precisely what this establishes if the actual g=3 SELECT running time was only bounded ABOVE by this recurrence.",
    "sampleAnswer": "Write the toll as w(n), with `an<=w(n)<=bn` for sufficiently large n, a,b>0. Use natural logarithms and `h=ln 3-(2/3)ln 2>0`. The key identity is\n`(n/3)ln(n/3)+(2n/3)ln(2n/3)=n ln n-hn`.\n\n**Upper bound:** assume `T(m)<=C m ln m+D m`. Substitution gives `T(n)<=C n ln n+D n+(b-Ch)n`. Choose C>=b/h and choose D large enough to cover the finitely many bases. Thus T(n)=O(n log n).\n\n**Lower bound:** assume `T(m)>=c m ln m`. Then `T(n)>=c n ln n+(a-ch)n`. Choose 0<c<=a/h, shrinking c if needed to cover the positive bases (the n=1 right side is zero). Thus T(n)=Ω(n log n). Together the equality model has **Θ(n log n)** growth.\n\nFor rounded children q=floor(n/3), n-q, the corresponding identity subtracts `n H(q/n)`, where `H(t)=-t ln t-(1-t)ln(1-t)`. For large n this positive quantity is bounded between constants h0 and h1. Choose C>=b/h0 and c<=a/h1, and cover small n as bases; the same substitutions hold.\n\nIf this recurrence is only an UPPER-BOUND model for SELECT, solving it proves an O(n log n) algorithmic upper bound. It does **not** prove that SELECT itself takes Ω(n log n): the larger permitted recursive sizes need not be attained together. Its direct scan still proves Ω(n).",
    "explanation": "The homework states an equality recurrence. The practice answer solves that model tightly while distinguishing it from the inequality derived for the algorithm.",
    "references": [
      "CS5381_hw2.pdf, PDF page 2 (Q4(e))"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "high-priority",
      "homework-2",
      "selection",
      "generalized-selection",
      "substitution",
      "recurrence",
      "g-3"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Derives the correct positive entropy slack identity",
        "marks": 2
      },
      {
        "criterion": "Valid upper substitution with coefficient/base choices",
        "marks": 3
      },
      {
        "criterion": "Valid lower substitution with coefficient/base choices",
        "marks": 3
      },
      {
        "criterion": "Distinguishes equality-model result from algorithmic upper-bound recurrence",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Expand log(n/3) and log(2n/3); their sum leaves a negative constant times n.",
      "An equality with a positive Θ(n) toll allows both upper and lower substitutions. An upper-bound inequality allows only the upper inference."
    ],
    "walkthroughSteps": [
      "Derive the entropy identity with h>0.",
      "Use the toll upper bound b and C>=b/h for O(n log n), covering bases.",
      "Use the toll lower bound a and c<=a/h for Ω(n log n).",
      "Explain rounding and the limited inference for actual SELECT."
    ]
  },
  {
    "id": "alg-e1-sh-11",
    "type": "free",
    "prompt": "Lecture partition example. Apply PARTITION(A,1,8) to A=[2,8,7,1,3,5,6,4], recording i and the whole array after each iteration and after the pivot swap. Explain the divide, conquer, and combine steps of quicksort using the returned q.\n\nUse 1-based Lomuto PARTITION, including self-swaps:\n```text\nx = A[r]; i = p - 1\nfor j = p to r - 1:\n    if A[j] <= x:\n        i = i + 1\n        exchange A[i] and A[j]\nexchange A[i+1] and A[r]\nreturn i+1\n```",
    "sampleAnswer": "Pivot x=4; initially i=0.\n\n| j just processed | i after iteration | Entire array |\n|---:|---:|---|\n| 1 | 1 | `[2, 8, 7, 1, 3, 5, 6, 4]` |\n| 2 | 1 | `[2, 8, 7, 1, 3, 5, 6, 4]` |\n| 3 | 1 | `[2, 8, 7, 1, 3, 5, 6, 4]` |\n| 4 | 2 | `[2, 1, 7, 8, 3, 5, 6, 4]` |\n| 5 | 3 | `[2, 1, 3, 8, 7, 5, 6, 4]` |\n| 6 | 3 | `[2, 1, 3, 8, 7, 5, 6, 4]` |\n| 7 | 3 | `[2, 1, 3, 8, 7, 5, 6, 4]` |\n\nSwap positions 4 and 8 to obtain `[2,1,3,4,7,5,6,8]`, q=4. Divide performs this partition; conquer recursively sorts positions 1..3 and 5..8; combine does no merging because every left key <=4 and every right key >4. The pivot is already in its final sorted position.",
    "explanation": "This reproduces the actual Lecture 9 array. Partition establishes cross-boundary order while leaving the two regions internally unsorted.",
    "references": [
      "Lecture9-quicksort.pdf, PDF page 3 (divide/conquer/combine)",
      "Lecture9-quicksort.pdf, PDF page 5 (partition example)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "partition",
      "quicksort"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct complete partition trace and q=4",
        "marks": 5
      },
      {
        "criterion": "Correct divide, recursive ranges, and trivial combine explanation",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Track the current values of i and j separately.",
      "The only nontrivial loop swaps occur when 1 and 3 extend the low side."
    ],
    "walkthroughSteps": [
      "Scan j=1..7 using pivot 4.",
      "Finish with i=3 and move the pivot to q=4.",
      "Describe the two recursive ranges and why no merge is needed."
    ]
  },
  {
    "id": "alg-e1-sh-12",
    "type": "free",
    "prompt": "Prove the loop invariant of the Lomuto PARTITION below. State the regions at the START of an iteration, and prove initialization, maintenance in both comparison cases, and termination/final swap. State the exact postcondition and the running time for n=r-p+1.\n\nUse 1-based Lomuto PARTITION, including self-swaps:\n```text\nx = A[r]; i = p - 1\nfor j = p to r - 1:\n    if A[j] <= x:\n        i = i + 1\n        exchange A[i] and A[j]\nexchange A[i+1] and A[r]\nreturn i+1\n```",
    "sampleAnswer": "At the start of each iteration: (1) A[p..i]<=x; (2) A[i+1..j-1]>x; (3) A[j..r-1] is unexamined; (4) A[r]=x. Empty ranges are allowed.\nInitialization: i=p-1 and j=p, so both examined regions are empty and the pivot is unchanged.\nIf A[j]>x, advancing j adds that key to the high region without moving i. If A[j]<=x, increment i and swap A[i],A[j]. The new low slot gets the qualifying key; when i<j, the displaced high-region key moves to position j and joins the high region after j advances. For i=j the swap is a harmless self-swap. Neither case changes A[r].\nAt loop termination j=r, the low region is A[p..i] and the high region A[i+1..r-1]. Swapping A[i+1] and A[r] gives q=i+1, A[q]=x, every A[p..q-1]<=x and every A[q+1..r]>x. The algorithm performs n-1 comparisons and constant work per iteration, so time is Θ(n) with Θ(1) extra storage.",
    "explanation": "Proofs should describe the invariant before an iteration and explicitly handle the displaced high key after a swap.",
    "references": [
      "Lecture9-quicksort.pdf, PDF page 6 (loop invariant)",
      "Lecture9-quicksort.pdf, PDF page 7 (final swap)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "partition",
      "loop-invariant",
      "correctness"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct invariant and initialization",
        "marks": 3
      },
      {
        "criterion": "Correct maintenance in both cases, including displaced key",
        "marks": 3
      },
      {
        "criterion": "Correct termination/postcondition and Θ(n), Θ(1) bounds",
        "marks": 3
      }
    ],
    "hintSteps": [
      "The processed region ends at j-1, while the pivot remains at r.",
      "In the <= case, identify where the old first high-region element goes."
    ],
    "walkthroughSteps": [
      "Define all four regions before the loop iteration.",
      "Check empty-range initialization and both branches.",
      "At j=r, place the pivot between the two processed regions and derive the postcondition."
    ]
  },
  {
    "id": "alg-e1-sh-13",
    "type": "free",
    "prompt": "Quicksort split analysis. Assume distinct keys, last-element pivot, and Θ(n) partition cost. Give and solve recurrences for (a) already ascending or descending input, (b) perfectly balanced splits, and (c) the lecture exercise where every split is 1:9. Why does a fixed 1:9 split still have the same asymptotic growth as a 1:1 split? Ignore pivot-size offsets and rounding in (b),(c), and use constant bases.",
    "sampleAnswer": "(a) On ascending input the pivot is the maximum; on descending input the next partition pivot is an extreme as the recursion continues. Every nontrivial split has sizes n-1,0, so `T(n)=T(n-1)+Θ(n)=Θ(n²)`.\n(b) Balanced: `T(n)=2T(n/2)+Θ(n)=Θ(n log n)`.\n(c) Fixed 1:9: `T(n)=T(n/10)+T(9n/10)+Θ(n)=Θ(n log n)`. The longest path has O(log_(10/9)n) depth. The sum of active subproblem lengths at any level is at most n, giving an O(n log n) upper bound; for Ω(log n) early levels, even the shortest paths have not reached the constant base, and their total size remains n in the idealized model, giving Ω(n log n). Both split ratios shrink by constant factors. The larger imbalance changes constants, not the order of growth.",
    "explanation": "The 1:9 recurrence is an explicit lecture exercise. A constant-fraction imbalance is different from repeatedly removing only one key.",
    "references": [
      "Lecture9-quicksort.pdf, PDF page 8 (sorted input)",
      "Lecture9-quicksort.pdf, PDF page 14 (worst case)",
      "Lecture9-quicksort.pdf, PDF page 15 (1:9 exercise)",
      "Lecture9-quicksort.pdf, PDF page 16 (9:1 tree)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "recurrence",
      "recursion-tree"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct worst-case recurrence and Θ(n²)",
        "marks": 2
      },
      {
        "criterion": "Correct balanced recurrence and Θ(n log n)",
        "marks": 2
      },
      {
        "criterion": "Correct 1:9 recurrence, tight bound, and constant-shrink explanation",
        "marks": 4
      }
    ],
    "hintSteps": [
      "An extreme pivot creates sizes 0 and n-1.",
      "For the 1:9 tree, compare the longest and shortest root-to-leaf paths."
    ],
    "walkthroughSteps": [
      "Derive the one-sided quadratic sum.",
      "Solve the balanced recurrence.",
      "Bound the 1:9 tree depth and total work at early/full levels for a tight bound."
    ]
  },
  {
    "id": "alg-e1-sh-14",
    "type": "free",
    "prompt": "The lecture alternates a “lucky” balanced split and an “unlucky” extreme split. Define `L(n)=2U(n/2)+Θ(n)` and `U(n)=L(n-1)+Θ(n)`, with constant bases. Substitute one into the other and give a tight asymptotic bound for L and U. Explain why isolated unlucky splits need not make the whole algorithm quadratic. Ignore rounding, and interpret all Θ(n) tolls as positive linear work.",
    "sampleAnswer": "Expand U(n/2): `L(n)=2[L(n/2-1)+Θ(n/2)]+Θ(n)=2L(n/2-1)+Θ(n)`. Setting `S(m)=L(m-2)` shifts the child argument exactly: `S(m)=2S(m/2)+Θ(m)` for sufficiently large m. Thus `L(n)=Θ(n log n)` by the balanced linear-toll recurrence, and `U(n)=L(n-1)+Θ(n)=Θ(n log n)`. Over each pair of levels the size is roughly halved. Quadratic behavior requires a long succession of extreme splits, not an occasional one interspersed with balancing splits.",
    "explanation": "The constant -1 offset does not alter the asymptotic bound; an explicit shift makes that fact precise.",
    "references": [
      "Lecture9-quicksort.pdf, PDF page 17 (lucky/unlucky splits)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "recurrence"
    ],
    "points": 6,
    "rubric": [
      {
        "criterion": "Correct substitution and resulting recurrence",
        "marks": 3
      },
      {
        "criterion": "Correct Θ(n log n) for both with offset justification",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Replace U(n/2) by L(n/2-1) plus linear work.",
      "Look at progress over two levels rather than judging one unlucky partition alone."
    ],
    "walkthroughSteps": [
      "Substitute the U recurrence into L and combine linear tolls.",
      "Shift by a constant to obtain the standard balanced recurrence.",
      "Recover U from L and interpret paired levels."
    ]
  },
  {
    "id": "alg-e1-sh-15",
    "type": "free",
    "prompt": "RANDOMIZED-QUICKSORT chooses each pivot index uniformly in the current subarray. For n DISTINCT keys, derive its expected-time recurrence using pivot rank k, solve its order of growth, and distinguish expected time from worst-case time. Explain why fixed input ordering no longer determines the worst split sequence.",
    "sampleAnswer": "A uniformly chosen index has each rank k=1..n with probability 1/n, irrespective of the order of distinct keys. If F(n)=E[T(n)], then\n`F(n)=(1/n) sum_(k=1)^n [F(k-1)+F(n-k)] + Θ(n)`\n`=(2/n) sum_(j=0)^(n-1) F(j)+Θ(n)`.\nThe lecture’s substitution analysis gives **F(n)=Θ(n log n)**; the lower bound also follows from comparison sorting. For an exact linear toll cn and zero F(0), subtracting the n and n-1 equations gives `nF(n)=(n+1)F(n-1)+c(2n-1)` beyond the base range. Dividing by n(n+1) produces increments Θ(1/n), so the harmonic sum makes F(n)=Θ(n log n).\nThe worst possible random pivot sequence still chooses extremes at each stage and takes Θ(n²). Fixed ascending, descending, or other input order cannot force those ranks on a pivot sampled uniformly at random. The expectation is over the algorithm’s random choices; no random-input assumption is needed.",
    "explanation": "Expected linear partition work plus averaged recursive sides leads to n log n. Randomization removes order-dependent guarantees of bad pivots but does not remove the possibility of a bad random run.",
    "references": [
      "Lecture9-quicksort.pdf, PDF page 18 (random pivot)",
      "Lecture9-quicksort.pdf, PDF page 20 (split indicator)",
      "Lecture9-quicksort.pdf, PDF page 23 (expected recurrence)",
      "Lecture9-quicksort.pdf, PDF page 26 (substitution)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "randomized-analysis",
      "expectation"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct uniform-rank expected recurrence",
        "marks": 4
      },
      {
        "criterion": "Correct Θ(n log n) with valid analysis",
        "marks": 3
      },
      {
        "criterion": "Correct Θ(n²) worst case and input-order/random-choice distinction",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Average over all n pivot ranks; each rank produces two complementary sizes.",
      "Both sums over subproblem sizes are identical after reversing an index."
    ],
    "walkthroughSteps": [
      "Use uniform rank probabilities to write the sum recurrence.",
      "Combine complementary-size sums and identify Θ(n log n) growth.",
      "Distinguish averaging over choices from worst possible choices."
    ]
  },
  {
    "id": "alg-e1-sh-16",
    "type": "free",
    "prompt": "Projected exercise 7.4-6. A quicksort pivot is the median of three distinct uniformly sampled subarray elements. For large n and 0<α<1/2, approximate the probability that the pivot produces a split WORSE than α:(1−α), meaning its normalized rank is below α or above 1−α. Use a continuous quantile approximation and ignore the pivot’s one-element offset. Compare with one uniformly sampled pivot, and evaluate both at α=1/4.",
    "sampleAnswer": "In the large-n approximation, each sample falls in the bottom α fraction with probability α. Their median falls there exactly when at least two samples do: `3α²(1−α)+α³=3α²−2α³`. The top tail has the same probability, and the tails are disjoint for α<1/2. Thus\n**P(bad split)≈6α²−4α³**.\nOne uniformly chosen pivot has bad probability 2α. At α=1/4, median-of-three gives `6/16−4/64=5/16=0.3125`, versus `1/2=0.5`. For 0<α<1/2 it is smaller because `2α−(6α²−4α³)=2α(1−α)(1−2α)>0`. Distinct sampling without replacement has finite-n hypergeometric corrections; this answer is the requested large-n approximation.",
    "explanation": "The three samples do not all need to lie in the tail: two are sufficient for their median to lie there.",
    "references": [
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 2 (exercise 7.4-6)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "median-of-three",
      "probability"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct one-tail counting argument",
        "marks": 3
      },
      {
        "criterion": "Correct 6α²−4α³ formula with approximation convention",
        "marks": 3
      },
      {
        "criterion": "Correct single-pivot comparison and numerical probabilities",
        "marks": 2
      }
    ],
    "hintSteps": [
      "For the median to be in one tail, at least two of the three samples must be in that tail.",
      "Add the probabilities of exactly two and exactly three, then account for both tails."
    ],
    "walkthroughSteps": [
      "Compute 3α²(1−α)+α³ for one tail.",
      "Double the result because the two extreme tails are disjoint.",
      "Compare with 2α and evaluate at 1/4."
    ]
  },
  {
    "id": "alg-e1-sh-17",
    "type": "free",
    "prompt": "Projected problem 7-6(a). The n>=3 DISTINCT sorted keys are z1<...<zn. Choose an unordered three-element subset uniformly without replacement and use its median as pivot. Derive the exact probability pi that zi is selected, including i=1,n. Evaluate p4 when n=7 and check that the probabilities sum to 1.",
    "sampleAnswer": "There are C(n,3) equally likely sample triples. To have median zi, the triple must contain zi, one of its i−1 smaller keys, and one of its n−i larger keys. Therefore\n**pi=(i−1)(n−i)/C(n,3)=6(i−1)(n−i)/(n(n−1)(n−2))**, 2<=i<=n−1, with p1=pn=0.\nFor n=7,i=4, p4=3·3/35=9/35. Each sample triple has exactly one median, so the favorable counts over all i sum to C(n,3), giving Σpi=1. Algebraically, Σ(i−1)(n−i)=n(n−1)(n−2)/6.",
    "explanation": "This is the exact finite-n distribution, unlike the independent-quantile approximation in exercise 7.4-6.",
    "references": [
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 3 (median-of-three setup)",
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 4 (7-6(a))"
    ],
    "difficulty": "hard",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "median-of-three",
      "probability"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct exact favorable/total count and formula",
        "marks": 4
      },
      {
        "criterion": "Correct endpoints and p4=9/35",
        "marks": 2
      },
      {
        "criterion": "Valid normalization check",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Count triples by choosing one key on each side of zi.",
      "Divide by unordered triples, not by n³ when sampling without replacement."
    ],
    "walkthroughSteps": [
      "Count (i−1)(n−i) triples with middle key zi.",
      "Normalize by C(n,3) and handle the extremes.",
      "Evaluate 9/35 and explain why the total probability is 1."
    ]
  },
  {
    "id": "alg-e1-sh-18",
    "type": "free",
    "prompt": "Projected problem 7-6(b),(d). Let j=floor((n+1)/2) be the specified true-median rank (the lower median when n is even). For uniformly sampled median-of-three pivots, find the LIMIT as n→∞ of the probability of selecting zj divided by its probability under one uniformly sampled pivot. Then explain whether this improvement changes quicksort’s asymptotic expected running time below Ω(n log n) in the comparison model. Assume distinct keys.",
    "sampleAnswer": "Using `pj=6(j−1)(n−j)/(n(n−1)(n−2))`, while a single random pivot selects zj with probability 1/n, the ratio is\n`n pj=6(j−1)(n−j)/((n−1)(n−2))`. Since j/n→1/2, this tends to **3/2**. Thus median-of-three increases the exact-median selection probability asymptotically by a factor of 1.5, not by adding probability 1.5. The finite-n ratio need not be exactly 1.5.\nMedian sampling improves typical split balance and can improve constants, but comparison sorting still requires Ω(n log n) expected comparisons under the standard comparison model. Median-of-three quicksort retains expected Θ(n log n) growth. Choosing and finding the median of three takes Θ(1) comparisons per partition, and this fixed sample size does not change the asymptotic class.",
    "explanation": "This combines the two projected subparts while preserving both the limiting probability calculation and the comparison-model argument.",
    "references": [
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 4 (7-6(b),(d))",
      "Lecture10-sort-in-linear-time.pdf, PDF page 9 (comparison lower bound)"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "median-of-three",
      "comparison-lower-bound"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct ratio expression and limit 3/2",
        "marks": 4
      },
      {
        "criterion": "Correct expected Θ(n log n) and comparison lower-bound argument",
        "marks": 3
      },
      {
        "criterion": "Distinguishes finite-n ratio, multiplicative probability change, and constant sample cost",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Divide pj by 1/n before taking the limit.",
      "A constant-factor improvement in pivot quality does not remove the comparison-sorting lower bound."
    ],
    "walkthroughSteps": [
      "Substitute j≈n/2 into the exact probability ratio.",
      "Take the limit to obtain 3/2.",
      "Explain why fixed-size sampling improves constants while expected Θ(n log n) remains."
    ]
  },
  {
    "id": "alg-e1-sh-19",
    "type": "free",
    "prompt": "Projected problem 7-6(c). Call a pivot “good” when its rank i satisfies n/3<=i<=2n/3. Using `pi=6(i−1)(n−i)/(n(n−1)(n−2))` for median-of-three sampling, approximate the good-pivot probability as n→∞ using an integral. Compare it with uniform single-pivot sampling: give the absolute increase and multiplicative ratio. Ranks on finite inputs use ceil(n/3)..floor(2n/3).",
    "sampleAnswer": "With t=i/n, pi≈(1/n)·6t(1−t). The Riemann sum over the middle third becomes\n`∫_(1/3)^(2/3) 6t(1−t) dt = [3t²−2t³]_(1/3)^(2/3)`\n`=20/27−7/27 = **13/27** ≈0.48148`.\nA uniformly chosen pivot is in the middle third with limiting probability 1/3=9/27. The absolute increase is **4/27**, and the ratio is **13/9≈1.44444**. Endpoints and rounding affect finite-n values by lower-order corrections; they do not change these limits.",
    "explanation": "The improvement is to 13/27, not to 2/3. The density 6t(1−t) favors central ranks.",
    "references": [
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 4 (7-6(c))"
    ],
    "difficulty": "hard",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "quicksort",
      "median-of-three",
      "probability",
      "integral"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct density/integral setup",
        "marks": 3
      },
      {
        "criterion": "Correct 13/27 integral evaluation",
        "marks": 3
      },
      {
        "criterion": "Correct 1/3 baseline, 4/27 increase, and 13/9 ratio",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Convert pi into a density times 1/n using t=i/n.",
      "Integrate 6t−6t² between 1/3 and 2/3, then compare with interval length 1/3."
    ],
    "walkthroughSteps": [
      "Identify the limiting density and middle-third integral.",
      "Evaluate the antiderivative at both endpoints.",
      "Compute absolute difference and ratio against uniform sampling."
    ]
  },
  {
    "id": "alg-e1-sh-20",
    "type": "free",
    "prompt": "Projected exercise 8.3-1. Illustrate stable LSD radix sort on the words below. Use alphabetical A<...<Z and fixed length 3. List the entire array after the third-character pass, second-character pass, and first-character pass. Preserve the previous order of words that tie on the current character.\n\n`COW, DOG, SEA, RUG, ROW, MOB, BOX, TAB, BAR, EAR, TAR, DIG, BIG, TEA, NOW, FOX`",
    "sampleAnswer": "After sorting the third character:\n`SEA, TEA, MOB, TAB, DOG, RUG, DIG, BIG, BAR, EAR, TAR, COW, ROW, NOW, BOX, FOX`\n\nAfter stably sorting the second character:\n`TAB, BAR, EAR, TAR, SEA, TEA, DIG, BIG, MOB, DOG, COW, ROW, NOW, BOX, FOX, RUG`\n\nAfter stably sorting the first character:\n`BAR, BIG, BOX, COW, DIG, DOG, EAR, FOX, MOB, NOW, ROW, RUG, SEA, TAB, TAR, TEA`\n\nEach pass starts from the previous pass’s array. For example, the second-pass O group keeps MOB,DOG,COW,ROW,NOW,BOX,FOX in that prior order; it is not independently alphabetized during that pass. The final array is lexicographically sorted.",
    "explanation": "This is the exact 16-word projected exercise. Stability preserves the already sorted less-significant suffix on tied characters.",
    "references": [
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 5 (8.3-1)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "radix-sort",
      "stability",
      "trace"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct complete third-character pass",
        "marks": 3
      },
      {
        "criterion": "Correct complete second-character pass with stable ties",
        "marks": 3
      },
      {
        "criterion": "Correct complete final first-character pass",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Start with the rightmost character, even though final dictionary order compares the leftmost first.",
      "For a tie on the current character, copy words in their current array order."
    ],
    "walkthroughSteps": [
      "Group the original words by last character, preserving ties.",
      "Stably regroup that result by middle character.",
      "Stably regroup again by first character to obtain lexical order."
    ]
  },
  {
    "id": "alg-e1-sh-21",
    "type": "free",
    "prompt": "Projected exercise 8.3-5. Show how to sort n integers in the range 0..n³−1 in O(n) time. Assume n>=2 and a word-RAM in which these integers and digit extraction fit constant-time operations. Specify the radix/base, number of passes, stable per-pass sorting algorithm, and costs. Why does this not contradict the comparison-sorting lower bound?",
    "sampleAnswer": "Write each integer in **base n** as `x=d2 n²+d1 n+d0`, with each dj in 0..n−1. The maximum n³−1 has exactly three base-n digits, so pad shorter representations with leading zeros. Perform three LSD passes: d0, then d1, then d2, using stable counting sort each time. Each pass costs `Θ(n+n)=Θ(n)` because it processes n keys and n digit values. Three passes give Θ(n) time and Θ(n) auxiliary storage. Digit extraction can use `floor(x/n^j) mod n` under the stated RAM assumption.\nThe Ω(n log n) lower bound applies to algorithms obtaining key-order information solely by comparisons. Radix/counting sort uses the bounded integer representation for array indexing, so that model restriction does not apply. n=1 can be handled directly in constant time.",
    "explanation": "Choosing base 10 would use Θ(log n) passes for the growing range. The base-n choice keeps the pass count constant.",
    "references": [
      "Lecture11-quicksort-radixsort-exercies.pdf, PDF page 5 (8.3-5)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 21 (digit size tradeoff)"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "radix-sort",
      "integer-sorting",
      "comparison-lower-bound"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct base n, three digits, and LSD order",
        "marks": 3
      },
      {
        "criterion": "Stable counting sort with correct time/space analysis",
        "marks": 3
      },
      {
        "criterion": "Explains representation assumption and no lower-bound contradiction",
        "marks": 2
      }
    ],
    "hintSteps": [
      "The upper endpoint is one less than a power of n.",
      "Use counting sort with n possible digit values so a pass is linear."
    ],
    "walkthroughSteps": [
      "Represent keys with three base-n digits.",
      "Stably sort from least to most significant digit.",
      "Count three Θ(n) passes and explain the comparison-model distinction."
    ]
  },
  {
    "id": "alg-e1-sh-22",
    "type": "free",
    "prompt": "Decision-tree sorting example. The input is a1=9,a2=4,a3=6. Follow these comparisons: first a1<=a2; if false compare a1<=a3; if that is false compare a2<=a3. Give the comparison outcomes and sorted permutation of original indices. Then prove that any correct binary comparison sorter for n distinct keys has worst-case depth at least ceil(log₂(n!)) and hence Ω(n log n).",
    "sampleAnswer": "The outcomes are false (9<=4), false (9<=6), true (4<=6). Sorted order is a2,a3,a1, the index permutation **231**, with values [4,6,9].\nA binary comparison decision tree has a leaf for each distinguishable ordering of n distinct keys, so it needs at least n! leaves. A tree of height h has at most 2^h leaves; therefore `2^h>=n!` and `h>=ceil(log₂(n!))`. Since at least n/2 factors of n! are at least n/2, `log₂(n!) >= (n/2)log₂(n/2)=Ω(n log n)`. This is a worst-case comparison bound. It does not prohibit counting/radix sorting on suitable integer representations.",
    "explanation": "The lecture’s 231 leaf is a permutation of original positions, not the sorted key values.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 5 (input [9,4,6])",
      "Lecture10-sort-in-linear-time.pdf, PDF page 6 (comparison path)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 7 (comparison path)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 8 (231 leaf)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 9 (decision-tree lower bound)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "comparison-sorting",
      "decision-tree",
      "lower-bound"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct outcomes, permutation, and sorted values",
        "marks": 2
      },
      {
        "criterion": "Correct leaf/height argument",
        "marks": 4
      },
      {
        "criterion": "Correct Ω(n log n) conclusion with factorial bound",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Keep original key labels after comparisons.",
      "There are n! possible strict orderings but only 2^h root-to-leaf answer patterns at height h."
    ],
    "walkthroughSteps": [
      "Evaluate the three comparisons and output index permutation 231.",
      "Relate n! required leaves to binary-tree capacity.",
      "Lower-bound log(n!) using its largest n/2 factors."
    ]
  },
  {
    "id": "alg-e1-sh-23",
    "type": "free",
    "prompt": "Counting-sort slide example. A=[2,5,3,0,2,3,0,3], n=8, k=5. C has indices 0..5 and B has indices 1..8. Initialize C to zero, count each value, form cumulative counts, and process j=8 down to 1 using `B[C[A[j]]]=A[j]; C[A[j]]--`. Give the frequency C, cumulative C, EVERY placement (j,value,B index), final B, running time, and auxiliary space.",
    "sampleAnswer": "Frequency C[0..5]=`[2,0,2,3,0,1]`; cumulative C=`[2,2,4,7,7,8]`.\n\n| j | A[j] | B index used before decrement |\n|---:|---:|---:|\n| 8 | 3 | 7 |\n| 7 | 0 | 2 |\n| 6 | 3 | 6 |\n| 5 | 2 | 4 |\n| 4 | 0 | 1 |\n| 3 | 3 | 5 |\n| 2 | 5 | 8 |\n| 1 | 2 | 3 |\n\nFinal B=`[0,0,2,2,3,3,3,5]`. The counting and output loops each cost Θ(n), initialization/prefix loops cost Θ(k+1); thus total time is Θ(n+k+1), usually written Θ(n+k). Space for B and C is Θ(n+k+1). The algorithm is linear in n when k=O(n); a huge key range makes the count array expensive.",
    "explanation": "C[v] initially counts exact occurrences, then counts keys <=v; after output starts it tracks the remaining last available position for each value.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 11 (algorithm)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 12 (actual array)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 14 (output trace)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 15 (complexity)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "counting-sort",
      "linear-sorting",
      "trace"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct frequency and cumulative arrays",
        "marks": 3
      },
      {
        "criterion": "Correct eight output placements and final B",
        "marks": 4
      },
      {
        "criterion": "Correct time, space, and condition for linear time",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Include value 0 in the frequency array.",
      "A cumulative count is the last 1-based output position for a key, before that count is decremented."
    ],
    "walkthroughSteps": [
      "Build all six frequencies and cumulative counts.",
      "Process the original A backward and record each destination.",
      "Derive Θ(n+k) time and storage rather than assuming the range is constant."
    ]
  },
  {
    "id": "alg-e1-sh-24",
    "type": "free",
    "prompt": "Stability exercise. The tagged keys are A=[4a,1b,3c,4d,3e]; tags identify records and sorting compares only the numeric key. Give the stable sorted result. Explain why counting sort scans right-to-left when it uses cumulative END positions and decrements them. What happens to equal-key order if it scans left-to-right with the same placement rule? Name two other stable algorithms with the needed equality conventions.",
    "sampleAnswer": "The stable result is **[1b,3c,3e,4a,4d]**, preserving c before e and a before d. With cumulative end positions, the last encountered equal key gets the rightmost remaining output position. A backward scan encounters later original records first, so later originals stay to the right. A forward scan with this same end-position/decrement rule reverses each equal-key group: `[1b,3e,3c,4d,4a]`.\nStandard insertion sort is stable when it shifts only keys STRICTLY greater than the inserted key. Merge sort is stable when equal keys are taken from the left run first, assuming both runs are themselves stable. Changing those equality rules can break stability. This concerns record order even though the untagged numeric output looks identical.",
    "explanation": "The lecture gives [4,1,3,4,3] and asks for other stable sorting algorithms; tags make the equality behavior observable.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 16 (stability exercise)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 11 (backward placement)"
    ],
    "difficulty": "med",
    "homeworkFormat": "short",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "counting-sort",
      "stability",
      "linear-sorting"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct stable and forward-scan reversed outputs",
        "marks": 3
      },
      {
        "criterion": "Correct explanation of counting-sort scan direction",
        "marks": 3
      },
      {
        "criterion": "Two stable algorithms with correct equality conventions",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Record labels should remain in original order within each numeric key.",
      "End positions allocate equal keys from the rightmost slot toward the left."
    ],
    "walkthroughSteps": [
      "Read equal-key record order from the original input.",
      "Apply backward and hypothetical forward scans to explain stable versus reversed ties.",
      "State strict-shift insertion and left-first merge equality rules."
    ]
  },
  {
    "id": "alg-e1-sh-25",
    "type": "free",
    "prompt": "Radix-sort slide trace. Stably LSD-sort [329,457,657,839,436,720,355] using decimal digits, padding to three digits. Give the complete array after the ones, tens, and hundreds passes. What is the general running time for n keys with d base-b digits if each stable digit pass uses counting sort?",
    "sampleAnswer": "Ones pass: `[720, 355, 436, 457, 657, 329, 839]`.\nTens pass: `[720, 329, 436, 839, 355, 457, 657]`.\nHundreds pass: `[329, 355, 436, 457, 657, 720, 839]`.\nAt every pass, ties retain their order from the preceding pass. For example 457 precedes 657 after both their ones and tens ties. Stable counting sort processes n records and b possible digit values, so d passes take **Θ(d(n+b))** time and Θ(n+b) reusable auxiliary storage. With three decimal digits, d=3 and b=10 are constants, giving Θ(n).",
    "explanation": "This reproduces the lecture’s seven-number example and states the general base/pass tradeoff explicitly.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 17 (radix example)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "radix-sort",
      "linear-sorting",
      "trace"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct three complete digit-pass arrays",
        "marks": 6
      },
      {
        "criterion": "Correct general time and auxiliary-space bounds",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Start from ones and use the prior pass’s order for every tie.",
      "Counting a digit range 0..b−1 costs Θ(n+b) per pass."
    ],
    "walkthroughSteps": [
      "Stably sort by ones, then tens, then hundreds.",
      "Check the final array is numerically sorted.",
      "Multiply per-pass cost by d and reuse auxiliary arrays."
    ]
  },
  {
    "id": "alg-e1-sh-26",
    "type": "free",
    "prompt": "Prove LSD radix sort correct by induction on processed digit positions. Keys have fixed d base-b digits (pad leading zeros), and each pass is stable. Explain the two cases for a pair of keys during the inductive step. Then give a two-key example showing that an UNSTABLE higher-digit pass can destroy previously established order.",
    "sampleAnswer": "Invariant: after pass t, the array is sorted by its t least-significant digits interpreted together. Base t=1 holds because the first pass sorts the least-significant digit. Suppose the invariant holds for t−1. Pass t sorts digit t. If two keys differ on digit t, that digit determines the correct order among the t-digit suffixes. If they tie on digit t, stability preserves their prior order, which by induction is correct on the lower t−1 digits. Therefore the invariant holds for t. At t=d the suffix is the full key, so the array is sorted.\nFor example, after the ones pass [12,11] becomes [11,12]. Both have tens digit 1. An unstable tens pass is allowed to reverse those ties to [12,11], which is unsorted. Stability is what preserves the lower-digit information.",
    "explanation": "Instability is a correctness problem for LSD passes, not merely a cosmetic change among identical full keys.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 18 (correctness)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 19 (induction)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 20 (stable ties)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "radix-sort",
      "stability",
      "correctness",
      "induction"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct invariant and base case",
        "marks": 2
      },
      {
        "criterion": "Complete two-case inductive step",
        "marks": 4
      },
      {
        "criterion": "Correct conclusion and concrete instability counterexample",
        "marks": 2
      }
    ],
    "hintSteps": [
      "State the invariant in terms of all processed low-order digits together.",
      "Separate a pair with different current digits from a pair with equal current digits."
    ],
    "walkthroughSteps": [
      "Establish the one-digit base case.",
      "Prove the different-digit and tied-digit cases, using stability in the latter.",
      "Conclude at d digits and construct an unstable-pass counterexample."
    ]
  },
  {
    "id": "alg-e1-sh-27",
    "type": "free",
    "prompt": "Bit-group radix tradeoff. Sort n unsigned b-bit integers using stable counting sort on groups of r bits, where 1<=r<=b and missing high bits are zero. Derive the time with a ceiling on the number of passes and the auxiliary space. Under b>=floor(log₂n)>=1, analyze r=floor(log₂n). Evaluate n=1024,b=32 for r=1,10,16 by listing passes, digit buckets, and passes×(n+buckets).",
    "sampleAnswer": "Each r-bit digit has 2^r values, and there are `ceil(b/r)` passes. Time is **Θ(ceil(b/r)(n+2^r))**, with Θ(n+2^r) reusable space. For r=floor(log₂n) and b>=r, 2^r<=n and r=Θ(log n), so time is Θ(n ceil(b/log n)); when b>=log n this is commonly written Θ(bn/log n). If b is smaller, choose r<=b rather than taking an invalid bit group size.\n\n| r | passes | buckets | passes×(n+buckets) |\n|---:|---:|---:|---:|\n| 1 | 32 | 2 | 32832 |\n| 10 | 4 | 1024 | 8192 |\n| 16 | 2 | 65536 | 133120 |\n\nThese proxy work counts compare the tradeoff; they are not exact instruction counts. Very small r creates many passes; very large r creates a costly bucket array.",
    "explanation": "The lecture’s log₂n choice needs the r<=b constraint and a ceiling when b is not divisible by r.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 21 (b-bit keys and digit-size tradeoff)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "radix-sort",
      "linear-sorting",
      "complexity"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct ceiling-based time and auxiliary space",
        "marks": 3
      },
      {
        "criterion": "Correct log₂n simplification with domain constraints",
        "marks": 3
      },
      {
        "criterion": "Correct three numerical comparisons and interpretation",
        "marks": 3
      }
    ],
    "hintSteps": [
      "A digit’s bucket range is exponential in its bit width.",
      "The number of passes rounds upward, even when the last group has fewer than r bits."
    ],
    "walkthroughSteps": [
      "Count 2^r buckets and ceil(b/r) passes.",
      "Choose r near log₂n while respecting r<=b.",
      "Compute the three concrete work proxies and explain the time-space tradeoff."
    ]
  },
  {
    "id": "alg-e1-sh-28",
    "type": "free",
    "prompt": "Stable multi-key sorting from the census-record slide. Use the following teaching records (name, sex, exact age, marital status), initially in this order:\n`John M 32 Married; Mary F 25 Not Married; Alice F 28 Married; Bob M 34 Not Married; Tom M 22 Not Married; Jane F 37 Married`.\nSort primarily by marital status (Married before Not Married), secondarily by sex (F before M), and finally by increasing exact age. State the order of stable passes and give the record-name order after EACH pass. This version uses exact age to make the slide’s unspecified age-group convention explicit.",
    "sampleAnswer": "The least important key is age, then sex, then marital status, so apply stable passes in that order.\nAge pass: `Tom, Mary, Alice, John, Bob, Jane`.\nSex pass: `Mary, Alice, Jane, Tom, John, Bob`.\nMarital-status pass: `Alice, Jane, John, Mary, Tom, Bob`.\nFinal tuples by priority are Married/F: Alice(28),Jane(37); Married/M: John(32); Not Married/F: Mary(25); Not Married/M: Tom(22),Bob(34). Each more important-key pass preserves prior ordering among its ties. Sorting the highest-priority field first and then globally sorting lower fields would overwrite the primary ordering.",
    "explanation": "The actual slide records are preserved, while exact age replaces ambiguous age-group boundaries. Repeated stable passes implement lexicographic key priorities from least to most significant.",
    "references": [
      "Lecture10-sort-in-linear-time.pdf, PDF page 24 (record data)",
      "Lecture10-sort-in-linear-time.pdf, PDF page 26 (stable key-pass order)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "radix-sort",
      "stability",
      "multi-key-sorting"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct least-to-most-important pass order",
        "marks": 2
      },
      {
        "criterion": "Correct three record-name arrays",
        "marks": 6
      },
      {
        "criterion": "Explains preserved tie order and specified age adaptation",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The last pass must be the primary key.",
      "Keep the earlier age order inside each sex group and then inside each marital-status group."
    ],
    "walkthroughSteps": [
      "Stably sort increasing ages.",
      "Stably sort F before M without disrupting ages within each sex.",
      "Stably sort Married before Not Married while preserving both secondary and tertiary order."
    ]
  },
  {
    "id": "alg-e1-sh-29",
    "type": "free",
    "prompt": "Pairwise minimum/maximum. Describe how to find both extrema in an array using pairwise comparisons. Derive the exact comparison counts for even and odd n, including initialization. Evaluate n=12 and n=11 and compare with two separate scans. The slide writes 3(n−2)/2 for the even case’s remaining pairs; explain the initial comparison needed for a complete count.",
    "sampleAnswer": "For even n, first compare A[1],A[2] once to initialize min and max. For each of the remaining (n−2)/2 pairs, compare the pair, compare its smaller key with min, and compare its larger key with max: three comparisons. Total is `1+3(n−2)/2=**3n/2−2**`.\nFor odd n, initialize both extrema to A[1] without a comparison, then process the remaining (n−1)/2 pairs. Total is **3(n−1)/2**.\nAt n=12 the paired method takes 16 comparisons versus 2n−2=22 for separate min/max scans. At n=11 it takes 15 versus 20. The pair comparison prevents wasting a min comparison on the larger member or a max comparison on the smaller member. The slide’s 3(n−2)/2 counts the work AFTER the first-pair initialization; the complete even-n algorithm must add its one comparison.",
    "explanation": "The full comparison count includes initialization. The invariant keeps one current minimum and maximum after every processed pair.",
    "references": [
      "Lecture12-order-statistics.pdf, PDF page 3 (minimum/maximum)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "selection",
      "min-max",
      "comparison-count"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct pairwise algorithm and initialization",
        "marks": 3
      },
      {
        "criterion": "Correct even/odd formulas including initial comparison",
        "marks": 3
      },
      {
        "criterion": "Correct numerical comparisons and slide-count clarification",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Even n needs one initial pair comparison; odd n can initialize from a single key.",
      "Each subsequent pair contributes exactly three comparisons."
    ],
    "walkthroughSteps": [
      "Initialize extrema according to parity.",
      "Count remaining pairs and add any initial comparison.",
      "Evaluate the two n values and compare against 2n−2."
    ]
  },
  {
    "id": "alg-e1-sh-30",
    "type": "free",
    "prompt": "RANDOMIZED-SELECT slide trace. Find the fifth-smallest key of A=[6,19,4,12,14,9,15,7,8,11,3,13,2,5,10]. Use 1-based inclusive p,r and i as a rank WITHIN A[p..r]. For this specified random run, choose pivot VALUES 14,4,13,7,5 in that order; swap each chosen key with A[r] before the Lomuto partition below. After each partition give the full array, q, k=q−p+1, and next (p,r,i). Return immediately if i=k; if i<k recurse left with i unchanged, otherwise recurse right with i−k. A one-element range returns its key.\n\nUse 1-based Lomuto PARTITION, including self-swaps:\n```text\nx = A[r]; i = p - 1\nfor j = p to r - 1:\n    if A[j] <= x:\n        i = i + 1\n        exchange A[i] and A[j]\nexchange A[i+1] and A[r]\nreturn i+1\n```",
    "sampleAnswer": "| p | r | requested local rank i | pivot | q | k=q−p+1 | next call |\n|---:|---:|---:|---:|---:|---:|---|\n| 1 | 15 | 5 | 14 | 13 | 13 | (1,12,5) |\n| 1 | 12 | 5 | 4 | 3 | 3 | (4,12,2) |\n| 4 | 12 | 2 | 13 | 12 | 9 | (4,11,2) |\n| 4 | 11 | 2 | 7 | 6 | 3 | (4,5,2) |\n| 4 | 5 | 2 | 5 | 4 | 1 | (5,5,1) |\n\nAfter pivot 14: `[6, 4, 12, 10, 9, 7, 8, 11, 3, 13, 2, 5, 14, 19, 15]`.\nAfter pivot 4: `[3, 2, 4, 10, 9, 7, 8, 11, 6, 13, 5, 12, 14, 19, 15]`.\nAfter pivot 13: `[3, 2, 4, 10, 9, 7, 8, 11, 6, 12, 5, 13, 14, 19, 15]`.\nAfter pivot 7: `[3, 2, 4, 5, 6, 7, 8, 11, 9, 12, 10, 13, 14, 19, 15]`.\nAfter pivot 5: `[3, 2, 4, 5, 6, 7, 8, 11, 9, 12, 10, 13, 14, 19, 15]`.\n\nThe final base call is (5,5,1), which returns **6**. The sorted values begin [2,3,4,5,6,...], confirming the answer. Rank is relative to the CURRENT subarray: when pivot 4 has k=3, discard its three lowest keys and search for local rank 5−3=2 in positions 4..12. Later pivot 5 has local k=1, so the next local rank becomes 1.",
    "explanation": "This preserves the actual lecture trace’s array and pivot sequence. Explicit pivot values remove randomness from this tracing exercise, while the algorithm remains RANDOMIZED-SELECT in general.",
    "references": [
      "Lecture12-order-statistics.pdf, PDF page 4 (algorithm)",
      "Lecture12-order-statistics.pdf, PDF page 7 (PARTITION)",
      "Lecture12-order-statistics.pdf, PDF page 8 (full trace)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "selection",
      "randomized-select",
      "partition",
      "trace"
    ],
    "points": 11,
    "rubric": [
      {
        "criterion": "Correct five partitioned whole arrays",
        "marks": 5
      },
      {
        "criterion": "Correct q,k and next p,r,i values throughout",
        "marks": 4
      },
      {
        "criterion": "Correct returned fifth-smallest key and relative-rank explanation",
        "marks": 2
      }
    ],
    "hintSteps": [
      "k=q−p+1 counts keys from the current p through the pivot, not from array index 1.",
      "Only subtract k when recursing right; a left recursion keeps the requested local rank."
    ],
    "walkthroughSteps": [
      "Move each specified pivot to r and partition the current range.",
      "Use q,p to calculate k and choose exactly one recursion side.",
      "Update local ranks only on right recursion; return 6 from the final singleton."
    ]
  },
  {
    "id": "alg-e1-sh-31",
    "type": "free",
    "prompt": "Analyze RANDOMIZED-SELECT on n DISTINCT keys. Contrast its one-side recursion with quicksort, give its worst-case recurrence, and prove an expected O(n) bound by substitution using a uniformly random pivot rank. You may upper-bound the remaining side by max(k−1,n−k), where k is the pivot rank. Assume the partition toll is at most an and constant positive bases. State the tight expected bound for this implementation.",
    "sampleAnswer": "Selection recurses only into the side containing the requested rank, while quicksort sorts both sides. Repeated extreme pivots on a rank that remains in the large side give `T(n)=T(n−1)+Θ(n)=Θ(n²)` worst-case time.\nFor the expectation, assume every smaller selection problem has expected time <=c times its size. Each k=1..n is equally likely, and the retained side has at most `max(k−1,n−k)` keys. Thus\n`E[T(n)] <= (c/n) Σ_(k=1)^n max(k−1,n−k) + an <= (3c/4)n+an`.\nThe arithmetic sum divided by n is at most 3n/4 (for even n it is 3n/4−1/2; for odd n it is 3n/4−1/2−1/(4n)). Choosing c>=4a, enlarged for the bases, closes `E[T(n)]<=cn`. A top-level partition scans Θ(n) keys for non-base inputs, so expected time is **Θ(n)**. The Θ(n²) worst case is still possible; expectation is over pivots, not a random input-order assumption.",
    "explanation": "Bounding by the larger side gives a valid expected upper bound even though the requested rank may choose the smaller side or the pivot may immediately answer it.",
    "references": [
      "Lecture12-order-statistics.pdf, PDF page 5 (one-side recursion)",
      "Lecture12-order-statistics.pdf, PDF page 9 (lucky/unlucky)",
      "Lecture12-order-statistics.pdf, PDF page 13 (random split)",
      "Lecture12-order-statistics.pdf, PDF page 14 (larger-side bound)",
      "Lecture12-order-statistics.pdf, PDF page 20 (expected result)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "selection",
      "randomized-select",
      "expectation",
      "substitution"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct one-side versus two-side distinction and Θ(n²) worst case",
        "marks": 3
      },
      {
        "criterion": "Valid expected recurrence/bound and cn substitution",
        "marks": 5
      },
      {
        "criterion": "Correct coefficient/base choice and tight expected Θ(n)",
        "marks": 2
      }
    ],
    "hintSteps": [
      "A uniformly random pivot has a uniform rank among distinct keys.",
      "If the expected retained size is at most 3n/4, reserve one quarter of cn to pay for an."
    ],
    "walkthroughSteps": [
      "Separate the actual selected side from the larger-side upper bound.",
      "Average that upper bound over all ranks and substitute the cn induction hypothesis.",
      "Choose c>=4a, cover bases, and combine with the direct scan lower bound."
    ]
  },
  {
    "id": "alg-e1-sh-32",
    "type": "free",
    "prompt": "Deterministic SELECT with groups of five. Suppose n=100 distinct keys are divided into exactly 20 full groups, each sorted. Select the lower median (10th-smallest) of the 20 group medians as pivot x. Without seeing the individual keys, guarantee how many original keys are <=x and >=x, and upper-bound either strict partition side. Give the usual asymptotic recurrence. Also explain the lecture’s looser `T(n)<=T(n/5)+T(3n/4)+an` large-n bound and show a sufficient linear substitution coefficient.",
    "sampleAnswer": "At least 10 group medians are <=x, and at least 10 are >=x (in fact 11 are >=x under the lower-median convention). Each such group contributes three keys on that same non-strict side. Thus at least **30 keys are <=x and 33 are >=x**. The strict right side has at most 100−30=**70** keys; the strict left has at most 100−33=**67** keys. Either side is therefore at most 70. These counts include x, which is not recursively searched; distinctness makes the strict-side size bounds valid.\nFor general n, small rounding/incomplete-group adjustments give `T(n)<=T(ceil(n/5))+T(7n/10+O(1))+Θ(n)`. The lecture relaxes the discard guarantee to at least n/4 for sufficiently large n (its cutoff is n>=50), permitting the looser recurrence `T(n)<=T(n/5)+T(3n/4)+an` and direct constant-size handling below the cutoff. The two fractions sum to 19/20. Assuming T(m)<=cm gives `T(n)<=19cn/20+an<=cn` when **c>=20a**, enlarged for bases. Both versions prove O(n), and the input scan makes the bound Θ(n).",
    "explanation": "The concrete 100-key setup avoids incomplete groups and makes the non-strict counts explicit. The lecture intentionally uses a weaker 3/4 surviving-side bound for an easier substitution proof.",
    "references": [
      "Lecture12-order-statistics.pdf, PDF page 21 (groups of five)",
      "Lecture12-order-statistics.pdf, PDF page 26 (discard count)",
      "Lecture12-order-statistics.pdf, PDF page 27 (n>=50 cutoff)",
      "Lecture12-order-statistics.pdf, PDF page 28 (relaxed recurrence)",
      "Lecture12-order-statistics.pdf, PDF page 29 (substitution)"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "selection",
      "median-of-medians",
      "substitution"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct 30/33 guaranteed counts, 67/70 strict-side bounds, and either-side bound 70",
        "marks": 3
      },
      {
        "criterion": "Correct general and relaxed recurrences with rounding/base conventions",
        "marks": 3
      },
      {
        "criterion": "Correct c>=20a substitution and Θ(n) conclusion",
        "marks": 3
      }
    ],
    "hintSteps": [
      "For each median <=x, its two smaller group keys are also <=x.",
      "The relaxed recurrence has child fractions 1/5 and 3/4, leaving 1/20 slack."
    ],
    "walkthroughSteps": [
      "Count at least ten qualifying full groups on each side.",
      "Multiply by three and translate non-strict counts to strict recursive-side bounds.",
      "Substitute cn into the relaxed recurrence and choose c>=20a."
    ]
  },
  {
    "id": "alg-e1-sh-33",
    "type": "free",
    "prompt": "Complete the lecture’s data-structure comparison table for WORST-case search for an arbitrary specified key and insertion: unsorted dynamic array (append), sorted array (maintain order), unsorted singly linked list (insert at known head), unbalanced BST, balanced BST, binary min-heap. For dynamic-array append use amortized cost; assume RAM comparisons and sufficient array capacity for heap insertion. Then explain array versus linked-list index access, deletion given a node in a doubly linked list, and what multiple links per record can support. Finally trace a stack pushing 8,15,9 then popping once, and a queue enqueuing 12,8,5 then dequeuing once.",
    "sampleAnswer": "| Structure | arbitrary-key search, worst case | insertion |\n|---|---|---|\n| Unsorted dynamic array | Θ(n) | append Θ(1) amortized |\n| Sorted array | Θ(log n) via binary search | Θ(n) worst case for shifting |\n| Unsorted singly linked list | Θ(n) | Θ(1) at known head |\n| Unbalanced BST | Θ(n) when skewed | Θ(n) worst case |\n| Balanced BST | Θ(log n) | Θ(log n) worst case |\n| Binary min-heap | Θ(n) for arbitrary key | Θ(log n) worst case |\n\nArrays access a known index in Θ(1); following linked-list links to index i may take Θ(n). Given an actual doubly linked node and its links, deletion adjusts a constant number of neighbor links in Θ(1), but searching by key first may still cost Θ(n). Multiple independent link fields can maintain multiple orderings (such as row and column lists in a sparse matrix), at an extra storage/update cost.\nThe stack is LIFO: after pushes its bottom-to-top order is [8,15,9], so pop returns **9**, leaving [8,15]. The queue is FIFO: its front-to-back order is [12,8,5], so dequeue returns **12**, leaving [8,5]. A min-heap offers Θ(1) access to its minimum, but that does not imply logarithmic search for an arbitrary key.",
    "explanation": "The slide’s general tree/heap summary needs an operation-specific distinction: heap ordering is weaker than BST ordering. “Constant-time list insertion/deletion” also requires a known position/node.",
    "references": [
      "Lecture13-hashing.pdf, PDF page 4 (array costs)",
      "Lecture13-hashing.pdf, PDF page 8 (linked-list costs)",
      "Lecture13-hashing.pdf, PDF page 10 (doubly linked deletion)",
      "Lecture13-hashing.pdf, PDF page 12 (multiple links)",
      "Lecture13-hashing.pdf, PDF page 14 (sparse matrix)",
      "Lecture13-hashing.pdf, PDF page 17 (stack)",
      "Lecture13-hashing.pdf, PDF page 18 (queue)",
      "Lecture13-hashing.pdf, PDF page 20 (blank comparison table)"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "data-structures",
      "hashing",
      "complexity"
    ],
    "points": 11,
    "rubric": [
      {
        "criterion": "Correct six table rows with operation/cost assumptions",
        "marks": 6
      },
      {
        "criterion": "Correct indexing, known-node deletion, and multiple-link explanations",
        "marks": 3
      },
      {
        "criterion": "Correct stack/queue returned keys and remaining sequences",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Distinguish finding a key from modifying a position already known.",
      "Heap parents are ordered relative to children, but the two child subtrees are not ordered by key relative to one another."
    ],
    "walkthroughSteps": [
      "Fill search and insertion columns with the stated capacity/amortization assumptions.",
      "Explain random access versus traversing links and known-node deletion.",
      "Trace last-in-first-out stack and first-in-first-out queue removals."
    ]
  },
  {
    "id": "alg-e1-sh-34",
    "type": "free",
    "prompt": "Chaining example 15.8. Insert keys [7,24,18,52,36,54,11,23] into nine initially empty buckets indexed 0..8 using h(k)=k mod 9. Append each colliding key at the tail of its chain. Show the final table, every key’s hash, the load factor, and how many key comparisons an unsuccessful search for 45 makes (exclude calculating its hash). Contrast this with direct addressing for a universe of keys 1..150: operations and storage.",
    "sampleAnswer": "Hashes, in insertion order: `7→7,24→6,18→0,52→7,36→0,54→0,11→2,23→5`.\n\n| slot | chain, head to tail |\n|---:|---|\n| 0 | 18 → 36 → 54 |\n| 1 | EMPTY |\n| 2 | 11 |\n| 3 | EMPTY |\n| 4 | EMPTY |\n| 5 | 23 |\n| 6 | 24 |\n| 7 | 7 → 52 |\n| 8 | EMPTY |\n\nLoad factor **α=8/9**. Key 45 hashes to bucket 0 and is compared with 18,36,54, so its unsuccessful search uses **3 key comparisons**, plus constant hash/bucket overhead. Direct addressing uses one slot per possible key in 1..150 and provides Θ(1) search/insert/delete by index, but needs Θ(|U|)=Θ(150) slots whether many keys are stored or not. Hashing stores a smaller bucket array plus the actual chained records, Θ(m+n) space; collisions are unavoidable in general when |U|>m. Chaining can store more than m keys because buckets hold lists.",
    "explanation": "This is the exact chained-table slide example. Appending is specified because head insertion would produce different but valid chain orders.",
    "references": [
      "Lecture13-hashing.pdf, PDF page 21 (direct addressing)",
      "Lecture13-hashing.pdf, PDF page 28 (example 15.8)",
      "Lecture13-hashing.pdf, PDF page 29 (collisions)",
      "Lecture13-hashing.pdf, PDF page 30 (final chains)",
      "Lecture13-hashing.pdf, PDF page 31 (n may exceed m)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "chaining",
      "direct-addressing",
      "trace"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct hashes and complete nine-bucket table",
        "marks": 5
      },
      {
        "criterion": "Correct α and unsuccessful-search comparison count",
        "marks": 2
      },
      {
        "criterion": "Correct direct-addressing costs, storage contrast, and collision explanation",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Reduce each key modulo 9 and preserve insertion order within a bucket.",
      "The load factor uses all eight stored keys, not just nonempty buckets."
    ],
    "walkthroughSteps": [
      "Compute all eight home buckets and append collisions.",
      "Count bucket 0 comparisons for key 45 and calculate α.",
      "Compare universe-sized direct addressing with bucket-sized hashing."
    ]
  },
  {
    "id": "alg-e1-sh-35",
    "type": "free",
    "prompt": "Chaining analysis and hash quality. Under simple uniform hashing, explain expected unsuccessful and successful search growth in terms of α=n/m. For n=100,m=25, compute α and interpret Θ(1+α). Can α exceed 1 for chaining? Give a concrete key pattern making h(k)=k mod 10 poor, and explain why deterministic hashing is required for lookups but does not itself guarantee uniformity or eliminate collisions.",
    "sampleAnswer": "α=100/25=**4**. Under simple uniform hashing, a queried bucket has expected length n/m=α; unsuccessful search takes Θ(1+α), counting hash/bucket overhead plus the chain scan. Successful search also has expected Θ(1+α) under standard uniform-key search and hashing assumptions. Thus this table has growth Θ(5), a constant for this specified load; Θ notation does not say that every lookup performs exactly five comparisons. Expected O(1) is maintained when α remains O(1) as n grows.\nChaining permits α>1 because keys live in per-bucket lists. If keys are [10,20,30,...,100], then k mod 10 sends all of them to bucket 0; searches can take Θ(n), despite the average load being 1 for those ten keys. Even-only keys with m=10 use only even buckets. A hash must return the same bucket for the same key during a table’s lifetime so lookup can find it. Determinism is consistency, not a distribution guarantee; different keys can still collide.",
    "explanation": "Uniform-hashing assumptions cannot be inferred simply from a small load factor. Structured inputs can defeat a fixed division hash.",
    "references": [
      "Lecture13-hashing.pdf, PDF page 32 (load factor)",
      "Lecture13-hashing.pdf, PDF page 33 (uniform chaining search)",
      "Lecture13-hashing.pdf, PDF page 34 (mod-10 skew)",
      "Lecture13-hashing.pdf, PDF page 35 (hash properties)",
      "Lecture15-hashing-part3.pdf, PDF page 4 (successful/unsuccessful chaining)"
    ],
    "difficulty": "med",
    "homeworkFormat": "short",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "chaining",
      "load-factor",
      "expectation"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct α, expected bounds, and interpretation of Θ",
        "marks": 4
      },
      {
        "criterion": "Correct α>1 and constant-load conditions",
        "marks": 2
      },
      {
        "criterion": "Concrete bad-key pattern and correct consistency/distribution distinction",
        "marks": 3
      }
    ],
    "hintSteps": [
      "A table can have modest average load while all keys share one bucket.",
      "Separate a hash’s repeatability from how evenly it spreads a chosen key set."
    ],
    "walkthroughSteps": [
      "Calculate n/m and relate bucket length to expected search cost.",
      "Explain why chain capacity allows α>1 and what bounds constant expected cost.",
      "Construct a mod-10 collision pattern and explain deterministic consistency."
    ]
  },
  {
    "id": "alg-e1-sh-36",
    "type": "free",
    "prompt": "Division and multiplication hash calculations. (a) For k=1011000111011010₂ and m=2⁶, compute k mod m and explain which bits matter. Why can this be poor on structured keys, and does choosing a prime guarantee no collisions? (b) Use the slide’s EXACT constant A=0.618033, m=1000,k=12345 in h(k)=floor(m·frac(kA)). Show the fractional part and final index; do not silently replace A by a higher-precision golden-ratio value.",
    "sampleAnswer": "(a) Modulo 64 retains the six low bits, `011010₂`, so **h(k)=26**. Two keys whose difference is a multiple of 64 have the same low six bits and collide; high bits do not influence this hash. A suitably chosen prime modulus can reduce some regular-pattern problems but cannot guarantee uniformity or collision freedom for all key sets. For any fixed modulus m, keys separated by m still collide.\n(b) With the stated decimal constant, `12345×0.618033=7629.617385`. Its fractional part is **0.617385**, and `floor(1000×0.617385)=floor(617.385)=**617**`. The floor is taken after multiplying the fractional part by m. Hash indices must be integers in 0..m−1.",
    "explanation": "The multiplication example uses a truncated A from the slide. Stating it exactly keeps the numeric answer reproducible.",
    "references": [
      "Lecture14-hashing-part2.pdf, PDF page 4 (division method)",
      "Lecture14-hashing-part2.pdf, PDF page 5 (binary key and low bits)",
      "Lecture14-hashing-part2.pdf, PDF page 7 (multiplication method)",
      "Lecture14-hashing-part2.pdf, PDF page 8 (example 15.2)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "division-method",
      "multiplication-method"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct binary remainder and low-bit explanation",
        "marks": 3
      },
      {
        "criterion": "Correct structured-input/prime limitations",
        "marks": 2
      },
      {
        "criterion": "Correct multiplication intermediate values and h=617",
        "marks": 3
      }
    ],
    "hintSteps": [
      "For a power-of-two modulus, read only the specified number of low bits.",
      "The multiplication hash discards the integer part BEFORE multiplying by m and flooring."
    ],
    "walkthroughSteps": [
      "Extract 011010₂ and convert it to 26.",
      "Explain a repeatable multiple-of-m collision pattern.",
      "Compute 7629.617385, take fractional part, then floor 617.385."
    ]
  },
  {
    "id": "alg-e1-sh-37",
    "type": "free",
    "prompt": "Mid-square and folding slide exercises. (a) The table has 100 slots. Square keys 1234 and 5642, then take the 3rd and 4th decimal digits FROM THE RIGHT, equivalently floor(k²/100) mod 100. Give both hashes. (b) For a 100-slot folding hash, split the decimal representation LEFT TO RIGHT into two-digit groups, with the last group allowed one digit; add group values and reduce mod 100. Hash 5678,321,34567. State the grouping convention that makes 321 unambiguous.",
    "sampleAnswer": "(a) `1234²=1522756`; taking the specified pair gives **27**. `5642²=31832164`; the specified pair is **21**. The algebraic rule floor(k²/100) mod 100 fixes which “middle” digits to use even when squared values have different lengths.\n(b) `5678: 56+78=134 → **34**`; `321: 32+1=33 → **33**`; `34567: 34+56+7=97 → **97**`. Groups start at the LEFT, so 321 is 32|1, not 3|21. Reducing modulo 100 discards the carry beyond the last two sum digits.",
    "explanation": "Both exercises reproduce the supplied keys. Explicit digit positions and left-to-right grouping avoid otherwise ambiguous versions of these hash methods.",
    "references": [
      "Lecture14-hashing-part2.pdf, PDF page 10 (example 15.3)",
      "Lecture14-hashing-part2.pdf, PDF page 11 (folding method)",
      "Lecture14-hashing-part2.pdf, PDF page 12 (folding example)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "mid-square",
      "folding"
    ],
    "points": 8,
    "rubric": [
      {
        "criterion": "Correct squares and mid-square values 27,21",
        "marks": 3
      },
      {
        "criterion": "Correct three folding splits, sums, and final hashes",
        "marks": 4
      },
      {
        "criterion": "Correct explanation of explicit digit/grouping conventions",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Use the formula, not an unspecified visual midpoint of the square.",
      "The final short folding group stays at the right."
    ],
    "walkthroughSteps": [
      "Square each key and remove its last two digits, then keep the next two.",
      "Split each folding key into left-origin two-digit groups.",
      "Sum and reduce modulo 100."
    ]
  },
  {
    "id": "alg-e1-sh-38",
    "type": "free",
    "prompt": "Linear-probing example 15.5. Insert [72,27,36,24,63,81,92,101] in that order into an initially EMPTY table with slots 0..9 and h(k,i)=(k mod 10+i) mod 10, i=0,1,...,9. List EVERY probed slot for each key and the final table. Then give the probe path and count for searching 101 and unsuccessfully searching 102. A search stops at the matching key or the first never-used EMPTY; count all visited slots, including the terminating one.",
    "sampleAnswer": "Insertion paths: **72: 2; 27: 7; 36: 6; 24: 4; 63: 3; 81: 1; 92: 2→3→4→5; 101: 1→2→3→4→5→6→7→8**.\nFinal slots 0..9: `[EMPTY,81,72,63,24,92,36,27,101,EMPTY]`.\nSearching 101 probes `1→2→3→4→5→6→7→8`, finding it in **8 probes**. Searching 102 probes `2→3→4→5→6→7→8→9`, reaching EMPTY at slot 9 in **8 probes**. These long scans reflect the contiguous occupied cluster. A linear step of 1 modulo 10 visits all ten slots if needed; this property is not automatic for every open-addressing probe rule.",
    "explanation": "The lecture’s original key sequence and home hash are retained. Distinguish the probe number i from the resulting table index.",
    "references": [
      "Lecture14-hashing-part2.pdf, PDF page 15 (linear formula)",
      "Lecture14-hashing-part2.pdf, PDF page 16 (example 15.5)",
      "Lecture14-hashing-part2.pdf, PDF page 17 (insertion)",
      "Lecture14-hashing-part2.pdf, PDF page 18 (insertion)",
      "Lecture14-hashing-part2.pdf, PDF page 19 (92 collisions)",
      "Lecture14-hashing-part2.pdf, PDF page 20 (101 collisions)",
      "Lecture14-hashing-part2.pdf, PDF page 21 (search)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "open-addressing",
      "linear-probing",
      "trace"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct complete insertion paths",
        "marks": 4
      },
      {
        "criterion": "Correct final ten-slot table",
        "marks": 2
      },
      {
        "criterion": "Correct two search paths/counts and cluster interpretation",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Recompute from the home slot using i; do not repeatedly add the total offset to the previous slot.",
      "Count the final successful or EMPTY slot as a probe."
    ],
    "walkthroughSteps": [
      "Compute homes and scan successive slots, wrapping modulo 10.",
      "Place 92 at 5 and 101 at 8 after their collision runs.",
      "Follow the same probe rule during both searches."
    ]
  },
  {
    "id": "alg-e1-sh-39",
    "type": "free",
    "prompt": "Quadratic-probing example 15.6. Insert [72,27,36,24,63,81,101] into an initially EMPTY 10-slot table using h(k,i)=(k mod 10+i+3i²) mod 10 for i=0..9. Give insertion paths and final table. Afterward attempt key 111: list all ten probe indices and decide whether insertion succeeds, even though the table has empty slots. Explain why trying m probe numbers need not mean trying m DIFFERENT slots.",
    "sampleAnswer": "The first six keys use their home slots: 72→2,27→7,36→6,24→4,63→3,81→1. Key 101 probes **1→5**, so the final slots 0..9 are `[EMPTY,81,72,63,24,101,36,27,EMPTY,EMPTY]`.\nKey 111 also has home 1. For i=0..9 its indices are **[1,5,5,1,3,1,5,5,1,3]**. Slots 1,5,3 are all occupied, so insertion fails under this probe rule, although slots 0,8,9 are empty. The quadratic offsets modulo 10 repeat and cover only {0,2,4}; this sequence visits only three distinct slots for each home. A finite probe-number limit prevents nontermination, but table/probe constants must be chosen carefully for coverage guarantees.",
    "explanation": "The actual slide inserts 101 successfully. The added 111 attempt exposes the coverage limitation of its exact m,c1,c2 choices.",
    "references": [
      "Lecture14-hashing-part2.pdf, PDF page 22 (example 15.6 and formula)",
      "Lecture14-hashing-part2.pdf, PDF page 23 (insertion)",
      "Lecture14-hashing-part2.pdf, PDF page 24 (insertion)",
      "Lecture14-hashing-part2.pdf, PDF page 25 (101 collision)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "open-addressing",
      "quadratic-probing",
      "trace",
      "additional-practice"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct original insertion paths and final table",
        "marks": 4
      },
      {
        "criterion": "Correct ten-index sequence and failure for 111",
        "marks": 3
      },
      {
        "criterion": "Explains repeated probes and lack of full coverage",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Calculate each h(k,i) from the original home and the current i.",
      "For a second key with home 1, enumerate the indices even when they repeat."
    ],
    "walkthroughSteps": [
      "Insert the six noncolliding keys and then 101 at index 5.",
      "Enumerate i+3i² modulo 10 for i=0..9.",
      "Recognize that the three reachable slots are occupied and empty slots elsewhere do not help."
    ]
  },
  {
    "id": "alg-e1-sh-40",
    "type": "free",
    "prompt": "Double-hashing example 15.7, including its limitation. Use an initially EMPTY table of size m=10, h1(k)=k mod 10, h2(k)=k mod 8, and h(k,i)=(h1(k)+i·h2(k)) mod 10 for i=0..9. Attempt [72,27,36,24,63,81,92,101] in that order. Show all insertion probe paths and the final occupied slots; if a key cannot be inserted, report failure instead of silently changing the slide’s hash. State the arithmetic condition for a full-length double-hash cycle and propose one valid prime-table construction.",
    "sampleAnswer": "Paths through the first seven keys: `72:2;27:7;36:6;24:4;63:3;81:1;92:2→6→0`. Their table is `[92,81,72,63,24,EMPTY,36,27,EMPTY,EMPTY]`.\nFor 101, h1=1 and h2=5, so its ten probes are **1,6,1,6,1,6,1,6,1,6**. Both reachable slots are occupied; **101 cannot be inserted**, even though 5,8,9 are empty. The supplied functions therefore do not guarantee insertion into an available table slot. Some other keys have step 0 as well (72 and 24), harmless only when their first slot is empty.\nA double-hashing sequence has cycle length `m/gcd(h2(k),m)`; to visit every slot require gcd(step,m)=1. In particular the step must be nonzero modulo m. A valid example uses prime m=11, `h1(k)=k mod 11`, `h2(k)=1+(k mod 10)`, giving steps 1..10 all coprime to 11.",
    "explanation": "The slides work through insertion of 92 but do not establish success for their listed final key 101. This answer preserves their exact functions and reports the actual cycle failure.",
    "references": [
      "Lecture14-hashing-part2.pdf, PDF page 27 (double-hashing formula)",
      "Lecture14-hashing-part2.pdf, PDF page 28 (example 15.7)",
      "Lecture14-hashing-part2.pdf, PDF page 29 (insertion)",
      "Lecture14-hashing-part2.pdf, PDF page 30 (insertion)",
      "Lecture14-hashing-part2.pdf, PDF page 31 (92 trace)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "open-addressing",
      "double-hashing",
      "trace"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct first-seven probe paths and table",
        "marks": 4
      },
      {
        "criterion": "Correct 101 failure with its repeated two-slot sequence",
        "marks": 3
      },
      {
        "criterion": "Correct gcd/cycle condition and valid redesign",
        "marks": 3
      }
    ],
    "hintSteps": [
      "A constant step d modulo m visits m/gcd(d,m) distinct slots.",
      "Compute 101 mod 8 before assuming that this “second hash” is a valid step."
    ],
    "walkthroughSteps": [
      "Insert through 92 using the exact slide functions.",
      "Enumerate 101’s step-5 cycle and report the failure.",
      "Require a step coprime with m and construct nonzero steps for a prime-sized table."
    ]
  },
  {
    "id": "alg-e1-sh-41",
    "type": "free",
    "prompt": "Rehashing slide plus deletion extension. A size-5 table with h(k)=k mod 5 contains keys 26,31,43,17. Resize to 10 slots and use hnew(k)=k mod 10. Give each new home and the final table (no new-home collisions). Explain why copying old slot positions is wrong. Separately, an open-addressed LINEAR-probing table of size 10 contains `[EMPTY,81,72,63,24,92,36,27,101,EMPTY]`. Delete 72 at slot 2. Explain why replacing it with never-used EMPTY breaks search for 92, and give a correct tombstone-based search rule.",
    "sampleAnswer": "New homes are **26→6,31→1,43→3,17→7**. New slots 0..9 are `[EMPTY,31,EMPTY,43,EMPTY,EMPTY,26,17,EMPTY,EMPTY]`. Resizing changes the modulus, so every key must be rehashed/reinserted using the new rule. An old occupied position may already reflect a collision rather than the old home, making direct position copying even less reliable.\nIn the separate linear-probing table, 92 has home 2 but was displaced to 5. If deleting 72 changes slot 2 to never-used EMPTY, a search for 92 incorrectly stops immediately at 2. Mark it **DELETED (a tombstone)** instead. Search skips tombstones and continues the usual sequence; it stops only at the matching key, a never-used EMPTY, or after the allowed full probe sequence. For 92 it then visits 2(DELETED),3,4,5 and succeeds. Insertion may reuse a tombstone, while checking for an existing duplicate if the table’s set/map semantics require that.",
    "explanation": "The resize keys and table sizes are from the slide. Tombstones are an explicitly labeled additional-practice extension of the lecture’s open-addressing search stopping rule.",
    "references": [
      "Lecture14-hashing-part2.pdf, PDF page 32 (rehashing example)",
      "Lecture14-hashing-part2.pdf, PDF page 21 (open-addressed search)"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "rehashing",
      "open-addressing",
      "deletion",
      "additional-practice"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct new homes and table",
        "marks": 3
      },
      {
        "criterion": "Explains why every key is rehashed",
        "marks": 2
      },
      {
        "criterion": "Correct deletion failure, tombstone rule, and successful 92 trace",
        "marks": 4
      }
    ],
    "hintSteps": [
      "The table size is part of the hash calculation.",
      "Never-used EMPTY means no later key on that sequence could have crossed it; a deleted occupied slot has a different history."
    ],
    "walkthroughSteps": [
      "Recompute all four hashes using modulus 10.",
      "Build the new table instead of preserving old indices.",
      "Trace why an EMPTY at 2 hides 92, then keep a tombstone and continue searching."
    ]
  },
  {
    "id": "alg-e1-sh-42",
    "type": "free",
    "prompt": "Uniform-probing analysis. An open-addressed table has m slots, n<m occupied, no tombstones, and α=n/m. Assume a queried absent key’s probe sequence is a uniformly random permutation of ALL slots. Derive the expected unsuccessful-search upper bound by a tail sum. State the standard successful-search upper bound under uniform hashing, no deletions, and equally likely stored keys. Evaluate both bounds at α=1/2 and α=9/10. Explain why these are upper bounds rather than exact probe counts for every concrete hash rule.",
    "sampleAnswer": "Let X be the unsuccessful probe count, including the terminating empty slot. For i>=1, X>=i means the preceding i−1 probes all found occupied slots. Under a random permutation,\n`P(X>=i)=Π_(j=0)^(i−2) (n−j)/(m−j) <= α^(i−1)` while enough occupied slots remain, and the probability is zero once more occupied probes are required than exist. Each factor is <=n/m because n<m. Hence\n`E[X]=Σ_(i>=1) P(X>=i) <= Σ_(i>=1) α^(i−1) = **1/(1−α)**`.\nFor successful search, averaging insertion-time bounds over the n equally likely stored keys gives\n`E[successful] <= (1/α) ln(1/(1−α))`. One derivation upper-bounds `(1/n)Σ_(j=0)^(n−1) 1/(1−j/m)` by `(m/n)∫_0^α 1/(1−t)dt`, using increasing integrand and left endpoints.\nAt α=1/2: unsuccessful <=**2**, successful <=**2 ln2≈1.3863**. At α=9/10: unsuccessful <=**10**, successful <=**(10/9)ln10≈2.5584**. These results rely on uniform full-table probe permutations and the stated successful-key/deletion assumptions. Linear/quadratic/double hashing with concrete structured keys need not meet that ideal distribution, and the bounds are expectations, not per-search promises.",
    "explanation": "The lecture’s displayed numeric unsuccessful examples are consequences of a bound, not an exact expected value asserted for every table and probe rule.",
    "references": [
      "Lecture15-hashing-part3.pdf, PDF page 5 (uniform-probing assumption)",
      "Lecture15-hashing-part3.pdf, PDF page 6 (tail factors)",
      "Lecture15-hashing-part3.pdf, PDF page 7 (geometric bound)",
      "Lecture15-hashing-part3.pdf, PDF page 8 (load examples)",
      "Lecture15-hashing-part3.pdf, PDF page 9 (successful search)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "open-addressing",
      "load-factor",
      "expectation",
      "uniform-hashing"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct tail-product reasoning and unsuccessful bound",
        "marks": 4
      },
      {
        "criterion": "Correct successful bound and assumptions",
        "marks": 3
      },
      {
        "criterion": "Correct four numerical evaluations and expectation/guarantee distinction",
        "marks": 3
      }
    ],
    "hintSteps": [
      "X>=i depends on the first i−1 probes, not the first i.",
      "Use the tail-sum identity and the convergent geometric series for α<1."
    ],
    "walkthroughSteps": [
      "Bound each occupied-slot conditional probability by α.",
      "Sum tail probabilities to obtain 1/(1−α).",
      "Average insertion costs for the successful bound, substitute both loads, and state assumptions."
    ]
  },
  {
    "id": "alg-e1-sh-43",
    "type": "free",
    "prompt": "Universal hashing and indicators. Define a universal hash family H mapping a key universe U to m buckets, and distinguish its collision guarantee from ideal uniform open-addressing probe permutations. For a FIXED stored set S of n distinct keys and an absent key x fixed independently of the random choice h∈H, derive the expected number of stored keys colliding with x using indicator variables. Repeat for a stored key x∈S, excluding x itself. Does the proof require collision-event independence? What changes if H is merely universal rather than a family with collision probability exactly 1/m?",
    "sampleAnswer": "H is universal when choosing h uniformly from H gives `P(h(x)=h(y))<=1/m` for every fixed distinct pair x,y∈U. This concerns first-bucket collisions; it does not assert uniform permutations of all open-addressed probes.\nFor each y∈S define Ixy=1 if h(x)=h(y), else 0. If x is absent, the number of colliders is Cx=Σ_(y∈S) Ixy, so by linearity `E[Cx]=ΣE[Ixy]<=**n/m**`. If x∈S, exclude it and obtain **E[Cx]<=(n−1)/m**. No independence among these indicators is needed for linearity of expectation. A chain search adds constant hash/bucket overhead, so its expected cost is O(1+n/m).\nFor a generic universal family, E[Ixy]<=1/m, so the calculation is an inequality. Equality holds only when the particular family gives probability exactly 1/m for every pair. The fixed-set/pair guarantee assumes keys are chosen independently of the hidden random function; it does not automatically protect against an adversary adapting keys after observing the function.",
    "explanation": "The lecture uses equality in its indicator calculation; the universal definition itself gives <=. The specific prime dot-product family in the following exercises achieves equality.",
    "references": [
      "Lecture15-hashing-part3.pdf, PDF page 10 (random function choice)",
      "Lecture15-hashing-part3.pdf, PDF page 11 (universal definition)",
      "Lecture15-hashing-part3.pdf, PDF page 12 (collision count)",
      "Lecture15-hashing-part3.pdf, PDF page 13 (indicators)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "universal-hashing",
      "expectation",
      "indicator-variables"
    ],
    "points": 10,
    "rubric": [
      {
        "criterion": "Correct universal definition and probe-permutation distinction",
        "marks": 3
      },
      {
        "criterion": "Correct indicators and n/m versus (n−1)/m expectations",
        "marks": 4
      },
      {
        "criterion": "Correct independence, inequality, and fixed-input caveats",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Define one indicator for each OTHER stored key.",
      "Linearity of expectation works even when the collision events are dependent."
    ],
    "walkthroughSteps": [
      "State the per-distinct-pair <=1/m definition.",
      "Sum indicators for absent and present keys, excluding self-collision.",
      "Explain inequality versus equality, no independence requirement, and fixed-key assumptions."
    ]
  },
  {
    "id": "alg-e1-sh-44",
    "type": "free",
    "prompt": "Universal dot-product slide example. Let m=7 and keys be three-digit vectors k=(k0,k1,k2), each coordinate in 0..6 (base-7 digit values, not decimal concatenations). For a=(2,4,6), use ha(k)=(2k0+4k1+6k2) mod 7. Hash (1,2,3),(2,0,5),(0,1,6), showing each sum. If ALL 3 coefficient coordinates independently range over 0..6, how many functions are in the family? For any fixed pair of distinct keys, how many coefficient vectors cause a collision and what is the probability?",
    "sampleAnswer": "`h(1,2,3)=(2+8+18) mod7=28 mod7=**0**`.\n`h(2,0,5)=(4+0+30) mod7=34 mod7=**6**`.\n`h(0,1,6)=(0+4+36) mod7=40 mod7=**5**`.\nThere are **7³=343** coefficient vectors, including the all-zero vector. They define distinct functions because evaluating on the three unit vectors reveals each coefficient. For a fixed distinct key pair, at least one coordinate difference is nonzero modulo 7. Once the other two coefficients are fixed (7²=49 choices), exactly one value of that coordinate’s coefficient solves the collision equation. Hence **49 functions** cause a collision and probability is **49/343=1/7**. A particular chosen function can have many collisions; universality describes the random family, not collision freedom of each member.",
    "explanation": "These three vector keys and coefficients are the actual image-based example. The zero-coefficient function belongs to the stated family and must be counted.",
    "references": [
      "Lecture15-hashing-part3.pdf, PDF page 14 (family construction)",
      "Lecture15-hashing-part3.pdf, PDF page 15 (three exact vector keys)",
      "Lecture15-hashing-part3.pdf, PDF page 20 (collision count)"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "universal-hashing",
      "modular-arithmetic"
    ],
    "points": 9,
    "rubric": [
      {
        "criterion": "Correct three calculations and residues",
        "marks": 4
      },
      {
        "criterion": "Correct family size and inclusion of zero vector",
        "marks": 2
      },
      {
        "criterion": "Correct 49 collision functions, 1/7 probability, and justification",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Use the coefficient dot product directly; do not first convert the vector to a decimal integer.",
      "There are seven choices independently for every coefficient, and fixing two leaves one collision-solving coefficient."
    ],
    "walkthroughSteps": [
      "Compute the three sums and residues.",
      "Count 7³ coefficient vectors, including zero.",
      "Count 7² collision-causing functions and divide by the family size."
    ]
  },
  {
    "id": "alg-e1-sh-45",
    "type": "free",
    "prompt": "Prove the prime-modulus dot-product hash family universal. Let m be prime; keys are vectors in {0,...,m−1}^{r+1}, and coefficients are chosen uniformly from the same set. Define ha(k)=(Σ_(j=0)^r aj kj) mod m. For two distinct keys x,y, choose a coordinate t with xt!=yt, solve explicitly for at after fixing the other coefficients, and count collision functions. Explain where primeness is used. Give a one-coordinate m=6 counterexample showing why replacing “prime” by an arbitrary composite modulus breaks this proof and can violate the 1/m collision bound.",
    "sampleAnswer": "Because x!=y as digit vectors, some difference dt=xt−yt is nonzero modulo m. Collision is equivalent to `Σaj(xj−yj)≡0 (mod m)`. Fix every aj except at, and rearrange:\n`at ≡ −[Σ_(j!=t) aj(xj−yj)]·(xt−yt)^(-1) (mod m)`.\nPrimeness makes every nonzero residue invertible, so exactly one at∈0..m−1 satisfies this equation for each choice of the r other coefficients. There are m^r such choices, out of m^(r+1) total coefficient vectors. Thus the collision probability is **1/m**, establishing universality. The choice of coordinate t need not be coordinate 0; use whichever differs.\nFor m=6 with one-coordinate keys x=0,y=3 and coefficient a uniform in {0,1,2,3,4,5}, hashes collide when `3a≡0 mod6`, namely a=0,2,4. Probability is **3/6=1/2>1/6**. The nonzero difference 3 has no inverse modulo 6, so uniqueness fails and the universal bound can fail.",
    "explanation": "The lecture’s proof assumes a differing coordinate can be renamed 0. The explicit t notation prevents accidentally demanding that the original first coordinates differ.",
    "references": [
      "Lecture15-hashing-part3.pdf, PDF page 16 (distinct keys)",
      "Lecture15-hashing-part3.pdf, PDF page 17 (solve one coefficient)",
      "Lecture15-hashing-part3.pdf, PDF page 18 (invertibility and mod-7 inverse table)",
      "Lecture15-hashing-part3.pdf, PDF page 19 (coefficient equation)",
      "Lecture15-hashing-part3.pdf, PDF page 20 (counting proof)"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "tags": [
      "exam-1",
      "algorithms",
      "lecture-exercise",
      "hashing",
      "universal-hashing",
      "correctness",
      "modular-inverse",
      "additional-practice"
    ],
    "points": 11,
    "rubric": [
      {
        "criterion": "Correct collision equation and explicit solution for a differing coordinate",
        "marks": 4
      },
      {
        "criterion": "Correct prime/inverse and m^r counting argument",
        "marks": 4
      },
      {
        "criterion": "Correct composite-modulus counterexample with probability 1/2",
        "marks": 3
      }
    ],
    "hintSteps": [
      "Move all but one coordinate’s contribution to the other side of the collision equation.",
      "Over a prime modulus, any nonzero digit difference has one multiplicative inverse."
    ],
    "walkthroughSteps": [
      "Choose a genuinely differing coordinate and isolate its coefficient.",
      "Use the inverse to show exactly one solution per setting of the other coefficients.",
      "Count m^r/m^(r+1), then show nonuniqueness in the m=6 example."
    ]
  }
];
