import type { Question } from "@/lib/types";

// Slide and Assignment 1 practice. Priority tags reflect source evidence, not exam guarantees.
export const foundationQuestions: Question[] = [
  {
    "id": "alg-e1-found-01",
    "type": "free",
    "prompt": "Assignment 1, Q1(a). For integer $n\\ge1$, analyze this code under unit-cost arithmetic. Give the exact number of highlighted assignment instructions, then a tight asymptotic bound for the whole program. The exact count should exclude loop control; loop control still counts when analyzing total time.\n\n```\nfor (i = 1; i <= n; i *= 2) {\n  for (j = 1; j <= i; j++) {\n    // 7 assignment instructions\n  }\n}\n```",
    "sampleAnswer": "Let $m=\\lfloor\\lg n\\rfloor$. The outer-loop values are $1,2,\\ldots,2^m$. At $i=2^k$, the inner body executes $2^k$ times, so the exact highlighted count is\n\n$$7\\sum_{k=0}^{m}2^k=7(2^{m+1}-1).$$\n\nBecause $2^m\\le n<2^{m+1}$, this count is $\\Theta(n)$. Inner-loop control has the same order, and outer-loop control is only $\\Theta(\\lg n)$ for $n\\ge2$. Therefore the whole program is $\\Theta(n)$, and in particular $O(n)$.",
    "explanation": "A geometric outer progression with an inner loop of length i adds to a geometric sum, rather than n times log n.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 1, Question 1."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "loop-analysis",
      "geometric-sum"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "rubric": [
      {
        "criterion": "Identifies outer values $2^k$, $0\\le k\\le\\lfloor\\lg n\\rfloor$.",
        "marks": 1
      },
      {
        "criterion": "Derives exact body count $7(2^{m+1}-1)$.",
        "marks": 2
      },
      {
        "criterion": "Justifies $\\Theta(n)$ for total time including loop control.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "List the outer values; they are powers of two, not every integer.",
      "At $i=2^k$, how many j values occur? Sum those lengths geometrically."
    ],
    "walkthroughSteps": [
      "Set $m=\\lfloor\\lg n\\rfloor$.",
      "Count $2^k$ body executions for each outer value.",
      "Multiply $\\sum_{k=0}^{m}2^k=2^{m+1}-1$ by seven.",
      "Use $2^m\\le n<2^{m+1}$ and observe loop control has at most the same order."
    ]
  },
  {
    "id": "alg-e1-found-02",
    "type": "free",
    "prompt": "Assignment 1, Q1(b). For integer $n\\ge1$, give the exact highlighted assignment count and tight total running time under unit-cost arithmetic. Exclude loop control from the exact count.\n\n```\nfor (i = 1; i <= n; i *= 2) {\n  for (j = 1; j <= i; j *= 2) {\n    // 9 assignment instructions\n  }\n}\n```",
    "sampleAnswer": "With $m=\\lfloor\\lg n\\rfloor$, the outer value $i=2^k$ allows $j=1,2,\\ldots,2^k$, i.e. $k+1$ powers of two. Thus the exact highlighted count is\n\n$$9\\sum_{k=0}^{m}(k+1)=\\frac{9(m+1)(m+2)}2.$$\n\nFor $n\\ge2$, this and the associated loop control are $\\Theta((\\lg n)^2)$. The program is therefore $\\Theta((\\lg n)^2)$, hence $O((\\lg n)^2)$.",
    "explanation": "The inner loop has length k+1 when the outer loop reaches 2^k. The accumulated lengths form a triangular sum.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 1, Question 1."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "loop-analysis",
      "logarithms"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "rubric": [
      {
        "criterion": "Gets $m+1$ outer iterations and $k+1$ inner iterations at $i=2^k$.",
        "marks": 2
      },
      {
        "criterion": "Obtains $9(m+1)(m+2)/2$ assignments.",
        "marks": 2
      },
      {
        "criterion": "States and justifies tight $\\Theta((\\lg n)^2)$ total time.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "For $i=8$, j takes the values 1, 2, 4, 8.",
      "Sum $1+2+\\cdots+(m+1)$, rather than treating all inner lengths as identical."
    ],
    "walkthroughSteps": [
      "Index the outer loop by $k=0,\\ldots,m$.",
      "Count the $k+1$ powers of two allowed inside.",
      "Apply the arithmetic-series formula and multiply by nine.",
      "Loop overhead is proportional to these iterations, so it preserves the squared-log bound."
    ]
  },
  {
    "id": "alg-e1-found-03",
    "type": "free",
    "prompt": "Assignment 1, Q1(c). For integer $n\\ge2$, analyze the two strict inequalities below. Give an exact highlighted assignment count as a sum and prove a tight total time bound. Use unit-cost arithmetic and exclude loop control from the exact count.\n\n```\nfor (i = 1; i < n; i *= 3) {\n  for (j = i; j < n; j *= 2) {\n    // 5 assignment instructions\n  }\n}\n```",
    "sampleAnswer": "Let $m=\\lceil\\log_3 n\\rceil$. The outer values are $i=3^k$ for $0\\le k<m$. At a fixed k, j takes $3^k2^t$ while $t<\\log_2(n/3^k)$, so the number of inner executions is $\\lceil\\log_2(n/3^k)\\rceil$. The exact highlighted count is\n\n$$5\\sum_{k=0}^{m-1}\\left\\lceil\\log_2\\frac{n}{3^k}\\right\\rceil.$$\n\nThere are $O(\\lg n)$ outer iterations and at most $\\lceil\\lg n\\rceil$ inner iterations each, giving $O((\\lg n)^2)$. For a lower bound, consider $0\\le k\\le\\lfloor\\frac12\\log_3 n\\rfloor$: these $\\Theta(\\lg n)$ outer iterations have $3^k\\le\\sqrt n$, so each has at least $\\frac12\\lg n$ inner executions. Thus the body count is $\\Omega((\\lg n)^2)$. Loop control has no larger order, and total time is $\\Theta((\\lg n)^2)$.",
    "explanation": "The inner loop starts at i and its length decreases as i grows. Both bounds remain logarithmic over a logarithmic number of early outer iterations.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 1, Question 1."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "loop-analysis",
      "strict-bounds"
    ],
    "difficulty": "hard",
    "homeworkFormat": "multi-step",
    "points": 6,
    "rubric": [
      {
        "criterion": "Correctly uses $m=\\lceil\\log_3 n\\rceil$ for the strict outer bound.",
        "marks": 1
      },
      {
        "criterion": "Derives the ceiling sum with factor five.",
        "marks": 2
      },
      {
        "criterion": "Shows an $O((\\lg n)^2)$ upper bound.",
        "marks": 1
      },
      {
        "criterion": "Uses sufficiently many long inner loops to prove the matching lower bound.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Write each j value as $3^k2^t$ and solve $3^k2^t<n$.",
      "For a lower bound, restrict attention to outer values no larger than $\\sqrt n$."
    ],
    "walkthroughSteps": [
      "The strict bound $3^k<n$ gives $k=0,\\ldots,\\lceil\\log_3 n\\rceil-1$.",
      "Count nonnegative integers t satisfying $t<\\log_2(n/3^k)$.",
      "Bound the sum above by a product of two logarithms.",
      "Bound it below by using the first half of the outer logarithmic range.",
      "Multiply by five and account for loop control without changing the order."
    ]
  },
  {
    "id": "alg-e1-found-04",
    "type": "free",
    "prompt": "Assignment 1, Q1(d). For integer $n\\ge1$, give the exact highlighted assignment count and tight total time. Use unit-cost arithmetic; exclude loop control from the exact count.\n\n```\nfor (i = 1; i <= n; i++) {\n  for (j = 1; j <= n; j *= 2) {\n    // 3 assignment instructions\n  }\n}\n```",
    "sampleAnswer": "The outer loop has n iterations. Each inner loop visits the $\\lfloor\\lg n\\rfloor+1$ powers of two from 1 through $2^{\\lfloor\\lg n\\rfloor}$. Hence the highlighted count is\n\n$$3n(\\lfloor\\lg n\\rfloor+1).$$\n\nLoop control is proportional to the same number of iterations. For $n\\ge2$, total time is $\\Theta(n\\lg n)$, and therefore $O(n\\lg n)$.",
    "explanation": "Here every inner loop has the same logarithmic length, independently of i.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 1, Question 1."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "loop-analysis",
      "logarithms"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 5,
    "rubric": [
      {
        "criterion": "Counts n outer iterations and $\\lfloor\\lg n\\rfloor+1$ inner iterations.",
        "marks": 2
      },
      {
        "criterion": "Obtains exact $3n(\\lfloor\\lg n\\rfloor+1)$ count.",
        "marks": 1
      },
      {
        "criterion": "Justifies $\\Theta(n\\lg n)$ total time.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "The inner loop includes j=1 even when n=1.",
      "Since the inner bound does not depend on i, its count can be multiplied by n."
    ],
    "walkthroughSteps": [
      "Count powers $2^t\\le n$.",
      "Multiply that count by the n outer iterations and three assignments.",
      "Include proportional loop-control overhead and simplify asymptotically."
    ]
  },
  {
    "id": "alg-e1-found-05",
    "type": "free",
    "prompt": "Assignment 1, Q2(a). Is $2^{n+1}=O(2^n)$? Prove your answer using the constant-factor definition of Big-O.",
    "sampleAnswer": "Yes. For every $n\\ge1$, $2^{n+1}=2\\cdot2^n$. Choose $c=2$ and $n_0=1$; then $0\\le2^{n+1}\\le c2^n$ for all $n\\ge n_0$. In fact the ratio is exactly 2, so $2^{n+1}=\\Theta(2^n)$.",
    "explanation": "Adding one to an exponent of a fixed-base exponential multiplies it by a constant.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 2(a)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "asymptotic-notation",
      "exponentials"
    ],
    "difficulty": "easy",
    "homeworkFormat": "proof",
    "points": 3,
    "rubric": [
      {
        "criterion": "Answers yes and rewrites the expression as twice the comparison function.",
        "marks": 1
      },
      {
        "criterion": "Provides fixed c and n0 valid for all sufficiently large n.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Use the law $2^{n+1}=2^n2^1$.",
      "The Big-O constant must not depend on n."
    ],
    "walkthroughSteps": [
      "Divide by $2^n$ to obtain 2.",
      "Choose $c=2$ and $n_0=1$.",
      "State the defining inequality explicitly."
    ]
  },
  {
    "id": "alg-e1-found-06",
    "type": "free",
    "prompt": "Assignment 1, Q2(b). Is $2^{2n}=O(2^n)$? Prove your answer. The numerator is $2$ to the power $2n$, not a double exponential.",
    "sampleAnswer": "No. The ratio is $\\frac{2^{2n}}{2^n}=2^n\\to\\infty$. If a fixed c satisfied $2^{2n}\\le c2^n$ eventually, it would imply $2^n\\le c$ eventually, which is impossible. Given any $c>0$ and any $n_0$, choose an integer $n\\ge n_0$ with $n>\\log_2 c$; then $2^{2n}>c2^n$. Thus $2^{2n}=\\omega(2^n)$.",
    "explanation": "Multiplying n in an exponent changes the growth rate; the ratio is no longer a fixed constant.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 2(b)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "asymptotic-notation",
      "exponentials"
    ],
    "difficulty": "easy",
    "homeworkFormat": "proof",
    "points": 3,
    "rubric": [
      {
        "criterion": "Answers no and calculates the ratio 2^n.",
        "marks": 1
      },
      {
        "criterion": "Shows that no fixed Big-O constant can bound that ratio eventually.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Subtract the exponents when dividing the two functions.",
      "To disprove Big-O, defeat every proposed fixed constant c."
    ],
    "walkthroughSteps": [
      "Compute $2^{2n}/2^n=2^n$.",
      "For arbitrary c and n0, select n larger than both n0 and $\\log_2 c$.",
      "The required Big-O inequality fails at that n."
    ]
  },
  {
    "id": "alg-e1-found-07",
    "type": "free",
    "prompt": "Assignment 1, Q3(a). Prove $\\lg(n!)=\\Theta(n\\lg n)$. Use Stirling's formula $n!=\\sqrt{2\\pi n}(n/e)^n(1+o(1))$. Here $\\lg$ is base 2.",
    "sampleAnswer": "Taking base-2 logarithms of Stirling's formula gives\n\n$$\\lg(n!)=n\\lg n-n\\lg e+\\tfrac12\\lg(2\\pi n)+o(1).$$\n\nDivide by $n\\lg n$: the ratio is $1-\\frac{\\lg e}{\\lg n}+\\frac{\\lg(2\\pi n)}{2n\\lg n}+o(1)/(n\\lg n)\\to1$. Since both functions are positive for large n, the ratio is eventually bounded above and below by positive constants, for example between $1/2$ and 2. Hence $\\lg(n!)=\\Theta(n\\lg n)$.",
    "explanation": "Stirling separates the leading n log n term from the lower-order linear and logarithmic terms.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 3(a)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "stirling",
      "asymptotic-proofs"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 5,
    "rubric": [
      {
        "criterion": "Correctly takes logarithms of all Stirling factors.",
        "marks": 2
      },
      {
        "criterion": "Shows the ratio to n lg n tends to one.",
        "marks": 2
      },
      {
        "criterion": "Connects the positive finite ratio to a Theta bound.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Apply $\\lg(xy)=\\lg x+\\lg y$ and $\\lg(x^n)=n\\lg x$.",
      "Normalize the expression by $n\\lg n$ to identify the leading term."
    ],
    "walkthroughSteps": [
      "Expand the logarithm of Stirling's expression.",
      "Separate $n\\lg n$, $-n\\lg e$, and the half-log term.",
      "Show the normalized lower-order terms vanish.",
      "Use eventual positive constant bounds on the ratio."
    ]
  },
  {
    "id": "alg-e1-found-08",
    "type": "free",
    "prompt": "Assignment 1, Q3(b). Prove $n!=\\omega(2^n)$. Use Stirling's formula $n!=\\sqrt{2\\pi n}(n/e)^n(1+o(1))$. Here $\\lg$ is base 2.",
    "sampleAnswer": "Stirling gives\n\n$$\\frac{n!}{2^n}=\\sqrt{2\\pi n}\\left(\\frac{n}{2e}\\right)^n(1+o(1)).$$\n\nFor sufficiently large n, $1+o(1)\\ge1/2$ and $n/(2e)\\ge2$. Thus the ratio is at least $\\frac12\\sqrt{2\\pi n}\\,2^n$, which tends to infinity. Therefore for every $c>0$ there is an $n_0$ such that $n!\\ge c2^n$ for all $n\\ge n_0$, exactly the little-omega condition.",
    "explanation": "The base n/(2e) of the ratio's exponential itself grows, so factorial eventually exceeds every constant multiple of 2^n.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 3(b)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "stirling",
      "asymptotic-proofs"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 5,
    "rubric": [
      {
        "criterion": "Derives the ratio using Stirling.",
        "marks": 2
      },
      {
        "criterion": "Proves the ratio diverges rather than just calling factorial larger.",
        "marks": 2
      },
      {
        "criterion": "States the little-omega conclusion with the correct quantifier.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Divide Stirling's formula by $2^n$.",
      "For large n, replace $n/(2e)$ by a fixed lower bound bigger than one."
    ],
    "walkthroughSteps": [
      "Form $\\sqrt{2\\pi n}(n/(2e))^n(1+o(1))$.",
      "Bound the last factor below by 1/2 eventually.",
      "Use $n/(2e)\\ge2$ for sufficiently large n.",
      "Translate the infinite ratio into little-omega."
    ]
  },
  {
    "id": "alg-e1-found-09",
    "type": "free",
    "prompt": "Assignment 1, Q3(c). Prove $n!=o(n^n)$. Use Stirling's formula $n!=\\sqrt{2\\pi n}(n/e)^n(1+o(1))$. Here $\\lg$ is base 2.",
    "sampleAnswer": "After dividing Stirling's formula by $n^n$,\n\n$$\\frac{n!}{n^n}=\\sqrt{2\\pi n}\\,e^{-n}(1+o(1)).$$\n\nThe logarithm of the main factor is $\\frac12\\ln(2\\pi n)-n\\to-\\infty$, since $\\ln n=o(n)$. Hence the ratio tends to zero. For every $c>0$, $0\\le n!<c n^n$ for all sufficiently large n, so $n!=o(n^n)$.",
    "explanation": "Factorial has n factors, but its Stirling ratio to n^n contains the exponentially decaying factor e^-n.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 3(c)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "stirling",
      "asymptotic-proofs"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 5,
    "rubric": [
      {
        "criterion": "Gets the ratio sqrt(2 pi n) e^-n times 1+o(1).",
        "marks": 2
      },
      {
        "criterion": "Justifies convergence to zero.",
        "marks": 2
      },
      {
        "criterion": "Concludes little-o with the every-positive-constant condition.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The $n^n$ factor cancels completely.",
      "Compare exponential decay to the square-root prefactor, or take natural logarithms."
    ],
    "walkthroughSteps": [
      "Normalize Stirling by $n^n$.",
      "Take $\\ln$ of the main factor to obtain a linear negative term plus a logarithmic term.",
      "Conclude the ratio tends to zero and apply the definition of little-o."
    ]
  },
  {
    "id": "alg-e1-found-10",
    "type": "free",
    "prompt": "Assignment 1, Q4(a). Let $T(1)=b>0$ and $T(n)=T(n-1)+n$ for integers $n\\ge2$. Use substitution (induction) to prove $T(n)=O(n^2)$. Specify constants and the base case.",
    "sampleAnswer": "Choose $c\\ge\\max\\{b,1\\}$. Base: $T(1)=b\\le c$. Assume $T(n-1)\\le c(n-1)^2$. Then\n\n$$T(n)\\le c(n-1)^2+n=cn^2-\\big((2c-1)n-c\\big)\\le cn^2,$$\n\nbecause for $c\\ge1$ and $n\\ge2$, $(2c-1)n-c\\ge2(2c-1)-c=3c-2\\ge1$. This closes the induction, so $T(n)=O(n^2)$. As a check, expanding yields $T(n)=b+\\frac{n(n+1)}2-1$, which is actually $\\Theta(n^2)$.",
    "explanation": "A substitution proof needs the same fixed constant throughout the induction and a base case covered by that constant.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 4(a)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "substitution",
      "recurrences"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 6,
    "rubric": [
      {
        "criterion": "States a fixed quadratic induction hypothesis and covers the base case.",
        "marks": 2
      },
      {
        "criterion": "Substitutes and derives the residual explicitly.",
        "marks": 2
      },
      {
        "criterion": "Chooses constants that make the residual nonnegative and closes the O(n^2) proof.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Try $T(n)\\le cn^2$, with c large enough for T(1).",
      "Expand $c(n-1)^2+n$ and check the sign of the residual."
    ],
    "walkthroughSteps": [
      "Take $c\\ge\\max\\{b,1\\}$.",
      "Apply the induction hypothesis at n-1.",
      "Compute the difference between $cn^2$ and the resulting upper bound.",
      "Verify its sign for n>=2, and handle n=1 separately."
    ]
  },
  {
    "id": "alg-e1-found-11",
    "type": "free",
    "prompt": "Assignment 1, Q4(b). Let $T(1)=b>0$ and $T(n)=T(\\lceil n/2\\rceil)+1$ for integer $n\\ge2$. Use substitution to prove $T(n)=O(\\lg n)$. Handle the ceiling explicitly; do not assume $\\lg\\lceil n/2\\rceil\\le\\lg n-1$.",
    "sampleAnswer": "Use the stronger statement $T(n)\\le b+\\lceil\\lg n\\rceil$. It is equality for n=1. For n>=2, put $k=\\lceil\\lg n\\rceil$, so $2^{k-1}<n\\le2^k$. When k=1, n=2 and $\\lceil n/2\\rceil=1$. When k>=2, integrality gives\n\n$$2^{k-2}<\\lceil n/2\\rceil\\le2^{k-1}.$$\n\nTherefore $\\lceil\\lg\\lceil n/2\\rceil\\rceil=k-1$ in both cases. Strong induction on n gives\n\n$$T(n)\\le b+\\lceil\\lg\\lceil n/2\\rceil\\rceil+1=b+k.$$\n\nFor n>=2, $b+\\lceil\\lg n\\rceil\\le b+\\lg n+1\\le(b+2)\\lg n$, so $T(n)=O(\\lg n)$. In fact the same recurrence proves the exact formula $T(n)=b+\\lceil\\lg n\\rceil$.",
    "explanation": "Ceilings can invalidate an induction using c log n without an additive adjustment. Counting halving depth with ceil(log n) resolves the boundary cases.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 4(b)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "substitution",
      "recurrences",
      "ceilings"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 6,
    "rubric": [
      {
        "criterion": "Chooses a ceiling-aware hypothesis and handles n=1.",
        "marks": 2
      },
      {
        "criterion": "Proves the halving identity or an equally valid ceiling inequality.",
        "marks": 2
      },
      {
        "criterion": "Closes the induction and converts the result into O(lg n).",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Try a bound using $\\lceil\\lg n\\rceil$ rather than $\\lg n$ alone.",
      "If $2^{k-1}<n\\le2^k$, locate $\\lceil n/2\\rceil$ in the corresponding power-of-two interval."
    ],
    "walkthroughSteps": [
      "Use strong induction on $T(n)\\le b+\\lceil\\lg n\\rceil$.",
      "Check n=1 and the separate n=2 boundary.",
      "Prove the ceiling-log decreases by exactly one after ceil-halving.",
      "Substitute that identity and then absorb the constant for n>=2."
    ]
  },
  {
    "id": "alg-e1-found-12",
    "type": "free",
    "prompt": "Assignment 1, Q5. Let $T(1)=b>0$ and $T(n)=2T(n-1)+1$ for integer $n\\ge2$. Use a recursion tree to obtain an asymptotic upper bound, then verify it by substitution. Include the level costs, depth, leaf cost, and a matching tight bound.",
    "sampleAnswer": "The tree has depth n-1. At depth i there are $2^i$ nodes, each contributing unit nonrecursive cost, for $0\\le i\\le n-2$. At depth n-1 there are $2^{n-1}$ leaves of cost b. Thus\n\n$$T(n)=\\sum_{i=0}^{n-2}2^i+b2^{n-1}=(b+1)2^{n-1}-1=\\Theta(2^n).$$\n\nFor substitution, strengthen the desired upper bound to $T(n)\\le C2^n-1$, taking $C\\ge(b+1)/2$. Base: $b\\le2C-1$. If it holds at n-1, then\n\n$$T(n)\\le2(C2^{n-1}-1)+1=C2^n-1.$$\n\nThis proves $O(2^n)$. The leaf contribution $b2^{n-1}$ proves $\\Omega(2^n)$ because b>0. The unadjusted hypothesis $C2^n$ alone would leave an unwanted +1.",
    "explanation": "Each recursive step reduces size by one while doubling the nodes, giving linear depth and exponentially many leaves.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 5."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "recursion-tree",
      "substitution",
      "exponential-recurrence"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gets depth n-1, 2^i nodes per level, and b 2^(n-1) leaf cost.",
        "marks": 2
      },
      {
        "criterion": "Sums the tree and obtains the exact expression or equivalent tight bound.",
        "marks": 2
      },
      {
        "criterion": "Uses a strengthened induction hypothesis and covers the base.",
        "marks": 2
      },
      {
        "criterion": "Provides matching upper and lower bounds.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Unlike a halving recurrence, this tree has n-1 levels before the leaves.",
      "Try $C2^n-1$ as the induction hypothesis so that the additive +1 cancels."
    ],
    "walkthroughSteps": [
      "Count $2^i$ internal nodes at each level.",
      "Sum their unit costs and add the leaf contribution.",
      "Guess $\\Theta(2^n)$ from the geometric sum.",
      "Substitute the stronger $C2^n-1$ hypothesis.",
      "Use the positive leaf cost for a matching lower bound."
    ]
  },
  {
    "id": "alg-e1-found-13",
    "type": "free",
    "prompt": "Assignment 1, Q6(a). Use the Master theorem to find a tight bound for $T(n)=2T(n/4)+1$. Assume n is a power of 4 and $T(1)=\\Theta(1)$. Identify a, b, the watershed, the applicable case, and any condition that case requires.",
    "sampleAnswer": "Here $a=2$, $b=4$, and $n^{\\log_b a}=n^{\\log_4 2}=n^{1/2}$. Case 1: $f(n)=1=O(n^{1/2-\\epsilon})$ with $\\epsilon=1/2$. Thus $T(n)=\\Theta(n^{1/2})$.",
    "explanation": "Compare the driving function to sqrt(n), using a polynomial gap for cases 1 or 3 and the regularity condition for case 3.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 6(a)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "master-theorem",
      "case-1"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 4,
    "rubric": [
      {
        "criterion": "Identifies a=2, b=4, and watershed sqrt(n).",
        "marks": 1
      },
      {
        "criterion": "Selects the correct case and verifies its required comparison/regularity.",
        "marks": 2
      },
      {
        "criterion": "Concludes $\\Theta(\\sqrt n)$.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The watershed exponent is $\\log_4 2$.",
      "Compare f(n) with sqrt(n); for case 3, compute 2 f(n/4)/f(n)."
    ],
    "walkthroughSteps": [
      "Compute the watershed $n^{1/2}$.",
      "Case 1: $f(n)=1=O(n^{1/2-\\epsilon})$ with $\\epsilon=1/2$. Thus $T(n)=\\Theta(n^{1/2})$.",
      "State the tight Theta bound, rather than only an upper bound."
    ]
  },
  {
    "id": "alg-e1-found-14",
    "type": "free",
    "prompt": "Assignment 1, Q6(b). Use the Master theorem to find a tight bound for $T(n)=2T(n/4)+n^{1/2}$. Assume n is a power of 4 and $T(1)=\\Theta(1)$. Identify a, b, the watershed, the applicable case, and any condition that case requires.",
    "sampleAnswer": "Here $a=2$, $b=4$, and $n^{\\log_b a}=n^{\\log_4 2}=n^{1/2}$. Case 2 with $k=0$: $f(n)=\\Theta(n^{1/2})$ matches the watershed. Thus $T(n)=\\Theta(n^{1/2}\\lg n)$.",
    "explanation": "Compare the driving function to sqrt(n), using a polynomial gap for cases 1 or 3 and the regularity condition for case 3.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 6(b)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "master-theorem",
      "case-2"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 4,
    "rubric": [
      {
        "criterion": "Identifies a=2, b=4, and watershed sqrt(n).",
        "marks": 1
      },
      {
        "criterion": "Selects the correct case and verifies its required comparison/regularity.",
        "marks": 2
      },
      {
        "criterion": "Concludes $\\Theta(\\sqrt n\\lg n)$.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The watershed exponent is $\\log_4 2$.",
      "Compare f(n) with sqrt(n); for case 3, compute 2 f(n/4)/f(n)."
    ],
    "walkthroughSteps": [
      "Compute the watershed $n^{1/2}$.",
      "Case 2 with $k=0$: $f(n)=\\Theta(n^{1/2})$ matches the watershed. Thus $T(n)=\\Theta(n^{1/2}\\lg n)$.",
      "State the tight Theta bound, rather than only an upper bound."
    ]
  },
  {
    "id": "alg-e1-found-15",
    "type": "free",
    "prompt": "Assignment 1, Q6(c). Use the Master theorem to find a tight bound for $T(n)=2T(n/4)+n$. Assume n is a power of 4 and $T(1)=\\Theta(1)$. Identify a, b, the watershed, the applicable case, and any condition that case requires.",
    "sampleAnswer": "Here $a=2$, $b=4$, and $n^{\\log_b a}=n^{\\log_4 2}=n^{1/2}$. Case 3: $n=\\Omega(n^{1/2+\\epsilon})$ with $\\epsilon=1/2$. Regularity holds: $2f(n/4)=n/2\\le(1/2)f(n)$. Thus $T(n)=\\Theta(n)$.",
    "explanation": "Compare the driving function to sqrt(n), using a polynomial gap for cases 1 or 3 and the regularity condition for case 3.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 6(c)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "master-theorem",
      "case-3"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 4,
    "rubric": [
      {
        "criterion": "Identifies a=2, b=4, and watershed sqrt(n).",
        "marks": 1
      },
      {
        "criterion": "Selects the correct case and verifies its required comparison/regularity.",
        "marks": 2
      },
      {
        "criterion": "Concludes $\\Theta(n)$.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The watershed exponent is $\\log_4 2$.",
      "Compare f(n) with sqrt(n); for case 3, compute 2 f(n/4)/f(n)."
    ],
    "walkthroughSteps": [
      "Compute the watershed $n^{1/2}$.",
      "Case 3: $n=\\Omega(n^{1/2+\\epsilon})$ with $\\epsilon=1/2$. Regularity holds: $2f(n/4)=n/2\\le(1/2)f(n)$. Thus $T(n)=\\Theta(n)$.",
      "State the tight Theta bound, rather than only an upper bound."
    ]
  },
  {
    "id": "alg-e1-found-16",
    "type": "free",
    "prompt": "Assignment 1, Q6(d). Use the Master theorem to find a tight bound for $T(n)=2T(n/4)+n^2$. Assume n is a power of 4 and $T(1)=\\Theta(1)$. Identify a, b, the watershed, the applicable case, and any condition that case requires.",
    "sampleAnswer": "Here $a=2$, $b=4$, and $n^{\\log_b a}=n^{\\log_4 2}=n^{1/2}$. Case 3: $n^2=\\Omega(n^{1/2+\\epsilon})$ with $\\epsilon=3/2$. Regularity holds: $2f(n/4)=n^2/8\\le(1/8)f(n)$. Thus $T(n)=\\Theta(n^2)$.",
    "explanation": "Compare the driving function to sqrt(n), using a polynomial gap for cases 1 or 3 and the regularity condition for case 3.",
    "references": [
      "cs5381_assignment1_26fall.pdf — PDF page 2, Question 6(d)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "homework-1",
      "high-priority",
      "master-theorem",
      "case-3"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 4,
    "rubric": [
      {
        "criterion": "Identifies a=2, b=4, and watershed sqrt(n).",
        "marks": 1
      },
      {
        "criterion": "Selects the correct case and verifies its required comparison/regularity.",
        "marks": 2
      },
      {
        "criterion": "Concludes $\\Theta(n^2)$.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The watershed exponent is $\\log_4 2$.",
      "Compare f(n) with sqrt(n); for case 3, compute 2 f(n/4)/f(n)."
    ],
    "walkthroughSteps": [
      "Compute the watershed $n^{1/2}$.",
      "Case 3: $n^2=\\Omega(n^{1/2+\\epsilon})$ with $\\epsilon=3/2$. Regularity holds: $2f(n/4)=n^2/8\\le(1/8)f(n)$. Thus $T(n)=\\Theta(n^2)$.",
      "State the tight Theta bound, rather than only an upper bound."
    ]
  },
  {
    "id": "alg-e1-found-17",
    "type": "free",
    "prompt": "State the quantified definitions of $O(g)$, $\\Omega(g)$, and $\\Theta(g)$ for eventually nonnegative functions. Then prove $f(n)=3n^2+7n+4=\\Theta(n^2)$ with explicit constants. Is f little-o of $n^2$? Is it little-o of $n^3$? Justify both answers.",
    "sampleAnswer": "$f\\in O(g)$ means there exist $c>0,n_0$ such that $0\\le f(n)\\le cg(n)$ for all $n\\ge n_0$. $f\\in\\Omega(g)$ means there exist $c>0,n_0$ such that $0\\le cg(n)\\le f(n)$ for all $n\\ge n_0$. $f\\in\\Theta(g)$ means there exist $c_1,c_2>0,n_0$ such that $0\\le c_1g(n)\\le f(n)\\le c_2g(n)$ for all $n\\ge n_0$.\n\nFor $n\\ge1$, $3n^2\\le3n^2+7n+4\\le14n^2$. Thus $c_1=3,c_2=14,n_0=1$ prove $\\Theta(n^2)$. The ratio $f(n)/n^2=3+7/n+4/n^2\\to3$, so f is not $o(n^2)$. But $f(n)/n^3=3/n+7/n^2+4/n^3\\to0$, so $f=o(n^3)$. Little-o requires the eventual upper inequality for every positive c, rather than just one c.",
    "explanation": "A tight bound needs both an eventual upper and lower bound. A positive finite ratio establishes Theta, while a zero ratio establishes little-o.",
    "references": [
      "Lecture3-Asymptotic notation.pdf — PDF pages 2–5 and 8; additional polynomial proof practice."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "exam-style",
      "asymptotic-notation",
      "asymptotic-proofs"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 6,
    "rubric": [
      {
        "criterion": "States correct quantifiers and inequalities for all three definitions.",
        "marks": 2
      },
      {
        "criterion": "Gives explicit constants proving the polynomial Theta bound.",
        "marks": 2
      },
      {
        "criterion": "Correctly rejects little-o of n^2 using the ratio.",
        "marks": 1
      },
      {
        "criterion": "Correctly proves little-o of n^3 using the ratio.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Use $n\\le n^2$ and $1\\le n^2$ for n>=1.",
      "Little-o is tested by a ratio tending to zero, not by the existence of one Big-O constant."
    ],
    "walkthroughSteps": [
      "Write the three eventual inequality definitions.",
      "Bound the polynomial between $3n^2$ and $14n^2$.",
      "Compute its ratio to each comparison function.",
      "Distinguish the zero limit from the positive finite limit."
    ]
  },
  {
    "id": "alg-e1-found-18",
    "type": "free",
    "prompt": "Lecture growth-rate exercise. For each pair (f,g), classify f as $o(g)$, $\\Theta(g)$, or $\\omega(g)$, and give a ratio or an equivalent asymptotic argument. Logs without a specified base have the same fixed base greater than 1.\n\n1. $(1000000,\\;0.01\\sqrt N)$\n2. $(\\log N,\\;\\sqrt N)$\n3. $(N\\log N,\\;N^{1.001})$\n4. $(N^3,\\;10000N^2)$\n5. $((\\log N)^2,\\;10\\log(N^5))$\n6. $(2\\log_2 N,\\;\\log_3 N)$\n7. $(N2^N,\\;3^N)$",
    "sampleAnswer": "1. $f=o(g)$: ratio $10^8/\\sqrt N\\to0$.\n\n2. $f=o(g)$: $\\log N/N^{1/2}\\to0$.\n\n3. $f=o(g)$: ratio $\\log N/N^{0.001}\\to0$; every fixed positive power eventually dominates a logarithm.\n\n4. $f=\\omega(g)$: ratio $N/10000\\to\\infty$.\n\n5. $f=\\omega(g)$: $10\\log(N^5)=50\\log N$, so ratio $\\log N/50\\to\\infty$.\n\n6. $f=\\Theta(g)$: the ratio is the constant $2\\ln3/\\ln2=2\\log_2 3$.\n\n7. $f=o(g)$: ratio $N(2/3)^N\\to0$, since geometric decay dominates a polynomial factor.\n\nThe squared logarithm in part 5 means $(\\log N)^2$, not $\\log_2 N$.",
    "explanation": "These are the seven slide comparisons. Large constants and very small positive polynomial exponents do not alter the eventual comparison.",
    "references": [
      "Lecture3-Asymptotic notation.pdf — PDF page 11, all seven relative-growth examples."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "relative-growth",
      "logarithms",
      "exponentials"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Correct classifications and reasons for parts 1–3.",
        "marks": 3
      },
      {
        "criterion": "Correct classifications and ratios for parts 4–5.",
        "marks": 2
      },
      {
        "criterion": "Gets the constant ratio and Theta classification in part 6.",
        "marks": 1
      },
      {
        "criterion": "Shows geometric decay and little-o in part 7.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Always simplify f/g first.",
      "Use change of logarithm base in part 6 and $N(2/3)^N$ in part 7."
    ],
    "walkthroughSteps": [
      "Cancel common polynomial factors.",
      "Use $\\log N=o(N^\\epsilon)$ for every fixed $\\epsilon>0$.",
      "Apply $\\log(N^5)=5\\log N$ and the change-of-base formula.",
      "Compare the exponential bases after cancellation."
    ]
  },
  {
    "id": "alg-e1-found-19",
    "type": "free",
    "prompt": "Additional proof-checking practice adapted from the Big-O toolbox slide. A claim says: if $T(n)=O(f(n))$ and g is positive and increasing, then $g(T(n))=O(g(f(n)))$. Is monotonicity alone enough? Give a concrete counterexample, compute the ratio, and explain the missing issue.",
    "sampleAnswer": "No. Take $T(n)=2n$, $f(n)=n$, and $g(x)=2^x$. Both T and f are positive and increasing, g is positive and strictly increasing, and $T=O(f)$ with c=2. But\n\n$$\\frac{g(T(n))}{g(f(n))}=\\frac{2^{2n}}{2^n}=2^n\\to\\infty.$$\n\nThus $g(T(n))$ is not $O(g(f(n)))$. Monotonicity only gives $g(T(n))\\le g(cf(n))$ from $T(n)\\le cf(n)$; it does not guarantee $g(cf(n))=O(g(f(n)))$. Such a bound needs an additional scaling property of g. For example, fixed positive powers $g(x)=x^d$ have it because $g(cx)=c^d g(x)$.",
    "explanation": "The slide's unrestricted composition claim needs an extra condition. This generated practice question explicitly repairs that claim.",
    "references": [
      "Lecture3-Asymptotic notation.pdf — PDF page 7, Big-O toolbox; adapted counterexample practice correcting the unrestricted composition claim."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "exam-style",
      "asymptotic-proofs",
      "counterexample",
      "source-correction"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 5,
    "rubric": [
      {
        "criterion": "Answers that monotonicity alone is insufficient.",
        "marks": 1
      },
      {
        "criterion": "Provides functions satisfying the premise.",
        "marks": 1
      },
      {
        "criterion": "Computes an unbounded ratio showing the conclusion fails.",
        "marks": 2
      },
      {
        "criterion": "Explains why monotonicity cannot absorb an arbitrary input multiplier.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Try an exponential g and let T be a constant multiple of f.",
      "Monotonicity allows replacing T by cf, but does it let you replace g(cf) by a constant multiple of g(f)?"
    ],
    "walkthroughSteps": [
      "Choose $T=2n$, $f=n$, $g(x)=2^x$.",
      "Verify the premise with c=2.",
      "Compute the ratio after applying g.",
      "Identify the missing scaling property and give a valid example such as a fixed power."
    ]
  },
  {
    "id": "alg-e1-found-20",
    "type": "free",
    "prompt": "Lecture sequential-search exercise. A list contains n distinct entries and is searched from left to right. Count one equality comparison per inspected entry. Give best-case, worst-case, and average-case comparison counts for a successful search when each position is equally likely. Also give the unsuccessful-search count and explain what assumption makes the average valid.",
    "sampleAnswer": "Successful best case: 1 comparison (first entry), hence $\\Theta(1)$. Successful worst case: n comparisons (last entry), hence $\\Theta(n)$. With success at each position $i=1,\\ldots,n$ having probability $1/n$, the expectation is\n\n$$E[C]=\\frac1n\\sum_{i=1}^n i=\\frac{n+1}{2}=\\Theta(n).$$\n\nAn unsuccessful search inspects all n entries, so it uses n comparisons. The average above assumes the target is present and its position is uniformly distributed; another distribution or a mix of successful and unsuccessful searches changes the expectation.",
    "explanation": "Average-case analysis depends on an explicit input distribution. It is not automatically the arithmetic mean of the best and worst cases.",
    "references": [
      "Lecture3-Asymptotic notation.pdf — PDF page 12, phonebook sequential-search questions; uniform successful-position assumption made explicit."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "search",
      "best-worst-average"
    ],
    "difficulty": "easy",
    "homeworkFormat": "calc",
    "points": 5,
    "rubric": [
      {
        "criterion": "Gives correct successful best and worst counts and orders.",
        "marks": 2
      },
      {
        "criterion": "Derives the average with the uniform-position sum.",
        "marks": 2
      },
      {
        "criterion": "Gives the unsuccessful count and states the distribution assumption.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "For a target at position i, exactly i entries are inspected.",
      "Write the expectation as a probability-weighted sum over positions."
    ],
    "walkthroughSteps": [
      "Identify the first and last possible successful positions.",
      "Average the counts 1 through n using probability 1/n each.",
      "Account separately for an absent target and state the assumption behind the expected count."
    ]
  },
  {
    "id": "alg-e1-found-21",
    "type": "free",
    "prompt": "Lecture running-time examples. Assume exact arithmetic operations have unit cost, regardless of operand size. (a) The loop below returns $\\sum_{i=1}^n i^3$; give its returned value and running time. (b) The factorial routine below returns n!; give a time recurrence, tight time bound, and recursion-stack space. Explain why output magnitude is not the running-time bound in this model.\n\n```\nCubeSum(n):\n  s = 0\n  for i = 1 to n:\n    s = s + i*i*i\n  return s\n\nFact(n):  // n is an integer >= 1\n  if n == 1: return 1\n  return n * Fact(n-1)\n```",
    "sampleAnswer": "(a) The result is $\\left(n(n+1)/2\\right)^2=\\Theta(n^4)$. There are n loop iterations with constant work each, so time is $\\Theta(n)$ and auxiliary space is $\\Theta(1)$.\n\n(b) $T(1)=\\Theta(1)$ and $T(n)=T(n-1)+\\Theta(1)$, so $T(n)=\\Theta(n)$. There are n live frames at maximum depth, giving $\\Theta(n)$ stack space. The result n! is far larger than a linear function, but the abstract unit-cost model counts arithmetic operations rather than the numeric value returned. With bit-cost arithmetic, these same bounds would require a different analysis.",
    "explanation": "The slides use unit-cost arithmetic; a large returned value does not itself count as many execution steps.",
    "references": [
      "Lecture3-Asymptotic notation.pdf — PDF pages 13 and 15, cube sum and recursive factorial examples; returned-value and stack analysis added."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "exam-style",
      "unit-cost-model",
      "loop-analysis",
      "recurrences",
      "space"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 6,
    "rubric": [
      {
        "criterion": "Gives the correct cube-sum value and linear time.",
        "marks": 2
      },
      {
        "criterion": "Sets up and solves the factorial time recurrence.",
        "marks": 2
      },
      {
        "criterion": "Counts linear recursion-stack space.",
        "marks": 1
      },
      {
        "criterion": "Distinguishes result magnitude from operation count under the stated model.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Count executed loop iterations and recursive calls, not the output's value.",
      "One factorial call invokes only one smaller call; its stack still retains all unfinished calls."
    ],
    "walkthroughSteps": [
      "Count n constant-work cube-sum iterations.",
      "Use the known cube-sum identity for the result.",
      "Expand the one-branch factorial recurrence and count maximum call depth.",
      "State the unit-cost assumption that makes the arithmetic analysis valid."
    ]
  },
  {
    "id": "alg-e1-found-22",
    "type": "free",
    "prompt": "Lecture loop exercises A and C (the powers-of-two exercise on the same slide is Assignment 1 Q1(a)). For positive integer n, give exact highlighted assignment counts and tight total time for both snippets. Unit-cost arithmetic; the exact count excludes loop control.\n\n```\nA:\nfor (i = 1; i <= n; i += 2) {\n  for (j = i; j <= n; j++) {\n    // 5 assignment instructions\n  }\n}\n\nC:\nfor (i = 1; i <= n; i++) {\n  for (j = 2*i; j <= n; j++) {\n    // 3 assignment instructions\n  }\n}\n```",
    "sampleAnswer": "A: Let $r=\\lceil n/2\\rceil$. The odd outer values are $i=2k-1$ for $1\\le k\\le r$. Inner lengths are $n-i+1=n-2k+2$. The highlighted count is\n\n$$5\\sum_{k=1}^{r}(n-2k+2)=5r(n+1-r).$$\n\nFor n=2m this is $5m(m+1)$; for n=2m+1 it is $5(m+1)^2$. Total time is $\\Theta(n^2)$.\n\nC: Only outer values $1\\le i\\le q=\\lfloor n/2\\rfloor$ have a nonempty inner body. The highlighted count is\n\n$$3\\sum_{i=1}^{q}(n-2i+1)=3q(n-q).$$\n\nFor n=2m this is $3m^2$; for n=2m+1 it is $3m(m+1)$. The empty inner-loop initializations/tests for larger i add only $O(n)$, so total time is $\\Theta(n^2)$.",
    "explanation": "Dependent loop bounds need a sum of actual inner lengths. Some outer iterations of C have an empty inner loop.",
    "references": [
      "Lecture3-Asymptotic notation.pdf — PDF page 19, first and third loop examples; the middle example is preserved as Assignment 1 Q1(a)."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "loop-analysis",
      "arithmetic-sum"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 6,
    "rubric": [
      {
        "criterion": "Derives A's odd outer values and exact sum/count.",
        "marks": 2
      },
      {
        "criterion": "Derives C's nonempty range and exact sum/count.",
        "marks": 2
      },
      {
        "criterion": "Gets both tight quadratic total-time bounds and accounts for empty-loop overhead.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "In A, list n-i+1 for odd i. In C, first find which i satisfy 2i<=n.",
      "Use ceil(n/2) for A's outer count and floor(n/2) for C's nonempty inner loops."
    ],
    "walkthroughSteps": [
      "Write A's outer i as 2k-1 and sum its inner lengths.",
      "Find C's final nonempty outer value and sum n-2i+1.",
      "Multiply by the appropriate assignment count.",
      "Add proportional control costs and simplify both totals."
    ]
  },
  {
    "id": "alg-e1-found-23",
    "type": "free",
    "prompt": "Lecture computer-speed exercise. Computer A executes $10^{10}$ instructions/second and uses insertion sort requiring $2n^2$ instructions. Computer B executes $10^7$ instructions/second and uses merge sort requiring $50n\\lg n$ instructions. For $n=10^7$, calculate each time in seconds, identify the faster computer/algorithm pair, and calculate its speedup. Use the given cost formulas exactly.",
    "sampleAnswer": "A takes $\\frac{2(10^7)^2}{10^{10}}=20000$ seconds (about 5.556 hours). B takes\n\n$$\\frac{50(10^7)\\lg(10^7)}{10^7}=50\\lg(10^7)\\approx1162.675\\text{ seconds}$$\n\n(about 19.378 minutes). B with merge sort is faster; its speedup relative to A with insertion sort is $20000/1162.675\\approx17.202$. A's processor is 1000 times faster, but its quadratic instruction count loses to the n-log-n algorithm on this input.",
    "explanation": "Translate each operation count to time with its own instruction rate. Asymptotic improvement can outweigh a large processor-speed difference.",
    "references": [
      "Lecture2-examples.pdf — PDF pages 3 and 18, repeated computer A/B sorting example."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "algorithm-vs-hardware",
      "sorting",
      "numerical-analysis"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 5,
    "rubric": [
      {
        "criterion": "Computes A's time as 20000 seconds.",
        "marks": 1
      },
      {
        "criterion": "Computes B's time using base-2 log as about 1162.675 seconds.",
        "marks": 2
      },
      {
        "criterion": "Identifies B and obtains about 17.202 times speedup.",
        "marks": 1
      },
      {
        "criterion": "Explains the different algorithmic growth rates despite A's faster hardware.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Execution time equals instruction count divided by instructions per second.",
      "Use lg(10^7)=7 lg(10), not 7 or the natural logarithm."
    ],
    "walkthroughSteps": [
      "Substitute n=10^7 into each instruction formula.",
      "Divide each by its processor's rate.",
      "Evaluate the base-2 logarithm for B.",
      "Take slower time divided by faster time for the speedup."
    ]
  },
  {
    "id": "alg-e1-found-24",
    "type": "free",
    "prompt": "Lecture time-budget exercise, adapted to the one-second column. An algorithm takes f(n) microseconds. For each function $\\lg n,\\sqrt n,n,n\\lg n,n^2,n^3,2^n,n!$, find the largest positive integer n that fits within one second. All logs are base 2 and one second is $10^6$ microseconds. You may leave the first answer as an exact power of two. For n lg n, justify the integer boundary numerically.",
    "sampleAnswer": "Each inequality is $f(n)\\le10^6$. The largest n values are:\n\n| f(n) | Largest n |\n|---|---:|\n| $\\lg n$ | $2^{1000000}$ |\n| $\\sqrt n$ | $10^{12}$ |\n| $n$ | $1000000$ |\n| $n\\lg n$ | $62746$ |\n| $n^2$ | $1000$ |\n| $n^3$ | $100$ |\n| $2^n$ | $19$ |\n| $n!$ | $9$ |\n\n$62746\\lg62746\\approx999997.802\\le10^6$, whereas $62747\\lg62747\\approx1000015.182>10^6$. Also $2^{19}=524288\\le10^6<1048576=2^{20}$ and $9!=362880\\le10^6<3628800=10!$. The cube-root boundary is exactly 100 because $100^3=10^6$; this corrects the 99 shown in the slide's answer table.",
    "explanation": "Invert each monotone cost function and round down to the largest feasible integer. The equality at n=100 must be included.",
    "references": [
      "Lecture2-examples.pdf — PDF page 4, time-budget exercise; PDF page 5, answer table. Adapted to one second and corrected the exact cube-root boundary."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "growth-rates",
      "time-budget",
      "source-correction"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 8,
    "rubric": [
      {
        "criterion": "Gets log, square-root, and linear boundaries.",
        "marks": 2
      },
      {
        "criterion": "Gets n lg n=62746 and checks both neighboring values.",
        "marks": 2
      },
      {
        "criterion": "Gets quadratic and cubic boundaries, including n=100.",
        "marks": 2
      },
      {
        "criterion": "Gets exponential and factorial boundaries and verifies their next integers fail.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Convert the time budget to microseconds before solving the inequalities.",
      "For n lg n and n!, check that the proposed integer fits and the next integer does not."
    ],
    "walkthroughSteps": [
      "Use a budget of 1,000,000.",
      "Invert the logarithmic, polynomial, and exponential functions.",
      "Find the n lg n threshold using its monotonicity and adjacent-integer checks.",
      "Check factorial values 9! and 10!."
    ]
  },
  {
    "id": "alg-e1-found-25",
    "type": "free",
    "prompt": "Insertion-sort written practice. The sorting problem takes a finite sequence and must return a nondecreasing permutation of that sequence. Trace the following algorithm on A=[5,2,4,6,1,3], recording A after each outer iteration. State a loop invariant establishing correctness, explain termination, and give best/worst tight times and the exact number of shifts on a reverse-sorted distinct n-element input. Indices start at 1 and arithmetic/comparisons have unit cost.\n\n```\nfor i = 2 to n:\n  key = A[i]\n  j = i - 1\n  while j > 0 and A[j] > key:\n    A[j+1] = A[j]  // shift\n    j = j - 1\n  A[j+1] = key\n```",
    "sampleAnswer": "After i=2: [2,5,4,6,1,3]. After i=3: [2,4,5,6,1,3]. After i=4: [2,4,5,6,1,3]. After i=5: [1,2,4,5,6,3]. After i=6: [1,2,3,4,5,6].\n\nInvariant: at the start of outer iteration i, A[1..i-1] is a sorted permutation of the original first i-1 elements. It holds at i=2 for a one-element prefix. Shifting the larger elements and inserting key in the gap makes A[1..i] a sorted permutation of the original first i elements, preserving the invariant. At exit i=n+1, the full array is a sorted permutation, satisfying the output requirement.\n\nThe inner loop terminates because j decreases whenever its body runs and stops at j=0 or at an entry <=key; the outer loop has finitely many iterations. Best case (already sorted) is $\\Theta(n)$, with no shifts. Worst case (reverse-sorted distinct entries) shifts i-1 elements at iteration i, for $\\sum_{i=2}^n(i-1)=n(n-1)/2$ shifts and $\\Theta(n^2)$ time.",
    "explanation": "This combines the lecture insertion-sort example with generated trace and correctness tasks. A sorting algorithm must preserve the input multiset as well as order the output.",
    "references": [
      "Lecture1-introduction.pdf — PDF page 19, algorithm definition.",
      "Lecture2-examples.pdf — PDF pages 2 and 6–11, sorting problem, insertion-sort pseudocode, trace, and case analysis; correctness task added."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "exam-style",
      "insertion-sort",
      "correctness",
      "loop-invariant",
      "high-priority"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Provides all five correct trace arrays.",
        "marks": 2
      },
      {
        "criterion": "States the sorted-permutation prefix invariant.",
        "marks": 1
      },
      {
        "criterion": "Explains initialization, maintenance, and termination/postcondition.",
        "marks": 2
      },
      {
        "criterion": "Gives best/worst times and n(n-1)/2 worst-case shifts.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Insert each current key into the sorted prefix; do not reorder the untouched suffix.",
      "The invariant must establish that the prefix contains the same elements as before, not merely that it is sorted."
    ],
    "walkthroughSteps": [
      "Trace the position where each key is inserted.",
      "Describe the sorted prefix at the start of an iteration.",
      "Prove the invariant initially and after a shift-and-insert step.",
      "Use the final invariant to prove the sorting contract.",
      "Sum i-1 shifts for the reverse-sorted case."
    ]
  },
  {
    "id": "alg-e1-found-26",
    "type": "free",
    "prompt": "Lecture merge exercise. Merge sorted lists L=[2,4,6,7] and R=[1,2,3,5] by repeatedly comparing the first unconsumed elements and choosing L on ties. Write the merged output and the number of element comparisons in the main loop. Explain why that loop requires BOTH lists to be nonempty, what happens after one empties, why choosing L on ties supports stability, and the tight merge time for m+n total entries.",
    "sampleAnswer": "The output is [1,2(L),2(R),3,4,5,6,7]. The main comparisons are (2,1), (2,2), (4,2), (4,3), (4,5), and (6,5): six comparisons. R then empties and the remaining 6,7 from L are copied without more element-to-element comparisons.\n\nThe main loop requires both lists to have an unconsumed element so that neither comparison access goes out of bounds. After either list is exhausted, append the other list's remaining tail. During merge sort, the left half precedes the right half in the original sequence; choosing its equal key first, together with stable recursive sorts, preserves equal-key relative order. Every entry is emitted exactly once and each comparison emits an entry, giving $\\Theta(m+n)$ time including tail copies.",
    "explanation": "This preserves the slide's 'why not go through both entirely?' question and its concrete lists. Main-loop comparisons and copying work are different counts.",
    "references": [
      "Lecture2-examples.pdf — PDF pages 13–14, merge-loop question and concrete L/R example."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "merge-sort",
      "merge",
      "stability"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gives the correct output with the left 2 preceding the right 2.",
        "marks": 1
      },
      {
        "criterion": "Counts and shows six main-loop comparisons.",
        "marks": 2
      },
      {
        "criterion": "Explains the AND guard and the remaining-tail copy.",
        "marks": 2
      },
      {
        "criterion": "Explains stability and tight linear merge time.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Stop comparing as soon as either front element ceases to exist.",
      "Track the origins of equal values; stability concerns their original relative order."
    ],
    "walkthroughSteps": [
      "Simulate each front-element comparison.",
      "Count six comparisons before R is exhausted.",
      "Append L's tail.",
      "Explain why each element is written once and why tie handling preserves relative order."
    ]
  },
  {
    "id": "alg-e1-found-27",
    "type": "free",
    "prompt": "Lecture merge-sort recurrence exercise. For n a power of 2, let $T(1)=b>0$ and $T(n)=2T(n/2)+cn$ with constant $c>0$. Derive the exact solution using level costs, then verify the formula by induction and conclude a tight asymptotic bound.",
    "sampleAnswer": "Let $h=\\lg n$. At each internal level $i=0,\\ldots,h-1$, there are $2^i$ subproblems of size $n/2^i$, with total nonrecursive cost $2^i c(n/2^i)=cn$. There are n leaves of cost b. Therefore\n\n$$T(n)=bn+cn\\lg n=\\Theta(n\\lg n)\\quad(n\\ge2).$$\n\nInduction: n=1 gives $b=b+c\\cdot1\\cdot0$. Assuming the formula for n/2,\n\n$$2\\left(b\\frac n2+c\\frac n2\\lg\\frac n2\\right)+cn=bn+cn(\\lg n-1)+cn=bn+cn\\lg n.$$\n\nThis matches the recurrence exactly. In merge sort, two half-size recursive sorts and a linear-time merge produce this form.",
    "explanation": "The lecture asks to show a tight merge-sort bound. Here the linear combining term is made explicit so both a tree sum and an exact induction are possible.",
    "references": [
      "Lecture2-examples.pdf — PDF page 16, merge-sort recurrence.",
      "Lecture4-Asymptotic notation-computation.pdf — PDF page 15, 'Merge sort revisit' proof exercise."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "merge-sort",
      "recurrences",
      "substitution",
      "recursion-tree",
      "high-priority"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 6,
    "rubric": [
      {
        "criterion": "Gets log2(n) internal levels, cn per level, and n leaf costs.",
        "marks": 2
      },
      {
        "criterion": "Derives bn+cn lg n and the tight bound.",
        "marks": 2
      },
      {
        "criterion": "Verifies the base and exact inductive substitution.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Multiplying node count by node cost makes each internal level cost cn.",
      "Use $\\lg(n/2)=\\lg n-1$ in the induction."
    ],
    "walkthroughSteps": [
      "Count internal levels and leaves.",
      "Add all internal-level costs and the leaf costs.",
      "Verify the formula at n=1.",
      "Substitute the exact formula at n/2 and simplify."
    ]
  },
  {
    "id": "alg-e1-found-28",
    "type": "free",
    "prompt": "Lecture substitution exercise. Let $T(1)=b>0$ and $T(n)=4T(n/2)+n$ for powers of 2. A proof tries $T(k)\\le Ck^2$ and obtains $T(n)\\le Cn^2+n$, then says this is $O(n^2)$. Explain why this fails to close the induction. Repair it with a stronger hypothesis, prove a matching lower bound, and conclude a tight result.",
    "sampleAnswer": "The induction must establish $T(n)\\le Cn^2$ using the same fixed C; $Cn^2+n$ is larger than $Cn^2$. Relabeling it as O(n^2) does not prove that hypothesis.\n\nStrengthen it to $T(n)\\le Cn^2-Dn$, with $D\\ge1$ and $C\\ge b+D$. Base: $b\\le C-D$. Then\n\n$$T(n)\\le4\\left(C(n/2)^2-D(n/2)\\right)+n=Cn^2-(2D-1)n\\le Cn^2-Dn.$$\n\nThe last inequality uses $D\\ge1$. Hence $T=O(n^2)$. For the lower bound, the tree has $4^{\\lg n}=n^2$ leaves of positive cost b, so $T(n)\\ge bn^2=\\Omega(n^2)$. Equivalently, induction on $T(n)\\ge bn^2$ closes because $4b(n/2)^2+n\\ge bn^2$. Therefore $T(n)=\\Theta(n^2)$. The exact solution is $(b+1)n^2-n$, which also verifies these bounds.",
    "explanation": "This directly covers the lecture's failed-induction repair and the explicit tighter-lower-bound exercise. The recurrence's additive term requires slack in the upper-bound hypothesis.",
    "references": [
      "Lecture4-Asymptotic notation-computation.pdf — PDF pages 7–14, strengthened quadratic induction and lower-bound exercise."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "substitution",
      "recurrences",
      "induction",
      "high-priority"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 7,
    "rubric": [
      {
        "criterion": "Explains why Cn^2+n does not close the fixed-constant hypothesis.",
        "marks": 1
      },
      {
        "criterion": "Chooses a stronger Cn^2-Dn bound with valid constants/base.",
        "marks": 2
      },
      {
        "criterion": "Proves the inductive step correctly.",
        "marks": 2
      },
      {
        "criterion": "Proves Omega(n^2) and concludes Theta(n^2).",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Do not change C during the inductive step.",
      "Subtract a lower-order linear term so recursive multiplication creates room for the +n."
    ],
    "walkthroughSteps": [
      "Compare the attempted bound to the actual inductive goal.",
      "Introduce -Dn and cover the base by choosing C.",
      "Calculate how four half-size linear corrections combine.",
      "Prove a quadratic lower bound separately using leaves or induction."
    ]
  },
  {
    "id": "alg-e1-found-29",
    "type": "free",
    "prompt": "Lecture recursion-tree example. Let $T(1)=b>0$ and $T(n)=3T(n/4)+cn^2$ for powers of 4, with $c>0$. Give tree depth, node count and total cost at level i, leaf cost, a tight bound, and a substitution check of the upper bound.",
    "sampleAnswer": "Put $h=\\log_4 n$. At level i there are $3^i$ nodes, each of size $n/4^i$, so total nonrecursive cost is\n\n$$3^i c(n/4^i)^2=cn^2(3/16)^i.$$\n\nThe h internal levels have i=0 through h-1. There are $3^h=n^{\\log_4 3}$ leaves, costing $b n^{\\log_4 3}$ in total. Hence\n\n$$T(n)=cn^2\\frac{1-(3/16)^h}{1-3/16}+b n^{\\log_4 3}=\\Theta(n^2).$$\n\nThe root alone gives $\\Omega(n^2)$. For substitution, choose $D\\ge\\max\\{b,16c/13\\}$. Base: $T(1)=b\\le D$. Assuming $T(n/4)\\le D(n/4)^2$,\n\n$$T(n)\\le (3D/16+c)n^2\\le Dn^2.$$\n\nThis proves $O(n^2)$ and confirms the tree result.",
    "explanation": "Quadratic work decreases by a factor 3/16 per tree level, so the root contributes a constant fraction of the total.",
    "references": [
      "Lecture5-Asymptotic notation-recursion tree.pdf — PDF pages 5–8, three quarter-size subproblems with quadratic work and substitution verification; the Theta term is made explicit as cn^2."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "recursion-tree",
      "geometric-sum",
      "substitution"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gets depth log4 n, 3^i nodes, and cn^2(3/16)^i level cost.",
        "marks": 2
      },
      {
        "criterion": "Includes the leaf cost and sums the decreasing geometric series.",
        "marks": 2
      },
      {
        "criterion": "Provides constants and base for a valid substitution upper bound.",
        "marks": 2
      },
      {
        "criterion": "States the root lower bound and the tight quadratic result.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Multiply the number of nodes by the square of their size.",
      "The geometric ratio is 3/16; solve 3D/16+c<=D for the induction constant."
    ],
    "walkthroughSteps": [
      "Determine tree depth and the number of subproblems at each level.",
      "Sum internal levels and account for terminal costs.",
      "Use root work for the lower bound.",
      "Substitute a Dn^2 upper hypothesis and choose D large enough."
    ]
  },
  {
    "id": "alg-e1-found-30",
    "type": "free",
    "prompt": "Lecture unequal-split example. For powers of 2, let $T(1),T(2)$ be positive constants and, for $n\\ge4$, $T(n)=T(n/4)+T(n/2)+n^2$. Use a recursion-tree upper bound and substitution to obtain a tight result. Explain why the basic Master theorem does not directly apply and why equal full-level costs cannot be assumed all the way to the deepest leaf.",
    "sampleAnswer": "The two recursive children have unequal sizes, so this is not directly of the form $aT(n/b)+f(n)$. A full internal level replaces a squared size s^2 by $(s/4)^2+(s/2)^2=(5/16)s^2$. Therefore internal work at level i is at most $n^2(5/16)^i$; once shorter branches stop, pruning only reduces that work. The internal sum is at most $(16/11)n^2$. Terminal subproblem sizes are 1 or 2. At every split the child sizes sum to at most the parent size, so the number of leaves is at most n, and terminal costs add $O(n)$.\n\nThus the tree gives $O(n^2)$, while the root gives $\\Omega(n^2)$. For substitution choose\n\n$$D\\ge\\max\\{T(1),T(2)/4,16/11\\}.$$\n\nThe two bases satisfy $T(s)\\le Ds^2$. The step is\n\n$$T(n)\\le D(n/4)^2+D(n/2)^2+n^2=(5D/16+1)n^2\\le Dn^2.$$\n\nTherefore $T(n)=\\Theta(n^2)$. The shortest branches divide by 4 and end earlier than the longest branches that repeatedly divide by 2; the geometric full-level expression is an upper bound after pruning, not an exact formula for every level.",
    "explanation": "The lecture's unequal-size tree requires care when branches end at different depths. A geometric upper bound plus induction proves the tight result without pretending the tree stays full.",
    "references": [
      "Lecture5-Asymptotic notation-recursion tree.pdf — PDF pages 9–18, T(n/4)+T(n/2)+n^2 tree."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "recursion-tree",
      "unequal-splits",
      "substitution"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 6,
    "rubric": [
      {
        "criterion": "Identifies unequal sizes and the basic Master theorem limitation.",
        "marks": 1
      },
      {
        "criterion": "Derives the 5/16 level-work factor and uses it as an upper bound after pruning.",
        "marks": 2
      },
      {
        "criterion": "Includes bounded terminal costs and root lower bound.",
        "marks": 1
      },
      {
        "criterion": "Gives a valid quadratic induction with constants/base and concludes Theta(n^2).",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Add the squared fractions 1/16 and 1/4.",
      "After some leaves appear, complete-level formulas remain useful as upper bounds, not exact counts."
    ],
    "walkthroughSteps": [
      "Compute how quadratic work changes across the two children.",
      "Sum a decreasing geometric upper bound for internal levels.",
      "Bound terminal costs using the nonincreasing total size of the tree frontier.",
      "Verify the quadratic induction and use root work as a lower bound."
    ]
  },
  {
    "id": "alg-e1-found-31",
    "type": "free",
    "prompt": "Lecture irregular recurrence. Use the standard real-size tree model: $T(x)=\\Theta(1)$ for $0<x\\le1$, and $T(n)=T(n/3)+T(2n/3)+cn$ for $n>1$, with $c>0$. Prove a tight bound by bounding tree heights and level costs. Then check it with the supplied Akra–Bazzi rule: if $(1/3)^p+(2/3)^p=1$, the bound is $\\Theta(n^p(1+\\int_1^n f(u)/u^{p+1}\\,du))$. This starred lecture extension is secondary practice.",
    "sampleAnswer": "The earliest possible leaves follow repeated division by 3 and appear at depth about $\\log_3 n$; the longest path follows repeated multiplication by 2/3 and has depth about $\\log_{3/2}n$. Both are $\\Theta(\\log n)$. Until the first leaves, every level's subproblem sizes sum to n, since each split conserves size. There are $\\lfloor\\log_3 n\\rfloor$ complete internal levels, each costing cn, giving $\\Omega(n\\log n)$.\n\nAt later levels, the sum of active subproblem sizes is at most n, so each costs at most cn. There are $O(\\log n)$ levels, giving $O(n\\log n)$ internal work. Leaves have sizes in $(1/3,1]$ and their total size is n, so there are $\\Theta(n)$ leaves; constant leaf costs do not change the result. Hence $T(n)=\\Theta(n\\log n)$.\n\nFor Akra–Bazzi, $p=1$ because $1/3+2/3=1$. With $f(u)=cu$,\n\n$$T(n)=\\Theta\\left(n\\left(1+\\int_1^n\\frac{cu}{u^2}\\,du\\right)\\right)=\\Theta(n(1+c\\ln n))=\\Theta(n\\log n).$$\n\nThe basic equal-size Master theorem cannot be applied directly to the two different child fractions.",
    "explanation": "The tree is not full to its deepest level, but full early levels establish the lower bound and maximum height establishes the upper bound.",
    "references": [
      "Lecture5-Asymptotic notation-recursion tree.pdf — PDF page 19, irregular recurrence.",
      "Lecture6-Asymptotic notation-master theorem.pdf — PDF pages 18–20, tree and starred Akra–Bazzi extension."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "unequal-splits",
      "recursion-tree",
      "akra-bazzi",
      "secondary-practice"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 7,
    "rubric": [
      {
        "criterion": "Bounds early and longest depths logarithmically.",
        "marks": 1
      },
      {
        "criterion": "Uses size conservation and complete early levels for Omega(n log n).",
        "marks": 2
      },
      {
        "criterion": "Gives the upper bound including terminal costs and concludes Theta.",
        "marks": 2
      },
      {
        "criterion": "Finds p=1 and evaluates the Akra–Bazzi integral.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "Follow all-small and all-large children to obtain two depth bounds.",
      "For the lower bound use only the complete early levels, rather than all levels."
    ],
    "walkthroughSteps": [
      "Bound the shortest and longest root-to-leaf paths.",
      "Show conserved total size before pruning and bounded active size after pruning.",
      "Count early full levels for the lower bound and all levels for the upper bound.",
      "Solve the p equation and integrate c/u as a separate check."
    ]
  },
  {
    "id": "alg-e1-found-32",
    "type": "free",
    "prompt": "Lecture Master-method examples. For each recurrence give a, b, $n^{\\log_b a}$, the applicable case, and a tight bound. Verify regularity whenever using case 3. Assume positive constant base costs and standard harmless integer rounding.\n\n(a) $T(n)=9T(n/3)+n$\n(b) $T(n)=T(2n/3)+1$\n(c) $T(n)=3T(n/4)+n\\lg n$\n(d) $T(n)=2T(n/2)+n\\lg n$",
    "sampleAnswer": "(a) $a=9,b=3$, watershed $n^2$. The driving n is polynomially smaller ($\\epsilon=1$), so case 1 gives $\\Theta(n^2)$.\n\n(b) Rewrite $T(2n/3)$ as $T(n/(3/2))$. Thus $a=1,b=3/2$, watershed $n^0=1$. The constant driving function matches it; case 2 with k=0 gives $\\Theta(\\lg n)$.\n\n(c) $a=3,b=4$, watershed $n^p$ with $p=\\log_4 3<1$. Since $n\\lg n=\\Omega(n^{p+\\epsilon})$ with $\\epsilon=1-p>0$, and\n\n$$3f(n/4)=\\tfrac34n(\\lg n-2)\\le\\tfrac34n\\lg n=\\tfrac34 f(n)$$\n\nfor sufficiently large n, case 3 applies and gives $\\Theta(n\\lg n)$.\n\n(d) $a=2,b=2$, watershed n. Here $f(n)=n\\lg n=\\Theta(n(\\lg n)^1)$, so the lecture's extended case 2 with k=1 gives $\\Theta(n(\\lg n)^2)$.",
    "explanation": "These are the four consecutive lecture examples, including the extended logarithmic case 2.",
    "references": [
      "Lecture6-Asymptotic notation-master theorem.pdf — PDF pages 6–10, Master cases and four examples."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "master-theorem",
      "logarithmic-factor"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 8,
    "rubric": [
      {
        "criterion": "Solves (a) with correct parameters and polynomial gap.",
        "marks": 2
      },
      {
        "criterion": "Rewrites (b) with b=3/2 and gets the logarithmic bound.",
        "marks": 2
      },
      {
        "criterion": "Solves (c) and checks its regularity condition.",
        "marks": 2
      },
      {
        "criterion": "Uses case 2 with k=1 for (d), obtaining n(lg n)^2.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "For (b), n/b=2n/3 means b=3/2.",
      "For (d), the lecture's case 2 allows $(\\lg n)^k$ and adds one more logarithm."
    ],
    "walkthroughSteps": [
      "Compute the watershed in each recurrence.",
      "Check polynomial smaller/larger conditions or a matching logarithmic form.",
      "For the larger driving function, calculate a f(n/b).",
      "Apply the case formula and keep the extra logarithm when appropriate."
    ]
  },
  {
    "id": "alg-e1-found-33",
    "type": "free",
    "prompt": "Explain the tree behind the three Master cases. For $T(n)=aT(n/b)+n^d$, assume integer $a\\ge1$, integer $b>1$, $d\\ge0$, n a power of b, and $T(1)=B>0$. Derive the depth, number of leaves, and work at level i. Sum the work for $a/b^d<1$, $a/b^d=1$, and $a/b^d>1$, including leaves. Also state why recurrences with unequal child sizes or size n-1 require another method.",
    "sampleAnswer": "Let $h=\\log_b n$ and $p=\\log_b a$. Depth is h, and there are $a^h=n^p$ leaves with total cost $Bn^p$. Internal level i has $a^i$ nodes of size $n/b^i$, so its work is\n\n$$n^d(a/b^d)^i.$$\n\nIf $r=a/b^d<1$ (d>p), the internal geometric series is $\\Theta(n^d)$ and leaves are lower order: $\\Theta(n^d)$, the root-dominated case 3.\n\nIf r=1 (d=p), each of h internal levels costs $n^d$; adding leaves gives $\\Theta(n^d\\log n)$, case 2.\n\nIf r>1 (d<p), the increasing geometric series and leaves have order $n^p$, because $n^d r^h=n^p$: $\\Theta(n^p)$, case 1.\n\nThe basic theorem requires fixed a equal-size calls on n/b. Different fractions, such as $T(n/3)+T(2n/3)$, do not have one common b; subtractive sizes such as n-1 do not shrink by a fixed factor. Use substitution, recursion trees, or a suitable generalized theorem instead.",
    "explanation": "The Master theorem summarizes whether a geometrically changing tree's root, all levels, or leaves dominate.",
    "references": [
      "Lecture6-Asymptotic notation-master theorem.pdf — PDF pages 11–17, tree intuition for three cases; PDF pages 18–21, generalized method and caveats."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "exam-style",
      "master-theorem",
      "recursion-tree",
      "theorem-conditions"
    ],
    "difficulty": "med",
    "homeworkFormat": "proof",
    "points": 6,
    "rubric": [
      {
        "criterion": "Derives height, leaf count/cost, and level work.",
        "marks": 2
      },
      {
        "criterion": "Correctly sums and identifies all three ratio cases.",
        "marks": 3
      },
      {
        "criterion": "Explains the fixed-size-ratio condition and identifies alternative methods.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The geometric ratio is the node-count multiplier a divided by the work shrinkage b^d.",
      "In the increasing case, combine n^d with r^(log_b n)."
    ],
    "walkthroughSteps": [
      "Count depth and leaves from the recursion factor.",
      "Multiply node count by the driving cost at each node.",
      "Sum the resulting series according to its ratio.",
      "Include terminal costs and relate each answer to a Master case.",
      "Check that a recurrence actually fits the theorem's form before using it."
    ]
  },
  {
    "id": "alg-e1-found-34",
    "type": "free",
    "prompt": "Lecture matrix-multiplication exercise. Under unit-cost scalar arithmetic, analyze (a) the triple-loop code below and (b) divide-and-conquer multiplication of two n-by-n matrices by splitting each into four n/2-by-n/2 blocks. For (a), count scalar multiplications and additions in the update line and explain the needed initialization. For (b), give all four block product formulas, derive the recurrence, and solve it. Assume n is a power of 2.\n\n```\nfor i = 1 to n:\n  for j = 1 to n:\n    C[i,j] = 0\n    for k = 1 to n:\n      C[i,j] = C[i,j] + A[i,k] * B[k,j]\n```",
    "sampleAnswer": "(a) There are $n^3$ updates, each using one multiplication and one addition, so the given implementation performs $n^3$ scalar multiplications and $n^3$ scalar additions, plus $n^2$ zero initializations. Its time is $\\Theta(n^3)$. Each C entry must start at zero because it accumulates a dot product; an arbitrary initial value would be added to the correct result.\n\n(b) With $A=\\begin{pmatrix}a&b\\\\c&d\\end{pmatrix}$ and $B=\\begin{pmatrix}e&f\\\\g&h\\end{pmatrix}$ in block notation,\n\n$$C=\\begin{pmatrix}ae+bg&af+bh\\\\ce+dg&cf+dh\\end{pmatrix}.$$\n\nThis needs eight recursive block multiplications and four block additions. A block addition costs $\\Theta((n/2)^2)=\\Theta(n^2)$, so $T(n)=8T(n/2)+\\Theta(n^2)$ with constant base cost. The watershed is $n^{\\log_2 8}=n^3$ and the combining work is polynomially smaller; Master case 1 yields $\\Theta(n^3)$. Ordinary divide-and-conquer has not improved the asymptotic exponent over the triple loop.",
    "explanation": "The slide asks for the running time and the divide-and-conquer recurrence. Explicit zero initialization makes its accumulation code self-contained.",
    "references": [
      "Lecture7-Divide-and-conquer-matrix-mutl.pdf — PDF pages 3–7, triple loop, block formulas, and recurrence questions; zero initialization made explicit."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "matrix-multiplication",
      "divide-and-conquer",
      "master-theorem"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 7,
    "rubric": [
      {
        "criterion": "Counts n^3 scalar multiplications/additions and explains zero initialization.",
        "marks": 2
      },
      {
        "criterion": "Provides the four correct ordered block products.",
        "marks": 2
      },
      {
        "criterion": "Derives 8T(n/2)+Theta(n^2) from eight multiplications and four additions.",
        "marks": 2
      },
      {
        "criterion": "Solves the recurrence as Theta(n^3).",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Count how many triples (i,j,k) execute the update.",
      "Each of the four output blocks is a sum of two block products."
    ],
    "walkthroughSteps": [
      "Count update executions and initialization work.",
      "Write the four block dot-product equations.",
      "Count recursive multiplications and linear-in-entry-count block additions.",
      "Apply Master case 1 using watershed n^3."
    ]
  },
  {
    "id": "alg-e1-found-35",
    "type": "free",
    "prompt": "Strassen written practice with generated numeric inputs. Let $A=\\begin{pmatrix}1&2\\\\3&4\\end{pmatrix}$ and $B=\\begin{pmatrix}5&6\\\\7&8\\end{pmatrix}$. Use the lecture's seven products below to compute AB. With $A=(\\begin{smallmatrix}a&b\\\\c&d\\end{smallmatrix})$ and $B=(\\begin{smallmatrix}e&f\\\\g&h\\end{smallmatrix})$, verify symbolically that the formula for r gives ae+bg. Then derive and solve the recursive n-by-n running-time recurrence, and explain why extra additions can be worthwhile.\n\n$$\\begin{aligned}P_1&=a(f-h),&P_2&=(a+b)h,&P_3&=(c+d)e,\\\\P_4&=d(g-e),&P_5&=(a+d)(e+h),\\\\P_6&=(b-d)(g+h),&P_7&=(a-c)(e+f).\\end{aligned}$$\n\n$$r=P_5+P_4-P_2+P_6,\\quad s=P_1+P_2,\\quad t=P_3+P_4,\\quad u=P_5+P_1-P_3-P_7.$$",
    "sampleAnswer": "The seven scalar products are $P_1=-2$, $P_2=24$, $P_3=35$, $P_4=8$, $P_5=65$, $P_6=-30$, and $P_7=-22$. Thus $r=65+8-24-30=19$, $s=-2+24=22$, $t=35+8=43$, and $u=65-2-35-(-22)=50$, giving\n\n$$AB=\\begin{pmatrix}19&22\\\\43&50\\end{pmatrix}.$$\n\nFor the symbolic top-left block,\n\n$$\\begin{aligned}r&=(a+d)(e+h)+d(g-e)-(a+b)h+(b-d)(g+h)\\\\&=ae+ah+de+dh+dg-de-ah-bh+bg+bh-dg-dh\\\\&=ae+bg.\\end{aligned}$$\n\nMultiplication order is preserved, so this argument also works for blocks without assuming matrix products commute. There are seven recursive half-size products and a constant number (18 for these formulas) of block additions/subtractions, giving $T(n)=7T(n/2)+\\Theta(n^2)$. Its watershed exponent is $\\log_2 7\\approx2.80735>2$, so case 1 yields $\\Theta(n^{\\log_2 7})=o(n^3)$. More quadratic combining work is asymptotically worthwhile because it removes one recursive multiplication and lowers the exponent; constants can still matter for small n.",
    "explanation": "Numeric matrices are added practice; the products, reconstruction, symbolic cancellation, and recurrence follow the lecture.",
    "references": [
      "Lecture7-Divide-and-conquer-matrix-mutl.pdf — PDF pages 10–15, seven products, reconstruction, cancellation, and recurrence; numeric inputs generated."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "exam-style",
      "strassen",
      "matrix-multiplication",
      "divide-and-conquer"
    ],
    "difficulty": "med",
    "homeworkFormat": "calc",
    "points": 8,
    "rubric": [
      {
        "criterion": "Computes all seven products and the correct result matrix.",
        "marks": 3
      },
      {
        "criterion": "Verifies r by ordered expansion/cancellation.",
        "marks": 2
      },
      {
        "criterion": "Derives the seven-call recurrence and solves it correctly.",
        "marks": 2
      },
      {
        "criterion": "Explains the tradeoff between quadratic additions and recursive multiplications.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Keep the seven product values separate before combining them.",
      "Do not commute block products during symbolic expansion; keep every left factor on the left."
    ],
    "walkthroughSteps": [
      "Substitute the eight scalar entries into P1 through P7.",
      "Combine products to obtain the four output entries.",
      "Expand the formula for r and cancel terms while preserving order.",
      "Count seven recursive products and quadratic combining work.",
      "Compare log2(7) to the ordinary exponent 3."
    ]
  },
  {
    "id": "alg-e1-found-36",
    "type": "free",
    "prompt": "Lecture binary-search example plus an absent-target check. Use the sorted zero-indexed array A=[0,1,9,11,21,22,34], BEG=0, END=6, MID=floor((BEG+END)/2), and the usual MID-1/MID+1 updates. Trace all (BEG,END,MID,A[MID]) tuples when searching (a) 9 and (b) 10. Give the returned positions (-1 if absent), state the sorted-array precondition and termination rule, derive the worst-case time recurrence, and compare iterative with recursive auxiliary space.",
    "sampleAnswer": "(a) Searching 9: (0,6,3,11) sends END to 2; (0,2,1,1) sends BEG to 2; (2,2,2,9) matches. Return position 2.\n\n(b) Searching 10: (0,6,3,11) sends END to 2; (0,2,1,1) sends BEG to 2; (2,2,2,9) sends BEG to 3. Now BEG=3>END=2, so stop and return -1.\n\nThe array must be ordered consistently with the comparison relation. The invariant restricts any possible target to the inclusive [BEG,END] interval. An unsuccessful iteration removes MID and the impossible half; the interval strictly shrinks. A found target or BEG>END terminates the search.\n\nWorst case keeps one subproblem of at most $\\lfloor n/2\\rfloor$ entries: $T(n)=T(\\lfloor n/2\\rfloor)+\\Theta(1)$, with $T(0)=\\Theta(1)$. Hence worst-case time is $\\Theta(\\lg n)$ for growing n (best case $\\Theta(1)$). The iterative version uses $\\Theta(1)$ auxiliary space; a normal recursive version uses $\\Theta(\\lg n)$ worst-case call-stack space.",
    "explanation": "The search for 9 is the slide example; the absent target makes the empty-interval base case explicit. Only one half is searched at each step.",
    "references": [
      "Lecture8-Divide-and-conquer-02.pdf — PDF pages 3–6, binary search pseudocode, search-for-9 trace, and recurrence exercise.",
      "Lecture3-Asymptotic notation.pdf — PDF page 17, recursive empty-interval base case."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "binary-search",
      "divide-and-conquer",
      "recurrences",
      "space"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gives both correct tuple traces and return values.",
        "marks": 3
      },
      {
        "criterion": "States the sorted precondition and shrinking-interval termination.",
        "marks": 1
      },
      {
        "criterion": "Derives a one-call halving recurrence and tight logarithmic time.",
        "marks": 2
      },
      {
        "criterion": "Distinguishes iterative constant space from recursive logarithmic stack space.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "After a mismatch, exclude MID as well as the impossible half.",
      "For the absent target, continue until BEG exceeds END rather than trying to inspect another MID."
    ],
    "walkthroughSteps": [
      "Compute each midpoint with integer floor.",
      "Apply the comparison to update exactly one bound.",
      "Stop at a match or empty interval.",
      "Count one surviving half-size call per level.",
      "Count live frames only for the recursive implementation."
    ]
  },
  {
    "id": "alg-e1-found-37",
    "type": "free",
    "prompt": "Lecture powering problem. For integer $n\\ge0$, design a repeated-squaring routine for $a^n$ that computes the half-power only once per call. Use base cases n=0 and n=1. Give pseudocode, prove the even/odd identities, derive the time recurrence under unit-cost arithmetic, and trace exponents and multiplication count for n=13. How would evaluating the same half-power by two separate recursive calls change the complexity?",
    "sampleAnswer": "```\nPower(a,n):\n  if n == 0: return 1\n  if n == 1: return a\n  h = Power(a, floor(n/2))\n  q = h*h\n  if n is even: return q\n  return q*a\n```\n\nIf n=2k, $a^n=(a^k)^2$. If n=2k+1, $a^n=(a^k)^2a$. Together with the two correct base cases, induction proves the routine correct.\n\nThe stored h gives one recursive call: $T(n)=T(\\lfloor n/2\\rfloor)+\\Theta(1)$ for n>=2, so $T(n)=\\Theta(\\lg n)$. For 13 the call exponents are 13,6,3,1. The return at 3 uses two multiplications to produce $a^3$; at 6 one produces $a^6$; at 13 two produce $a^{13}$. Total: five multiplications.\n\nIf both occurrences of $a^k$ were computed by separate calls, the recurrence would become $S(n)=2S(\\lfloor n/2\\rfloor)+\\Theta(1)$ and time $\\Theta(n)$; storing and reusing h is essential for the logarithmic bound. These are arithmetic-operation bounds, with operand size ignored as stated.",
    "explanation": "The lecture's one-call recurrence assumes the repeated half-power is computed once and reused. The pseudocode makes that assumption reviewable.",
    "references": [
      "Lecture8-Divide-and-conquer-02.pdf — PDF pages 7–9, powering identities and logarithmic recurrence; reuse and n=13 trace made explicit."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "repeated-squaring",
      "divide-and-conquer",
      "recurrences"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gives correct pseudocode with one stored half-power and both bases.",
        "marks": 2
      },
      {
        "criterion": "Justifies both parity identities and correctness.",
        "marks": 1
      },
      {
        "criterion": "Derives logarithmic time for one call and linear time for duplicated calls.",
        "marks": 2
      },
      {
        "criterion": "Traces 13,6,3,1 and counts five multiplications under the specified bases.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "The two written factors are the same subproblem; store its answer.",
      "At an odd exponent, square the half-power and multiply by a once more."
    ],
    "walkthroughSteps": [
      "Handle exponents zero and one.",
      "Compute h once at floor(n/2) and reuse it.",
      "Use parity to reconstruct the requested power.",
      "Count recursion depth and compare against a two-call implementation.",
      "Trace the nonbase returns at 3,6,13."
    ]
  },
  {
    "id": "alg-e1-found-38",
    "type": "free",
    "prompt": "Lecture Fibonacci exercise, part (a). Use the lecture's shifted sequence $G_0=1$, $G_1=2$, $G_n=G_{n-1}+G_{n-2}$ for n>=2. A naive recursive routine calls itself for both preceding terms and does no memoization. Give its running-time recurrence, show its time is exponential, calculate $G_7$, and count the total calls for n=7 if every invocation (including base cases) counts once. Identify repeated work. Use unit-cost arithmetic.",
    "sampleAnswer": "The recurrence is $T(n)=T(n-1)+T(n-2)+\\Theta(1)$ for n>=2, with constant bases. For exact invocation counts, $C_0=C_1=1$ and $C_n=C_{n-1}+C_{n-2}+1$. Let $F_0=0,F_1=1$ be standard Fibonacci numbers. Induction gives $C_n=2F_{n+1}-1$: the two bases agree, and the recurrence preserves the formula.\n\nSince the roots of $r^2=r+1$ are $\\varphi=(1+\\sqrt5)/2>1$ and $\\psi=(1-\\sqrt5)/2$ with $|\\psi|<1$, the Fibonacci formula $F_k=(\\varphi^k-\\psi^k)/\\sqrt5$ gives $C_n=\\Theta(\\varphi^n)$. Each call does bounded work, so naive time is $\\Theta(\\varphi^n)$, exponential. A coarser proof is $C_n\\ge2C_{n-2}+1$, which already gives an exponential lower bound.\n\nThe shifted values are 1,2,3,5,8,13,21,34, so G7=34. The invocation counts are 1,1,3,5,9,15,25,41, so C7=41. For example, G5 is evaluated once inside G6 and again as the other child of G7; many smaller terms are also recomputed.",
    "explanation": "The sequence uses the slide's shifted bases. The recursion's repeated subproblems cause exponential time regardless of that shift.",
    "references": [
      "Lecture8-Divide-and-conquer-02.pdf — PDF pages 10–12, shifted Fibonacci definition and textbook exercise 31-3(a).",
      "Lecture3-Asymptotic notation.pdf — PDF page 16, repeated Fibonacci calls."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "fibonacci",
      "recurrences",
      "overlapping-subproblems"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gives the two-call recurrence and explains repeated work.",
        "marks": 2
      },
      {
        "criterion": "Proves exponential time, using a valid exponential bound or the tight phi^n solution.",
        "marks": 2
      },
      {
        "criterion": "Computes G7=34 under the specified shifted bases.",
        "marks": 1
      },
      {
        "criterion": "Derives and computes the total call count C7=41.",
        "marks": 2
      }
    ],
    "hintSteps": [
      "The value recurrence and the invocation-count recurrence have different base values and an extra +1 for calls.",
      "For the exact call count, add one to Cn so that the shifted count satisfies a homogeneous Fibonacci recurrence."
    ],
    "walkthroughSteps": [
      "Write separate recurrences for work/calls and returned values.",
      "Solve or bound the call recurrence to prove exponential growth.",
      "Tabulate the shifted sequence through G7.",
      "Tabulate invocation counts through C7.",
      "Locate a subproblem reached from more than one parent."
    ]
  },
  {
    "id": "alg-e1-found-39",
    "type": "free",
    "prompt": "Lecture Fibonacci exercise, part (b). For $G_0=1$, $G_1=2$, $G_n=G_{n-1}+G_{n-2}$, design an $O(n)$-time memoized recursive algorithm. Explain why caching removes exponential work and give its auxiliary-space bound. Also give the lecture's bottom-up alternative and show how it can use constant auxiliary space. State the result for n=7. Use unit-cost arithmetic.",
    "sampleAnswer": "```\nMemoFib(n):  // integer n >= 0\n  cache = an array of max(n+1, 2) UNKNOWN entries\n  cache[0] = 1\n  cache[1] = 2\n  function solve(k):\n    if cache[k] is known: return cache[k]\n    cache[k] = solve(k-1) + solve(k-2)\n    return cache[k]\n  return solve(n)\n```\n\nFor n>=2, each of the n-1 nonbase states is computed once, with constant local work and two cache accesses/calls. Further requests return the cached result. Thus time is $\\Theta(n)$ for growing n; cache size and worst-case recursive depth are each $\\Theta(n)$, so total auxiliary space is $\\Theta(n)$.\n\n```\nBottomUp(n):\n  if n == 0: return 1\n  prev = 1\n  curr = 2\n  for k = 2 to n:\n    next = prev + curr\n    prev = curr\n    curr = next\n  return curr\n```\n\nThe iterative method performs n-1 additions for n>=1, takes $\\Theta(n)$ time for growing n, and stores only the previous two values: $\\Theta(1)$ auxiliary space. Both methods give $G_7=34$. The bounds count arithmetic operations and fixed-size variable slots under the stated model.",
    "explanation": "Memoization is the explicit textbook exercise; bottom-up computation is the lecture's subsequent method. Both evaluate each useful state once.",
    "references": [
      "Lecture8-Divide-and-conquer-02.pdf — PDF pages 10–11 and 13, shifted definition, textbook exercise 31-3(b), and bottom-up method."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "fibonacci",
      "memoization",
      "dynamic-programming",
      "space"
    ],
    "difficulty": "med",
    "homeworkFormat": "multi-step",
    "points": 7,
    "rubric": [
      {
        "criterion": "Gives a correct cache-based routine with shifted bases and cache checks.",
        "marks": 2
      },
      {
        "criterion": "Explains one computation per state and linear time/space.",
        "marks": 2
      },
      {
        "criterion": "Gives correct bottom-up updates using constant auxiliary space.",
        "marks": 2
      },
      {
        "criterion": "Computes G7=34.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "Store the result by subproblem index, and check the cache before recursing.",
      "Bottom-up only needs the two immediately preceding values, not the entire table."
    ],
    "walkthroughSteps": [
      "Initialize and return the two base values.",
      "Cache each newly computed recurrence value.",
      "Count distinct states instead of recursion-tree paths.",
      "Replace recursion by an increasing-index loop.",
      "Retain the previous two values and verify the n=0 boundary."
    ]
  },
  {
    "id": "alg-e1-found-40",
    "type": "free",
    "prompt": "Lecture Fibonacci exercise, part (c), with the sequence convention clarified. Let standard Fibonacci numbers satisfy $F_0=0,F_1=1$, and let $Q=\\begin{pmatrix}0&1\\\\1&1\\end{pmatrix}$. Prove by induction, for k>=1,\n\n$$Q^k=\\begin{pmatrix}F_{k-1}&F_k\\\\F_k&F_{k+1}\\end{pmatrix}.$$\n\nUse integer additions and multiplications plus repeated squaring to compute $F_n$ in $O(\\lg n)$ arithmetic operations. The definition on the earlier slide instead uses $G_0=1,G_1=2$; explain how to compute this shifted $G_n$ consistently, and demonstrate n=7. Assume unit-cost arithmetic; handle n=0 separately.",
    "sampleAnswer": "Base k=1: the claimed matrix is $(\\begin{smallmatrix}F_0&F_1\\\\F_1&F_2\\end{smallmatrix})=(\\begin{smallmatrix}0&1\\\\1&1\\end{smallmatrix})=Q$. Assuming the identity at k, multiply on the left by Q:\n\n$$Q^{k+1}=\\begin{pmatrix}F_k&F_{k+1}\\\\F_{k-1}+F_k&F_k+F_{k+1}\\end{pmatrix}=\\begin{pmatrix}F_k&F_{k+1}\\\\F_{k+1}&F_{k+2}\\end{pmatrix}.$$\n\nThis proves the identity. For n>=1, compute $Q^n$ by repeated squaring and read its top-right entry $F_n$; for n=0 return 0. The matrix routine uses the identity matrix for exponent zero, Q for exponent one, one stored call on $\\lfloor n/2\\rfloor$, its square, and an extra multiplication by Q for odd n. A fixed 2-by-2 matrix product uses only a constant number of integer operations, so the recurrence is $S(n)=S(\\lfloor n/2\\rfloor)+\\Theta(1)$ and time is $\\Theta(\\lg n)$ for growing n.\n\nThe shifted sequence is $G_n=F_{n+2}$, as both bases and the recurrence agree. Equivalently,\n\n$$Q^n\\binom{1}{2}=\\binom{G_n}{G_{n+1}}.$$\n\nFor n=7, $Q^7=(\\begin{smallmatrix}8&13\\\\13&21\\end{smallmatrix})$. Its top-right entry gives $F_7=13$, while $Q^7(1,2)^T=(34,55)^T$ gives $G_7=34$. This keeps the shifted lecture definition distinct from the standard sequence used by the matrix identity. All complexity claims are arithmetic-operation counts under the stated unit-cost model.",
    "explanation": "The textbook question and matrix identity use the standard sequence; the preceding lecture definition is shifted. The clarified prompt prevents using an invalid base case while preserving both source ideas.",
    "references": [
      "Lecture8-Divide-and-conquer-02.pdf — PDF page 11, textbook exercise 31-3(c), and PDF page 14, matrix-power induction.",
      "Lecture8-Divide-and-conquer-02.pdf — PDF page 10, shifted bases 1 and 2; standard/shifted conventions explicitly reconciled."
    ],
    "tags": [
      "algorithms",
      "exam-1",
      "lecture-exercise",
      "fibonacci",
      "matrix-power",
      "repeated-squaring",
      "induction",
      "source-correction"
    ],
    "difficulty": "hard",
    "homeworkFormat": "proof",
    "points": 8,
    "rubric": [
      {
        "criterion": "Proves the matrix identity with a correct base and inductive multiplication.",
        "marks": 3
      },
      {
        "criterion": "Describes stored repeated squaring and derives logarithmic arithmetic time.",
        "marks": 2
      },
      {
        "criterion": "Correctly relates shifted Gn to standard F(n+2) or Q^n(1,2).",
        "marks": 2
      },
      {
        "criterion": "Demonstrates F7=13 and G7=34 and handles n=0.",
        "marks": 1
      }
    ],
    "hintSteps": [
      "The matrix identity at k=1 forces F0=0 and F1=1.",
      "For the lecture's shifted sequence, propagate the column vector (1,2), or shift the standard index by two."
    ],
    "walkthroughSteps": [
      "Verify the identity for one matrix factor.",
      "Multiply by Q and use the Fibonacci recurrence to close induction.",
      "Compute powers with a single stored half-power.",
      "Read the top-right entry for standard Fibonacci, or multiply by (1,2) for the shifted sequence.",
      "Check the numerical n=7 example and the zero-index boundary."
    ]
  }
];
