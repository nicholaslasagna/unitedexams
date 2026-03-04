import type { QuizSet } from "@/lib/types";

const automataQuizSetsRaw: QuizSet[] = [
  {
    id: "automata-sets-relations",
    courseId: "theory-of-automata",
    title: "Sets, Relations & Proof Techniques",
    description: "Set operations, binary relations, functions, induction proofs, and closures — from HW1 and Test 1.",
    difficulty: "Advanced",
    estMinutes: 35,
    tags: ["sets", "relations", "proofs", "hw1-aligned"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "auto-sr-q1",
        type: "free",
        prompt: "**Prove** that $A - (B \\cap C) = (A - B) \\cup (A - C)$.",
        explanation: "This is De Morgan's law for set difference. Prove by showing both subset directions: L ⊆ R and R ⊆ L.",
        sampleAnswer: "Proved by double containment: show A − (B ∩ C) ⊆ (A − B) ∪ (A − C) and (A − B) ∪ (A − C) ⊆ A − (B ∩ C).",
        hintSteps: [
          "To prove two sets are equal, show **double containment**: each is a subset of the other.",
          "For L ⊆ R: Pick x ∈ A − (B ∩ C). Then x ∈ A and x ∉ B ∩ C. What does x ∉ B ∩ C mean?",
          "x ∉ B ∩ C means x ∉ B OR x ∉ C (negation of 'in both'). Use this to place x in A − B or A − C.",
          "For R ⊆ L: Pick x ∈ (A − B) ∪ (A − C). WLOG x ∈ A − B. Then x ∈ A and x ∉ B, so x ∉ B ∩ C."
        ],
        walkthroughSteps: [
          "**Direction 1 (L ⊆ R)**: Let $x \\in A - (B \\cap C)$. Then $x \\in A$ but $x \\notin B \\cap C$.",
          "By definition of intersection, $x \\notin B \\cap C$ means either $x \\notin B$ or $x \\notin C$.",
          "WLOG assume $x \\notin B$. Since $x \\in A$ and $x \\notin B$, we have $x \\in A - B$.",
          "By definition of union, $x \\in (A - B) \\cup (A - C)$. So $L \\subseteq R$.",
          "**Direction 2 (R ⊆ L)**: Let $x \\in (A - B) \\cup (A - C)$. WLOG $x \\in A - B$.",
          "Then $x \\in A$ and $x \\notin B$. Since $x \\notin B$, by definition of intersection $x \\notin B \\cap C$.",
          "Therefore $x \\in A - (B \\cap C)$, so $R \\subseteq L$. Since both directions hold, $L = R$. $\\blacksquare$"
        ],
        references: ["HW1 Problem 1", "HW1 Solutions"],
        tags: ["sets", "proof", "de-morgan", "section-1.1"]
      },
      {
        id: "auto-sr-q2",
        type: "free",
        prompt: "Let $R = \\{(a,b), (a,c), (c,d), (a,a), (b,a)\\}$.\n\n(a) What is $R \\circ R$ (composition of R with itself)?\n(b) What is $R^{-1}$?\n(c) Is R, $R \\circ R$, or $R^{-1}$ a function?",
        explanation: "Compute composition by chaining pairs, inverse by swapping components, and check function property (each domain element maps to exactly one output).",
        sampleAnswer: "R∘R = {(a,a),(a,b),(a,c),(a,d),(b,a),(b,b),(b,c)}, R⁻¹ = {(b,a),(c,a),(d,c),(a,a),(a,b)}, none are functions.",
        hintSteps: [
          "For $R \\circ R$: find all pairs $(x,z)$ where there exists $y$ with $(x,y) \\in R$ and $(y,z) \\in R$.",
          "For $R^{-1}$: swap every pair — $(a,b)$ becomes $(b,a)$.",
          "A relation is a function if each domain element has **exactly one** outgoing edge.",
          "Check: does any element appear as the first component in more than one pair?"
        ],
        walkthroughSteps: [
          "**$R \\circ R$**: For each $(x,y) \\in R$, find all $(y,z) \\in R$ and output $(x,z)$.",
          "From $(a,b)$: b maps to $a$ → $(a,a)$. From $(a,c)$: c maps to $d$ → $(a,d)$. From $(a,a)$: a maps to $b,c,a$ → $(a,b),(a,c),(a,a)$.",
          "From $(b,a)$: a maps to $b,c,a$ → $(b,b),(b,c),(b,a)$. From $(c,d)$: d maps to nothing.",
          "**$R \\circ R = \\{(a,a),(a,b),(a,c),(a,d),(b,a),(b,b),(b,c)\\}$**.",
          "**$R^{-1}$**: Swap each pair: $\\{(b,a),(c,a),(d,c),(a,a),(a,b)\\}$.",
          "**Function check**: R has $(a,b)$ and $(a,c)$ — $a$ maps to two outputs → **not a function**. Same issue exists in $R \\circ R$ and $R^{-1}$ (both have $a$ mapping to multiple values). **None are functions**."
        ],
        references: ["HW1 Problem 2", "HW1 Solutions"],
        tags: ["relations", "composition", "inverse", "functions", "section-1.2"]
      },
      {
        id: "auto-sr-q3",
        type: "single",
        prompt: "Under what circumstances does a directed graph represent a **function**?",
        options: [
          "When every node has at least one incoming edge",
          "When there is exactly one arrow (edge) leading out of each node",
          "When the graph has no cycles",
          "When every node has the same number of edges"
        ],
        correct: [1],
        explanation: "A directed graph represents a function when there is **exactly one arrow leading out of each node**. This ensures each domain element maps to exactly one output — the definition of a function.",
        walkthroughSteps: [
          "A function $f: A \\to B$ requires that for each $a \\in A$, there is **exactly one** $b$ with $(a,b) \\in f$.",
          "In graph terms: each node (domain element) must have **exactly one outgoing edge**.",
          "Zero outgoing edges means the element has no mapping → not a total function.",
          "Two+ outgoing edges means the element maps to multiple values → not a function (it's a relation)."
        ],
        references: ["HW1 Problem 5", "HW1 Solutions"],
        tags: ["functions", "directed-graphs", "section-1.2"]
      },
      {
        id: "auto-sr-q4",
        type: "single",
        prompt: "Is the relation $R$ on positive integers where $(a,b) \\in R$ iff $b$ is divisible by $a$ a **partial order**? A **total order**?",
        options: [
          "Partial order only — not every pair is comparable (e.g., 2 and 3)",
          "Total order — every pair of positive integers is comparable by divisibility",
          "Neither — divisibility is not antisymmetric",
          "Neither — divisibility is not transitive"
        ],
        correct: [0],
        explanation: "Divisibility is a **partial order** (reflexive, antisymmetric, transitive) but **not a total order** because not every pair is comparable — for example, neither 2 divides 3 nor 3 divides 2.",
        walkthroughSteps: [
          "**Reflexive**: Every number divides itself ($a | a$). ✓",
          "**Antisymmetric**: If $a | b$ and $a \\neq b$, then $a < b$, so $b \\nmid a$. ✓",
          "**Transitive**: If $a | b$ then $b = na$, and if $b | c$ then $c = mb$. So $c = nma$, meaning $a | c$. ✓",
          "**Total?** No — consider $a=2, b=3$: $2 \\nmid 3$ and $3 \\nmid 2$. They are incomparable. So it's a **partial order but not a total order**."
        ],
        references: ["HW1 Problem 4a", "HW1 Solutions"],
        tags: ["relations", "partial-order", "total-order", "section-1.3"]
      },
      {
        id: "auto-sr-q5",
        type: "free",
        prompt: "Show by induction that $n^4 - 4n^2$ is divisible by 3 for all $n \\geq 0$.",
        explanation: "Base case: n=0 gives 0, divisible by 3. Inductive step: expand $(n+1)^4 - 4(n+1)^2$, apply the hypothesis, and show the remainder is divisible by 3 by case analysis on n mod 3.",
        sampleAnswer: "Base: 0⁴ - 4·0² = 0 ≡ 0 (mod 3). Inductive step: (n+1)⁴ - 4(n+1)² = (n⁴-4n²) + 4n³+6n²-4n-3, first and last terms divisible by 3, middle term 2n(2n-1)(n+2) divisible by 3 by case analysis.",
        hintSteps: [
          "**Base case**: Check n=0. Is $0^4 - 4(0)^2 = 0$ divisible by 3?",
          "**Inductive hypothesis**: Assume $n^4 - 4n^2 = 3r$ for some integer $r$.",
          "**Inductive step**: Expand $(n+1)^4 - 4(n+1)^2$ and isolate the $(n^4 - 4n^2)$ term.",
          "Show the remaining terms are divisible by 3 by considering $n \\mod 3$ cases."
        ],
        walkthroughSteps: [
          "**Base case** ($n=0$): $0^4 - 4 \\cdot 0^2 = 0$, which is divisible by 3. ✓",
          "**Inductive hypothesis**: Assume $n^4 - 4n^2 = 3r$ for some integer $r$.",
          "**Expand**: $(n+1)^4 - 4(n+1)^2 = (n^4 - 4n^2) + 4n^3 + 6n^2 - 4n - 3$.",
          "The first term $(n^4 - 4n^2) = 3r$ by hypothesis. The last term $-3$ is divisible by 3.",
          "The middle terms: $4n^3 + 6n^2 - 4n = 2n(2n^2 + 3n - 2) = 2n(2n-1)(n+2)$.",
          "**Case analysis**: If $n = 3s$, then $n$ is divisible by 3. If $n = 3s+1$, then $n+2 = 3s+3$ is divisible by 3. If $n = 3s+2$, then $2n-1 = 6s+3$ is divisible by 3.",
          "In all cases the middle term is divisible by 3. Therefore $(n+1)^4 - 4(n+1)^2$ is divisible by 3. $\\blacksquare$"
        ],
        references: ["HW1 Problem 7", "HW1 Solutions"],
        tags: ["induction", "proof", "section-1.5"]
      },
      {
        id: "auto-sr-q6",
        type: "free",
        prompt: "Let $R = \\{(a,b),(a,c),(a,d),(d,c),(d,e)\\}$. What is the **reflexive transitive closure** $R^*$?",
        explanation: "R* adds all reflexive pairs (self-loops) and all pairs reachable by following chains of edges in R.",
        sampleAnswer: "R* = {(a,a),(b,b),(c,c),(d,d),(e,e),(a,b),(a,c),(a,d),(a,e),(d,c),(d,e)}",
        hintSteps: [
          "**Reflexive closure**: Add $(x,x)$ for every element that appears in R: $\\{a,b,c,d,e\\}$.",
          "**Transitive closure**: If $(x,y)$ and $(y,z)$ are reachable, add $(x,z)$.",
          "From $a$: can reach $b, c, d$ directly. From $d$: can reach $c, e$. So from $a$: can also reach $e$ (via $d$).",
          "Combine reflexive pairs + original pairs + transitive pairs."
        ],
        walkthroughSteps: [
          "**Elements in R**: $\\{a, b, c, d, e\\}$.",
          "**Reflexive pairs**: $\\{(a,a),(b,b),(c,c),(d,d),(e,e)\\}$.",
          "**Original pairs**: $\\{(a,b),(a,c),(a,d),(d,c),(d,e)\\}$.",
          "**Transitive extensions**: From $(a,d)$ and $(d,c)$ → $(a,c)$ (already have). From $(a,d)$ and $(d,e)$ → $\\mathbf{(a,e)}$ (new!).",
          "**Final $R^*$**: $\\{(a,a),(b,b),(c,c),(d,d),(e,e),(a,b),(a,c),(a,d),(a,e),(d,c),(d,e)\\}$."
        ],
        references: ["HW1 Problem 9", "HW1 Solutions"],
        tags: ["relations", "closure", "transitive", "section-1.6"]
      },
      {
        id: "auto-sr-q7",
        type: "single",
        prompt: "Prove that $\\{e\\}^* = \\{e\\}$ where $e$ is the empty string. Which reasoning is correct?",
        options: [
          "$\\{e\\}^* = \\{w_1 w_2 \\cdots w_n : w_i \\in \\{e\\}\\}$. Since each $w_i = e$, every concatenation is $e^n = e$. So $\\{e\\}^* = \\{e\\}$.",
          "$\\{e\\}^*$ is infinite because Kleene star always produces infinite sets.",
          "$\\{e\\}^* = \\emptyset$ because the empty string has no characters to repeat.",
          "$\\{e\\}^* = \\{e, ee, eee, \\ldots\\}$ which is an infinite set of increasingly long strings."
        ],
        correct: [0],
        explanation: "By definition, $\\{e\\}^* = \\{w_1 w_2 \\cdots w_n : n \\geq 0, w_i \\in \\{e\\}\\}$. Each $w_i$ must be $e$ (the only element), so $\\{e\\}^* = \\{e^n : n \\geq 0\\} = \\{e\\}$ since $e^n = e$ for all $n$.",
        walkthroughSteps: [
          "**Kleene star definition**: $L^* = \\{w_1 w_2 \\cdots w_n : n \\geq 0, w_i \\in L\\}$.",
          "Here $L = \\{e\\}$, so each $w_i$ must be $e$ (it's the only element).",
          "Any concatenation $e \\cdot e \\cdot \\ldots \\cdot e = e$ (concatenating empty strings gives empty string).",
          "Therefore $\\{e\\}^* = \\{e^n : n \\geq 0\\} = \\{e\\}$."
        ],
        references: ["HW1 Problem 12", "HW1 Solutions"],
        tags: ["languages", "kleene-star", "section-1.7"]
      },
      {
        id: "auto-sr-q8",
        type: "free",
        prompt: "Let $\\Sigma = \\{a,b\\}$. Write a **regular expression** for: all strings with **no more than three a's**.",
        explanation: "Allow any number of b's between and around at most 3 a's: $b^*(ab^*)\\{0,3\\}$ or equivalently $b^* \\cup b^*ab^* \\cup b^*ab^*ab^* \\cup b^*ab^*ab^*ab^*$.",
        sampleAnswer: "b* ∪ b*ab* ∪ b*ab*ab* ∪ b*ab*ab*ab*",
        hintSteps: [
          "The string can have 0, 1, 2, or 3 a's, with any number of b's anywhere.",
          "For 0 a's: $b^*$. For 1 a: $b^*ab^*$. Continue this pattern.",
          "Use union to combine all cases.",
          "Each case inserts b* between and around the a's."
        ],
        walkthroughSteps: [
          "**0 a's**: $b^*$ (just b's).",
          "**1 a**: $b^*ab^*$ (one a surrounded by b's).",
          "**2 a's**: $b^*ab^*ab^*$ (two a's with b's between and around).",
          "**3 a's**: $b^*ab^*ab^*ab^*$ (three a's with b's between and around).",
          "**Union all cases**: $b^* \\cup b^*ab^* \\cup b^*ab^*ab^* \\cup b^*ab^*ab^*ab^*$."
        ],
        references: ["HW1 Problem 14a", "HW1 Solutions"],
        tags: ["regex", "regular-expressions", "section-1.8"]
      },
      {
        id: "auto-sr-q9",
        type: "free",
        prompt: "Write a regular expression for: all strings in $\\{a,b\\}^*$ with a **number of a's divisible by 3**.",
        explanation: "Group a's in triples with any b's in between: $b^*(ab^*ab^*ab^*)^*$.",
        sampleAnswer: "b*(ab*ab*ab*)*",
        hintSteps: [
          "Divisible by 3 means 0, 3, 6, 9, ... a's are allowed.",
          "0 a's: just $b^*$. Each 'group' of 3 a's: $ab^*ab^*a$.",
          "Allow any b's between groups and repeat the group any number of times.",
          "The pattern: $b^*$ then zero or more groups of exactly 3 a's."
        ],
        walkthroughSteps: [
          "We need strings where the count of $a$'s is $0, 3, 6, 9, \\ldots$",
          "**One group of 3 a's** with b's between: $ab^*ab^*ab^*$ — this adds exactly 3 a's.",
          "**Zero or more groups**: $(ab^*ab^*ab^*)^*$ — this gives 0, 3, 6, 9, ... a's.",
          "**Leading b's**: Prepend $b^*$ for any b's before the first a.",
          "**Final expression**: $b^*(ab^*ab^*ab^*)^*$."
        ],
        references: ["HW1 Problem 14b", "HW1 Solutions"],
        tags: ["regex", "regular-expressions", "section-1.8"]
      },
      {
        id: "auto-sr-q10",
        type: "free",
        prompt: "**Explain** why the following is true:\n\n$$(b^*a^*) \\cap (a^*b^*) = a^* \\cup b^*$$",
        explanation: "A string in both b*a* (b's then a's) AND a*b* (a's then b's) can only be all a's or all b's — any mix would violate one of the patterns.",
        sampleAnswer: "A string matching both patterns cannot have b's followed by a's AND a's followed by b's simultaneously, so it must be purely a's or purely b's.",
        hintSteps: [
          "Think about what $b^*a^*$ accepts: strings of b's followed by a's (e.g., bbaa, bba, aaa, bbb).",
          "What does $a^*b^*$ accept? Strings of a's followed by b's (e.g., aabb, ab, aaa, bbb).",
          "For a string to be in BOTH sets, it must simultaneously be 'b's then a's' AND 'a's then b's'.",
          "The only way this works is if the string is all a's (zero b's) or all b's (zero a's)."
        ],
        walkthroughSteps: [
          "$b^*a^*$ describes strings consisting of **b's followed by a's**: $\\{b^n a^m : n,m \\geq 0\\}$.",
          "$a^*b^*$ describes strings consisting of **a's followed by b's**: $\\{a^n b^m : n,m \\geq 0\\}$.",
          "If a string is in **both**, it must be of the form $b^i a^j$ AND $a^k b^l$ simultaneously.",
          "If the string has both a's and b's, then $b^*a^*$ requires all b's come before all a's, but $a^*b^*$ requires all a's come before all b's. **Contradiction** — you can't have b's before a's AND a's before b's.",
          "Therefore the string must have **only a's** ($a^*$) or **only b's** ($b^*$).",
          "Conversely, any string in $a^* \\cup b^*$ is clearly in both $b^*a^*$ and $a^*b^*$ (take the zero-count for the missing letter).",
          "Thus $(b^*a^*) \\cap (a^*b^*) = a^* \\cup b^*$."
        ],
        references: ["HW1 Problem 15b", "Test 1 Problem 2"],
        tags: ["regex", "intersection", "proof", "section-1.8"]
      }
    ]
  },
  {
    id: "automata-dfa-nfa-regex",
    courseId: "theory-of-automata",
    title: "DFA, NFA & Regular Languages",
    description: "DFA/NFA construction, regex-to-automata conversion, language acceptance, and pumping lemma — from HW2 and Test 1.",
    difficulty: "Advanced",
    estMinutes: 35,
    tags: ["dfa", "nfa", "regex", "pumping-lemma", "hw2-aligned"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "auto-dfa-q1",
        type: "free",
        prompt: "Write down the **transition function table** for a DFA accepting the language:\n\n$$\\{w \\in \\{a,b\\}^* : \\text{each } a \\text{ in } w \\text{ is immediately preceded by one } b\\}$$",
        explanation: "The DFA must ensure every 'a' has a 'b' directly before it. States track whether the last character was 'b' (so 'a' is allowed) or not.",
        sampleAnswer: "States: q0 (start/accept), q1 (just saw b/accept), dead (reject). q0→a:dead, q0→b:q1, q1→a:q0, q1→b:q1, dead→a:dead, dead→b:dead.",
        hintSteps: [
          "Think about what information you need to track: did we just see a 'b'?",
          "If we see an 'a' without a preceding 'b', we must reject — go to a dead state.",
          "If we see a 'b', we're ready to accept a following 'a'.",
          "The start state should accept (empty string has no a's to violate the rule)."
        ],
        walkthroughSteps: [
          "**States**: $q_0$ = start (haven't just seen b), $q_1$ = just saw b, $q_{dead}$ = saw a without preceding b.",
          "**From $q_0$**: On 'a' → $q_{dead}$ (a without preceding b!). On 'b' → $q_1$.",
          "**From $q_1$**: On 'a' → $q_0$ (valid: b preceded this a). On 'b' → $q_1$ (still just saw b).",
          "**From $q_{dead}$**: On 'a' → $q_{dead}$. On 'b' → $q_{dead}$. (trap state, can never recover).",
          "**Accept states**: $q_0$ and $q_1$ (string is valid so far). $q_{dead}$ is reject.",
          "**Transition table**:\n| State | a | b |\n|-------|---|---|\n| →$q_0$* | $q_{dead}$ | $q_1$ |\n| $q_1$* | $q_0$ | $q_1$ |\n| $q_{dead}$ | $q_{dead}$ | $q_{dead}$ |"
        ],
        references: ["HW2 Problem 3"],
        tags: ["dfa", "transition-table", "construction", "section-2.1"]
      },
      {
        id: "auto-dfa-q2",
        type: "free",
        prompt: "Write down the **transition function table** for a DFA accepting:\n\n$$\\{w \\in \\{a,b\\}^* : w \\text{ has } abab \\text{ as a substring}\\}$$",
        explanation: "Track progress toward matching the substring 'abab'. States represent how much of 'abab' has been matched so far.",
        sampleAnswer: "5 states: q0 (matched nothing), q1 (matched a), q2 (matched ab), q3 (matched aba), q4 (matched abab, accept). Transitions handle partial match resets.",
        hintSteps: [
          "Use states to track how many characters of 'abab' you've matched: 0, 1, 2, 3, or all 4.",
          "On each input, either extend the match or fall back to the longest suffix that's a prefix of 'abab'.",
          "Once you match all of 'abab' (reach state q4), stay there — accept everything after.",
          "Think carefully about fallbacks: e.g., in state q3 (matched 'aba'), seeing 'a' means you still have 'a' matched."
        ],
        walkthroughSteps: [
          "**States**: $q_0$ = matched \"\", $q_1$ = matched \"a\", $q_2$ = matched \"ab\", $q_3$ = matched \"aba\", $q_4$ = matched \"abab\" (accept).",
          "**From $q_0$**: 'a' → $q_1$ (start matching). 'b' → $q_0$ (no progress).",
          "**From $q_1$** (matched \"a\"): 'b' → $q_2$ (now \"ab\"). 'a' → $q_1$ (still just \"a\").",
          "**From $q_2$** (matched \"ab\"): 'a' → $q_3$ (now \"aba\"). 'b' → $q_0$ (\"abb\" — no useful prefix).",
          "**From $q_3$** (matched \"aba\"): 'b' → $q_4$ (complete \"abab\"!). 'a' → $q_1$ (\"abaa\" — last 'a' restarts).",
          "**From $q_4$** (accepted): 'a' → $q_4$. 'b' → $q_4$. (stay in accept forever)."
        ],
        references: ["HW2 Problem 4"],
        tags: ["dfa", "substring", "construction", "section-2.1"]
      },
      {
        id: "auto-dfa-q3",
        type: "free",
        prompt: "Write a **regular expression** for the language:\n\n$$L = \\{w \\in \\{0,1\\}^* : w \\text{ has 2 or 3 occurrences of 1, the first and second of which are not consecutive}\\}$$",
        explanation: "The key constraint is that between the first and second 1, there must be at least one 0. The third 1 is optional.",
        sampleAnswer: "0*10⁺10*(10*)?  or equivalently  0*10⁺1(0*10*)?0*",
        hintSteps: [
          "Break it into parts: some 0's, then the first 1, then at least one 0, then the second 1.",
          "The first two 1's must be non-consecutive → at least one 0 between them: $10^+1$.",
          "An optional third 1 can appear anywhere after the second.",
          "Pad with 0* at beginning and end."
        ],
        walkthroughSteps: [
          "**Leading 0's**: $0^*$ (any number of 0's before the first 1).",
          "**First 1**: just $1$.",
          "**Gap (non-consecutive)**: $0^+$ — at least one 0 between first and second 1.",
          "**Second 1**: just $1$.",
          "**So far for exactly 2 ones**: $0^*10^+10^*$.",
          "**Optional third 1**: $(0^*10^*)$ can appear after, wrapped in $()$? for optional.",
          "**Full expression**: $0^*10^+10^*(10^*)?$ — matches strings with exactly 2 or 3 ones where first two are non-consecutive."
        ],
        references: ["Test 1 Problem 3", "Lecture Notes p.58"],
        tags: ["regex", "construction", "section-2.3"]
      },
      {
        id: "auto-dfa-q4",
        type: "free",
        prompt: "**Prove** that the language $\\{a^n b^{a^m} b a^{m+n} : n, m \\geq 1\\}$ is **not regular** using the pumping lemma.",
        explanation: "Assume regular, get pumping length p, choose a string in L, show that pumping any valid decomposition produces a string not in L — contradiction.",
        sampleAnswer: "Choose w = aᵖbaᵖbaᵖ⁺ᵖ. By pumping lemma, xyz decomposition with |xy| ≤ p forces y in the first a-block. Pumping changes n but not m+n, breaking the language constraint.",
        hintSteps: [
          "**Pumping lemma setup**: Assume L is regular with pumping length $p$.",
          "**Choose a string**: Pick $w \\in L$ with $|w| \\geq p$. A good choice is $w = a^p b a^p b a^{2p}$ (with $n=m=p$).",
          "**Decomposition**: $w = xyz$ with $|xy| \\leq p$ and $|y| > 0$. Since $|xy| \\leq p$, both $x$ and $y$ consist entirely of $a$'s from the first block.",
          "**Pump**: Pumping $y$ changes the first $a$-block size but not the last block, violating $m+n$ constraint."
        ],
        walkthroughSteps: [
          "**Assume** $L$ is regular. Let $p$ be the pumping length.",
          "**Choose** $w = a^p b a^p b a^{2p} \\in L$ (where $n = p, m = p$, so $m+n = 2p$). Note $|w| \\geq p$.",
          "**Decomposition**: $w = xyz$ with $|xy| \\leq p$, $|y| > 0$. Since $|xy| \\leq p$, $y = a^k$ for some $k \\geq 1$ within the first $a$-block.",
          "**Pump up** ($i=2$): $xy^2z = a^{p+k} b a^p b a^{2p}$. For this to be in $L$, we'd need the exponent of the last block to equal $(p+k) + p = 2p+k$, but it's $2p$. **Contradiction**.",
          "Therefore $L$ is **not regular**. $\\blacksquare$"
        ],
        references: ["HW2 Problem 13"],
        tags: ["pumping-lemma", "non-regular", "proof", "section-2.4"]
      },
      {
        id: "auto-dfa-q5",
        type: "free",
        prompt: "**Prove** that $\\{ww^R : w \\in \\{a,b\\}^*\\}$ is **not regular** (where $w^R$ is the reverse of $w$).",
        explanation: "This is the language of even-length palindromes. Use the pumping lemma — pumping within the first half disrupts the palindrome structure.",
        sampleAnswer: "Choose w = aᵖbᵖbᵖaᵖ. Pumping within the first aᵖ block changes the first half without changing the second, breaking the palindrome property.",
        hintSteps: [
          "Assume regular with pumping length $p$.",
          "Choose a palindrome: $s = a^p b^p b^p a^p$ (this is $ww^R$ where $w = a^p b^p$).",
          "$|xy| \\leq p$ means $y$ is in the first $a$-block.",
          "Pumping changes the number of $a$'s on the left but not on the right."
        ],
        walkthroughSteps: [
          "**Assume** $L = \\{ww^R\\}$ is regular with pumping length $p$.",
          "**Choose** $s = a^p b^p b^p a^p \\in L$ (palindrome with $w = a^p b^p$).",
          "**Decomposition**: $s = xyz$ with $|xy| \\leq p$, $|y| > 0$. So $y = a^k$ with $k \\geq 1$ from the first $a$-block.",
          "**Pump** ($i=0$): $xz = a^{p-k} b^p b^p a^p$. This is not a palindrome because it has $p-k$ a's on the left but $p$ a's on the right.",
          "Therefore $xz \\notin L$, contradicting the pumping lemma. So $L$ is **not regular**. $\\blacksquare$"
        ],
        references: ["HW2 Problem 14"],
        tags: ["pumping-lemma", "non-regular", "proof", "palindrome", "section-2.4"]
      },
      {
        id: "auto-dfa-q6",
        type: "single",
        prompt: "Is the following statement true?\n\n$$baa \\in a^*b^*a^*b^*$$",
        options: [
          "True — baa = (zero a's)(one b)(two a's)(zero b's)",
          "False — baa starts with b but a*b* requires a's first",
          "True — but only because Kleene star can be zero",
          "False — baa has no b at the end"
        ],
        correct: [0],
        explanation: "Yes, $baa \\in a^*b^*a^*b^*$. Decomposition: zero repetitions of $a$, one repetition of $b$, two repetitions of $a$, zero repetitions of $b$. The Kleene star allows zero repetitions.",
        walkthroughSteps: [
          "$a^*b^*a^*b^*$ matches: (zero or more a's)(zero or more b's)(zero or more a's)(zero or more b's).",
          "For $baa$: take $a^* = \\epsilon$ (zero a's), $b^* = b$ (one b), $a^* = aa$ (two a's), $b^* = \\epsilon$ (zero b's).",
          "Concatenation: $\\epsilon \\cdot b \\cdot aa \\cdot \\epsilon = baa$. ✓",
          "Key insight: Kleene star $*$ means **zero or more** — you can always take zero repetitions."
        ],
        references: ["HW1 Problem 15a", "HW1 Solutions"],
        tags: ["regex", "membership", "kleene-star", "section-1.8"]
      }
    ]
  }
];

export const automataQuizSets: QuizSet[] = automataQuizSetsRaw.map((set) => ({
  ...set,
  mode: set.mode ?? "quiz"
}));
