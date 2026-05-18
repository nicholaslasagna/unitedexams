import type { QuizSet } from "@/lib/types";
import { differentialEquationReviewReplacements } from "./quiz-diffeq-reviews";

const testReviewQuizSetReplacementsRaw: QuizSet[] = [
  ...differentialEquationReviewReplacements,
  {
    id: "ta-core-legacy",
    courseId: "theory-of-automata",
    title: "Theory of Automata Test Review I (Free Response)",
    description:
      "Exact free-response prompts from HW1 and Test 1 with rigorous step-by-step proof guidance.",
    difficulty: "Advanced",
    estMinutes: 34,
    tags: ["test-review", "free-response", "hw1", "test1", "proof-heavy"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "ta-core-legacy-q1",
        type: "free",
        prompt: "Prove that `A - (B ∩ C) = (A - B) ∪ (A - C)`.",
        explanation: "Use double containment: prove LHS subset RHS and RHS subset LHS.",
        sampleAnswer:
          "Show x in A-(B∩C) implies x in (A-B)∪(A-C), and conversely x in (A-B)∪(A-C) implies x in A-(B∩C).",
        hintSteps: [
          "Set equality proof starts with two subset proofs.",
          "Translate set difference and intersection definitions explicitly.",
          "Use negation of intersection carefully (`not in B∩C`).",
          "Repeat in reverse direction for completeness."
        ],
        walkthroughSteps: [
          "Assume `x in A-(B∩C)`: then `x in A` and `x notin B∩C`.",
          "`x notin B∩C` means `x notin B` or `x notin C`.",
          "Hence `x in A-B` or `x in A-C`, so `x in (A-B)∪(A-C)`.",
          "Reverse direction: if `x in (A-B)∪(A-C)`, then x is in A and missing at least one of B,C; thus `x notin B∩C` and x in `A-(B∩C)`."
        ],
        references: ["HW1 Problem 1", "HW1 ans Problem 1"],
        tags: ["sets", "proof", "identity", "hw1"]
      },
      {
        id: "ta-core-legacy-q2",
        type: "free",
        prompt:
          "Let `R = {(a, b), (a, c), (c, d), (a, a), (b, a)}`. Find `R ◦ R`, find `R^-1`, and state whether `R`, `R ◦ R`, or `R^-1` is a function.",
        explanation:
          "Compute composition via chaining, inverse by swapping pairs, and function check via outgoing-edge uniqueness.",
        sampleAnswer:
          "R◦R={(a,a),(a,b),(a,c),(a,d),(b,a),(b,b),(b,c)}; R^-1={(b,a),(c,a),(d,c),(a,a),(a,b)}; none are functions.",
        hintSteps: [
          "For composition, chain `(x,y)` with `(y,z)`.",
          "For inverse, swap coordinates in each pair.",
          "Function test: each first component must map to exactly one value.",
          "Check whether any first component appears with multiple seconds."
        ],
        walkthroughSteps: [
          "Composition: generate `(x,z)` whenever `(x,y)` and `(y,z)` exist in R.",
          "Inverse: each `(u,v)` becomes `(v,u)`.",
          "R has both `(a,b)` and `(a,c)` so R is not a function.",
          "Same multivalued issue appears in `R◦R` and `R^-1`, so none are functions."
        ],
        references: ["HW1 Problem 2", "HW1 ans Problem 2"],
        tags: ["relations", "composition", "inverse", "functions", "hw1"]
      },
      {
        id: "ta-core-legacy-q3",
        type: "free",
        prompt:
          "Test 1 Q1 used `R = {(a,c),(c,e),(e,e),(e,b),(d,b),(d,d)}`. Draw/describe directed graphs for (a) `R` and (b) `R ∪ R^-1`.",
        explanation:
          "`R ∪ R^-1` adds reverse edges for every original edge; self-loops remain unchanged.",
        sampleAnswer:
          "Graph (a) has directed edges exactly as listed by R. Graph (b) includes all edges in R plus reversed non-loop edges `(c,a),(e,c),(b,e),(b,d)`.",
        hintSteps: [
          "Graph for relation is one directed edge per ordered pair.",
          "Inverse relation swaps each ordered pair.",
          "Union includes all original and inverse edges.",
          "Self-loops remain self-loops in both relations."
        ],
        walkthroughSteps: [
          "List R edges directly: `(a,c),(c,e),(e,e),(e,b),(d,b),(d,d)`.",
          "Compute inverse edges: `(c,a),(e,c),(e,e),(b,e),(b,d),(d,d)`.",
          "Take union with originals.",
          "Final graph for union has bidirectional counterparts for non-loop edges."
        ],
        references: ["Test 1 Problem 1"],
        tags: ["relations", "graphs", "inverse", "test1"]
      },
      {
        id: "ta-core-legacy-q4",
        type: "free",
        prompt: "Explain why `(b* a*) ∩ (a* b*) = a* ∪ b*` is true.",
        explanation:
          "A string cannot simultaneously have b-before-a and a-before-b unless it contains only one symbol type.",
        sampleAnswer:
          "Strings in both forms must be all a's or all b's. Mixed a/b order would violate one side, so intersection is a* ∪ b*.",
        hintSteps: [
          "Interpret each regex as an ordering constraint.",
          "Consider strings containing both a and b.",
          "Show contradiction for mixed strings.",
          "Show pure-a and pure-b strings satisfy both sides."
        ],
        walkthroughSteps: [
          "`b*a*` means all b's come before all a's.",
          "`a*b*` means all a's come before all b's.",
          "A mixed string cannot satisfy both orderings simultaneously.",
          "Only all-a or all-b strings satisfy both, giving `a* ∪ b*`."
        ],
        references: ["Test 1 Problem 2", "HW1 Problem 15(b)"],
        tags: ["regex", "intersection", "proof", "test1"]
      },
      {
        id: "ta-core-legacy-q5",
        type: "free",
        prompt:
          "Write a regular expression for `L = { w in {0,1}* : w has two or three occurrences of 1, the first and second of which are not consecutive }`.",
        explanation:
          "Require at least one 0 between first and second 1; allow optional third 1 later.",
        sampleAnswer: "0*10+10*(10*)?  (equivalent forms accepted).",
        hintSteps: [
          "Build the mandatory first two 1's with a gap of at least one 0.",
          "Add arbitrary 0* at front/back.",
          "Then add an optional third 1 block.",
          "Verify exactly 2 or 3 ones are allowed."
        ],
        walkthroughSteps: [
          "First 1: `...1`.",
          "Gap constraint: at least one zero => `0+`.",
          "Second 1 gives core `10+1`.",
          "Wrap with optional leading/trailing zeros and optional third 1 term."
        ],
        references: ["Test 1 Problem 3"],
        tags: ["regex", "language-design", "test1"]
      },
      {
        id: "ta-core-legacy-q6",
        type: "free",
        prompt:
          "For positive integers, relation `aRb` iff `b` is divisible by `a`: determine whether R is a partial order and whether it is a total order.",
        explanation:
          "Divisibility is reflexive, antisymmetric, transitive => partial order; not all pairs comparable => not total.",
        sampleAnswer:
          "R is a partial order, not a total order (example incomparable pair: 2 and 3).",
        hintSteps: [
          "Check reflexive, antisymmetric, transitive one by one.",
          "Then test comparability for all pairs.",
          "Find one counterexample for totality.",
          "State final classification clearly."
        ],
        walkthroughSteps: [
          "Reflexive: every a divides itself.",
          "Antisymmetric: if a|b and b|a then a=b for positive integers.",
          "Transitive: a|b and b|c implies a|c.",
          "Not total: 2 and 3 are incomparable under divisibility."
        ],
        references: ["HW1 Problem 4(a)"],
        tags: ["partial-order", "total-order", "relations", "hw1"]
      },
      {
        id: "ta-core-legacy-q7",
        type: "free",
        prompt: "Show by induction that `n^4 - 4n^2` is divisible by 3 for all `n >= 0`.",
        explanation: "Do base case then inductive step using expansion at n+1.",
        sampleAnswer:
          "Base n=0 works. Assume true for n. Expand at n+1, factor remaining term, show it's divisible by 3, conclude.",
        hintSteps: [
          "Prove base case first.",
          "State inductive hypothesis in divisible-by-3 form.",
          "Expand `(n+1)^4 - 4(n+1)^2` and separate old term.",
          "Show remainder divisible by 3 by factor/case analysis."
        ],
        walkthroughSteps: [
          "Base: n=0 gives 0, divisible by 3.",
          "Assume `n^4-4n^2 = 3k`.",
          "Expand at n+1 and rewrite as old term plus remainder.",
          "Show remainder divisible by 3, so whole expression is divisible by 3."
        ],
        references: ["HW1 Problem 7"],
        tags: ["induction", "proof", "number-theory", "hw1"]
      },
      {
        id: "ta-core-legacy-q8",
        type: "free",
        prompt:
          "Write regular expressions for: (a) all strings over `{a,b}` with no more than three a's, and (b) all strings with number of a's divisible by three.",
        explanation:
          "Use union of cases for <=3 a's, and repeating 3-a blocks for divisibility-by-3.",
        sampleAnswer:
          "(a) b* ∪ b*ab* ∪ b*ab*ab* ∪ b*ab*ab*ab* ; (b) b*(ab*ab*ab*)*",
        hintSteps: [
          "For <=3 a's, split into 0,1,2,3 a-case union.",
          "Insert b* between all a occurrences.",
          "For divisible-by-3, build a block with exactly 3 a's.",
          "Repeat block with Kleene star."
        ],
        walkthroughSteps: [
          "Case union handles no-more-than constraints cleanly.",
          "Each added `a` is separated by optional `b*`.",
          "For divisibility by 3, one block contributes exactly 3 a's.",
          "Repeat block zero-or-more times with leading `b*`."
        ],
        references: ["HW1 Problem 14(a,b)"],
        tags: ["regex", "construction", "hw1", "test-review"]
      }
    ]
  },
  {
    id: "ta-reinforce-legacy",
    courseId: "theory-of-automata",
    title: "Theory of Automata Test Review II (Free Response)",
    description:
      "Exact free-response prompts from HW2 focused on DFA/NFA construction and non-regularity proofs.",
    difficulty: "Advanced",
    estMinutes: 34,
    tags: ["test-review", "free-response", "hw2", "dfa", "nfa", "pumping-lemma"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "ta-reinforce-legacy-q1",
        type: "free",
        prompt:
          "Write down the transition table of a DFA accepting `{ w in {a,b}* : each a in w is immediately preceded by one b }`.",
        explanation:
          "Track whether previous symbol was b; reject when an a appears without that precondition.",
        sampleAnswer:
          "States q0(start,accept), q1(seen b,accept), qd(dead). q0:a->qd,b->q1; q1:a->q0,b->q1; qd:a->qd,b->qd.",
        hintSteps: [
          "State meaning should encode whether a future a is currently allowed.",
          "Need one dead state for violations.",
          "Empty string should be accepted.",
          "Check all transitions for determinism."
        ],
        walkthroughSteps: [
          "Use q0 for neutral/start, q1 for last symbol b, qd for invalid.",
          "From q0, reading a violates rule -> qd.",
          "From q1, reading a is valid -> q0.",
          "All transitions from qd remain in qd."
        ],
        references: ["HW2 Problem 3"],
        tags: ["dfa", "transition-table", "construction", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q2",
        type: "free",
        prompt:
          "Write down the transition table of a DFA accepting `{ w in {a,b}* : w has abab as a substring }`.",
        explanation:
          "Build prefix-progress states for pattern abab and a final absorbing accept state.",
        sampleAnswer:
          "States q0,q1,q2,q3,q4(accept) tracking matched prefix lengths 0..4; q4 loops on both symbols.",
        hintSteps: [
          "Use one state per matched prefix length of 'abab'.",
          "Handle fallback transitions on mismatch.",
          "Once full match reached, stay accepting.",
          "Test with strings 'abab', 'ababa', 'babab'."
        ],
        walkthroughSteps: [
          "q0 no match, q1 matched 'a', q2 matched 'ab', q3 matched 'aba', q4 matched 'abab'.",
          "Fill transitions to advance or fallback to longest valid prefix.",
          "Set q4 as absorbing accept.",
          "Validate using sample accepted and rejected strings."
        ],
        references: ["HW2 Problem 4"],
        tags: ["dfa", "substring", "construction", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q3",
        type: "free",
        prompt: "Draw an NFA that accepts `(ab)* (ba)* ∪ aa*` and explain your design.",
        explanation:
          "Use union via epsilon branches and separate sub-automata for each pattern branch.",
        sampleAnswer:
          "Start with epsilon split into branch for (ab)*(ba)* and branch for aa*. Accept states merge with epsilon.",
        hintSteps: [
          "Break expression into union of two languages.",
          "Build each branch independently.",
          "Use epsilon transitions from start into each branch.",
          "Ensure both branches can reach accepting states."
        ],
        walkthroughSteps: [
          "Construct branch A for `(ab)*(ba)*` with loop structure for each pair.",
          "Construct branch B for `aa*` (one a then a-loop).",
          "Add epsilon-split from start to both branches.",
          "Combine accepts via shared accept state (or multiple accepts)."
        ],
        references: ["HW2 Problem 9"],
        tags: ["nfa", "regex-to-automata", "union", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q4",
        type: "free",
        prompt:
          "Write the transition relation table for an NFA accepting `(ab ∪ aab ∪ aba)*`.",
        explanation:
          "Create fragment paths for each token (ab, aab, aba), then loop back for Kleene star repetition.",
        sampleAnswer:
          "Use branching after an initial a-state into b (ab), ab (aab), and ba (aba), each returning to start/accept for star.",
        hintSteps: [
          "Inside star, language is union of three fixed tokens.",
          "Build token paths with shared prefixes where possible.",
          "Star means allow epsilon (empty string) and repetition.",
          "Add loop from token-end states back to start."
        ],
        walkthroughSteps: [
          "Model token start with leading `a` prefix.",
          "Branch into three token-completion paths.",
          "Mark start as accepting for epsilon in star.",
          "Loop completed token states to start for repetition."
        ],
        references: ["HW2 Problem 10"],
        tags: ["nfa", "transition-relation", "kleene-star", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q5",
        type: "free",
        prompt:
          "Using lecture-note construction, draw/describe a finite automaton accepting `((ab)* ∪ (bc)*)ab`.",
        explanation:
          "Build union machine for `(ab)*` and `(bc)*`, then concatenate with terminal `ab` segment.",
        sampleAnswer:
          "Construct union sub-FA for the two stars, connect its accept states by epsilon/transition chain to an `a->b` tail.",
        hintSteps: [
          "Do union sub-machine first.",
          "Then apply concatenation with suffix `ab`.",
          "Track accepting-state flow after suffix.",
          "Check strings from each union branch followed by final ab."
        ],
        walkthroughSteps: [
          "Create branch for `(ab)*` and branch for `(bc)*`, both allowing epsilon.",
          "Unify their accept outputs.",
          "Append concatenated suffix transitions `a` then `b`.",
          "Only states after consuming suffix are final accepts."
        ],
        references: ["HW2 Problem 11"],
        tags: ["finite-automata", "construction", "concatenation", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q6",
        type: "free",
        prompt:
          "Using lecture-note construction, draw/describe a finite automaton accepting `((ab ∪ aba)* a)*`.",
        explanation:
          "Inner star repeats tokens from union then a; outer star repeats whole block and includes epsilon.",
        sampleAnswer:
          "Build inner NFA/FA for `(ab ∪ aba)*a`, then add outer loop from accept back to start with start also accepting.",
        hintSteps: [
          "Parse nesting from inside out.",
          "Construct union token machine for `ab` and `aba`.",
          "Apply inner star and trailing `a` concatenation.",
          "Apply outer star with epsilon acceptance."
        ],
        walkthroughSteps: [
          "Build token union for `ab` or `aba`.",
          "Apply Kleene star around token union.",
          "Concatenate with trailing `a` to finish one block.",
          "Wrap another star around full block for repeated blocks or epsilon."
        ],
        references: ["HW2 Problem 12"],
        tags: ["finite-automata", "nested-construction", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q7",
        type: "free",
        prompt:
          "Show that language `{ a^n b a^m b a^{m+n} : n,m >= 1 }` is not regular using the pumping lemma.",
        explanation:
          "Pump within first a-block to change n but not the terminal exponent relation `m+n`.",
        sampleAnswer:
          "Choose witness with n=m=p; decomposition forces y in first a-block; pumping breaks final exponent constraint.",
        hintSteps: [
          "Assume regular with pumping length p.",
          "Choose witness string linking first and last exponents.",
          "Argue `|xy|<=p` places y in first block.",
          "Pump i=0 or i=2 to violate relation."
        ],
        walkthroughSteps: [
          "Let witness be `a^p b a^p b a^{2p}`.",
          "Any valid split has y in first `a^p` block.",
          "Pumping changes first block length only.",
          "Last block remains `a^{2p}`, so required `m+n` relation fails."
        ],
        references: ["HW2 Problem 13"],
        tags: ["pumping-lemma", "non-regular", "proof", "hw2"]
      },
      {
        id: "ta-reinforce-legacy-q8",
        type: "free",
        prompt:
          "Show that language `{ ww^R : w in {a,b}* }` is not regular using the pumping lemma.",
        explanation:
          "This even-palindrome language fails pumping because pumping near one side destroys symmetry.",
        sampleAnswer:
          "Use witness a^p b^p b^p a^p; pumping y from first a-block breaks mirrored counts.",
        hintSteps: [
          "Assume regular and get pumping length p.",
          "Choose a symmetric witness string.",
          "Split constraints force y in leading a-run.",
          "Pump to break palindrome symmetry."
        ],
        walkthroughSteps: [
          "Pick `s = a^p b^p b^p a^p` in the language.",
          "With `|xy|<=p`, y lies in first a-block.",
          "Pump down (i=0): left side a-count shrinks, right side unchanged.",
          "Result is not of form `ww^R`, contradiction."
        ],
        references: ["HW2 Problem 14"],
        tags: ["pumping-lemma", "palindrome", "non-regular", "hw2"]
      }
    ]
  },
  {
    id: "ta-test2-s2025-sim",
    courseId: "theory-of-automata",
    title: "Theory of Automata Test 2 Simulation (Oct 2025)",
    description:
      "Exact prior Test 2 structure: one NFA construction question and one pumping-lemma proof question.",
    difficulty: "Advanced",
    estMinutes: 52,
    mode: "exam",
    isExamSimulation: true,
    questionCountTarget: 2,
    tags: ["test2", "past-exam", "exam-simulation", "chapter-2", "hw2", "nfa", "pumping-lemma"],
    timerDefaultMinutes: 50,
    questions: [
      {
        id: "ta-test2-s2025-sim-q1",
        type: "free",
        prompt:
          "Draw the state diagram of a nondeterministic finite automaton that accepts\n\n$$((ba) \\cup b)^* \\cup ((bb) \\cup a)^*.$$",
        explanation:
          "Split on the top-level union. The left branch accepts strings built from tokens `b` and `ba`; the right branch accepts strings built from tokens `a` and `bb`.",
        sampleAnswer:
          "Use an epsilon split from the start into two accepting branch states. Left branch: accepting state qL with qL --b--> qL and qL --b--> qL1, then qL1 --a--> qL. Right branch: accepting state qR with qR --a--> qR and qR --b--> qR1, then qR1 --b--> qR.",
        hintSteps: [
          "Top-level `union` means your NFA should start with an epsilon split into two submachines.",
          "For `((ba) ∪ b)^*`, think in terms of repeatable tokens: every repetition is either `b` or `ba`.",
          "For `((bb) ∪ a)^*`, every repetition is either `a` or `bb`.",
          "Because both branches are starred, epsilon must be accepted."
        ],
        walkthroughSteps: [
          "Start with a start state `qS` and epsilon-transitions to two branch states `qL` and `qR`.",
          "Make `qL` and `qR` accepting because each branch has a Kleene star, so zero repetitions are allowed.",
          "Left branch for `((ba) ∪ b)^*`: from `qL`, on `b` either finish a `b` token and stay in `qL`, or start a `ba` token by going to helper state `qL1`; from `qL1`, on `a`, return to `qL`.",
          "Right branch for `((bb) ∪ a)^*`: from `qR`, on `a`, stay in `qR`; on `b`, go to helper state `qR1`; from `qR1`, on `b`, return to `qR`.",
          "This works because the left branch generates exactly sequences of `b` and `ba`, while the right branch generates exactly sequences of `a` and `bb`.",
          "The whole NFA accepts the union because `qS` nondeterministically chooses either branch at the start."
        ],
        references: ["Previous Test 2 (10/24/2025) Question 1"],
        tags: ["nfa", "regular-expression", "union", "kleene-star", "chapter-2", "past-exam"]
      },
      {
        id: "ta-test2-s2025-sim-q2",
        type: "free",
        prompt:
          "Prove that the following language is **not regular**:\n\n$$L = \\{a^n b^n : n \\geq 0\\}.$$",
        explanation:
          "Use the pumping lemma. The standard witness is `a^p b^p`, and the key point is that `|xy| <= p` forces the pumped part to lie entirely inside the `a` block.",
        sampleAnswer:
          "Assume L is regular with pumping length p. Choose w = a^p b^p. Any split w = xyz with |xy| <= p has y = a^k for some k > 0. Pumping down gives xz = a^(p-k) b^p, which is not in L. Contradiction.",
        hintSteps: [
          "Start with contradiction: assume `L` is regular and let `p` be the pumping length.",
          "Choose the witness string `w = a^p b^p`.",
          "Explain why `|xy| <= p` forces both `x` and `y` to lie inside the first block of `a` symbols.",
          "Pump with `i = 0` to make the number of `a`'s and `b`'s unequal."
        ],
        walkthroughSteps: [
          "Assume for contradiction that `L` is regular. Then the pumping lemma gives a pumping length `p`.",
          "Choose `w = a^p b^p`, which is in `L` and has length at least `p`.",
          "For any decomposition `w = xyz` with `|xy| <= p` and `|y| > 0`, the substring `y` lies entirely in the first `a^p` block, so `y = a^k` for some `k > 0`.",
          "Pump down with `i = 0`. Then `xy^0z = xz = a^{p-k} b^p`.",
          "This new string has fewer `a`'s than `b`'s, so it is not in `L`.",
          "That contradicts the pumping lemma requirement that `xy^iz` remain in `L` for all `i >= 0`. Therefore `L` is not regular."
        ],
        references: ["Previous Test 2 (10/24/2025) Question 2", "Lecture Notes 2.4"],
        tags: ["pumping-lemma", "non-regular", "chapter-2", "past-exam"]
      }
    ]
  },
  {
    id: "ta-test2-s2026-mock",
    courseId: "theory-of-automata",
    title: "Theory of Automata Test 2 Mock (Chapter 2 + HW2)",
    description:
      "A three-question closed-book mock matching the announced Test 2 format: one DFA, one NFA/regex construction, and one pumping-lemma proof.",
    difficulty: "Advanced",
    estMinutes: 68,
    mode: "exam",
    isExamSimulation: true,
    questionCountTarget: 3,
    tags: ["test2", "mock-exam", "spring-2026", "chapter-2", "hw2", "dfa", "nfa", "pumping-lemma"],
    timerDefaultMinutes: 70,
    questions: [
      {
        id: "ta-test2-s2026-mock-q1",
        type: "free",
        prompt:
          "Write the transition table of a DFA accepting\n\n$$\\{w \\in \\{a,b\\}^* : \\text{each } a \\text{ in } w \\text{ is immediately preceded by one } b\\}.$$",
        explanation:
          "The DFA only needs to remember whether the last symbol was `b`, because that is exactly the condition that makes the next `a` legal.",
        sampleAnswer:
          "Use q0(start, accept), q1(just saw b, accept), and qd(dead). Transitions: q0:a->qd, q0:b->q1, q1:a->q0, q1:b->q1, qd:a->qd, qd:b->qd.",
        hintSteps: [
          "Decide what information the state needs to remember. Here it is only whether a `b` was just seen.",
          "The empty string should be accepted because it has no violating `a`.",
          "Any `a` read without a preceding `b` must send the machine to a dead state.",
          "Check that every state has exactly one outgoing transition on `a` and on `b`."
        ],
        walkthroughSteps: [
          "Let `q0` mean neutral/start: no active permission for `a` unless we first read `b`.",
          "Let `q1` mean the last symbol read was `b`, so an `a` is currently allowed.",
          "Let `qd` be a dead state for any violation.",
          "From `q0`, reading `a` violates the rule, so go to `qd`; reading `b` moves to `q1`.",
          "From `q1`, reading `a` is valid and returns to `q0`; reading `b` keeps you in `q1` because another `a` would still be allowed next.",
          "From `qd`, both inputs loop back to `qd`. Accepting states are `q0` and `q1`."
        ],
        references: ["HW2 Problem 3", "Theory of Automata Test 2 scope"],
        tags: ["dfa", "transition-table", "construction", "hw2", "chapter-2"]
      },
      {
        id: "ta-test2-s2026-mock-q2",
        type: "free",
        prompt:
          "Write the transition relation table for an NFA accepting\n\n$$(ab \\cup aab \\cup aba)^*.$$",
        explanation:
          "Treat the inner union as three fixed tokens with a shared prefix. The star means the start state is also accepting and completed tokens must loop back.",
        sampleAnswer:
          "Use q0 as start/accept. q0 --a--> q1. From q1, on b go to q0 and q3 simultaneously (for `ab` and `aba`), and on a go to q2 (for `aab`). From q2 on b go to q0. From q3 on a go to q0.",
        hintSteps: [
          "The three allowed tokens are `ab`, `aab`, and `aba`.",
          "All three tokens begin with `a`, so share that prefix in the NFA.",
          "Because of Kleene star, the start state must accept epsilon and repeated completed tokens must return there.",
          "At the point where `ab` and `aba` overlap, use nondeterminism instead of forcing one path too early."
        ],
        walkthroughSteps: [
          "Use `q0` as the start and accepting state, because the Kleene star allows the empty string.",
          "From `q0`, reading `a` moves to `q1`, which represents having consumed the shared first symbol of any token.",
          "From `q1`, on `a`, go to `q2`; then `q2 --b--> q0` completes the token `aab`.",
          "From `q1`, on `b`, branch nondeterministically to `q0` and `q3`. The move to `q0` completes `ab`, while the move to `q3` says we are still pursuing `aba`.",
          "From `q3`, on `a`, return to `q0` to complete `aba`.",
          "Because all completed tokens return to `q0`, the machine can repeat any combination of `ab`, `aab`, and `aba`."
        ],
        references: ["HW2 Problem 10", "Lecture Notes 2.2-2.3"],
        tags: ["nfa", "transition-relation", "regular-expression", "kleene-star", "hw2", "chapter-2"]
      },
      {
        id: "ta-test2-s2026-mock-q3",
        type: "free",
        prompt:
          "Use the pumping lemma to show that\n\n$$L = \\{ a^n b a^m b a^{m+n} : m,n \\geq 1 \\}$$\n\nis **not regular**.",
        explanation:
          "Choose a witness where the first and second `a` blocks are both length `p`, so the final block is forced to be length `2p`. Pumping inside the first block destroys that `m+n` relationship.",
        sampleAnswer:
          "Assume L regular with pumping length p. Choose w = a^p b a^p b a^(2p). Any split with |xy| <= p has y in the first a-block. Pumping down changes the first block only, so the final block is no longer the sum of the first two. Contradiction.",
        hintSteps: [
          "Start with contradiction and let `p` be the pumping length.",
          "Choose a witness that makes the relationship easy to track: first block `p`, second block `p`, final block `2p`.",
          "Use `|xy| <= p` to force `y` into the first `a` block.",
          "Pump with `i = 0` or `i = 2` and compare the required final exponent with the unchanged final block."
        ],
        walkthroughSteps: [
          "Assume for contradiction that `L` is regular. Let `p` be the pumping length from the pumping lemma.",
          "Choose the witness `w = a^p b a^p b a^{2p}`. This string is in `L` because it has the form `a^n b a^m b a^{m+n}` with `n = p` and `m = p`.",
          "For any split `w = xyz` with `|xy| <= p` and `|y| > 0`, the substring `y` lies entirely in the first `a^p` block. So `y = a^k` for some `k > 0`.",
          "Pump down with `i = 0`. Then `xy^0z = a^{p-k} b a^p b a^{2p}`.",
          "In this pumped string, the first block length is now `p-k` and the second is still `p`, so the final block should have length `(p-k) + p = 2p-k` if the string were still in `L`.",
          "But the final block is unchanged at length `2p`, so the required relationship fails. Therefore `xy^0z` is not in `L`, contradicting the pumping lemma.",
          "Hence `L` is not regular."
        ],
        references: ["HW2 Problem 13", "Lecture Notes 2.4"],
        tags: ["pumping-lemma", "non-regular", "hw2", "chapter-2", "test2"]
      }
    ]
  },
  {
    id: "ca-midterm-s2025-sim",
    courseId: "computer-architecture",
    title: "Computer Architecture Midterm Simulation",
    description:
      "An 80-minute midterm-style simulation across six core prompt groups: assembly translation, procedure calls, instruction encoding/decoding, pipeline dependencies, datapath stages, and branch prediction. Includes all six so you can overprepare.",
    difficulty: "Advanced",
    estMinutes: 80,
    mode: "exam",
    isExamSimulation: true,
    questionCountTarget: 6,
    tags: ["midterm", "exam-simulation", "risc-v", "pipeline"],
    timerDefaultMinutes: 80,
    questions: [
      {
        id: "ca-midterm-s2025-sim-q1",
        type: "free",
        prompt:
          "Midterm Practice A1. Do both parts.\n\n(a) Convert to RISC-V assembly: `if (i == j) a = b + c; else a = b - c;` assuming `a, b, c, i, j` are in `a0, a1, a2, s6, s7`.\n\n(b) Convert to RISC-V assembly: `for (i = 0; i <= 100; i++) { A[2*i] = a + A[i]; }` assuming `i` is in `a0`, `a` is already in `s0`, and base address of `A` is `0xEA38_257C` stored in `s2`.",
        explanation:
          "This problem checks branch structure, loop structure, base+offset addressing, and shift-based index scaling.",
        sampleAnswer:
          "### (a)\n\n```asm\nbeq  s6, s7, equal\nsub  a0, a1, a2\nbeq  zero, zero, exit\n\nequal:\nadd  a0, a1, a2\n\nexit:\n```\n\n### (b)\n\n```asm\nlui  s2, 0xEA382\nori  s2, s2, 0x57C\naddi a0, zero, 0\naddi t0, zero, 101\n\nloop:\nbge  a0, t0, exit\nslli t1, a0, 2\nadd  t2, s2, t1\nlw   t3, 0(t2)\nadd  t4, s0, t3\nslli t5, a0, 3\nadd  t6, s2, t5\nsw   t4, 0(t6)\naddi a0, a0, 1\nbeq  zero, zero, loop\n\nexit:\n```",
        hintSteps: [
          "For part (a), branch on equality and keep the else path in fall-through.",
          "For part (b), turn `i <= 100` into an exit condition using `101`.",
          "Use `4*i` for `A[i]` and `8*i` for `A[2*i]`.",
          "Load, compute, store, increment, then loop."
        ],
        walkthroughSteps: [
          "Part (a): compare `s6` and `s7`; if equal, branch to the add case. Otherwise subtract in the fall-through path and jump to the merge label.",
          "Part (b): load `0xEA38_257C` into `s2` with `lui` plus `ori`, initialize `i = 0`, and use `101` as the loop limit.",
          "Compute the address of `A[i]` with `slli i, 2`; compute the address of `A[2*i]` with `slli i, 3`.",
          "The core pattern is: `lw A[i]`, add `a`, `sw` to `A[2*i]`, increment `i`, and branch back."
        ],
        references: ["Midterm Practice A1"],
        tags: ["midterm", "assembly", "branching", "loops", "arrays"]
      },
      {
        id: "ca-midterm-s2025-sim-q2",
        type: "free",
        prompt:
          "Midterm Practice A2. Convert the following C functions to RISC-V assembly by properly using the standard RISC-V procedure-call convention and stack. Use `a0` and `a1` to pass `a` and `b`, and use `a0` for the return value.\n\n```c\nint sumofsq (int a, int b) {\n  return square(a) + square(b);\n}\n\nint square (int a) {\n  return a * a;\n}\n```",
        explanation:
          "This is a calling-convention problem. `sumofsq` is non-leaf, so it must save `ra` and whatever saved registers it uses.",
        sampleAnswer:
          "```asm\nsumofsq:\n  addi sp, sp, -16\n  sw   ra, 12(sp)\n  sw   s0, 8(sp)\n  sw   s1, 4(sp)\n  sw   s2, 0(sp)\n\n  mv   s0, a0\n  mv   s1, a1\n\n  mv   a0, s0\n  jal  ra, square\n  mv   s2, a0\n\n  mv   a0, s1\n  jal  ra, square\n  add  a0, a0, s2\n\n  lw   s2, 0(sp)\n  lw   s1, 4(sp)\n  lw   s0, 8(sp)\n  lw   ra, 12(sp)\n  addi sp, sp, 16\n  jalr zero, 0(ra)\n\nsquare:\n  mul  a0, a0, a0\n  jalr zero, 0(ra)\n```",
        hintSteps: [
          "Decide first which function is leaf and which is non-leaf.",
          "Save `ra` in `sumofsq` because it calls `square`.",
          "Preserve one square result before making the second call.",
          "Return the final sum in `a0`."
        ],
        walkthroughSteps: [
          "`square` is leaf, so it can simply compute `a0 * a0` and return.",
          "`sumofsq` is non-leaf, so it allocates a stack frame and saves `ra` plus the `s` registers it uses.",
          "Call `square(a)`, preserve that return value, then call `square(b)`.",
          "Add the two return values into `a0`, restore the frame, and return."
        ],
        references: ["Midterm Practice A2"],
        tags: ["midterm", "procedures", "stack", "calling-convention"]
      },
      {
        id: "ca-midterm-s2025-sim-q3",
        type: "free",
        prompt:
          "Midterm Practice A3. Translate the assembly instruction `addi t0, zero, -101` into 32-bit RISC-V machine code in hex. Show the field mapping.",
        explanation:
          "This is an I-type encoding problem. The main trap is getting the signed 12-bit immediate wrong.",
        sampleAnswer:
          "Instruction format: **I-type**\n\n- immediate = `-101` -> 12-bit two's complement = `0xF9B`\n- `rs1 = zero = x0 = 00000`\n- `funct3 = 000`\n- `rd = t0 = x5 = 00101`\n- opcode for `addi` = `0010011`\n\nFinal hex: **`0xF9B00293`**",
        hintSteps: [
          "Start with the instruction format: `addi` is I-type.",
          "Convert `-101` to 12-bit two's complement before filling the instruction.",
          "Map `t0` to `x5` and `zero` to `x0`.",
          "Assemble the fields in I-type bit order."
        ],
        walkthroughSteps: [
          "The 12-bit signed immediate for `-101` is `0xF9B`.",
          "The field order is `imm[11:0] | rs1 | funct3 | rd | opcode`.",
          "Here that becomes `F9B | 00000 | 000 | 00101 | 0010011`.",
          "Converting the full 32-bit pattern to hex gives `0xF9B00293`."
        ],
        references: ["Midterm Practice A3"],
        tags: ["midterm", "machine-code", "encoding", "i-type"]
      },
      {
        id: "ca-midterm-s2025-sim-q4",
        type: "free",
        prompt:
          "Midterm Practice A4. Translate the machine code `0x4168_0FB3` into a 32-bit RISC-V assembly instruction. Show the opcode/funct decomposition.",
        explanation:
          "This is an R-type decode. The trap is remembering that `funct7 = 0100000` with `funct3 = 000` means `sub`, not `add`.",
        sampleAnswer:
          "- opcode `0110011` -> R-type\n- `rd = x31 = t6`\n- `rs1 = x16 = a6`\n- `rs2 = x22 = s6`\n- `funct3 = 000`\n- `funct7 = 0100000`\n\nFinal instruction: **`sub t6, a6, s6`**",
        hintSteps: [
          "Extract the opcode first to identify the format.",
          "For an R-type instruction, decode `rd`, `funct3`, `rs1`, `rs2`, and `funct7`.",
          "Map register numbers to ABI names only after the bit fields are correct.",
          "Use `funct7` plus `funct3` together to choose the ALU operation."
        ],
        walkthroughSteps: [
          "Opcode `0110011` says the instruction is R-type.",
          "The decoded fields are `rd = x31`, `rs1 = x16`, `rs2 = x22`, `funct3 = 000`, `funct7 = 0100000`.",
          "Register ABI names are `t6`, `a6`, and `s6` respectively.",
          "The `0100000 / 000` combination selects `sub`, so the instruction is `sub t6, a6, s6`."
        ],
        references: ["Midterm Practice A4"],
        tags: ["midterm", "machine-code", "decode", "r-type"]
      },
      {
        id: "ca-midterm-s2025-sim-q5",
        type: "free",
        prompt:
          "Midterm Practice A5. For the following RISC-V instructions, do both parts.\n\n```asm\nlw  sp, 20(ra)\nand tp, sp, t0\nor  s0, sp, t1\nadd s1, tp, t0\nbeq s0, s1, label\n```\n\n(a) Identify all RAW dependencies and hazards.\n\n(b) Determine the minimum number of clock cycles required for a 5-stage RISC-V pipeline with (i) no forwarding hardware and (ii) forwarding hardware.",
        explanation:
          "This question checks whether you can separate dependency identification from actual timing, then state your counting assumptions clearly.",
        sampleAnswer:
          "### (a) RAW dependencies\n\n- `lw -> and` on `sp`\n- `lw -> or` on `sp`\n- `and -> add` on `tp`\n- `or -> beq` on `s0`\n- `add -> beq` on `s1`\n\n### (b) Timing\n\nUnder the standard full pipeline-drain count used in a 5-stage timing chart:\n\n- **No forwarding:** `14` cycles\n- **With forwarding:** `10` cycles\n\nIf your instructor instead stops counting at **branch EX resolution** rather than draining the remaining stages, the same schedule is commonly reported as:\n\n- **No forwarding:** `12`\n- **With forwarding:** `8`\n\nState your assumption explicitly and keep the stall logic consistent.",
        hintSteps: [
          "List the destination register of each instruction first, then scan later readers.",
          "Separate dependency identification from cycle counting.",
          "Without forwarding, consumers wait for register writeback.",
          "With forwarding, the major unavoidable stall is the load-use case."
        ],
        walkthroughSteps: [
          "The RAW edges are `lw -> and`, `lw -> or`, `and -> add`, `or -> beq`, and `add -> beq`.",
          "Without forwarding, the first load-use dependency causes the biggest early stall, and later consumers must still wait for writeback.",
          "With forwarding, most ALU dependencies clear through bypass paths; the classic remaining issue is the load-use delay after `lw`.",
          "If your class counts full pipeline drain, use `14` and `10`. If it stops at branch EX resolution, use `12` and `8`. Write the assumption so the grader knows what you counted."
        ],
        references: ["Midterm Practice A5"],
        tags: ["midterm", "pipeline", "hazards", "forwarding", "timing"]
      },
      {
        id: "ca-midterm-s2025-sim-q6",
        type: "free",
        prompt:
          "Midterm Practice A6. Do both parts.\n\n(a) Draw a block diagram of a 5-stage pipeline processor and explain how instructions are processed by each stage.\n\n(b) What is a control hazard? How is it different from a data hazard? How does a 2-bit dynamic branch predictor work? Explain with a finite-state machine.",
        explanation:
          "This is the architecture-concepts question. The grader is usually looking for stage responsibilities, hazard contrast, and the four 2-bit predictor states with correct transitions.",
        sampleAnswer:
          "### (a) 5-stage pipeline overview\n\n- **IF**: fetch instruction from instruction memory and choose next PC\n- **ID**: decode instruction, read register operands, generate immediate/control\n- **EX**: perform ALU operation, compute address, compare branch operands, compute branch target\n- **MEM**: access data memory for loads/stores\n- **WB**: write result back to the register file\n\nA correct diagram should show the main blocks and the pipeline registers between stages: `IF/ID`, `ID/EX`, `EX/MEM`, and `MEM/WB`.\n\n### (b) Hazards + 2-bit predictor\n\n- **Data hazard**: an instruction needs an operand value that has not been produced yet.\n- **Control hazard**: the processor does not yet know the correct next PC because a branch outcome/target is unresolved.\n\n2-bit predictor states:\n\n- Strongly Not Taken\n- Weakly Not Taken\n- Weakly Taken\n- Strongly Taken\n\nPrediction:\n\n- predict not taken in the first two states\n- predict taken in the second two states\n\nTransition idea:\n\n- a correct outcome strengthens the current state\n- one opposite outcome weakens confidence\n- it takes two opposite outcomes to move from strong taken to strong not taken, or vice versa",
        hintSteps: [
          "Name the five stages in order before explaining them.",
          "Mention the pipeline registers between stages.",
          "Define data hazard and control hazard by root cause, not just example.",
          "List all four 2-bit predictor states and explain how the state moves on taken vs not-taken outcomes."
        ],
        walkthroughSteps: [
          "For the diagram, include instruction memory, register file, ALU, data memory, and the pipeline registers `IF/ID`, `ID/EX`, `EX/MEM`, and `MEM/WB`.",
          "Explain stage behavior in order: fetch, decode/register read, execute/address/compare, memory, writeback.",
          "Data hazards are about operand readiness; control hazards are about uncertainty in the next instruction address.",
          "The 2-bit predictor uses four saturating states so one wrong branch does not instantly flip a strong prediction."
        ],
        references: ["Midterm Practice A6"],
        tags: ["midterm", "pipeline", "branch-prediction", "control-hazard", "data-hazard"]
      }
    ]
  },
  {
    id: "ca-core-legacy",
    courseId: "computer-architecture",
    title: "Computer Architecture Test Review I (Free Response)",
    description:
      "Midterm-style free-response prompts across core RISC-V and pipeline topics, with full reasoning workflows.",
    difficulty: "Advanced",
    estMinutes: 36,
    tags: ["test-review", "free-response", "midterm-aligned", "pipeline", "machine-code"],
    timerDefaultMinutes: 32,
    questions: [
      {
        id: "ca-core-legacy-q1",
        type: "free",
        prompt:
          "Convert to RISC-V assembly: `if (i == j) a = b + c; else a = b - c;` with `a,b,c,i,j` in `a0,a1,a2,s6,s7`.",
        explanation:
          "Use `beq s6,s7,equal`, fall-through else path, and unconditional jump to exit after else.",
        sampleAnswer:
          "beq s6,s7,equal\nsub a0,a1,a2\nbeq zero,zero,exit\nequal:\nadd a0,a1,a2\nexit:",
        hintSteps: [
          "Compare i and j registers directly.",
          "Place else path in fall-through.",
          "Jump over if-body after else executes.",
          "Ensure a0 gets final result in both branches."
        ],
        walkthroughSteps: [
          "Condition `i==j` means compare `s6` and `s7`.",
          "Branch to label `equal` when true.",
          "Else computes subtraction in a0.",
          "If branch computes addition in a0, then both paths merge at exit."
        ],
        references: ["Midterm Practice A1(a)", "Assignment 3 Problem 1"],
        tags: ["assembly", "branching", "if-else", "midterm"]
      },
      {
        id: "ca-core-legacy-q2",
        type: "free",
        prompt:
          "Convert to RISC-V assembly: `for (i=0; i<=100; i++) { A[2*i] = a + A[i]; }` with `i->a0`, `a->s0`, base `A=0xEA38_257C->s2`.",
        explanation:
          "Initialize base with `lui/ori`, use `bge` with bound 101, scale offsets by 4*i and 8*i via shifts.",
        sampleAnswer:
          "lui s2,0xEA382\nori s2,s2,0x57C\naddi a0,zero,0\naddi t0,zero,101\nloop:\nbge a0,t0,exit\nslli t1,a0,2\nadd t2,s2,t1\nlw t3,0(t2)\nadd t4,s0,t3\nslli t5,a0,3\nadd t6,s2,t5\nsw t4,0(t6)\naddi a0,a0,1\nbeq zero,zero,loop\nexit:",
        hintSteps: [
          "Convert loop guard `i<=100` into branch-exit form.",
          "Compute `A[i]` offset as `4*i`.",
          "Compute `A[2*i]` offset as `8*i`.",
          "Do load, compute, store, increment, loop."
        ],
        walkthroughSteps: [
          "Load base address into s2 using upper/lower immediate split.",
          "Initialize i and loop limit (101 for `i<=100`).",
          "Address A[i] using `slli i,2` then base add and load.",
          "Address A[2*i] using `slli i,3` then base add and store."
        ],
        references: ["Midterm Practice A1(b)", "Assignment 3 Problem 2"],
        tags: ["assembly", "loops", "arrays", "addressing", "midterm"]
      },
      {
        id: "ca-core-legacy-q3",
        type: "free",
        prompt:
          "Convert C functions to RISC-V using standard procedure call + stack:\n`int sumofsq(int a,int b){ return square(a)+square(b); }`\n`int square(int a){ return a*a; }`",
        explanation:
          "sumofsq is non-leaf and must save `ra` and needed s-registers; square is leaf and returns product in a0.",
        sampleAnswer:
          "sumofsq saves ra/s regs, calls square(a), saves result, calls square(b), adds results in a0, restores frame, returns. square multiplies a0 by itself and returns.",
        hintSteps: [
          "Identify leaf vs non-leaf function roles.",
          "Preserve values needed across calls in saved registers.",
          "Use a0/a1 as call args and a0 as return.",
          "Restore stack frame and ra before return."
        ],
        walkthroughSteps: [
          "sumofsq allocates stack and saves ra + any callee-saved registers used.",
          "First call square(a), preserve result.",
          "Second call square(b), then add two results into a0.",
          "Restore saved registers, deallocate stack, and `jalr` return."
        ],
        references: ["Midterm Practice A2"],
        tags: ["procedures", "stack", "calling-convention", "midterm"]
      },
      {
        id: "ca-core-legacy-q4",
        type: "free",
        prompt: "Translate `addi t0, zero, -101` into 32-bit machine code (hex). Show field mapping.",
        explanation: "I-type encoding yields `0xF9B00293`.",
        sampleAnswer:
          "imm=-101 -> 12-bit two's complement F9B; rs1=00000; funct3=000; rd=t0=00101; opcode=0010011 -> 0xF9B00293.",
        hintSteps: [
          "Use I-type field order: imm rs1 funct3 rd opcode.",
          "Compute 12-bit two's complement for -101.",
          "Insert register and opcode bits.",
          "Convert assembled binary to hex."
        ],
        walkthroughSteps: [
          "Opcode for addi is `0010011`; rd t0 is x5.",
          "Immediate -101 in 12-bit two's complement is `0xF9B`.",
          "Assemble fields into 32 bits.",
          "Hex result is `0xF9B00293`."
        ],
        references: ["Midterm Practice A3"],
        tags: ["machine-code", "i-type", "encoding", "midterm"]
      },
      {
        id: "ca-core-legacy-q5",
        type: "free",
        prompt: "Decode machine code `0x4168_0FB3` into RISC-V assembly. Show opcode/funct decomposition.",
        explanation: "R-type with funct7 `0100000` + funct3 `000` decodes to `sub t6, a6, s6`.",
        sampleAnswer:
          "opcode 0110011 -> R-type; rd=x31(t6), rs1=x16(a6), rs2=x22(s6), funct7=0100000 -> sub t6,a6,s6.",
        hintSteps: [
          "Extract opcode bits [6:0] first.",
          "For R-type, parse rd/funct3/rs1/rs2/funct7.",
          "Map register numbers to ABI names.",
          "Use funct7+funct3 to pick operation."
        ],
        walkthroughSteps: [
          "Opcode 0110011 indicates R-type arithmetic instruction.",
          "Fields decode to rd x31, rs1 x16, rs2 x22, funct3 000, funct7 0100000.",
          "funct7 0100000 with funct3 000 means SUB.",
          "Final instruction: `sub t6, a6, s6`."
        ],
        references: ["Midterm Practice A4", "Assignment 5 Problem 3"],
        tags: ["machine-code", "decode", "r-type", "midterm"]
      },
      {
        id: "ca-core-legacy-q6",
        type: "free",
        prompt:
          "For instruction sequence `lw sp,20(ra); and tp,sp,t0; or s0,sp,t1; add s1,tp,t0; beq s0,s1,label`, identify all RAW dependencies and hazards.",
        explanation:
          "Key dependencies include lw->and on sp, lw->or on sp, and->add on tp, and or/add feeding beq.",
        sampleAnswer:
          "RAW: (lw->and on sp), (lw->or on sp), (and->add on tp), (or->beq on s0), (add->beq on s1).",
        hintSteps: [
          "Write destination register of each instruction.",
          "For each later instruction, list source registers read.",
          "Mark any read whose source was previously written.",
          "Classify especially immediate next-instruction load-use hazard."
        ],
        walkthroughSteps: [
          "lw writes sp; and reads sp -> RAW.",
          "lw writes sp; or reads sp -> RAW.",
          "and writes tp; add reads tp -> RAW.",
          "or writes s0 and add writes s1; beq reads both -> two RAW edges."
        ],
        references: ["Midterm Practice A5(a)"],
        tags: ["pipeline", "hazards", "raw", "midterm"]
      },
      {
        id: "ca-core-legacy-q7",
        type: "free",
        prompt:
          "For the same sequence in A5(a), determine minimum clock cycles for a 5-stage pipeline (i) without forwarding and (ii) with forwarding.",
        explanation:
          "Without forwarding, each dependent consumer waits for WB; with forwarding, only unavoidable load-use/control penalties remain.",
        sampleAnswer:
          "Compute via pipeline timing table. No-forwarding inserts stalls for every RAW read-before-WB; forwarding removes most ALU stalls but keeps load-use penalty.",
        hintSteps: [
          "Draw IF/ID/EX/MEM/WB table across cycles.",
          "Place instructions assuming no hazards first.",
          "Insert stalls when operand unavailable at ID/EX as required.",
          "Repeat with forwarding paths enabled."
        ],
        walkthroughSteps: [
          "Build baseline 5-instruction timeline.",
          "In no-forwarding case, delay each dependent use until producer WB.",
          "In forwarding case, route EX/MEM outputs to dependent EX inputs.",
          "Count cycles in each case and compare."
        ],
        references: ["Midterm Practice A5(b)"],
        tags: ["pipeline", "timing", "forwarding", "stalls", "midterm"]
      },
      {
        id: "ca-core-legacy-q8",
        type: "free",
        prompt:
          "Explain control hazard vs data hazard, then explain how a 2-bit dynamic branch predictor works (state-machine behavior).",
        explanation:
          "Control hazards come from uncertain next PC; data hazards come from operand availability. 2-bit predictor uses hysteresis via four saturating states.",
        sampleAnswer:
          "Data hazard=operand timing dependency; control hazard=branch-path uncertainty. 2-bit FSM: SNT<->WNT<->WT<->ST with updates on branch outcomes.",
        hintSteps: [
          "Define each hazard by root cause.",
          "Give one concrete instruction-level example for each.",
          "List four predictor states.",
          "Explain transition rule on taken/not-taken outcomes."
        ],
        walkthroughSteps: [
          "Data hazard: instruction needs value not yet produced.",
          "Control hazard: fetch path unknown until branch resolved.",
          "2-bit predictor states: Strong/Weak Taken and Strong/Weak Not Taken.",
          "One wrong outcome weakens confidence; two opposite outcomes flip strong prediction."
        ],
        references: ["Midterm Practice A6(b)", "Topic 2 Pipeline Notes"],
        tags: ["control-hazard", "data-hazard", "branch-prediction", "midterm"]
      }
    ]
  },
  {
    id: "ca-reinforce-legacy",
    courseId: "computer-architecture",
    title: "Computer Architecture Test Review II (Free Response)",
    description:
      "Exact free-response prompts from Assignments 1-5 with worked-method focus and tricky-point guidance.",
    difficulty: "Advanced",
    estMinutes: 34,
    tags: ["test-review", "free-response", "assignment-aligned", "risc-v"],
    timerDefaultMinutes: 30,
    questions: [
      {
        id: "ca-reinforce-legacy-q1",
        type: "free",
        prompt:
          "What is ISA? What are the two ISA categories in Computer Architecture? Give three advantages and three disadvantages for each.",
        explanation:
          "ISA is software-hardware interface; categories are RISC and CISC with classic tradeoffs in simplicity vs code density/complexity.",
        sampleAnswer:
          "ISA defines instruction formats/registers/modes/operations. Categories: RISC and CISC. RISC favors simpler hardware/power efficiency; CISC favors complex instructions/code density.",
        hintSteps: [
          "Define ISA first before listing categories.",
          "Separate RISC and CISC characteristics clearly.",
          "Provide balanced pros and cons for each.",
          "Tie pros/cons to implementation complexity and efficiency."
        ],
        walkthroughSteps: [
          "ISA defines programmer-visible contract between software and processor.",
          "RISC: simpler instructions and hardware, often efficient pipelining.",
          "CISC: richer instructions and better code density but higher hardware complexity.",
          "State three practical advantages/disadvantages for each side."
        ],
        references: ["Assignment 1 Problem 1(a)"],
        tags: ["isa", "risc", "cisc", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q2",
        type: "free",
        prompt:
          "What are the four types of parallelism in Computer Architecture? Define each briefly.",
        explanation:
          "The four are DLP, TLP, ILP, and RLP.",
        sampleAnswer:
          "Data-level, task-level, instruction-level, and request-level parallelism, each exploiting concurrency at different abstraction levels.",
        hintSteps: [
          "Name all four first.",
          "Associate each with its execution granularity.",
          "Give one quick example workload for each.",
          "Contrast ILP vs TLP explicitly."
        ],
        walkthroughSteps: [
          "DLP applies same operation across many data elements.",
          "TLP executes independent tasks/threads concurrently.",
          "ILP overlaps instructions from one stream via pipeline/superscalar ideas.",
          "RLP processes independent service requests in parallel."
        ],
        references: ["Assignment 1 Problem 1(b)", "Topic 1 Fundamentals"],
        tags: ["parallelism", "taxonomy", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q3",
        type: "free",
        prompt:
          "List Flynn's four processor classes and describe each type.",
        explanation:
          "Classes are SISD, SIMD, MISD, and MIMD, distinguished by instruction/data stream multiplicity.",
        sampleAnswer:
          "SISD single/single, SIMD single/multiple, MISD multiple/single, MIMD multiple/multiple with independent processors.",
        hintSteps: [
          "Use instruction-stream count and data-stream count axes.",
          "State one sentence behavioral definition each.",
          "Mention typical practical examples where relevant.",
          "Call out rarity of MISD in commercial systems."
        ],
        walkthroughSteps: [
          "SISD: one instruction stream over one data stream.",
          "SIMD: one instruction stream over many data elements.",
          "MISD: many instruction streams over one data stream (rare).",
          "MIMD: many instruction and data streams, independent processors."
        ],
        references: ["Assignment 1 Problem 1(c)"],
        tags: ["flynn", "processor-classes", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q4",
        type: "free",
        prompt:
          "Compute execution time for single-cycle, multicycle, and pipeline processors using Assignment 1 Problem 2 parameters (IC=1000, operation mix and CPIs given). Which performs best?",
        explanation:
          "Computed results are single-cycle 2.0 us, multicycle 2.2 us, and pipeline 0.6 us; pipeline is best.",
        sampleAnswer:
          "Single-cycle: 2.0 us. Multicycle: 2.2 us. Pipeline: 0.6 us. Best: pipeline.",
        hintSteps: [
          "Compute each clock period from frequency.",
          "Compute total cycles per architecture.",
          "Apply `CPU time = cycles * clock period`.",
          "Compare final times directly."
        ],
        walkthroughSteps: [
          "Single-cycle: Ts=2ns, cycles=1000 -> 2000ns.",
          "Multicycle: Tm=0.5ns, cycles=4400 -> 2200ns.",
          "Pipeline: Tp=0.6ns, cycles=1000 -> 600ns.",
          "Minimum time is pipeline, therefore best performance."
        ],
        references: ["Assignment 1 Problem 2"],
        tags: ["performance", "cpu-time", "pipeline", "assignment1"]
      },
      {
        id: "ca-reinforce-legacy-q5",
        type: "free",
        prompt:
          "Write RISC-V assembly to initialize `a0` with `0xABCD_1234` using only two instructions.",
        explanation:
          "Split into upper/lower immediate parts: `lui a0,0xABCD1` then `ori a0,a0,0x234`.",
        sampleAnswer: "lui a0, 0xABCD1\nori a0, a0, 0x234",
        hintSteps: [
          "Use U-type + I-type pair.",
          "Split constant into upper 20 and lower 12 bits.",
          "Load upper then OR lower.",
          "Verify reconstructed 32-bit value."
        ],
        walkthroughSteps: [
          "Upper 20 bits are `0xABCD1`.",
          "Lower 12 bits are `0x234`.",
          "`lui` places upper bits at [31:12].",
          "`ori` fills low bits, yielding `0xABCD1234`."
        ],
        references: ["Assignment 2 Problem 1(a)"],
        tags: ["assembly", "immediate", "lui", "assignment2"]
      },
      {
        id: "ca-reinforce-legacy-q6",
        type: "free",
        prompt:
          "Convert C to RISC-V: `a = (b + c) - (d - 15);` with `a,b,c,d` mapped to `s0,s1,s2,s3`.",
        explanation:
          "Compute two subexpressions in temporaries, then subtract.",
        sampleAnswer:
          "```asm\n# a: s0, b: s1, c: s2, d: s3\n# Temporary registers used: t0, t1\n\nadd  t0, s1, s2      # t0 = b + c\naddi t1, s3, -15     # t1 = d - 15\nsub  s0, t0, t1      # a = t0 - t1\n```\n\nNo comments:\n\n```asm\nadd  t0, s1, s2\naddi t1, s3, -15\nsub  s0, t0, t1\n```",
        hintSteps: [
          "Preserve expression structure with temporaries.",
          "Use addi for subtracting constant 15.",
          "Perform outer subtraction last.",
          "Store final result in s0.",
          "Final answer should be the 3-instruction sequence using `t0` and `t1`."
        ],
        walkthroughSteps: [
          "Compute `(b+c)` into t0.",
          "Compute `(d-15)` into t1 using addi -15.",
          "Subtract second subexpression from first.",
          "Write final result into destination register s0.",
          "Final output:\n```asm\n# a: s0, b: s1, c: s2, d: s3\n# Temporary registers used: t0, t1\n\nadd  t0, s1, s2      # t0 = b + c\naddi t1, s3, -15     # t1 = d - 15\nsub  s0, t0, t1      # a = t0 - t1\n```\nNo comments:\n```asm\nadd  t0, s1, s2\naddi t1, s3, -15\nsub  s0, t0, t1\n```"
        ],
        references: ["Assignment 2 Problem 2"],
        tags: ["assembly", "arithmetic", "c-to-riscv", "assignment2"]
      },
      {
        id: "ca-reinforce-legacy-q7",
        type: "free",
        prompt:
          "Convert C to RISC-V: `Vec[8] = Vec[4] + a - 120;` with `a->s0` and base of `Vec` in `a0`.",
        explanation:
          "Use `lw` from offset 16, adjust and add, then `sw` to offset 32.",
        sampleAnswer:
          "lw t0,16(a0)\naddi t0,t0,-120\nadd t0,t0,s0\nsw t0,32(a0)",
        hintSteps: [
          "Convert indices to byte offsets (int = 4 bytes).",
          "Load Vec[4] first.",
          "Apply arithmetic in register.",
          "Store final value into Vec[8]."
        ],
        walkthroughSteps: [
          "Offset for Vec[4] is 16 bytes; offset for Vec[8] is 32 bytes.",
          "Load Vec[4] into temp register.",
          "Compute `temp + a - 120`.",
          "Store computed value at Vec[8] address."
        ],
        references: ["Assignment 2 Problem 3"],
        tags: ["assembly", "arrays", "load-store", "assignment2"]
      },
      {
        id: "ca-reinforce-legacy-q8",
        type: "free",
        prompt:
          "Translate `lw s1, 120(a0)` to 32-bit machine code in hex. Show field decomposition.",
        explanation:
          "I-type encoding with imm=120, rs1=a0, funct3 for lw, rd=s1, opcode load yields `0x07852483`.",
        sampleAnswer:
          "imm=000001111000, rs1=01010, funct3=010, rd=01001, opcode=0000011 -> 0x07852483.",
        hintSteps: [
          "Identify I-type layout for load.",
          "Convert decimal immediate 120 to 12-bit binary.",
          "Map register numbers for s1 and a0.",
          "Assemble and convert to hex."
        ],
        walkthroughSteps: [
          "lw uses opcode 0000011 and funct3 010.",
          "rd=s1=x9, rs1=a0=x10, imm=120 -> 0x078.",
          "Assemble `imm|rs1|funct3|rd|opcode`.",
          "Hex encoding is `0x07852483`."
        ],
        references: ["Assignment 5 Problem 1"],
        tags: ["machine-code", "encoding", "lw", "assignment5"]
      }
    ]
  }
];

export const testReviewQuizSetReplacements: QuizSet[] = testReviewQuizSetReplacementsRaw.map((set) => ({
  ...set,
  mode: set.mode ?? (set.questions.some((question) => question.type === "free") ? "homework" : "quiz")
}));
